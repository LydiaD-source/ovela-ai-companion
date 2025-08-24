
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Users, Globe } from 'lucide-react';
import Section from '@/components/UI/Section';
import { Button } from '@/components/ui/button';

const Home = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <Section className="text-center min-h-[90vh] flex items-center">
        <div className="animate-fade-up">
          <h1 className="heading-xl mb-6">
            <span className="gradient-text">Ovela Interactive</span>
          </h1>
          <p className="body-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Where AI Becomes Your Brand's Voice.
          </p>
          <Link to="/partner">
            <Button variant="default" size="lg" className="btn-gradient group">
              Work With Us
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
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
            <div className="bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 rounded-3xl p-8 glass">
              <div className="text-center text-muted-foreground">
                [App screenshot mockup on phone - Placeholder for WellnessGeni screenshots]
              </div>
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
              <div className="text-center text-soft-white/70">
                [Isabella portrait or short looping video - Placeholder for Isabella video content]
              </div>
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
          <Link to="/partner">
            <Button variant="default" className="btn-gradient">
              Partner With Isabella
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
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
  );
};

export default Home;
