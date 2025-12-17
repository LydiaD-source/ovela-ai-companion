import React from 'react';
import { useTranslation } from 'react-i18next';

interface CTASectionProps {
  onChatClick: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onChatClick }) => {
  const { t } = useTranslation();

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
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => onChatClick(), 800);
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
    </section>
  );
};
