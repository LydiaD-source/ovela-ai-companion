// Ovela Network — partner ecosystem page
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import wellnespiritLogo from '@/assets/partners/wellnespirit-logo.png';
import luxdeftecLogo from '@/assets/partners/luxdeftec-logo.jpg';
import superiorLogo from '@/assets/partners/superior-logo.png';

// Reuse an existing Isabella video as a cinematic placeholder for Superior
const SUPERIOR_VIDEO = 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1758727075/b8674c11-00a4-42b4-ad39-ebaf103d9f18_1_ffgrvr.mp4';

type PartnerKey = 'wellnespirit' | 'luxdeftec' | 'superior';

interface Partner {
  key: PartnerKey;
  name: string;
  tagline: string;
  positioning: string;
  benefits: string[];
  logo: string;
  // visual treatment
  variant: 'gold' | 'tactical' | 'editorial';
  videoSrc?: string;
  category: string;
}

const Ecosystem: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useSEO({
    path: '/ecosystem',
    title: t('ecosystem.seo.title', 'Ovela Network — A Curated Ecosystem of Interactive Brands'),
    description: t('ecosystem.seo.description', 'A connected ecosystem of premium brands powered by Ovela Interactive: wellness, defense technology, real estate and beyond.'),
  });

  const partners: Partner[] = useMemo(() => [
    {
      key: 'wellnespirit',
      name: 'WellneSpirit',
      tagline: t('ecosystem.partners.wellnespirit.tagline', 'Luxury of the 3rd Millennium'),
      positioning: t('ecosystem.partners.wellnespirit.positioning', 'Body, mind, soul and cell rejuvenation — engineered for the conscious elite.'),
      benefits: [
        t('ecosystem.partners.wellnespirit.b1', 'Network-only access to flagship rejuvenation protocols'),
        t('ecosystem.partners.wellnespirit.b2', 'Private invitations to retreats and member events'),
        t('ecosystem.partners.wellnespirit.b3', 'Concierge introductions handled by Isabella'),
      ],
      logo: wellnespiritLogo,
      variant: 'gold',
      category: t('ecosystem.categories.wellness', 'Wellness & Longevity'),
    },
    {
      key: 'luxdeftec',
      name: 'LuxDefTec',
      tagline: t('ecosystem.partners.luxdeftec.tagline', 'Precision Defense Technology'),
      positioning: t('ecosystem.partners.luxdeftec.positioning', 'Sovereign-grade defense systems and dual-use technologies for selected partners and institutions.'),
      benefits: [
        t('ecosystem.partners.luxdeftec.b1', 'Vetted access to the corporate ecosystem brief'),
        t('ecosystem.partners.luxdeftec.b2', 'Priority dialogue on dual-use technology programs'),
        t('ecosystem.partners.luxdeftec.b3', 'Network introductions under NDA'),
      ],
      logo: luxdeftecLogo,
      variant: 'tactical',
      category: t('ecosystem.categories.defense', 'Defense Technology'),
    },
    {
      key: 'superior',
      name: 'Superior Immobiliaris',
      tagline: t('ecosystem.partners.superior.tagline', 'Andorran Real Estate, since 1974'),
      positioning: t('ecosystem.partners.superior.positioning', 'Five decades curating the most coveted properties in Andorra — now interactively presented.'),
      benefits: [
        t('ecosystem.partners.superior.b1', 'Off-market property dossiers for network members'),
        t('ecosystem.partners.superior.b2', 'Interactive property tours hosted by Isabella'),
        t('ecosystem.partners.superior.b3', 'Concierge relocation & residency support'),
      ],
      logo: superiorLogo,
      variant: 'editorial',
      videoSrc: SUPERIOR_VIDEO,
      category: t('ecosystem.categories.realestate', 'Real Estate'),
    },
  ], [t]);

  const handleRequestAccess = (partner: Partner) => {
    navigate(`/?chat=open&partner=${partner.key}`);
  };

  const handleGeneralInquiry = () => {
    navigate(`/?chat=open&partner=general`);
  };

  return (
    <div className="min-h-screen bg-[#05060B] text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.12),_transparent_60%)]" aria-hidden />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_#05060B_0%,_#0A0E27_100%)] -z-10" aria-hidden />
        <div className="relative max-w-5xl mx-auto text-center">
          <p className="text-[#D4AF37] tracking-[0.4em] text-xs uppercase mb-6">
            {t('ecosystem.hero.eyebrow', 'Ovela Network')}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl leading-tight mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}>
            {t('ecosystem.hero.title', 'A Curated Ecosystem of Interactive Brands')}
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg leading-relaxed">
            {t('ecosystem.hero.description', 'Selected brands powered by Ovela Interactive — interactive websites, AI team members, cinematic media and intelligent automation, connected through one curated ecosystem.')}
          </p>
        </div>
      </section>

      {/* Built Through Ovela Interactive */}
      <BuiltThroughOvela t={t} />

      {/* Partners */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <p className="text-[#D4AF37] tracking-[0.4em] text-xs uppercase mb-4">
            {t('ecosystem.partnersSection.eyebrow', 'Partner Network')}
          </p>
          <h2 className="font-serif text-3xl md:text-5xl mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t('ecosystem.partnersSection.title', 'Look at What Ovela Enables')}
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            {t('ecosystem.partnersSection.description', 'Ovela partners benefit from ecosystem exposure, intelligent cross-promotion, and preferred access to premium digital infrastructure.')}
          </p>
        </div>
        <div className="max-w-7xl mx-auto space-y-10">
          {partners.map((p) => (
            <PartnerCard key={p.key} partner={p} onRequest={() => handleRequestAccess(p)} t={t} />
          ))}
        </div>
      </section>

      {/* General CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto text-center border border-[#D4AF37]/20 rounded-2xl p-10 bg-gradient-to-b from-white/[0.02] to-transparent">
          <h2 className="font-serif text-3xl mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t('ecosystem.cta.title', 'Become an Ovela Network Partner')}
          </h2>
          <p className="text-white/60 mb-8">
            {t('ecosystem.cta.description', 'Brands, houses and institutions who share our standard for interactive presence and selected access are invited to apply.')}
          </p>
          <button
            onClick={handleGeneralInquiry}
            className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F7E7CE] text-black font-semibold tracking-wide hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-shadow"
          >
            {t('ecosystem.cta.button', 'Speak with Isabella')}
          </button>
        </div>
      </section>

      {/* Final whisper */}
      <section className="px-6 pb-32">
        <p className="max-w-3xl mx-auto text-center text-white/40 text-sm tracking-[0.25em] uppercase">
          {t('ecosystem.finalNote', 'Selected brands and institutions are invited to join the ecosystem.')}
        </p>
      </section>

      <FooterMinimal />
    </div>
  );
};

// ---------- Partner Card ----------

interface PartnerCardProps {
  partner: Partner;
  onRequest: () => void;
  t: ReturnType<typeof useTranslation>['t'];
}

const PartnerCard: React.FC<PartnerCardProps> = ({ partner, onRequest, t }) => {
  return (
    <article className="relative grid md:grid-cols-2 gap-0 overflow-hidden rounded-2xl border border-white/5 bg-[#0A0E1A] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
      {/* Cinematic visual */}
      <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[480px] overflow-hidden">
        <CinematicVisual partner={partner} />
        {/* Logo overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <img
            src={partner.logo}
            alt={`${partner.name} logo`}
            className="max-h-32 md:max-h-40 max-w-[80%] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
          />
        </div>
        <div className="absolute top-5 left-5 text-[10px] tracking-[0.3em] uppercase text-white/70 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {partner.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-10 md:p-14 flex flex-col justify-center">
        <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-4">{partner.tagline}</p>
        <h3 className="font-serif text-3xl md:text-4xl mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
          {partner.name}
        </h3>
        <p className="text-white/70 leading-relaxed mb-8">
          {partner.positioning}
        </p>

        <ul className="space-y-3 mb-10">
          {partner.benefits.map((b, i) => (
            <li key={i} className="flex gap-3 text-white/80">
              <span className="text-[#D4AF37] mt-1">✦</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={onRequest}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F7E7CE] text-black font-semibold tracking-wide hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-shadow"
          >
            {t('ecosystem.partnerCard.requestAccess', 'Request Network Access')}
          </button>
          <span className="text-white/40 text-xs tracking-wider uppercase">
            {t('ecosystem.partnerCard.viaIsabella', 'Qualified via Isabella')}
          </span>
        </div>
      </div>
    </article>
  );
};

// ---------- Cinematic placeholder visuals ----------

const CinematicVisual: React.FC<{ partner: Partner }> = ({ partner }) => {
  if (partner.videoSrc) {
    return (
      <>
        <video
          src={partner.videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/80" />
      </>
    );
  }

  if (partner.variant === 'gold') {
    // Wellnespirit — golden, ethereal, slow shimmer
    return (
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,_rgba(247,231,206,0.25),_transparent_55%),radial-gradient(circle_at_70%_70%,_rgba(212,175,55,0.25),_transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a140a] via-[#0A0E1A] to-black" />
        <div className="absolute inset-0 opacity-30 mix-blend-screen bg-[conic-gradient(from_90deg_at_50%_50%,_#D4AF37,_transparent,_#F7E7CE,_transparent,_#D4AF37)] animate-[spin_40s_linear_infinite]" />
      </div>
    );
  }

  if (partner.variant === 'tactical') {
    // LuxDefTec — cold, technical, indigo grid
    return (
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0d1f] via-[#10142b] to-black" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.18) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(220,38,38,0.15),_transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      </div>
    );
  }

  // editorial fallback
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#1a140a] via-[#0A0E1A] to-black" />
  );
};

// ---------- Built Through Ovela Interactive ----------

const BuiltThroughOvela: React.FC<{ t: ReturnType<typeof useTranslation>['t'] }> = ({ t }) => {
  const capabilities = [
    {
      title: t('ecosystem.built.items.websites.title', 'Interactive Websites'),
      desc: t('ecosystem.built.items.websites.desc', 'Custom interactive platforms designed to communicate the way modern businesses should.'),
    },
    {
      title: t('ecosystem.built.items.ai.title', 'AI Team Members'),
      desc: t('ecosystem.built.items.ai.desc', 'Custom AI representatives trained on your business, services, products and workflows.'),
    },
    {
      title: t('ecosystem.built.items.media.title', 'Cinematic Media Production'),
      desc: t('ecosystem.built.items.media.desc', 'Premium visual storytelling, product visuals, interactive presentations and promotional campaigns.'),
    },
    {
      title: t('ecosystem.built.items.automation.title', 'Intelligent Automation'),
      desc: t('ecosystem.built.items.automation.desc', 'Integrated booking, CRM communication, onboarding, support and lead handling systems.'),
    },
    {
      title: t('ecosystem.built.items.network.title', 'Partner Ecosystem Advantages'),
      desc: t('ecosystem.built.items.network.desc', 'Preferred partner production terms, ecosystem promotion, strategic collaboration and selected-access positioning.'),
    },
  ];

  return (
    <section className="px-6 pb-24 pt-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#D4AF37] tracking-[0.4em] text-xs uppercase mb-4">
            {t('ecosystem.built.eyebrow', 'Built Through Ovela Interactive')}
          </p>
          <h2 className="font-serif text-3xl md:text-5xl mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t('ecosystem.built.title', 'The Infrastructure Behind the Network')}
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            {t('ecosystem.built.description', 'Every brand inside the network is engineered, presented and connected through Ovela Interactive.')}
          </p>
        </div>

        <div className="space-y-4">
          {capabilities.map((c, i) => (
            <div
              key={i}
              className="group grid grid-cols-[auto_1fr] md:grid-cols-[80px_1fr_auto] gap-6 items-center p-6 md:p-8 rounded-xl border border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent hover:border-[#D4AF37]/30 hover:from-[#D4AF37]/[0.04] transition-all duration-500"
            >
              <div className="font-serif text-2xl md:text-3xl text-[#D4AF37]/60 group-hover:text-[#D4AF37] transition-colors" style={{ fontFamily: 'Playfair Display, serif' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h3 className="font-serif text-xl md:text-2xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {c.title}
                </h3>
                <p className="text-white/60 leading-relaxed text-sm md:text-base">
                  {c.desc}
                </p>
              </div>
              <div className="hidden md:block text-[#D4AF37]/40 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all">
                ✦
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Ecosystem;

