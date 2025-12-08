import { supabase } from '@/integrations/supabase/client';

interface SpeakParams {
  avatarUrl: string;
  text: string;
  voiceId?: string;
}

interface StreamState {
  streamId: string | null;
  sessionId: string | null;
  peerConnection: RTCPeerConnection | null;
  dataChannel: RTCDataChannel | null;
  isConnected: boolean;
  isConnecting: boolean;
  avatarUrl: string | null;
}

type ConnectionCallback = (connected: boolean) => void;
type SpeakingCallback = (speaking: boolean) => void;

class PersistentStreamManager {
  private static instance: PersistentStreamManager | null = null;
  
  private state: StreamState = {
    streamId: null,
    sessionId: null,
    peerConnection: null,
    dataChannel: null,
    isConnected: false,
    isConnecting: false,
    avatarUrl: null,
  };

  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private speakingCallbacks: Set<SpeakingCallback> = new Set();
  private initPromise: Promise<void> | null = null;

  private constructor() {
    // Expose video ref globally for AvatarDisplay
    if (typeof window !== 'undefined') {
      (window as any).__AVATAR_VIDEO_REF__ = null;
    }
  }

  static getInstance(): PersistentStreamManager {
    if (!PersistentStreamManager.instance) {
      PersistentStreamManager.instance = new PersistentStreamManager();
    }
    return PersistentStreamManager.instance;
  }

  // Subscribe to connection state changes
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback);
    // Immediately call with current state
    callback(this.state.isConnected);
    return () => this.connectionCallbacks.delete(callback);
  }

  // Subscribe to speaking state changes
  onSpeakingChange(callback: SpeakingCallback): () => void {
    this.speakingCallbacks.add(callback);
    return () => this.speakingCallbacks.delete(callback);
  }

  private notifyConnectionChange(connected: boolean) {
    this.connectionCallbacks.forEach(cb => cb(connected));
  }

  private notifySpeakingChange(speaking: boolean) {
    this.speakingCallbacks.forEach(cb => cb(speaking));
  }

  // Initialize once with guard to prevent race conditions
  async initOnce(avatarUrl: string): Promise<void> {
    // Already connected with same avatar
    if (this.state.isConnected && this.state.avatarUrl === avatarUrl) {
      console.log('🔄 Stream already connected, reusing');
      return;
    }

    // Currently connecting - wait for it
    if (this.initPromise) {
      console.log('⏳ Init already in progress, waiting...');
      return this.initPromise;
    }

    // Different avatar - need to reconnect
    if (this.state.isConnected && this.state.avatarUrl !== avatarUrl) {
      console.log('🔄 Different avatar, reconnecting...');
      await this.disconnect();
    }

    this.initPromise = this.createStream(avatarUrl);
    
    try {
      await this.initPromise;
    } finally {
      this.initPromise = null;
    }
  }

  private async createStream(avatarUrl: string): Promise<void> {
    this.state.isConnecting = true;
    this.state.avatarUrl = avatarUrl;

    try {
      console.log('🎬 Creating D-ID stream...');

      // Step 1: Create stream
      const { data: createData, error: createError } = await supabase.functions.invoke('did-streaming', {
        body: {
          action: 'createStream',
          data: { source_url: avatarUrl },
        },
      });

      if (createError || !createData?.success) {
        throw new Error(createError?.message || createData?.error?.message || 'Failed to create stream');
      }

      const { id: streamId, session_id: sessionId, offer, ice_servers } = createData;
      
      this.state.streamId = streamId;
      this.state.sessionId = sessionId;

      console.log('✅ Stream created:', { streamId, sessionId: sessionId?.substring(0, 20) + '...' });

      // Step 2: Create RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: ice_servers || [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      this.state.peerConnection = pc;

      // Handle ICE candidates - forward ALL including null
      pc.onicecandidate = async (event) => {
        console.log('🧊 ICE candidate:', event.candidate ? 'has candidate' : 'gathering complete');
        
        await supabase.functions.invoke('did-streaming', {
          body: {
            action: 'sendIceCandidate',
            data: {
              stream_id: this.state.streamId,
              session_id: this.state.sessionId,
              candidate: event.candidate?.candidate || null,
              sdpMid: event.candidate?.sdpMid || null,
              sdpMLineIndex: event.candidate?.sdpMLineIndex ?? null,
            },
          },
        });
      };

      // Handle incoming video track
      pc.ontrack = (event) => {
        console.log('📹 Received track:', event.track.kind);
        
        if (event.track.kind === 'video' && event.streams[0]) {
          const videoEl = (window as any).__AVATAR_VIDEO_REF__ as HTMLVideoElement | null;
          
          if (videoEl) {
            videoEl.srcObject = event.streams[0];
            console.log('✅ Video stream attached to element');
          } else {
            console.warn('⚠️ No video element ref found');
          }
        }
      };

      // Handle connection state
      pc.onconnectionstatechange = () => {
        console.log('🔌 Connection state:', pc.connectionState);
        
        if (pc.connectionState === 'connected') {
          this.state.isConnected = true;
          this.state.isConnecting = false;
          this.notifyConnectionChange(true);
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          this.state.isConnected = false;
          this.notifyConnectionChange(false);
        }
      };

      // Create data channel for D-ID events (Janus)
      const dc = pc.createDataChannel('JanusDataChannel');
      this.state.dataChannel = dc;

      dc.onopen = () => console.log('📡 Data channel open');
      dc.onclose = () => console.log('📡 Data channel closed');
      
      dc.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 D-ID event:', message.type || message);

          // Handle speaking events
          if (message.type === 'stream/started' || message.type === 'talk_started') {
            this.notifySpeakingChange(true);
          } else if (message.type === 'stream/done' || message.type === 'talk_done') {
            this.notifySpeakingChange(false);
            // DO NOT recreate stream on done events - keep connection persistent
          }
        } catch (e) {
          console.log('📨 D-ID message:', event.data);
        }
      };

      // Step 3: Set remote description (D-ID's offer)
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Step 4: Create and set local description (our answer)
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Step 5: Send our answer to D-ID
      const { data: startData, error: startError } = await supabase.functions.invoke('did-streaming', {
        body: {
          action: 'start',
          data: {
            stream_id: streamId,
            session_id: sessionId,
            answer: {
              type: answer.type,
              sdp: answer.sdp,
            },
          },
        },
      });

      if (startError || !startData?.success) {
        throw new Error(startError?.message || startData?.error?.message || 'Failed to start stream');
      }

      console.log('✅ WebRTC connection established');

    } catch (error) {
      console.error('❌ Stream creation failed:', error);
      this.state.isConnecting = false;
      this.state.isConnected = false;
      throw error;
    }
  }

  // Speak text through the avatar
  async speak(text: string, voiceId?: string): Promise<void> {
    if (!this.state.isConnected || !this.state.streamId || !this.state.sessionId) {
      console.warn('⚠️ Not connected, attempting fallback...');
      
      // Try fallback to createClip
      if (this.state.avatarUrl) {
        return this.speakWithClip(text, voiceId);
      }
      
      throw new Error('Not connected and no avatar URL for fallback');
    }

    console.log('🎤 Sending speech:', { textLength: text.length, voiceId });

    const { data, error } = await supabase.functions.invoke('did-streaming', {
      body: {
        action: 'startAnimation',
        data: {
          stream_id: this.state.streamId,
          session_id: this.state.sessionId,
          text,
          voice_id: voiceId,
        },
      },
    });

    if (error || !data?.success) {
      console.error('❌ startAnimation failed:', error || data?.error);
      
      // Fallback to clip
      if (this.state.avatarUrl) {
        return this.speakWithClip(text, voiceId);
      }
      
      throw new Error(error?.message || data?.error?.message || 'Animation failed');
    }

    console.log('✅ Animation started');
  }

  // Fallback: Create async clip
  private async speakWithClip(text: string, voiceId?: string): Promise<void> {
    if (!this.state.avatarUrl) {
      throw new Error('No avatar URL for clip fallback');
    }

    console.log('🎬 Falling back to createClip...');

    const { data, error } = await supabase.functions.invoke('did-streaming', {
      body: {
        action: 'createClip',
        data: {
          source_url: this.state.avatarUrl,
          text,
          voice_id: voiceId,
        },
      },
    });

    if (error || !data?.success) {
      throw new Error(error?.message || data?.error?.message || 'Clip creation failed');
    }

    // Poll for clip completion
    const clipId = data.id;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: clipData } = await supabase.functions.invoke('did-streaming', {
        body: {
          action: 'getClip',
          data: { clip_id: clipId },
        },
      });

      if (clipData?.status === 'done' && clipData?.result_url) {
        // Play the clip video
        const videoEl = (window as any).__AVATAR_VIDEO_REF__ as HTMLVideoElement | null;
        if (videoEl) {
          videoEl.src = clipData.result_url;
          await videoEl.play();
          this.notifySpeakingChange(true);
          
          videoEl.onended = () => {
            this.notifySpeakingChange(false);
          };
        }
        return;
      }

      if (clipData?.status === 'error') {
        throw new Error('Clip generation failed');
      }

      attempts++;
    }

    throw new Error('Clip generation timed out');
  }

  // Disconnect and cleanup
  async disconnect(): Promise<void> {
    console.log('🔌 Disconnecting stream...');

    if (this.state.streamId && this.state.sessionId) {
      try {
        await supabase.functions.invoke('did-streaming', {
          body: {
            action: 'deleteStream',
            data: {
              stream_id: this.state.streamId,
              session_id: this.state.sessionId,
            },
          },
        });
      } catch (e) {
        console.warn('⚠️ Stream deletion failed:', e);
      }
    }

    if (this.state.dataChannel) {
      this.state.dataChannel.close();
    }

    if (this.state.peerConnection) {
      this.state.peerConnection.close();
    }

    this.state = {
      streamId: null,
      sessionId: null,
      peerConnection: null,
      dataChannel: null,
      isConnected: false,
      isConnecting: false,
      avatarUrl: null,
    };

    this.notifyConnectionChange(false);
    this.notifySpeakingChange(false);
  }

  // Get current state
  getState() {
    return { ...this.state };
  }
}

// Export singleton instance and convenience methods
export const StreamingService = {
  getInstance: () => PersistentStreamManager.getInstance(),
  
  async init(avatarUrl: string): Promise<void> {
    return PersistentStreamManager.getInstance().initOnce(avatarUrl);
  },

  async speak(params: SpeakParams): Promise<void> {
    const manager = PersistentStreamManager.getInstance();
    
    // Ensure initialized
    await manager.initOnce(params.avatarUrl);
    
    // Speak
    return manager.speak(params.text, params.voiceId);
  },

  async disconnect(): Promise<void> {
    return PersistentStreamManager.getInstance().disconnect();
  },

  onConnectionChange(callback: ConnectionCallback): () => void {
    return PersistentStreamManager.getInstance().onConnectionChange(callback);
  },

  onSpeakingChange(callback: SpeakingCallback): () => void {
    return PersistentStreamManager.getInstance().onSpeakingChange(callback);
  },

  getState() {
    return PersistentStreamManager.getInstance().getState();
  },
};

export default StreamingService;
