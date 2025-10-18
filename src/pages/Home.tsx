import React, { useRef, useState, useEffect } from 'react';
import { useWellnessGeniChat } from '@/hooks/useWellnessGeniChat';
import FullWellnessGeniUI from '@/components/Chat/FullWellnessGeniUI';
import { LookbookCarousel } from '@/components/Home/LookbookCarousel';
import { AboutSection } from '@/components/Home/AboutSection';
import { HowItWorksSection } from '@/components/Home/HowItWorksSection';
import { ShowcaseSection } from '@/components/Home/ShowcaseSection';
import { CTASection } from '@/components/Home/CTASection';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { useDIDAvatarStream } from '@/hooks/useDIDAvatarStream';
import '@/styles/HeroSection.css';


const Home = () => {
  console.log('🟢 HOME COMPONENT LOADED');
  const isabellaVideoUrl = "https://res.cloudinary.com/di5gj4nyp/video/upload/v1758719713/133adb02-04ab-46f1-a4cf-ed32398f10b3_hsrjzm.mp4";
  const isabellaHeroImageUrl = "https://res.cloudinary.com/di5gj4nyp/image/upload/v1759836676/golddress_ibt1fp.png";
  const [isChatActive, setIsChatActive] = useState(false);
  const didContainerRef = useRef<HTMLDivElement>(null);
  const [isAvatarReady, setIsAvatarReady] = useState(false);

  // D-ID Avatar Stream Hook
  const { speak: speakDID, isStreaming, isLoading } = useDIDAvatarStream({
    containerRef: didContainerRef,
    onStreamStart: () => {
      console.log('🎬 D-ID stream started');
      setIsAvatarReady(true);
    },
    onStreamEnd: () => {
      console.log('🎬 D-ID stream ended');
    },
    onError: (error) => {
      console.error('❌ D-ID stream error:', error);
    },
  });

  // Check URL parameter to auto-open chat from Contact page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('chat') === 'open') {
      setIsChatActive(true);
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const activateChat = async () => {
    console.log('🟢 ACTIVATE CHAT CLICKED');
    
    // Enable autoplay by playing a silent interaction first (browser policy workaround)
    try {
      const silentAudio = new Audio();
      silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      await silentAudio.play();
      console.log('✅ Audio context unlocked');
    } catch (error) {
      console.log('⚠️ Could not unlock audio context:', error);
    }
    
    setIsChatActive(true);

    // Kick off a short greeting animation to open D-ID stream
    // Keep it short to minimize latency
    try {
      const greeting = "Hello, I'm Isabella. How can I help you today?";
      console.log('🎬 Sending initial greeting to D-ID');
      await speakDID(greeting, isabellaHeroImageUrl);
    } catch (e) {
      console.error('❌ Initial D-ID greeting failed:', e);
    }
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
        <section className="hero-section">
          {/* Deep Navy to Black Gradient Background */}
          <div className="hero-gradient-bg"></div>
          
          {/* Champagne/Gold Radial Glow Behind Isabella */}
          <div className="hero-ambient-glow"></div>
          
          {/* Main Content Container */}
          <div className="hero-content-wrapper">
            
            {/* Left Side - Isabella (Anchor) */}
            <div className="isabella-container">
              {/* Enhanced Isabella Backlight (Soft Golden Glow) - Positioned in container */}
              <div className="isabella-backlight"></div>
              
              {/* Soft Spotlight Behind Isabella */}
              <div className="isabella-spotlight"></div>
              
              <div className="isabella-image-wrapper">
                {/* Isabella Image - Original Ultra HD Quality */}
                <img 
                  src={isabellaHeroImageUrl}
                  alt="Isabella Navia - AI Model Ambassador"
                  className="isabella-hero-image hero-image-raw"
                  loading="eager"
                  decoding="sync"
                  fetchPriority="high"
                  style={{ 
                    opacity: 1,
                    transition: 'opacity 0.5s ease-in-out'
                  }}
                />
                
                {/* D-ID Stream Container - Overlays on top of static image */}
                <div 
                  ref={didContainerRef}
                  id="did-container" 
                  className="did-avatar-layer" 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 10,
                    opacity: isStreaming || isLoading ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
                    pointerEvents: 'none',
                    mixBlendMode: 'lighten',
                  }}
                >
                  {/* D-ID videos will be injected here dynamically */}
                  {isLoading && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}>
                      <div
                        aria-label="Preparing Isabella"
                        className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center-Right Area - Tagline & Text */}
            <div className="hero-text-container">
              {/* Content Wrapper - Fades out when chat is active */}
              <div className={`hero-content-fade ${isChatActive ? 'hidden' : ''}`}>
                {/* Headline - Luxury Serif */}
                <h1 className="hero-headline">
                  The Future of Modeling is{' '}
                  <span className="hero-gradient-text">
                    Interactive
                  </span>
                </h1>
                
                {/* Subheadline - Elegant Sans-Serif */}
                <p className="hero-subheadline">
                  <span className="hero-highlight-name">
                    Isabella ✨
                  </span>
                  {' — Ovela\'s first AI model ambassador. Ask about Ovela, book a project, or design your own AI-powered ambassador.'}
                </p>
                
                {/* CTA Section */}
                <div className="hero-cta-section">
                  {/* Primary CTA Button */}
                  <button 
                    onClick={activateChat}
                    className="hero-btn-primary"
                  >
                    Start Chatting with Isabella
                  </button>
                  
                  {/* Secondary CTA - Text Link */}
                  <a 
                    href="#lookbook"
                    className="hero-link-secondary"
                  >
                    ↓ Explore Isabella's Portfolio ↓
                  </a>
                </div>
              </div>

              {/* Chat Box Overlay - Glassmorphism */}
              <div className={`hero-chat-overlay ${isChatActive ? 'active' : ''}`}>
                <div className="hero-chat-box">
                  {/* Chat Component - Full Height */}
                  <div className="w-full h-full pt-2">
                    <FullWellnessGeniUI 
                      isGuestMode={true}
                      defaultPersona="isabella-navia"
                      allowedPersonas={['isabella-navia']}
                      showOnlyPromoter={true}
                      onAIResponse={(text) => {
                        console.log('🎯 onAIResponse callback triggered with text:', text?.substring(0, 50));
                        console.log('🎯 isLoading:', isLoading, 'isStreaming:', isStreaming);
                        if (text && !isLoading) {
                          console.log('🎬 Calling speakDID (streaming mode - reuse connection)...');
                          speakDID(text, isabellaHeroImageUrl).catch(err => {
                            console.error('❌ speakDID error:', err);
                          });
                        } else {
                          console.log('⏭️ Skipping D-ID - setup in progress');
                        }
                      }}
                    />
                  </div>
                  
                  {/* Close Button - Bottom Right */}
                  <button
                    onClick={() => setIsChatActive(false)}
                    className="hero-chat-close"
                    aria-label="Close chat"
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
