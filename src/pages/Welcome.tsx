import { useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ArrowRight, Building2, HeartPulse, Sparkles, Youtube, QrCode, Calendar, X } from "lucide-react";
import SEO from "@/components/SEO";

type Audience = "all" | "business" | "realestate" | "healthcare" | "curious";

const AUDIENCES: { id: Audience; label: string }[] = [
  { id: "all", label: "Show me everything" },
  { id: "business", label: "Business Owner" },
  { id: "realestate", label: "Real Estate" },
  { id: "healthcare", label: "Healthcare" },
  { id: "curious", label: "Just curious" },
];

const MIRELLA_URL = "https://iipeexchange.lovable.app";
const WELLNESPIRIT_NUTRITION = "https://wellspirit-nexus.lovable.app/assessments/nutrition";
const WELLNESPIRIT_RECOVERY = "https://wellspirit-nexus.lovable.app/assessments/recovery";
const YOUTUBE_URL = "https://www.youtube.com/channel/UC0ZabJImCcMx5OLJkLU8iwg";
const BOOK_URL = "/contact";

const WELCOME_URL = "https://www.ovelainteractive.com/welcome";

const Welcome = () => {
  const [audience, setAudience] = useState<Audience>("all");
  const [showQR, setShowQR] = useState(false);

  const orderedCards = (() => {
    const base = ["mirella", "isabella", "ovela", "youtube"] as const;
    switch (audience) {
      case "realestate": return ["mirella", "youtube", "ovela", "isabella"] as const;
      case "healthcare": return ["isabella", "ovela", "youtube", "mirella"] as const;
      case "business":   return ["ovela", "mirella", "isabella", "youtube"] as const;
      case "curious":    return ["youtube", "mirella", "isabella", "ovela"] as const;
      default:           return base;
    }
  })();

  const cards: Record<string, JSX.Element> = {
    mirella: (
      <Card
        key="mirella"
        eyebrow="Real Estate"
        title="Meet Mirella"
        subtitle="Luxury Property Concierge — International Property Intelligence."
        bullets={["Answers buyers", "Explains properties", "Books appointments", "Investment guidance"]}
        cta="Experience Mirella"
        href={MIRELLA_URL}
        external
        icon={<Building2 className="h-5 w-5" />}
      />
    ),
    isabella: (
      <Card
        key="isabella"
        eyebrow="Wellness"
        title="Meet Isabella"
        subtitle="See how a digital employee supports real people."
        bullets={["Nutrition", "Recovery", "Burnout Assessment", "Personal follow-up"]}
        cta="Try the Complimentary Assessments"
        icon={<HeartPulse className="h-5 w-5" />}
        secondary={[
          { label: "Nutrition Assessment", href: WELLNESPIRIT_NUTRITION },
          { label: "Recovery Assessment", href: WELLNESPIRIT_RECOVERY },
        ]}
      />
    ),
    ovela: (
      <Card
        key="ovela"
        eyebrow="What Ovela Builds"
        title="Intelligent digital employees for industries that depend on trust."
        subtitle="Real Estate · Healthcare · Professional Services · Hospitality · Corporate Teams."
        bullets={[]}
        cta="Visit Ovela Interactive"
        href="/"
        icon={<Sparkles className="h-5 w-5" />}
      />
    ),
    youtube: (
      <Card
        key="youtube"
        eyebrow="Watch Them Working"
        title="See them in action."
        subtitle="Mirella. Dario. Isabella. Business clips. No explanation required."
        bullets={[]}
        cta="Watch Our YouTube"
        href={YOUTUBE_URL}
        external
        icon={<Youtube className="h-5 w-5" />}
      />
    ),
  };

  return (
    <>
      <SEO
        title="Welcome to Ovela — Meet the Team That Never Sleeps" path="/welcome"
        description="Meet Ovela's intelligent digital employees. Talk to Mirella, try Isabella's assessments, and watch them work — no explanation required."
      />

      <div className="min-h-screen bg-[hsl(var(--deep-navy))] text-white">
        {/* Floating QR button */}
        <button
          onClick={() => setShowQR(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[hsl(var(--champagne-gold))] px-5 py-3 text-sm font-semibold text-[hsl(var(--deep-navy))] shadow-2xl transition hover:scale-105"
          aria-label="Show QR code"
        >
          <QrCode className="h-4 w-4" /> Show QR
        </button>

        {/* Hero */}
        <section className="relative mx-auto max-w-5xl px-6 pt-20 pb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--champagne-gold))]">
            Welcome to Ovela
          </p>
          <h1 className="mt-4 font-['Playfair_Display',serif] text-5xl md:text-6xl leading-tight">
            Meet the Team That Never Sleeps.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/75">
            Discover how intelligent digital employees are helping businesses answer faster,
            sell smarter, and free their teams to focus on what matters most.
          </p>

          {/* Audience selector */}
          <div className="mt-10">
            <p className="mb-3 text-xs uppercase tracking-widest text-white/60">Who are you?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {AUDIENCES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAudience(a.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    audience === a.id
                      ? "border-[hsl(var(--champagne-gold))] bg-[hsl(var(--champagne-gold))]/10 text-[hsl(var(--champagne-gold))]"
                      : "border-white/20 text-white/75 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-6 md:grid-cols-2">
            {orderedCards.map((k) => cards[k])}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
          <p className="text-sm text-white/60">Want one for your business?</p>
          <Link
            to={BOOK_URL}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--champagne-gold))] px-6 py-3 text-sm font-semibold text-[hsl(var(--champagne-gold))] transition hover:bg-[hsl(var(--champagne-gold))] hover:text-[hsl(var(--deep-navy))]"
          >
            <Calendar className="h-4 w-4" /> Book a 15-minute discovery call
          </Link>
        </section>

        {/* QR Modal */}
        {showQR && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
            onClick={() => setShowQR(false)}
          >
            <div
              className="relative rounded-2xl bg-white p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute right-3 top-3 rounded-full p-1 text-black/60 hover:text-black"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">Ovela</p>
                <p className="mt-1 font-['Playfair_Display',serif] text-xl text-black">
                  Scan to Experience
                </p>
              </div>
              <div className="mt-5 flex items-center justify-center">
                <QRCodeSVG value={WELCOME_URL} size={280} level="H" includeMargin />
              </div>
              <p className="mt-4 text-center text-xs text-black/50">
                Intelligent Digital Employees
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

interface CardProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: string[];
  cta: string;
  href?: string;
  external?: boolean;
  icon?: React.ReactNode;
  secondary?: { label: string; href: string }[];
}

const Card = ({ eyebrow, title, subtitle, bullets, cta, href, external, icon, secondary }: CardProps) => {
  const CTAWrapper = ({ children }: { children: React.ReactNode }) =>
    href ? (
      external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[hsl(var(--champagne-gold))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--deep-navy))] transition hover:scale-[1.02]">
          {children}
        </a>
      ) : (
        <Link to={href} className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[hsl(var(--champagne-gold))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--deep-navy))] transition hover:scale-[1.02]">
          {children}
        </Link>
      )
    ) : null;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur transition hover:border-[hsl(var(--champagne-gold))]/40 hover:bg-white/[0.05]">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[hsl(var(--champagne-gold))]">
        {icon}
        <span>{eyebrow}</span>
      </div>
      <h2 className="mt-4 font-['Playfair_Display',serif] text-2xl md:text-3xl leading-snug">{title}</h2>
      <p className="mt-3 text-white/70">{subtitle}</p>

      {bullets.length > 0 && (
        <ul className="mt-5 space-y-1.5 text-sm text-white/80">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span className="text-[hsl(var(--champagne-gold))]">✓</span> {b}
            </li>
          ))}
        </ul>
      )}

      {secondary ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {secondary.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--champagne-gold))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--deep-navy))] transition hover:scale-[1.02]"
            >
              {s.label} <ArrowRight className="h-4 w-4" />
            </a>
          ))}
        </div>
      ) : (
        <CTAWrapper>
          {cta} <ArrowRight className="h-4 w-4" />
        </CTAWrapper>
      )}
    </article>
  );
};

export default Welcome;
