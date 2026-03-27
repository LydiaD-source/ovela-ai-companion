import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Clock, MessageCircle, ArrowRight, Sparkles, Globe, Users, Palette, Handshake, Megaphone } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();

  useSEO({
    path: '/contact',
    title: 'Contact Ovela Interactive | Start Your AI Project Today',
    description: 'Get in touch with Ovela Interactive. Chat with Isabella, our AI ambassador, for instant answers about interactive campaigns, digital ambassadors, and AI-powered business solutions.'
  });

  const handleStartChat = () => {
    window.location.href = '/?chat=open';
  };

  const services = [
    { icon: Users, label: 'AI brand ambassadors' },
    { icon: Globe, label: 'Interactive website hosts' },
    { icon: Megaphone, label: 'Campaigns & product launches' },
    { icon: Palette, label: 'Custom AI personas' },
    { icon: Handshake, label: 'Licensing & partnerships' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0A0A23 0%, #1a1a3e 100%)' }}>
      {/* Hero */}
      <section className="relative w-full pt-24 pb-12 md:pt-32 md:pb-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <Sparkles size={16} style={{ color: '#D4AF37' }} />
            <span className="text-sm font-medium" style={{ color: '#D4AF37' }}>Let's build something extraordinary</span>
          </div>
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl mb-6" style={{ color: '#D4AF37' }}>
            Start Your AI Project Today
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Whether you're building an interactive campaign, deploying a digital ambassador, or exploring AI for your business — we'll help you get started quickly.
          </p>
        </div>
      </section>

      {/* Chat First — Primary CTA */}
      <section className="w-full py-12 px-4">
        <div className="max-w-2xl mx-auto rounded-2xl p-8 md:p-12 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)', border: '1px solid rgba(212,175,55,0.4)' }}>
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #D4AF37 0%, transparent 50%)' }} />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37, #F7E7CE)' }}>
              <MessageCircle size={28} color="#0A0A23" />
            </div>
            <h2 className="font-playfair text-2xl md:text-4xl mb-4" style={{ color: '#D4AF37' }}>
              Talk to Isabella — Get Instant Answers
            </h2>
            <p className="mb-8 max-w-lg mx-auto text-base md:text-lg" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Describe your idea, and Isabella will guide you through possibilities, pricing, and next steps in real time.
            </p>
            <Button
              onClick={handleStartChat}
              size="lg"
              className="text-lg px-10 py-7 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)', color: '#0A0A23', fontWeight: 700 }}
            >
              Start Conversation with Isabella
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* What We Can Help You Build */}
      <section className="w-full py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-playfair text-3xl md:text-4xl text-center mb-10" style={{ color: '#D4AF37' }}>
            What We Can Help You Build
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s, i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-xl transition-all duration-300 hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,175,55,0.15)' }}>
                  <s.icon size={20} style={{ color: '#D4AF37' }} />
                </div>
                <span className="font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-xs mx-auto h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }} />

      {/* Direct Contact — Secondary */}
      <section className="w-full py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-playfair text-2xl md:text-3xl text-center mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Prefer Direct Contact?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { icon: Mail, title: 'Email', value: 'support@ovelainteractive.com', href: 'mailto:support@ovelainteractive.com' },
              { icon: MapPin, title: 'Location', value: 'Andorra La Vella' },
              { icon: Clock, title: 'Hours', value: 'Monday–Friday\n9am–6pm CET' },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <item.icon size={24} className="mx-auto mb-3" style={{ color: '#D4AF37' }} />
                <h3 className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>{item.title}</h3>
                {item.href ? (
                  <a href={item.href} className="hover:opacity-80 transition-opacity text-sm" style={{ color: '#D4AF37' }}>{item.value}</a>
                ) : (
                  <p className="text-sm whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-playfair text-3xl md:text-5xl mb-4" style={{ color: '#D4AF37' }}>
            Let's Build Something That Works 24/7
          </h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Your AI ambassador can be live in days — not months.
          </p>
          <Button
            onClick={handleStartChat}
            size="lg"
            className="text-lg px-10 py-7 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)', color: '#0A0A23', fontWeight: 700 }}
          >
            Start with Isabella Now
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 px-4 border-t" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
        <div className="max-w-6xl mx-auto text-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <p>Ovela Interactive © 2025 — AI-Powered Interactive Modeling & Marketing</p>
        </div>
      </footer>

      {/* Floating Ask Isabella */}
      <button
        onClick={handleStartChat}
        className="isabella-floating-btn flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
        style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)', color: '#0A0A23', fontWeight: 600 }}
      >
        <MessageCircle size={20} />
        Ask Isabella
      </button>
    </div>
  );
};

export default Contact;
