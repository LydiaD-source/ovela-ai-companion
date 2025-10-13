import React, { useState } from 'react';
import { InteractiveMarketingGallery } from './InteractiveMarketingGallery';

const showcaseItems = [
  {
    mediaType: 'video',
    src: 'https://res.cloudinary.com/di5gj4nyp/video/upload/202509242206_1_nnxmtz.mp4',
    title: 'Fashion Forward',
    description: 'High-end editorial campaigns that capture attention and drive engagement',
    layout: 'media-left'
  },
  {
    mediaType: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1758192666/FTlux_Dev_Use_Character_Element_IsabellaV2Focus_full_body_stand_3_7_jod0un.jpg',
    title: 'Interactive Marketing',
    description: 'Isabella transforms traditional campaigns into conversations. Luxury brands can now engage audiences directly through interactive experiences.',
    layout: 'media-right'
  },
  {
    mediaType: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1759502793/Flux_Dev_Use_Character_Element_IsabellaV2Focus_upper_bodyCloth_0_xhxhvn.jpg',
    title: 'Multi-Brand Excellence',
    description: 'Seamless representation across diverse industries and audiences',
    layout: 'media-left'
  }
];

export const ShowcaseSection = () => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  return (
    <section className="w-full bg-black">
      <InteractiveMarketingGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
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
                  alt={item.title}
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
                {item.title}
              </h3>
              <p
                className="text-base md:text-lg mb-6 leading-relaxed"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#F5F5F5'
                }}
              >
                {item.description}
              </p>
              {item.title === 'Interactive Marketing' ? (
                <button
                  onClick={() => setIsGalleryOpen(true)}
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
                  See Portfolio →
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
                  See Full Portfolio →
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};
