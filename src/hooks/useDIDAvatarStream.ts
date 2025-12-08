import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UseDIDAvatarStreamOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  onStreamStart?: () => void;
  onStreamEnd?: () => void;
  onError?: (error: Error) => void;
}

// Connection health check interval (ms)
const HEALTH_CHECK_INTERVAL = 15000;
// Max retries for startAnimation
const MAX_ANIMATION_RETRIES = 3;
// Delay between retries (ms)
const RETRY_DELAY = 1000;
// Debounce delay for speech queue (ms) - prevents overlapping
const SPEECH_DEBOUNCE = 300;

export const useDIDAvatarStream = ({
  containerRef,
  onStreamStart,
  onStreamEnd,
  onError,
}: UseDIDAvatarStreamOptions) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const streamIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const pendingTextRef = useRef<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sdpExchangedRef = useRef<boolean>(false);
  const pendingIceCandidates = useRef<RTCIceCandidate[]>([]);
  const healthCheckRef = useRef<NodeJS.Timeout | null>(null);
  const sourceUrlRef = useRef<string | null>(null);
  const isCleaningUp = useRef<boolean>(false);
  // Speech queue to prevent overlapping animations
  const speechQueueRef = useRef<string[]>([]);
  const isProcessingQueueRef = useRef<boolean>(false);
  const lastSpeechTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = useCallback(async () => {
    if (isCleaningUp.current) return;
    isCleaningUp.current = true;
    
    console.log('🧹 Cleaning up D-ID stream');
    
    // Stop health check
    if (healthCheckRef.current) {
      clearInterval(healthCheckRef.current);
      healthCheckRef.current = null;
    }
    
    sdpExchangedRef.current = false;
    pendingIceCandidates.current = [];
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.remove();
      videoRef.current = null;
    }

    if (canvasRef.current) {
      canvasRef.current.remove();
      canvasRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (streamIdRef.current) {
      try {
        await supabase.functions.invoke('did-streaming', {
          body: {
            action: 'deleteStream',
            data: {
              stream_id: streamIdRef.current,
              session_id: sessionIdRef.current
            }
          }
        });
      } catch (error) {
        console.warn('⚠️ Error deleting stream:', error);
      }
    }

    streamIdRef.current = null;
    sessionIdRef.current = null;
    sourceUrlRef.current = null;
    setIsStreaming(false);
    setIsLoading(false);
    setConnectionState('idle');
    isCleaningUp.current = false;
  }, []);

  // Send queued ICE candidates after SDP is exchanged
  const flushIceCandidates = useCallback(async () => {
    if (!sdpExchangedRef.current) return;
    
    const candidates = [...pendingIceCandidates.current];
    pendingIceCandidates.current = [];
    
    console.log(`🧊 Flushing ${candidates.length} queued ICE candidates`);
    
    for (const candidate of candidates) {
      try {
        await supabase.functions.invoke('did-streaming', {
          body: {
            action: 'sendIceCandidate',
            data: {
              stream_id: streamIdRef.current,
              session_id: sessionIdRef.current,
              candidate: candidate.candidate,
              sdpMid: candidate.sdpMid,
              sdpMLineIndex: candidate.sdpMLineIndex,
            },
          },
        });
      } catch (e) {
        console.error('❌ ICE send failed:', e);
      }
    }
    
    // Send null candidate to signal gathering complete
    try {
      await supabase.functions.invoke('did-streaming', {
        body: {
          action: 'sendIceCandidate',
          data: {
            stream_id: streamIdRef.current,
            session_id: sessionIdRef.current,
            candidate: null,
            sdpMid: null,
            sdpMLineIndex: null,
          },
        },
      });
      console.log('🧊 ICE gathering complete signal sent');
    } catch (e) {
      console.error('❌ ICE complete signal failed:', e);
    }
  }, []);

  // Start animation with retry logic
  const sendStartAnimation = useCallback(async (text: string): Promise<boolean> => {
    setIsSpeaking(true);
    lastSpeechTimeRef.current = Date.now();
    
    for (let attempt = 1; attempt <= MAX_ANIMATION_RETRIES; attempt++) {
      console.log(`🎤 startAnimation attempt ${attempt}/${MAX_ANIMATION_RETRIES}...`);
      
      try {
        const res = await supabase.functions.invoke('did-streaming', {
          body: {
            action: 'startAnimation',
            data: {
              stream_id: streamIdRef.current,
              session_id: sessionIdRef.current,
              text,
            },
          },
        });

        if (res.error || !res.data?.success) {
          console.error(`❌ startAnimation attempt ${attempt} failed:`, res.error || res.data);
          if (attempt < MAX_ANIMATION_RETRIES) {
            console.log(`⏳ Waiting ${RETRY_DELAY}ms before retry...`);
            await new Promise(r => setTimeout(r, RETRY_DELAY));
          }
        } else {
          console.log('✅ Animation started successfully');
          // Estimate speaking duration based on text length (rough: 100 chars/sec)
          const estimatedDuration = Math.max(2000, (text.length / 12) * 1000);
          setTimeout(() => {
            setIsSpeaking(false);
            processNextInQueue();
          }, estimatedDuration);
          return true;
        }
      } catch (e) {
        console.error(`❌ startAnimation attempt ${attempt} error:`, e);
        if (attempt < MAX_ANIMATION_RETRIES) {
          await new Promise(r => setTimeout(r, RETRY_DELAY));
        }
      }
    }
    console.error('❌ All startAnimation attempts failed');
    setIsSpeaking(false);
    return false;
  }, []);

  // Process speech queue - ensures only one animation at a time
  const processNextInQueue = useCallback(async () => {
    if (isProcessingQueueRef.current) return;
    if (speechQueueRef.current.length === 0) return;
    if (!streamIdRef.current || !sessionIdRef.current) return;
    if (!sdpExchangedRef.current) return;
    
    isProcessingQueueRef.current = true;
    const text = speechQueueRef.current.shift();
    
    if (text) {
      console.log('📤 Processing queued speech:', text.substring(0, 50) + '...');
      await sendStartAnimation(text);
    }
    
    isProcessingQueueRef.current = false;
  }, [sendStartAnimation]);

  // Queue speech with deduplication
  const queueSpeech = useCallback((text: string) => {
    // Skip if same text was just sent (debounce)
    const now = Date.now();
    if (now - lastSpeechTimeRef.current < SPEECH_DEBOUNCE) {
      console.log('⏳ Speech debounced, skipping duplicate');
      return;
    }
    
    // If not speaking and queue is empty, send immediately
    if (!isSpeaking && speechQueueRef.current.length === 0 && 
        streamIdRef.current && sdpExchangedRef.current) {
      sendStartAnimation(text);
    } else {
      // Otherwise queue it (but clear any existing queue to only keep latest)
      console.log('📥 Queueing speech (replacing any pending):', text.substring(0, 50) + '...');
      speechQueueRef.current = [text]; // Replace queue with latest
    }
  }, [isSpeaking, sendStartAnimation]);

  // Main speak function
  const speak = useCallback(async (text: string, imageUrl?: string) => {
    console.log('🎤 D-ID speak function called');
    console.log('📝 Text:', text ? text.substring(0, 50) + '...' : '(empty - connection only)');
    console.log('🖼️ Image URL:', imageUrl);

    if (!containerRef.current) {
      onError?.(new Error('Video container not available'));
      return;
    }

    const sourceUrl = imageUrl || 
      'https://res.cloudinary.com/di5gj4nyp/image/upload/w_1920,h_1080,c_fit,dpr_1.0,e_sharpen:200,q_auto:best,f_auto/v1759612035/Default_Fullbody_portrait_of_IsabellaV2_wearing_a_luxurious_go_0_fdabba15-5365-4f04-ab3b-b9079666cdc6_0_shq4b3.png';

    try {
      // If already connected and SDP exchanged, just send the startAnimation command
      if (text && streamIdRef.current && sessionIdRef.current && sdpExchangedRef.current && 
          peerConnectionRef.current?.connectionState === 'connected') {
        console.log('🔁 Reusing existing stream to speak');
        console.log('🎥 Canvas ref:', !!canvasRef.current);
        console.log('🎥 Video ref:', !!videoRef.current);
        if (canvasRef.current) {
          console.log('🎥 Canvas opacity:', canvasRef.current.style.opacity);
          // Ensure canvas is visible
          canvasRef.current.style.opacity = '1';
        }
        queueSpeech(text);
        return;
      }

      // If loading, queue the text
      if (isLoading) {
        console.log('⏳ Setup in progress, queueing text');
        if (text) pendingTextRef.current = text;
        return;
      }

      // Store text for later (if provided)
      if (text) pendingTextRef.current = text;

      setIsLoading(true);
      setConnectionState('connecting');
      sdpExchangedRef.current = false;
      pendingIceCandidates.current = [];
      sourceUrlRef.current = sourceUrl;

      // 1) Create stream (WebRTC connection only, NO script)
      console.log('🎬 Creating D-ID stream with source:', sourceUrl);
      const response = await supabase.functions.invoke('did-streaming', {
        body: {
          action: 'createStream',
          // Send both formats for compatibility with v8 deployed function
          source_url: sourceUrl,
          data: { source_url: sourceUrl },
        },
      });

      console.log('📡 createStream response:', response);

      if (response.error || !response.data?.success) {
        console.error('❌ createStream error:', response.error || response.data);
        throw new Error(`D-ID createStream failed: ${response.error?.message || 'Unknown error'}`);
      }

      // v8 returns stream_id, v4 returns id - support both
      const streamId = response.data.stream_id || response.data.id;
      const { offer, ice_servers, session_id } = response.data;
      
      if (!streamId) {
        console.error('❌ No stream_id or id in response:', response.data);
        throw new Error('Stream ID missing from response');
      }
      
      streamIdRef.current = streamId;
      sessionIdRef.current = session_id;
      console.log('✅ Stream created:', streamId);

      // 2) Setup WebRTC with optimized settings
      const pc = new RTCPeerConnection({
        iceServers: ice_servers || [{ urls: 'stun:stun.l.google.com:19302' }],
        // Optimize for low latency
        iceCandidatePoolSize: 10,
      });
      peerConnectionRef.current = pc;

      // Create hidden video element for source - NO DISTORTION
      const video = document.createElement('video');
      video.autoplay = true;
      video.playsInline = true;
      video.muted = false; // Audio should come through
      video.style.display = 'none';
      // Prevent any scaling artifacts
      video.style.imageRendering = 'crisp-edges';
      videoRef.current = video;
      containerRef.current.appendChild(video);

      // Create canvas for chroma-key processing - CRISP, NO BLUR
      const canvas = document.createElement('canvas');
      Object.assign(canvas.style, {
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '100%',
        height: '100%',
        maxHeight: '88vh',
        objectFit: 'contain',
        objectPosition: 'bottom center',
        opacity: '0',
        transition: 'opacity 0.3s ease-in-out',
        zIndex: '20',
        backgroundColor: 'transparent',
        // CRITICAL: No blur or filters
        imageRendering: 'auto',
        filter: 'none',
      } as CSSStyleDeclaration);
      canvasRef.current = canvas;
      containerRef.current.appendChild(canvas);

      const ctx = canvas.getContext('2d', { 
        willReadFrequently: true,
        alpha: true,
        desynchronized: true, // Reduce latency
      });
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Ensure crisp rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Process video frames to remove black background - OPTIMIZED
      let canvasInitialized = false;
      let frameCount = 0;
      
      const processFrame = () => {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        
        // Log every 60 frames (approx once per second)
        frameCount++;
        if (frameCount % 60 === 0) {
          console.log('🎬 processFrame running:', {
            paused: video.paused,
            ended: video.ended,
            readyState: video.readyState,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            canvasInitialized
          });
        }
        
        if (video.paused || video.ended || video.readyState < 2) {
          return;
        }

        const width = video.videoWidth;
        const height = video.videoHeight;
        
        if (width === 0 || height === 0) return;
        
        if (!canvasInitialized) {
          canvas.width = width;
          canvas.height = height;
          canvas.style.opacity = '1';
          canvasInitialized = true;
          console.log('✅ Canvas initialized:', width, 'x', height);
        }
        
        // Only resize if needed (avoid flicker)
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        // Draw frame
        ctx.drawImage(video, 0, 0, width, height);

        // Chroma-key: remove black/dark pixels - OPTIMIZED threshold
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const threshold = 25; // Slightly tighter for cleaner edges

        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness < threshold) {
            data[i + 3] = 0; // Make transparent
          }
        }

        ctx.putImageData(imageData, 0, 0);
      };

      pc.ontrack = (event) => {
        console.log('🎥 ontrack received:', event.track.kind);
        
        if (event.streams && event.streams[0]) {
          const stream = event.streams[0];
          console.log('🎥 Stream tracks:', stream.getTracks().map(t => `${t.kind}: ${t.readyState}`).join(', '));
          
          video.srcObject = stream;
        }
      };

      // Queue ICE candidates until SDP is exchanged
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 ICE candidate generated, queuing...');
          pendingIceCandidates.current.push(event.candidate);
        } else {
          console.log('🧊 ICE gathering complete');
          // If SDP is already exchanged, flush now
          if (sdpExchangedRef.current) {
            flushIceCandidates();
          }
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log('🔌 Connection state:', state);
        
        if (state === 'connected') {
          setConnectionState('connected');
          
          // Start health check
          if (healthCheckRef.current) {
            clearInterval(healthCheckRef.current);
          }
          healthCheckRef.current = setInterval(() => {
            if (peerConnectionRef.current?.connectionState !== 'connected') {
              console.warn('⚠️ Connection health check failed');
              setConnectionState('failed');
            }
          }, HEALTH_CHECK_INTERVAL);
        } else if (state === 'disconnected' || state === 'failed') {
          setConnectionState('failed');
          onStreamEnd?.();
        }
      };

      // Wait for video to be ready, then send animation
      video.onloadedmetadata = async () => {
        console.log('🎥 Video metadata loaded:', video.videoWidth, 'x', video.videoHeight);
        
        try {
          await video.play();
          console.log('▶️ Video playing');
          processFrame();
          setIsLoading(false);
          setIsStreaming(true);
          setConnectionState('connected');
          onStreamStart?.();

          // Now that video is playing, send the animation if we have pending text
          const toSpeak = pendingTextRef.current;
          if (toSpeak) {
            pendingTextRef.current = null;
            // Small delay to ensure D-ID stream is fully ready
            await new Promise(r => setTimeout(r, 500));
            console.log('🎬 Sending pending speech after connection ready');
            await sendStartAnimation(toSpeak);
          } else {
            console.log('✅ D-ID connection ready, waiting for AI response');
          }
        } catch (err) {
          console.error('❌ Video play failed:', err);
          setConnectionState('failed');
        }
      };

      // Set remote description (D-ID's offer)
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create and set local answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // CRITICAL: Send SDP answer to D-ID FIRST, before any ICE candidates
      console.log('📡 Sending SDP answer...');
      const sdpResponse = await supabase.functions.invoke('did-streaming', {
        body: {
          action: 'start',
          data: { 
            stream_id: streamId, 
            session_id: session_id, 
            answer: pc.localDescription 
          },
        },
      });

      if (sdpResponse.error || (sdpResponse.data && !sdpResponse.data.success)) {
        console.error('❌ SDP exchange failed:', sdpResponse.error || sdpResponse.data);
        throw new Error('SDP exchange failed');
      }

      console.log('✅ SDP exchanged successfully');
      sdpExchangedRef.current = true;

      // NOW flush any queued ICE candidates
      await flushIceCandidates();

    } catch (error) {
      console.error('❌ D-ID speak error:', error);
      setIsLoading(false);
      setConnectionState('failed');
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [containerRef, isLoading, onError, onStreamStart, flushIceCandidates, sendStartAnimation, queueSpeech]);

  return {
    speak,
    isStreaming,
    isLoading,
    isSpeaking,
    connectionState,
    cleanup,
    queueSpeech,
  };
};
