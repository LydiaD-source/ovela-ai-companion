
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
  // Check if it's a Google Drive URL and handle accordingly
  const isGoogleDriveEmbed = src.includes('drive.google.com') && src.includes('/preview');
  
  if (isGoogleDriveEmbed) {
    // For Google Drive embeds, we need to use iframe with proper responsive container
    return (
      <div className={cn("relative w-full", className)}>
        <div className="aspect-video w-full">
          <iframe
            className="w-full h-full rounded-lg"
            src={src}
            title={title || "Isabella AI Introduction – Ovela Interactive"}
            aria-label={description || "Video of Isabella, the world's first AI companion, introducing Ovela Interactive"}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            style={{ border: 'none' }}
          />
        </div>
      </div>
    );
  }

  // Original video element for direct video files
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
