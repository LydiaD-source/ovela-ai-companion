import React from 'react';
import { Check, ArrowRight, MessageCircle, Sparkles, Building2, Heart, Home as HomeIcon, Cpu, Hotel, Users, Briefcase, Globe, Mic, Palette, Database, Plug } from 'lucide-react';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { useSEO } from '@/hooks/useSEO';
import { useStructuredData, serviceSchema, organizationSchema, pricingServiceSchemas, createWebPageSchema } from '@/hooks/useStructuredData';
import { Badge } from '@/components/ui/badge';

const GOLD = '#D4AF37';
const NAVY = '#0A0A23';

const chatHref = '/?chat=open';

const SectionHeader = ({ kicker, title, subtitle }: { kicker?: string; title: string; subtitle?: string }) => (
  <div className="text-center max-w-3xl mx-auto mb-14">
    {kicker && (
      <p className="mb-3 tracking-[0.3em] uppercase text-xs" style={{ color: GOLD, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
        {kicker}
      </p>
    )}
    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 42px)', color: GOLD, fontWeight: 600, lineHeight: 1.15 }}>
      {title}
    </h2>
    {subtitle && (
      <p className="mt-4 text-base md:text-lg" style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>
        {subtitle}
      </p>
    )}
  </div>
);

const Divider = () => (
  <div className="my-16 mx-auto" style={{ width: '80%', maxWidth: 800, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)' }} />
);

interface PlanCardProps {
  title: string;
  price: string;
  description?: string;
  features: string[];
  cta: string;
  popular?: boolean;
  ctaHref?: string;
}

const PlanCard = ({ title, price, description, features, cta, popular, ctaHref = chatHref }: PlanCardProps) => (
  <div
    className="relative rounded-2xl flex flex-col transition-all duration-300 hover:scale-[1.02]"
    style={{
      background: 'rgba(10,10,35,0.6)',
      backdropFilter: 'blur(10px)',
      border: popular ? `2px solid ${GOLD}` : '1px solid rgba(212,175,55,0.3)',
      boxShadow: popular ? '0 8px 40px rgba(212,175,55,0.2)' : '0 8px 32px rgba(0,0,0,0.3)',
      padding: '36px 32px',
    }}
  >
    {popular && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <Badge className="bg-[#D4AF37] text-[#0A0A23] font-semibold text-xs px-3 py-1 border-none">Most Popular</Badge>
      </div>
    )}
    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: GOLD, fontWeight: 600 }}>{title}</h3>
    <div className="mt-3 mb-4" style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: '#fff', fontWeight: 600 }}>{price}</div>
    {description && (
      <p className="mb-5" style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>
        {description}
      </p>
    )}
    <ul className="space-y-2.5 mb-8 flex-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2" style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
          <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
          <span>{f}</span>
        </li>
      ))}
    </ul>
    <a href={ctaHref} className="mt-auto">
      <button
        className="w-full transition-all duration-300 hover:scale-105"
        style={{
          padding: '13px 22px',
          borderRadius: 8,
          background: popular ? GOLD : 'transparent',
          border: `1.5px solid ${GOLD}`,
          color: popular ? NAVY : GOLD,
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {cta}
      </button>
    </a>
  </div>
);

const Pricing = () => {
  useSEO({
    path: '/pricing',
    title: 'Solutions Pricing | Ovela Interactive',
    description: 'Pricing built around business growth. AI team members, digital content production, industry packages and corporate programs — scalable solutions from Ovela.',
  });

  useStructuredData(
    [
      organizationSchema,
      serviceSchema,
      createWebPageSchema({ name: 'Pricing', description: 'Solutions pricing for AI team members, digital content production, industry packages and corporate programs.', path: '/pricing' }),
      ...pricingServiceSchemas,
    ],
    'pricing-structured-data'
  );

  const teamMembers: PlanCardProps[] = [
    {
      title: 'Starter Representative',
      price: '€299/month',
      description: 'Ideal for small businesses testing interactive engagement.',
      features: ['AI representative widget', 'Website integration', 'Lead capture', 'FAQ training', 'Monthly updates', 'Multilingual capability'],
      cta: 'Start Starter Plan',
    },
    {
      title: 'Business Representative',
      price: '€799/month',
      description: 'Designed for clinics, agencies, consultants and growing businesses.',
      features: ['Advanced AI representative', 'Appointment booking', 'CRM integration', 'Custom knowledge base', 'Monthly optimization', 'Multilingual interaction', 'Priority support'],
      cta: 'Launch Business Plan',
      popular: true,
    },
    {
      title: 'Corporate Representative',
      price: '€1,500/month',
      description: 'For organizations requiring advanced automation and continuous engagement.',
      features: ['Fully customized AI representative', 'Multiple business workflows', 'CRM integration', 'Lead qualification', 'Analytics reporting', 'Dedicated support', 'Quarterly optimization reviews'],
      cta: 'Speak With Ovela',
    },
  ];

  const content: PlanCardProps[] = [
    { title: 'Ambassador Video', price: 'From €750', features: ['60-second presenter video', 'Custom branding', 'Voiceover', 'Multiple formats'], cta: 'Talk With Isabella' },
    { title: 'Social Media Campaign', price: 'From €1,500', features: ['Multi-post campaign', 'Images', 'Video clips', 'Captions', 'Platform optimization'], cta: 'Talk With Isabella' },
    { title: 'Product Presentation Package', price: 'From €2,500', features: ['Product visuals', 'AI presenter', 'Interactive assets', 'Marketing clips', 'Website content'], cta: 'Talk With Isabella' },
    { title: 'Property Showcase Package', price: 'From €2,000', features: ['Property walkthrough', 'AI presenter', 'Social clips', 'Website assets', 'Lead-generation content'], cta: 'Talk With Isabella' },
  ];

  const industries = [
    { icon: Heart, title: 'Healthcare & Clinics', price: 'From €1,250/month', features: ['Interactive patient guidance', 'Appointment booking', 'Treatment explanations', 'Multilingual support'] },
    { icon: HomeIcon, title: 'Real Estate', price: 'From €1,250/month', features: ['Property presentation', 'Buyer qualification', 'Lead capture', 'Multilingual interaction'] },
    { icon: Cpu, title: 'Technology & Manufacturing', price: 'From €1,500/month', features: ['Product explanation', 'Interactive demonstrations', 'Lead qualification', 'Technical communication'] },
    { icon: Hotel, title: 'Hospitality', price: 'From €1,000/month', features: ['Digital concierge', 'Guest assistance', 'Recommendations', 'Multilingual communication'] },
  ];

  const corporate: PlanCardProps[] = [
    {
      title: 'Executive Digital Presence',
      price: 'From €3,500/month',
      description: 'Designed for founders, executives and leadership teams.',
      features: ['Executive AI representative', 'Thought leadership content', 'Social media assets', 'Video production', 'Website integration', 'Monthly strategy sessions'],
      cta: 'Book Discovery Call',
    },
    {
      title: 'Corporate Communication Platform',
      price: 'Custom Pricing',
      description: 'Enterprise-grade multi-representative deployment.',
      features: ['Multiple representatives', 'Internal training', 'Knowledge delivery', 'Customer interaction', 'Lead qualification', 'Analytics'],
      cta: 'Speak With Ovela',
    },
  ];

  const addons = [
    { icon: Globe, name: 'Multi-Language Expansion', price: '€500/language' },
    { icon: Mic, name: 'Custom Voice Training', price: '€750' },
    { icon: Palette, name: 'Advanced Product Animation', price: '€2,000+' },
    { icon: Database, name: 'Interactive Knowledge Base Training', price: '€500' },
    { icon: Plug, name: 'CRM Integration', price: '€750+' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0A0A23 0%, #1A0A2E 50%, #2D1B3D 100%)' }}>
      {/* HERO */}
      <section className="w-full py-20 md:py-32 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-6 leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(34px, 5vw, 60px)', color: GOLD, fontWeight: 600, letterSpacing: '-0.02em' }}>
            Pricing Built Around Business Growth
          </h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto" style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.8)', fontWeight: 300 }}>
            Whether you need content, an interactive website representative or a complete AI team member, Ovela scales from single projects to enterprise deployments.
          </p>
          <p className="mt-6 text-sm tracking-[0.3em] uppercase" style={{ color: GOLD, fontFamily: 'Inter, sans-serif' }}>
            Solutions Pricing
          </p>
        </div>
        <div className="mt-12 mx-auto" style={{ width: 200, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, boxShadow: '0 0 20px rgba(212,175,55,0.5)' }} />
      </section>

      {/* SECTION 1 — AI TEAM MEMBERS */}
      <section className="w-full py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            kicker="Section 1 — Most Important"
            title="AI Team Members"
            subtitle="This should become your recurring revenue engine."
          />
          <div className="grid lg:grid-cols-3 gap-8 md:gap-10">
            {teamMembers.map((p, i) => <PlanCard key={i} {...p} />)}
          </div>
          <p className="text-center mt-10 italic" style={{ color: 'rgba(212,175,55,0.85)', fontFamily: 'Inter, sans-serif' }}>
            This is where recurring revenue starts.
          </p>
        </div>
      </section>

      <Divider />

      {/* SECTION 2 — DIGITAL CONTENT PRODUCTION */}
      <section className="w-full py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            kicker="Section 2"
            title="Digital Content Production"
            subtitle="Not subscriptions. Project pricing."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {content.map((p, i) => <PlanCard key={i} {...p} />)}
          </div>
          <p className="text-center mt-10 italic" style={{ color: 'rgba(212,175,55,0.85)', fontFamily: 'Inter, sans-serif' }}>
            Now people buy solutions.
          </p>
        </div>
      </section>

      <Divider />

      {/* SECTION 3 — INDUSTRY PACKAGES */}
      <section className="w-full py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            kicker="Section 3"
            title="Industry Packages"
            subtitle="People buy packages. Not tools."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {industries.map((it, i) => (
              <div key={i} className="rounded-2xl p-7 flex flex-col" style={{ background: 'rgba(10,10,35,0.6)', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                <div className="mb-4 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <it.icon className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: GOLD, fontWeight: 600 }}>{it.title}</h3>
                <div className="mt-2 mb-4" style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#fff', fontWeight: 600 }}>{it.price}</div>
                <ul className="space-y-2 mb-6 flex-1">
                  {it.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif' }}>
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href={chatHref}>
                  <button className="w-full transition-all duration-300 hover:scale-105" style={{ padding: '12px 20px', borderRadius: 8, background: 'transparent', border: `1.5px solid ${GOLD}`, color: GOLD, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Talk With Isabella
                  </button>
                </a>
              </div>
            ))}
          </div>
          <p className="text-center mt-10 italic max-w-2xl mx-auto" style={{ color: 'rgba(212,175,55,0.85)', fontFamily: 'Inter, sans-serif' }}>
            These are easy to sell because people immediately see themselves.
          </p>
        </div>
      </section>

      <Divider />

      {/* SECTION 4 — CORPORATE PROGRAMS */}
      <section className="w-full py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            kicker="Section 4"
            title="Corporate Programs"
            subtitle="Enterprise-ready engagement for leadership teams and large organizations."
          />
          <div className="grid md:grid-cols-2 gap-8 md:gap-10">
            {corporate.map((p, i) => <PlanCard key={i} {...p} />)}
          </div>
          <p className="text-center mt-10 italic" style={{ color: 'rgba(212,175,55,0.85)', fontFamily: 'Inter, sans-serif' }}>
            This becomes your enterprise offering.
          </p>
        </div>
      </section>

      <Divider />

      {/* SECTION 5 — CUSTOM AI REPRESENTATIVES */}
      <section className="w-full py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            kicker="Section 5"
            title="Custom AI Representatives"
            subtitle="Build your own digital team member — designed entirely around your brand."
          />
          <div className="rounded-2xl p-10" style={{ background: 'rgba(10,10,35,0.6)', border: `2px solid ${GOLD}`, boxShadow: '0 8px 40px rgba(212,175,55,0.2)' }}>
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6" style={{ color: GOLD }} />
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: GOLD, fontWeight: 600 }}>Build Your Own Digital Team Member</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-8">
              {['Custom appearance', 'Custom voice', 'Custom behavior', 'Industry specialization', 'Website deployment', 'CRM integration', 'Enterprise scalability'].map((f, i) => (
                <div key={i} className="flex items-start gap-2" style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.9)' }}>
                  <Check className="w-4 h-4 mt-1 shrink-0" style={{ color: GOLD }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#fff', fontWeight: 600 }}>Pricing: <span style={{ color: GOLD }}>Custom Quote</span></div>
              <a href={chatHref}>
                <button className="transition-all duration-300 hover:scale-105" style={{ padding: '14px 28px', borderRadius: 8, background: GOLD, border: 'none', color: NAVY, fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  Request Custom Quote
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ADD-ONS */}
      <section className="w-full py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title="Add-Ons" subtitle="Extend any plan with targeted enhancements." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {addons.map((a, i) => (
              <div key={i} className="text-center transition-all duration-300 hover:scale-105 rounded-2xl p-6" style={{ background: 'rgba(10,10,35,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <div className="mx-auto mb-4 rounded-full flex items-center justify-center" style={{ width: 64, height: 64, background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <a.icon className="w-6 h-6" style={{ color: GOLD }} />
                </div>
                <h4 className="mb-2" style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#fff', fontWeight: 500 }}>{a.name}</h4>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: GOLD, fontWeight: 600 }}>{a.price}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-10 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>
            Designed to engage visitors, answer questions and support conversion around the clock.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="w-full py-24 md:py-32 text-center px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 50%, #2D1B3D 100%)', marginTop: 60 }}>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 5vw, 44px)', color: NAVY, fontWeight: 700 }}>
            Start With One Representative. Expand Into A Team.
          </h2>
          <p className="mb-10 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, color: 'rgba(10,10,35,0.75)', fontWeight: 400 }}>
            Ovela solutions scale from a single AI representative to complete interactive business environments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href={chatHref}>
              <button className="transition-all duration-300 hover:scale-105" style={{ padding: '18px 40px', borderRadius: 12, background: NAVY, border: 'none', color: GOLD, fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(10,10,35,0.4)' }}>
                Book Discovery Call
              </button>
            </a>
            <a href={chatHref}>
              <button className="transition-all duration-300 hover:scale-105 flex items-center gap-2" style={{ padding: '18px 40px', borderRadius: 12, background: 'transparent', border: `2px solid ${NAVY}`, color: NAVY, fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, cursor: 'pointer' }}>
                Talk With Isabella <ArrowRight className="w-4 h-4" />
              </button>
            </a>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(10,10,35,0.3))' }} />
      </section>

      {/* Floating Ask Isabella */}
      <a href={chatHref} className="isabella-floating-btn flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105" style={{ background: GOLD, color: NAVY, fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14 }}>
        <MessageCircle className="w-5 h-5" />
        <span className="btn-label">Ask Isabella</span>
      </a>

      <FooterMinimal />
    </div>
  );
};

export default Pricing;
