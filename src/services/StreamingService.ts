/**
 * StreamingService.ts - D-ID Avatar Streaming
 * Optimized WebRTC streaming with robust speech detection
 */

const BACKEND_FN = 'https://vrpgowcocbztclxfzssu.supabase.co/functions/v1/did-streaming';

type ConnectionCallback = (connected: boolean) => void;
type SpeakingCallback = (speaking: boolean) => void;

interface SpeakParams {
  avatarUrl: string;
  text: string;
  voiceId?: string;
}

// Speech duration estimation constants
const BASE_SPEECH_MS = 1200;
const MS_PER_CHAR = 65;
const MS_PER_WORD = 250;
const MAX_SPEECH_MS = 60000;

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
  
  private hiddenVideo: HTMLVideoElement | null = null;
  private chromaCanvas: HTMLCanvasElement | null = null;
  private animationFrameId: number | null = null;
  private speakingTimeoutId: ReturnType<typeof setTimeout> | null = null;
  
  private constructor() {}
  
  static getInstance(): PersistentStreamManager {
    if (!PersistentStreamManager.instance) {
      PersistentStreamManager.instance = new PersistentStreamManager();
    }
    return PersistentStreamManager.instance;
  }
  
  private async callBackend(action: string, payload: Record<string, unknown> = {}): Promise<any> {
    const resp = await fetch(BACKEND_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload })
    });
    
    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${errorText}`);
    }
    
    return resp.json();
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
    if (this.speakingTimeoutId) {
      clearTimeout(this.speakingTimeoutId);
      this.speakingTimeoutId = null;
    }
    
    if (this.isSpeaking === speaking) return;
    
    this.isSpeaking = speaking;
    this.speakingCallbacks.forEach(cb => cb(speaking));
  }
  
  /**
   * Estimate speech duration based on text length and word count
   * More accurate than simple character count
   */
  private estimateSpeechDuration(text: string): number {
    const words = text.trim().split(/\s+/).length;
    const chars = text.length;
    
    // Use word-based estimation for longer text, char-based for short
    const wordBased = BASE_SPEECH_MS + (words * MS_PER_WORD);
    const charBased = BASE_SPEECH_MS + (chars * MS_PER_CHAR);
    
    // Take the larger estimate and add buffer
    const estimate = Math.max(wordBased, charBased) * 1.15;
    return Math.min(estimate, MAX_SPEECH_MS);
  }
  
  async initOnce(avatarUrl: string): Promise<void> {
    // Reuse existing stream
    if (this.streamId && this.sessionId && this.avatarUrl === avatarUrl) {
      return;
    }
    
    // Wait for existing init
    if (this.initPromise) {
      return this.initPromise;
    }
    
    this.avatarUrl = avatarUrl;
    this.initPromise = this.doInit(avatarUrl);
    
    try {
      await this.initPromise;
    } finally {
      this.initPromise = null;
    }
  }
  
  private async doInit(avatarUrl: string): Promise<void> {
    if (this.pc) {
      this.disconnect();
    }
    
    await this.createStream(avatarUrl);
  }
  
  private async createStream(avatarUrl: string): Promise<void> {
    const createResp = await this.callBackend('createStream', { avatarUrl });
    
    const responseBody = createResp.body || createResp;
    const streamId = responseBody.id;
    
    if (!streamId) {
      throw new Error(responseBody.error?.message || 'Failed to create stream');
    }
    
    this.streamId = streamId;
    this.sessionId = responseBody.session_id;
    const offer = responseBody.offer;
    const iceServers = responseBody.ice_servers || [];
    
    this.pc = new RTCPeerConnection({ iceServers });
    
    // ICE handling
    this.pc.onicecandidate = async (event) => {
      await this.callBackend('sendIceCandidate', {
        stream_id: this.streamId,
        session_id: this.sessionId,
        candidate: event.candidate ? {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex
        } : null
      });
    };
    
    this.pc.oniceconnectionstatechange = () => {
      const state = this.pc?.iceConnectionState;
      if (state === 'connected') {
        this.notifyConnection(true);
      } else if (state === 'disconnected' || state === 'failed') {
        this.notifyConnection(false);
      }
    };
    
    // Track handling with chroma-key
    this.pc.ontrack = (event) => {
      if (event.track.kind === 'video' && event.streams[0]) {
        this.setupChromaKey(event.streams[0]);
      } else if (event.track.kind === 'audio') {
        const targetVideo = (window as any).__AVATAR_VIDEO_REF__ as HTMLVideoElement | undefined;
        if (targetVideo && event.streams[0]) {
          targetVideo.srcObject = event.streams[0];
          targetVideo.muted = false;
          targetVideo.play().catch(() => {});
        }
      }
    };
    
    // DataChannel for speech events
    this.pc.ondatachannel = (event) => {
      const dc = event.channel;
      
      dc.onmessage = (msg) => {
        if (typeof msg.data === 'string') {
          if (msg.data.includes('stream/started')) {
            this.notifySpeaking(true);
          } else if (msg.data.includes('stream/done')) {
            this.notifySpeaking(false);
          }
        }
      };
    };
    
    // SDP exchange
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    
    await this.callBackend('start', {
      stream_id: this.streamId,
      session_id: this.sessionId,
      answer: this.pc.localDescription
    });
  }
  
  private setupChromaKey(stream: MediaStream) {
    const targetVideo = (window as any).__AVATAR_VIDEO_REF__ as HTMLVideoElement | undefined;
    if (!targetVideo?.parentElement) return;
    
    const container = targetVideo.parentElement;
    
    // Hidden video for D-ID stream
    this.hiddenVideo = document.createElement('video');
    this.hiddenVideo.autoplay = true;
    this.hiddenVideo.playsInline = true;
    this.hiddenVideo.muted = true;
    this.hiddenVideo.srcObject = stream;
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
    
    const ctx = this.chromaCanvas.getContext('2d', { willReadFrequently: true, alpha: true });
    if (!ctx) return;
    
    let canvasReady = false;
    
    const processFrame = () => {
      this.animationFrameId = requestAnimationFrame(processFrame);
      
      if (!this.hiddenVideo || this.hiddenVideo.paused || this.hiddenVideo.readyState < 2) return;
      
      const { videoWidth: width, videoHeight: height } = this.hiddenVideo;
      if (!width || !height) return;
      
      if (!canvasReady && this.chromaCanvas) {
        this.chromaCanvas.width = width;
        this.chromaCanvas.height = height;
        canvasReady = true;
      }
      
      if (this.chromaCanvas && (this.chromaCanvas.width !== width || this.chromaCanvas.height !== height)) {
        this.chromaCanvas.width = width;
        this.chromaCanvas.height = height;
      }
      
      ctx.drawImage(this.hiddenVideo, 0, 0, width, height);
      
      // Remove pure black background (D-ID default)
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] < 12 && data[i + 1] < 12 && data[i + 2] < 12) {
          data[i + 3] = 0;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    };
    
    this.hiddenVideo.oncanplay = () => {
      this.hiddenVideo?.play().then(processFrame).catch(() => {});
    };
    
    this.hiddenVideo.play().catch(() => {});
  }
  
  async speak(text: string, voiceId?: string): Promise<void> {
    if (!this.streamId || !this.sessionId) {
      if (this.avatarUrl) {
        await this.initOnce(this.avatarUrl);
      } else {
        throw new Error('No active stream');
      }
    }
    
    const resp = await this.callBackend('startAnimation', {
      stream_id: this.streamId,
      session_id: this.sessionId,
      message: text,
      voiceId: voiceId || 'EXAVITQu4vr4xnSDxMaL'
    });
    
    if (!(resp.ok === true || resp.success === true)) {
      throw new Error(resp.error?.message || 'Animation failed');
    }
    
    this.notifySpeaking(true);
    
    // Fallback timeout if DataChannel events don't fire
    const duration = this.estimateSpeechDuration(text);
    this.speakingTimeoutId = setTimeout(() => {
      if (this.isSpeaking) {
        this.notifySpeaking(false);
      }
    }, duration);
  }
  
  disconnect(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    if (this.hiddenVideo) {
      this.hiddenVideo.pause();
      this.hiddenVideo.srcObject = null;
      this.hiddenVideo.remove();
      this.hiddenVideo = null;
    }
    
    if (this.chromaCanvas) {
      this.chromaCanvas.remove();
      this.chromaCanvas = null;
    }
    
    (window as any).__AVATAR_CANVAS_REF__ = null;
    
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    
    this.streamId = null;
    this.sessionId = null;
    this.notifyConnection(false);
    this.notifySpeaking(false);
  }
  
  getState() {
    return {
      isConnected: this.isConnected,
      isSpeaking: this.isSpeaking,
      hasStream: !!this.streamId
    };
  }
}

// Exported API
export const StreamingService = {
  init: (avatarUrl: string) => PersistentStreamManager.getInstance().initOnce(avatarUrl),
  
  speak: async (params: SpeakParams) => {
    const manager = PersistentStreamManager.getInstance();
    if (!manager.getState().hasStream) {
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
