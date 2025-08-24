import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Target, Zap, Users } from 'lucide-react';
import Section from '@/components/UI/Section';
import VideoPlayer from '@/components/UI/VideoPlayer';
import { Button } from '@/components/ui/button';

const Isabella = () => {
  const isabellaVideoUrl = "https://drive.google.com/file/d/1WqpBQPgWTLcFXm3mZSYNDg0wLDjR1t3M/preview";

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
        {/* Hero Section with Isabella Video */}
        <Section className="text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="heading-xl mb-8">
              Meet <span className="gradient-text">Isabella</span>
            </h1>
            
            {/* Isabella Introduction Video */}
            <div className="mb-8 mx-auto max-w-3xl">
              <VideoPlayer
                src={isabellaVideoUrl}
                className="rounded-3xl shadow-2xl hover:shadow-3xl transition-shadow duration-300"
                autoplay={false}
                loop={true}
                muted={true}
                controls={true}
                title="Isabella AI Brand Ambassador Introduction"
                description="Meet Isabella, originally from Andorra la Vella, working as a model, promoter, and marketing specialist"
              />
            </div>

            <p className="body-lg text-muted-foreground mb-8">
              The world's first AI companion who thinks, adapts, and interacts authentically with your customers.
            </p>
          </div>
        </Section>

        {/* Interactive Section */}
        <Section background="gray">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="heading-lg mb-6">Ready to Work Together?</h2>
            <p className="body-md text-muted-foreground mb-8">
              Click below to hire Isabella and get detailed information about projects, industries, pricing, and terms of cooperation.
            </p>
            
            <div className="space-y-4">
              <Button variant="default" size="lg" className="btn-gradient w-full sm:w-auto">
                Hire Isabella
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-sm text-muted-foreground">
                Connects to WellnessGeni "Promoter Template" chat integration
              </p>
            </div>
          </div>
        </Section>

        {/* Key Skills */}
        <Section>
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-6">Key Skills & Capabilities</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: 'Brand Ambassador',
                desc: 'Fashion, lifestyle, wellness, and tech expertise'
              },
              {
                icon: Target,
                title: 'AI-Powered Campaigns',
                desc: 'Data-driven promotions that convert'
              },
              {
                icon: Zap,
                title: 'Instant Adaptability',
                desc: 'Customizable for any brand voice or style'
              },
              {
                icon: Clock,
                title: '24/7 Availability',
                desc: 'Always online, never misses an opportunity'
              }
            ].map((skill, idx) => (
              <div key={idx} className="text-center p-6 rounded-2xl border border-border/50 hover-lift">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 flex items-center justify-center">
                  <skill.icon className="w-8 h-8 text-electric-blue" />
                </div>
                <h3 className="heading-sm mb-3">{skill.title}</h3>
                <p className="text-muted-foreground text-sm">{skill.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Why Work With Isabella */}
        <Section background="dark">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="heading-lg mb-8 text-soft-white">Why Work With Isabella?</h2>
            <p className="body-lg text-soft-white/80 mb-8">
              She's consistent, cost-effective, and scalable. Unlike human models, Isabella can manage multiple assignments simultaneously, never misses deadlines, and adapts instantly to brand needs.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Consistent Performance', desc: 'Same high quality, every time' },
                { title: 'Cost-Effective', desc: 'No travel, scheduling, or overtime costs' },
                { title: 'Infinitely Scalable', desc: 'Handle unlimited projects simultaneously' }
              ].map((benefit, idx) => (
                <div key={idx} className="text-center">
                  <h3 className="heading-sm mb-3 text-soft-white">{benefit.title}</h3>
                  <p className="text-soft-white/70">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </>
  );
};

export default Isabella;
