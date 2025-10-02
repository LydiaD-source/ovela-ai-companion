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
          {/* Radial Spotlight Gradient Background - Navy → Midnight Blue → Champagne */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 30% 50%, rgba(253, 230, 138, 0.15) 0%, rgba(11, 13, 23, 1) 30%, rgba(30, 41, 59, 1) 60%, rgba(109, 90, 255, 0.2) 100%)'
          }}></div>
          
          <div className="relative w-full h-full flex items-center" style={{ padding: '0 60px' }}>
            
            {/* Left - Isabella with Spotlight Glow */}
            <div className="absolute left-12 bottom-0 flex items-end" style={{ height: '100%' }}>
              <div className="relative">
                {/* Spotlight halo behind Isabella */}
                <div className="absolute inset-0 blur-[200px] opacity-30" style={{
                  background: 'radial-gradient(circle, rgba(253, 230, 138, 0.5) 0%, rgba(255, 255, 255, 0.15) 35%, transparent 65%)',
                  transform: 'scale(1.3)'
                }}></div>
                
                <img 
                  src="https://res.cloudinary.com/di5gj4nyp/image/upload/v1759415621/Flux_1Dev_Use_Character_Element_IsabellaV2Focus_fullbody_portra_1__6_-removebg-preview_iapmgy.png"
                  alt="Isabella Navia - AI Model Ambassador"
                  className="relative object-contain object-bottom spotlight-glow"
                  style={{ 
                    height: '88vh',
                    width: 'auto',
                    transform: 'scale(1.1)',
                    transformOrigin: 'bottom center'
                  }}
                />
              </div>
            </div>

            {/* Right Side - Two State Layout */}
            <div 
              className="absolute right-12 z-10 flex flex-col justify-center"
              style={{ 
                top: '50%',
                transform: 'translateY(-50%)',
                maxWidth: '500px',
                minHeight: '600px'
              }}
            >
              {/* Initial State - Tagline & CTA */}
              <div 
                className={`transition-all duration-700 ${isChatActive ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}
              >
                <h1 
                  className="text-5xl font-bold leading-tight mb-6"
                  style={{ 
                    color: 'white',
                    fontFamily: 'Playfair Display, serif'
                  }}
                >
                  Meet Isabella — Your AI Model Ambassador
                </h1>
                
                <h3 
                  className="text-2xl font-light leading-snug mb-8"
                  style={{ 
                    color: 'hsl(var(--champagne-gold))',
                    maxWidth: '480px'
                  }}
                >
                  The world's first interactive model. Ask about Ovela, book photoshoots, explore pricing, or design your own AI-powered ambassador.
                </h3>
                
                <div className="flex flex-col gap-4">
                  <Button 
                    onClick={activateChat}
                    className="text-black font-bold px-8 py-6 text-lg w-full transition-all duration-300 hover:-translate-y-1"
                    style={{
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, hsl(var(--champagne-gold)) 0%, #FFD700 100%)',
                      boxShadow: '0 4px 20px hsla(var(--champagne-gold) / 0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 30px hsla(var(--champagne-gold) / 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 20px hsla(var(--champagne-gold) / 0.4)';
                    }}
                  >
                    Start Chatting with Isabella
                  </Button>
                  
                  <Button 
                    onClick={scrollToPortfolio}
                    className="text-black font-bold px-8 py-6 text-lg w-full transition-all duration-300 hover:-translate-y-1"
                    style={{
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #FFF5E1 0%, #FBBF24 100%)',
                      boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(251, 191, 36, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(251, 191, 36, 0.3)';
                    }}
                  >
                    See Isabella in Action
                  </Button>
                </div>
              </div>

              {/* Active State - Chat Box */}
              <div 
                className={`transition-all duration-700 ${isChatActive ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'}`}
                style={{ 
                  width: '400px',
                  height: '500px'
                }}
              >
                <div 
                  className="rounded-3xl overflow-hidden h-full"
                  style={{ 
                    background: 'rgba(30, 41, 59, 0.6)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: `
                      0 25px 50px rgba(0, 0, 0, 0.4),
                      0 0 0 1px hsla(var(--champagne-gold) / 0.3),
                      inset 0 0 30px hsla(var(--champagne-gold) / 0.08)
                    `,
                    border: '1px solid hsla(var(--champagne-gold) / 0.25)'
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
