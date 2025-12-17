import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LookbookItem {
  type: 'image' | 'video';
  src: string;
  captionKey: string;
}

const lookbookItems: LookbookItem[] = [
  {
    type: 'video',
    src: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1758907652/Ovela_2_hiufkv.mp4',
    captionKey: 'lookbook.captions.inMotion'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1759496778/Flux_Dev_Fullbody_or_closeup_portrait_of_adult_IsabellaV2_hair_0_jbwnwi.jpg',
    captionKey: 'lookbook.captions.editorial'
  },
  {
    type: 'video',
    src: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1758727075/b8674c11-00a4-42b4-ad39-ebaf103d9f18_1_ffgrvr.mp4',
    captionKey: 'lookbook.captions.runway'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1759495220/1_16_xpxhgm.jpg',
    captionKey: 'lookbook.captions.brandPartnerships'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1759495676/Flux_Dev_Use_Character_Element_IsabellaV2Focus_full_body_debou_000_18_ohp5o7.jpg',
    captionKey: 'lookbook.captions.fashionForward'
  },
  {
    type: 'image',
    src: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1759496281/Flux_Dev_Use_Character_Element_IsabellaV2Focus_upper_body_clos_1_iitsbk.jpg',
    captionKey: 'lookbook.captions.timelessElegance'
  },
  {
    type: 'video',
    src: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1758719713/133adb02-04ab-46f1-a4cf-ed32398f10b3_hsrjzm.mp4',
    captionKey: 'lookbook.captions.modernIcon'
  }
];

export const LookbookCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mutedStates, setMutedStates] = useState<Record<number, boolean>>(
    lookbookItems.reduce((acc, _, index) => ({ ...acc, [index]: true }), {})
  );
  const [buttonVisible, setButtonVisible] = useState<Record<number, boolean>>(
    lookbookItems.reduce((acc, item, index) => {
      if (item.type === 'video') {
        return { ...acc, [index]: true };
      }
      return acc;
    }, {})
  );
  const fadeTimeouts = useRef<Record<number, NodeJS.Timeout>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const scrollLeft = useRef<number>(0);
  const { t } = useTranslation();

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const slideWidth = container.scrollWidth / lookbookItems.length;
    const targetScroll = slideWidth * index;
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  const handlePrevious = () => {
    const newIndex = activeIndex === 0 ? lookbookItems.length - 1 : activeIndex - 1;
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = (activeIndex + 1) % lookbookItems.length;
    scrollToIndex(newIndex);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollContainerRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].pageX - (scrollContainerRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollContainerRef.current?.scrollLeft || 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    const x = e.touches[0].pageX - (scrollContainerRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const toggleMute = (index: number) => {
    setMutedStates(prev => ({ ...prev, [index]: !prev[index] }));
    setButtonVisible(prev => ({ ...prev, [index]: true }));
    
    // Clear existing timeout
    if (fadeTimeouts.current[index]) {
      clearTimeout(fadeTimeouts.current[index]);
    }
    
    // Set new fade timeout
    fadeTimeouts.current[index] = setTimeout(() => {
      setButtonVisible(prev => ({ ...prev, [index]: false }));
    }, 3000);
  };

  const handleVideoMouseEnter = (index: number) => {
    setButtonVisible(prev => ({ ...prev, [index]: true }));
    if (fadeTimeouts.current[index]) {
      clearTimeout(fadeTimeouts.current[index]);
    }
  };

  const handleVideoMouseLeave = (index: number) => {
    fadeTimeouts.current[index] = setTimeout(() => {
      setButtonVisible(prev => ({ ...prev, [index]: false }));
    }, 3000);
  };

  useEffect(() => {
    // Show all buttons initially, then fade after 3 seconds
    const initialTimeout = setTimeout(() => {
      setButtonVisible(
        lookbookItems.reduce((acc, item, index) => {
          if (item.type === 'video') {
            return { ...acc, [index]: false };
          }
          return acc;
        }, {})
      );
    }, 3000);

    return () => {
      clearTimeout(initialTimeout);
      Object.values(fadeTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return (
    <section 
      id="lookbook"
      className="w-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0A0E27 0%, #000000 100%)',
        minHeight: '70vh',
        paddingTop: '60px',
        paddingBottom: '60px'
      }}
    >
      {/* Left Arrow - Desktop Only */}
      <button
        onClick={handlePrevious}
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-[#E8CFA9]/30 transition-all duration-300 hover:bg-[#E8CFA9]/20 hover:border-[#E8CFA9] hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} style={{ color: '#E8CFA9' }} />
      </button>

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-[5%] cursor-grab active:cursor-grabbing"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {lookbookItems.map((item, index) => {
          const isActive = index === activeIndex;
          
          return (
            <div
              key={index}
              className="flex-shrink-0 group relative transition-all duration-400"
              style={{
                width: 'min(90vw, 450px)',
                minWidth: '300px',
                scrollSnapAlign: 'center',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                filter: isActive ? 'brightness(1.1)' : 'brightness(0.9)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onClick={() => scrollToIndex(index)}
            >
              {/* Media Container */}
              <div 
                className="relative w-full rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: '3/4',
                  boxShadow: isActive 
                    ? '0 20px 60px rgba(212, 175, 55, 0.4), 0 0 80px rgba(212, 175, 55, 0.2)'
                    : '0 10px 30px rgba(0, 0, 0, 0.5)',
                  transition: 'box-shadow 0.4s ease-in-out'
                }}
              >
                {item.type === 'video' ? (
                  <>
                    <video
                      src={item.src}
                      autoPlay
                      muted={mutedStates[index]}
                      loop
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onMouseEnter={() => handleVideoMouseEnter(index)}
                      onMouseLeave={() => handleVideoMouseLeave(index)}
                    />
                    {/* Sound Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute(index);
                      }}
                      onMouseEnter={() => handleVideoMouseEnter(index)}
                      className="absolute transition-opacity duration-300 flex items-center justify-center hover:scale-110"
                      style={{
                        bottom: '80px',
                        right: '20px',
                        width: window.innerWidth < 768 ? '32px' : '44px',
                        height: window.innerWidth < 768 ? '32px' : '44px',
                        borderRadius: '50%',
                        background: 'rgba(0, 0, 0, 0.6)',
                        border: '2px solid #D4AF37',
                        opacity: buttonVisible[index] === false ? 0.3 : 1,
                        boxShadow: buttonVisible[index] === false 
                          ? '0 0 10px rgba(212, 175, 55, 0.3)' 
                          : '0 0 20px rgba(212, 175, 55, 0.9)',
                        zIndex: 30,
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)'
                      }}
                      aria-label={mutedStates[index] ? 'Unmute video' : 'Mute video'}
                    >
                      {mutedStates[index] ? (
                        <VolumeX size={window.innerWidth < 768 ? 16 : 20} color="#D4AF37" strokeWidth={2} />
                      ) : (
                        <Volume2 size={window.innerWidth < 768 ? 16 : 20} color="#D4AF37" strokeWidth={2} />
                      )}
                    </button>
                  </>
                ) : (
                  <img
                    src={item.src}
                    alt={t(item.captionKey)}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                
                {/* Hover Glow Overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.15) 0%, transparent 70%)'
                  }}
                />
                
                {/* Caption Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <p
                    className="font-playfair italic text-lg"
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      color: '#E8CFA9'
                    }}
                  >
                    {t(item.captionKey)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Arrow - Desktop Only */}
      <button
        onClick={handleNext}
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-[#E8CFA9]/30 transition-all duration-300 hover:bg-[#E8CFA9]/20 hover:border-[#E8CFA9] hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight size={24} style={{ color: '#E8CFA9' }} />
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {lookbookItems.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className="transition-all duration-300"
            style={{
              width: index === activeIndex ? '32px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: index === activeIndex ? '#E8CFA9' : 'rgba(232, 207, 169, 0.4)'
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};