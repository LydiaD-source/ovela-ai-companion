import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VideoWithSoundProps {
  src: string;
  className?: string;
  poster?: string;
  /** When 'contain', the toggle button anchors to the visible video bounds, not the container. */
  fit?: 'cover' | 'contain';
}

export const VideoWithSound: React.FC<VideoWithSoundProps> = ({ src, className, poster, fit = 'cover' }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [aspect, setAspect] = useState<number | null>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (fit !== 'contain') return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setBox({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, [fit]);

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

  const button = (
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
  );

  const videoEl = (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      onLoadedMetadata={(e) => {
        const v = e.currentTarget;
        if (v.videoWidth && v.videoHeight) setAspect(v.videoWidth / v.videoHeight);
      }}
      className={className}
    />
  );

  if (fit === 'contain') {
    let innerW = '100%';
    let innerH = '100%';
    if (aspect && box && box.w > 0 && box.h > 0) {
      const containerAspect = box.w / box.h;
      if (aspect > containerAspect) {
        innerW = `${box.w}px`;
        innerH = `${box.w / aspect}px`;
      } else {
        innerH = `${box.h}px`;
        innerW = `${box.h * aspect}px`;
      }
    }
    return (
      <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
        <div className="relative" style={{ width: innerW, height: innerH }}>
          {videoEl}
          {button}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {videoEl}
      {button}
    </div>
  );
};
