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
          Ovela Interactive creates AI-powered digital humans that act as interactive hosts for websites, campaigns, and online platforms. Isabella, our AI model ambassador, helps businesses increase engagement, automate customer communication, and convert visitors into clients through real-time interaction.
        </p>
      </div>
    </section>
  );
};
