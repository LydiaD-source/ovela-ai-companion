import React from 'react';

const showcaseItems = [
  {
    mediaType: 'video',
    src: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1758727075/b8674c11-00a4-42b4-ad39-ebaf103d9f18_1_ffgrvr.mp4',
    title: 'Fashion Forward',
    description: 'High-end editorial campaigns that capture attention and drive engagement',
    layout: 'media-left'
  },
  {
    mediaType: 'image',
    src: '/lovable-uploads/10967d19-2fe9-4ab6-aa70-39ba0280a4a2.png',
    title: 'Interactive Marketing',
    description: 'Real-time customer interactions that convert browsers into buyers',
    layout: 'media-right'
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
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover"
              />
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
