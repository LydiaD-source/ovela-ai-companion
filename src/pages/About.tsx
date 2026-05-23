import React from 'react';
import { Link } from 'react-router-dom';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { useSEO } from '@/hooks/useSEO';
import { MessageCircle, ArrowRight, Stethoscope, Cpu, Home as HomeIcon, Sparkles } from 'lucide-react';

const GOLD = '#D4AF37';
const NAVY = '#0A0A23';
const chatHref = '/?chat=open';

const About = () => {
  useSEO({
    path: '/about',
    title: 'About Ovela Interactive | Interactive Business Experiences',
    description: 'Ovela builds digital team members that communicate, guide and engage in real time — transforming passive visitors into active conversations.'
  });

  const team = [
    {
      icon: Stethoscope,
      name: 'Isabella',
      image: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1758802492/1_21_cqlyv4.jpg',
      focus: 'Healthcare • Hospitality • Client Guidance',
      desc: 'Helping visitors explore services, understand options and take action.',
    },
    {
      icon: Cpu,
      name: 'Dario',
      image: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1777296226/lucid-origin_artistic_portrait_photography_of_ultra_realistic_portrait_of_a_handsome_masculin-0_1_xelofp.jpg',
      focus: 'Technology • Innovation • Product Presentation',
      desc: 'Explaining complex products and communicating technical solutions with clarity.',
    },
    {
      icon: HomeIcon,
      name: 'Mirella',
      image: 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1779109383/mirella_face_d8ix2l.png',
      focus: 'Property • Lifestyle • Premium Experiences',
      desc: 'Presenting properties and helping buyers engage before the first viewing.',
    },
    {
      icon: Sparkles,
      name: 'Future Team Members',
      image: null as string | null,
      focus: 'Custom-Built For Any Industry',
      desc: 'Ovela representatives can be custom-created for any industry, role or brand.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="w-full min-h-screen flex items-center" style={{ background: 'linear-gradient(180deg, #0A0A23 0%, #1a1a3e 100%)' }}>
        <div className="container mx-auto px-6 lg:px-20 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl mb-6" style={{ color: GOLD }}>
                Where Interactive Business Experiences Begin
              </h1>
              <p className="text-lg lg:text-xl leading-relaxed mb-5" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF', fontWeight: 300 }}>
                Ovela was created to solve a simple problem: websites, campaigns and digital content attract attention, but rarely create meaningful interaction.
              </p>
              <p className="text-lg lg:text-xl leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF', fontWeight: 300 }}>
                We build digital team members that communicate, guide and engage in real time — transforming passive visitors into active conversations.
              </p>
            </div>
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md overflow-hidden rounded-lg group">
                <img
                  src="https://res.cloudinary.com/di5gj4nyp/image/upload/v1759515522/Flux_Dev_Fullbody_portrait_of_IsabellaV2_head_to_feet_visible__0_er2yhj.jpg"
                  alt="Isabella - Interactive AI Ambassador"
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                  style={{ boxShadow: '0 0 40px rgba(212, 175, 55, 0.3)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full flex justify-center py-1" style={{ background: '#FFFFFF' }}>
        <div className="w-32 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)' }} />
      </div>

      {/* SECTION 1 — The Beginning: Isabella */}
      <section className="w-full py-24" style={{ background: '#FFFFFF' }}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-full max-w-md overflow-hidden rounded-lg group">
                <img
                  src="https://res.cloudinary.com/di5gj4nyp/image/upload/v1761920909/GetAttachmentThumbnail_dstnhw.jpg"
                  alt="Isabella - Interactive AI Ambassador"
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                  style={{ boxShadow: '0 10px 40px rgba(212, 175, 55, 0.2)' }}
                />
              </div>
            </div>
            <div>
              <p className="mb-3 tracking-[0.3em] uppercase text-xs" style={{ color: GOLD, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                The Beginning
              </p>
              <h2 className="font-playfair text-4xl lg:text-5xl mb-6" style={{ color: NAVY }}>
                Isabella
              </h2>
              <p className="text-lg leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#2a2a2a', fontWeight: 300 }}>
                In 2024, Ovela introduced{' '}
                <Link to="/projects" className="text-[#D4AF37] hover:underline font-medium">Isabella</Link>{' '}
                — one of the first interactive AI model ambassadors designed not only to present products, but to communicate, guide and engage with audiences in real time.
              </p>
              <p className="text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#2a2a2a', fontWeight: 300 }}>
                What began as an experiment in human-centered AI quickly became proof that digital representatives could do far more than traditional content.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full flex justify-center py-1" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #0A0A23 100%)' }}>
        <div className="w-32 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)' }} />
      </div>

      {/* SECTION 2 — From Content To Conversation */}
      <section className="w-full py-24" style={{ background: 'linear-gradient(180deg, #0A0A23 0%, #1a1a3e 100%)' }}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="mb-3 tracking-[0.3em] uppercase text-xs" style={{ color: GOLD, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Our Mission
              </p>
              <h2 className="font-playfair text-4xl lg:text-5xl mb-6" style={{ color: GOLD }}>
                From Content To Conversation
              </h2>
              <p className="text-lg leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF', fontWeight: 300 }}>
                Traditional websites provide information. Ovela creates interaction.
              </p>
              <p className="text-lg leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF', fontWeight: 300 }}>
                We combine AI representatives, cinematic media, intelligent automation and business knowledge to build experiences that help visitors explore, understand and take action.
              </p>
              <p className="text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF', fontWeight: 300 }}>
                Our goal is simple: make every digital interaction feel more human, more useful and more memorable.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md overflow-hidden rounded-lg group">
                <img
                  src="https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301787/Flux_Dev_A_premium_flat_lay_inspired_by_Dior_and_Chanel_beauty_1_ujtnli.jpg"
                  alt="Ovela interactive brand aesthetic"
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                  style={{ boxShadow: '0 0 40px rgba(212, 175, 55, 0.3)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full flex justify-center py-1" style={{ background: 'linear-gradient(180deg, #1a1a3e 0%, #FFFFFF 100%)' }}>
        <div className="w-32 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)' }} />
      </div>

      {/* SECTION 3 — The Foundation: WellnessGeni */}
      <section className="w-full py-24" style={{ background: '#FFFFFF' }}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-full max-w-md overflow-hidden rounded-lg group">
                <img
                  src="/lovable-uploads/isabella-appearance-settings.png"
                  alt="Isabella inside the WellnessGeni app"
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                  style={{ boxShadow: '0 10px 40px rgba(212, 175, 55, 0.2)' }}
                />
              </div>
            </div>
            <div>
              <p className="mb-3 tracking-[0.3em] uppercase text-xs" style={{ color: GOLD, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                The Foundation
              </p>
              <h2 className="font-playfair text-4xl lg:text-5xl mb-6" style={{ color: NAVY }}>
                WellnessGeni
              </h2>
              <p className="text-lg leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#2a2a2a', fontWeight: 300 }}>
                Before Ovela existed,{' '}
                <Link to="/projects" className="text-[#D4AF37] hover:underline font-medium">Isabella</Link>{' '}
                was developed as part of{' '}
                <a href="https://www.wellnessgeni.com/" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline font-medium">WellnessGeni</a>{' '}
                — a wellness-focused platform designed to encourage daily engagement, motivation and personal growth.
              </p>
              <p className="text-lg leading-relaxed mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#2a2a2a', fontWeight: 300 }}>
                The project revealed something unexpected: people were not simply consuming content. They were forming genuine relationships through interaction.
              </p>
              <p className="text-lg leading-relaxed mb-8" style={{ fontFamily: 'Inter, sans-serif', color: '#2a2a2a', fontWeight: 300 }}>
                That insight became the foundation of Ovela.
              </p>
              <blockquote className="font-playfair text-xl md:text-2xl italic pl-6 border-l-2" style={{ color: GOLD, borderColor: GOLD }}>
                "We didn't set out to create a digital model. We set out to create a better digital experience."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full flex justify-center py-1" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #0A0A23 100%)' }}>
        <div className="w-32 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)' }} />
      </div>

      {/* MEET THE OVELA TEAM */}
      <section id="team" className="w-full py-24" style={{ background: 'linear-gradient(180deg, #0A0A23 0%, #1a1a3e 100%)' }}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="mb-3 tracking-[0.3em] uppercase text-xs" style={{ color: GOLD, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              The Team
            </p>
            <h2 className="font-playfair text-4xl lg:text-5xl mb-5" style={{ color: GOLD }}>
              Meet The Ovela Team
            </h2>
            <p className="text-lg" style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.8)', fontWeight: 300 }}>
              Every Ovela representative is trained for a specific environment, audience and customer journey.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {team.map((m, i) => (
              <div
                key={i}
                className="rounded-2xl p-7 flex flex-col transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'rgba(10,10,35,0.6)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                <div className="mb-4 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <m.icon className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <h3 className="font-playfair" style={{ fontSize: 24, color: GOLD, fontWeight: 600 }}>{m.name}</h3>
                <p className="mt-2 mb-4 tracking-wide text-xs uppercase" style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.7)', fontWeight: 500, letterSpacing: '0.15em' }}>
                  {m.focus}
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 300, lineHeight: 1.6 }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="w-full flex justify-center py-1" style={{ background: 'linear-gradient(180deg, #1a1a3e 0%, #0A0A23 100%)' }}>
        <div className="w-32 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)' }} />
      </div>

      {/* BUILDING THE FUTURE */}
      <section className="w-full py-24" style={{ background: 'linear-gradient(180deg, #0A0A23 0%, #1a1a3e 100%)' }}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="max-w-4xl mx-auto text-center">
            <p className="mb-3 tracking-[0.3em] uppercase text-xs" style={{ color: GOLD, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Shaping Tomorrow
            </p>
            <h2 className="font-playfair text-4xl lg:text-5xl mb-8" style={{ color: GOLD }}>
              Building The Future Of Interactive Business
            </h2>
            <p className="text-lg leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF', fontWeight: 300 }}>
              The next generation of digital experiences will not be static.
            </p>
            <p className="text-lg leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF', fontWeight: 300 }}>
              Visitors will ask questions, receive guidance, explore solutions and interact naturally with businesses online.
            </p>
            <p className="text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF', fontWeight: 300 }}>
              Ovela is helping organizations prepare for that future today through interactive representatives, intelligent automation and immersive digital communication.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="w-full py-24 md:py-32 text-center px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 50%, #2D1B3D 100%)' }}>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="mb-6 leading-tight font-playfair" style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: NAVY, fontWeight: 700 }}>
            Your Website Should Work Like A Team
          </h2>
          <p className="mb-10 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, color: 'rgba(10,10,35,0.8)', fontWeight: 400, lineHeight: 1.6 }}>
            Whether you need a digital receptionist, product specialist, property presenter or brand ambassador, Ovela can help you create an interactive experience designed around your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#team">
              <button className="transition-all duration-300 hover:scale-105" style={{ padding: '18px 40px', borderRadius: 12, background: NAVY, border: 'none', color: GOLD, fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(10,10,35,0.4)' }}>
                Meet The Team
              </button>
            </a>
            <a href={chatHref}>
              <button className="transition-all duration-300 hover:scale-105 flex items-center gap-2" style={{ padding: '18px 40px', borderRadius: 12, background: 'transparent', border: `2px solid ${NAVY}`, color: NAVY, fontFamily: 'Inter, sans-serif', fontSize: 17, fontWeight: 700, cursor: 'pointer' }}>
                Start Your Project <ArrowRight className="w-4 h-4" />
              </button>
            </a>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(10,10,35,0.3))' }} />
      </section>

      <FooterMinimal />

      <a
        href={chatHref}
        className="isabella-floating-btn flex items-center gap-2 px-5 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
        style={{ background: 'linear-gradient(135deg, #D4AF37, #B8972E)', color: NAVY, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="btn-label">Ask Isabella</span>
      </a>
    </div>
  );
};

export default About;
