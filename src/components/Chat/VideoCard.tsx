import React, { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import type { VideoItem } from '@/config/videoCatalog';

interface VideoCardProps {
  video: VideoItem;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [expanded, setExpanded] = useState(false);

  const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;

  if (expanded) {
    return (
      <div className="rounded-lg overflow-hidden border border-champagne-gold/30 bg-soft-white/5 w-full max-w-[320px]">
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full"
            style={{ border: 'none' }}
          />
        </div>
        <div className="p-2 flex items-center justify-between">
          <p className="text-xs text-soft-white/80 line-clamp-1 flex-1">{video.title}</p>
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-champagne-gold hover:text-champagne-gold/80"
            title="Open on YouTube"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setExpanded(true)}
      className="group relative rounded-lg overflow-hidden border border-soft-white/20 hover:border-champagne-gold/50 transition-all w-full max-w-[320px] text-left bg-soft-white/5"
    >
      <div className="relative aspect-video w-full">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
          <div className="w-10 h-10 rounded-full bg-champagne-gold/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-charcoal fill-charcoal" />
          </div>
        </div>
      </div>
      <div className="p-2">
        <p className="text-xs text-soft-white/80 line-clamp-2">{video.title}</p>
      </div>
    </button>
  );
};

export default VideoCard;
