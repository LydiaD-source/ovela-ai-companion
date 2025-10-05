import React from 'react';
import { Instagram, Youtube, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const FooterMinimal = () => {
  const handleOpenPDF = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <footer
        className="w-full py-8 border-t"
        style={{
          background: '#000000',
          borderColor: 'rgba(232, 207, 169, 0.2)'
        }}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Logo */}
          <div
            className="text-xl font-semibold text-center mb-6"
            style={{
              fontFamily: 'Playfair Display, serif',
              color: '#FFFFFF'
            }}
          >
            Ovela
          </div>

          {/* Footer Bottom Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Contact Button - Left */}
            <div className="order-1 md:order-1">
              <Button
                variant="outline"
                size="sm"
                className="font-semibold tracking-wide hover:bg-white/10"
                style={{
                  borderColor: 'rgba(232, 207, 169, 0.35)',
                  color: '#E8CFA9'
                }}
                asChild
              >
                <a href="mailto:contact@ovelainteractive.com">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Us
                </a>
              </Button>
            </div>

            {/* Center Section: Copyright + Legal Links */}
            <div className="order-3 md:order-2 flex flex-col md:flex-row items-center gap-4">
              <div
                className="text-sm"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#FFFFFF'
                }}
              >
                © Ovela Interactive 2025
              </div>
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => handleOpenPDF('/terms-of-service.pdf')}
                  className="transition-colors underline-offset-4 hover:underline"
                  style={{ color: 'rgba(232, 207, 169, 0.7)' }}
                >
                  Terms & Conditions
                </button>
                <span style={{ color: 'rgba(232, 207, 169, 0.3)' }}>|</span>
                <button
                  onClick={() => handleOpenPDF('/privacy-policy.pdf')}
                  className="transition-colors underline-offset-4 hover:underline"
                  style={{ color: 'rgba(232, 207, 169, 0.7)' }}
                >
                  Privacy Policy
                </button>
              </div>
            </div>

            {/* Social Icons - Right */}
            <div className="order-2 md:order-3 flex gap-4">
              <a
                href="mailto:contact@ovelainteractive.com"
                className="transition-all duration-300 hover:scale-110"
                style={{ color: '#E8CFA9' }}
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
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
    </>
  );
};
