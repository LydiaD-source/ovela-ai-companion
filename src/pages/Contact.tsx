import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

const Contact = () => {
  const handleStartChat = () => {
    window.location.href = '/?chat=open';
  };

  // SEO Metadata
  useEffect(() => {
    document.title = 'Contact Ovela Interactive | Modeling & Marketing Agency';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get in touch with Ovela Interactive — a creative modeling and marketing agency specializing in AI-enhanced campaigns. Contact our team or chat with Isabella for collaborations and project inquiries.');
    }
    
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'Ovela Interactive, contact Ovela, modeling agency, marketing collaborations, creative partnerships, AI marketing, brand projects');
    } else {
      const keywords = document.createElement('meta');
      keywords.name = 'keywords';
      keywords.content = 'Ovela Interactive, contact Ovela, modeling agency, marketing collaborations, creative partnerships, AI marketing, brand projects';
      document.head.appendChild(keywords);
    }
  }, []);

  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #0A0A23 0%, #1a1a3e 100%)'
      }}
    >
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 
            className="font-playfair text-4xl md:text-6xl lg:text-7xl mb-6"
            style={{ color: '#D4AF37' }}
          >
            Contact Ovela Interactive
          </h1>
          
          <p 
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#FFFFFF', fontWeight: 300 }}
          >
            We'd love to hear from you. Whether you're interested in creative collaborations, 
            modeling partnerships, or have questions about our projects, our team is here to help.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="w-full py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 
            className="font-playfair text-3xl md:text-4xl text-center mb-12"
            style={{ color: '#D4AF37' }}
          >
            Direct Contact
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-center mb-16">
            <div>
              <div 
                className="text-4xl mb-4 flex justify-center"
                style={{ color: '#D4AF37' }}
              >
                <Mail size={40} />
              </div>
              <h3 
                className="font-semibold text-lg mb-3"
                style={{ color: '#FFFFFF' }}
              >
                Email
              </h3>
              <a 
                href="mailto:support@ovelainteractive.com" 
                className="hover:opacity-80 transition-opacity"
                style={{ color: '#D4AF37' }}
              >
                support@ovelainteractive.com
              </a>
            </div>
            
            <div>
              <div 
                className="text-4xl mb-4"
                style={{ color: '#D4AF37' }}
              >
                🏢
              </div>
              <h3 
                className="font-semibold text-lg mb-3"
                style={{ color: '#FFFFFF' }}
              >
                Studio
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Bonaventura Armengol 15, 3R 3A<br />
                AD500 Andorra La Vella
              </p>
            </div>
            
            <div>
              <div 
                className="text-4xl mb-4"
                style={{ color: '#D4AF37' }}
              >
                🕘
              </div>
              <h3 
                className="font-semibold text-lg mb-3"
                style={{ color: '#FFFFFF' }}
              >
                Hours
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Monday–Friday<br />
                9am–6pm CET
              </p>
            </div>
          </div>

          {/* Chat with Isabella Section */}
          <div 
            className="text-center py-12 px-6 rounded-2xl"
            style={{
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
          >
            <h3 
              className="font-playfair text-2xl md:text-3xl mb-4"
              style={{ color: '#D4AF37' }}
            >
              Chat with Isabella
            </h3>
            <p 
              className="mb-6 max-w-xl mx-auto"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Prefer a quick chat? You can speak directly with Isabella, our virtual assistant, 
              who can answer basic questions and connect you with the right team member.
            </p>
            <Button
              onClick={handleStartChat}
              size="lg"
              className="text-lg px-8 py-6 h-auto"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)',
                color: '#000000',
                fontWeight: 600
              }}
            >
              Start Conversation with Isabella
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-4 border-t" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
        <div className="max-w-6xl mx-auto text-center text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          <p>Ovela Interactive © 2025 — Modeling & Marketing Powered by AI</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;