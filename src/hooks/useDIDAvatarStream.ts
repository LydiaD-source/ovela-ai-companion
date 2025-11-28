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

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = async () => {
    console.log('🧹 Cleaning up D-ID stream');
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.remove();
      videoRef.current = null;
    }

    // Clean up canvas elements
    if (containerRef.current) {
      const canvases = containerRef.current.querySelectorAll('canvas');
      canvases.forEach(canvas => canvas.remove());
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (streamIdRef.current && sessionIdRef.current) {
      try {
        await supabase.functions.invoke('did-streaming', {
          body: {
            action: 'delete_talk_stream',
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
    console.log('📝 Full text:', text);
    console.log('🖼️ Image URL:', imageUrl);
    console.log('📊 Current state - isLoading:', isLoading, 'isStreaming:', isStreaming);
    console.log('🔗 Stream refs - streamId:', streamIdRef.current, 'sessionId:', sessionIdRef.current);

    if (!text) return;
    if (!containerRef.current) {
      onError?.(new Error('Video container not available'));
      return;
    }

    try {
      // If already connected, just send the speak command (don't block on isStreaming)
      if (streamIdRef.current && sessionIdRef.current && peerConnectionRef.current) {
        console.log('🔁 Reusing existing stream to speak');
        await supabase.functions.invoke('did-streaming', {
          body: {
            action: 'talk_stream_speak',
            data: {
              stream_id: streamIdRef.current,
              session_id: sessionIdRef.current,
              text,
            },
          },
        });
        return;
      }

      if (isLoading) {
        console.log('⏳ Setup in progress, queueing text');
        pendingTextRef.current = text;
        return;
      }

      setIsLoading(true);
      pendingTextRef.current = text;

      // 1) Create stream
      console.log('🎬 Creating D-ID talk stream...');
      const { data: streamData, error: streamError } = await supabase.functions.invoke('did-streaming', {
        body: {
          action: 'create_talk_stream',
          data: {
            source_url:
              imageUrl ||
              'https://res.cloudinary.com/di5gj4nyp/image/upload/w_1920,h_1080,c_fit,dpr_1.0,e_sharpen:200,q_auto:best,f_auto/v1759612035/Default_Fullbody_portrait_of_IsabellaV2_wearing_a_luxurious_go_0_fdabba15-5365-4f04-ab3b-b9079666cdc6_0_shq4b3.png',
          },
        },
      });

      if (streamError || !streamData) throw new Error(streamError?.message || 'Failed to create stream');

      const { id: streamId, offer, ice_servers, session_id } = streamData;
      streamIdRef.current = streamId;
      sessionIdRef.current = session_id;
      console.log('✅ Stream created:', streamId);

      // 2) Setup WebRTC
      const pc = new RTCPeerConnection({
        iceServers: ice_servers || [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      peerConnectionRef.current = pc;

      // Video element with canvas-based chroma-key to remove black background
      const video = document.createElement('video');
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;
      Object.assign(video.style, {
        display: 'none', // Hide original video, we'll use canvas
      } as CSSStyleDeclaration);

      // Canvas for processing and displaying the video with transparent blacks
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

      const ctx = canvas.getContext('2d', { 
        willReadFrequently: true,
        alpha: true,
        desynchronized: true // Better performance
      });
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Disable ALL smoothing for maximum sharpness
      ctx.imageSmoothingEnabled = false;
      (ctx as any).mozImageSmoothingEnabled = false;
      (ctx as any).webkitImageSmoothingEnabled = false;
      (ctx as any).msImageSmoothingEnabled = false;

      videoRef.current = video;
      
      // Add both video (hidden) and canvas to DOM
      containerRef.current.appendChild(video);
      containerRef.current.appendChild(canvas);

      // Process video frames to remove black background
      let frameCount = 0;
      const processFrame = () => {
        frameCount++;
        if (frameCount % 60 === 0) { // Log every 60 frames (roughly 1 second)
          console.log('🎬 processFrame running, count:', frameCount);
        }
        
        if (!video.paused && !video.ended && video.readyState >= video.HAVE_CURRENT_DATA) {
          if (frameCount === 1) {
            console.log('✅ First frame processed! Video state:', {
              paused: video.paused,
              ended: video.ended,
              readyState: video.readyState,
              dimensions: `${video.videoWidth}x${video.videoHeight}`
            });
          }
          
          const width = video.videoWidth;
          const height = video.videoHeight;
          
          // Set canvas to EXACT video resolution (no scaling)
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            console.log('🎨 Canvas set to native resolution:', width, 'x', height);
          }

          // Draw at 1:1 pixel ratio for maximum quality
          ctx.drawImage(video, 0, 0, width, height);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Remove black/dark pixels with optimized threshold
          const threshold = 30; // Lower threshold for better detail preservation
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // If pixel is very dark (near black), make it transparent
            const brightness = (r + g + b) / 3;
            if (brightness < threshold) {
              data[i + 3] = 0; // Fully transparent
            }
          }

          // Put processed image data back
          ctx.putImageData(imageData, 0, 0);
        } else if (frameCount <= 10) { // Log why we're not processing for first 10 frames
          console.log('⚠️ Frame skipped:', {
            paused: video.paused,
            ended: video.ended,
            readyState: video.readyState,
            readyStateRequired: video.HAVE_CURRENT_DATA
          });
        }
        requestAnimationFrame(processFrame);
      };

      pc.ontrack = (event) => {
        console.log('🎥 ontrack received');
        if (event.streams && event.streams[0]) {
          video.srcObject = event.streams[0];
          console.log('🎥 Video srcObject set, stream:', event.streams[0].id);
          
          // Start processing frames once video is playing
          video.onloadedmetadata = () => {
            console.log('🎥 Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
            
            // Set canvas to native video resolution for crisp rendering
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            console.log('🎨 Canvas initial size set:', canvas.width, 'x', canvas.height);
            
            video.play().then(() => {
              console.log('🎥 Video playing, starting frame processing');
              processFrame();
              canvas.style.opacity = '1';
              console.log('✅ Canvas visible, animation should start');
              setIsLoading(false);
              setIsStreaming(true);
              onStreamStart?.();
            }).catch(err => {
              console.error('❌ Video play failed:', err);
            });
          };

          video.onerror = (e) => {
            console.error('❌ Video error event:', e);
          };
        }
      };

      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          try {
            await supabase.functions.invoke('did-streaming', {
              body: {
                action: 'talk_stream_ice',
                data: {
                  stream_id: streamId,
                  session_id: session_id,
                  candidate: event.candidate.candidate,
                  sdpMid: event.candidate.sdpMid,
                  sdpMLineIndex: event.candidate.sdpMLineIndex,
                },
              },
            });
          } catch (e) {
            console.error('ICE send failed', e);
          }
        }
      };

      pc.onconnectionstatechange = () => {
        console.log('🔌 PeerConnection state:', pc.connectionState);
      };

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await supabase.functions.invoke('did-streaming', {
        body: {
          action: 'talk_stream_sdp',
          data: { stream_id: streamId, session_id: session_id, answer },
        },
      });

      // Kick off initial speech shortly after SDP to start media
      setTimeout(async () => {
        const toSpeak = pendingTextRef.current;
        if (!toSpeak) return;
        try {
          await supabase.functions.invoke('did-streaming', {
            body: {
              action: 'talk_stream_speak',
              data: { stream_id: streamIdRef.current, session_id: sessionIdRef.current, text: toSpeak },
            },
          });
          pendingTextRef.current = null;
        } catch (e) {
          console.error('❌ Initial speak after SDP failed:', e);
        }
      }, 150);

      video.onerror = (e) => {
        console.error('❌ Video error:', e);
        onError?.(new Error('Video playback failed'));
      };
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
