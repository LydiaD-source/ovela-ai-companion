import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { trackIsabellaClick } from '@/lib/analytics';

interface CTASectionProps {
  onChatClick: () => void;
}

const VIDEO_URL = 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1779818677/VIDEO_CONCEPT_OVELA_qvhyct.mp4';

export const CTASection: React.FC<CTASectionProps> = ({ onChatClick }) => {
  const { t } = useTranslation();
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [showVideo]);

  const handleClose = () => {
    setShowVideo(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <section
      className="w-full py-24 md:py-32 flex items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #0D0D1A 0%, #000000 100%)'
      }}
    >
      <div className="text-center px-4 max-w-3xl">
        <h2
          className="font-playfair text-3xl md:text-5xl mb-6"
          style={{
            fontFamily: 'Playfair Display, serif',
            color: '#E8CFA9'
          }}
        >
          {t('cta.title')}
        </h2>
        <p
          className="text-lg md:text-xl mb-10 leading-relaxed"
          style={{
            fontFamily: 'Inter, sans-serif',
            color: '#FFFFFF'
          }}
        >
          {t('cta.description')}
        </p>

        <div className="flex justify-center items-center">
          <button
            onClick={() => {
              trackIsabellaClick('cta_section');
              setShowVideo(true);
            }}
            className="transition-all duration-300 hover:scale-105"
            style={{
              padding: '14px 32px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)',
              border: 'none',
              color: '#000000',
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)'
            }}
          >
            {t('cta.button')}
          </button>
        </div>
      </div>

      {showVideo && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={handleClose}
        >
          <button
            onClick={handleClose}
            aria-label="Close video"
            className="absolute top-6 right-6 flex items-center justify-center w-12 h-12 rounded-full transition-all hover:scale-110"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(232,207,169,0.5)',
              color: '#E8CFA9',
            }}
          >
            <X size={22} />
          </button>
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
            style={{ aspectRatio: '16 / 9' }}
          >
            <video
              ref={videoRef}
              src={VIDEO_URL}
              controls
              autoPlay
              playsInline
              className="w-full h-full rounded-xl"
              style={{ boxShadow: '0 20px 60px rgba(212,175,55,0.25)' }}
              onEnded={() => {
                handleClose();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => onChatClick(), 600);
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
};
