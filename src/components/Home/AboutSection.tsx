import React from 'react';
import { useTranslation } from 'react-i18next';

export const AboutSection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="w-full h-screen flex flex-col md:flex-row">
      {/* Left: Image */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden">
        <img
          src="https://res.cloudinary.com/di5gj4nyp/image/upload/v1759499223/Flux_Dev_Use_Character_Element_IsabellaV2Focus_full_body_elega_3_asxnlz.jpg"
          alt="Isabella Navia - AI Model"
          className="w-full h-full object-cover object-center"
          style={{ 
            objectPosition: 'center 20%'
          }}
        />
      </div>

      {/* Right: Text */}
      <div
        className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center px-8 md:px-20"
        style={{
          background: 'linear-gradient(180deg, #0D0D1A 0%, #000000 100%)'
        }}
      >
        <div className="max-w-xl">
          <h2
            className="font-playfair text-3xl md:text-4xl mb-6"
            style={{
              fontFamily: 'Playfair Display, serif',
              color: '#E8CFA9'
            }}
          >
            {t('about.title')}
          </h2>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 300,
              color: '#F5F5F5'
            }}
          >
            {t('about.description')}
          </p>
        </div>
      </div>
    </section>
  );
};
