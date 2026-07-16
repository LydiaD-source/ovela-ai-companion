import { QRCodeSVG } from "qrcode.react";

const WELCOME_URL = "https://www.ovelainteractive.com/welcome";

const WelcomeQR = () => {
  return (
    <>
      <meta name="robots" content="noindex,nofollow" />
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1220] p-6 text-white">
        <p className="text-[10px] uppercase tracking-[0.45em] text-[#D4B76A]">Ovela</p>
        <h1 className="mt-3 font-['Playfair_Display',serif] text-2xl md:text-3xl text-center">
          Scan to Experience
        </h1>
        <p className="mt-1 text-xs text-white/60">Intelligent Digital Employees</p>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-2xl">
          <QRCodeSVG value={WELCOME_URL} size={300} level="H" includeMargin />
        </div>

        <p className="mt-6 text-[10px] uppercase tracking-widest text-white/40">
          {WELCOME_URL}
        </p>
      </div>
    </>
  );
};

export default WelcomeQR;
