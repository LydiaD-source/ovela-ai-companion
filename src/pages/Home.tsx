import React, { useRef, useState } from 'react';
import { useWellnessGeniChat } from '@/hooks/useWellnessGeniChat';
import FullWellnessGeniUI from '@/components/Chat/FullWellnessGeniUI';
import { LookbookCarousel } from '@/components/Home/LookbookCarousel';
import { AboutSection } from '@/components/Home/AboutSection';
import { HowItWorksSection } from '@/components/Home/HowItWorksSection';
import { ShowcaseSection } from '@/components/Home/ShowcaseSection';
import { CTASection } from '@/components/Home/CTASection';
import { FooterMinimal } from '@/components/Home/FooterMinimal';


const Home = () => {
  const isabellaVideoUrl = "https://res.cloudinary.com/di5gj4nyp/video/upload/v1758719713/133adb02-04ab-46f1-a4cf-ed32398f10b3_hsrjzm.mp4";
  const [isChatActive, setIsChatActive] = useState(false);

  const activateChat = () => {
    setIsChatActive(true);
  };

  return (
    <>
      {/* SEO Schema for Isabella's Video */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": "Isabella — The World's First AI Brand Ambassador",
            "description": "10-second introduction to Isabella, Ovela Interactive's AI marketing companion.",
            "thumbnailUrl": `${isabellaVideoUrl}#t=0.5`,
            "uploadDate": new Date().toISOString().split('T')[0],
            "duration": "PT10S",
            "contentUrl": isabellaVideoUrl,
            "embedUrl": isabellaVideoUrl,
            "publisher": {
              "@type": "Organization",
              "name": "Ovela Interactive",
              "logo": {
                "@type": "ImageObject",
                "url": "/favicon.ico"
              }
            }
          })
        }}
      />

      <div>
        {/* Luxury Hero Section */}
        <section className="h-screen w-full relative overflow-hidden">
          {/* Deep Navy to Black Gradient with Champagne Glow */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, #0A0E27 0%, #000000 100%)',
          }}></div>
          
          {/* Champagne/Gold Radial Glow Behind Isabella */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 800px 900px at 25% 50%, rgba(212, 175, 55, 0.15) 0%, transparent 60%)',
            pointerEvents: 'none'
          }}></div>
          
          {/* Main Content Container */}
          <div className="relative w-full h-full flex items-start justify-between">
            
            {/* Left Side - Isabella (Anchor) */}
            <div className="flex items-end h-full" style={{ width: '35%' }}>
              <div className="relative w-full h-full flex items-end justify-center">
                {/* Soft Spotlight/Glow Behind Isabella */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{
                  width: '500px',
                  height: '700px',
                  background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.08) 40%, transparent 70%)',
                  filter: 'blur(60px)',
                  zIndex: 0
                }}></div>
                
                {/* Isabella Image - Native resolution for ultra-sharp zoom */}
                <img 
                  src="/src/assets/isabella-hero-fullbody.png"
                  alt="Isabella Navia - AI Model Ambassador"
                  className="relative object-bottom hero-image-raw"
                  loading="eager"
                  decoding="sync"
                  fetchPriority="high"
                  style={{ 
                    height: '88vh',
                    width: 'auto',
                    maxWidth: '2314px',
                    zIndex: 1,
                    objectFit: 'contain',
                    objectPosition: 'bottom',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'none',
                    msInterpolationMode: 'bicubic'
                  } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Center-Right Area - Tagline & Text */}
            <div 
              className="flex flex-col justify-center h-full"
              style={{ 
                width: '65%',
                paddingLeft: '4%',
                paddingRight: '8%'
              }}
            >
              {/* Content Wrapper - Fades out when chat is active */}
              <div 
                className={`transition-all duration-500 ${isChatActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                style={{ 
                  display: isChatActive ? 'none' : 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  maxWidth: '700px',
                  margin: '0 auto'
                }}
              >
                {/* Headline - Luxury Serif */}
                <h1 
                  style={{ 
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '56px',
                    fontWeight: '700',
                    lineHeight: '1.15',
                    marginBottom: '24px',
                    color: '#FFFFFF'
                  }}
                >
                  The Future of Modeling is{' '}
                  <span style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 50%, #D4AF37 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Interactive
                  </span>
                </h1>
                
                {/* Subheadline - Elegant Sans-Serif */}
                <p style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '23px',
                  fontWeight: '300',
                  lineHeight: '1.5',
                  marginBottom: '40px',
                  maxWidth: '650px',
                  color: '#E5E5E5'
                }}>
                  <span style={{ 
                    color: '#D4AF37',
                    fontWeight: '500'
                  }}>
                    Isabella ✨
                  </span>
                  {' — Ovela\'s first AI model ambassador. Ask about Ovela, book a project, or design your own AI-powered ambassador.'}
                </p>
                
                {/* CTA Section - Reverse Chevron Alignment */}
                <div className="flex flex-col items-center gap-4">
                  {/* Primary CTA Button - 70% of original size */}
                  <button 
                    onClick={activateChat}
                    className="transition-all duration-300"
                    style={{
                      width: '280px',
                      height: '54px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)',
                      border: 'none',
                      color: '#000000',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: '600',
                      letterSpacing: '0.3px',
                      cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4), 0 0 40px rgba(212, 175, 55, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(212, 175, 55, 0.6), 0 0 60px rgba(212, 175, 55, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.4), 0 0 40px rgba(212, 175, 55, 0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Start Chatting with Isabella
                  </button>
                  
                  {/* Secondary CTA - Plain Text Link */}
                  <a 
                    href="#lookbook"
                    className="transition-all duration-300"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#D4AF37',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '15px',
                      fontWeight: '400',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      padding: '8px 0'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#F7E7CE';
                      e.currentTarget.style.textShadow = '0 0 12px rgba(212, 175, 55, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#D4AF37';
                      e.currentTarget.style.textShadow = 'none';
                    }}
                  >
                    ↓ Explore Isabella's Portfolio ↓
                  </a>
                </div>
              </div>

              {/* Chat Box Overlay - Glassmorphism */}
              <div 
                className={`transition-all duration-500 ${isChatActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                style={{ 
                  display: isChatActive ? 'flex' : 'none',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: '100%'
                }}
              >
                <div 
                  className="relative flex flex-col"
                  style={{ 
                    width: '360px',
                    height: '520px',
                    maxWidth: '92vw',
                    maxHeight: '80vh',
                    background: 'rgba(10, 14, 39, 0.85)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    boxShadow: `
                      0 0 60px rgba(212, 175, 55, 0.25),
                      0 30px 60px rgba(0, 0, 0, 0.4),
                      inset 0 0 80px rgba(212, 175, 55, 0.05)
                    `,
                    overflow: 'hidden'
                  }}
                >
                  
                  {/* Chat Component - Full Height */}
                  <div className="w-full h-full pt-2">
                    <FullWellnessGeniUI 
                      isGuestMode={true}
                      defaultPersona="isabella-navia"
                      allowedPersonas={['isabella-navia']}
                      showOnlyPromoter={true}
                    />
                  </div>
                  
                  {/* Close Button - Bottom Right */}
                  <button
                    onClick={() => setIsChatActive(false)}
                    className="absolute bottom-4 right-4 z-50 p-2 rounded-full transition-all duration-200"
                    style={{ 
                      color: '#D4AF37',
                      background: 'rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Magazine-Style Sections Below Hero */}
        <LookbookCarousel />
        <AboutSection />
        <HowItWorksSection />
        <ShowcaseSection />
        <CTASection onChatClick={activateChat} />
        <FooterMinimal />
      </div>
    </>
  );
};

export default Home;
