import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Globe, Zap, Users, Building2, ShoppingBag, Hotel, Stethoscope, Briefcase } from 'lucide-react';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { useSEO } from '@/hooks/useSEO';
import { useTranslation } from 'react-i18next';

const PartnerWithUs = () => {
  const { t } = useTranslation();
  useSEO({
    path: '/partner',
    title: 'Build Your Own AI Digital Employee | Ovela',
    description: 'Transform websites, customer communication, and lead engagement into real-time business interaction powered by AI representatives trained specifically for your industry.'
  });

  const openChat = () => {
    window.location.href = '/?chat=open';
  };

  const capabilities = [
    {
      title: 'Interactive Brand Campaigns',
      description: 'Create AI-powered campaigns that continue communicating after the first click — helping visitors explore services, ask questions, and engage with your business in real time.',
      bullets: ['AI-powered social campaigns', 'Product & service presentation', 'Interactive advertising experiences', 'AI brand representatives']
    },
    {
      title: 'Deploy an AI Team Member',
      description: 'Deploy an existing Ovela AI representative or create a custom AI digital employee trained specifically for your business, communication style, and customer journey.',
      bullets: ['AI website receptionist', 'Product specialist', 'Property presenter', 'Client concierge', 'Brand representative'],
      note: 'Available 24/7 in multiple languages.'
    },
    {
      title: 'Custom Digital Representatives',
      description: 'Every business communicates differently. Ovela designs AI representatives aligned with your industry, audience, workflows, and customer communication needs.',
      bullets: ['Custom appearance', 'Brand voice', 'Industry expertise', 'Multilingual interaction', 'CRM & booking integration']
    }
  ];

  const isabellaCapabilities = [
    'Answer questions',
    'Present services',
    'Recommend solutions',
    'Book appointments',
    'Capture leads',
    'Qualify leads',
    'Guide customer journeys'
  ];

  const useCases = [
    { icon: Stethoscope, industry: 'Healthcare', desc: 'Patient communication & appointment booking' },
    { icon: Building2, industry: 'Real Estate', desc: 'AI property presentation & buyer engagement' },
    { icon: Zap, industry: 'Technology', desc: 'Product explanation & lead qualification' },
    { icon: Hotel, industry: 'Hospitality', desc: 'AI concierge & guest communication' },
    { icon: Briefcase, industry: 'Professional Services', desc: 'Client onboarding & information management' }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0A0A1C 0%, #111128 50%, #0A0A1C 100%)' }}>

      {/* ═══ HERO ═══ */}
      <section className="relative flex items-center min-h-[80vh]" style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(212,175,55,0.08) 0%, transparent 60%)'
      }}>
        <div className="container mx-auto px-6 lg:px-20 pt-28 pb-16 text-center">
          <h1
            className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            style={{ color: '#D4AF37' }}
          >
            Build Your Own Interactive<br className="hidden md:block" /> AI Team Member
          </h1>
          <p
            className="text-lg sm:text-xl max-w-3xl mx-auto mb-6 leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif', color: '#EDEDED', fontWeight: 300 }}
          >
            Transform websites, campaigns and customer interactions into real-time conversations powered by custom AI representatives trained for your business.
          </p>
          <p
            className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif', color: '#D4AF37', fontWeight: 400 }}
          >
            Healthcare. Real Estate. Technology. Hospitality. Premium Services.<br />
            <span style={{ color: '#EDEDED' }}>Available 24/7. Multilingual. Always on.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={openChat}
              className="group flex items-center gap-2 px-10 py-4 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 cursor-pointer border-none"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)',
                color: '#000',
                boxShadow: '0 8px 30px rgba(212,175,55,0.4)'
              }}
            >
              Start Your Project
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={openChat}
              className="text-base transition-all duration-300 hover:underline cursor-pointer bg-transparent border-none"
              style={{ color: '#D4AF37', fontFamily: 'Inter, sans-serif' }}
            >
              Talk With Isabella →
            </button>
          </div>
        </div>
      </section>

      {/* divider */}
      <div className="mx-auto w-4/5 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', boxShadow: '0 0 10px rgba(212,175,55,0.5)' }} />

      {/* ═══ SECTION 1 — WHAT YOU CAN BUILD ═══ */}
      <section className="py-24">
        <div className="container mx-auto px-6 lg:px-20">
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-center mb-16" style={{ color: '#D4AF37' }}>
            What You Can Build Through Ovela
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {capabilities.map((cap, i) => (
              <div
                key={i}
                className="group rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2"
                style={{
                  background: 'rgba(26,26,46,0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(212,175,55,0.25)',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 35px rgba(212,175,55,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <h3 className="font-playfair text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>{cap.title}</h3>
                <p className="text-base leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#EDEDED' }}>{cap.description}</p>
                <ul className="space-y-2 mb-3">
                  {cap.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#ccc' }}>
                      <span style={{ color: '#D4AF37' }}>✦</span> {b}
                    </li>
                  ))}
                </ul>
                {cap.note && <p className="text-sm italic" style={{ color: '#D4AF37', fontFamily: 'Inter, sans-serif' }}>{cap.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* divider */}
      <div className="mx-auto w-4/5 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', boxShadow: '0 0 10px rgba(212,175,55,0.5)' }} />

      {/* ═══ SECTION 2 — WHY THIS WORKS ═══ */}
      <section className="py-24" style={{ background: 'rgba(212,175,55,0.03)' }}>
        <div className="container mx-auto px-6 lg:px-20 text-center">
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold mb-10" style={{ color: '#D4AF37' }}>
            Why Brands Are Switching to Interactive AI
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto mb-10">
            {[
              { icon: Users, stat: '2–3×', label: 'longer visitor engagement with interactive experiences' },
              { icon: Zap, stat: 'Instant', label: 'AI hosts answer immediately — no lost leads' },
              { icon: Globe, stat: '24/7', label: 'campaigns become scalable and always active' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <item.icon className="w-8 h-8" style={{ color: '#D4AF37' }} />
                <span className="font-playfair text-3xl font-bold" style={{ color: '#FFFFFF' }}>{item.stat}</span>
                <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#ccc' }}>{item.label}</span>
              </div>
            ))}
          </div>
          <p className="text-base italic max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif', color: '#D4AF37' }}>
            While traditional content waits to be discovered, interactive experiences continue working around the clock.
          </p>
        </div>
      </section>

      {/* divider */}
      <div className="mx-auto w-4/5 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', boxShadow: '0 0 10px rgba(212,175,55,0.5)' }} />

      {/* ═══ SECTION 3 — DIFFERENTIATION ═══ */}
      <section className="py-24">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold mb-6" style={{ color: '#D4AF37' }}>
              More Than Content. More Than Chat.
            </h2>
            <p className="text-lg leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#EDEDED', fontWeight: 300 }}>
              Traditional websites inform. Interactive team members engage.
            </p>
            <p className="text-base leading-relaxed mb-8" style={{ fontFamily: 'Inter, sans-serif', color: '#ccc', fontWeight: 300 }}>
              Ovela representatives become part of your customer journey by helping visitors understand, explore and take action.
            </p>
            <p className="text-base mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#ccc' }}>They can:</p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {isabellaCapabilities.map((cap, i) => (
                <span
                  key={i}
                  className="px-5 py-2 rounded-full text-sm font-medium"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    border: '1px solid rgba(212,175,55,0.4)',
                    color: '#D4AF37',
                    background: 'rgba(212,175,55,0.08)'
                  }}
                >
                  {cap}
                </span>
              ))}
            </div>
            <p className="font-playfair text-lg tracking-wider" style={{ color: '#D4AF37' }}>
              Presentation → Interaction → Conversion
            </p>
          </div>
        </div>
      </section>

      {/* divider */}
      <div className="mx-auto w-4/5 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', boxShadow: '0 0 10px rgba(212,175,55,0.5)' }} />

      {/* ═══ SECTION 4 — USE CASES ═══ */}
      <section className="py-24" style={{ background: 'rgba(212,175,55,0.03)' }}>
        <div className="container mx-auto px-6 lg:px-20 text-center">
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold mb-12" style={{ color: '#D4AF37' }}>
            Built For Real Industries
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {useCases.map((uc, i) => (
              <div
                key={i}
                className="rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'rgba(26,26,46,0.5)',
                  border: '1px solid rgba(212,175,55,0.2)'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; }}
              >
                <uc.icon className="w-8 h-8 mx-auto mb-3" style={{ color: '#D4AF37' }} />
                <h3 className="font-playfair text-lg font-bold mb-2" style={{ color: '#FFFFFF' }}>{uc.industry}</h3>
                <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#ccc' }}>{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* divider */}
      <div className="mx-auto w-4/5 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', boxShadow: '0 0 10px rgba(212,175,55,0.5)' }} />

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-28 text-center">
        <div className="container mx-auto px-6 lg:px-20">
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold mb-6" style={{ color: '#D4AF37' }}>
            Let's Build Your Interactive Team Member
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#EDEDED', fontWeight: 300 }}>
            Whether you need a digital receptionist, property presenter, product specialist or brand ambassador, Ovela can design an AI representative aligned with your business and audience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={openChat}
              className="group flex items-center gap-2 px-10 py-4 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 cursor-pointer border-none"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)',
                color: '#000',
                boxShadow: '0 8px 30px rgba(212,175,55,0.4)'
              }}
            >
              Start Your Project
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={openChat}
              className="text-base transition-all duration-300 hover:underline cursor-pointer bg-transparent border-none"
              style={{ color: '#D4AF37', fontFamily: 'Inter, sans-serif' }}
            >
              Talk With Isabella →
            </button>
          </div>
        </div>
      </section>

      <FooterMinimal />

      {/* Floating Ask Isabella */}
      <button
        onClick={openChat}
        className="isabella-floating-btn flex items-center gap-2 px-5 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-none"
        style={{
          background: 'linear-gradient(135deg, #D4AF37, #F7E7CE)',
          color: '#000',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: '14px',
          boxShadow: '0 4px 20px rgba(212,175,55,0.5)'
        }}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="btn-label">Ask Isabella</span>
      </button>
    </div>
  );
};

export default PartnerWithUs;
