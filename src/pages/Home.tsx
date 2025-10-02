import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Users, Globe } from 'lucide-react';
import Section from '@/components/UI/Section';
import VideoPlayer from '@/components/UI/VideoPlayer';
import { useWellnessGeniChat } from '@/hooks/useWellnessGeniChat';
import FullWellnessGeniUI from '@/components/Chat/FullWellnessGeniUI';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Button } from '@/components/ui/button';

const Home = () => {
  const isabellaVideoUrl = "https://res.cloudinary.com/di5gj4nyp/video/upload/v1758719713/133adb02-04ab-46f1-a4cf-ed32398f10b3_hsrjzm.mp4";
  const isabellaCapabilitiesVideo = "https://res.cloudinary.com/di5gj4nyp/video/upload/v1758727075/b8674c11-00a4-42b4-ad39-ebaf103d9f18_1_ffgrvr.mp4";
  const { startChat, isConnecting } = useWellnessGeniChat();
  const portfolioRef = useRef<HTMLDivElement>(null);
  const [isChatActive, setIsChatActive] = useState(false);

  const scrollToPortfolio = () => {
    portfolioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activateChat = () => {
    setIsChatActive(true);
  };

  const lookbookItems = [
    {
      type: 'video',
      src: isabellaVideoUrl,
      title: 'Isabella Introduction',
      description: 'Meet the world\'s first AI brand ambassador',
      context: 'Tell me about Isabella\'s introduction video and her role as an AI brand ambassador'
    },
    {
      type: 'video',
      src: isabellaCapabilitiesVideo,
      title: 'Isabella in Green Dress',
      description: 'Professional modeling showcase',
      context: 'Tell me about Isabella\'s modeling capabilities and this green dress photoshoot'
    },
    {
      type: 'image',
      src: '/lovable-uploads/747c6d6a-cb67-45f5-9bf0-64ea66c8b8e4.png',
      title: 'Isabella Portrait',
      description: 'Premium brand photography',
      context: 'Tell me about Isabella\'s portrait photography and brand representation work'
    },
    {
      type: 'image',
      src: '/lovable-uploads/b06efdff-127f-4fcd-9e95-9dcf24e4b22f.png',
      title: 'WellnessGeni Integration',
      description: 'AI wellness companion platform',
      context: 'Tell me about Isabella\'s role in WellnessGeni and how she helps with wellness'
    },
    {
      type: 'image',
      src: '/lovable-uploads/10967d19-2fe9-4ab6-aa70-39ba0280a4a2.png',
      title: 'Interactive Campaigns',
      description: 'Real-time customer engagement',
      context: 'Tell me about interactive marketing campaigns Isabella can run for brands'
    },
    {
      type: 'image',
      src: '/lovable-uploads/3548b4f8-b4f5-410a-a3cd-669f8d922534.png',
      title: 'Brand Partnerships',
      description: 'Multi-brand representation',
      context: 'Tell me about how Isabella can represent multiple brands simultaneously'
    }
  ];

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
        {/* Premium Hero Section - Luxury Brand Style */}
        <section className="h-screen w-full relative overflow-hidden">
          {/* Luxury Gradient Background - Navy → Plum → Champagne Glow */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 40% 50%, rgba(247, 231, 206, 0.12) 0%, #0A0A2A 25%, #3B1C32 60%, rgba(247, 231, 206, 0.08) 100%)'
          }}></div>
          
          {/* Main Content Container */}
          <div className="relative w-full h-full flex items-center justify-between px-12">
            
            {/* Left - Isabella Full-Body with Golden Halo */}
            <div className="flex items-end h-full pb-0 z-10">
              <div className="relative">
                {/* Soft golden glow behind Isabella */}
                <div className="absolute inset-0 blur-[180px] opacity-25" style={{
                  background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, rgba(212, 175, 55, 0.15) 40%, transparent 70%)',
                  transform: 'scale(1.3)'
                }}></div>
                
                <img 
                  src="https://res.cloudinary.com/di5gj4nyp/image/upload/v1759415621/Flux_1Dev_Use_Character_Element_IsabellaV2Focus_fullbody_portra_1__6_-removebg-preview_iapmgy.png"
                  alt="Isabella Navia - The World's First AI Model Ambassador"
                  className="relative object-contain object-bottom"
                  style={{ 
                    height: '99vh',
                    width: 'auto',
                    transformOrigin: 'bottom center'
                  }}
                />
              </div>
            </div>

            {/* Right - Elegant Text Block */}
            <div 
              className="flex flex-col justify-center z-20"
              style={{ 
                maxWidth: '720px',
                marginRight: '6%'
              }}
            >
              {/* Initial State - Text & CTAs */}
              <div 
                className={`transition-all duration-700 ${isChatActive ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}
              >
                {/* Headline - Single Line */}
                <h1 
                  style={{ 
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 'clamp(42px, 3.5vw, 46px)',
                    fontWeight: '400',
                    fontStyle: 'italic',
                    lineHeight: '1.2',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '20px',
                    whiteSpace: 'nowrap',
                    transform: 'translateX(calc(-3cm + 8mm))'
                  }}
                >
                  The Future of Modeling is Interactive
                </h1>
                
                {/* Supporting Text - Two Lines */}
                <div 
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    maxWidth: '450px',
                    marginBottom: '30px'
                  }}
                >
                  {/* Line 1: Isabella ✨ + Ovela's first AI model ambassador. Ask questions, */}
                  <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', marginLeft: 'calc(-2cm + 5mm)', marginBottom: '8px' }}>
                    <p style={{ 
                      fontSize: '36px',
                      fontWeight: '700',
                      color: '#FFD700',
                      marginRight: '12px',
                      textShadow: '0 0 20px rgba(255, 215, 0, 0.4)'
                    }}>
                      Isabella ✨
                    </p>
                    <p style={{ 
                      fontSize: '19px',
                      fontWeight: '300',
                      color: '#F7F7F7',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}>
                      Ovela's first AI model ambassador. Ask questions,
                    </p>
                  </div>
                  
                  {/* Line 2: explore her portfolio... */}
                  <p style={{ 
                    fontSize: '19px',
                    fontWeight: '300',
                    color: '#F7F7F7',
                    lineHeight: '1.6',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    marginLeft: 'calc(-2cm + 5mm)'
                  }}>
                    explore her portfolio, book a project — live.
                  </p>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col gap-5">
                  {/* Primary Button */}
                  <button 
                    onClick={activateChat}
                    className="transition-all duration-300"
                    style={{
                      width: '28vw',
                      maxWidth: '280px',
                      height: '52px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)',
                      border: 'none',
                      color: '#0A0A2A',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '15px',
                      fontWeight: '600',
                      letterSpacing: '0.5px',
                      marginLeft: 'calc(-1cm + 8mm)',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 24px rgba(212, 175, 55, 0.7)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Start Chatting with Isabella
                  </button>
                  
                  {/* Secondary Button - Text Link Style */}
                  <button 
                    onClick={scrollToPortfolio}
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
                       padding: '0',
                       textAlign: 'left',
                       marginLeft: '-1cm'
                     }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#F7E7CE';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#D4AF37';
                    }}
                  >
                    ↓ Explore Isabella's Portfolio ↓
                  </button>
                </div>
              </div>

              {/* Active State - Chat Box Overlay */}
              <div 
                className={`transition-all duration-700 ${isChatActive ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'}`}
                style={{ 
                  width: '420px',
                  height: '620px'
                }}
              >
                <div 
                  className="h-full relative flex flex-col"
                  style={{ 
                    background: 'rgba(10, 10, 42, 0.75)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRadius: '24px',
                    boxShadow: `
                      0 30px 60px rgba(0, 0, 0, 0.5),
                      0 0 0 1px rgba(212, 175, 55, 0.3),
                      inset 0 0 40px rgba(212, 175, 55, 0.06)
                    `,
                    border: '1px solid rgba(212, 175, 55, 0.25)'
                  }}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setIsChatActive(false)}
                    className="absolute top-3 right-3 z-50 p-2 rounded-full hover:bg-white/10 transition-colors"
                    style={{ color: '#D4AF37' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  
                  <FullWellnessGeniUI 
                    isGuestMode={true}
                    defaultPersona="isabella-navia"
                    allowedPersonas={['isabella-navia']}
                    showOnlyPromoter={true}
                  />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Elegant Separator */}
        <div className="w-full py-16 bg-gradient-to-b from-midnight-blue/40 via-soft-purple/20 to-midnight-blue/40">
          <div className="max-w-6xl mx-auto text-center">
            <div className="h-px bg-gradient-to-r from-transparent via-champagne-gold to-transparent mb-8"></div>
            <button
              onClick={scrollToPortfolio}
              className="text-xl font-medium transition-all duration-300 hover:scale-105 transform"
              style={{ color: 'hsl(var(--champagne-gold))' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFE55C'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--champagne-gold))'}
            >
              ↓ Explore Isabella's Portfolio ↓
            </button>
          </div>
        </div>

        {/* Lookbook / Media Showcase */}
        <div ref={portfolioRef} className="w-full py-20 px-4" style={{ marginTop: '120px' }}>
          <div className="max-w-[90%] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-playfair font-bold mb-4" style={{ color: 'hsl(var(--champagne-gold))' }}>
                Isabella's Portfolio
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore my work across campaigns, photoshoots, and interactive projects
              </p>
            </div>

            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full mx-auto"
            >
              <CarouselContent>
                {lookbookItems.map((item, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="group relative overflow-hidden rounded-2xl bg-card border border-border hover-lift cursor-pointer h-[450px]">
                      {/* Media */}
                      {item.type === 'video' ? (
                        <VideoPlayer
                          src={item.src}
                          className="w-full h-full object-cover"
                          autoplay={false}
                          loop={true}
                          muted={true}
                          controls={false}
                        />
                      ) : (
                        <img
                          src={item.src}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-midnight-blue/90 via-soft-purple/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                        <h3 className="heading-sm text-soft-white mb-2">{item.title}</h3>
                        <p className="text-soft-white/80 text-sm mb-4">{item.description}</p>
                        <Button
                          variant="default"
                          size="sm"
                          className="btn-gradient w-fit"
                          onClick={() => startChat('isabella-navia', 'ovela-lookbook')}
                        >
                          Ask Isabella about this
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
        </div>

        {/* Who We Are */}
        <Section background="gray">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="heading-lg mb-8">Who We Are</h2>
            <p className="body-lg text-muted-foreground leading-relaxed">
              We're not just another marketing agency — we're the future of interactive sales. Ovela Interactive was born to fill the gap where traditional marketing slowed down and digital solutions began to outpace human capabilities. Our first step was creating Isabella, the world's first humanlike AI model and companion, through the WellnessGeni app. She proved what's possible: speed, intelligence, adaptability, and the ability to serve multiple brands at once.
            </p>
          </div>
        </Section>

        {/* WellnessGeni Showcase */}
        <Section>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-lg mb-6">WellnessGeni — Your AI Wellness Companion</h2>
              <p className="body-md text-muted-foreground mb-8">
                Discover how Isabella helps people achieve balance, better health, and happiness — while proving that AI can guide, connect, and adapt.
              </p>
              <Link to="/wellnessgeni">
                <Button variant="outline" className="btn-outline">
                  Explore WellnessGeni
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="lg:order-first">
              <div className="w-full h-full flex justify-center items-center">
                <img 
                  src="/lovable-uploads/b06efdff-127f-4fcd-9e95-9dcf24e4b22f.png" 
                  alt="WellnessGeni app interface showing AI wellness companion Isabella"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Meet Isabella */}
        <Section background="dark">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-lg mb-6 text-soft-white">
                Isabella — More Than a Model. <span className="gradient-text">More Than an AI.</span>
              </h2>
              <p className="body-md text-soft-white/80 mb-8">
                Unlike AI influencers who only pose, Isabella thinks, adapts, and interacts. She's the world's first AI who can model, promote, and personally connect with your customers in real time.
              </p>
              <Link to="/isabella">
                <Button variant="default" className="btn-gradient">
                  Meet Isabella
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div>
              <div className="bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 rounded-3xl p-8 glass">
                <img 
                  src="/lovable-uploads/747c6d6a-cb67-45f5-9bf0-64ea66c8b8e4.png" 
                  alt="Isabella - AI Brand Ambassador and Model"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* For Brands & Partners */}
        <Section>
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-6">What Isabella Can Do For You</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Users, title: 'Brand Representation', desc: 'Authentic voice for your brand across all channels' },
              { icon: Zap, title: 'Product Promotion', desc: 'Dynamic campaigns that adapt to your audience' },
              { icon: Globe, title: 'Interactive Campaigns', desc: 'Real-time engagement with customers worldwide' }
            ].map((service, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-border/50 hover-lift">
                <service.icon className="w-8 h-8 text-electric-blue mb-4" />
                <h3 className="heading-sm mb-3">{service.title}</h3>
                <p className="text-muted-foreground">{service.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="default" 
              className="btn-gradient"
              onClick={() => startChat('isabella-navia', 'ovela-partner')}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Partner With Isabella'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </Section>

        {/* Why Ovela Interactive */}
        <Section background="gray">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="heading-lg mb-8">Why Ovela Interactive?</h2>
            <p className="body-lg text-muted-foreground">
              We don't just build campaigns — we build intelligent, interactive connections. With AI companions like Isabella, your brand becomes personal, adaptive, and always on.
            </p>
          </div>
        </Section>
      </div>
    </>
  );
};

export default Home;
