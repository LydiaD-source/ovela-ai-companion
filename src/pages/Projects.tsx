import React, { useState } from 'react';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useCanonicalLink } from '@/hooks/useCanonicalLink';
import { useTranslation } from 'react-i18next';

const Projects = () => {
  useCanonicalLink('/projects');
  const { t } = useTranslation();

  const [mutedVideos, setMutedVideos] = useState<{ [key: number]: boolean }>({
    1: true,
    2: true,
    3: true,
    4: true
  });

  const toggleMute = (projectId: number) => {
    setMutedVideos(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const projects = [
    {
      id: 1,
      nameKey: 'projects.items.luxDefTec.name',
      descriptionKey: 'projects.items.luxDefTec.description',
      imagePlaceholder: 'Isabella for Lux Def Tec'
    },
    {
      id: 2,
      nameKey: 'projects.items.robocareAI.name',
      descriptionKey: 'projects.items.robocareAI.description',
      imagePlaceholder: 'Isabella for Robocare AI'
    },
    {
      id: 3,
      nameKey: 'projects.items.ambassador.name',
      descriptionKey: 'projects.items.ambassador.description',
      imagePlaceholder: 'Isabella Ambassador'
    },
    {
      id: 4,
      nameKey: 'projects.items.wellnessGeni.name',
      descriptionKey: 'projects.items.wellnessGeni.description',
      imagePlaceholder: 'Isabella at WellnessGeni'
    }
  ];

  const upcomingProjects = [
    { nameKey: 'projects.upcoming.lingerie' },
    { nameKey: 'projects.upcoming.calendar' },
    { nameKey: 'projects.upcoming.runway' }
  ];

  return (
    <div 
      className="min-h-screen pt-16"
      style={{
        background: 'linear-gradient(180deg, #0A0A1C 0%, #1A0A2E 50%, rgba(212, 175, 55, 0.1) 100%)'
      }}
    >
      {/* Header Section */}
      <div className="py-24 px-6 text-center">
        <h2 
          className="mb-6"
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '42px',
            fontWeight: 'bold',
            color: '#D4AF37'
          }}
        >
          {t('projects.title')}
        </h2>
        <h4 
          className="max-w-3xl mx-auto"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '22px',
            fontWeight: '300',
            color: '#EDEDED',
            lineHeight: '1.6'
          }}
        >
          {t('projects.subtitle')}
        </h4>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-16" style={{ rowGap: '80px' }}>
          {projects.map((project) => (
            <div
              key={project.id}
              className="group transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Project Image */}
              <div
                className="relative rounded-2xl overflow-hidden mb-6"
                style={{
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)',
                  aspectRatio: '3/2'
                }}
              >
                {project.id === 1 ? (
                  <video
                    src="https://res.cloudinary.com/di5gj4nyp/video/upload/v1760723126/202510171413_obwauh.mp4"
                    className="w-full h-full object-cover cursor-pointer"
                    autoPlay
                    loop
                    muted={mutedVideos[1]}
                    playsInline
                    onClick={() => toggleMute(1)}
                  />
                ) : project.id === 2 ? (
                  <video
                    src="https://res.cloudinary.com/di5gj4nyp/video/upload/v1760816930/202510181728_fobqjd.mp4"
                    className="w-full h-full object-cover cursor-pointer"
                    autoPlay
                    loop
                    muted={mutedVideos[2]}
                    playsInline
                    onClick={() => toggleMute(2)}
                  />
                ) : project.id === 3 ? (
                  <video
                    src="https://res.cloudinary.com/di5gj4nyp/video/upload/v1765894467/superiorapartment.mp4"
                    className="w-full h-full object-cover cursor-pointer"
                    autoPlay
                    loop
                    muted={mutedVideos[3]}
                    playsInline
                    onClick={() => toggleMute(3)}
                  />
                ) : project.id === 4 ? (
                  <video
                    src="https://res.cloudinary.com/di5gj4nyp/video/upload/v1760713364/202510171024_1_jxyq2j.mp4"
                    className="w-full h-full object-cover cursor-pointer"
                    autoPlay
                    loop
                    muted={mutedVideos[4]}
                    playsInline
                    onClick={() => toggleMute(4)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">🎬</div>
                      <p style={{ color: '#D4AF37', fontFamily: 'Inter, sans-serif' }}>
                        [Placeholder: {project.imagePlaceholder}]
                      </p>
                    </div>
                  </div>
                )}
                {/* Sound indicator */}
                {(project.id === 1 || project.id === 2 || project.id === 3 || project.id === 4) && (
                  <div 
                    className="absolute bottom-4 right-4 bg-black/50 rounded-full p-2 backdrop-blur-sm"
                    style={{ pointerEvents: 'none' }}
                  >
                    <span className="text-2xl">
                      {mutedVideos[project.id] ? '🔇' : '🔊'}
                    </span>
                  </div>
                )}
              </div>

              {/* Project Info */}
              <h3
                className="mb-4"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#D4AF37'
                }}
              >
                {t(project.nameKey)}
              </h3>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '18px',
                  fontWeight: '300',
                  color: '#EDEDED',
                  lineHeight: '1.7'
                }}
              >
                {t(project.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Collaborations Section */}
      <div 
        className="py-24 px-6"
        style={{
          background: 'linear-gradient(180deg, rgba(10, 10, 28, 0.8) 0%, rgba(212, 175, 55, 0.15) 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <h3
            className="text-center mb-4"
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#D4AF37'
            }}
          >
            {t('projects.upcomingTitle')}
          </h3>
          <p
            className="text-center mb-12 max-w-2xl mx-auto"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '20px',
              fontWeight: '300',
              color: '#EDEDED'
            }}
          >
            {t('projects.upcomingSubtitle')}
          </p>

          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {upcomingProjects.map((project, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div
                    className="rounded-2xl overflow-hidden mx-2"
                    style={{
                      background: 'rgba(10, 10, 28, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)',
                      aspectRatio: '4/5'
                    }}
                  >
                    <div className="h-full flex items-center justify-center p-8 text-center">
                      <div>
                        <div className="text-5xl mb-4">✨</div>
                        <h4
                          style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            color: '#D4AF37'
                          }}
                        >
                          {t(project.nameKey)}
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
          <div className="text-center mt-12">
            <a href="/?chat=open">
              <button
                className="transition-all duration-300 hover:scale-105"
                style={{
                  background: '#D4AF37',
                  color: '#0A0A1C',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: '500',
                  padding: '16px 48px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)'
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