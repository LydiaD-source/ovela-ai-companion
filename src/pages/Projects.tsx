import React from 'react';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const Projects = () => {
  const projects = [
    {
      id: 1,
      name: 'Lux Def Tec',
      description: 'A showcase of elegance and innovation, where Isabella brings products to life through immersive presence. This project reflects Ovela\'s vision of blending AI with artistry.',
      imagePlaceholder: 'Isabella for Lux Def Tec'
    },
    {
      id: 2,
      name: 'Veronica Ristulescu Psychology Group',
      description: 'Here Isabella becomes the storyteller — not just modeling a look, but creating an emotional connection with the audience. A balance of fashion and narrative.',
      imagePlaceholder: 'Isabella for Psychology Group'
    },
    {
      id: 3,
      name: 'HeShave',
      description: 'A campaign designed for impact. Isabella steps into the role of ambassador, translating brand values into relatable, memorable experiences.',
      imagePlaceholder: 'Isabella for HeShave'
    },
    {
      id: 4,
      name: 'WellnessGeni — Where Isabella Began',
      description: 'Before Ovela, there was WellnessGeni — an interactive app where Isabella first appeared as a wellness coach, motivator, and companion. She inspired people to train, stay positive, and feel supported in their daily lives. This was the project that revealed her true potential — the moment an AI model first became a trusted ambassador.',
      imagePlaceholder: 'Isabella at WellnessGeni'
    }
  ];

  const upcomingProjects = [
    { name: 'Lingerie Shoot 2025', image: 'Upcoming lingerie campaign' },
    { name: 'Luxury Calendar 2025', image: 'Luxury calendar preview' },
    { name: 'High Fashion Runway Demo', image: 'Runway demonstration' }
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
          Isabella's Projects
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
          From wellness coaching to luxury fashion — discover Isabella's journey as the world's first AI Model Ambassador.
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
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : project.id === 4 ? (
                  <video
                    src="https://res.cloudinary.com/di5gj4nyp/video/upload/v1760713364/202510171024_1_jxyq2j.mp4"
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
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
                {project.name}
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
                {project.description}
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
            Upcoming Collaborations
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
            Isabella's journey continues — from couture shoots to lifestyle campaigns, new chapters are on the horizon.
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
                          {project.name}
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
            <a href="/#chat">
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
                Partner with Isabella →
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
