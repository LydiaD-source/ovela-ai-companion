/**
 * Post-build prerender for translated static pages.
 *
 * Why: the app is a client-side React SPA, so /pt/about, /fr/contact, etc.
 * all ship the same English HTML on first paint. Google sees duplicate
 * content across languages and collapses them onto the English canonical
 * ("Alternate page with proper canonical tag" in GSC). This script writes
 * per-language static HTML files into dist/{lang}/{path}/index.html with:
 *   - <html lang="xx">
 *   - localized <title> and <meta name="description">
 *   - self-referencing <link rel="canonical">
 *   - hreflang alternates for all supported languages
 *   - localized og:title / og:description / og:locale / og:url
 *   - a translated <h1> + <p> snippet inside #root so the initial HTML
 *     is genuinely unique per language (replaced on hydration via createRoot)
 *
 * Vercel serves filesystem matches before applying the SPA rewrite, so
 * these files take precedence automatically. No vercel.json change needed.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

const DIST = resolve('dist');
const SRC_HTML = resolve(DIST, 'index.html');
const BASE_URL = 'https://www.ovelainteractive.com';

const LANGS = ['es', 'fr', 'de', 'pt', 'ca'] as const;
const ALL_LANGS = ['en', ...LANGS] as const;
type Lang = typeof LANGS[number];

import { LOCALIZED_PAGES } from '../src/lib/localizedPageSEO';

const LOCALE_MAP: Record<string, string> = {
  en: 'en_US', es: 'es_ES', fr: 'fr_FR', de: 'de_DE', pt: 'pt_BR', ca: 'ca_ES',
};

interface PageContent {
  title: string;
  description: string;
  h1: string;
  intro: string;
}

// Single source of truth — shared with runtime useSEO / SEO component so
// crawlers see the same localized head after hydration as before.
// NOTE: /topics is intentionally excluded — TopicsIndex uses
// singleCanonical → /topics, so we must not emit self-canonical
// prerendered variants for /es/topics, /ca/topics, etc.
const PAGES = LOCALIZED_PAGES.filter((p) => p.path !== '/topics');


function buildUrl(lang: 'en' | Lang, path: string): string {
  const prefix = lang === 'en' ? '' : `/${lang}`;
  return `${BASE_URL}${prefix}${path}`;
}

function escapeHtml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function patchHtml(html: string, lang: 'en' | Lang, path: string, c: PageContent): string {
  const canonical = buildUrl(lang, path);
  const safeTitle = escapeHtml(c.title);
  const safeDesc = escapeHtml(c.description);
  const safeH1 = escapeHtml(c.h1);
  const safeIntro = escapeHtml(c.intro);

  // 1) <html lang>
  let out = html.replace(/<html\s+lang="[^"]*"/i, `<html lang="${lang}"`);

  // 2) <title>
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`);

  // 3) <meta name="description">
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${safeDesc}" />`,
  );

  // 4) og: tags
  out = out.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${safeTitle}" />`);
  out = out.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${safeDesc}" />`);
  out = out.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
  out = out.replace(/<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:locale" content="${LOCALE_MAP[lang]}" />`);

  // 5) twitter: tags
  out = out.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${safeTitle}" />`);
  out = out.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${safeDesc}" />`);

  // 6) canonical + hreflang block — injected just before </head>
  const alternates = ALL_LANGS.map(
    (l) => `    <link rel="alternate" hreflang="${l}" href="${buildUrl(l, path)}" />`,
  ).join('\n');
  const seoBlock = [
    `    <link rel="canonical" href="${canonical}" />`,
    alternates,
    `    <link rel="alternate" hreflang="x-default" href="${buildUrl('en', path)}" />`,
  ].join('\n');
  out = out.replace(/<\/head>/i, `${seoBlock}\n  </head>`);

  // 7) Inject translated content inside #root so crawlers see unique
  //    text per language before React hydrates. createRoot wipes this
  //    on mount — no hydration mismatch warning (we use createRoot,
  //    not hydrateRoot, in src/main.tsx).
  const snippet = `<div data-prerender="${lang}" style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;"><h1>${safeH1}</h1><p>${safeIntro}</p></div>`;
  out = out.replace(/<div id="root">\s*<\/div>/, `<div id="root">${snippet}</div>`);

  return out;
}

function main() {
  if (!existsSync(SRC_HTML)) {
    console.warn(`[prerender] dist/index.html not found — skipping. Run vite build first.`);
    return;
  }
  const baseHtml = readFileSync(SRC_HTML, 'utf-8');
  let count = 0;

  for (const page of PAGES) {
    for (const lang of LANGS) {
      const content = page.byLang[lang];
      if (!content) continue;
      const html = patchHtml(baseHtml, lang, page.path, content);
      const outPath = resolve(DIST, `${lang}${page.path}/index.html`.replace(/^\//, ''));
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, html);
      count++;
    }
  }

  console.log(`[prerender] wrote ${count} localized HTML files`);
}

main();
