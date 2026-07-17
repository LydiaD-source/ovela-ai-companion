import { useState } from "react";
import { ArrowUpRight, Calendar, Globe, Instagram, Youtube } from "lucide-react";

const MIRELLA_URL = "https://iipeexchange.lovable.app/mirella";
const WELLNESPIRIT_NUTRITION = "https://wellspirit-nexus.lovable.app/assessments/nutrition";
const WELLNESPIRIT_RECOVERY = "https://wellspirit-nexus.lovable.app/assessments/recovery";
const YOUTUBE_URL = "https://www.youtube.com/channel/UC0ZabJImCcMx5OLJkLU8iwg";
const BOOK_URL = "https://www.ovelainteractive.com/contact";
const OVELA_WEBSITE = "https://www.ovelainteractive.com";
const OVELA_INSTAGRAM = "https://www.instagram.com/ovelainteractive?igsh=NHFpaGZoZzQ3NGZi";

const ISABELLA_IMG = "https://res.cloudinary.com/di5gj4nyp/image/upload/v1758802492/1_21_cqlyv4.jpg";
const MIRELLA_IMG = "https://res.cloudinary.com/di5gj4nyp/image/upload/v1779109383/mirella_face_d8ix2l.png";
const DARIO_IMG = "https://res.cloudinary.com/di5gj4nyp/image/upload/v1777296226/lucid-origin_artistic_portrait_photography_of_ultra_realistic_portrait_of_a_handsome_masculin-0_1_xelofp.jpg";

type Lang = "en" | "es" | "ca" | "fr";

const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "es", label: "Español", short: "ES" },
  { code: "ca", label: "Català", short: "CA" },
  { code: "fr", label: "Français", short: "FR" },
];

const T: Record<Lang, {
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  cards: { eyebrow: string; title: string; role: string; subtitle: string; cta: string }[];
  trustedTitle: string;
  poweredBy: string;
  finalTitle: string;
  finalSubtitle: string;
  bookCta: string;
  builtBy: string;
  footerTagline: string;
  footerBadge: string;
}> = {
  en: {
    eyebrow: "Ovela",
    heroTitle: "Meet the Team That Never Sleeps.",
    heroSubtitle: "Intelligent digital employees helping businesses answer faster, build stronger relationships and grow—24 hours a day.",
    heroTagline: "Experience Ovela in under 60 seconds",
    cards: [
      { eyebrow: "Real Estate", title: "Meet Mirella", role: "Luxury Property Concierge", subtitle: "She answers buyer questions, explains properties, qualifies enquiries and books appointments—day or night.", cta: "Experience Mirella" },
      { eyebrow: "Wellness · Nutrition", title: "Meet Isabella", role: "Nutrition & Wellness Coach", subtitle: "See how a digital employee guides people through professional health assessments and personalised recovery programmes.", cta: "Start Nutrition Assessment" },
      { eyebrow: "Executive Wellbeing", title: "Recovery & Resilience", role: "Burnout, Stress & Recovery", subtitle: "Burnout rarely happens overnight. Discover how Isabella helps identify stress, resilience and recovery before performance suffers.", cta: "Start Recovery Assessment" },
      { eyebrow: "Watch Our Digital Team", title: "Meet Mirella. Dario. Isabella.", role: "Digital Employees In Action", subtitle: "See how intelligent digital employees communicate naturally with real customers.", cta: "Watch Them Working" },
    ],
    trustedTitle: "Trusted Technologies",
    poweredBy: "Powered by",
    finalTitle: "Imagine This Working For Your Business.",
    finalSubtitle: "Whether you work in real estate, healthcare, professional services or hospitality, intelligent digital employees can support your team around the clock.",
    bookCta: "Book a Complimentary 15-minute Discovery Call",
    builtBy: "Built by Ovela Interactive",
    footerTagline: "Creating intelligent digital employees for businesses across Europe.",
    footerBadge: "Intelligent Digital Employees",
  },
  es: {
    eyebrow: "Ovela",
    heroTitle: "Conoce al Equipo Que Nunca Duerme.",
    heroSubtitle: "Empleados digitales inteligentes que ayudan a las empresas a responder más rápido, construir relaciones más sólidas y crecer—las 24 horas del día.",
    heroTagline: "Descubre Ovela en menos de 60 segundos",
    cards: [
      { eyebrow: "Inmobiliaria", title: "Conoce a Mirella", role: "Concierge de Propiedades de Lujo", subtitle: "Responde a las preguntas de compradores, explica propiedades, cualifica consultas y agenda citas—de día o de noche.", cta: "Prueba a Mirella" },
      { eyebrow: "Bienestar · Nutrición", title: "Conoce a Isabella", role: "Coach de Nutrición y Bienestar", subtitle: "Descubre cómo una empleada digital guía a las personas a través de evaluaciones profesionales de salud y programas personalizados de recuperación.", cta: "Iniciar Evaluación Nutricional" },
      { eyebrow: "Bienestar Ejecutivo", title: "Recuperación y Resiliencia", role: "Burnout, Estrés y Recuperación", subtitle: "El burnout rara vez ocurre de la noche a la mañana. Descubre cómo Isabella ayuda a identificar el estrés, la resiliencia y la recuperación antes de que el rendimiento se resienta.", cta: "Iniciar Evaluación de Recuperación" },
      { eyebrow: "Ve a Nuestro Equipo Digital", title: "Conoce a Mirella. Dario. Isabella.", role: "Empleados Digitales en Acción", subtitle: "Ve cómo los empleados digitales inteligentes se comunican de forma natural con clientes reales.", cta: "Míralos Trabajando" },
    ],
    trustedTitle: "Tecnologías de Confianza",
    poweredBy: "Impulsado por",
    finalTitle: "Imagina Esto Trabajando Para Tu Negocio.",
    finalSubtitle: "Ya trabajes en inmobiliaria, sanidad, servicios profesionales u hostelería, los empleados digitales inteligentes pueden apoyar a tu equipo las 24 horas.",
    bookCta: "Reserva una Llamada de Descubrimiento Gratuita de 15 minutos",
    builtBy: "Creado por Ovela Interactive",
    footerTagline: "Creando empleados digitales inteligentes para empresas de toda Europa.",
    footerBadge: "Empleados Digitales Inteligentes",
  },
  ca: {
    eyebrow: "Ovela",
    heroTitle: "Coneix l'Equip Que Mai No Dorm.",
    heroSubtitle: "Empleats digitals intel·ligents que ajuden les empreses a respondre més ràpid, construir relacions més fortes i créixer—les 24 hores del dia.",
    heroTagline: "Descobreix Ovela en menys de 60 segons",
    cards: [
      { eyebrow: "Immobiliària", title: "Coneix la Mirella", role: "Concierge de Propietats de Luxe", subtitle: "Respon a les preguntes dels compradors, explica propietats, qualifica consultes i concerta cites—de dia o de nit.", cta: "Prova la Mirella" },
      { eyebrow: "Benestar · Nutrició", title: "Coneix la Isabella", role: "Coach de Nutrició i Benestar", subtitle: "Descobreix com una empleada digital guia les persones a través d'avaluacions professionals de salut i programes personalitzats de recuperació.", cta: "Iniciar Avaluació Nutricional" },
      { eyebrow: "Benestar Executiu", title: "Recuperació i Resiliència", role: "Burnout, Estrès i Recuperació", subtitle: "El burnout poques vegades passa d'un dia per l'altre. Descobreix com la Isabella ajuda a identificar l'estrès, la resiliència i la recuperació abans que el rendiment se'n ressenti.", cta: "Iniciar Avaluació de Recuperació" },
      { eyebrow: "Mira el Nostre Equip Digital", title: "Coneix la Mirella. Dario. Isabella.", role: "Empleats Digitals en Acció", subtitle: "Mira com els empleats digitals intel·ligents es comuniquen de forma natural amb clients reals.", cta: "Mira'ls Treballant" },
    ],
    trustedTitle: "Tecnologies de Confiança",
    poweredBy: "Impulsat per",
    finalTitle: "Imagina Això Treballant Per al Teu Negoci.",
    finalSubtitle: "Tant si treballes en immobiliària, sanitat, serveis professionals o hostaleria, els empleats digitals intel·ligents poden donar suport al teu equip les 24 hores.",
    bookCta: "Reserva una Trucada de Descoberta Gratuïta de 15 minuts",
    builtBy: "Creat per Ovela Interactive",
    footerTagline: "Creant empleats digitals intel·ligents per a empreses d'arreu d'Europa.",
    footerBadge: "Empleats Digitals Intel·ligents",
  },
  fr: {
    eyebrow: "Ovela",
    heroTitle: "Découvrez l'Équipe Qui Ne Dort Jamais.",
    heroSubtitle: "Des employés numériques intelligents qui aident les entreprises à répondre plus vite, à bâtir des relations plus solides et à croître—24 heures sur 24.",
    heroTagline: "Découvrez Ovela en moins de 60 secondes",
    cards: [
      { eyebrow: "Immobilier", title: "Rencontrez Mirella", role: "Concierge de Propriétés de Luxe", subtitle: "Elle répond aux questions des acheteurs, présente les biens, qualifie les demandes et prend les rendez-vous—jour et nuit.", cta: "Découvrir Mirella" },
      { eyebrow: "Bien-être · Nutrition", title: "Rencontrez Isabella", role: "Coach en Nutrition et Bien-être", subtitle: "Découvrez comment une employée numérique guide les personnes à travers des évaluations de santé professionnelles et des programmes de récupération personnalisés.", cta: "Commencer l'Évaluation Nutritionnelle" },
      { eyebrow: "Bien-être Exécutif", title: "Récupération et Résilience", role: "Burnout, Stress et Récupération", subtitle: "Le burnout survient rarement du jour au lendemain. Découvrez comment Isabella aide à identifier le stress, la résilience et la récupération avant que la performance n'en pâtisse.", cta: "Commencer l'Évaluation de Récupération" },
      { eyebrow: "Voir Notre Équipe Numérique", title: "Rencontrez Mirella. Dario. Isabella.", role: "Employés Numériques en Action", subtitle: "Voyez comment les employés numériques intelligents communiquent naturellement avec de vrais clients.", cta: "Les Voir en Action" },
    ],
    trustedTitle: "Technologies de Confiance",
    poweredBy: "Propulsé par",
    finalTitle: "Imaginez Cela Travaillant Pour Votre Entreprise.",
    finalSubtitle: "Que vous travailliez dans l'immobilier, la santé, les services professionnels ou l'hôtellerie, les employés numériques intelligents peuvent soutenir votre équipe 24h/24.",
    bookCta: "Réservez un Appel Découverte Gratuit de 15 minutes",
    builtBy: "Créé par Ovela Interactive",
    footerTagline: "Créer des employés numériques intelligents pour les entreprises à travers l'Europe.",
    footerBadge: "Employés Numériques Intelligents",
  },
};

const CARD_META = [
  { emoji: "🏡", href: MIRELLA_URL, image: MIRELLA_IMG, objectPosition: "center 25%" },
  { emoji: "🥗", href: WELLNESPIRIT_NUTRITION, image: ISABELLA_IMG, objectPosition: "center 30%" },
  { emoji: "🌿", href: WELLNESPIRIT_RECOVERY, image: ISABELLA_IMG, objectPosition: "center 30%" },
  { emoji: "▶", href: YOUTUBE_URL, image: DARIO_IMG, objectPosition: "center 20%" },
];

const TRUSTED_TECH = [
  "OpenAI",
  "ElevenLabs",
  "Cloudinary",
  "Cortex Intelligence",
  "Modern AI Automation",
];

const Welcome = () => {
  const [lang, setLang] = useState<Lang>("en");
  const t = T[lang];

  return (
    <>
      <meta name="robots" content="noindex,nofollow" />
      <div className="min-h-screen bg-[#0B1220] text-white antialiased">
        <div className="mx-auto max-w-xl px-6 py-14">
          {/* Language switcher */}
          <div className="flex justify-end mb-4">
            <div
              className="inline-flex items-center gap-1 rounded-full border border-[#D4B76A]/30 bg-white/[0.03] p-1"
              role="group"
              aria-label="Language selector"
            >
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  aria-pressed={lang === l.code}
                  aria-label={l.label}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider transition ${
                    lang === l.code
                      ? "bg-[#D4B76A] text-[#0B1220]"
                      : "text-white/70 hover:text-[#D4B76A]"
                  }`}
                >
                  {l.short}
                </button>
              ))}
            </div>
          </div>

          {/* Header */}
          <header className="text-center">
            <p className="text-[10px] uppercase tracking-[0.45em] text-[#D4B76A]">
              {t.eyebrow}
            </p>
            <h1 className="mt-4 font-['Playfair_Display',serif] text-3xl md:text-4xl leading-tight">
              {t.heroTitle}
            </h1>
            <p className="mt-4 text-sm text-white/70 leading-relaxed">
              {t.heroSubtitle}
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[#D4B76A]/80">
              {t.heroTagline}
            </p>
          </header>

          {/* Cards */}
          <ul className="mt-10 space-y-3">
            {t.cards.map((card, i) => {
              const meta = CARD_META[i];
              return (
                <li key={meta.href + card.title}>
                  <a
                    href={meta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#D4B76A]/50 hover:bg-white/[0.06]"
                  >
                    <span className="mt-0.5 h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-[#D4B76A]/30">
                      <img
                        src={meta.image}
                        alt={card.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        style={{ objectPosition: meta.objectPosition }}
                      />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[10px] uppercase tracking-[0.25em] text-[#D4B76A]">
                        {card.eyebrow}
                      </span>
                      <span className="mt-1 flex items-center gap-2 font-['Playfair_Display',serif] text-lg leading-snug">
                        <span aria-hidden>{meta.emoji}</span>
                        {card.title}
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-white/80">
                        {card.role}
                      </span>
                      <span className="mt-1.5 block text-sm text-white/60 leading-relaxed">
                        {card.subtitle}
                      </span>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#D4B76A] group-hover:underline">
                        {card.cta}
                        <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Trusted Technologies */}
          <section className="mt-12 rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#D4B76A]">
              {t.trustedTitle}
            </p>
            <p className="mt-2 text-xs text-white/50">{t.poweredBy}</p>
            <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-white/75">
              {TRUSTED_TECH.map((tech) => (
                <li key={tech} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#D4B76A]" />
                  {tech}
                </li>
              ))}
            </ul>
          </section>

          {/* Final CTA */}
          <div className="mt-12 text-center">
            <h2 className="font-['Playfair_Display',serif] text-2xl leading-snug">
              {t.finalTitle}
            </h2>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              {t.finalSubtitle}
            </p>
            <a
              href={BOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#D4B76A] px-5 py-2.5 text-sm font-medium text-[#D4B76A] transition hover:bg-[#D4B76A] hover:text-[#0B1220]"
            >
              <Calendar className="h-4 w-4" />
              {t.bookCta}
            </a>
          </div>

          {/* Footer */}
          <footer className="mt-14 border-t border-white/10 pt-8 text-center">
            <p className="font-['Playfair_Display',serif] text-base">
              {t.builtBy}
            </p>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              {t.footerTagline}
            </p>
            <div className="mt-5 flex items-center justify-center gap-5">
              <a
                href={OVELA_WEBSITE}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                className="text-white/60 transition hover:text-[#D4B76A]"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a
                href={OVELA_INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white/60 transition hover:text-[#D4B76A]"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-white/60 transition hover:text-[#D4B76A]"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/30">
              {t.footerBadge}
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Welcome;
