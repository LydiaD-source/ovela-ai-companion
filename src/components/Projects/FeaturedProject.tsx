import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Play } from 'lucide-react';

const FeaturedProject = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Label */}
        <div className="text-center mb-8">
          <Badge
            className="mb-4 text-xs tracking-[0.2em] uppercase border-[hsl(var(--champagne-gold))] text-[hsl(var(--champagne-gold))] bg-[hsl(var(--champagne-gold)/0.1)]"
            variant="outline"
          >
            Live Implementation
          </Badge>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: 'Playfair Display, serif', color: 'hsl(var(--champagne-gold))' }}
          >
            WellnessSpirit Institute
          </h2>
          <p className="text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'hsl(var(--soft-white))' }}
          >
            Interactive AI Host
          </p>
        </div>

        {/* Video Player Placeholder */}
        <div
          className="relative rounded-2xl overflow-hidden mx-auto mb-8"
          style={{
            aspectRatio: '16/9',
            background: 'linear-gradient(135deg, hsl(var(--deep-navy)), hsl(var(--midnight-blue)))',
            border: '1px solid hsl(var(--champagne-gold) / 0.3)',
            boxShadow: '0 0 40px hsl(var(--champagne-gold) / 0.15)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer transition-transform hover:scale-110"
                style={{
                  background: 'hsl(var(--champagne-gold) / 0.2)',
                  border: '2px solid hsl(var(--champagne-gold) / 0.5)',
                }}
              >
                <Play className="w-8 h-8 ml-1" style={{ color: 'hsl(var(--champagne-gold))' }} />
              </div>
              <p className="text-sm" style={{ color: 'hsl(var(--champagne-gold) / 0.7)' }}>
                Video Coming Soon
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <p
            className="text-base md:text-lg font-light leading-relaxed"
            style={{ color: 'hsl(var(--soft-white) / 0.85)' }}
          >
            Isabella operates as a real-time digital concierge — guiding users, explaining treatments,
            and converting visitors into booked clients. This project demonstrates how AI replaces
            static websites with interactive experiences.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="https://wellnespirit.com/en" target="_blank" rel="dofollow noopener">
            <Button
              className="px-8 py-6 text-base font-medium transition-all duration-300 hover:scale-105"
              style={{
                background: 'hsl(var(--champagne-gold))',
                color: 'hsl(var(--deep-navy))',
                boxShadow: '0 4px 20px hsl(var(--champagne-gold) / 0.3)',
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Live Project
            </Button>
          </a>
          <Button
            variant="outline"
            className="px-8 py-6 text-base font-medium transition-all duration-300 hover:scale-105"
            style={{
              borderColor: 'hsl(var(--champagne-gold) / 0.4)',
              color: 'hsl(var(--champagne-gold))',
              background: 'transparent',
            }}
            onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            How It Works
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProject;
