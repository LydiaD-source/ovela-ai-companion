import { useRef, useState, useCallback } from 'react';
import { heygenClient } from '@/services/heygen';

interface UseHeyGenAvatarStreamOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  onStreamStart?: () => void;
  onStreamEnd?: () => void;
  onError?: (error: Error) => void;
}

export const useHeyGenAvatarStream = (options: UseHeyGenAvatarStreamOptions) => {
  const { containerRef, onStreamStart, onStreamEnd, onError } = options;
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const cleanup = useCallback(async () => {
    console.log('🧹 HeyGen cleanup started');
    
    if (sessionIdRef.current) {
      try {
        await heygenClient.stopSession(sessionIdRef.current);
        console.log('✅ HeyGen session stopped');
      } catch (err) {
        console.error('❌ Error stopping HeyGen session:', err);
      }
      sessionIdRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      console.log('✅ WebRTC connection closed');
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.remove();
      videoRef.current = null;
      console.log('✅ Video element removed');
    }

    setIsStreaming(false);
    setIsLoading(false);
    onStreamEnd?.();
  }, [onStreamEnd]);

  const speak = useCallback(async (text: string) => {
    try {
      console.log('🎙️ HeyGen speak request:', text.substring(0, 50));

      // If we already have an active session, just send the text
      if (sessionIdRef.current && isStreaming) {
        console.log('♻️ Reusing existing HeyGen session:', sessionIdRef.current);
        await heygenClient.sendTask(sessionIdRef.current, text);
        return;
      }

      // Start new session
      setIsLoading(true);
      console.log('🚀 Creating new HeyGen session with Isabella voice (ElevenLabs t0IcnDolatli2xhqgLgn)...');

      // Create streaming session with Isabella V3 avatar and ElevenLabs voice
      const avatarOverride = new URLSearchParams(window.location.search).get('heygenAvatar');
      const chosenAvatar = avatarOverride || '017021724d054084998f375522ab90d3';
      // Get session token for LiveKit (v2)
      const sessionToken = await heygenClient.createSessionToken();
      const session = await heygenClient.createStreamingSession(
        chosenAvatar,
        't0IcnDolatli2xhqgLgn', // Isabella's voice ID
        sessionToken
      );
      sessionIdRef.current = session.sessionId;
      console.log('✅ HeyGen session created:', session.sessionId);
      console.log('📊 Session details:', {
        hasSDO: !!session.sdp,
        iceServersCount: session.iceServers?.length || 0
      });

      // Verify we have a valid SDP offer
      if (!session.sdp) {
        throw new Error('No SDP offer received from HeyGen');
      }

      // Set up WebRTC peer connection
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: session.iceServers
      });

      // Handle incoming video track
      peerConnectionRef.current.ontrack = (event) => {
        console.log('📹 Received video track from HeyGen');
        
        if (!containerRef.current) {
          console.error('❌ Container ref not available');
          return;
        }

        // Create or reuse video element
        if (!videoRef.current) {
          videoRef.current = document.createElement('video');
          videoRef.current.autoplay = true;
          videoRef.current.playsInline = true;
          videoRef.current.style.width = '100%';
          videoRef.current.style.height = '100%';
          videoRef.current.style.objectFit = 'cover';
          containerRef.current.appendChild(videoRef.current);
        }

        if (event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          videoRef.current.play().catch(err => {
            console.error('❌ Video play error:', err);
          });
          
          setIsLoading(false);
          setIsStreaming(true);
          onStreamStart?.();
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = async (event) => {
        if (event.candidate && sessionIdRef.current) {
          await heygenClient.sendICE(sessionIdRef.current, event.candidate);
        }
      };

      // Set remote description (offer from HeyGen)
      await peerConnectionRef.current.setRemoteDescription({
        type: 'offer',
        sdp: session.sdp
      });

      // Create answer
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      // Start session with our SDP answer
      if (answer.sdp) {
        await heygenClient.startSession(session.sessionId, answer.sdp);
        console.log('✅ HeyGen WebRTC connection established');
      }

      // Send the text to speak
      await heygenClient.sendTask(session.sessionId, text);
      console.log('✅ Text sent to HeyGen for speech');

    } catch (error) {
      console.error('❌ HeyGen speak error:', error);
      console.error('Error details:', error instanceof Error ? error.message : JSON.stringify(error));
      await cleanup();
      onError?.(error instanceof Error ? error : new Error('Unknown HeyGen error'));
    }
  }, [containerRef, isStreaming, cleanup, onStreamStart, onError]);

  return {
    speak,
    isStreaming,
    isLoading,
    cleanup
  };
};
