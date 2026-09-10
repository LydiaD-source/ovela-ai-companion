/**
 * Second prerender pass — covers the routes that scripts/prerender-localized.ts
 * does not: topic hubs, video category hubs, the video library, the topics
 * index and video detail pages.
 *
 * Why: those routes ship the raw SPA shell, so the first HTML Google reads
 * carries the generic homepage <title> and no canonical at all. Google then
 * picks a canonical of its own — exactly the "Duplicate, Google chose
 * different canonical than user" rows in Search Console (e.g. /ca/videos
 * collapsed onto a video detail page).
 *
 * Two kinds of pages are written:
 *   1. Translated pages (topic hubs, video categories) — localized title and
 *      description from src/data/localized-seo.json, self-referencing
 *      canonical plus hreflang alternates.
 *   2. Untranslated pages (video library, topics index, video detail,
 *      wellnessgeni) — every language variant carries the English canonical
 *      and no hreflang, matching the singleCanonical behaviour of the runtime
 *      SEO component so signals consolidate on one URL.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { CATEGORY_META } from '../src/lib/videoCategoryMeta';

const DIST = resolve('dist');
const SRC_HTML = resolve(DIST, 'index.html');
const BASE_URL = 'https://www.ovelainteractive.com';

const LANGS = ['es', 'fr', 'de', 'pt', 'ca'] as const;
const ALL_LANGS = ['en', ...LANGS] as const;
type Lang = typeof ALL_LANGS[number];

const LOCALE_MAP: Record<string, string> = {
  en: 'en_US', es: 'es_ES', fr: 'fr_FR', de: 'de_DE', pt: 'pt_BR', ca: 'ca_ES',
};

interface LocalizedSeoFile {
  hubs: Record<string, Record<string, { seoTitle: string; seoDescription: string; tagline?: string; heroIntro?: string }>>;
  categories: Record<string, Record<string, { seoTitle: string; seoDescription: string; intro?: string }>>;
}

const localizedPath = resolve('src/data/localized-seo.json');
const localized: LocalizedSeoFile = existsSync(localizedPath)
  ? JSON.parse(readFileSync(localizedPath, 'utf-8'))
  : { hubs: {}, categories: {} };

// ---------------------------------------------------------------- video data

interface YTMeta { id: string; title: string; description: string }
const ytPath = resolve('src/data/youtube-videos.json');
const ytVideos: YTMeta[] = existsSync(ytPath) ? JSON.parse(readFileSync(ytPath, 'utf-8')) : [];

function slugify(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `${base}-${id}`.replace(/^-/, '');
}

// ------------------------------------------------------------------- helpers

function buildUrl(lang: Lang, path: string): string {
  const prefix = lang === 'en' ? '' : `/${lang}`;
  return `${BASE_URL}${prefix}${path}`;
}

function escapeHtml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

interface PageJob {
  path: string;
  lang: Lang;
  title: string;
  description: string;
  h1: string;
  intro: string;
  /** canonical target: 'self' → this URL, 'en' → the English URL */
  canonical: 'self' | 'en';
  ogType?: string;
}

function patchHtml(html: string, job: PageJob): string {
  const canonicalUrl = job.canonical === 'en' ? buildUrl('en', job.path) : buildUrl(job.lang, job.path);
  const title = escapeHtml(job.title);
  const desc = escapeHtml(job.description);

  let out = html.replace(/<html\s+lang="[^"]*"/i, `<html lang="${job.lang}"`);
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${desc}" />`,
  );
  out = out.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
  out = out.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${desc}" />`);
  out = out.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  out = out.replace(/<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:locale" content="${LOCALE_MAP[job.lang]}" />`);
  if (job.ogType) {
    out = out.replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${job.ogType}" />`);
  }
  out = out.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
  out = out.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${desc}" />`);

  const head: string[] = [`    <link rel="canonical" href="${canonicalUrl}" />`];
  if (job.canonical === 'self') {
    for (const l of ALL_LANGS) {
      head.push(`    <link rel="alternate" hreflang="${l}" href="${buildUrl(l, job.path)}" />`);
    }
    head.push(`    <link rel="alternate" hreflang="x-default" href="${buildUrl('en', job.path)}" />`);
  }
  out = out.replace(/<\/head>/i, `${head.join('\n')}\n  </head>`);

  const snippet = `<div data-prerender="${job.lang}" style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;"><h1>${escapeHtml(job.h1)}</h1><p>${escapeHtml(job.intro)}</p></div>`;
  out = out.replace(/<div id="root">\s*<\/div>/, `<div id="root">${snippet}</div>`);

  return out;
}

// --------------------------------------------------------------- page builder

function buildJobs(): PageJob[] {
  const jobs: PageJob[] = [];

  // 1) Topic hubs — genuinely translated → self canonical + hreflang.
  for (const [slug, byLang] of Object.entries(localized.hubs || {})) {
    for (const lang of LANGS) {
      const c = byLang[lang];
      if (!c?.seoTitle || !c?.seoDescription) continue;
      jobs.push({
        path: `/topics/${slug}`,
        lang,
        title: c.seoTitle,
        description: c.seoDescription,
        h1: c.tagline || c.seoTitle,
        intro: c.heroIntro || c.seoDescription,
        canonical: 'self',
        ogType: 'article',
      });
    }
  }

  // 2) Video category hubs — translated copy exists → self canonical + hreflang.
  for (const meta of CATEGORY_META) {
    for (const lang of LANGS) {
      const c = localized.categories?.[meta.slug]?.[lang];
      if (!c?.seoTitle || !c?.seoDescription) continue;
      jobs.push({
        path: `/videos/category/${meta.slug}`,
        lang,
        title: c.seoTitle,
        description: c.seoDescription,
        h1: c.seoTitle,
        intro: c.intro || c.seoDescription,
        canonical: 'self',
      });
    }
  }

  // 3) Untranslated pages — English canonical for every language variant.
  const englishOnly: Array<{ path: string; title: string; description: string; h1: string; intro: string; ogType?: string }> = [
    {
      path: '/videos',
      title: 'AI Digital Employee Video Library | Ovela Interactive',
      description:
        'Hundreds of real demos of AI digital employees, AI receptionists, and multilingual AI representatives across clinics, real estate, wellness, hospitality, and more — updated weekly.',
      h1: 'AI Digital Employee Video Library',
      intro:
        'Browse real demonstrations of AI digital employees at work across clinics, real estate, wellness, hospitality, and luxury retail.',
    },
    {
      path: '/topics',
      title: 'AI Topic Hubs — Receptionist, Wellness, Real Estate & More | Ovela Interactive',
      description:
        'Explore in-depth topic guides on AI receptionists, multilingual customer communication, executive wellness, AI property presenters, and digital employees.',
      h1: 'AI Topic Hubs',
      intro:
        'In-depth guides on AI receptionists, multilingual customer communication, AI property presenters, and digital employees.',
    },
  ];

  for (const page of englishOnly) {
    for (const lang of ALL_LANGS) {
      jobs.push({ ...page, lang, canonical: 'en' });
    }
  }

  // 4) Video detail pages — one shared English canonical per video.
  for (const v of ytVideos) {
    if (!v?.id || !v?.title) continue;
    const slug = slugify(v.title, v.id);
    const firstLine = (v.description || '').split('\n')[0].trim();
    const description = (firstLine || `${v.title} — an Ovela Interactive AI digital employee demo.`).slice(0, 160);
    for (const lang of ALL_LANGS) {
      jobs.push({
        path: `/videos/${slug}`,
        lang,
        title: `${v.title} | Ovela Interactive`,
        description,
        h1: v.title,
        intro: description,
        canonical: 'en',
        ogType: 'video.other',
      });
    }
  }

  return jobs;
}

function main() {
  if (!existsSync(SRC_HTML)) {
    console.warn('[prerender-static] dist/index.html not found — skipping. Run vite build first.');
    return;
  }
  const baseHtml = readFileSync(SRC_HTML, 'utf-8');
  const jobs = buildJobs();
  let count = 0;

  for (const job of jobs) {
    const rel = `${job.lang === 'en' ? '' : `${job.lang}/`}${job.path.replace(/^\//, '')}/index.html`;
    const outPath = resolve(DIST, rel);
    // Never overwrite a file written by the localized prerender pass.
    if (existsSync(outPath)) continue;
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, patchHtml(baseHtml, job));
    count++;
  }

  console.log(`[prerender-static] wrote ${count} HTML files`);
}

main();
