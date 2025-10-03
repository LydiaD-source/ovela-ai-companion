import React, { useState, useEffect } from 'react';

interface LookbookItem {
  type: 'image' | 'video';
  src: string;
  caption: string;
}

const lookbookItems: LookbookItem[] = [
  {
    type: 'video',
    src: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1758719713/133adb02-04ab-46f1-a4cf-ed32398f10b3_hsrjzm.mp4',
    caption: 'Isabella in Motion — The Future of Brand Ambassadors'
  },
  {
    type: 'image',
    src: '/lovable-uploads/747c6d6a-cb67-45f5-9bf0-64ea66c8b8e4.png',
    caption: 'Editorial Excellence — AI-Powered Sophistication'
  },
  {
    type: 'video',
    src: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1758727075/b8674c11-00a4-42b4-ad39-ebaf103d9f18_1_ffgrvr.mp4',
    caption: 'Runway Ready — Redefining Fashion with AI'
  },
  {
    type: 'image',
    src: '/lovable-uploads/b06efdff-127f-4fcd-9e95-9dcf24e4b22f.png',
    caption: 'Brand Partnerships — Elevating Every Campaign'
  }
];

export const LookbookCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % lookbookItems.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full relative overflow-hidden bg-black">
      <div className="relative w-full h-[70vh] md:h-[70vh]">
        {lookbookItems.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {item.type === 'video' ? (
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
                alt={item.caption}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Caption Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <p
                className="font-playfair italic text-[#E8CFA9] text-lg md:text-2xl max-w-3xl"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {lookbookItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'bg-[#E8CFA9] w-8' : 'bg-[#E8CFA9]/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
