// StreamingService.ts - Matching WellnessGeni's working implementation exactly
// Uses direct fetch() to edge function, NOT supabase.functions.invoke()

const BACKEND_FN = 'https://vrpgowcocbztclxfzssu.supabase.co/functions/v1/did-streaming';

type ConnectionCallback = (connected: boolean) => void;
type SpeakingCallback = (speaking: boolean) => void;

interface SpeakParams {
  avatarUrl: string;
  text: string;
  voiceId?: string;
}

class PersistentStreamManager {
  private static instance: PersistentStreamManager | null = null;
  
  private pc: RTCPeerConnection | null = null;
  private streamId: string | null = null;
  private sessionId: string | null = null;
  private avatarUrl: string | null = null;
  
  private isInitializing = false;
  private isConnected = false;
  private isSpeaking = false;
  
  private connectionCallbacks: ConnectionCallback[] = [];
  private speakingCallbacks: SpeakingCallback[] = [];
  
  private constructor() {}
  
  static getInstance(): PersistentStreamManager {
    if (!PersistentStreamManager.instance) {
      PersistentStreamManager.instance = new PersistentStreamManager();
    }
    return PersistentStreamManager.instance;
  }
  
  // Direct fetch to edge function - matching WellnessGeni exactly
  private async callBackend(action: string, payload: Record<string, unknown> = {}): Promise<any> {
    console.log(`[StreamService] 📤 callBackend: ${action}`, payload);
    
    try {
      const resp = await fetch(BACKEND_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload })
      });
      
      console.log(`[StreamService] 📥 Response status: ${resp.status} ${resp.statusText}`);
      
      if (!resp.ok) {
        const errorText = await resp.text();
        console.error(`[StreamService] ❌ HTTP error: ${resp.status}`, errorText);
        return { success: false, error: { message: `HTTP ${resp.status}: ${errorText}` } };
      }
      
      const result = await resp.json();
      console.log(`[StreamService] 📥 Response for ${action}:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error(`[StreamService] ❌ Fetch error:`, error);
      return { success: false, error: { message: String(error) } };
    }
  }
  
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);
    callback(this.isConnected);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }
  
  onSpeakingChange(callback: SpeakingCallback): () => void {
    this.speakingCallbacks.push(callback);
    callback(this.isSpeaking);
    return () => {
      this.speakingCallbacks = this.speakingCallbacks.filter(cb => cb !== callback);
    };
  }
  
  private notifyConnection(connected: boolean) {
    this.isConnected = connected;
    this.connectionCallbacks.forEach(cb => cb(connected));
  }
  
  private notifySpeaking(speaking: boolean) {
    this.isSpeaking = speaking;
    this.speakingCallbacks.forEach(cb => cb(speaking));
  }
  
  async initOnce(avatarUrl: string): Promise<void> {
    console.log('[StreamService] 🎬 initOnce called with avatarUrl:', avatarUrl);
    
    if (this.isConnected && this.avatarUrl === avatarUrl) {
      console.log('[StreamService] ✅ Already connected with same avatar');
      return;
    }
    
    if (this.isInitializing) {
      console.log('[StreamService] ⏳ Already initializing, waiting...');
      while (this.isInitializing) {
        await new Promise(r => setTimeout(r, 100));
      }
      return;
    }
    
    this.isInitializing = true;
    this.avatarUrl = avatarUrl;
    
    try {
      // Disconnect existing connection if any
      if (this.pc) {
        this.disconnect();
      }
      
      await this.createStream(avatarUrl);
      console.log('[StreamService] ✅ Stream created successfully');
    } catch (error) {
      console.error('[StreamService] ❌ initOnce failed:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }
  
  private async createStream(avatarUrl: string): Promise<void> {
    console.log('[StreamService] 🎬 Creating D-ID stream...');
    
    // Step 1: Create stream - WellnessGeni uses avatarUrl at TOP LEVEL
    const createResp = await this.callBackend('createStream', { avatarUrl });
    
    // Handle response - the edge function returns { ok, status, body } structure
    // Check for ok:true OR success:true (backwards compatibility)
    const isSuccess = createResp.ok === true || createResp.success === true;
    const responseBody = createResp.body || createResp; // Data might be in body or at top level
    
    if (!isSuccess || !responseBody.id) {
      console.error('[StreamService] ❌ createStream failed:', createResp);
      throw new Error(createResp.error?.message || responseBody.error?.message || 'Failed to create stream');
    }
    
    // Extract data from the correct location
    this.streamId = responseBody.id;
    this.sessionId = responseBody.session_id;
    const offer = responseBody.offer;
    const iceServers = responseBody.ice_servers || [];
    
    console.log('[StreamService] ✅ Stream created:', {
      streamId: this.streamId,
      sessionId: this.sessionId?.substring(0, 30) + '...',
      hasOffer: !!offer,
      iceServersCount: iceServers.length
    });
    
    // Step 2: Setup RTCPeerConnection
    this.pc = new RTCPeerConnection({ iceServers });
    
    // Handle ICE candidates
    this.pc.onicecandidate = async (event) => {
      const candidate = event.candidate;
      console.log('[StreamService] 🧊 ICE candidate:', candidate?.type || 'null (gathering complete)');
      
      // WellnessGeni sends candidate object or null
      await this.callBackend('sendIceCandidate', {
        stream_id: this.streamId,
        session_id: this.sessionId,
        candidate: candidate ? {
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex
        } : null
      });
    };
    
    this.pc.oniceconnectionstatechange = () => {
      console.log('[StreamService] 🧊 ICE state:', this.pc?.iceConnectionState);
      if (this.pc?.iceConnectionState === 'connected') {
        console.log('[StreamService] ✅ ICE CONNECTED - Persistent stream ready');
        this.notifyConnection(true);
      } else if (this.pc?.iceConnectionState === 'disconnected' || this.pc?.iceConnectionState === 'failed') {
        this.notifyConnection(false);
      }
    };
    
    this.pc.onconnectionstatechange = () => {
      console.log('[StreamService] 🔌 Connection state:', this.pc?.connectionState);
    };
    
    // Handle incoming tracks
    this.pc.ontrack = (event) => {
      console.log('[StreamService] 🎬 ontrack:', event.track.kind);
      
      if (event.track.kind === 'video') {
        // WellnessGeni uses __ISABELA_VIDEO_REF__ - we use __AVATAR_VIDEO_REF__
        const videoEl = (window as any).__AVATAR_VIDEO_REF__ as HTMLVideoElement | undefined;
        
        if (videoEl && event.streams[0]) {
          console.log('[StreamService] 📺 Attaching stream to video element');
          videoEl.srcObject = event.streams[0];
          
          videoEl.play().then(() => {
            console.log('[StreamService] 📺 Video play() succeeded');
          }).catch(err => {
            console.warn('[StreamService] ⚠️ Video play() failed:', err);
          });
        } else {
          console.warn('[StreamService] ⚠️ No video element found at __AVATAR_VIDEO_REF__');
        }
      }
    };
    
    // Handle data channel messages
    this.pc.ondatachannel = (event) => {
      const dc = event.channel;
      console.log('[StreamService] 📢 DataChannel received:', dc.label);
      
      dc.onopen = () => console.log('[StreamService] 📢 DataChannel opened');
      dc.onclose = () => console.log('[StreamService] 📢 DataChannel closed');
      dc.onerror = (e) => console.error('[StreamService] 📢 DataChannel error:', e);
      
      dc.onmessage = (msg) => {
        console.log('[StreamService] 📢 DataChannel raw:', msg.data);
        
        // Parse stream events - WellnessGeni pattern
        if (typeof msg.data === 'string') {
          if (msg.data.includes('stream/started')) {
            console.log('[StreamService] 🎬 stream/started detected');
            this.notifySpeaking(true);
          } else if (msg.data.includes('stream/done')) {
            console.log('[StreamService] 🎬 stream/done detected');
            this.notifySpeaking(false);
          }
        }
      };
    };
    
    // Step 3: Set remote description (offer from D-ID)
    console.log('[StreamService] 📥 Setting remote offer...');
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    console.log('[StreamService] 📥 Remote offer set');
    
    // Step 4: Create and set local answer
    console.log('[StreamService] 📤 Creating local answer...');
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    console.log('[StreamService] 📤 Local answer created');
    
    // Step 5: Send answer to D-ID - WellnessGeni sends the full localDescription
    await this.callBackend('start', {
      stream_id: this.streamId,
      session_id: this.sessionId,
      answer: this.pc.localDescription
    });
    console.log('[StreamService] ✅ SDP answer sent');
  }
  
  async speak(text: string, voiceId?: string): Promise<void> {
    console.log('[StreamService] 🗣️ speak:', { text: text.substring(0, 50) + '...', voiceId });
    
    if (!this.streamId || !this.sessionId) {
      console.error('[StreamService] ❌ Cannot speak - no active stream');
      
      // Try to reinitialize if we have an avatar URL
      if (this.avatarUrl) {
        console.log('[StreamService] 🔄 Attempting to reinitialize stream...');
        await this.initOnce(this.avatarUrl);
      } else {
        throw new Error('No active stream');
      }
    }
    
    // Send animation request - WellnessGeni uses 'message' not 'text'
    const resp = await this.callBackend('startAnimation', {
      stream_id: this.streamId,
      session_id: this.sessionId,
      message: text,
      voiceId: voiceId || 'EXAVITQu4vr4xnSDxMaL' // Sarah voice
    });
    
    // Handle response - check for ok:true OR success:true
    const isSuccess = resp.ok === true || resp.success === true;
    if (!isSuccess) {
      console.error('[StreamService] ❌ startAnimation failed:', resp);
      const errorMsg = resp.error?.message || resp.body?.error?.message || 'Failed to start animation';
      throw new Error(errorMsg);
    }
    
    console.log('[StreamService] ✅ Animation triggered - RTP frames flowing');
  }
  
  disconnect(): void {
    console.log('[StreamService] 🔌 Disconnecting...');
    
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    
    this.streamId = null;
    this.sessionId = null;
    this.notifyConnection(false);
    this.notifySpeaking(false);
    
    console.log('[StreamService] ✅ Disconnected');
  }
  
  getState() {
    return {
      isConnected: this.isConnected,
      isSpeaking: this.isSpeaking,
      streamId: this.streamId,
      sessionId: this.sessionId
    };
  }
}

// Export singleton interface - matching WellnessGeni
export const StreamingService = {
  getInstance: () => PersistentStreamManager.getInstance(),
  
  init: async (avatarUrl: string) => {
    return PersistentStreamManager.getInstance().initOnce(avatarUrl);
  },
  
  speak: async (params: SpeakParams) => {
    const manager = PersistentStreamManager.getInstance();
    
    // Initialize if needed
    if (!manager.getState().isConnected) {
      await manager.initOnce(params.avatarUrl);
    }
    
    return manager.speak(params.text, params.voiceId);
  },
  
  disconnect: () => {
    PersistentStreamManager.getInstance().disconnect();
  },
  
  onConnectionChange: (callback: ConnectionCallback) => {
    return PersistentStreamManager.getInstance().onConnectionChange(callback);
  },
  
  onSpeakingChange: (callback: SpeakingCallback) => {
    return PersistentStreamManager.getInstance().onSpeakingChange(callback);
  },
  
  getState: () => {
    return PersistentStreamManager.getInstance().getState();
  }
};

export default StreamingService;
