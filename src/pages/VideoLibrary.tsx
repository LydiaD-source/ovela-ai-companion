import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { ALL_VIDEOS, VIDEO_LIBRARY_CATEGORIES } from '@/lib/videoLibrary';
import { CATEGORY_META, getCategorySlugByKey } from '@/lib/videoCategoryMeta';


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
        description="Browse 100+ demos of AI digital employees, AI receptionists, and multilingual AI representatives across clinics, real estate, wellness, hospitality, and more."
        schema={itemListSchema}
      />
      <div className="min-h-screen bg-charcoal text-soft-white pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <header className="text-center mb-12">
            <h1 className="font-playfair text-4xl md:text-6xl mb-4 gradient-text">
              AI Digital Employee Video Library
            </h1>
            <p className="text-soft-white/70 max-w-2xl mx-auto">
              {ALL_VIDEOS.length} real demos of AI representatives at work — clinics, real estate,
              wellness, hospitality, luxury retail, and multilingual customer communication.
            </p>
          </header>

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
