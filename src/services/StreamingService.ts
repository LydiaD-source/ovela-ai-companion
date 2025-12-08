/**
 * StreamingService.ts - D-ID Avatar Streaming Service
 * Clean, optimized implementation for persistent WebRTC streaming
 */

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
  
  private initPromise: Promise<void> | null = null;
  private isConnected = false;
  private isSpeaking = false;
  
  private connectionCallbacks: ConnectionCallback[] = [];
  private speakingCallbacks: SpeakingCallback[] = [];
  
  // Chroma-key elements
  private hiddenVideo: HTMLVideoElement | null = null;
  private chromaCanvas: HTMLCanvasElement | null = null;
  private animationFrameId: number | null = null;
  
  private constructor() {}
  
  static getInstance(): PersistentStreamManager {
    if (!PersistentStreamManager.instance) {
      PersistentStreamManager.instance = new PersistentStreamManager();
    }
    return PersistentStreamManager.instance;
  }
  
  private async callBackend(action: string, payload: Record<string, unknown> = {}): Promise<any> {
    try {
      const resp = await fetch(BACKEND_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload })
      });
      
      if (!resp.ok) {
        const errorText = await resp.text();
        console.error(`[StreamService] ❌ HTTP ${resp.status}:`, errorText);
        throw new Error(`HTTP ${resp.status}: ${errorText}`);
      }
      
      return await resp.json();
    } catch (error) {
      console.error(`[StreamService] ❌ ${action} failed:`, error);
      throw error;
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
    // Already connected with same avatar - reuse existing stream
    if (this.isConnected && this.avatarUrl === avatarUrl && this.streamId) {
      console.log('[StreamService] ✅ Reusing existing stream');
      return;
    }
    
    // Already initializing - wait for that to complete
    if (this.initPromise) {
      console.log('[StreamService] ⏳ Waiting for existing init...');
      return this.initPromise;
    }
    
    this.avatarUrl = avatarUrl;
    
    // Store promise so concurrent calls wait
    this.initPromise = this.doInit(avatarUrl);
    
    try {
      await this.initPromise;
    } finally {
      this.initPromise = null;
    }
  }
  
  private async doInit(avatarUrl: string): Promise<void> {
    console.log('[StreamService] 🎬 Initializing stream...');
    
    // Clean up existing connection
    if (this.pc) {
      this.disconnect();
    }
    
    await this.createStream(avatarUrl);
    console.log('[StreamService] ✅ Stream ready');
  }
  
  private async createStream(avatarUrl: string): Promise<void> {
    // Step 1: Create stream
    const createResp = await this.callBackend('createStream', { avatarUrl });
    
    const responseBody = createResp.body || createResp;
    const streamId = responseBody.id;
    
    if (!streamId) {
      throw new Error(responseBody.error?.message || 'Failed to create stream - no ID returned');
    }
    
    this.streamId = streamId;
    this.sessionId = responseBody.session_id;
    const offer = responseBody.offer;
    const iceServers = responseBody.ice_servers || [];
    
    console.log('[StreamService] ✅ Stream created:', this.streamId);
    
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
    
    // Handle incoming tracks - use canvas chroma-keying to remove black background
    this.pc.ontrack = (event) => {
      console.log('[StreamService] 🎬 ontrack:', event.track.kind);
      
      if (event.track.kind === 'video' && event.streams[0]) {
        // Get container and target canvas from the registered video element's parent
        const targetVideo = (window as any).__AVATAR_VIDEO_REF__ as HTMLVideoElement | undefined;
        
        if (!targetVideo) {
          console.warn('[StreamService] ⚠️ No video element found at __AVATAR_VIDEO_REF__');
          return;
        }
        
        const container = targetVideo.parentElement;
        if (!container) {
          console.warn('[StreamService] ⚠️ Video element has no parent container');
          return;
        }
        
        console.log('[StreamService] 📺 Setting up chroma-key canvas (strict black removal)');
        
        // Hidden video receives D-ID stream
        this.hiddenVideo = document.createElement('video');
        this.hiddenVideo.autoplay = true;
        this.hiddenVideo.playsInline = true;
        this.hiddenVideo.muted = true;
        this.hiddenVideo.srcObject = event.streams[0];
        this.hiddenVideo.style.display = 'none';
        container.appendChild(this.hiddenVideo);
        
        // Canvas for chroma-key processing
        this.chromaCanvas = document.createElement('canvas');
        Object.assign(this.chromaCanvas.style, {
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          maxHeight: '88vh',
          width: 'auto',
          height: 'auto',
          zIndex: '150',
          backgroundColor: 'transparent',
          pointerEvents: 'none',
          opacity: '0',
          transition: 'opacity 0.3s ease-in-out',
        });
        container.appendChild(this.chromaCanvas);
        
        (window as any).__AVATAR_CANVAS_REF__ = this.chromaCanvas;
        
        const ctx = this.chromaCanvas.getContext('2d', { 
          willReadFrequently: true,
          alpha: true,
        });
        
        if (!ctx) {
          console.error('[StreamService] ❌ Could not get canvas context');
          return;
        }
        
        let canvasInitialized = false;
        
        const processFrame = () => {
          this.animationFrameId = requestAnimationFrame(processFrame);
          
          if (!this.hiddenVideo || this.hiddenVideo.paused || this.hiddenVideo.ended || this.hiddenVideo.readyState < 2) {
            return;
          }
          
          const width = this.hiddenVideo.videoWidth;
          const height = this.hiddenVideo.videoHeight;
          
          if (width === 0 || height === 0) return;
          
          if (!canvasInitialized && this.chromaCanvas) {
            this.chromaCanvas.width = width;
            this.chromaCanvas.height = height;
            canvasInitialized = true;
            console.log('[StreamService] ✅ Canvas:', width, 'x', height);
          }
          
          if (this.chromaCanvas && (this.chromaCanvas.width !== width || this.chromaCanvas.height !== height)) {
            this.chromaCanvas.width = width;
            this.chromaCanvas.height = height;
          }
          
          ctx.drawImage(this.hiddenVideo, 0, 0, width, height);
          
          // STRICT chroma-key: only remove pure black background (D-ID sends black bg)
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;
          
          // Very low threshold - only truly black pixels (r,g,b all < 10)
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Only make pure black fully transparent - no gradual alpha
            if (r < 10 && g < 10 && b < 10) {
              data[i + 3] = 0;
            }
            // Everything else stays fully opaque (255)
          }
          
          ctx.putImageData(imageData, 0, 0);
        };
        
        this.hiddenVideo.oncanplay = () => {
          console.log('[StreamService] 📺 Hidden video ready, starting chroma-key');
          this.hiddenVideo?.play().then(() => {
            processFrame();
          }).catch(err => {
            console.warn('[StreamService] ⚠️ Play failed:', err);
          });
        };
        
        this.hiddenVideo.play().catch(() => {});
      } else if (event.track.kind === 'audio') {
        // Audio track - attach to the video element for playback
        const targetVideo = (window as any).__AVATAR_VIDEO_REF__ as HTMLVideoElement | undefined;
        if (targetVideo && event.streams[0]) {
          console.log('[StreamService] 🔊 Attaching audio stream to video element');
          targetVideo.srcObject = event.streams[0];
          targetVideo.muted = false;
          targetVideo.play().catch(() => {});
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
    // Auto-reinitialize if stream is not active
    if (!this.streamId || !this.sessionId) {
      if (this.avatarUrl) {
        console.log('[StreamService] 🔄 Reinitializing stream for speak...');
        await this.initOnce(this.avatarUrl);
      } else {
        throw new Error('No active stream and no avatar URL to reinitialize');
      }
    }
    
    // Send animation request
    const resp = await this.callBackend('startAnimation', {
      stream_id: this.streamId,
      session_id: this.sessionId,
      message: text,
      voiceId: voiceId || 'EXAVITQu4vr4xnSDxMaL'
    });
    
    const isSuccess = resp.ok === true || resp.success === true;
    if (!isSuccess) {
      throw new Error(resp.error?.message || resp.body?.error?.message || 'Animation failed');
    }
    
    // Notify speaking state immediately
    this.notifySpeaking(true);
    console.log('[StreamService] ✅ Animation triggered');
  }
  
  disconnect(): void {
    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Clean up hidden video
    if (this.hiddenVideo) {
      this.hiddenVideo.pause();
      this.hiddenVideo.srcObject = null;
      this.hiddenVideo.remove();
      this.hiddenVideo = null;
    }
    
    // Clean up canvas
    if (this.chromaCanvas) {
      this.chromaCanvas.remove();
      this.chromaCanvas = null;
    }
    
    (window as any).__AVATAR_CANVAS_REF__ = null;
    
    // Close WebRTC connection
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
      hasStream: !!this.streamId
    };
  }
}

// Exported singleton API
export const StreamingService = {
  init: (avatarUrl: string) => PersistentStreamManager.getInstance().initOnce(avatarUrl),
  
  speak: async (params: SpeakParams) => {
    const manager = PersistentStreamManager.getInstance();
    // Ensure connected before speaking
    if (!manager.getState().isConnected) {
      await manager.initOnce(params.avatarUrl);
    }
    return manager.speak(params.text, params.voiceId);
  },
  
  disconnect: () => PersistentStreamManager.getInstance().disconnect(),
  
  onConnectionChange: (cb: ConnectionCallback) => 
    PersistentStreamManager.getInstance().onConnectionChange(cb),
  
  onSpeakingChange: (cb: SpeakingCallback) => 
    PersistentStreamManager.getInstance().onSpeakingChange(cb),
  
  getState: () => PersistentStreamManager.getInstance().getState()
};

export default StreamingService;
