import React, { useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VideoWithSoundProps {
  src: string;
  className?: string;
  poster?: string;
}

export const VideoWithSound: React.FC<VideoWithSoundProps> = ({ src, className, poster }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    if (!next) {
      v.volume = 1;
      v.play().catch(() => {});
    }
    setMuted(next);
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={ref}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        className={className}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={muted ? 'Unmute video' : 'Mute video'}
        className="absolute bottom-4 right-4 z-10 flex items-center justify-center w-11 h-11 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110"
        style={{
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(232,207,169,0.5)',
          color: '#E8CFA9',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
};
