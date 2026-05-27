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
import { getTopicHubBySlug, matchVideosForHub } from '@/lib/topicHubsContent';
import { getLocalizedHub } from '@/lib/localizedSEO';

const BASE = 'https://www.ovelainteractive.com';

const TopicHub: React.FC = () => {
  const { hubSlug } = useParams<{ hubSlug: string }>();
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const langPrefix = lang === 'en' ? '' : `/${lang}`;

  const hub = hubSlug ? getTopicHubBySlug(hubSlug) : undefined;
  if (!hub) return <Navigate to={`${langPrefix}/`} replace />;

  // Apply localized overrides when available (ES/FR/DE/PT/CA); fall back to English source.
  const loc = getLocalizedHub(hub.slug, lang);
  const tagline = loc?.tagline || hub.tagline;
  const heroIntro = loc?.heroIntro || hub.heroIntro;
  const seoTitle = loc?.seoTitle || hub.seoTitle;
  const seoDescription = loc?.seoDescription || hub.seoDescription;
  const faqs = loc?.faqs?.length ? loc.faqs : hub.faqs;

  const videos = matchVideosForHub(hub, 9);
  const featured = videos.slice(0, 6);
  const path = `/topics/${hub.slug}`;
  const canonical = `${BASE}${langPrefix}${path}`;

  // ── Schema: BreadcrumbList + FAQPage + Article ───────────────────────
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}${langPrefix}/` },
      { '@type': 'ListItem', position: 2, name: 'Topics', item: `${BASE}${langPrefix}/topics` },
      { '@type': 'ListItem', position: 3, name: hub.h1, item: canonical },
    ],
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

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: hub.h1,
    description: seoDescription,
    inLanguage: lang,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    publisher: {
      '@type': 'Organization',
      name: 'Ovela Interactive',
      url: BASE,
      logo: { '@type': 'ImageObject', url: `${BASE}/images/isabella-hero-native.png` },
    },
    author: { '@type': 'Organization', name: 'Ovela Interactive' },
    articleSection: hub.sections.map((s) => s.heading),
  };

  return (
    <>
      <SEO
        path={path}
        title={seoTitle}
        description={seoDescription}
        ogType="article"
        schema={[breadcrumbSchema, faqSchema, articleSchema] as any}
      />

      <div className="min-h-screen bg-charcoal text-soft-white pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Breadcrumb */}
          <nav className="text-xs text-soft-white/50 mb-6" aria-label="Breadcrumb">
            <Link to={`${langPrefix}/`} className="hover:text-champagne-gold">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-soft-white/70">{hub.h1}</span>
          </nav>

          {/* Hero */}
          <header className="mb-14">
            <p className="text-champagne-gold/80 text-xs uppercase tracking-widest mb-4">
              Topic hub
            </p>
            <h1 className="font-playfair text-4xl md:text-6xl mb-5 gradient-text">{hub.h1}</h1>
            <p className="text-soft-white/85 text-lg md:text-xl italic mb-6">{tagline}</p>
            <p className="text-soft-white/80 text-base md:text-lg leading-relaxed max-w-3xl">
              {heroIntro}
            </p>
          </header>

          {/* Long-form sections */}
          <article className="space-y-12 mb-20">
            {hub.sections.map((s, i) => (
              <section key={i}>
                <h2 className="font-playfair text-2xl md:text-3xl mb-4 text-champagne-gold">
                  {s.heading}
                </h2>
                <p className="text-soft-white/80 text-base md:text-lg leading-relaxed">
                  {s.body}
                </p>
              </section>
            ))}
          </article>

          {/* Sub-segments */}
          {hub.subSegments.length > 0 && (
            <section className="mb-20" aria-labelledby="subseg-heading">
              <h2 id="subseg-heading" className="font-playfair text-2xl md:text-3xl mb-6">
                Where this applies
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {hub.subSegments.map((s) => (
                  <li
                    key={s.title}
                    className="p-6 rounded-xl border border-soft-white/10 bg-soft-white/[0.03]"
                  >
                    <h3 className="font-playfair text-lg text-champagne-gold mb-2">
                      {s.title}
                    </h3>
                    <p className="text-soft-white/75 text-sm leading-relaxed">{s.body}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Featured videos */}
          {featured.length > 0 && (
            <section className="mb-20" aria-labelledby="videos-heading">
              <h2 id="videos-heading" className="font-playfair text-2xl md:text-3xl mb-6">
                See it in action
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
              <div className="mt-8 text-center">
                <Link
                  to={`${langPrefix}/videos`}
                  className="inline-flex items-center gap-2 text-champagne-gold hover:gap-3 transition-all text-sm"
                >
                  Browse the full video library
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>
          )}

          {/* Related services */}
          <section className="mb-20" aria-labelledby="services-heading">
            <h2 id="services-heading" className="font-playfair text-2xl md:text-3xl mb-6">
              Related services
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {hub.relatedServices.map((s) => (
                <li key={s.href}>
                  <Link
                    to={`${langPrefix}${s.href}`}
                    className="group block p-6 h-full rounded-xl border border-soft-white/10 hover:border-champagne-gold/50 bg-soft-white/[0.03] transition-all"
                  >
                    <h3 className="font-playfair text-lg text-champagne-gold mb-2">{s.label}</h3>
                    <p className="text-soft-white/70 text-sm leading-relaxed">{s.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Isabella CTA */}
          <section className="mb-20 p-8 md:p-12 rounded-2xl border border-champagne-gold/20 bg-gradient-to-br from-champagne-gold/[0.04] to-transparent text-center">
            <h2 className="font-playfair text-2xl md:text-3xl mb-3 gradient-text">
              See what this looks like for your business
            </h2>
            <p className="text-soft-white/75 max-w-xl mx-auto mb-6">
              Isabella, our interactive AI host, can walk you through what an AI digital employee
              would look like for your business — live, in any language, right now.
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
          <section className="max-w-3xl mx-auto mb-16" aria-labelledby="faq-heading">
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

          {/* Related hubs */}
          {hub.relatedHubs.length > 0 && (
            <section aria-labelledby="related-hubs-heading">
              <h2 id="related-hubs-heading" className="font-playfair text-xl mb-4 text-soft-white/80">
                Continue exploring
              </h2>
              <ul className="flex flex-wrap gap-3">
                {hub.relatedHubs.map((r) => (
                  <li key={r.slug}>
                    <Link
                      to={`${langPrefix}/topics/${r.slug}`}
                      className="inline-block px-4 py-2 rounded-full border border-soft-white/15 hover:border-champagne-gold/60 text-sm text-soft-white/80 hover:text-champagne-gold transition-all"
                    >
                      {r.label}
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

export default TopicHub;
