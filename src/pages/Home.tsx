import React, { useRef, useState, useEffect } from 'react';
import FullWellnessGeniUI from '@/components/Chat/FullWellnessGeniUI';
import { LookbookCarousel } from '@/components/Home/LookbookCarousel';
import { AboutSection } from '@/components/Home/AboutSection';
import { HowItWorksSection } from '@/components/Home/HowItWorksSection';
import { ShowcaseSection } from '@/components/Home/ShowcaseSection';
import { CTASection } from '@/components/Home/CTASection';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { StreamingService } from '@/services/StreamingService';
import { useCanonicalLink } from '@/hooks/useCanonicalLink';
import '@/styles/HeroSection.css';


const Home = () => {
  useCanonicalLink('/');
  console.log('🟢 HOME COMPONENT LOADED');
  const isabellaVideoUrl = "https://res.cloudinary.com/di5gj4nyp/video/upload/v1758719713/133adb02-04ab-46f1-a4cf-ed32398f10b3_hsrjzm.mp4";
  const isabellaHeroImageUrl = "https://res.cloudinary.com/di5gj4nyp/image/upload/v1759836676/golddress_ibt1fp.png";
  const [isChatActive, setIsChatActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasInitialized = useRef(false); // WellnessGeni pattern - prevent double init
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // WellnessGeni pattern: Register video ref AFTER mount, once only
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Prevent double initialization
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // CRITICAL: Make video globally accessible for StreamingService - matching WellnessGeni
    (window as any).__AVATAR_VIDEO_REF__ = video;
    
    // Match WellnessGeni video setup - start muted for autoplay policy, unmute when speaking
    video.muted = false; // D-ID audio should play
    video.volume = 1.0;
    video.playsInline = true;
    video.autoplay = true;
    
    console.log('[Home] ✅ Video element initialized and registered globally');
    
    return () => {
      (window as any).__AVATAR_VIDEO_REF__ = null;
    };
  }, []); // Empty dependency - runs once after mount

  // Unmute video when speaking starts to ensure audio plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isSpeaking) {
      video.muted = false;
      video.volume = 1.0;
      console.log('[Home] 🔊 Video unmuted for speech');
    }
  }, [isSpeaking]);

  // Subscribe to StreamingService state changes (WellnessGeni pattern)
  useEffect(() => {
    const unsubConnection = StreamingService.onConnectionChange((connected) => {
      console.log('🔗 StreamingService connection:', connected);
      setIsConnected(connected);
      setIsLoading(false);
    });
    
    const unsubSpeaking = StreamingService.onSpeakingChange((speaking) => {
      console.log('🎤 StreamingService speaking:', speaking);
      setIsSpeaking(speaking);
    });
    
    return () => {
      unsubConnection();
      unsubSpeaking();
    };
  }, []);

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
    
    // Show chat immediately
    setIsChatActive(true);
    setIsLoading(true);

    // Start D-ID connection in background using StreamingService (WellnessGeni pattern)
    console.log('🎬 Starting D-ID connection via StreamingService...');
    StreamingService.init(isabellaHeroImageUrl).then(() => {
      console.log('✅ StreamingService D-ID connection ready');
    }).catch(e => {
      console.error('❌ StreamingService connection failed:', e);
      setIsLoading(false);
    });
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
            <div 
              className="isabella-container"
              style={{ zIndex: isSpeaking || isConnected ? 200 : 1 }}
            >
              {/* Enhanced Isabella Backlight (Soft Golden Glow) - Positioned in container */}
              <div className="isabella-backlight"></div>
              
              {/* Soft Spotlight Behind Isabella */}
              <div className="isabella-spotlight"></div>
              
              <div className="isabella-image-wrapper">
                {/* Isabella Image - Hides when D-ID animation is active */}
                <img 
                  src={isabellaHeroImageUrl}
                  alt="Isabella Navia - AI Model Ambassador"
                  className="isabella-hero-image hero-image-raw"
                  loading="eager"
                  decoding="sync"
                  fetchPriority="high"
                  style={{
                    opacity: isSpeaking ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out',
                  }}
                />
                
                {/* D-ID Video Element - WellnessGeni pattern with crossorigin */}
                <video 
                  ref={videoRef}
                  id="did-video"
                  className="did-avatar-layer"
                  autoPlay
                  playsInline
                  crossOrigin="anonymous"
                  data-isabela-stream="true"
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    zIndex: isSpeaking ? 150 : -1,
                    pointerEvents: 'none',
                    background: 'transparent',
                    opacity: isSpeaking ? 1 : 0,
                    display: isSpeaking ? 'block' : 'none',
                    transition: 'opacity 0.3s ease-in-out',
                  }}
                />
                
                {/* Small loading indicator at bottom when connecting */}
                {isLoading && (
                  <div 
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-soft-white/80">Connecting...</span>
                  </div>
                )}
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
                        console.log('🎯 onAIResponse callback triggered!');
                        console.log('📝 Text received:', text?.substring(0, 50));
                        console.log('🔗 isConnected:', isConnected, 'isSpeaking:', isSpeaking);
                        
                        if (!text) {
                          console.warn('⚠️ No text received in onAIResponse');
                          return;
                        }
                        
                        // Use StreamingService.speak (WellnessGeni pattern)
                        console.log('🎬 Calling StreamingService.speak for animation');
                        StreamingService.speak({
                          avatarUrl: isabellaHeroImageUrl,
                          text,
                        }).catch(err => {
                          console.error('❌ StreamingService.speak error:', err);
                        });
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
