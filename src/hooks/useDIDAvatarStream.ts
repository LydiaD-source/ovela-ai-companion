import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UseDIDAvatarStreamOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  onStreamStart?: () => void;
  onStreamEnd?: () => void;
  onError?: (error: Error) => void;
}

export const useDIDAvatarStream = ({
  containerRef,
  onStreamStart,
  onStreamEnd,
  onError,
}: UseDIDAvatarStreamOptions) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const streamIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const pendingTextRef = useRef<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = async () => {
    console.log('🧹 Cleaning up D-ID stream');
    
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
        console.error('Error deleting stream:', error);
      }
    }

    streamIdRef.current = null;
    sessionIdRef.current = null;
    setIsStreaming(false);
    setIsLoading(false);
  };

  const speak = async (text: string, imageUrl?: string) => {
    console.log('🎤 D-ID speak function called');
    console.log('📝 Text:', text?.substring(0, 50) + '...');
    console.log('🖼️ Image URL:', imageUrl);

    if (!text) return;
    if (!containerRef.current) {
      onError?.(new Error('Video container not available'));
      return;
    }

    try {
      // If already connected, just send the startAnimation command
      if (streamIdRef.current && sessionIdRef.current && peerConnectionRef.current?.connectionState === 'connected') {
        console.log('🔁 Reusing existing stream to speak');
        const speakResponse = await supabase.functions.invoke('did-streaming', {
          body: {
            action: 'startAnimation',
            data: {
              stream_id: streamIdRef.current,
              session_id: sessionIdRef.current,
              text,
            },
          },
        });

        if (speakResponse.error) {
          console.error('❌ startAnimation error:', speakResponse.error);
          throw new Error(`startAnimation failed: ${speakResponse.error.message}`);
        }
        
        console.log('✅ Animation started on existing stream');
        return;
      }

      if (isLoading) {
        console.log('⏳ Setup in progress, queueing text');
        pendingTextRef.current = text;
        return;
      }

      setIsLoading(true);
      pendingTextRef.current = text;

      const sourceUrl = imageUrl || 
        'https://res.cloudinary.com/di5gj4nyp/image/upload/w_1920,h_1080,c_fit,dpr_1.0,e_sharpen:200,q_auto:best,f_auto/v1759612035/Default_Fullbody_portrait_of_IsabellaV2_wearing_a_luxurious_go_0_fdabba15-5365-4f04-ab3b-b9079666cdc6_0_shq4b3.png';

      // 1) Create stream (WebRTC connection only, NO script)
      console.log('🎬 Creating D-ID stream...');
      const response = await supabase.functions.invoke('did-streaming', {
        body: {
          action: 'createStream',
          data: { source_url: sourceUrl },
        },
      });

      console.log('📡 createStream response:', response);

      if (response.error || !response.data?.success) {
        console.error('❌ createStream error:', response.error || response.data);
        throw new Error(`D-ID createStream failed: ${response.error?.message || 'Unknown error'}`);
      }

      const { id: streamId, offer, ice_servers, session_id } = response.data;
      streamIdRef.current = streamId;
      sessionIdRef.current = session_id;
      console.log('✅ Stream created:', streamId);

      // 2) Setup WebRTC
      const pc = new RTCPeerConnection({
        iceServers: ice_servers || [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      peerConnectionRef.current = pc;

      // Create hidden video element for source
      const video = document.createElement('video');
      video.autoplay = true;
      video.playsInline = true;
      video.muted = false; // Audio should come through
      video.style.display = 'none';
      videoRef.current = video;
      containerRef.current.appendChild(video);

      // Create canvas for chroma-key processing
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
        transition: 'opacity 0.5s ease-in-out',
        zIndex: '20',
        backgroundColor: 'transparent',
      } as CSSStyleDeclaration);
      canvasRef.current = canvas;
      containerRef.current.appendChild(canvas);

      const ctx = canvas.getContext('2d', { 
        willReadFrequently: true,
        alpha: true,
      });
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Process video frames to remove black background
      let canvasInitialized = false;
      
      const processFrame = () => {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        
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
        
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        ctx.drawImage(video, 0, 0, width, height);

        // Chroma-key: remove black/dark pixels
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const threshold = 30;

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
          
          video.onloadedmetadata = () => {
            console.log('🎥 Video metadata loaded:', video.videoWidth, 'x', video.videoHeight);
            
            video.play().then(() => {
              console.log('▶️ Video playing');
              processFrame();
              setIsLoading(false);
              setIsStreaming(true);
              onStreamStart?.();
            }).catch(err => {
              console.error('❌ Video play failed:', err);
            });
          };
        }
      };

      // Forward ALL ICE candidates including null (gathering complete)
      pc.onicecandidate = async (event) => {
        console.log('🧊 ICE candidate:', event.candidate ? 'candidate' : 'null (gathering complete)');
        
        try {
          await supabase.functions.invoke('did-streaming', {
            body: {
              action: 'sendIceCandidate',
              data: {
                stream_id: streamId,
                session_id: session_id,
                candidate: event.candidate?.candidate || null,
                sdpMid: event.candidate?.sdpMid || null,
                sdpMLineIndex: event.candidate?.sdpMLineIndex ?? null,
              },
            },
          });
        } catch (e) {
          console.error('❌ ICE send failed:', e);
        }
      };

      pc.onconnectionstatechange = () => {
        console.log('🔌 Connection state:', pc.connectionState);
        
        if (pc.connectionState === 'connected') {
          // Send animation once WebRTC is fully connected
          const toSpeak = pendingTextRef.current;
          if (toSpeak) {
            console.log('🎤 Sending startAnimation after connection...');
            supabase.functions.invoke('did-streaming', {
              body: {
                action: 'startAnimation',
                data: {
                  stream_id: streamIdRef.current,
                  session_id: sessionIdRef.current,
                  text: toSpeak,
                },
              },
            }).then(res => {
              if (res.error || !res.data?.success) {
                console.error('❌ startAnimation failed:', res.error || res.data);
              } else {
                console.log('✅ Animation started');
              }
            });
            pendingTextRef.current = null;
          }
        }
        
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          onStreamEnd?.();
        }
      };

      // Set remote description (D-ID's offer)
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create and set local answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send SDP answer to D-ID
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

      if (sdpResponse.error || !sdpResponse.data?.success) {
        console.error('❌ SDP exchange failed:', sdpResponse.error || sdpResponse.data);
        throw new Error('SDP exchange failed');
      }

      console.log('✅ SDP exchanged successfully');

    } catch (error) {
      console.error('❌ D-ID speak error:', error);
      setIsLoading(false);
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  return {
    speak,
    isStreaming,
    isLoading,
    cleanup,
  };
};
