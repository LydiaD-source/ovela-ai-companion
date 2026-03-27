import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { useSEO } from '@/hooks/useSEO';
import { MessageCircle } from 'lucide-react';

const About = () => {
  const { t } = useTranslation();
  useSEO({
    path: '/about',
    title: t('seo.about.title', 'About Ovela Interactive | AI Modeling Agency'),
    description: t('seo.about.description', 'Learn about Ovela Interactive and Isabella, the world\'s first AI model ambassador. Discover our journey from WellnessGeni to revolutionizing interactive modeling.')
  });

  return (
    <div className="min-h-screen">
      {/* Section 1 – Hero: Where Interactive Modeling Began */}
      <section className="w-full min-h-screen flex items-center" style={{
        background: 'linear-gradient(180deg, #0A0A23 0%, #1a1a3e 100%)'
      }}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h1 className="font-playfair text-5xl lg:text-6xl mb-6" style={{ color: '#D4AF37' }}>
                {t('aboutPage.heroTitle', 'Where Interactive Modeling Began')}
              </h1>
              <p className="text-lg lg:text-xl leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF', fontWeight: 300 }}>
                {t('aboutPage.heroDescription', 'Ovela is redefining the modeling industry through AI, bringing human connection back to digital experiences. Our journey started with a simple vision: models should do more than pose — they should interact.')}
              </p>
            </div>
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md overflow-hidden rounded-lg group">
                <img
                  src="https://res.cloudinary.com/di5gj4nyp/image/upload/v1759515522/Flux_Dev_Fullbody_portrait_of_IsabellaV2_head_to_feet_visible__0_er2yhj.jpg"
                  alt="Isabella - Interactive AI Model Ambassador"
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                  style={{ boxShadow: '0 0 40px rgba(212, 175, 55, 0.3)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Golden Divider */}
      <div className="w-full flex justify-center py-1" style={{ background: '#FFFFFF' }}>
        <div className="w-32 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)' }} />
      </div>

      {/* Section 2 – Isabella: Interactive AI Model */}
      <section className="w-full py-24" style={{ background: '#FFFFFF' }}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-full max-w-md overflow-hidden rounded-lg group">
                <img
                  src="https://res.cloudinary.com/di5gj4nyp/image/upload/v1761920909/GetAttachmentThumbnail_dstnhw.jpg"
                  alt="Isabella AI Model in action"
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                  style={{ boxShadow: '0 10px 40px rgba(212, 175, 55, 0.2)' }}
                />
              </div>
            </div>
            <div>
              <h2 className="font-playfair text-4xl lg:text-5xl mb-8" style={{ color: '#0A0A23' }}>
                {t('aboutPage.isabellaTitle', 'Isabella – The World\'s First Interactive AI Model Ambassador')}
              </h2>
              <p className="text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#2a2a2a', fontWeight: 300 }}>
                By combining luxury fashion aesthetics with cutting-edge AI, Ovela created{' '}
                <Link to="/projects" className="text-[#D4AF37] hover:underline font-medium">Isabella</Link>,
                the interactive model ambassador. Isabella engages audiences in real-time, adapts to brands, communicates across languages, and delivers campaigns with a human touch — a model who is alive in every interaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Golden Divider */}
      <div className="w-full flex justify-center py-1" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #0A0A23 100%)' }}>
        <div className="w-32 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)' }} />
      </div>

      {/* Section 3 – The Birth of Ovela */}
      <section className="w-full py-24" style={{ background: 'linear-gradient(180deg, #0A0A23 0%, #1a1a3e 100%)' }}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-playfair text-4xl lg:text-5xl mb-8" style={{ color: '#D4AF37' }}>
                {t('aboutPage.birthTitle', 'The Birth of Ovela')}
              </h2>
              <p className="text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF', fontWeight: 300 }}>
                Founded on the belief that models should do more than represent, Ovela brings stories to life.{' '}
                <Link to="/projects" className="text-[#D4AF37] hover:underline font-medium">Isabella</Link>{' '}
                isn't just a model — she's a digital ambassador who empowers brands to tell stories in ways traditional media cannot. Every campaign is personalized, interactive, and memorable.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md overflow-hidden rounded-lg group">
                <img
                  src="https://res.cloudinary.com/di5gj4nyp/image/upload/v1765301787/Flux_Dev_A_premium_flat_lay_inspired_by_Dior_and_Chanel_beauty_1_ujtnli.jpg"
                  alt="Ovela luxury brand aesthetic"
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                  style={{ boxShadow: '0 0 40px rgba(212, 175, 55, 0.3)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Golden Divider */}
      <div className="w-full flex justify-center py-1" style={{ background: 'linear-gradient(180deg, #1a1a3e 0%, #FFFFFF 100%)' }}>
        <div className="w-32 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)' }} />
      </div>

      {/* Section 4 – WellnessGeni Origins */}
      <section className="w-full py-24" style={{ background: '#FFFFFF' }}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-full max-w-md overflow-hidden rounded-lg group">
                <img
                  src="/lovable-uploads/isabella-appearance-settings.png"
                  alt="Isabella in WellnessGeni App"
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                  style={{ boxShadow: '0 10px 40px rgba(212, 175, 55, 0.2)' }}
                />
              </div>
            </div>
            <div>
              <h2 className="font-playfair text-4xl lg:text-5xl mb-8" style={{ color: '#0A0A23' }}>
                {t('aboutPage.wellnessGeniTitle', 'From WellnessGeni to Ovela')}
              </h2>
              <p className="text-lg leading-relaxed mb-8" style={{ fontFamily: 'Inter, sans-serif', color: '#2a2a2a', fontWeight: 300 }}>
                <Link to="/projects" className="text-[#D4AF37] hover:underline font-medium">Isabella</Link>{' '}
                first appeared in the{' '}
                <a href="https://www.wellnessgeni.com/" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline font-medium">WellnessGeni</a>{' '}
                app, inspiring wellness, motivation, and daily engagement. This experience revealed the immense potential of an AI model who could connect deeply with people, not just showcase products.
              </p>
              <blockquote className="font-playfair text-xl italic pl-6 border-l-2" style={{ color: '#D4AF37', borderColor: '#D4AF37' }}>
                {t('aboutPage.wellnessGeniQuote', '"Isabella started as a guide for wellness and encouragement — and became the world\'s first interactive AI model ambassador."')}
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Golden Divider */}
      <div className="w-full flex justify-center py-1" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #0A0A23 100%)' }}>
        <div className="w-32 h-px" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)' }} />
      </div>

      {/* Section 5 – Shaping Tomorrow */}
      <section className="w-full py-24" style={{ background: 'linear-gradient(180deg, #0A0A23 0%, #1a1a3e 100%)' }}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-playfair text-4xl lg:text-5xl mb-8" style={{ color: '#D4AF37' }}>
              {t('aboutPage.futureTitle', 'Shaping Tomorrow')}
            </h2>
            <p className="text-lg leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF', fontWeight: 300 }}>
              Today, Ovela carries the spirit of{' '}
              <a href="https://www.wellnessgeni.com/" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline font-medium">WellnessGeni</a>{' '}
              into every project.{' '}
              <Link to="/projects" className="text-[#D4AF37] hover:underline font-medium">Isabella</Link>{' '}
              leads the next era of interactive modeling and marketing — transforming campaigns into conversations and engagements that feel real. With Ovela, the future isn't just about watching; it's about experiencing, interacting, and connecting.
            </p>
          </div>
        </div>
      </section>

      <FooterMinimal />

      {/* Floating "Ask Isabella" Button */}
      <a
        href="/?chat=open"
        className="isabella-floating-btn flex items-center gap-2 px-5 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #D4AF37, #B8972E)',
          color: '#0A0A23',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600
        }}
      >
        <MessageCircle className="w-5 h-5" />
        Ask Isabella
      </a>
    </div>
  );
};

export default About;
