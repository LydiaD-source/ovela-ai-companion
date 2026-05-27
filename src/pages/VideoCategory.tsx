import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowRight, MessageCircle, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getCategoryMetaBySlug } from '@/lib/videoCategoryMeta';
import { getVideosByCategoryKey } from '@/lib/videoLibrary';
import { getCategorySEO } from '@/lib/videoSEOContent';
import { getLocalizedCategory } from '@/lib/localizedSEO';

const VideoCategory: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const langPrefix = lang === 'en' ? '' : `/${lang}`;

  const meta = categorySlug ? getCategoryMetaBySlug(categorySlug) : undefined;
  if (!meta) return <Navigate to={`${langPrefix}/videos`} replace />;

  const videos = getVideosByCategoryKey(meta.key);
  const featured = videos.slice(0, 6);
  const restCount = Math.max(0, videos.length - featured.length);
  const seo = getCategorySEO(meta.key);

  const loc = getLocalizedCategory(meta.slug, lang);
  const seoTitle = loc?.seoTitle || meta.seoTitle;
  const seoDescription = loc?.seoDescription || meta.seoDescription;
  const intro = loc?.intro || meta.intro;
  const longIntro = loc?.longIntro || meta.longIntro;
  const faqs = loc?.faqs?.length ? loc.faqs : seo.faqs;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://www.ovelainteractive.com${langPrefix}/` },
      { '@type': 'ListItem', position: 2, name: 'Video Library', item: `https://www.ovelainteractive.com${langPrefix}/videos` },
      { '@type': 'ListItem', position: 3, name: meta.h1, item: `https://www.ovelainteractive.com${langPrefix}/videos/category/${meta.slug}` },
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: meta.h1,
    numberOfItems: videos.length,
    itemListElement: videos.slice(0, 25).map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://www.ovelainteractive.com${langPrefix}/videos/${v.slug}`,
      name: v.title,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <>
      <SEO
        path={`/videos/category/${meta.slug}`}
        title={seoTitle}
        description={seoDescription}
        schema={[breadcrumbSchema, itemListSchema, faqSchema] as any}
      />
      <div className="min-h-screen bg-charcoal text-soft-white pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Breadcrumb */}
          <nav className="text-xs text-soft-white/50 mb-6" aria-label="Breadcrumb">
            <Link to={`${langPrefix}/`} className="hover:text-champagne-gold">Home</Link>
            <span className="mx-2">/</span>
            <Link to={`${langPrefix}/videos`} className="hover:text-champagne-gold">Videos</Link>
            <span className="mx-2">/</span>
            <span className="text-soft-white/70">{meta.h1}</span>
          </nav>

          {/* Header */}
          <header className="mb-12 max-w-3xl">
            <p className="text-champagne-gold/80 text-xs uppercase tracking-widest mb-4">
              Category · {videos.length} videos
            </p>
            <h1 className="font-playfair text-4xl md:text-6xl mb-5 gradient-text">{meta.h1}</h1>
            <p className="text-soft-white/85 text-lg leading-relaxed">{meta.intro}</p>
          </header>

          {/* Long intro — topical authority */}
          <section className="max-w-3xl mb-16 p-6 rounded-xl border border-soft-white/10 bg-soft-white/[0.03]">
            <p className="text-soft-white/80 text-base leading-relaxed">{meta.longIntro}</p>
          </section>

          {/* Featured clips */}
          {featured.length > 0 && (
            <section className="mb-20" aria-labelledby="featured-heading">
              <h2 id="featured-heading" className="font-playfair text-2xl md:text-3xl mb-6">
                Featured clips
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((v) => (
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
                          <div className="w-12 h-12 rounded-full bg-champagne-gold/90 flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 text-charcoal fill-charcoal" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-soft-white line-clamp-2 group-hover:text-champagne-gold transition-colors">
                          {v.title}
                        </h3>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {restCount > 0 && (
                <div className="mt-8 text-center">
                  <Link
                    to={`${langPrefix}/videos`}
                    className="inline-flex items-center gap-2 text-champagne-gold hover:gap-3 transition-all text-sm"
                  >
                    See all {videos.length} videos in this category
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Related services */}
          <section className="mb-20" aria-labelledby="services-heading">
            <h2 id="services-heading" className="font-playfair text-2xl md:text-3xl mb-6">
              Related services
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {meta.relatedServices.map((s) => (
                <li key={s.href}>
                  <Link
                    to={`${langPrefix}${s.href}`}
                    className="group block p-6 h-full rounded-xl border border-soft-white/10 hover:border-champagne-gold/50 bg-soft-white/[0.03] transition-all"
                  >
                    <h3 className="font-playfair text-lg text-champagne-gold mb-2 group-hover:text-champagne-gold/90">
                      {s.label}
                    </h3>
                    <p className="text-soft-white/70 text-sm leading-relaxed">{s.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Isabella CTA */}
          <section className="mb-20 p-8 md:p-12 rounded-2xl border border-champagne-gold/20 bg-gradient-to-br from-champagne-gold/[0.04] to-transparent text-center">
            <h2 className="font-playfair text-2xl md:text-3xl mb-3 gradient-text">
              Want to see this in your own brand voice?
            </h2>
            <p className="text-soft-white/75 max-w-xl mx-auto mb-6">
              Isabella, our interactive AI host, can walk you through what an AI digital employee
              would look like for your business — live, in any language.
            </p>
            <Link
              to={`${langPrefix}/contact`}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-champagne-gold text-charcoal font-medium hover:scale-105 transition-transform"
            >
              <MessageCircle className="w-4 h-4" />
              Talk to Isabella
            </Link>
          </section>

          {/* FAQ */}
          <section className="max-w-3xl mx-auto" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="font-playfair text-2xl md:text-3xl mb-6">
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible className="border-t border-soft-white/10">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border-b border-soft-white/10"
                >
                  <AccordionTrigger className="text-left text-soft-white hover:text-champagne-gold py-5">
                    {f.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-soft-white/75 text-base leading-relaxed pb-5">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </div>
    </>
  );
};

export default VideoCategory;
