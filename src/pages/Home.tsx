// Home page - Ovela Interactive
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import FullWellnessGeniUI from '@/components/Chat/FullWellnessGeniUI';
import { LookbookCarousel } from '@/components/Home/LookbookCarousel';
import { AboutSection } from '@/components/Home/AboutSection';
import { ShowcaseSection } from '@/components/Home/ShowcaseSection';
import { AssessmentsSection, AssessmentLaunchPayload } from '@/components/Home/AssessmentsSection';
import { SEOBreaker } from '@/components/Home/SEOBreaker';
import { CTASection } from '@/components/Home/CTASection';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { StreamingService } from '@/services/StreamingService';
import { textToSpeechService } from '@/lib/textToSpeech';
import { useSEO } from '@/hooks/useSEO';
import { useStructuredData, organizationSchema, websiteSchema, serviceSchema, professionalServiceSchema, localBusinessSchema, faqSchema } from '@/hooks/useStructuredData';
import '@/styles/HeroSection.css';
import { useIsMobile } from '@/hooks/use-mobile';

// Isabella avatar URLs - centralized constants
// Desktop: full-body glamour shot. Mobile: face close-up portrait so the D-ID
// lip-sync overlay matches what's on screen and the avatar reads instantly.
// Unified Isabella face image — used for BOTH the on-screen hero portrait
// and the D-ID lip-sync animation source. Keeping them identical eliminates
// the mobile "image swap" flash where the chat avatar differed from the
// animated yellow-gown image. D-ID animates faces, so a face-forward portrait
// also produces a higher-quality lip-sync.
const ISABELLA_AVATAR_URL = "https://res.cloudinary.com/di5gj4nyp/image/upload/v1758918813/Flux_Dev_v_0_xhxy5n.jpg";
const ISABELLA_AVATAR_MOBILE_URL = ISABELLA_AVATAR_URL;
const ISABELLA_VIDEO_URL = "https://res.cloudinary.com/di5gj4nyp/video/upload/v1758719713/133adb02-04ab-46f1-a4cf-ed32398f10b3_hsrjzm.mp4";

const Home = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const heroImage = isMobile ? ISABELLA_AVATAR_MOBILE_URL : ISABELLA_AVATAR_URL;

  
  // SEO with translated meta tags
  useSEO({
    path: '/',
    title: t('seo.home.title', 'Ovela Interactive | Where AI Becomes Your Brand\'s Voice'),
    description: t('seo.home.description', 'Discover Ovela Interactive — the AI-powered marketing agency behind Isabella, the world\'s first humanlike AI model and companion.')
  });

  // Structured data for rich search results
  useStructuredData([organizationSchema, websiteSchema, serviceSchema, professionalServiceSchema, localBusinessSchema, faqSchema], 'home-structured-data');
  
  const [isChatActive, setIsChatActive] = useState(false);
  const [isStreamSpeaking, setIsStreamSpeaking] = useState(false);
  const [isTTSSpeaking, setIsTTSSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState<string | undefined>(undefined);
  const [hasLipSyncFrame, setHasLipSyncFrame] = useState(false);
  const isAISpeaking = isStreamSpeaking || isTTSSpeaking;
  // Avatar is "visually" speaking only when the canvas has a fresh lip-sync frame
  const isAvatarVisible = isStreamSpeaking && hasLipSyncFrame;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasInitialized = useRef(false);
  const activateChatRef = useRef<((opts?: { seeded?: boolean }) => void) | null>(null);

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

  // Control canvas visibility based on real lip-sync frame availability
  useEffect(() => {
    const canvas = (window as any).__AVATAR_CANVAS_REF__ as HTMLCanvasElement | undefined;
    if (!canvas) return;

    canvas.style.opacity = isAvatarVisible ? '1' : '0';
    if (isAvatarVisible) canvas.style.display = 'block';

    // Ensure audio plays when streaming is speaking
    if (isStreamSpeaking && videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1.0;
    }
  }, [isAvatarVisible, isStreamSpeaking]);

  // Listen for canvas first-frame and speech-end events from StreamingService
  useEffect(() => {
    const onFrame = () => setHasLipSyncFrame(true);
    const onEnd = () => setHasLipSyncFrame(false);
    window.addEventListener('avatar-frame-ready', onFrame);
    window.addEventListener('avatar-speech-end', onEnd);
    return () => {
      window.removeEventListener('avatar-frame-ready', onFrame);
      window.removeEventListener('avatar-speech-end', onEnd);
    };
  }, []);

  // Subscribe to StreamingService state changes
  useEffect(() => {
    const unsubConnection = StreamingService.onConnectionChange((connected) => {
      console.log('[Home] 🔗 Connection:', connected);
      if (connected) setIsLoading(false);
    });

    const unsubSpeaking = StreamingService.onSpeakingChange((speaking) => {
      console.log('[Home] 🎤 Speaking:', speaking);
      setIsStreamSpeaking(speaking);
    });

    textToSpeechService.setOnSpeakingChange(setIsTTSSpeaking);

    return () => {
      unsubConnection();
      unsubSpeaking();
      textToSpeechService.setOnSpeakingChange(() => {});
      setIsTTSSpeaking(false);
    };
  }, []);

  // Handle URL params: open chat & optionally pre-seed (partner OR authority tool OR ?tool=)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const partner = params.get('partner');
    const toolParam = params.get('tool'); // shareable deep links e.g. ?tool=nutrition
    const partnerLabels: Record<string, string> = {
      wellnespirit: 'WellneSpirit',
      luxdeftec: 'LuxDefTec',
      superior: 'Superior Immobiliaris',
      general: 'the Ovela Network',
    };

    // Shareable deep-link presets — map ?tool=X to the same prompts as the
    // assessment cards on the homepage. Keeps email/SMS links short.
    const TOOL_DEEPLINKS: Record<string, { initialPrompt: string; tool_context: string; authority_topic: string }> = {
      nutrition: {
        initialPrompt: "I'd like the Nutrition & Muscle Preservation Assessment. Please walk me through it conversationally — I can type my week, paste my meal diary, upload a PDF or screenshot, or just describe it. Start with the disclaimer, then ask for what you need.",
        tool_context: 'nutrition_assessment',
        authority_topic: 'protein_nutrition_assessment',
      },
      recovery: {
        initialPrompt: "I'd like the Recovery & Resilience Assessment. Please run it conversationally in 5 short phases (personal profile, workload & stress, recovery, lifestyle & resilience, optional nutrition integration). Lifestyle questions only — no medical history, no diagnosis. Start with the disclaimer and ask 2–3 questions at a time.",
        tool_context: 'recovery_resilience_assessment',
        authority_topic: 'recovery_resilience_assessment',
      },
      reception: {
        initialPrompt: "I'd like to calculate what a human receptionist would actually cost in my country, and compare it to deploying you instead. Please ask me what you need.",
        tool_context: 'receptionist_cost_calculator',
        authority_topic: 'receptionist_cost',
      },
      missed: {
        initialPrompt: "Help me estimate how much revenue I'm losing to missed calls, after-hours leads, and language barriers. Ask me whatever you need to run the numbers.",
        tool_context: 'missed_leads_calculator',
        authority_topic: 'missed_leads',
      },
    };

    // 1) Authority-tool launch from any TopicHub page (sessionStorage)
    let toolSeed: { initialPrompt: string; tool_context?: string; authority_topic?: string } | null = null;
    try {
      const raw = sessionStorage.getItem('ovela:isabella:tool');
      if (raw) {
        toolSeed = JSON.parse(raw);
        sessionStorage.removeItem('ovela:isabella:tool');
      }
    } catch {}

    // 1b) URL-driven deep link — same effect as a card click
    if (!toolSeed && toolParam && TOOL_DEEPLINKS[toolParam]) {
      toolSeed = TOOL_DEEPLINKS[toolParam];
    }

    // Defer to next tick so activateChatRef is populated by its sync effect.
    const fireActivate = (seeded: boolean) => setTimeout(() => activateChatRef.current?.({ seeded }), 0);

    if (toolSeed?.initialPrompt) {
      (window as any).__ISABELLA_CTX__ = {
        tool_context: toolSeed.tool_context,
        authority_topic: toolSeed.authority_topic,
      };
      window.dispatchEvent(new CustomEvent('isabella:tool-context', {
        detail: { tool_context: toolSeed.tool_context, authority_topic: toolSeed.authority_topic }
      }));
      setInitialChatMessage(toolSeed.initialPrompt);
      fireActivate(true);
      window.history.replaceState({}, '', '/');
      return;
    }

    if (partner && partnerLabels[partner]) {
      const label = partnerLabels[partner];
      const msg = `I'd like to register for Ovela Network membership${partner === 'general' ? '' : ` for ${label} access`}. Please acknowledge my interest, confirm my details will be sent to the Ovela team, and go straight into collecting my information (full name, email, company, country, and a short note on what I'm looking for). Skip the presentation — I'll ask if I want to know more.`;
      setInitialChatMessage(msg);
      fireActivate(true);
      window.history.replaceState({}, '', '/');
    } else if (params.get('chat') === 'open') {
      fireActivate(false);
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
      console.error('[Home] ❌ D-ID speak failed, falling back to TTS:', err);
      // Fallback to ElevenLabs TTS when D-ID is unavailable
      textToSpeechService.speakText(text).catch(ttsErr => {
        console.error('[Home] ❌ TTS fallback also failed:', ttsErr);
      });
    });
  }, []);

  // Activate chat and initialize D-ID connection
  const activateChat = useCallback(async (opts?: { seeded?: boolean }) => {
    console.log('[Home] 🟢 Activating chat');

    // If this is a plain "Ask About Digital Employees" open (no tool seed,
    // no partner preset), clear any leftover assessment context/messages from
    // a previous session so Isabella doesn't greet with the wrong topic
    // (e.g. nutrition prompt persisting after a prior assessment).
    if (!opts?.seeded) {
      try { localStorage.removeItem('ovela_chat_session_v1'); } catch {}
      try { delete (window as any).__ISABELLA_CTX__; } catch {}
      window.dispatchEvent(new Event('isabella:reset'));
      setInitialChatMessage(undefined);
    }

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

  // Keep ref in sync so the URL-param effect (mounted before activateChat) can call it
  useEffect(() => {
    activateChatRef.current = activateChat;
  }, [activateChat]);

  // Launch an assessment from the homepage AssessmentsSection.
  // Seeds Isabella's context, opens chat, scrolls to it.
  const launchAssessment = useCallback((payload: AssessmentLaunchPayload) => {
    (window as any).__ISABELLA_CTX__ = {
      tool_context: payload.tool_context,
      authority_topic: payload.authority_topic,
    };
    window.dispatchEvent(new CustomEvent('isabella:tool-context', {
      detail: { tool_context: payload.tool_context, authority_topic: payload.authority_topic }
    }));
    setInitialChatMessage(payload.initialPrompt);
    activateChat({ seeded: true });
    // Smooth scroll back up so the user sees Isabella respond
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }, [activateChat]);

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
                "url": "https://www.ovelainteractive.com/favicon.png"
              }
            }
          })
        }}
      />

      <div>
        {/* Luxury Hero Section */}
        <section className={`hero-section ${isChatActive ? 'chat-active' : ''}`}>
          {/* Deep Navy to Black Gradient Background */}
          <div className="hero-gradient-bg"></div>
          
          {/* Champagne/Gold Radial Glow Behind Isabella */}
          <div className="hero-ambient-glow"></div>
          
          {/* Main Content Container */}
          <div className="hero-content-wrapper">
            
            {/* Left Side - Isabella (Anchor) */}
            <div 
              className="isabella-container"
              style={{ zIndex: isStreamSpeaking ? 200 : 1 }}
            >
              {/* Enhanced Isabella Backlight (Soft Golden Glow) - Positioned in container */}
              <div className="isabella-backlight"></div>
              
              {/* Soft Spotlight Behind Isabella */}
              <div className="isabella-spotlight"></div>
              
              <div className="isabella-image-wrapper">
                {/* Isabella Image - Hides when D-ID animation is active */}
                <img 
                  src={heroImage}
                  alt="Isabella Navia - AI Model Ambassador"
                  className={`isabella-hero-image hero-image-raw ${isMobile ? 'isabella-mobile-face' : ''}`}
                  loading="eager"
                  decoding="sync"
                  {...{ fetchpriority: 'high' }}
                  style={{
                    opacity: 1,
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
                  {t('hero.description')}
                </p>

                {/* Support Line - SEO rich */}
                <p className="hero-support-line">
                  {t('hero.supportLine')}
                </p>
                
                {/* CTA Section */}
                <div className="hero-cta-section">
                  {/* Floating friction-remover */}
                  <span className="hero-floating-line">
                    {t('hero.floatingLine')}
                  </span>

                  {/* Primary CTAs row */}
                  <div className="hero-btn-row">
                    <button 
                      onClick={() => activateChat()}
                      className="hero-btn-primary"
                    >
                      {t('hero.cta')}
                    </button>

                    <a
                      href="/ecosystem"
                      className="hero-btn-secondary"
                    >
                      {t('hero.network', 'Partner Network')}
                    </a>
                  </div>
                  
                  {/* Tertiary CTA - Links to live project */}
                  <a 
                    href="https://wellnespirit.com/en"
                    target="_blank"
                    rel="noopener noreferrer"
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
                      isAISpeaking={isAISpeaking}
                      onClose={() => setIsChatActive(false)}
                      initialMessage={initialChatMessage}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SEO Breaker between Hero and Portfolio */}
        <SEOBreaker />

        {/* Magazine-Style Sections Below Hero */}
        <LookbookCarousel />
        <AboutSection onChatClick={activateChat} />
        <ShowcaseSection
          injectAfter={{
            0: <AssessmentsSection onLaunch={launchAssessment} />,
          }}
        />
        <CTASection onChatClick={activateChat} />
        <FooterMinimal />
      </div>
    </>
  );
};

export default Home;
