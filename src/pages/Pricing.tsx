import React from 'react';
import { Sparkles, Globe, Mic, Palette, BarChart3, Video, Monitor } from 'lucide-react';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { useCanonicalLink } from '@/hooks/useCanonicalLink';
import { useTranslation } from 'react-i18next';

const Pricing = () => {
  useCanonicalLink('/pricing');
  const { t } = useTranslation();

  const packages = [
    {
      title: t('pricing.packages.productPromotion.title'),
      description: t('pricing.packages.productPromotion.description'),
      price: t('pricing.packages.productPromotion.price'),
      thumbnail: '/images/pricing-product-promotion.jpg',
      icon: Sparkles
    },
    {
      title: t('pricing.packages.socialMedia.title'),
      description: t('pricing.packages.socialMedia.description'),
      price: t('pricing.packages.socialMedia.price'),
      thumbnail: '/images/pricing-social-media.jpg',
      icon: Globe
    },
    {
      title: t('pricing.packages.eventPresence.title'),
      description: t('pricing.packages.eventPresence.description'),
      price: t('pricing.packages.eventPresence.price'),
      thumbnail: '/images/pricing-event-presence.jpg',
      icon: Video
    },
    {
      title: t('pricing.packages.customAmbassador.title'),
      description: t('pricing.packages.customAmbassador.description'),
      price: t('pricing.packages.customAmbassador.price'),
      thumbnail: '/images/pricing-custom-ambassador.jpg',
      icon: Palette
    },
    {
      title: t('pricing.packages.websiteIntegration.title'),
      description: t('pricing.packages.websiteIntegration.description'),
      price: t('pricing.packages.websiteIntegration.price'),
      thumbnail: '/images/pricing-website-integration.jpg',
      icon: Monitor
    },
    {
      title: t('pricing.packages.ambassadorVideo.title'),
      description: t('pricing.packages.ambassadorVideo.description'),
      price: t('pricing.packages.ambassadorVideo.price'),
      thumbnail: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1765894467/superiorapartment.mp4',
      icon: Video,
      isVideo: true
    }
  ];

  const addons = [
    { icon: Palette, name: t('pricing.addons.customOutfit'), price: '€2,000' },
    { icon: Mic, name: t('pricing.addons.voiceLines'), price: '€500' },
    { icon: Globe, name: t('pricing.addons.multiLanguage'), price: '€1,200' },
    { icon: BarChart3, name: t('pricing.addons.animation3d'), price: '€3,000' }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0A0A23 0%, #1A0A2E 50%, #2D1B3D 100%)' }}>
      {/* Header / Tagline Section */}
      <section className="w-full py-20 md:py-32 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight"
            style={{
              fontFamily: 'Playfair Display, serif',
              color: '#D4AF37',
              fontWeight: '600',
              letterSpacing: '-0.02em'
            }}
          >
            {t('pricing.title')}
          </h1>
          <p 
            className="text-lg md:text-xl leading-relaxed"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: '300'
            }}
          >
            {t('pricing.subtitle')}
          </p>
        </div>
        
        {/* Decorative golden line */}
        <div 
          className="mt-16 mx-auto"
          style={{
            width: '200px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)'
          }}
        />
      </section>

      {/* Luxury Pricing Catalog */}
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
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  padding: '40px'
                }}
              >
                {/* Thumbnail */}
                <div className="mb-6 rounded-xl overflow-hidden" style={{ height: '120px', width: '120px', margin: '0 auto' }}>
                  {(pkg as any).isVideo ? (
                    <video
                      src={pkg.thumbnail}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                      style={{
                        filter: 'brightness(0.9) contrast(1.1)',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  ) : (
                    <img
                      src={pkg.thumbnail}
                      alt={pkg.title}
                      className="w-full h-full object-cover"
                      style={{
                        filter: 'brightness(0.9) contrast(1.1)',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  )}
                </div>

                {/* Title */}
                <h3
                  className="text-center mb-4"
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '28px',
                    color: '#D4AF37',
                    fontWeight: '600'
                  }}
                >
                  {pkg.title}
                </h3>

                {/* Description */}
                <p
                  className="text-center mb-6 leading-relaxed"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: '300',
                    minHeight: '80px'
                  }}
                >
                  {pkg.description}
                </p>

                {/* Price */}
                <div
                  className="text-center mb-8"
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '32px',
                    color: '#D4AF37',
                    fontWeight: '600'
                  }}
                >
                  {pkg.price}
                </div>

                {/* CTA Button */}
                <div className="mt-auto">
                  <a href="/?chat=open">
                    <button
                      className="w-full transition-all duration-300 hover:scale-105"
                      style={{
                        padding: '14px 24px',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: '1.5px solid #D4AF37',
                        color: '#D4AF37',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      {t('pricing.requestButton')}
                    </button>
                  </a>
                </div>

                {/* Hover glow effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.1), transparent)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Golden Divider */}
      <div 
        className="my-20 mx-auto"
        style={{
          width: '80%',
          maxWidth: '800px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent)',
          boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
        }}
      />

      {/* Exclusive Add-Ons Section */}
      <section className="w-full py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-center mb-12"
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '42px',
              color: '#D4AF37',
              fontWeight: '600'
            }}
          >
            {t('pricing.addonsTitle')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {addons.map((addon, index) => (
              <div
                key={index}
                className="text-center transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(10, 10, 35, 0.4)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div
                  className="mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05))',
                    border: '1px solid rgba(212, 175, 55, 0.3)'
                  }}
                >
                  <addon.icon className="w-8 h-8" style={{ color: '#D4AF37' }} />
                </div>
                <h4
                  className="mb-3"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    color: '#FFFFFF',
                    fontWeight: '500'
                  }}
                >
                  {addon.name}
                </h4>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '18px',
                    color: '#D4AF37',
                    fontWeight: '600'
                  }}
                >
                  {addon.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Strip */}
      <section
        className="w-full py-24 md:py-32 text-center px-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 50%, #2D1B3D 100%)',
          marginTop: '80px'
        }}
      >
        <div className="max-w-4xl mx-auto relative z-10">
          <h2
            className="mb-8 leading-tight"
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(32px, 5vw, 48px)',
              color: '#0A0A23',
              fontWeight: '700'
            }}
          >
            {t('pricing.ctaTitle')}
          </h2>
          
          <a href="/?chat=open">
            <button
              className="transition-all duration-300 hover:scale-105"
              style={{
                padding: '18px 48px',
                borderRadius: '12px',
                background: '#0A0A23',
                border: 'none',
                color: '#D4AF37',
                fontFamily: 'Inter, sans-serif',
                fontSize: '20px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(10, 10, 35, 0.4)'
              }}
            >
              {t('pricing.ctaButton')}
            </button>
          </a>
        </div>

        {/* Decorative fade effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, transparent 30%, rgba(10, 10, 35, 0.3))'
          }}
        />
      </section>

      <FooterMinimal />
    </div>
  );
};

export default Pricing;