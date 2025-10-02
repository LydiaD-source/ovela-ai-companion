import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Users, Globe } from 'lucide-react';
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

      <div className="pt-16">
        {/* Hero Section - Isabella Interactive Chat (Full UI) */}
        <Section className="relative overflow-hidden">
          <div className="container-custom relative z-10">
            <div className="text-center mb-8 animate-fade-up">
              <h1 className="heading-xl mb-4 text-foreground">
                Meet <span className="gradient-text">Isabella</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Ovela Interactive's Prime AI Model — Ask me anything about modeling, projects, pricing, or hiring me directly
              </p>
            </div>

            {/* Full Isabella Chat Interface */}
            <div className="w-full" style={{ height: '700px' }}>
              <FullWellnessGeniUI
                isGuestMode={true}
                defaultPersona="isabella-navia"
                allowedPersonas={["isabella-navia"]}
                showOnlyPromoter={true}
              />
            </div>
          </div>

          {/* Floating background elements */}
          <div className="absolute top-1/4 -left-20 w-64 h-64 bg-electric-blue/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-neon-purple/10 rounded-full blur-3xl animate-pulse" />
        </Section>

        {/* Lookbook / Media Showcase */}
        <Section background="gray">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-4">Isabella's Portfolio</h2>
            <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
              Explore my work across campaigns, photoshoots, and interactive projects
            </p>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent>
              {lookbookItems.map((item, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="group relative overflow-hidden rounded-2xl bg-card border border-border hover-lift cursor-pointer h-[400px]">
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
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
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
        </Section>

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
