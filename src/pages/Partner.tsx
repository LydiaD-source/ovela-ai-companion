import React from 'react';
import { ArrowRight, CheckCircle, Clock, DollarSign, Zap, Globe, Users, Target } from 'lucide-react';
import Section from '@/components/UI/Section';
import { useWellnessGeniChat } from '@/hooks/useWellnessGeniChat';
import { Button } from '@/components/ui/button';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { useTranslation } from 'react-i18next';

const Partner = () => {
  const { startChat, isConnecting } = useWellnessGeniChat();
  const { t } = useTranslation();

  const services = [
    { icon: Users, titleKey: 'partner.services.brandBuilding.title', descKey: 'partner.services.brandBuilding.desc' },
    { icon: Target, titleKey: 'partner.services.productPromotions.title', descKey: 'partner.services.productPromotions.desc' },
    { icon: Globe, titleKey: 'partner.services.modelingContracts.title', descKey: 'partner.services.modelingContracts.desc' },
    { icon: Zap, titleKey: 'partner.services.whiteLabelAI.title', descKey: 'partner.services.whiteLabelAI.desc' },
    { icon: CheckCircle, titleKey: 'partner.services.anySize.title', descKey: 'partner.services.anySize.desc' },
    { icon: Clock, titleKey: 'partner.services.customProjects.title', descKey: 'partner.services.customProjects.desc' }
  ];

  const benefits = [
    { icon: Clock, titleKey: 'partner.benefits.available.title', descKey: 'partner.benefits.available.desc' },
    { icon: Zap, titleKey: 'partner.benefits.fast.title', descKey: 'partner.benefits.fast.desc' },
    { icon: DollarSign, titleKey: 'partner.benefits.costEffective.title', descKey: 'partner.benefits.costEffective.desc' },
    { icon: CheckCircle, titleKey: 'partner.benefits.reliable.title', descKey: 'partner.benefits.reliable.desc' },
    { icon: Globe, titleKey: 'partner.benefits.novelty.title', descKey: 'partner.benefits.novelty.desc' }
  ];

  const steps = [
    { step: '01', titleKey: 'partner.process.step1.title', descKey: 'partner.process.step1.desc' },
    { step: '02', titleKey: 'partner.process.step2.title', descKey: 'partner.process.step2.desc' },
    { step: '03', titleKey: 'partner.process.step3.title', descKey: 'partner.process.step3.desc' }
  ];

  return (
    <div className="pt-16">
      <Section className="text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-xl mb-8">
            {t('partner.title')} <span className="gradient-text">Isabella</span>
          </h1>
          <p className="body-lg text-muted-foreground">
            {t('partner.subtitle')}
          </p>
        </div>
      </Section>

      {/* Services We Offer */}
      <Section background="gray">
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-6">{t('partner.servicesTitle')}</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-border/50 hover-lift text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 flex items-center justify-center">
                <service.icon className="w-8 h-8 text-electric-blue" />
              </div>
              <h3 className="heading-sm mb-3">{t(service.titleKey)}</h3>
              <p className="text-muted-foreground text-sm">{t(service.descKey)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Why Work With Us */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-6">{t('partner.whyWorkTitle')}</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="heading-sm mb-2">{t(benefit.titleKey)}</h3>
              <p className="text-muted-foreground text-sm">{t(benefit.descKey)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Collaboration Promise */}
      <Section background="gray">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading-lg mb-8">{t('partner.promiseTitle')}</h2>
          <p className="body-lg text-muted-foreground leading-relaxed mb-8">
            {t('partner.promiseDescription')}
          </p>
        </div>
      </Section>

      {/* Hiring Process */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="heading-lg mb-6">{t('partner.processTitle')}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, idx) => (
            <div key={idx} className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-white text-xl font-bold">{step.step}</span>
              </div>
              <h3 className="heading-sm mb-4">{t(step.titleKey)}</h3>
              <p className="text-muted-foreground">{t(step.descKey)}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a href="/#chat">
            <Button 
              variant="default" 
              size="lg" 
              className="btn-gradient group"
            >
              {t('partner.chatButton')}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
          <p className="text-sm text-muted-foreground mt-4">
            {t('partner.chatSubtext')}
          </p>
        </div>
      </Section>
      <FooterMinimal />
    </div>
  );
};

export default Partner;