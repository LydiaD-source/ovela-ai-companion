import React from 'react';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { Separator } from '@/components/ui/separator';
import { useCanonicalLink } from '@/hooks/useCanonicalLink';

const About = () => {
  useCanonicalLink('/about');
  return (
    <div className="min-h-screen">
      {/* Hero Intro Block */}
      <section className="w-full min-h-screen flex items-center" style={{
        background: 'linear-gradient(180deg, #0A0A23 0%, #1a1a3e 100%)'
      }}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="order-2 lg:order-1">
              <h1 className="font-playfair text-5xl lg:text-6xl mb-6" style={{ color: '#D4AF37' }}>
                Where Interactive Modeling Began
              </h1>
              <h3 className="font-playfair text-2xl lg:text-3xl leading-relaxed" style={{ color: '#FFFFFF', fontWeight: 300 }}>
                Ovela is redefining modeling through AI — but the journey began with a vision to connect people in a more human way.
              </h3>
            </div>

            {/* Right: Isabella Portrait */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <img
                  src="https://res.cloudinary.com/di5gj4nyp/image/upload/v1759515522/Flux_Dev_Fullbody_portrait_of_IsabellaV2_head_to_feet_visible__0_er2yhj.jpg"
                  alt="Isabella - Interactive AI Model"
                  className="w-full h-auto rounded-lg"
                  style={{
                    boxShadow: '0 0 40px rgba(212, 175, 55, 0.3)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Golden Divider */}
      <div className="w-full flex justify-center py-1" style={{ background: '#FFFFFF' }}>
        <div className="w-32 h-px" style={{
          background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)'
        }} />
      </div>

      {/* Our Story Section */}
      <section className="w-full py-24" style={{ background: '#FFFFFF' }}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <h2 className="font-playfair text-4xl lg:text-5xl mb-8" style={{ color: '#0A0A23' }}>
                The Birth of Ovela
              </h2>
              <p className="text-lg leading-relaxed" style={{ 
                fontFamily: 'Inter, sans-serif',
                color: '#2a2a2a',
                fontWeight: 300
              }}>
                Ovela was founded on the belief that models should do more than represent — they should interact. By blending luxury fashion aesthetics with advanced AI, Ovela created Isabella, the world's first interactive model ambassador. Our goal has always been to humanize technology and empower brands to tell their stories in a way that feels alive, engaging, and unforgettable.
              </p>
            </div>

            {/* Right: Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <img
                  src="/lovable-uploads/isabella-appearance-settings.png"
                  alt="WellnessGeni App with Isabella"
                  className="w-full h-auto rounded-lg"
                  style={{
                    boxShadow: '0 10px 40px rgba(212, 175, 55, 0.2)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Golden Divider */}
      <div className="w-full flex justify-center py-1" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #0A0A23 100%)' }}>
        <div className="w-32 h-px" style={{
          background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)'
        }} />
      </div>

      {/* WellnessGeni Spotlight Section */}
      <section className="w-full py-24" style={{
        background: 'linear-gradient(180deg, #0A0A23 0%, #1a1a3e 100%)'
      }}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Media */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-full max-w-md">
                <img
                  src="/images/isabella-wellnessgeni-yoga.jpg"
                  alt="Isabella in WellnessGeni"
                  className="w-full h-auto rounded-lg"
                  style={{
                    boxShadow: '0 0 40px rgba(212, 175, 55, 0.3)'
                  }}
                />
              </div>
            </div>

            {/* Right: Text */}
            <div>
              <h2 className="font-playfair text-4xl lg:text-5xl mb-8" style={{ color: '#D4AF37' }}>
                From WellnessGeni to Ovela
              </h2>
              <p className="text-lg leading-relaxed mb-8" style={{ 
                fontFamily: 'Inter, sans-serif',
                color: '#FFFFFF',
                fontWeight: 300
              }}>
                Before Ovela, there was WellnessGeni — the interactive app where Isabella first appeared as a wellness coach, motivator, and companion. She encouraged people to train, stay positive, and feel supported in their daily lives. It was here that we saw the true potential of an AI model who could connect deeply with people, not just represent products.
              </p>
              
              {/* Quote */}
              <blockquote className="font-playfair text-xl italic pl-6 border-l-2" style={{ 
                color: '#D4AF37',
                borderColor: '#D4AF37'
              }}>
                "Isabella started as a guide for wellness and encouragement — and became the world's first interactive AI model ambassador."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Golden Divider */}
      <div className="w-full flex justify-center py-1" style={{ background: 'linear-gradient(180deg, #1a1a3e 0%, #FFFFFF 100%)' }}>
        <div className="w-32 h-px" style={{
          background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)'
        }} />
      </div>

      {/* Vision for the Future Section */}
      <section className="w-full py-24" style={{ background: '#FFFFFF' }}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-playfair text-4xl lg:text-5xl mb-8" style={{ color: '#0A0A23' }}>
              Shaping Tomorrow
            </h2>
            <p className="text-lg leading-relaxed" style={{ 
              fontFamily: 'Inter, sans-serif',
              color: '#2a2a2a',
              fontWeight: 300
            }}>
              Today, Ovela carries the spirit of WellnessGeni into every project. From personal companionship to brand storytelling, Isabella is leading a new era of interactive modeling and marketing. With Ovela, the future isn't just about watching — it's about engaging.
            </p>
          </div>
        </div>
      </section>

      <FooterMinimal />
    </div>
  );
};

export default About;
