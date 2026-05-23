import React from 'react';
import { Check, ArrowRight, MessageCircle, Heart, Home as HomeIcon, Cpu, Hotel, Users, Globe, Mic, Palette, Database, Plug, RefreshCw, Film } from 'lucide-react';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { useSEO } from '@/hooks/useSEO';
import { useStructuredData, serviceSchema, organizationSchema, pricingServiceSchemas, createWebPageSchema } from '@/hooks/useStructuredData';
import { Badge } from '@/components/ui/badge';

const GOLD = '#D4AF37';
const NAVY = '#0A0A23';

const chatHref = '/?chat=open';
const teamHref = '/#meet-team';

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
  setup?: string;
  description?: string;
  features: string[];
  cta: string;
  ideal?: string;
  popular?: boolean;
  ctaHref?: string;
}

const PlanCard = ({ title, price, setup, description, features, cta, ideal, popular, ctaHref = chatHref }: PlanCardProps) => (
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
    <div className="mt-3" style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#fff', fontWeight: 600 }}>{price}</div>
    {setup && (
      <div className="mt-1 mb-4" style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>{setup}</div>
    )}
    {!setup && <div className="mb-4" />}
    {description && (
      <p className="mb-5" style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>
        {description}
      </p>
    )}
    <ul className="space-y-2.5 mb-6 flex-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2" style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
          <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
          <span>{f}</span>
        </li>
      ))}
    </ul>
    {ideal && (
      <p className="mb-6 italic" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(212,175,55,0.85)' }}>
        Ideal for: {ideal}
      </p>
    )}
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
      setup: '€1,500 Setup',
      description: 'Perfect for small businesses looking to provide instant answers and capture more enquiries without hiring additional staff.',
      features: [
        'AI representative deployment',
        'Website integration',
        'Basic business knowledge training',
        'Lead capture',
        'Multilingual capability',
        'Monthly platform maintenance',
      ],
      ideal: 'local businesses, consultants, small agencies',
      cta: 'Start Starter Plan',
    },
    {
      title: 'Business Representative',
      price: '€799/month',
      setup: '€2,500 Setup',
      description: 'A fully trained digital representative capable of guiding visitors, answering questions, booking appointments and supporting customer journeys.',
      features: [
        'Custom business knowledge base',
        'Appointment booking integration',
        'CRM connection',
        'Lead qualification',
        'Multilingual support',
        'Monthly optimization & updates',
        'Priority support',
      ],
      ideal: 'clinics, wellness centers, real estate agencies, service businesses',
      cta: 'Launch Business Plan',
      popular: true,
    },
    {
      title: 'Corporate Representative',
      price: 'From €1,500/month',
      setup: 'From €5,000 Setup',
      description: 'Enterprise-grade deployment designed for organizations requiring advanced interaction, automation and continuous optimization.',
      features: [
        'Multiple workflows',
        'Advanced knowledge architecture',
        'CRM & automation integration',
        'Analytics reporting',
        'Dedicated support',
        'Quarterly strategic reviews',
        'Multi-department deployment options',
      ],
      cta: 'Speak With Ovela',
    },
  ];

  const content: PlanCardProps[] = [
    {
      title: 'Ambassador Video',
      price: 'From €750',
      description: 'Professional AI presenter video using existing Ovela representatives.',
      features: ['60-second presenter video', 'Existing Ovela representative', 'Voiceover', 'Multiple formats'],
      cta: 'Talk With Isabella',
    },
    {
      title: 'Custom Ambassador Video',
      price: 'From €1,500',
      description: 'Custom-trained representative, branding and voice integration.',
      features: ['Custom-trained representative', 'Branding integration', 'Custom voice', 'Multiple formats'],
      cta: 'Talk With Isabella',
    },
    {
      title: 'Social Media Campaign',
      price: 'From €1,500',
      description: 'Multi-platform campaign assets engineered for engagement and conversion.',
      features: ['Multi-post campaign', 'Images', 'Video clips', 'Captions', 'Platform optimization'],
      cta: 'Talk With Isabella',
    },
    {
      title: 'Product Presentation Package',
      price: 'From €2,500',
      description: 'Cinematic product communication for technology, manufacturing and premium products.',
      features: ['Product visuals', 'AI presenter', 'Interactive assets', 'Marketing clips', 'Website content'],
      cta: 'Talk With Isabella',
    },
    {
      title: 'Property Showcase Package',
      price: 'From €2,000',
      description: 'Interactive property presentation for real estate and hospitality.',
      features: ['Property walkthrough', 'AI presenter', 'Social clips', 'Website assets', 'Lead-generation content'],
      cta: 'Talk With Isabella',
    },
  ];

  const industries = [
    {
      icon: Heart,
      title: 'Healthcare & Clinics',
      price: 'From €1,250/month',
      setup: '€2,500 Setup',
      description: 'Interactive patient guidance, treatment education and appointment management.',
    },
    {
      icon: HomeIcon,
      title: 'Real Estate',
      price: 'From €1,250/month',
      setup: '€2,500 Setup',
      description: 'Interactive property presentation and buyer qualification.',
    },
    {
      icon: Cpu,
      title: 'Technology & Manufacturing',
      price: 'From €1,500/month',
      setup: '€3,500 Setup',
      description: 'Technical product communication and lead qualification.',
    },
    {
      icon: Hotel,
      title: 'Hospitality',
      price: 'From €1,000/month',
      setup: '€2,000 Setup',
      description: 'Digital concierge and multilingual guest support.',
    },
  ];

  const corporate: PlanCardProps[] = [
    {
      title: 'Executive Digital Presence',
      price: 'From €3,500/month',
      setup: 'From €5,000 Setup',
      description: 'Premium positioning for founders, executives and leadership teams.',
      features: [
        'Executive representative',
        'Thought leadership content',
        'Monthly video assets',
        'Website integration',
        'Social content support',
        'Strategy sessions',
      ],
      cta: 'Book Discovery Call',
    },
  ];

  const ongoing: PlanCardProps[] = [
    {
      title: 'Content Growth Plan',
      price: '€500/month',
      description: 'Consistent monthly content production for brands that want momentum without a marketing employee.',
      features: ['2 short videos', '4 social posts', 'Captions & hashtags', 'Monthly updates'],
      cta: 'Start Content Plan',
    },
    {
      title: 'Growth Plan',
      price: '€1,000/month',
      description: 'Aggressive content velocity, campaign assets and continuous representative optimization.',
      features: ['Weekly content', 'Campaign assets', 'Representative optimization', 'Analytics review'],
      cta: 'Start Growth Plan',
      popular: true,
    },
  ];

  const addons = [
    { icon: Globe, name: 'Additional Language', price: 'From €750', desc: 'Translation, terminology adaptation, testing and deployment.' },
    { icon: Mic, name: 'Voice Cloning & Training', price: 'From €1,000', desc: 'Professional voice creation and optimization.' },
    { icon: Database, name: 'Knowledge Base Development', price: 'From €1,000', desc: 'Documentation review, interaction design and conversational training.' },
    { icon: Plug, name: 'CRM Integration', price: 'From €750', desc: 'HubSpot, Zoho, Salesforce and custom systems.' },
    { icon: Palette, name: 'Product Visualization & Animation', price: 'From €2,000', desc: 'AI-generated visuals, demonstrations and marketing assets.' },
    { icon: RefreshCw, name: 'Monthly Knowledge Updates', price: '€250/month', desc: 'Recurring training updates so your representative always reflects your business.' },
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
            kicker="Section 1"
            title="AI Team Members"
            subtitle="Your recurring revenue engine — trained digital representatives that work for your business 24/7."
          />
          <div className="grid lg:grid-cols-3 gap-8 md:gap-10">
            {teamMembers.map((p, i) => <PlanCard key={i} {...p} />)}
          </div>

          {/* Comparison line */}
          <div className="mt-14 mx-auto max-w-3xl text-center rounded-2xl px-8 py-10" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(22px, 3vw, 30px)', color: GOLD, fontWeight: 600 }}>
              Less Than The Cost Of A Full-Time Employee
            </h3>
            <p className="mt-4" style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.8)', fontWeight: 300, fontSize: 16, lineHeight: 1.6 }}>
              An Ovela representative can assist visitors 24/7, answer repetitive questions, guide enquiries and support appointments — without recruitment, training costs or staffing limitations.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      {/* SECTION 2 — DIGITAL CONTENT PRODUCTION */}
      <section className="w-full py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            kicker="Section 2"
            title="Digital Content Production"
            subtitle="Project-based production for campaigns, websites and launches."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {content.map((p, i) => <PlanCard key={i} {...p} />)}
          </div>
        </div>
      </section>

      <Divider />

      {/* SECTION 3 — INDUSTRY PACKAGES */}
      <section className="w-full py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            kicker="Section 3"
            title="Industry Packages"
            subtitle="Implementation packages clients immediately understand."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {industries.map((it, i) => (
              <div key={i} className="rounded-2xl p-7 flex flex-col" style={{ background: 'rgba(10,10,35,0.6)', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                <div className="mb-4 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <it.icon className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: GOLD, fontWeight: 600 }}>{it.title}</h3>
                <div className="mt-2" style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#fff', fontWeight: 600 }}>{it.price}</div>
                <div className="mt-1 mb-4" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{it.setup}</div>
                <p className="mb-6 flex-1" style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 300 }}>{it.description}</p>
                <a href={chatHref}>
                  <button className="w-full transition-all duration-300 hover:scale-105" style={{ padding: '12px 20px', borderRadius: 8, background: 'transparent', border: `1.5px solid ${GOLD}`, color: GOLD, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Talk With Isabella
                  </button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* SECTION 4 — CORPORATE PROGRAMS */}
      <section className="w-full py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            kicker="Section 4"
            title="Corporate Programs"
            subtitle="Premium positioning for executives and leadership teams."
          />
          <div className="grid md:grid-cols-1 gap-8 md:gap-10">
            {corporate.map((p, i) => <PlanCard key={i} {...p} />)}
          </div>
        </div>
      </section>

      <Divider />

      {/* SECTION 5 — CUSTOM DIGITAL TEAM MEMBER */}
      <section className="w-full py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            kicker="Flagship Offer"
            title="Custom Digital Team Member"
            subtitle="Build your own digital team member — fully designed around your brand."
          />
          <div className="rounded-2xl p-10" style={{ background: 'rgba(10,10,35,0.6)', border: `2px solid ${GOLD}`, boxShadow: '0 8px 40px rgba(212,175,55,0.2)' }}>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6" style={{ color: GOLD }} />
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: GOLD, fontWeight: 600 }}>Build Your Own Digital Team Member</h3>
            </div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: '#fff', fontWeight: 600 }}>From €5,000</div>
            <p className="mt-3 mb-6" style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.75)', fontWeight: 300 }}>
              Monthly support plans available.
            </p>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mb-8">
              {[
                'Custom appearance',
                'Voice cloning',
                'Brand personality design',
                'Industry-specific knowledge training',
                'Website deployment',
                'CRM integration options',
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2" style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.9)' }}>
                  <Check className="w-4 h-4 mt-1 shrink-0" style={{ color: GOLD }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
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

      {/* ONGOING CONTENT & OPTIMIZATION */}
      <section className="w-full py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            kicker="Recurring"
            title="Ongoing Content & Optimization"
            subtitle="For clients who need consistent content without hiring a marketing employee."
          />
          <div className="grid md:grid-cols-2 gap-8 md:gap-10">
            {ongoing.map((p, i) => <PlanCard key={i} {...p} />)}
          </div>
        </div>
      </section>

      <Divider />

      {/* ADD-ONS */}
      <section className="w-full py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title="Add-Ons" subtitle="Extend any plan with targeted enhancements." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {addons.map((a, i) => (
              <div key={i} className="transition-all duration-300 hover:scale-[1.02] rounded-2xl p-6 flex gap-4" style={{ background: 'rgba(10,10,35,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: 52, height: 52, background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <a.icon className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <div>
                  <h4 className="mb-1" style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#fff', fontWeight: 600 }}>{a.name}</h4>
                  <p className="mb-1" style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: GOLD, fontWeight: 600 }}>{a.price}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>{a.desc}</p>
                </div>
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
            Your Business Doesn't Need More Traffic.<br />It Needs Better Conversations.
          </h2>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href={chatHref}>
              <button className="transition-all duration-300 hover:scale-105" style={{ padding: '18px 40px', borderRadius: 12, background: NAVY, border: 'none', color: GOLD, fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(10,10,35,0.4)' }}>
                Book Discovery Call
              </button>
            </a>
            <a href={teamHref}>
              <button className="transition-all duration-300 hover:scale-105 flex items-center gap-2" style={{ padding: '18px 40px', borderRadius: 12, background: 'transparent', border: `2px solid ${NAVY}`, color: NAVY, fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, cursor: 'pointer' }}>
                <Film className="w-4 h-4" /> Meet The Ovela Team
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
