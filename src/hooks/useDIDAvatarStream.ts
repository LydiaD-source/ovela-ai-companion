import { useState, useRef, useEffect } from 'react';
import { didService } from '@/services/did/didService';

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
  const currentTalkId = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = async () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
      videoRef.current.remove();
      videoRef.current = null;
    }
    
    setIsStreaming(false);
    setIsLoading(false);
    
    if (currentTalkId.current) {
      try {
        await didService.deleteTalk(currentTalkId.current);
      } catch (error) {
        console.error('Error cleaning up D-ID talk:', error);
      }
      currentTalkId.current = null;
    }
    
    didService.stopPolling();
  };

  const speak = async (text: string) => {
    console.log('🎤 useDIDAvatarStream.speak called with text:', text?.substring(0, 50));
    console.log('🎤 Current state - isLoading:', isLoading, 'isStreaming:', isStreaming);
    
    if (!text || isLoading || isStreaming) {
      console.log('⏭️ Skipping speak - already processing or empty text');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🎬 Starting D-ID avatar speech:', text.substring(0, 50));

      // Create talk stream
      const talkResponse = await didService.createTalkStream({
        script: text,
        voice_id: '9BWtsMINqrJLrRacOk9x', // ElevenLabs Aria
        stability: 0.5,
        similarity_boost: 0.75,
      });

      currentTalkId.current = talkResponse.id;
      console.log('✅ Talk created, polling for completion...');

      // Poll for completion
      const videoUrl = await didService.pollForCompletion(
        talkResponse.id,
        (status) => {
          console.log(`🔄 D-ID status: ${status}`);
        }
      );

      console.log('🎥 Video ready:', videoUrl);

      // Create and play video element
      if (!containerRef.current) {
        throw new Error('Container ref not available');
      }

      // Remove existing video if any
      if (videoRef.current) {
        videoRef.current.remove();
      }

      // Create new video element
      const video = document.createElement('video');
      video.src = videoUrl;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = false; // Audio enabled - D-ID handles both video and audio
      video.controls = false;
      video.crossOrigin = 'anonymous';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.style.position = 'absolute';
      video.style.top = '0';
      video.style.left = '0';
      video.style.zIndex = '100'; // Higher z-index to ensure visibility
      video.style.opacity = '1';
      video.style.pointerEvents = 'auto';
      
      console.log('🎥 Video element created:', {
        src: videoUrl,
        width: video.style.width,
        height: video.style.height,
        zIndex: video.style.zIndex
      });

      // Event listeners
      video.onloadeddata = () => {
        console.log('🎥 Video loaded, ready to play');
        setIsLoading(false);
        setIsStreaming(true);
        onStreamStart?.();
      };

      video.onended = () => {
        console.log('🎥 Video playback ended');
        setIsStreaming(false);
        onStreamEnd?.();
        // Hide video after playback
        video.style.opacity = '0';
        setTimeout(() => {
          video.remove();
          videoRef.current = null;
        }, 500);
      };

      video.onerror = (e) => {
        console.error('❌ Video playback error:', e);
        setIsLoading(false);
        setIsStreaming(false);
        const error = new Error('Video playback failed');
        onError?.(error);
      };

      // Append to container
      containerRef.current.appendChild(video);
      videoRef.current = video;

      // Attempt to play (handle autoplay restrictions)
      try {
        await video.play();
        console.log('▶️ Video playback started');
      } catch (playError) {
        console.error('❌ Autoplay blocked:', playError);
        // User interaction may be required
        setIsLoading(false);
        setIsStreaming(false);
      }

    } catch (error) {
      console.error('❌ D-ID speak error:', error);
      setIsLoading(false);
      setIsStreaming(false);
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
