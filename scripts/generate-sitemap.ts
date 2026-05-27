// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Generates per-language sitemap with hreflang cross-links + video sitemap.

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { VIDEO_CATEGORIES } from '../src/config/videoCatalog';

const BASE_URL = 'https://www.ovelainteractive.com';
const LANGS = ['en', 'es', 'fr', 'de', 'pt', 'ca'] as const;
const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_PATHS = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/projects', changefreq: 'weekly', priority: '0.9' },
  { path: '/partner', changefreq: 'monthly', priority: '0.8' },
  { path: '/pricing', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/interactive', changefreq: 'weekly', priority: '0.9' },
  { path: '/wellnessgeni', changefreq: 'monthly', priority: '0.6' },
  { path: '/videos', changefreq: 'weekly', priority: '0.9' },
  { path: '/industries/clinics', changefreq: 'monthly', priority: '0.8' },
  { path: '/industries/real-estate', changefreq: 'monthly', priority: '0.8' },
  { path: '/industries/wellness', changefreq: 'monthly', priority: '0.8' },
];

function slugify(title: string, id: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  return `${base}-${id}`.replace(/^-/, '');
}

function buildUrl(lang: string, path: string): string {
  const prefix = lang === 'en' ? '' : `/${lang}`;
  const cleanPath = path === '/' ? '' : path;
  return `${BASE_URL}${prefix}${cleanPath || (prefix ? '' : '/')}`;
}

// De-dup videos across categories
const seen = new Set<string>();
const VIDEOS = VIDEO_CATEGORIES.flatMap((c) =>
  c.videos
    .filter((v) => (seen.has(v.id) ? false : (seen.add(v.id), true)))
    .map((v) => ({ id: v.id, title: v.title, slug: slugify(v.title, v.id) })),
);

function makeUrlsetXml(): string {
  const allPaths = [
    ...STATIC_PATHS,
    ...VIDEOS.map((v) => ({ path: `/videos/${v.slug}`, changefreq: 'monthly', priority: '0.6' })),
  ];

  const urls = allPaths.flatMap((entry) =>
    LANGS.map((lang) => {
      const loc = buildUrl(lang, entry.path);
      const alternates = LANGS.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${buildUrl(l, entry.path)}" />`,
      ).join('\n');
      const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${buildUrl('en', entry.path)}" />`;
      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${TODAY}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        alternates,
        xDefault,
        '  </url>',
      ].join('\n');
    }),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
  ].join('\n');
}

function makeVideoSitemapXml(): string {
  const urls = VIDEOS.map((v) => {
    const pageUrl = buildUrl('en', `/videos/${v.slug}`);
    const safeTitle = v.title.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c] as string));
    return [
      '  <url>',
      `    <loc>${pageUrl}</loc>`,
      '    <video:video>',
      `      <video:thumbnail_loc>https://i.ytimg.com/vi/${v.id}/hqdefault.jpg</video:thumbnail_loc>`,
      `      <video:title>${safeTitle}</video:title>`,
      `      <video:description>${safeTitle} — Ovela Interactive AI digital employee demo.</video:description>`,
      `      <video:player_loc allow_embed="yes">https://www.youtube-nocookie.com/embed/${v.id}</video:player_loc>`,
      `      <video:family_friendly>yes</video:family_friendly>`,
      '    </video:video>',
      '  </url>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">',
    ...urls,
    '</urlset>',
  ].join('\n');
}

const outMain = resolve('public/sitemap.xml');
const outVideo = resolve('public/video-sitemap.xml');
mkdirSync(dirname(outMain), { recursive: true });
writeFileSync(outMain, makeUrlsetXml());
writeFileSync(outVideo, makeVideoSitemapXml());

console.log(`sitemap.xml written (${(STATIC_PATHS.length + VIDEOS.length) * LANGS.length} URLs)`);
console.log(`video-sitemap.xml written (${VIDEOS.length} videos)`);
