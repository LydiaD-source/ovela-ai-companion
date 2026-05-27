import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Clock, MessageCircle, ArrowRight, Sparkles, Globe, Users, Palette, Handshake, Megaphone, Phone, HelpCircle } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useStructuredData } from '@/hooks/useStructuredData';
import { useTranslation } from 'react-i18next';

const BASE_URL = 'https://www.ovelainteractive.com';

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${BASE_URL}/#business`,
  "name": "Ovela Interactive",
  "image": `${BASE_URL}/images/isabella-hero-native.png`,
  "logo": `${BASE_URL}/favicon.png`,
  "url": BASE_URL,
  "telephone": "+376699369",
  "email": "support@ovelainteractive.com",
  "priceRange": "$$",
  "description": "Ovela Interactive builds AI digital employees and AI representatives for clinics, real estate, hospitality, and modern businesses — including AI receptionists, multilingual customer communication, and lead engagement systems.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Avinguda Les Escoles 7",
    "addressLocality": "Les Escaldes-Engordany",
    "postalCode": "AD700",
    "addressCountry": "AD"
  },
  "areaServed": ["AD", "ES", "FR", "PT", "DE", "EU"],
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "18:00"
  }],
  "contactPoint": [{
    "@type": "ContactPoint",
    "telephone": "+376699369",
    "email": "support@ovelainteractive.com",
    "contactType": "sales",
    "areaServed": ["AD", "ES", "FR", "PT", "DE", "EU"],
    "availableLanguage": ["English", "Spanish", "French", "Catalan", "Portuguese", "German"]
  }]
};

const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Ovela Interactive",
  "url": `${BASE_URL}/contact`,
  "description": "Contact Ovela Interactive to deploy AI digital employees, AI receptionists, and multilingual customer communication systems for your business.",
  "mainEntity": { "@id": `${BASE_URL}/#business` }
};

const faqs = [
  {
    q: "What is Isabella and what can she do for my business?",
    a: "Isabella is Ovela's AI digital employee — an interactive AI representative that greets website visitors, answers questions, presents products and services, qualifies leads, books appointments, and supports customer communication 24/7 in multiple languages."
  },
  {
    q: "How do I start a conversation with Isabella?",
    a: "Click the gold 'Ask Isabella' button visible on every page, or visit the homepage and tap the chat panel. Isabella responds instantly through text and video and can guide you through Ovela's services, pricing, and use cases."
  },
  {
    q: "What can I ask Isabella?",
    a: "Ask about AI digital employees, AI receptionists for clinics, real estate property presenters, multilingual customer communication, integrations with your CRM, pricing, timelines, and how an AI representative would fit your industry."
  },
  {
    q: "Which industries does Ovela serve?",
    a: "Ovela builds AI representatives for clinics and healthcare, real estate, hospitality, wellness, premium retail, and any business that needs scalable customer communication without increasing staff workload."
  },
  {
    q: "How quickly can my AI digital employee be live?",
    a: "Most Ovela AI representatives can be trained, integrated, and deployed within a few days, depending on industry, languages, and integrations required."
  },
  {
    q: "How do I contact Ovela directly?",
    a: "Call +376 699 369, email support@ovelainteractive.com, or visit our office at Avinguda Les Escoles 7, AD700, Les Escaldes-Engordany, Andorra. Hours are Monday–Friday, 9am–6pm CET."
  }
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(f => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a }
  }))
};

const Contact = () => {
  const { t } = useTranslation();

  useSEO({
    path: '/contact',
    title: 'Contact Ovela | Build Your AI Digital Employee',
    description: 'Deploy AI representatives for clinics, real estate, and modern businesses. Chat with Isabella for instant answers about AI digital employees, customer communication systems, pricing, and integrations.'
  });

  useStructuredData([localBusinessSchema, contactPageSchema, faqSchema], 'contact-structured-data');

  const handleStartChat = () => {
    window.location.href = '/?chat=open';
  };

  const services = [
    { icon: Users, label: 'AI digital employees' },
    { icon: Globe, label: 'AI website receptionists' },
    { icon: Megaphone, label: 'Product & service presentation systems' },
    { icon: MessageCircle, label: 'AI customer communication platforms' },
    { icon: Palette, label: 'Multilingual lead engagement' },
    { icon: Handshake, label: 'Industry-trained AI representatives' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0A0A23 0%, #1a1a3e 100%)' }}>
      {/* Hero */}
      <section className="relative w-full pt-24 pb-12 md:pt-32 md:pb-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <Sparkles size={16} style={{ color: '#D4AF37' }} />
            <span className="text-sm font-medium" style={{ color: '#D4AF37' }}>Start Building Your AI Business Representative</span>
          </div>
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl mb-6" style={{ color: '#D4AF37' }}>
            Build Your AI Digital Employee
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto mb-4" style={{ color: '#D4AF37', fontWeight: 500 }}>
            AI Representatives For Clinics, Real Estate & Modern Businesses
          </p>
          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Whether you need an AI receptionist, digital business representative, property presenter, or multilingual customer communication system, Ovela helps businesses deploy AI representatives quickly and effectively.
          </p>
        </div>
      </section>

      {/* Chat First — Primary CTA */}
      <section className="w-full py-12 px-4">
        <div className="max-w-2xl mx-auto rounded-2xl p-8 md:p-12 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)', border: '1px solid rgba(212,175,55,0.4)' }}>
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #D4AF37 0%, transparent 50%)' }} />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37, #F7E7CE)' }}>
              <MessageCircle size={28} color="#0A0A23" />
            </div>
            <h2 className="font-playfair text-2xl md:text-4xl mb-4" style={{ color: '#D4AF37' }}>
              Talk to Isabella — Get Instant Answers
            </h2>
            <p className="mb-8 max-w-lg mx-auto text-base md:text-lg" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Describe your business, communication challenges, or project goals, and Isabella will guide you through available solutions, pricing, integrations, and next steps in real time.
            </p>
            <Button
              onClick={handleStartChat}
              size="lg"
              className="text-lg px-10 py-7 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)', color: '#0A0A23', fontWeight: 700 }}
            >
              Start Conversation with Isabella
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* What We Can Help You Build */}
      <section className="w-full py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-playfair text-3xl md:text-4xl text-center mb-10" style={{ color: '#D4AF37' }}>
            What We Can Help You Build
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s, i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-xl transition-all duration-300 hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,175,55,0.15)' }}>
                  <s.icon size={20} style={{ color: '#D4AF37' }} />
                </div>
                <span className="font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-xs mx-auto h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }} />

      {/* Direct Contact — Secondary */}
      <section className="w-full py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-playfair text-2xl md:text-3xl text-center mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Prefer Direct Contact?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { icon: Phone, title: 'Phone', value: '+376 699 369', href: 'tel:+376699369' },
              { icon: Mail, title: 'Email', value: 'support@ovelainteractive.com', href: 'mailto:support@ovelainteractive.com' },
              { icon: MapPin, title: 'Office', value: 'Avinguda Les Escoles 7\nAD700, Les Escaldes-Engordany\nAndorra' },
              { icon: Clock, title: 'Hours', value: 'Monday–Friday\n9am–6pm CET' },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <item.icon size={24} className="mx-auto mb-3" style={{ color: '#D4AF37' }} />
                <h3 className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>{item.title}</h3>
                {item.href ? (
                  <a href={item.href} className="hover:opacity-80 transition-opacity text-sm" style={{ color: '#D4AF37' }}>{item.value}</a>
                ) : (
                  <p className="text-sm whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — How to use Isabella */}
      <section className="w-full py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <HelpCircle size={16} style={{ color: '#D4AF37' }} />
              <span className="text-sm font-medium" style={{ color: '#D4AF37' }}>How To Use Isabella</span>
            </div>
            <h2 className="font-playfair text-3xl md:text-5xl mb-3" style={{ color: '#D4AF37' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-base md:text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
              How to navigate, what to ask, and how Isabella supports your business.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <details key={i} className="group rounded-xl p-5 cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <summary className="font-semibold flex items-center justify-between list-none" style={{ color: '#D4AF37' }}>
                  <span>{f.q}</span>
                  <ArrowRight size={18} className="transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm md:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-playfair text-3xl md:text-5xl mb-4" style={{ color: '#D4AF37' }}>
            Your AI Digital Employee Can Be Live In Days
          </h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Ovela AI representatives help businesses answer questions, guide visitors, capture leads, and support customer communication around the clock.
          </p>
          <Button
            onClick={handleStartChat}
            size="lg"
            className="text-lg px-10 py-7 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)', color: '#0A0A23', fontWeight: 700 }}
          >
            Start Building Your AI Representative
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 px-4 border-t" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
        <div className="max-w-6xl mx-auto text-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          <p>Ovela Interactive © 2025 — AI-Powered Interactive Modeling & Marketing</p>
        </div>
      </footer>

      {/* Floating Ask Isabella */}
      <button
        onClick={handleStartChat}
        className="isabella-floating-btn flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
        style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)', color: '#0A0A23', fontWeight: 600 }}
      >
        <MessageCircle size={20} />
        <span className="btn-label">Ask Isabella</span>
      </button>
    </div>
  );
};

export default Contact;
