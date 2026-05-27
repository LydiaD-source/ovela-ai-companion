import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Calendar, Eye, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { getVideoBySlug, getRelatedVideos, VIDEO_LIBRARY_CATEGORIES } from '@/lib/videoLibrary';
import { getCategorySEO, buildTopicsSentence } from '@/lib/videoSEOContent';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';


function formatDuration(sec: number): string {
  if (!sec) return '';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

const VideoDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const langPrefix = lang === 'en' ? '' : `/${lang}`;

  const video = slug ? getVideoBySlug(slug) : undefined;
  if (!video) return <Navigate to={`${langPrefix}/videos`} replace />;

  const related = getRelatedVideos(video.slug, 4);
  const categoryLabel =
    VIDEO_LIBRARY_CATEGORIES.find((c) => c.key === video.category)?.label || 'AI Demos';

  const shortDesc = video.description.split('\n')[0].slice(0, 160);

  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: [video.thumbnail],
    uploadDate: video.publishedAt,
    duration: video.duration,
    contentUrl: video.watchUrl,
    embedUrl: video.embedUrl,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'WatchAction' },
      userInteractionCount: video.viewCount,
    },
    keywords: video.tags.join(', '),
    publisher: {
      '@type': 'Organization',
      name: 'Ovela Interactive',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.ovelainteractive.com/favicon.png',
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://www.ovelainteractive.com${langPrefix}/` },
      { '@type': 'ListItem', position: 2, name: 'Video Library', item: `https://www.ovelainteractive.com${langPrefix}/videos` },
      { '@type': 'ListItem', position: 3, name: video.title, item: `https://www.ovelainteractive.com${langPrefix}/videos/${video.slug}` },
    ],
  };

  return (
    <>
      <SEO
        path={`/videos/${video.slug}`}
        title={`${video.title} — AI ${categoryLabel} Demo | Ovela Interactive`}
        description={shortDesc}
        ogImage={video.thumbnail}
        ogType="video.other"
        schema={[videoSchema, breadcrumbSchema] as any}
      />
      <div className="min-h-screen bg-charcoal text-soft-white pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Breadcrumb */}
          <nav className="text-xs text-soft-white/50 mb-4" aria-label="Breadcrumb">
            <Link to={`${langPrefix}/`} className="hover:text-champagne-gold">Home</Link>
            <span className="mx-2">/</span>
            <Link to={`${langPrefix}/videos`} className="hover:text-champagne-gold">Videos</Link>
            <span className="mx-2">/</span>
            <span className="text-soft-white/70">{categoryLabel}</span>
          </nav>

          <Link
            to={`${langPrefix}/videos`}
            className="inline-flex items-center gap-2 text-soft-white/70 hover:text-champagne-gold mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to library
          </Link>

          <article>
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-soft-white/10 mb-8 bg-black">
              <iframe
                src={`${video.embedUrl}?rel=0&modestbranding=1`}
                title={video.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                style={{ border: 'none' }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs bg-champagne-gold/10 text-champagne-gold border border-champagne-gold/30">
                {categoryLabel}
              </span>
              {video.tags.slice(0, 4).map((t) => (
                <span key={t} className="px-2 py-1 rounded-full text-xs bg-soft-white/5 text-soft-white/60 border border-soft-white/10">
                  #{t}
                </span>
              ))}
            </div>

            <h1 className="font-playfair text-3xl md:text-5xl mb-4 gradient-text">{video.title}</h1>

            <div className="flex flex-wrap gap-5 text-xs text-soft-white/60 mb-6">
              {video.publishedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(video.publishedAt).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              {video.durationSeconds > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(video.durationSeconds)}
                </span>
              )}
              {video.viewCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  {video.viewCount.toLocaleString()} views
                </span>
              )}
            </div>

            <div className="prose prose-invert max-w-3xl mb-8">
              {video.description.split('\n').filter(Boolean).map((para, i) => (
                <p key={i} className="text-soft-white/80 text-base leading-relaxed mb-4 whitespace-pre-wrap">
                  {para}
                </p>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`${langPrefix}/contact`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-champagne-gold text-charcoal font-medium hover:scale-105 transition-transform"
              >
                <MessageCircle className="w-4 h-4" />
                Talk to Isabella about this
              </Link>
              <a
                href={video.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-soft-white/20 text-soft-white hover:border-champagne-gold/50"
              >
                Watch on YouTube
              </a>
            </div>
          </article>

          {related.length > 0 && (
            <section className="mt-20">
              <h2 className="font-playfair text-2xl mb-6">Related demos</h2>
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      to={`${langPrefix}/videos/${r.slug}`}
                      className="group block rounded-lg overflow-hidden border border-soft-white/10 hover:border-champagne-gold/50"
                    >
                      <img
                        src={r.thumbnail}
                        alt={r.title}
                        loading="lazy"
                        className="w-full aspect-video object-cover"
                      />
                      <p className="p-2 text-xs text-soft-white/80 line-clamp-2">{r.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default VideoDetail;
