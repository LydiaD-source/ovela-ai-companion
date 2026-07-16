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

const CARDS = [
  {
    emoji: "🏡",
    eyebrow: "Real Estate",
    title: "Meet Mirella",
    role: "Luxury Property Concierge",
    subtitle:
      "She answers buyer questions, explains properties, qualifies enquiries and books appointments—day or night.",
    cta: "Experience Mirella",
    href: MIRELLA_URL,
    image: MIRELLA_IMG,
    objectPosition: "center 25%",
  },
  {
    emoji: "🥗",
    eyebrow: "Wellness · Nutrition",
    title: "Meet Isabella",
    role: "Nutrition & Wellness Coach",
    subtitle:
      "See how a digital employee guides people through professional health assessments and personalised recovery programmes.",
    cta: "Start Nutrition Assessment",
    href: WELLNESPIRIT_NUTRITION,
    image: ISABELLA_IMG,
    objectPosition: "center 30%",
  },
  {
    emoji: "🌿",
    eyebrow: "Executive Wellbeing",
    title: "Recovery & Resilience",
    role: "Burnout, Stress & Recovery",
    subtitle:
      "Burnout rarely happens overnight. Discover how Isabella helps identify stress, resilience and recovery before performance suffers.",
    cta: "Start Recovery Assessment",
    href: WELLNESPIRIT_RECOVERY,
    image: ISABELLA_IMG,
    objectPosition: "center 30%",
  },
  {
    emoji: "▶",
    eyebrow: "Watch Our Digital Team",
    title: "Meet Mirella. Dario. Isabella.",
    role: "Digital Employees In Action",
    subtitle:
      "See how intelligent digital employees communicate naturally with real customers.",
    cta: "Watch Them Working",
    href: YOUTUBE_URL,
    image: DARIO_IMG,
    objectPosition: "center 20%",
  },
];

const TRUSTED_TECH = [
  "OpenAI",
  "ElevenLabs",
  "Cloudinary",
  "Cortex Intelligence",
  "Modern AI Automation",
];

const Welcome = () => {
  return (
    <>
      <meta name="robots" content="noindex,nofollow" />
      <div className="min-h-screen bg-[#0B1220] text-white antialiased">
        <div className="mx-auto max-w-xl px-6 py-14">
          {/* Header */}
          <header className="text-center">
            <p className="text-[10px] uppercase tracking-[0.45em] text-[#D4B76A]">
              Ovela
            </p>
            <h1 className="mt-4 font-['Playfair_Display',serif] text-3xl md:text-4xl leading-tight">
              Meet the Team That Never Sleeps.
            </h1>
            <p className="mt-4 text-sm text-white/70 leading-relaxed">
              Intelligent digital employees helping businesses answer faster,
              build stronger relationships and grow—24 hours a day.
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[#D4B76A]/80">
              Experience Ovela in under 60 seconds
            </p>
          </header>

          {/* Cards */}
          <ul className="mt-10 space-y-3">
            {CARDS.map(({ emoji, eyebrow, title, role, subtitle, cta, href, image, objectPosition }) => (
              <li key={href + title}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#D4B76A]/50 hover:bg-white/[0.06]"
                >
                  <span className="mt-0.5 h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-[#D4B76A]/30">
                    <img
                      src={image}
                      alt={title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      style={{ objectPosition }}
                    />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[10px] uppercase tracking-[0.25em] text-[#D4B76A]">
                      {eyebrow}
                    </span>
                    <span className="mt-1 flex items-center gap-2 font-['Playfair_Display',serif] text-lg leading-snug">
                      <span aria-hidden>{emoji}</span>
                      {title}
                    </span>
                    <span className="mt-0.5 block text-xs font-medium text-white/80">
                      {role}
                    </span>
                    <span className="mt-1.5 block text-sm text-white/60 leading-relaxed">
                      {subtitle}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#D4B76A] group-hover:underline">
                      {cta}
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/* Trusted Technologies */}
          <section className="mt-12 rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#D4B76A]">
              Trusted Technologies
            </p>
            <p className="mt-2 text-xs text-white/50">Powered by</p>
            <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-white/75">
              {TRUSTED_TECH.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#D4B76A]" />
                  {t}
                </li>
              ))}
            </ul>
          </section>

          {/* Final CTA */}
          <div className="mt-12 text-center">
            <h2 className="font-['Playfair_Display',serif] text-2xl leading-snug">
              Imagine This Working For Your Business.
            </h2>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              Whether you work in real estate, healthcare, professional services
              or hospitality, intelligent digital employees can support your
              team around the clock.
            </p>
            <a
              href={BOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#D4B76A] px-5 py-2.5 text-sm font-medium text-[#D4B76A] transition hover:bg-[#D4B76A] hover:text-[#0B1220]"
            >
              <Calendar className="h-4 w-4" />
              Book a Complimentary 15-minute Discovery Call
            </a>
          </div>

          {/* Footer */}
          <footer className="mt-14 border-t border-white/10 pt-8 text-center">
            <p className="font-['Playfair_Display',serif] text-base">
              Built by Ovela Interactive
            </p>
            <p className="mt-2 text-xs text-white/60 leading-relaxed">
              Creating intelligent digital employees for businesses across
              Europe.
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
              Intelligent Digital Employees
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Welcome;
