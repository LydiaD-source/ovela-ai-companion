import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { getVideosByCategoryKey } from '@/lib/videoLibrary';

interface IndustryPageProps {
  path: string;
  title: string;
  h1: string;
  intro: string;
  description: string;
  features: { title: string; body: string }[];
  videoCategoryKey: string;
}

const IndustryPage: React.FC<IndustryPageProps> = ({
  path, title, h1, intro, description, features, videoCategoryKey,
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const langPrefix = lang === 'en' ? '' : `/${lang}`;
  const videos = getVideosByCategoryKey(videoCategoryKey).slice(0, 3);

  return (
    <>
      <SEO path={path} title={title} description={description} />
      <div className="min-h-screen bg-[hsl(var(--background))] text-soft-white pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <header className="text-center mb-16">
            <h1 className="font-playfair text-4xl md:text-6xl mb-6 gradient-text">{h1}</h1>
            <p className="text-soft-white/80 text-lg max-w-2xl mx-auto leading-relaxed">{intro}</p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {features.map((f) => (
              <article
                key={f.title}
                className="p-6 rounded-xl border border-soft-white/10 bg-soft-white/5"
              >
                <h2 className="font-playfair text-xl mb-3 text-champagne-gold">{f.title}</h2>
                <p className="text-soft-white/70 text-sm leading-relaxed">{f.body}</p>
              </article>
            ))}
          </section>

          {videos.length > 0 && (
            <section className="mb-16">
              <h2 className="font-playfair text-2xl mb-6 text-center">See it in action</h2>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {videos.map((v) => (
                  <li key={v.slug}>
                    <Link
                      to={`${langPrefix}/videos/${v.slug}`}
                      className="group block rounded-lg overflow-hidden border border-soft-white/10 hover:border-champagne-gold/50"
                    >
                      <img src={v.thumbnail} alt={v.title} loading="lazy" className="w-full aspect-video object-cover" />
                      <p className="p-3 text-sm text-soft-white/80 line-clamp-2">{v.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="text-center">
            <Link
              to={`${langPrefix}/contact`}
              className="inline-flex items-center px-8 py-3 rounded-full bg-champagne-gold text-charcoal font-medium hover:scale-105 transition-transform"
            >
              Deploy your AI representative
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default IndustryPage;
