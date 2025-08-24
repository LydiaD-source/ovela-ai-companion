
import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: 'white' | 'gray' | 'dark';
}

const Section = ({ children, className, id, background = 'white' }: SectionProps) => {
  const backgrounds = {
    white: 'bg-background',
    gray: 'bg-muted/30',
    dark: 'bg-charcoal text-soft-white'
  };

  return (
    <section 
      id={id}
      className={cn(
        'section-padding',
        backgrounds[background],
        className
      )}
    >
      <div className="container-custom">
        {children}
      </div>
    </section>
  );
};

export default Section;
