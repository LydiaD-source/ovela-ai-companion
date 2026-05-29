import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { ALL_VIDEOS, VIDEO_LIBRARY_CATEGORIES } from '@/lib/videoLibrary';
import { CATEGORY_META, getCategorySlugByKey } from '@/lib/videoCategoryMeta';
import { TOPIC_HUBS } from '@/lib/topicHubsContent';


const VideoLibrary: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const langPrefix = lang === 'en' ? '' : `/${lang}`;
  const [filter, setFilter] = useState<string>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? ALL_VIDEOS : ALL_VIDEOS.filter((v) => v.category === filter)),
    [filter],
  );

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Ovela Interactive — AI Digital Employee Video Library',
    numberOfItems: ALL_VIDEOS.length,
    itemListElement: ALL_VIDEOS.slice(0, 50).map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://www.ovelainteractive.com${langPrefix}/videos/${v.slug}`,
      name: v.title,
    })),
  };

  return (
    <>
      <SEO
        path="/videos"
        title="AI Digital Employee Video Library | Ovela Interactive"
        description="Hundreds of real demos of AI digital employees, AI receptionists, and multilingual AI representatives across clinics, real estate, wellness, hospitality, and more — updated weekly."
        schema={itemListSchema}
      />
      <div className="min-h-screen bg-charcoal text-soft-white pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <header className="text-center mb-12">
            <h1 className="font-playfair text-4xl md:text-6xl mb-4 gradient-text">
              AI Digital Employee Video Library
            </h1>
            <p className="text-soft-white/70 max-w-2xl mx-auto">
              Hundreds of real demos of AI representatives at work — clinics, real estate,
              wellness, hospitality, luxury retail, and multilingual customer communication.
              New demos added every week.
            </p>
          </header>

          {/* Category hubs — topical authority links (also crawlable for SEO) */}
          <section className="mb-12" aria-labelledby="hubs-heading">
            <h2 id="hubs-heading" className="text-center text-soft-white/60 text-xs uppercase tracking-widest mb-4">
              Browse by topic
            </h2>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {CATEGORY_META.map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`${langPrefix}/videos/category/${c.slug}`}
                    className="block text-center px-4 py-3 rounded-lg border border-soft-white/10 hover:border-champagne-gold/50 bg-soft-white/[0.03] text-soft-white/80 hover:text-champagne-gold text-sm transition-all"
                  >
                    {VIDEO_LIBRARY_CATEGORIES.find((v) => v.key === c.key)?.label || c.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Topic hubs — Tier 3 authority pages */}
          <section className="mb-12" aria-labelledby="topics-heading">
            <h2 id="topics-heading" className="text-center text-soft-white/60 text-xs uppercase tracking-widest mb-4">
              Authority topics
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {TOPIC_HUBS.map((h) => (
                <li key={h.slug}>
                  <Link
                    to={`${langPrefix}/topics/${h.slug}`}
                    className="block text-center px-4 py-3 rounded-lg border border-champagne-gold/20 hover:border-champagne-gold/60 bg-champagne-gold/[0.04] text-soft-white/85 hover:text-champagne-gold text-sm transition-all"
                  >
                    {h.h1.split(' — ')[0]}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Filter pills */}
          <nav className="flex flex-wrap gap-2 justify-center mb-12" aria-label="Industry filter">

            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                filter === 'all'
                  ? 'bg-champagne-gold text-charcoal border-champagne-gold'
                  : 'border-soft-white/20 text-soft-white/80 hover:border-champagne-gold/50'
              }`}
            >
              All ({ALL_VIDEOS.length})
            </button>
            {VIDEO_LIBRARY_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`px-4 py-2 rounded-full text-sm border transition-all ${
                  filter === cat.key
                    ? 'bg-champagne-gold text-charcoal border-champagne-gold'
                    : 'border-soft-white/20 text-soft-white/80 hover:border-champagne-gold/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>

          {/* Video grid */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((v) => (
              <li key={v.slug}>
                <Link
                  to={`${langPrefix}/videos/${v.slug}`}
                  className="group block rounded-xl overflow-hidden border border-soft-white/10 hover:border-champagne-gold/50 transition-all bg-soft-white/5"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                      <div className="w-14 h-14 rounded-full bg-champagne-gold/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-charcoal fill-charcoal" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="font-medium text-soft-white line-clamp-2 group-hover:text-champagne-gold transition-colors">
                      {v.title}
                    </h2>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default VideoLibrary;
