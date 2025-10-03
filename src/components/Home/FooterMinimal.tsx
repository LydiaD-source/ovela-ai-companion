import React from 'react';
import { Instagram, Youtube } from 'lucide-react';

export const FooterMinimal = () => {
  return (
    <footer
      className="w-full py-8 border-t"
      style={{
        background: '#000000',
        borderColor: 'rgba(232, 207, 169, 0.2)'
      }}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="text-xl font-semibold"
            style={{
              fontFamily: 'Playfair Display, serif',
              color: '#FFFFFF'
            }}
          >
            Ovela
          </div>

          {/* Copyright */}
          <div
            className="text-sm"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: '#FFFFFF'
            }}
          >
            © Ovela Interactive 2025.
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-300 hover:scale-110"
              style={{ color: '#E8CFA9' }}
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-300 hover:scale-110"
              style={{ color: '#E8CFA9' }}
              aria-label="TikTok"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-300 hover:scale-110"
              style={{ color: '#E8CFA9' }}
              aria-label="YouTube"
            >
              <Youtube size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
