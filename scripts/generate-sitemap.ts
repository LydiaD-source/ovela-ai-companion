// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Generates per-language sitemap with hreflang cross-links + video sitemap.

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { VIDEO_CATEGORIES } from '../src/config/videoCatalog';

// Optional rich metadata from YouTube fetch
interface YTMeta { id: string; title: string; description: string; publishedAt: string; thumbnail: string; duration: string; }
const ytPath = resolve('src/data/youtube-videos.json');
const ytMeta: Record<string, YTMeta> = {};
if (existsSync(ytPath)) {
  for (const v of JSON.parse(readFileSync(ytPath, 'utf-8')) as YTMeta[]) ytMeta[v.id] = v;
}
function isoToSec(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0)) : 0;
}

const BASE_URL = 'https://www.ovelainteractive.com';
const LANGS = ['en', 'es', 'fr', 'de', 'pt', 'ca'] as const;
const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_PATHS = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/ecosystem', changefreq: 'monthly', priority: '0.8' },
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
  // Video category hubs
  { path: '/videos/category/interactive-marketing', changefreq: 'weekly', priority: '0.8' },
  { path: '/videos/category/wellness-spa', changefreq: 'weekly', priority: '0.8' },
  { path: '/videos/category/real-estate', changefreq: 'weekly', priority: '0.8' },
  { path: '/videos/category/ai-ambassador', changefreq: 'weekly', priority: '0.8' },
  { path: '/videos/category/studio-overview', changefreq: 'weekly', priority: '0.7' },
  // Topic hubs (Tier 3 authority pages)
  { path: '/topics', changefreq: 'weekly', priority: '0.8' },
  { path: '/topics/ai-receptionist', changefreq: 'weekly', priority: '0.9' },
  { path: '/topics/executive-burnout-recovery', changefreq: 'weekly', priority: '0.9' },
  { path: '/topics/ai-property-presenter', changefreq: 'weekly', priority: '0.9' },
  { path: '/topics/ai-patient-communication', changefreq: 'weekly', priority: '0.9' },
  { path: '/topics/ai-digital-employees', changefreq: 'weekly', priority: '0.95' },
  { path: '/topics/ai-clinic-receptionist', changefreq: 'weekly', priority: '0.9' },
  { path: '/topics/after-hours-lead-capture', changefreq: 'weekly', priority: '0.9' },
  { path: '/topics/multilingual-customer-communication', changefreq: 'weekly', priority: '0.9' },
  { path: '/topics/ai-for-wellness-clinics', changefreq: 'weekly', priority: '0.9' },
  { path: '/topics/digital-concierge-hotels-spa', changefreq: 'weekly', priority: '0.9' },
  { path: '/topics/executive-wellness-programs', changefreq: 'weekly', priority: '0.85' },
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

// Use full YouTube catalog if available, else fall back to curated categories
const seen = new Set<string>();
const ytIds = Object.keys(ytMeta);
const VIDEOS = ytIds.length
  ? ytIds.map((id) => {
      const m = ytMeta[id];
      return { id, title: m.title, slug: slugify(m.title, id) };
    })
  : VIDEO_CATEGORIES.flatMap((c) =>
      c.videos
        .filter((v) => (seen.has(v.id) ? false : (seen.add(v.id), true)))
        .map((v) => ({ id: v.id, title: v.title, slug: slugify(v.title, v.id) })),
    );

function makeUrlsetXml(): string {
  const videoEntries = VIDEOS.map((v) => ({
    path: `/videos/${v.slug}`,
    changefreq: 'monthly',
    priority: '0.6',
    englishOnly: true, // content is not translated per language
  }));
  const allPaths: Array<{ path: string; changefreq: string; priority: string; englishOnly?: boolean }> = [
    ...STATIC_PATHS,
    ...videoEntries,
  ];

  const urls = allPaths.flatMap((entry) => {
    const langs = entry.englishOnly ? (['en'] as const) : LANGS;
    return langs.map((lang) => {
      const loc = buildUrl(lang, entry.path);
      const alternates = entry.englishOnly
        ? ''
        : LANGS.map(
            (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${buildUrl(l, entry.path)}" />`,
          ).join('\n');
      const xDefault = entry.englishOnly
        ? ''
        : `    <xhtml:link rel="alternate" hreflang="x-default" href="${buildUrl('en', entry.path)}" />`;
      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${TODAY}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        alternates,
        xDefault,
        '  </url>',
      ].filter(Boolean).join('\n');
    });
  });

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
    const meta = ytMeta[v.id];
    const safe = (s: string) => s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c] as string));
    const desc = meta?.description?.trim() || `${v.title} — Ovela Interactive AI digital employee demo.`;
    const thumb = meta?.thumbnail || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
    const pubDate = meta?.publishedAt ? `\n      <video:publication_date>${meta.publishedAt}</video:publication_date>` : '';
    const duration = meta?.duration ? `\n      <video:duration>${isoToSec(meta.duration)}</video:duration>` : '';
    return [
      '  <url>',
      `    <loc>${pageUrl}</loc>`,
      '    <video:video>',
      `      <video:thumbnail_loc>${thumb}</video:thumbnail_loc>`,
      `      <video:title>${safe(v.title)}</video:title>`,
      `      <video:description>${safe(desc.slice(0, 2048))}</video:description>`,
      `      <video:player_loc allow_embed="yes">https://www.youtube-nocookie.com/embed/${v.id}</video:player_loc>${pubDate}${duration}`,
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
