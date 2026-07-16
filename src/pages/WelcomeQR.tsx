import { QRCodeSVG } from "qrcode.react";
import SEO from "@/components/SEO";

const WELCOME_URL = "https://www.ovelainteractive.com/welcome";

const WelcomeQR = () => {
  return (
    <>
      <SEO title="Scan to Experience Ovela" description="Scan to meet Ovela's digital employees." />
      <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--deep-navy))] p-6 text-white">
        <p className="text-xs uppercase tracking-[0.4em] text-[hsl(var(--champagne-gold))]">Ovela</p>
        <h1 className="mt-3 font-['Playfair_Display',serif] text-3xl md:text-4xl text-center">
          Scan to Experience
        </h1>
        <p className="mt-2 text-sm text-white/70">Intelligent Digital Employees</p>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-2xl">
          <QRCodeSVG value={WELCOME_URL} size={320} level="H" includeMargin />
        </div>

        <p className="mt-6 text-xs text-white/50">{WELCOME_URL}</p>
      </div>
    </>
  );
};

export default WelcomeQR;
