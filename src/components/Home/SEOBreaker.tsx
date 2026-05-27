import React from 'react';

export const SEOBreaker: React.FC = () => {
  return (
    <section
      className="w-full py-12 md:py-16"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0A0E27 50%, #000000 100%)',
      }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p
          className="text-sm md:text-base leading-relaxed"
          style={{
            fontFamily: 'Inter, sans-serif',
            color: '#A0A0A0',
            lineHeight: '1.8',
          }}
        >
          Ovela creates AI digital employees designed to communicate with visitors, present services, answer questions, and support businesses around the clock.
          <br /><br />
          Our AI representatives help clinics, real estate agencies, wellness centers, and premium brands automate communication, qualify leads, and convert website traffic into real client interaction.
        </p>
      </div>
    </section>
  );
};
