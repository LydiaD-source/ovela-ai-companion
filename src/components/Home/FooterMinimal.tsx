import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Instagram, Youtube, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LegalDocumentModal from '@/components/UI/LegalDocumentModal';

export const FooterMinimal = () => {
  const { t } = useTranslation();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

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
                <Link to="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  {t('footer.contact')}
                </Link>
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
                {t('footer.copyright')}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => setTermsOpen(true)}
                  className="transition-colors underline-offset-4 hover:underline"
                  style={{ color: 'rgba(232, 207, 169, 0.7)' }}
                >
                  {t('footer.terms')}
                </button>
                <span style={{ color: 'rgba(232, 207, 169, 0.3)' }}>|</span>
                <button
                  onClick={() => setPrivacyOpen(true)}
                  className="transition-colors underline-offset-4 hover:underline"
                  style={{ color: 'rgba(232, 207, 169, 0.7)' }}
                >
                  {t('footer.privacy')}
                </button>
              </div>
            </div>

            {/* Social Icons - Right */}
            <div className="order-2 md:order-3 flex gap-4">
              <a
                href="https://www.instagram.com/isabellanavia_ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 hover:scale-110"
                style={{ color: '#E8CFA9' }}
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.youtube.com/channel/UCNPojwnrF8R_OfsMqzF5T9g"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 hover:scale-110"
                style={{ color: '#E8CFA9' }}
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
              <a
                href="https://x.com/IsabellaNaviaAI"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 hover:scale-110"
                style={{ color: '#E8CFA9' }}
                aria-label="X (Twitter)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Document Modals */}
      <LegalDocumentModal
        open={privacyOpen}
        onOpenChange={setPrivacyOpen}
        documentType="privacy_policy"
        title={t('footer.privacy')}
      />
      <LegalDocumentModal
        open={termsOpen}
        onOpenChange={setTermsOpen}
        documentType="terms_of_service"
        title={t('footer.terms')}
      />
    </>
  );
};
