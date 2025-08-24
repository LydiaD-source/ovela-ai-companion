
import React from 'react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  poster?: string;
  title?: string;
  description?: string;
}

const VideoPlayer = ({ 
  src, 
  className, 
  autoplay = false, 
  loop = false, 
  muted = true, 
  controls = false,
  poster,
  title,
  description 
}: VideoPlayerProps) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <video
        className="w-full h-full object-cover"
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline
        poster={poster}
        title={title}
        aria-label={description}
      >
        <source src={src} type="video/mp4" />
        <source src={src.replace('.mp4', '.webm')} type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
