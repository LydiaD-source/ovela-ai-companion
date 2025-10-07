import React, { useRef, useState } from 'react';
import { useWellnessGeniChat } from '@/hooks/useWellnessGeniChat';
import FullWellnessGeniUI from '@/components/Chat/FullWellnessGeniUI';
import { LookbookCarousel } from '@/components/Home/LookbookCarousel';
import { AboutSection } from '@/components/Home/AboutSection';
import { HowItWorksSection } from '@/components/Home/HowItWorksSection';
import { ShowcaseSection } from '@/components/Home/ShowcaseSection';
import { CTASection } from '@/components/Home/CTASection';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import '@/styles/HeroSection.css';


const Home = () => {
  const isabellaVideoUrl = "https://res.cloudinary.com/di5gj4nyp/video/upload/v1758719713/133adb02-04ab-46f1-a4cf-ed32398f10b3_hsrjzm.mp4";
  const isabellaHeroHD = "https://res.cloudinary.com/di5gj4nyp/image/upload/w_1920,h_1080,c_fit,f_auto,q_auto:best,dpr_auto/v1759836676/golddress_ibt1fp.png";
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
                  src="https://res.cloudinary.com/di5gj4nyp/image/upload/w_1920,h_1080,c_fit,dpr_1.0,e_sharpen,e_unsharp_mask:500,fl_force_strip,q_auto:best,f_auto/v1759612035/Default_Fullbody_portrait_of_IsabellaV2_wearing_a_luxurious_go_0_fdabba15-5365-4f04-ab3b-b9079666cdc6_0_shq4b3.png"
                  srcSet="
                    https://res.cloudinary.com/di5gj4nyp/image/upload/w_1920,h_1080,c_fit,dpr_1.0,e_sharpen,e_unsharp_mask:500,fl_force_strip,q_auto:best,f_auto/v1759612035/Default_Fullbody_portrait_of_IsabellaV2_wearing_a_luxurious_go_0_fdabba15-5365-4f04-ab3b-b9079666cdc6_0_shq4b3.png 1x,
                    https://res.cloudinary.com/di5gj4nyp/image/upload/w_1920,h_1080,c_fit,dpr_2.0,e_sharpen,e_unsharp_mask:500,fl_force_strip,q_auto:best,f_auto/v1759612035/Default_Fullbody_portrait_of_IsabellaV2_wearing_a_luxurious_go_0_fdabba15-5365-4f04-ab3b-b9079666cdc6_0_shq4b3.png 2x,
                    https://res.cloudinary.com/di5gj4nyp/image/upload/w_1920,h_1080,c_fit,dpr_3.0,e_sharpen,e_unsharp_mask:500,fl_force_strip,q_auto:best,f_auto/v1759612035/Default_Fullbody_portrait_of_IsabellaV2_wearing_a_luxurious_go_0_fdabba15-5365-4f04-ab3b-b9079666cdc6_0_shq4b3.png 3x
                  "
                  alt="Isabella Navia - AI Model Ambassador"
                  className="isabella-hero-image hero-image-raw"
                  loading="eager"
                  decoding="sync"
                  fetchPriority="high"
                />
                
                {/* HeyGen Avatar Container (Ready for Video Embed) */}
                <div id="heygen-container" className="heygen-avatar-layer">
                  {/* HeyGen video embed will go here */}
                </div>
                
                {/* Loading Skeleton (Optional) */}
                {/* <div className="heygen-loading-skeleton"></div> */}
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
