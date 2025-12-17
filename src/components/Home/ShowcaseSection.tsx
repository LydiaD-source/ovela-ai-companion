import React, { useState } from 'react';
import { InteractiveMarketingGallery } from './InteractiveMarketingGallery';
import { FashionForwardGallery } from './FashionForwardGallery';
import { MultiBrandGallery } from './MultiBrandGallery';
import { useTranslation } from 'react-i18next';

export const ShowcaseSection = () => {
  const [isInteractiveGalleryOpen, setIsInteractiveGalleryOpen] = useState(false);
  const [isFashionGalleryOpen, setIsFashionGalleryOpen] = useState(false);
  const [isMultiBrandGalleryOpen, setIsMultiBrandGalleryOpen] = useState(false);
  const { t } = useTranslation();

  const showcaseItems = [
    {
      mediaType: 'video',
      src: 'https://res.cloudinary.com/di5gj4nyp/video/upload/202509242206_1_nnxmtz.mp4',
      titleKey: 'showcase.fashionForward.title',
      descriptionKey: 'showcase.fashionForward.description',
      layout: 'media-left'
    },
    {
      mediaType: 'image',
      src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1758192666/FTlux_Dev_Use_Character_Element_IsabellaV2Focus_full_body_stand_3_7_jod0un.jpg',
      titleKey: 'showcase.interactiveMarketing.title',
      descriptionKey: 'showcase.interactiveMarketing.description',
      layout: 'media-right'
    },
    {
      mediaType: 'image',
      src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1759502793/Flux_Dev_Use_Character_Element_IsabellaV2Focus_upper_bodyCloth_0_xhxhvn.jpg',
      titleKey: 'showcase.multiBrand.title',
      descriptionKey: 'showcase.multiBrand.description',
      layout: 'media-left'
    }
  ];

  return (
    <section className="w-full bg-black">
      <InteractiveMarketingGallery isOpen={isInteractiveGalleryOpen} onClose={() => setIsInteractiveGalleryOpen(false)} />
      <FashionForwardGallery isOpen={isFashionGalleryOpen} onClose={() => setIsFashionGalleryOpen(false)} />
      <MultiBrandGallery isOpen={isMultiBrandGalleryOpen} onClose={() => setIsMultiBrandGalleryOpen(false)} />
      {showcaseItems.map((item, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row min-h-screen"
          style={{
            flexDirection: item.layout === 'media-right' ? 'row-reverse' : 'row'
          }}
        >
          {/* Media Side */}
          <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative overflow-hidden">
            {item.mediaType === 'video' ? (
              <video
                src={item.src}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={item.src}
                  alt={t(item.titleKey)}
                  className="w-full h-full object-cover object-center"
                  style={{ 
                    maxWidth: '1120px',
                    margin: '0 auto',
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 95%, rgba(0,0,0,0))',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 95%, rgba(0,0,0,0))',
                    imageRendering: '-webkit-optimize-contrast',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                />
              </div>
            )}
          </div>

          {/* Text Side */}
          <div className="w-full md:w-1/2 h-[50vh] md:h-screen flex items-center justify-center px-8 md:px-16 bg-black">
            <div className="max-w-lg">
              <h3
                className="font-playfair text-2xl md:text-3xl mb-4"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  color: '#E8CFA9'
                }}
              >
                {t(item.titleKey)}
              </h3>
              <p
                className="text-base md:text-lg mb-6 leading-relaxed"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#F5F5F5'
                }}
              >
                {t(item.descriptionKey)}
              </p>
              {item.titleKey === 'showcase.interactiveMarketing.title' ? (
                <button
                  onClick={() => setIsInteractiveGalleryOpen(true)}
                  className="inline-block transition-all duration-300 hover:underline"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#E8CFA9',
                    fontSize: '16px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  {t('showcase.seePortfolio')} →
                </button>
              ) : item.titleKey === 'showcase.fashionForward.title' ? (
                <button
                  onClick={() => setIsFashionGalleryOpen(true)}
                  className="inline-block transition-all duration-300 hover:underline"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#E8CFA9',
                    fontSize: '16px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  {t('showcase.seePortfolio')} →
                </button>
              ) : item.titleKey === 'showcase.multiBrand.title' ? (
                <button
                  onClick={() => setIsMultiBrandGalleryOpen(true)}
                  className="inline-block transition-all duration-300 hover:underline"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#E8CFA9',
                    fontSize: '16px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  {t('showcase.seePortfolio')} →
                </button>
              ) : (
                <a
                  href="#portfolio"
                  className="inline-block transition-all duration-300 hover:underline"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#E8CFA9',
                    fontSize: '16px'
                  }}
                >
                  {t('showcase.seeFullPortfolio')} →
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};