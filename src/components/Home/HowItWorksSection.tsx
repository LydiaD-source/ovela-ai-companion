import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Camera, BookOpen, Sparkles } from 'lucide-react';

export const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: MessageCircle,
      titleKey: 'howItWorks.step1.title',
      descriptionKey: 'howItWorks.step1.description'
    },
    {
      icon: Camera,
      titleKey: 'howItWorks.step2.title',
      descriptionKey: 'howItWorks.step2.description'
    },
    {
      icon: BookOpen,
      titleKey: 'howItWorks.step3.title',
      descriptionKey: 'howItWorks.step3.description'
    },
    {
      icon: Sparkles,
      titleKey: 'howItWorks.step4.title',
      descriptionKey: 'howItWorks.step4.description'
    }
  ];

  return (
    <section
      className="w-full py-16 md:py-20"
      style={{ background: '#0D0D1A' }}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <h2
          className="font-playfair text-3xl md:text-4xl text-center mb-12 md:mb-16"
          style={{
            fontFamily: 'Playfair Display, serif',
            color: '#E8CFA9'
          }}
        >
          {t('howItWorks.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <Icon
                    size={40}
                    strokeWidth={1.5}
                    style={{ color: '#E8CFA9' }}
                  />
                </div>
                <h3
                  className="font-playfair text-xl mb-3"
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    color: '#E8CFA9'
                  }}
                >
                  {t(step.titleKey)}
                </h3>
                <p
                  className="text-base"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#FFFFFF'
                  }}
                >
                  {t(step.descriptionKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
