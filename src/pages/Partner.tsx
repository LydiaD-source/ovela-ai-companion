
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, DollarSign, Zap, Globe, Users, Target } from 'lucide-react';
import Section from '@/components/UI/Section';
import { Button } from '@/components/ui/button';

const Partner = () => {
  // Internal route to our Ovela guest Isabella interface
  const isabellaNaviaUrl = "/guest/isabella?source=ovela";

  return (
    <div className="pt-16">
      <Section className="text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-xl mb-8">
            Partner With <span className="gradient-text">Isabella</span>
          </h1>
          <p className="body-lg text-muted-foreground">
            The most flexible AI model you'll ever work with. No demands, no delays, unlimited possibilities.
          </p>
        </div>
      </Section>

      {/* Services We Offer */}
      <Section background="gray">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-6">Services We Offer</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Users, title: 'Brand Building & Representation', desc: 'Complete brand voice and identity management' },
            { icon: Target, title: 'Product Promotions', desc: 'Targeted campaigns that convert audiences' },
            { icon: Globe, title: 'Modeling Contracts', desc: 'Short & long term modeling agreements' },
            { icon: Zap, title: 'White-Label AI Licensing', desc: 'Custom AI solutions for your business' },
            { icon: CheckCircle, title: 'Any Size, Any Industry', desc: 'Scalable solutions for every business type' },
            { icon: Clock, title: 'Custom Projects', desc: 'Tailored campaigns for unique requirements' }
          ].map((service, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-border/50 hover-lift text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 flex items-center justify-center">
                <service.icon className="w-8 h-8 text-electric-blue" />
              </div>
              <h3 className="heading-sm mb-3">{service.title}</h3>
              <p className="text-muted-foreground text-sm">{service.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Why Work With Us */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-6">Why Work With Us?</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {[
            { icon: Clock, title: 'Always Available', desc: '24/7 accessibility' },
            { icon: Zap, title: 'Fast & Scalable', desc: 'No scheduling conflicts' },
            { icon: DollarSign, title: 'Cost-Effective', desc: 'Consistent results' },
            { icon: CheckCircle, title: 'Reliable', desc: 'Never late' },
            { icon: Globe, title: 'Novelty Factor', desc: 'AI wow-effect' }
          ].map((benefit, idx) => (
            <div key={idx} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="heading-sm mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Collaboration Promise */}
      <Section background="gray">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-lg mb-8">Our Collaboration Promise</h2>
          <p className="body-lg text-muted-foreground leading-relaxed mb-8">
            Isabella is the most flexible model you'll ever work with. She's not demanding, she never misses deadlines, and she can take on multiple assignments at once. Unlike human models, Isabella delivers consistency, speed, and adaptability. That's why brands are turning to AI models: to avoid the delays, costs, and limitations of traditional talent.
          </p>
        </div>
      </Section>

      {/* Hiring Process */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-6">Easy 3-Step Process</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              step: '01',
              title: 'Talk to Isabella',
              desc: 'Start chatting with her directly about your needs'
            },
            {
              step: '02', 
              title: 'Define Your Campaign',
              desc: 'Isabella gathers requirements for industry, terms, and scope'
            },
            {
              step: '03',
              title: 'Launch & Deliver',
              desc: 'Isabella activates campaigns while Ovela ensures integration'
            }
          ].map((step, idx) => (
            <div key={idx} className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-white text-xl font-bold">{step.step}</span>
              </div>
              <h3 className="heading-sm mb-4">{step.title}</h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to={isabellaNaviaUrl}>
            <Button variant="default" size="lg" className="btn-gradient group">
              Start Your Project Today
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Connect with Isabella through WellnessGeni integration
          </p>
        </div>
      </Section>
    </div>
  );
};

export default Partner;
