import React from 'react';
import { MessageSquare, Cpu, Users } from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    title: 'Real-Time Conversation',
    description: 'Isabella engages visitors instantly — answering questions, explaining services, and guiding decisions through natural dialogue.',
  },
  {
    icon: Cpu,
    title: 'AI-Powered Intelligence',
    description: 'Backed by brand-specific knowledge, Isabella understands products, pricing, and promotions — delivering accurate, on-brand responses.',
  },
  {
    icon: Users,
    title: 'Visitor to Client',
    description: 'From initial curiosity to booked appointment — Isabella converts passive browsers into active clients, 24/7.',
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h3
          className="text-center text-2xl md:text-3xl font-bold mb-14"
          style={{ fontFamily: 'Playfair Display, serif', color: 'hsl(var(--champagne-gold))' }}
        >
          How It Works
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="text-center p-8 rounded-2xl transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: 'hsl(var(--deep-navy) / 0.6)',
                border: '1px solid hsl(var(--champagne-gold) / 0.15)',
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'hsl(var(--champagne-gold) / 0.12)' }}
              >
                <step.icon className="w-6 h-6" style={{ color: 'hsl(var(--champagne-gold))' }} />
              </div>
              <h4
                className="text-lg font-semibold mb-3"
                style={{ color: 'hsl(var(--champagne-gold))' }}
              >
                {step.title}
              </h4>
              <p
                className="text-sm font-light leading-relaxed"
                style={{ color: 'hsl(var(--soft-white) / 0.75)' }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
