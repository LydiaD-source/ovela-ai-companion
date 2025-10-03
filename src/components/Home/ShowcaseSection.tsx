import React from 'react';

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
    layout: 'media-right',
    isInteractive: true
  },
  {
    mediaType: 'image',
    src: '/lovable-uploads/3548b4f8-b4f5-410a-a3cd-669f8d922534.png',
    title: 'Multi-Brand Excellence',
    description: 'Seamless representation across diverse industries and audiences',
    layout: 'media-left'
  }
];

export const ShowcaseSection = () => {
  return (
    <section className="w-full bg-black">
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
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 95%, rgba(0,0,0,0))'
                  }}
                />
                {item.isInteractive && (
                  <>
                    {/* Champagne Gold Gradient Overlay */}
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(232, 207, 169, 0.2) 0%, rgba(232, 207, 169, 0.05) 100%)'
                      }}
                    />
                    {/* Chat Bubble Overlay */}
                    <div 
                      className="absolute top-[15%] left-[10%] max-w-[20%] min-w-[200px]"
                      style={{
                        animation: 'fadeIn 1s ease-in-out'
                      }}
                    >
                      <div 
                        className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
                        style={{
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <p 
                          className="text-sm md:text-base"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            color: '#2C2C2C',
                            lineHeight: '1.5'
                          }}
                        >
                          Would you like to discover more?
                        </p>
                      </div>
                      {/* Chat bubble tail */}
                      <div 
                        className="w-0 h-0 ml-6"
                        style={{
                          borderLeft: '10px solid transparent',
                          borderRight: '10px solid transparent',
                          borderTop: '10px solid rgba(255, 255, 255, 0.9)',
                          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                        }}
                      />
                    </div>
                  </>
                )}
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
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};
