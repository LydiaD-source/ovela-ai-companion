import React from 'react';
import { ArrowRight, DollarSign, Zap, Palette, CheckCircle, Star, Globe, Mic, BarChart3, Sparkles } from 'lucide-react';
import Section from '@/components/UI/Section';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Pricing = () => {
  // Direct link to WellnessGeni with Promoter persona and clean UI for Ovela visitors
  const isabellaNaviaUrl = "https://wellnessgeni.app/promoter?source=ovela&ref=ovela&persona=isabella-navia&hide_personas=true&marketing_mode=true";

  const scrollToPlans = () => {
    const plansSection = document.getElementById('pricing-plans');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <Section className="text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 via-transparent to-neon-purple/5 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="heading-xl mb-6">
            Affordable. Scalable. <span className="gradient-text">Always On.</span>
            <br />
            Isabella works when others can't.
          </h1>
          <p className="body-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
            Give your brand a face that never sleeps, never cancels, and always shines.
          </p>
          <Button 
            onClick={scrollToPlans}
            size="lg" 
            className="btn-gradient group animate-glow"
          >
            See Plans
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-electric-blue/20 to-transparent blur-xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-neon-purple/20 to-transparent blur-xl" />
      </Section>

      {/* Why Choose Isabella - Bubble Highlights */}
      <Section background="gray">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-6">Why Choose Isabella?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: DollarSign,
              title: 'More Affordable Than Humans',
              description: 'One month with Isabella costs less than one sponsored post from a human influencer.',
              gradient: 'from-green-400 to-emerald-600'
            },
            {
              icon: Zap,
              title: 'Always On',
              description: 'She never takes a sick day, vacation, or break.',
              gradient: 'from-electric-blue to-blue-600'
            },
            {
              icon: Palette,
              title: 'Customizable',
              description: 'Every client gets a unique Isabella persona tailored to their brand.',
              gradient: 'from-neon-purple to-purple-600'
            }
          ].map((benefit, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/10 to-neon-purple/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <Card className="relative p-8 text-center hover-lift bg-background/80 backdrop-blur-sm border-border/50 rounded-3xl">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shadow-2xl`}>
                  <benefit.icon className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="heading-sm mb-4">{benefit.title}</CardTitle>
                <CardDescription className="text-base">{benefit.description}</CardDescription>
              </Card>
            </div>
          ))}
        </div>
      </Section>

      {/* Pricing Table */}
      <Section id="pricing-plans">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-6">Choose Your Isabella Package</h2>
          <p className="body-md text-muted-foreground">Transparent pricing, no hidden fees, incredible value</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {[
            {
              name: 'Starter',
              price: '$1,500',
              period: '/month',
              description: 'Perfect for small brands getting started',
              features: ['8 posts per month', '4 stories per month', 'Basic brand customization', '24/7 availability', 'Standard resolution'],
              popular: false
            },
            {
              name: 'Growth',
              price: '$3,500',
              period: '/month',
              description: 'Ideal for growing businesses',
              features: ['12 posts per month', '8 stories per month', '2 Reels per month', 'Advanced customization', 'HD quality content', 'Priority support'],
              popular: true
            },
            {
              name: 'Premium',
              price: '$6,000',
              period: '/month',
              description: 'For enterprise-level campaigns',
              features: ['20 posts per month', '12 stories per month', '4 Reels per month', 'Trend insights included', '4K quality content', 'Dedicated account manager', 'Custom integrations'],
              popular: false
            }
          ].map((plan, idx) => (
            <Card key={idx} className={`relative p-8 hover-lift ${plan.popular ? 'ring-2 ring-electric-blue shadow-2xl scale-105' : ''} bg-background border-border/50`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-electric-blue to-neon-purple text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="heading-md mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.features.map((feature, featureIdx) => (
                  <div key={featureIdx} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-electric-blue flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                <a href={isabellaNaviaUrl} target="_blank" rel="noopener noreferrer">
                  <Button 
                    className={`w-full mt-8 ${plan.popular ? 'btn-gradient' : 'btn-outline'}`}
                    size="lg"
                  >
                    Work With Isabella
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Special Services */}
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              name: 'Ambassador Video',
              price: 'From $750',
              description: '60-second branded spokesperson video',
              icon: Star
            },
            {
              name: 'Website Integration',
              price: '$2,000 setup + $500/month',
              description: 'Setup + custom template + interactive Isabella',
              icon: Globe
            }
          ].map((service, idx) => (
            <Card key={idx} className="p-6 hover-lift bg-gradient-to-br from-background to-muted/30 border-border/50">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center flex-shrink-0">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="heading-sm mb-2">{service.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">{service.price}</span>
                    <a href={isabellaNaviaUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">Work With Isabella</Button>
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Add-Ons Section */}
      <Section background="gray">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-6">Powerful Add-Ons</h2>
          <p className="body-md text-muted-foreground">Enhance your Isabella experience with these premium features</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Palette, name: 'LoRA Custom Training', price: '$2,000' },
            { icon: Mic, name: 'Custom Voice (ElevenLabs)', price: '$500 per style' },
            { icon: Globe, name: 'Multi-Language Support', price: '$1,200 per language' },
            { icon: BarChart3, name: 'Analytics Dashboard', price: '$750 setup + $300/month' }
          ].map((addon, idx) => (
            <Card key={idx} className="p-6 text-center hover-lift bg-background border-border/50">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 flex items-center justify-center">
                <addon.icon className="w-8 h-8 text-electric-blue" />
              </div>
              <h3 className="font-semibold mb-2">{addon.name}</h3>
              <p className="text-electric-blue font-bold">{addon.price}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Proof of Value Section */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-6">Isabella vs. Top AI Influencers</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {[
            {
              competitor: 'Lil Miquela',
              cost: '$10k per post',
              comparison: 'Isabella gives you the same cutting-edge impact for a fraction of the cost.'
            },
            {
              competitor: 'Aitana Lopez',
              cost: '€10k/month with fewer followers',
              comparison: 'Isabella offers more flexibility and lower cost.'
            }
          ].map((comparison, idx) => (
            <Card key={idx} className="p-8 bg-gradient-to-br from-electric-blue/5 to-neon-purple/5 border-electric-blue/20 hover-lift">
              <div className="text-center">
                <h3 className="heading-sm mb-4">{comparison.competitor}</h3>
                <p className="text-2xl font-bold text-electric-blue mb-4">{comparison.cost}</p>
                <p className="text-muted-foreground">{comparison.comparison}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-electric-blue to-neon-purple p-6 rounded-2xl text-white">
            <Sparkles className="w-6 h-6" />
            <span className="text-xl font-bold">With Isabella, you're not just keeping up — you're staying ahead.</span>
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </Section>

      {/* Final CTA Section */}
      <Section background="dark" className="text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="heading-lg mb-8 text-soft-white">
            Your brand deserves more than a chatbot.
            <br />
            <span className="gradient-text">Let Isabella elevate your story.</span>
          </h2>
          <a href={isabellaNaviaUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="btn-gradient group text-lg px-12 py-6 animate-glow">
              Work With Isabella Today
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
          <p className="text-soft-white/70 mt-6 text-lg">
            Connect with Isabella through WellnessGeni integration
          </p>
        </div>
        {/* Decorative glow effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 via-transparent to-neon-purple/10 pointer-events-none" />
      </Section>
    </div>
  );
};

export default Pricing;
