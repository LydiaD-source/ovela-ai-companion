import React from 'react';
import { ArrowRight } from 'lucide-react';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { useSEO } from '@/hooks/useSEO';
import { useTranslation } from 'react-i18next';

const PartnerWithUs = () => {
  const { t } = useTranslation();
  useSEO({
    path: '/partner',
    title: t('seo.partner.title', 'Partner With Isabella | AI Model Ambassador Collaborations'),
    description: t('seo.partner.description', 'Collaborate with Ovela and Isabella, the world\'s first interactive AI Model Ambassador. Brand partnerships, licensing, and custom creations for your campaigns.')
  });

  const scrollToChat = () => {
    window.location.href = '/?chat=open';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A0A1C 0%, #1A1A2E 100%)' }}>
      {/* Hero Banner */}
      <section
        className="relative"
        style={{
          paddingTop: '120px',
          paddingBottom: '80px',
          background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.1) 0%, transparent 70%)'
        }}
      >
        <div className="container-custom text-center">
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '42px',
              fontWeight: 'bold',
              color: '#D4AF37',
              marginBottom: '24px'
            }}
          >
            Collaborate With Ovela
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              color: '#EDEDED',
              maxWidth: '900px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}
          >
            Bring your brand to life with Isabella, the world's first interactive AI Model Ambassador. From campaigns to product launches, she connects with audiences in ways traditional models can't.
          </p>
        </div>
      </section>

      {/* Gradient Divider */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)',
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
          margin: '0 auto',
          width: '80%'
        }}
      />

      {/* Collaboration Options */}
      <section style={{ padding: '100px 0' }}>
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: 'Brand Partnerships',
                description: 'Work with Isabella to create high-impact brand campaigns, social media activations, and digital storytelling that feels alive.'
              },
              {
                title: 'Licensing Isabella',
                description: 'Integrate Isabella into your projects as a digital ambassador — available for photoshoots, commercials, and interactive events.'
              },
              {
                title: 'Custom Creations',
                description: 'Go beyond the ordinary. From custom personas to unique video campaigns, Isabella adapts to your vision.'
              }
            ].map((card, idx) => (
              <div
                key={idx}
                className="group"
                style={{
                  background: 'rgba(26, 26, 46, 0.6)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '16px',
                  padding: '40px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#D4AF37',
                    marginBottom: '16px'
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '18px',
                    color: '#EDEDED',
                    lineHeight: '1.6'
                  }}
                >
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gradient Divider */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)',
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
          margin: '0 auto',
          width: '80%'
        }}
      />

      {/* Why Collaborate Section */}
      <section
        className="relative"
        style={{
          padding: '100px 0',
          backgroundImage: 'url(https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=1200)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10, 10, 28, 0.85)'
          }}
        />
        <div className="container-custom relative z-10 text-center">
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#D4AF37',
              marginBottom: '32px'
            }}
          >
            Why Partner With Isabella?
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              color: '#EDEDED',
              maxWidth: '900px',
              margin: '0 auto',
              lineHeight: '1.7'
            }}
          >
            Unlike traditional models, Isabella doesn't just appear — she interacts. She learns about your audience, adapts to your brand's voice, and engages clients directly. Ovela Interactive redefines marketing by combining the artistry of modeling with the intelligence of AI.
          </p>
        </div>
      </section>

      {/* Gradient Divider */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)',
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
          margin: '0 auto',
          width: '80%'
        }}
      />

      {/* Call to Action Section */}
      <section style={{ padding: '120px 0', textAlign: 'center' }}>
        <div className="container-custom">
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#D4AF37',
              marginBottom: '24px'
            }}
          >
            Let's Build the Future of Marketing Together
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              color: '#EDEDED',
              marginBottom: '40px',
              maxWidth: '800px',
              margin: '0 auto 40px auto'
            }}
          >
            Share your project idea with Isabella — she'll guide you through possibilities and next steps.
          </p>
          <button
            onClick={scrollToChat}
            className="group"
            style={{
              padding: '16px 48px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)',
              border: 'none',
              color: '#000000',
              fontFamily: "'Inter', sans-serif",
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
              transition: 'all 0.3s ease',
              marginBottom: '24px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(212, 175, 55, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.4)';
            }}
          >
            Start Chatting With Isabella
            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <div>
            <a
              href="/partner"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                color: '#D4AF37',
                textDecoration: 'none',
                borderBottom: '1px solid transparent',
                transition: 'border-bottom 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderBottom = '1px solid #D4AF37';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderBottom = '1px solid transparent';
              }}
            >
              Or contact us directly →
            </a>
          </div>
        </div>
      </section>

      <FooterMinimal />
    </div>
  );
};

export default PartnerWithUs;
