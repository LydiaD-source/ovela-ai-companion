
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
    // For Google Drive embeds, we need to use iframe
    const embedUrl = `${src}${autoplay ? '&autoplay=1' : ''}${loop ? '&loop=1' : ''}${muted ? '&mute=1' : ''}`;
    
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <iframe
          className="w-full h-full object-cover"
          src={embedUrl}
          title={title}
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ border: 'none' }}
          loading="lazy"
        />
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
        loading="lazy"
      >
        <source src={src} type="video/mp4" />
        <source src={src.replace('.mp4', '.webm')} type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
