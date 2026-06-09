import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO';
import { TOPIC_HUBS } from '@/lib/topicHubsContent';

const BASE = 'https://www.ovelainteractive.com';

const TopicsIndex: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const langPrefix = lang === 'en' ? '' : `/${lang}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}${langPrefix}/` },
      { '@type': 'ListItem', position: 2, name: 'Topics', item: `${BASE}${langPrefix}/topics` },
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: TOPIC_HUBS.map((h, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE}${langPrefix}/topics/${h.slug}`,
      name: h.h1,
    })),
  };

  return (
    <>
      <SEO
        path="/topics"
        title="AI Topic Hubs — Receptionist, Wellness, Real Estate & More | Ovela Interactive"
        description="Explore in-depth topic guides on AI receptionists, multilingual customer communication, executive wellness, AI property presenters, and digital employees."
        ogType="website"
        schema={[breadcrumbSchema, itemListSchema] as any}
      />
      <div className="min-h-screen bg-charcoal text-soft-white pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <nav className="text-xs text-soft-white/50 mb-6" aria-label="Breadcrumb">
            <Link to={`${langPrefix}/`} className="hover:text-champagne-gold">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-soft-white/70">Topics</span>
          </nav>

          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#E8CFA9' }}>
              Authority Topics
            </h1>
            <p className="text-lg text-soft-white/70 max-w-3xl">
              Deep guides on how Ovela Interactive deploys AI digital employees across receptionists, wellness, hospitality and real estate. Pick a topic to dive in.
            </p>
          </header>

          <ul className="grid md:grid-cols-2 gap-6">
            {TOPIC_HUBS.map((hub) => (
              <li key={hub.slug}>
                <Link
                  to={`${langPrefix}/topics/${hub.slug}`}
                  className="block p-6 rounded-xl border border-champagne-gold/20 bg-black/40 hover:bg-black/60 transition-colors group"
                >
                  <h2 className="text-xl font-semibold mb-2 text-champagne-gold group-hover:text-champagne-gold/90">
                    {hub.h1}
                  </h2>
                  <p className="text-sm text-soft-white/70 mb-4 line-clamp-3">{hub.heroIntro}</p>
                  <span className="inline-flex items-center text-xs text-champagne-gold uppercase tracking-widest">
                    Read guide <ArrowRight className="ml-2 h-3 w-3" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default TopicsIndex;
