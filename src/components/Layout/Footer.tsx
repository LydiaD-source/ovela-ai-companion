
import React from 'react';
import { Instagram, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-charcoal text-soft-white section-padding">
      <div className="container-custom">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="text-2xl font-bold">
              <span className="text-soft-white">Q</span>
              <span className="gradient-text">v</span>
              <span className="text-soft-white">ela</span>
            </div>
            <div className="text-sm text-soft-white/70 font-medium">Interactive</div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center space-x-6 mb-8">
            <a
              href="#"
              className="p-3 rounded-full bg-soft-white/10 hover:bg-soft-white/20 transition-colors duration-200"
              aria-label="Contact"
            >
              <Mail size={20} />
            </a>
            <a
              href="#"
              className="p-3 rounded-full bg-soft-white/10 hover:bg-soft-white/20 transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              className="p-3 rounded-full bg-soft-white/10 hover:bg-soft-white/20 transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-soft-white/70 text-sm">
            Qvela Interactive © 2025. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
