import React from 'react';

export const AboutSection = () => {
  return (
    <section className="w-full h-screen flex flex-col md:flex-row">
      {/* Left: Image */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden">
        <img
          src="https://res.cloudinary.com/di5gj4nyp/image/upload/v1759415621/Flux_1Dev_Use_Character_Element_IsabellaV2Focus_fullbody_portra_1__6_-removebg-preview_iapmgy.png"
          alt="Isabella Navia - AI Model"
          className="w-full h-full object-cover object-center"
          style={{ objectPosition: 'center 20%' }}
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
            Redefining Modeling Through AI
          </h2>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 300,
              color: '#F5F5F5'
            }}
          >
            Isabella is more than a model — she's an interactive AI ambassador who adapts to your brand, engages your audience in real-time, and scales across infinite campaigns without limitations.
          </p>
        </div>
      </div>
    </section>
  );
};
