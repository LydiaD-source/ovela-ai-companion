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
        {/* Premium Hero Section - Fullscreen Interactive */}
        <section className="h-screen w-full relative overflow-hidden">
          {/* Luxury Gradient Background - Navy → Midnight Purple → Champagne Glow */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 35% 50%, rgba(230, 214, 168, 0.15) 0%, #0A0F2C 20%, #1A1038 60%, rgba(230, 214, 168, 0.08) 100%)'
          }}></div>
          
          {/* Fluid Layout Container */}
          <div className="relative w-full h-full flex items-center" style={{ padding: '0 40px' }}>
            
            {/* Left - Isabella with Spotlight Glow */}
            <div className="absolute left-[40px] bottom-0 flex items-end justify-start z-10">
              <div className="relative">
                {/* Spotlight halo behind Isabella */}
                <div className="absolute inset-0 blur-[200px] opacity-30" style={{
                  background: 'radial-gradient(circle, rgba(230, 214, 168, 0.5) 0%, rgba(230, 214, 168, 0.2) 30%, transparent 60%)',
                  transform: 'scale(1.4)'
                }}></div>
                
                <img 
                  src="https://res.cloudinary.com/di5gj4nyp/image/upload/v1759415621/Flux_1Dev_Use_Character_Element_IsabellaV2Focus_fullbody_portra_1__6_-removebg-preview_iapmgy.png"
                  alt="Isabella Navia - The World's First AI Model Ambassador"
                  className="relative object-contain object-bottom"
                  style={{ 
                    height: '85vh',
                    width: 'auto',
                    transformOrigin: 'bottom center'
                  }}
                />
              </div>
            </div>

            {/* Center-Right - Elegant Text Block & CTA */}
            <div 
              className="absolute right-0 flex flex-col justify-center items-center text-center z-20"
              style={{ 
                right: '15%',
                maxWidth: '560px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              {/* Initial State - Elegant Tagline & CTA */}
              <div 
                className={`transition-all duration-700 ${isChatActive ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}
              >
                <h1 
                  className="font-semibold leading-tight mb-6"
                  style={{ 
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 'clamp(28px, 3.5vw, 42px)',
                    letterSpacing: '1px',
                    color: '#D4C5A0',
                    fontWeight: '300',
                    lineHeight: '1.1',
                    whiteSpace: 'nowrap',
                    fontStyle: 'italic'
                  }}
                >
                  Meet Isabella — Your AI Model Ambassador
                </h1>
                
                <p 
                  className="font-light leading-relaxed mb-8"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(15px, 1.8vw, 18px)',
                    color: '#E6D6A8',
                    maxWidth: '520px',
                    margin: '0 auto 32px',
                    fontWeight: '300',
                    lineHeight: '1.5'
                  }}
                >
                  The world's first interactive model. Ask about Ovela, book photoshoots, explore pricing, or design your own AI-powered ambassador.
                </p>
                
                <div className="flex flex-col items-center gap-4">
                  <Button 
                    onClick={activateChat}
                    className="text-black font-medium transition-all duration-300"
                    style={{
                      width: '280px',
                      height: '52px',
                      borderRadius: '16px',
                      background: '#D4C5A0',
                      boxShadow: '0 4px 12px rgba(212, 197, 160, 0.4)',
                      fontWeight: '400',
                      fontSize: '15px',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 24px 8px rgba(212, 197, 160, 0.5)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 197, 160, 0.4)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Start Chatting with Isabella
                  </Button>
                  
                  <button 
                    onClick={scrollToPortfolio}
                    className="font-light transition-all duration-300 hover:opacity-80"
                    style={{
                      color: '#E6D6A8',
                      fontSize: '16px',
                      fontFamily: 'Inter, sans-serif',
                      letterSpacing: '0.5px'
                    }}
                  >
                    See Isabella in Action ↓
                  </button>
                </div>
              </div>

              {/* Active State - Chat Box Overlay */}
              <div 
                className={`transition-all duration-700 ${isChatActive ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'}`}
                style={{ 
                  width: '420px',
                  height: '520px'
                }}
              >
                <div 
                  className="overflow-hidden h-full"
                  style={{ 
                    background: 'rgba(10, 15, 44, 0.7)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    boxShadow: `
                      0 30px 60px rgba(0, 0, 0, 0.6),
                      0 0 0 1px rgba(230, 214, 168, 0.3),
                      inset 0 0 40px rgba(230, 214, 168, 0.08)
                    `,
                    border: '1px solid rgba(230, 214, 168, 0.25)'
                  }}
                >
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
