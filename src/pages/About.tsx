
import React from 'react';
import Section from '@/components/UI/Section';

const About = () => {
  return (
    <div className="pt-16">
      {/* Intro/Story */}
      <Section className="text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-xl mb-8">
            About <span className="gradient-text">Ovela Interactive</span>
          </h1>
          <p className="body-lg text-muted-foreground leading-relaxed">
            Ovela Interactive was created to solve a challenge: traditional marketing was becoming slower, more costly, and less effective as the digital world accelerated. Our answer? AI-driven marketing that is fast, interactive, and adaptive.
          </p>
        </div>
      </Section>

      <Section background="gray">
        <div className="max-w-4xl mx-auto">
          <p className="body-lg text-muted-foreground leading-relaxed">
            Our journey began with WellnessGeni and the creation of Isabella — the first AI companion capable of modeling, promoting, and selling simultaneously. Isabella showed us that the future of marketing isn't just automation — it's humanlike intelligence combined with creative storytelling.
          </p>
        </div>
      </Section>

      {/* Mission & Vision */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="text-center lg:text-left">
            <h2 className="heading-lg mb-6">Mission Statement</h2>
            <p className="body-md text-muted-foreground leading-relaxed">
              To redefine sales and marketing through intelligent AI companions who connect with audiences on a deeper, more human level.
            </p>
          </div>
          
          <div className="text-center lg:text-left">
            <h2 className="heading-lg mb-6">Vision Statement</h2>
            <p className="body-md text-muted-foreground leading-relaxed">
              The future will be fast, competitive, and demanding. We believe every brand deserves an adaptive AI companion — one who represents authentically, sells effectively, and never misses a beat.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default About;
