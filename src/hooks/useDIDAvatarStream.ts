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
      
      // Step 1: Create talk stream
      console.log('🎬 Step 1: Creating D-ID talk stream...');
      const { data: streamData, error: streamError } = await supabase.functions.invoke('did-streaming', {
        body: {
          action: 'create_talk_stream',
          data: {
            source_url: imageUrl || 'https://res.cloudinary.com/di5gj4nyp/image/upload/w_1920,h_1080,c_fit,dpr_1.0,e_sharpen:200,q_auto:best,f_auto/v1759612035/Default_Fullbody_portrait_of_IsabellaV2_wearing_a_luxurious_go_0_fdabba15-5365-4f04-ab3b-b9079666cdc6_0_shq4b3.png'
          }
        }
      });

      if (streamError || !streamData) {
        throw new Error(streamError?.message || 'Failed to create stream');
      }

      const { id: streamId, offer, ice_servers, session_id } = streamData;
      streamIdRef.current = streamId;
      sessionIdRef.current = session_id;
      
      console.log('✅ Stream created:', streamId);

      // Step 2: Setup WebRTC
      console.log('🎬 Step 2: Setting up WebRTC...');
      const pc = new RTCPeerConnection({
        iceServers: ice_servers || [{ urls: 'stun:stun.l.google.com:19302' }]
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

      // Handle incoming track
      pc.ontrack = (event) => {
        console.log('🎥 Received media track');
        if (event.streams && event.streams[0]) {
          video.srcObject = event.streams[0];
          video.style.opacity = '1';
          setIsLoading(false);
          setIsStreaming(true);
          onStreamStart?.();
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          console.log('📡 Sending ICE candidate');
          await supabase.functions.invoke('did-streaming', {
            body: {
              action: 'talk_stream_ice',
              data: {
                stream_id: streamId,
                session_id: session_id,
                candidate: event.candidate.candidate,
                sdpMid: event.candidate.sdpMid,
                sdpMLineIndex: event.candidate.sdpMLineIndex
              }
            }
          });
        }
      };

      // Set remote description
      await pc.setRemoteDescription(offer);
      console.log('✅ Remote description set');

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('✅ Local description set');

      // Step 3: Send SDP answer
      console.log('🎬 Step 3: Sending SDP answer...');
      await supabase.functions.invoke('did-streaming', {
        body: {
          action: 'talk_stream_sdp',
          data: {
            stream_id: streamId,
            session_id: session_id,
            answer: answer
          }
        }
      });
      console.log('✅ SDP answer sent');

      // Step 4: Send text to animate
      console.log('🎬 Step 4: Sending text to animate...');
      await supabase.functions.invoke('did-streaming', {
        body: {
          action: 'talk_stream_speak',
          data: {
            stream_id: streamId,
            session_id: session_id,
            text: text
          }
        }
      });
      console.log('✅ Animation started');

      // Handle video end
      video.onended = () => {
        console.log('🏁 Video ended');
        setIsStreaming(false);
        onStreamEnd?.();
        video.style.opacity = '0';
        
        setTimeout(async () => {
          await cleanup();

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
