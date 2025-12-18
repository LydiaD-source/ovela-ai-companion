import React from 'react';
import { ArrowRight, CheckCircle, Heart, Brain, Clock, Users } from 'lucide-react';
import Section from '@/components/UI/Section';
import { Button } from '@/components/ui/button';
import placeholder1 from '@/assets/wellnessgeni-placeholder1.png';
import placeholder2 from '@/assets/wellnessgeni-placeholder2.png';
import { useSEO } from '@/hooks/useSEO';
import { useTranslation } from 'react-i18next';

const WellnessGeni = () => {
  const { t } = useTranslation();
  useSEO({
    path: '/wellnessgeni',
    title: t('seo.wellnessgeni.title', 'WellnessGeni | AI Wellness Companion by Ovela'),
    description: t('seo.wellnessgeni.description', 'Discover WellnessGeni, where Isabella first appeared as an AI wellness coach. The app that started it all — personalized wellness guidance powered by AI.')
  });
  // Direct link to WellnessGeni guest route with Isabella Navia persona for Ovela visitors
  const isabellaGuestUrl = "https://isabela-soul-connect.lovable.app/guest?persona=isabella-navia&source=ovela&ref=ovela&hide_personas=true&marketing_mode=true";

  return (
    <div className="pt-16">
      <Section className="text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-xl mb-8">
            <span className="gradient-text">WellnessGeni</span>
          </h1>
          <p className="body-lg text-muted-foreground mb-8">
            The App That Started It All
          </p>
        </div>
      </Section>

      {/* App Showcase */}
      <Section background="gray">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="heading-lg mb-8">Your AI Wellness Companion</h2>
            
            <div className="space-y-6 mb-8">
              {[
                { icon: Heart, text: 'Daily guided support' },
                { icon: Brain, text: 'Adaptive wellness advice' },
                { icon: Users, text: 'Personalized AI interaction' },
                { icon: Clock, text: 'Always available companion' }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-electric-blue" />
                  </div>
                  <span className="body-md">{feature.text}</span>
                </div>
              ))}
            </div>

            <a href={isabellaGuestUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="default" className="btn-gradient">
                Explore WellnessGeni
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </div>
          
          <div>
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={placeholder1} 
                  alt="WellnessGeni Welcome Screen - Always Present, Always Personal, Always For You"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-3xl overflow-hidden shadow-2xl mt-8">
                <img 
                  src={placeholder2} 
                  alt="WellnessGeni Chat Interface - Isabella Trainer Mode Active"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-6">How WellnessGeni Works</h2>
          <p className="body-md text-muted-foreground max-w-2xl mx-auto">
            WellnessGeni was where Isabella first proved that AI companions could provide meaningful, personalized interactions at scale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Personal Assessment',
              desc: 'Isabella learns about your wellness goals and preferences'
            },
            {
              step: '02',
              title: 'Adaptive Guidance',
              desc: 'Receives personalized recommendations and daily support'
            },
            {
              step: '03',
              title: 'Continuous Growth',
              desc: 'Isabella evolves with you, providing increasingly relevant advice'
            }
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-white font-bold">{item.step}</span>
              </div>
              <h3 className="heading-sm mb-3">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="dark">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="heading-lg mb-6 text-soft-white">
            See Isabella in Action
          </h2>
          <p className="body-md text-soft-white/80 mb-8">
            Experience firsthand how Isabella creates meaningful connections and provides personalized support through WellnessGeni.
          </p>
          <a href={isabellaGuestUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="default" size="lg" className="btn-gradient">
              Launch WellnessGeni App
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>
      </Section>
    </div>
  );
};

export default WellnessGeni;
