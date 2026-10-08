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
          Ovela Interactive is a digital AI solutions company. Our digital employees help your business communicate around the clock. Our Digital Cards help your people stay connected after every meeting.
          <br /><br />
          We also build the intelligence behind IIPE — International Intelligent Property Exchange, an independent property ecosystem. Together, our solutions connect businesses with people before, during and after the conversation.
        </p>
      </div>
    </section>
  );
};
