import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { getVideoBySlug, getRelatedVideos } from '@/lib/videoLibrary';

const VideoDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const langPrefix = lang === 'en' ? '' : `/${lang}`;

  const video = slug ? getVideoBySlug(slug) : undefined;
  if (!video) return <Navigate to={`${langPrefix}/videos`} replace />;

  const related = getRelatedVideos(video.slug, 4);

  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: [video.thumbnail],
    uploadDate: '2025-01-01',
    contentUrl: video.watchUrl,
    embedUrl: video.embedUrl,
    publisher: {
      '@type': 'Organization',
      name: 'Ovela Interactive',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.ovelainteractive.com/favicon.png',
      },
    },
  };

  return (
    <>
      <SEO
        path={`/videos/${video.slug}`}
        title={`${video.title} | Ovela Interactive`}
        description={video.description}
        ogImage={video.thumbnail}
        ogType="video.other"
        schema={videoSchema}
      />
      <div className="min-h-screen bg-[hsl(var(--background))] text-soft-white pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
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

            <h1 className="font-playfair text-3xl md:text-5xl mb-4 gradient-text">{video.title}</h1>
            <p className="text-soft-white/80 text-lg leading-relaxed mb-8 max-w-3xl">
              {video.description}
            </p>

            <Link
              to={`${langPrefix}/contact`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-champagne-gold text-charcoal font-medium hover:scale-105 transition-transform"
            >
              <MessageCircle className="w-4 h-4" />
              Talk to Isabella about this
            </Link>
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
