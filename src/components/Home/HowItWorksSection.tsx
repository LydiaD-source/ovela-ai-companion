import React from 'react';
import { MessageCircle, Camera, BookOpen, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: MessageCircle,
    title: 'Chat with Isabella',
    description: 'Start a conversation to explore what she can do for your brand'
  },
  {
    icon: Camera,
    title: 'Book a Shoot or Campaign',
    description: 'Choose from ready-made looks or create custom visuals'
  },
  {
    icon: BookOpen,
    title: 'Review Lookbook',
    description: 'Browse portfolio examples and finalize your selections'
  },
  {
    icon: Sparkles,
    title: 'Design Your Own Ambassador',
    description: 'Build a custom AI model tailored to your brand identity'
  }
];

export const HowItWorksSection = () => {
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
          How It Works
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
                  {step.title}
                </h3>
                <p
                  className="text-base"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#FFFFFF'
                  }}
                >
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
