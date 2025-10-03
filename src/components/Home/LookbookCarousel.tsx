import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LookbookItem {
  type: 'image' | 'video';
  src: string;
  caption: string;
}

const lookbookItems: LookbookItem[] = [
  {
    type: 'video',
    src: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1758719713/133adb02-04ab-46f1-a4cf-ed32398f10b3_hsrjzm.mp4',
    caption: 'Isabella in Motion'
  },
  {
    type: 'image',
    src: '/lovable-uploads/747c6d6a-cb67-45f5-9bf0-64ea66c8b8e4.png',
    caption: 'Editorial Excellence'
  },
  {
    type: 'video',
    src: 'https://res.cloudinary.com/di5gj4nyp/video/upload/v1758727075/b8674c11-00a4-42b4-ad39-ebaf103d9f18_1_ffgrvr.mp4',
    caption: 'Runway Ready'
  },
  {
    type: 'image',
    src: '/lovable-uploads/b06efdff-127f-4fcd-9e95-9dcf24e4b22f.png',
    caption: 'Brand Partnerships'
  },
  {
    type: 'image',
    src: '/lovable-uploads/b08873ce-6e3a-412a-aae2-2dc08fe8f75c.png',
    caption: 'Fashion Forward'
  },
  {
    type: 'image',
    src: '/lovable-uploads/10967d19-2fe9-4ab6-aa70-39ba0280a4a2.png',
    caption: 'Timeless Elegance'
  },
  {
    type: 'image',
    src: '/lovable-uploads/3548b4f8-b4f5-410a-a3cd-669f8d922534.png',
    caption: 'Modern Icon'
  }
];

export const LookbookCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

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
                  <video
                    src={item.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.caption}
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
                    {item.caption}
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
