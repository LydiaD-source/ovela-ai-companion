import React, { useState } from 'react';
import { Instagram, Linkedin, Youtube, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PDFViewer from '@/components/UI/PDFViewer';

const Footer = () => {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <>
      <footer className="bg-charcoal text-soft-white section-padding">
        <div className="container-custom">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="text-2xl font-bold">
              <span className="text-soft-white">O</span>
              <span className="gradient-text">v</span>
              <span className="text-soft-white">ela</span>
            </div>
            <div className="text-sm text-soft-white/70 font-medium">Interactive</div>
          </div>

          {/* Footer Bottom Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Contact Button - Left */}
            <div className="order-1 md:order-1">
            <Button
              variant="outline"
              className="border-soft-white/20 text-soft-white hover:bg-soft-white/10"
              asChild
            >
              <Link to="/contact">
                <Mail className="mr-2 h-4 w-4" />
                Contact Us
              </Link>
            </Button>
            </div>

            {/* Center Section: Copyright + Legal Links */}
            <div className="order-3 md:order-2 flex flex-col md:flex-row items-center gap-4">
              <p className="text-soft-white/70 text-sm">
                Ovela Interactive © 2025
              </p>
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => setTermsOpen(true)}
                  className="text-soft-white/70 hover:text-soft-white transition-colors underline-offset-4 hover:underline"
                >
                  Terms & Conditions
                </button>
                <span className="text-soft-white/30">|</span>
                <button
                  onClick={() => setPrivacyOpen(true)}
                  className="text-soft-white/70 hover:text-soft-white transition-colors underline-offset-4 hover:underline"
                >
                  Privacy Policy
                </button>
              </div>
            </div>

            {/* Social Links - Right */}
            <div className="order-2 md:order-3 flex space-x-4">
              <a
                href="https://www.instagram.com/isabellanavia_ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-soft-white/10 hover:bg-soft-white/20 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.youtube.com/channel/UC0ZabJImCcMx5OLJkLU8iwg"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-soft-white/10 hover:bg-soft-white/20 transition-colors duration-200"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
              <a
                href="https://x.com/IsabellaNaviaAI"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-soft-white/10 hover:bg-soft-white/20 transition-colors duration-200"
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

      {/* PDF Viewers */}
      <PDFViewer
        open={privacyOpen}
        onOpenChange={setPrivacyOpen}
        pdfUrl="/privacy-policy.pdf"
        title="Privacy Policy"
      />
      <PDFViewer
        open={termsOpen}
        onOpenChange={setTermsOpen}
        pdfUrl="/terms-of-service.pdf"
        title="Terms & Conditions"
      />
    </>
  );
};

export default Footer;
