import React from 'react';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useSEO } from '@/hooks/useSEO';
import { useTranslation } from 'react-i18next';
import FeaturedProject from '@/components/Projects/FeaturedProject';
import ProjectCard from '@/components/Projects/ProjectCard';
import HowItWorksSection from '@/components/Projects/HowItWorksSection';

const projects = [
  {
    id: 'luxDefTec',
    titleKey: 'projects.items.luxDefTec.name',
    descriptionKey: 'projects.items.luxDefTec.description',
    videoSrc: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1760723126/202510171413_obwauh.mp4',
    liveUrl: 'https://luxdeftec.eu/',
    linkLabel: 'Visit Lux Def Tec',
  },
  {
    id: 'wellnessGeni',
    titleKey: 'projects.items.wellnessGeni.name',
    descriptionKey: 'projects.items.wellnessGeni.description',
    videoSrc: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1760713364/202510171024_1_jxyq2j.mp4',
    liveUrl: 'https://www.wellnessgeni.com/',
    linkLabel: 'Visit WellnessGeni',
  },
  {
    id: 'ambassador',
    titleKey: 'projects.items.ambassador.name',
    descriptionKey: 'projects.items.ambassador.description',
    videoSrc: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1765894467/superiorapartment.mp4',
    liveUrl: 'https://zonahabitable.com/ca/',
    linkLabel: 'View Ambassador Project',
  },
  {
    id: 'robocareAI',
    titleKey: 'projects.items.robocareAI.name',
    descriptionKey: 'projects.items.robocareAI.description',
    videoSrc: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1760816930/202510181728_fobqjd.mp4',
    comingSoon: true,
  },
];

const upcomingItems = [
  { nameKey: 'projects.upcoming.lingerie' },
  { nameKey: 'projects.upcoming.calendar' },
  { nameKey: 'projects.upcoming.runway' },
];

const Projects = () => {
  const { t } = useTranslation();
  useSEO({
    path: '/projects',
    title: t('seo.projects.title', "Isabella's Projects | AI Model Portfolio"),
    description: t('seo.projects.description', "Explore Isabella's project portfolio — from wellness coaching to luxury fashion campaigns."),
  });

  return (
    <div
      className="min-h-screen pt-16"
      style={{
        background: 'linear-gradient(180deg, hsl(var(--deep-navy)) 0%, hsl(var(--midnight-blue)) 40%, hsl(var(--champagne-gold) / 0.06) 100%)',
      }}
    >
      {/* Page Header */}
      <div className="py-16 md:py-20 px-6 text-center">
        <h1
          className="text-3xl md:text-[42px] font-bold mb-4"
          style={{ fontFamily: 'Playfair Display, serif', color: 'hsl(var(--champagne-gold))' }}
        >
          {t('projects.title')}
        </h1>
        <p
          className="max-w-3xl mx-auto text-lg md:text-[22px] font-light leading-relaxed"
          style={{ color: 'hsl(var(--soft-white))' }}
        >
          {t('projects.subtitle')}
        </p>
      </div>

      {/* Featured Project */}
      <FeaturedProject />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Projects Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-center text-2xl md:text-3xl font-bold mb-12"
            style={{ fontFamily: 'Playfair Display, serif', color: 'hsl(var(--champagne-gold))' }}
          >
            More Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                title={t(p.titleKey)}
                description={t(p.descriptionKey)}
                videoSrc={p.videoSrc}
                liveUrl={p.liveUrl}
                linkLabel={p.linkLabel}
                comingSoon={p.comingSoon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Collaborations */}
      <div
        className="py-20 px-6"
        style={{
          background: 'linear-gradient(180deg, hsl(0 0% 0% / 0.3) 0%, hsl(var(--champagne-gold) / 0.1) 100%)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <h3
            className="text-center text-2xl md:text-3xl font-bold mb-3"
            style={{ fontFamily: 'Playfair Display, serif', color: 'hsl(var(--champagne-gold))' }}
          >
            {t('projects.upcomingTitle')}
          </h3>
          <p
            className="text-center mb-10 max-w-2xl mx-auto text-lg font-light"
            style={{ color: 'hsl(var(--soft-white))' }}
          >
            {t('projects.upcomingSubtitle')}
          </p>

          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {upcomingItems.map((item, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div
                    className="rounded-2xl overflow-hidden mx-2 transition-all duration-300 hover:scale-[1.03]"
                    style={{
                      background: 'hsl(var(--deep-navy) / 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid hsl(var(--champagne-gold) / 0.2)',
                      aspectRatio: '4/5',
                    }}
                  >
                    <div className="h-full flex items-center justify-center p-8 text-center">
                      <div>
                        <div className="text-4xl mb-4">✨</div>
                        <h4
                          className="text-lg font-bold"
                          style={{ fontFamily: 'Playfair Display, serif', color: 'hsl(var(--champagne-gold))' }}
                        >
                          {t(item.nameKey)}
                        </h4>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>

          {/* CTA */}
          <div className="text-center mt-10">
            <a href="/?chat=open">
              <button
                className="transition-all duration-300 hover:scale-105 px-12 py-4 rounded-lg text-base font-medium border-none cursor-pointer"
                style={{
                  background: 'hsl(var(--champagne-gold))',
                  color: 'hsl(var(--deep-navy))',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 4px 20px hsl(var(--champagne-gold) / 0.3)',
                }}
              >
                {t('projects.ctaButton')}
              </button>
            </a>
          </div>
        </div>
      </div>

      <FooterMinimal />
    </div>
  );
};

export default Projects;
