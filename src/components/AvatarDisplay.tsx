import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AvatarDisplayProps {
  avatarUrl: string;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
}

const sizeClasses = {
  small: 'w-16 h-16',
  medium: 'w-32 h-32',
  large: 'w-48 h-48',
  full: 'w-full h-full',
};

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatarUrl,
  className,
  size = 'medium',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    // Expose video ref globally for StreamingService
    if (videoRef.current) {
      (window as any).__AVATAR_VIDEO_REF__ = videoRef.current;
      console.log('📹 Video ref exposed globally');
    }

    return () => {
      (window as any).__AVATAR_VIDEO_REF__ = null;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlaying = () => {
      // Only show video if it has valid video tracks
      const stream = video.srcObject as MediaStream | null;
      if (stream) {
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0 && videoTracks[0].readyState === 'live') {
          console.log('📹 Video playing with live track');
          setIsVideoPlaying(true);
        }
      } else if (video.src) {
        // For fallback clip videos
        setIsVideoPlaying(true);
      }
    };

    const handlePause = () => {
      setIsVideoPlaying(false);
    };

    const handleEnded = () => {
      setIsVideoPlaying(false);
    };

    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className={cn('relative overflow-hidden rounded-full', sizeClasses[size], className)}>
      {/* Avatar image - ALWAYS visible at zIndex 0 */}
      <img
        src={avatarUrl}
        alt="AI Avatar"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* Video element - ALWAYS mounted, opacity controlled */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        style={{
          zIndex: 1,
          opacity: isVideoPlaying ? 1 : 0,
        }}
      />
    </div>
  );
};

export default AvatarDisplay;
