import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import FullWellnessGeniUI from '@/components/Chat/FullWellnessGeniUI';
import { LookbookCarousel } from '@/components/Home/LookbookCarousel';
import { AboutSection } from '@/components/Home/AboutSection';
import { HowItWorksSection } from '@/components/Home/HowItWorksSection';
import { ShowcaseSection } from '@/components/Home/ShowcaseSection';
import { CTASection } from '@/components/Home/CTASection';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { StreamingService } from '@/services/StreamingService';
import { useSEO } from '@/hooks/useSEO';
import '@/styles/HeroSection.css';

// Isabella avatar URL - centralized constant
const ISABELLA_AVATAR_URL = "https://res.cloudinary.com/di5gj4nyp/image/upload/v1759836676/golddress_ibt1fp.png";
const ISABELLA_VIDEO_URL = "https://res.cloudinary.com/di5gj4nyp/video/upload/v1758719713/133adb02-04ab-46f1-a4cf-ed32398f10b3_hsrjzm.mp4";

const Home = () => {
  const { t } = useTranslation();
  
  // SEO with translated meta tags
  useSEO({
    path: '/',
    title: t('seo.home.title', 'Ovela Interactive | Where AI Becomes Your Brand\'s Voice'),
    description: t('seo.home.description', 'Discover Ovela Interactive — the AI-powered marketing agency behind Isabella, the world\'s first humanlike AI model and companion.')
  });
  
  const [isChatActive, setIsChatActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasInitialized = useRef(false);

  // Register video element globally for StreamingService
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    hasInitialized.current = true;
    (window as any).__AVATAR_VIDEO_REF__ = video;
    
    // Configure video for D-ID audio playback
    video.muted = false;
    video.volume = 1.0;
    video.playsInline = true;
    video.autoplay = true;
    
    console.log('[Home] ✅ Video element registered');
    
    return () => {
      // Reset on unmount so it reinitializes when navigating back
      hasInitialized.current = false;
      (window as any).__AVATAR_VIDEO_REF__ = null;
    };
  }, []);

  // Control canvas visibility based on speaking state
  useEffect(() => {
    const canvas = (window as any).__AVATAR_CANVAS_REF__ as HTMLCanvasElement | undefined;
    if (!canvas) return;
    
    canvas.style.opacity = isSpeaking ? '1' : '0';
    if (isSpeaking) canvas.style.display = 'block';
    
    // Ensure audio plays when speaking
    if (isSpeaking && videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
    }
  }, [isSpeaking]);

  // Subscribe to StreamingService state changes
  useEffect(() => {
    const unsubConnection = StreamingService.onConnectionChange((connected) => {
      console.log('[Home] 🔗 Connection:', connected);
      if (connected) setIsLoading(false);
    });
    
    const unsubSpeaking = StreamingService.onSpeakingChange((speaking) => {
      console.log('[Home] 🎤 Speaking:', speaking);
      setIsSpeaking(speaking);
    });
    
    return () => {
      unsubConnection();
      unsubSpeaking();
    };
  }, []);

  // Handle URL param to auto-open chat
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('chat') === 'open') {
      setIsChatActive(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Stable callback for AI responses - triggers D-ID animation
  const handleAIResponse = useCallback((text: string) => {
    if (!text) return;
    
    console.log('[Home] 🎯 AI Response received, triggering speak');
    StreamingService.speak({
      avatarUrl: ISABELLA_AVATAR_URL,
      text,
    }).catch(err => {
      console.error('[Home] ❌ Speak error:', err);
    });
  }, []);

  // Activate chat and initialize D-ID connection
  const activateChat = useCallback(async () => {
    console.log('[Home] 🟢 Activating chat');
    
    // Unlock audio context (browser autoplay policy workaround)
    try {
      const silentAudio = new Audio();
      silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      await silentAudio.play();
    } catch (e) {
      // Ignore - audio context may already be unlocked
    }
    
    setIsChatActive(true);
    setIsLoading(true);

    // Initialize D-ID stream in background
    StreamingService.init(ISABELLA_AVATAR_URL)
      .then(() => console.log('[Home] ✅ D-ID ready'))
      .catch(e => {
        console.error('[Home] ❌ D-ID init failed:', e);
        setIsLoading(false);
      });
  }, []);

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
            "thumbnailUrl": `${ISABELLA_VIDEO_URL}#t=0.5`,
            "uploadDate": new Date().toISOString().split('T')[0],
            "duration": "PT10S",
            "contentUrl": ISABELLA_VIDEO_URL,
            "embedUrl": ISABELLA_VIDEO_URL,
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
              style={{ zIndex: isSpeaking ? 200 : 1 }}
            >
              {/* Enhanced Isabella Backlight (Soft Golden Glow) - Positioned in container */}
              <div className="isabella-backlight"></div>
              
              {/* Soft Spotlight Behind Isabella */}
              <div className="isabella-spotlight"></div>
              
              <div className="isabella-image-wrapper">
                {/* Isabella Image - Hides when D-ID animation is active */}
                <img 
                  src={ISABELLA_AVATAR_URL}
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
                
                {/* Hidden video element for audio playback only */}
                <video 
                  ref={videoRef}
                  id="did-video"
                  autoPlay
                  playsInline
                  crossOrigin="anonymous"
                  style={{ 
                    display: 'none', // Hidden - audio only, canvas handles video
                  }}
                />
                
                {/* Small loading indicator at bottom when connecting */}
                {isLoading && (
                  <div 
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-soft-white/80">{t('hero.connecting')}</span>
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
                  {t('hero.title')}{' '}
                  <span className="hero-gradient-text">
                    {t('hero.titleHighlight')}
                  </span>
                </h1>
                
                {/* Subheadline - Elegant Sans-Serif */}
                <p className="hero-subheadline">
                  <span className="hero-highlight-name">
                    {t('hero.subtitle')}
                  </span>
                  {' '}{t('hero.description')}
                </p>
                
                {/* CTA Section */}
                <div className="hero-cta-section">
                  {/* Primary CTA Button */}
                  <button 
                    onClick={activateChat}
                    className="hero-btn-primary"
                  >
                    {t('hero.cta')}
                  </button>
                  
                  {/* Secondary CTA - Text Link */}
                  <a 
                    href="#lookbook"
                    className="hero-link-secondary"
                  >
                    {t('hero.explore')}
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
                      onAIResponse={handleAIResponse}
                      isAISpeaking={isSpeaking}
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
