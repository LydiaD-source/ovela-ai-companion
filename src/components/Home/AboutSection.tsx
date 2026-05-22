import React from 'react';
import { useTranslation } from 'react-i18next';
import { VideoWithSound } from './VideoWithSound';

interface AboutSectionProps {
  onChatClick?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onChatClick }) => {
  const { t } = useTranslation();

  const bullets = t('digitalTeam.bullets', { returnObjects: true }) as string[];

  return (
    <section className="w-full min-h-screen flex flex-col md:flex-row">
      {/* Left: Video */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-auto md:min-h-screen relative overflow-hidden bg-black">
        <VideoWithSound
          src="https://res.cloudinary.com/di5gj4nyp/video/upload/v1779378255/MONDAY_18_SHORT_copie_p4ynhb.mp4"
          className="w-full h-full object-contain"
          fit="contain"
        />
      </div>

      {/* Right: Text */}
      <div
        className="w-full md:w-1/2 flex items-center justify-center px-8 md:px-20 py-16 md:py-24"
        style={{
          background: 'linear-gradient(180deg, #0D0D1A 0%, #000000 100%)'
        }}
      >
        <div className="max-w-xl">
          <p
            className="text-xs md:text-sm tracking-[0.3em] uppercase mb-4"
            style={{ fontFamily: 'Inter, sans-serif', color: '#E8CFA9', opacity: 0.85 }}
          >
            {t('digitalTeam.eyebrow')}
          </p>
          <h2
            className="font-playfair text-3xl md:text-4xl mb-6"
            style={{ fontFamily: 'Playfair Display, serif', color: '#E8CFA9' }}
          >
            {t('digitalTeam.title')}
          </h2>
          <p
            className="text-base md:text-lg leading-relaxed mb-3"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, color: '#F5F5F5' }}
          >
            {t('digitalTeam.notChatbots')}<br />
            {t('digitalTeam.notInfluencers')}
          </p>
          <p
            className="text-base md:text-lg leading-relaxed mb-6"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, color: '#F5F5F5' }}
          >
            {t('digitalTeam.description')}
          </p>

          <ul className="mb-8 space-y-2">
            {Array.isArray(bullets) && bullets.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm md:text-base"
                style={{ fontFamily: 'Inter, sans-serif', color: '#F5F5F5', fontWeight: 300 }}
              >
                <span style={{ color: '#E8CFA9' }}>✦</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onChatClick}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full transition-all duration-300 hover:opacity-90"
              style={{
                fontFamily: 'Inter, sans-serif',
                background: 'linear-gradient(135deg, #E8CFA9 0%, #C9A84C 100%)',
                color: '#0D0D1A',
                fontSize: '14px',
                letterSpacing: '0.05em',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              → {t('digitalTeam.ctaBuild')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
