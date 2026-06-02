import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FashionForwardGallery } from './FashionForwardGallery';
import { VideoWithSound } from './VideoWithSound';
import { useTranslation } from 'react-i18next';

interface ShowcaseSectionProps {
  injectAfter?: Record<number, React.ReactNode>;
}

export const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({ injectAfter }) => {
  const [isFashionGalleryOpen, setIsFashionGalleryOpen] = useState(false);
  const { t } = useTranslation();

  const showcaseItems = [
    {
      mediaType: 'video',
      src: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1779448780/ai_wesbite_assistant_gpkmyn.mp4',
      titleKey: 'showcase.fashionForward.title',
      descriptionKey: 'showcase.fashionForward.description',
      bulletsKey: 'showcase.fashionForward.bullets',
      layout: 'media-left'
    },
    {
      mediaType: 'video',
      src: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1779476166/SATURDAY_23_MAY_SHORT_copie_clzzcx.mp4',
      titleKey: 'showcase.interactiveMarketing.title',
      descriptionKey: 'showcase.interactiveMarketing.description',
      layout: 'media-right'
    },
    {
      mediaType: 'video',
      src: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1779818677/VIDEO_CONCEPT_OVELA_qvhyct.mp4',
      titleKey: 'showcase.multiBrand.title',
      descriptionKey: 'showcase.multiBrand.description',
      bulletsKey: 'showcase.multiBrand.bullets',
      layout: 'media-left'
    }
  ];

  return (
    <section className="w-full bg-black">
      <FashionForwardGallery isOpen={isFashionGalleryOpen} onClose={() => setIsFashionGalleryOpen(false)} />
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
              <VideoWithSound
                src={item.src}
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
                style={{ fontFamily: 'Playfair Display, serif', color: '#E8CFA9' }}
              >
                {t(item.titleKey)}
              </h3>
              <p
                className="text-base md:text-lg mb-6 leading-relaxed whitespace-pre-line"
                style={{ fontFamily: 'Inter, sans-serif', color: '#F5F5F5' }}
              >
                {t(item.descriptionKey)}
              </p>
              {(item as any).bulletsKey && (
                <ul className="mb-6 space-y-2">
                  {(t((item as any).bulletsKey, { returnObjects: true }) as string[]).map((b, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-base"
                      style={{ fontFamily: 'Inter, sans-serif', color: '#F5F5F5' }}
                    >
                      <span style={{ color: '#E8CFA9' }}>✔</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {item.titleKey === 'showcase.interactiveMarketing.title' ? (
                <Link
                  to="/projects"
                  className="inline-block transition-all duration-300 hover:underline"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#E8CFA9', fontSize: '16px' }}
                >
                  {t('showcase.seeProjects')} →
                </Link>
              ) : item.titleKey === 'showcase.multiBrand.title' ? (
                <Link
                  to="/projects"
                  className="inline-block transition-all duration-300 hover:underline"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#E8CFA9', fontSize: '16px' }}
                >
                  {t('showcase.seeHowItWorks')} →
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};
