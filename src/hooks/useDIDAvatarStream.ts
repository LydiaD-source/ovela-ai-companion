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
  const pendingTextRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = async () => {
    console.log('🧹 Cleaning up D-ID WebRTC stream');
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.remove();
      videoRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setIsStreaming(false);
    setIsLoading(false);
  };

  const speak = async (text: string, imageUrl?: string) => {
    console.log('🎤 useDIDAvatarStream.speak called');
    console.log('📝 Text:', text?.substring(0, 50));
    console.log('🖼️ Image:', imageUrl);
    
    if (!text) {
      console.log('⏭️ Skipping - empty text');
      return;
    }
    
    if (isLoading || isStreaming) {
      console.log('⏳ Busy. Queuing next utterance.');
      pendingTextRef.current = text;
      return;
    }

    if (!containerRef.current) {
      console.error('❌ No video container');
      onError?.(new Error('Video container not available'));
      return;
    }

    try {
      setIsLoading(true);
      console.log('🎬 Calling D-ID streaming API...');

      // Call edge function to create D-ID stream
      const { data, error } = await supabase.functions.invoke('did-streaming', {
        body: { 
          text,
          imageUrl: imageUrl || 'https://res.cloudinary.com/di5gj4nyp/image/upload/w_1920,h_1080,c_fit,dpr_1.0,e_sharpen:200,q_auto:best,f_auto/v1759612035/Default_Fullbody_portrait_of_IsabellaV2_wearing_a_luxurious_go_0_fdabba15-5365-4f04-ab3b-b9079666cdc6_0_shq4b3.png'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create D-ID stream');
      }

      console.log('✅ D-ID stream data received:', data);

      // Setup WebRTC peer connection
      const pc = new RTCPeerConnection({
        iceServers: data.ice_servers || [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });

      peerConnectionRef.current = pc;

      // Create video element
      const video = document.createElement('video');
      video.autoplay = true;
      video.playsInline = true;
      video.muted = false;
      video.style.position = 'absolute';
      video.style.top = '0';
      video.style.left = '0';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.style.opacity = '0';
      video.style.transition = 'opacity 0.3s ease-in-out';
      video.style.zIndex = '20';

      videoRef.current = video;
      containerRef.current.appendChild(video);

      // Handle incoming media track
      pc.ontrack = (event) => {
        console.log('🎥 Received media track');
        if (event.streams && event.streams[0]) {
          video.srcObject = event.streams[0];
          video.style.opacity = '1';
          setIsLoading(false);
          setIsStreaming(true);
          onStreamStart?.();
          console.log('▶️ Video stream connected');
        }
      };

      // Set remote description from D-ID offer
      if (data.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        console.log('✅ Remote description set');

        // Create answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log('✅ Local description (answer) set');

        // Send answer back to D-ID via WebSocket if provided
        if (data.stream_url) {
          const ws = new WebSocket(data.stream_url);
          ws.onopen = () => {
            console.log('🔌 WebSocket connected to D-ID');
            ws.send(JSON.stringify({
              type: 'answer',
              sdp: answer.sdp
            }));
          };
          ws.onerror = (err) => {
            console.error('❌ WebSocket error:', err);
          };
          ws.onclose = () => {
            console.log('🔌 WebSocket closed');
          };
        }
      }

      // Handle video end
      video.onended = () => {
        console.log('🏁 Video ended');
        setIsStreaming(false);
        onStreamEnd?.();
        video.style.opacity = '0';
        
        setTimeout(async () => {
          video.remove();
          videoRef.current = null;
          pc.close();
          peerConnectionRef.current = null;

          // Play queued utterance
          if (pendingTextRef.current) {
            const next = pendingTextRef.current;
            pendingTextRef.current = null;
            console.log('➡️ Playing queued utterance');
            await speak(next, imageUrl);
          }
        }, 300);
      };

      video.onerror = (e) => {
        console.error('❌ Video error:', e);
        setIsStreaming(false);
        setIsLoading(false);
        onError?.(new Error('Video playback failed'));
      };

    } catch (error) {
      console.error('❌ D-ID speak error:', error);
      setIsStreaming(false);
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
