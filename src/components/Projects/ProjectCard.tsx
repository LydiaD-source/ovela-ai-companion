import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ExternalLink, Volume2, VolumeX } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  description: string;
  videoSrc: string;
  liveUrl?: string;
  linkLabel?: string;
  comingSoon?: boolean;
}

const ProjectCard = ({ title, description, videoSrc, liveUrl, linkLabel = 'View Project', comingSoon = false }: ProjectCardProps) => {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div
      className="group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: 'linear-gradient(180deg, hsl(var(--deep-navy)), hsl(var(--charcoal)))',
        border: '1px solid hsl(var(--champagne-gold) / 0.2)',
        boxShadow: '0 4px 20px hsl(0 0% 0% / 0.3)',
      }}
    >
      {/* Video */}
      <div className="relative" style={{ aspectRatio: '16/10' }}>
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted={muted}
          playsInline
          loading="lazy"
          onClick={() => setMuted(!muted)}
        />
        <button
          onClick={() => setMuted(!muted)}
          className="absolute bottom-3 right-3 p-2 rounded-full backdrop-blur-sm transition-opacity opacity-70 hover:opacity-100"
          style={{ background: 'hsl(0 0% 0% / 0.5)' }}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            <VolumeX className="w-4 h-4" style={{ color: 'hsl(var(--soft-white))' }} />
          ) : (
            <Volume2 className="w-4 h-4" style={{ color: 'hsl(var(--champagne-gold))' }} />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-6">
        <h3
          className="text-xl font-bold mb-2"
          style={{ fontFamily: 'Playfair Display, serif', color: 'hsl(var(--champagne-gold))' }}
        >
          {title}
        </h3>
        <p
          className="text-sm font-light leading-relaxed mb-5"
          style={{ color: 'hsl(var(--soft-white) / 0.8)' }}
        >
          {description}
        </p>
        {liveUrl && !comingSoon ? (
          <a href={liveUrl} target="_blank" rel="dofollow noopener">
            <Button
              className="w-full py-5 text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'hsl(var(--champagne-gold) / 0.15)',
                color: 'hsl(var(--champagne-gold))',
                border: '1px solid hsl(var(--champagne-gold) / 0.3)',
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {linkLabel}
            </Button>
          </a>
        ) : comingSoon ? (
          <Button
            disabled
            className="w-full py-5 text-sm font-medium opacity-50 cursor-not-allowed"
            style={{
              background: 'hsl(var(--champagne-gold) / 0.08)',
              color: 'hsl(var(--champagne-gold) / 0.5)',
              border: '1px solid hsl(var(--champagne-gold) / 0.15)',
            }}
          >
            Coming Soon
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default ProjectCard;
