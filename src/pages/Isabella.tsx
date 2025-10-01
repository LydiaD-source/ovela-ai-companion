import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Target, Zap, Users } from 'lucide-react';
import Section from '@/components/UI/Section';
import VideoPlayer from '@/components/UI/VideoPlayer';
import { useWellnessGeniChat } from '@/hooks/useWellnessGeniChat';
import { Button } from '@/components/ui/button';

const Isabella = () => {
  const isabellaVideoUrl = "https://res.cloudinary.com/di5gj4nyp/video/upload/v1758907652/Ovela_2_hiufkv.mp4";
  const { startChat, isConnecting } = useWellnessGeniChat();

  return (
    <>
      {/* SEO Schema for Isabella's Video */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": "Meet Isabella — AI Brand Ambassador",
            "description": "Introduction to Isabella, the world's first AI brand ambassador and interactive model.",
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
        {/* Hero Section */}
        <Section className="text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 via-transparent to-neon-purple/5 pointer-events-none" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="heading-xl mb-8">
              Meet <span className="gradient-text">Isabella</span>
            </h1>
            <p className="body-lg text-muted-foreground mb-12">
              The World's First AI Brand Ambassador — Beautiful, intelligent, and always ready to represent your brand.
            </p>
            <Button 
              size="lg" 
              className="btn-gradient group animate-glow"
              onClick={() => startChat('isabella-navia', 'isabella-page')}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Chat With Isabella'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-electric-blue/20 to-transparent blur-xl" />
          <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-neon-purple/20 to-transparent blur-xl" />
        </Section>

        {/* Isabella Video */}
        <Section background="gray">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <VideoPlayer
                src={isabellaVideoUrl}
                className="w-full aspect-video"
                autoplay={true}
                loop={true}
                muted={false}
                controls={true}
                title="Isabella AI Brand Ambassador Introduction"
                description="Meet Isabella, the world's first AI brand ambassador and interactive model"
              />
            </div>
          </div>
        </Section>

        {/* What Makes Isabella Special */}
        <Section>
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-6">What Makes Isabella Special</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Clock, title: 'Always Available', desc: '24/7, no scheduling conflicts' },
              { icon: Target, title: 'Brand Focused', desc: 'Stays perfectly on-message' },
              { icon: Zap, title: 'Instantly Adaptive', desc: 'Learns and evolves with your brand' },
              { icon: Users, title: 'Multi-Platform', desc: 'Works across all channels simultaneously' }
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-6 rounded-2xl border border-border/50 hover-lift">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-electric-blue" />
                </div>
                <h3 className="heading-sm mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Isabella's Capabilities */}
        <Section background="gray">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-lg mb-8">Isabella's Capabilities</h2>
              <div className="space-y-6">
                {[
                  'Brand representation across social media',
                  'Product modeling and promotion',
                  'Real-time customer interactions',
                  'Multilingual communication',
                  'Adaptive personality for different audiences',
                  'Voice synthesis and video generation'
                ].map((capability, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-electric-blue to-neon-purple flex-shrink-0" />
                    <span className="body-md">{capability}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 rounded-3xl p-8 glass">
                <VideoPlayer
                  src="https://res.cloudinary.com/di5gj4nyp/video/upload/v1758727075/b8674c11-00a4-42b4-ad39-ebaf103d9f18_1_ffgrvr.mp4"
                  className="w-full rounded-2xl shadow-2xl"
                  autoplay={true}
                  loop={true}
                  muted={false}
                  controls={true}
                  title="Isabella AI Capabilities Demonstration"
                  description="Isabella AI brand ambassador showcasing her capabilities and features"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* CTA Section */}
        <Section background="dark">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="heading-lg mb-6 text-soft-white">
              Ready to Work with Isabella?
            </h2>
            <p className="body-md text-soft-white/80 mb-8">
              Experience the future of brand representation. Chat with Isabella and discover how she can transform your marketing approach.
            </p>
            <Button 
              variant="default" 
              size="lg" 
              className="btn-gradient group"
              onClick={() => startChat('isabella-navia', 'isabella-cta')}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Start Chatting'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
};

export default Isabella;
