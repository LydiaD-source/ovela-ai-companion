import { ArrowUpRight, Calendar } from "lucide-react";

const MIRELLA_URL = "https://iipeexchange.lovable.app/mirella";
const WELLNESPIRIT_NUTRITION = "https://wellspirit-nexus.lovable.app/assessments/nutrition";
const WELLNESPIRIT_RECOVERY = "https://wellspirit-nexus.lovable.app/assessments/recovery";
const YOUTUBE_URL = "https://www.youtube.com/channel/UC0ZabJImCcMx5OLJkLU8iwg";
const BOOK_URL = "https://www.ovelainteractive.com/contact";

const ISABELLA_IMG = "https://res.cloudinary.com/di5gj4nyp/image/upload/v1758802492/1_21_cqlyv4.jpg";
const MIRELLA_IMG = "https://res.cloudinary.com/di5gj4nyp/image/upload/v1779109383/mirella_face_d8ix2l.png";
const DARIO_IMG = "https://res.cloudinary.com/di5gj4nyp/image/upload/v1777296226/lucid-origin_artistic_portrait_photography_of_ultra_realistic_portrait_of_a_handsome_masculin-0_1_xelofp.jpg";

const CARDS = [
  {
    eyebrow: "Real Estate",
    title: "Meet Mirella",
    subtitle: "Luxury Property Concierge · International Property Intelligence.",
    href: MIRELLA_URL,
    image: MIRELLA_IMG,
    objectPosition: "center 25%",
  },
  {
    eyebrow: "Wellness · Nutrition",
    title: "Isabella — Nutrition Assessment",
    subtitle: "Complimentary AI-guided nutrition evaluation.",
    href: WELLNESPIRIT_NUTRITION,
    image: ISABELLA_IMG,
    objectPosition: "center 30%",
  },
  {
    eyebrow: "Wellness · Recovery",
    title: "Isabella — Recovery & Resilience",
    subtitle: "Burnout, recovery and resilience assessment.",
    href: WELLNESPIRIT_RECOVERY,
    image: ISABELLA_IMG,
    objectPosition: "center 30%",
  },
  {
    eyebrow: "Watch Them Working",
    title: "See the digital team in action",
    subtitle: "Mirella. Dario. Isabella. No explanation required.",
    href: YOUTUBE_URL,
    image: DARIO_IMG,
    objectPosition: "center 20%",
  },
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
              Intelligent digital employees for businesses that depend on trust.
              Tap a card to experience one.
            </p>
          </header>

          {/* Cards */}
          <ul className="mt-10 space-y-3">
            {CARDS.map(({ eyebrow, title, subtitle, href, image, objectPosition }) => (
              <li key={href + title}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#D4B76A]/50 hover:bg-white/[0.06]"
                >
                  <span className="mt-0.5 h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-[#D4B76A]/30">
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
                    <span className="mt-1 block font-['Playfair_Display',serif] text-lg leading-snug">
                      {title}
                    </span>
                    <span className="mt-1 block text-sm text-white/60">
                      {subtitle}
                    </span>
                  </span>
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-white/40 transition group-hover:text-[#D4B76A]" />
                </a>
              </li>
            ))}
          </ul>

          {/* Footer CTA */}
          <div className="mt-10 text-center">
            <a
              href={BOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#D4B76A] px-5 py-2.5 text-sm font-medium text-[#D4B76A] transition hover:bg-[#D4B76A] hover:text-[#0B1220]"
            >
              <Calendar className="h-4 w-4" />
              Book a 15-minute discovery call
            </a>
            <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/30">
              Intelligent Digital Employees
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
