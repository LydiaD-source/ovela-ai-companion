import React from 'react';
import { Sparkles, Globe, Mic, Palette, BarChart3, Video, Monitor, MessageCircle, ArrowRight, Zap, Clock, TrendingUp } from 'lucide-react';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { useSEO } from '@/hooks/useSEO';
import { useStructuredData, serviceSchema, organizationSchema, pricingProductSchemas } from '@/hooks/useStructuredData';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

const Pricing = () => {
  const { t } = useTranslation();
  useSEO({
    path: '/pricing',
    title: 'Pricing | Isabella AI Ambassador — Ovela Interactive',
    description: 'Deploy Isabella as your AI model, brand ambassador, or interactive host. Simple pricing for campaigns, website integration, and custom AI ambassadors.'
  });

  useStructuredData([serviceSchema, organizationSchema, ...pricingProductSchemas], 'pricing-structured-data');

  const packages = [
    {
      title: 'Product Promotion',
      description: 'Turn your products into cinematic, high-conversion content. Isabella becomes the face of your brand, showcasing your products through premium visuals and storytelling.',
      includes: 'Includes: video + image content + campaign-ready assets',
      price: 'From €1,500/month',
      thumbnail: '/images/pricing-product-promotion.jpg',
      icon: Sparkles,
      cta: 'Launch My Campaign',
      popular: false
    },
    {
      title: 'Social Media Feature',
      description: 'Stay visible. Stay relevant. Stay consistent. Isabella creates engaging, scroll-stopping content tailored for modern platforms.',
      includes: '',
      price: 'From €250/post',
      thumbnail: '/images/pricing-social-media.jpg',
      icon: Globe,
      cta: 'Create My Content',
      popular: false
    },
    {
      title: 'Event Presence',
      description: 'Bring interactive energy to your digital or hybrid events. Isabella engages your audience live — introducing products, guiding sessions, and interacting in real time.',
      includes: '',
      price: 'From €2,000/event',
      thumbnail: '/images/pricing-event-presence.jpg',
      icon: Video,
      cta: 'Book Isabella for Event',
      popular: false
    },
    {
      title: 'Custom Ambassador Campaign',
      description: 'Your brand. Your AI ambassador. Fully tailored. We design a complete campaign where Isabella adapts to your identity, audience, and goals.',
      includes: '',
      price: 'Custom Pricing',
      thumbnail: '/images/pricing-custom-ambassador.jpg',
      icon: Palette,
      cta: 'Build My Ambassador',
      popular: false
    },
    {
      title: 'Website Integration',
      description: 'Turn your website into a 24/7 sales and engagement machine. Embed Isabella directly into your site to answer questions, guide visitors, capture leads, and book services.',
      includes: 'Most clients recover this cost within their first conversions.',
      price: '€2,000 setup + €500/month',
      thumbnail: '/images/pricing-website-integration.jpg',
      icon: Monitor,
      cta: 'Add Isabella to My Website',
      popular: true
    },
    {
      title: 'Ambassador Video',
      description: 'Your AI spokesperson — ready in minutes. A polished 60-second video featuring Isabella presenting your brand, product, or service.',
      includes: '',
      price: 'From €750',
      thumbnail: '/images/pricing-ambassador-video.jpg',
      icon: Video,
      cta: 'Create My Video',
      popular: false
    }
  ];

  const addons = [
    { icon: Palette, name: 'Custom Outfit Styling', price: '€2,000' },
    { icon: Mic, name: 'Exclusive Voice Lines', price: '€500' },
    { icon: Globe, name: 'Multi-Language Interaction', price: '€1,200' },
    { icon: BarChart3, name: '3D Animation Packages', price: '€3,000' }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0A0A23 0%, #1A0A2E 50%, #2D1B3D 100%)' }}>
      {/* Hero */}
      <section className="w-full py-20 md:py-32 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight"
            style={{ fontFamily: 'Playfair Display, serif', color: '#D4AF37', fontWeight: '600', letterSpacing: '-0.02em' }}
          >
            Simple Pricing. Powerful Results.
          </h1>
          <p
            className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto"
            style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '300' }}
          >
            Deploy Isabella as your AI model, brand ambassador, or interactive host — and start generating content, engagement, and leads instantly.
          </p>
        </div>
        <div className="mt-16 mx-auto" style={{ width: '200px', height: '2px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)' }} />
      </section>

      {/* Infrastructure Section */}
      <section className="w-full py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-6" style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: '#D4AF37', fontWeight: '600' }}>
            More Than Content — This Is Infrastructure
          </h2>
          <p className="leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: '300' }}>
            Traditional campaigns require teams, scheduling, and repeated production costs. With Isabella, you get a scalable digital ambassador that works 24/7 — across campaigns, platforms, and customer interactions.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {[
              { icon: Clock, label: '24/7 Active' },
              { icon: TrendingUp, label: 'Scalable' },
              { icon: Zap, label: 'Instant Deploy' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-3 rounded-full" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
                <item.icon className="w-5 h-5" style={{ color: '#D4AF37' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', color: '#D4AF37', fontWeight: '500', fontSize: '14px' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Golden Divider */}
      <div className="my-12 mx-auto" style={{ width: '80%', maxWidth: '800px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent)' }} />

      {/* Pricing Cards */}
      <section className="w-full py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-10 md:gap-12">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 flex flex-col"
                style={{
                  background: 'rgba(10, 10, 35, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: pkg.popular ? '2px solid #D4AF37' : '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: pkg.popular ? '0 8px 40px rgba(212, 175, 55, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.3)',
                  padding: '40px'
                }}
              >
                {pkg.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-[#D4AF37] text-[#0A0A23] font-semibold text-xs px-3 py-1 border-none">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Thumbnail */}
                <div className="mb-6 rounded-xl overflow-hidden" style={{ height: '120px', width: '120px', margin: '0 auto' }}>
                  <img src={pkg.thumbnail} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" style={{ filter: 'brightness(0.9) contrast(1.1)' }} />
                </div>

                {/* Title */}
                <h3 className="text-center mb-4" style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', color: '#D4AF37', fontWeight: '600' }}>
                  {pkg.title}
                </h3>

                {/* Description */}
                <p className="text-center mb-4 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '300', minHeight: '80px' }}>
                  {pkg.description}
                </p>

                {/* Includes line */}
                {pkg.includes && (
                  <p className="text-center mb-4 text-sm italic" style={{ color: 'rgba(212, 175, 55, 0.8)', fontFamily: 'Inter, sans-serif' }}>
                    {pkg.includes}
                  </p>
                )}

                {/* Price */}
                <div className="text-center mb-8" style={{ fontFamily: 'Playfair Display, serif', fontSize: '30px', color: '#D4AF37', fontWeight: '600' }}>
                  {pkg.price}
                </div>

                {/* CTA */}
                <div className="mt-auto">
                  <a href="/?chat=open">
                    <button
                      className="w-full transition-all duration-300 hover:scale-105"
                      style={{
                        padding: '14px 24px',
                        borderRadius: '8px',
                        background: pkg.popular ? '#D4AF37' : 'transparent',
                        border: '1.5px solid #D4AF37',
                        color: pkg.popular ? '#0A0A23' : '#D4AF37',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {pkg.cta}
                    </button>
                  </a>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" style={{ background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.1), transparent)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Golden Divider */}
      <div className="my-20 mx-auto" style={{ width: '80%', maxWidth: '800px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent)' }} />

      {/* Add-Ons */}
      <section className="w-full py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-4" style={{ fontFamily: 'Playfair Display, serif', fontSize: '42px', color: '#D4AF37', fontWeight: '600' }}>
            Enhance Your Experience
          </h2>
          <p className="text-center mb-12" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '300' }}>
            Combine add-ons to create fully immersive campaigns.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {addons.map((addon, index) => (
              <div
                key={index}
                className="text-center transition-all duration-300 hover:scale-105"
                style={{ background: 'rgba(10, 10, 35, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '16px', padding: '32px 24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}
              >
                <div className="mx-auto mb-4 rounded-full flex items-center justify-center" style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05))', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  <addon.icon className="w-8 h-8" style={{ color: '#D4AF37' }} />
                </div>
                <h4 className="mb-3" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#FFFFFF', fontWeight: '500' }}>{addon.name}</h4>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', color: '#D4AF37', fontWeight: '600' }}>{addon.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="w-full py-24 md:py-32 text-center px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 50%, #2D1B3D 100%)', marginTop: '80px' }}
      >
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 5vw, 44px)', color: '#0A0A23', fontWeight: '700' }}>
            Start Small or Build Big — Isabella Scales With You
          </h2>
          <p className="mb-10" style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', color: 'rgba(10, 10, 35, 0.7)', fontWeight: '400' }}>
            Whether you're testing your first campaign or building a full AI-powered system, Isabella adapts to your needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/?chat=open">
              <button
                className="transition-all duration-300 hover:scale-105"
                style={{ padding: '18px 48px', borderRadius: '12px', background: '#0A0A23', border: 'none', color: '#D4AF37', fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 24px rgba(10, 10, 35, 0.4)' }}
              >
                Start With Isabella Now
              </button>
            </a>
            <a href="/contact" className="flex items-center gap-2 transition-all duration-300 hover:gap-3" style={{ color: '#0A0A23', fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '500' }}>
              Or speak with our team <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(10, 10, 35, 0.3))' }} />
      </section>

      {/* Floating Ask Isabella */}
      <a
        href="/?chat=open"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
        style={{ background: '#D4AF37', color: '#0A0A23', fontFamily: 'Inter, sans-serif', fontWeight: '600', fontSize: '14px' }}
      >
        <MessageCircle className="w-5 h-5" />
        Ask Isabella
      </a>

      <FooterMinimal />
    </div>
  );
};

export default Pricing;
