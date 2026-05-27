Goal: replicate the wellnespirit SEO architecture on ovelainteractive.com, then go one step further by turning the existing YouTube catalog (≈150 videos) into an indexable, interactive Video Library. No long-form text blog. Cinematic UX preserved.

---

## 1. Per-language URLs (the single biggest unlock)

Today: 8 routes × 1 URL each, all languages share the same URL → only English ranks.

Change to:
- `/` = English (canonical, no prefix)
- `/fr`, `/de`, `/es`, `/ca`, `/pt` = same pages, language-prefixed
- LanguageSwitcher navigates (`navigate('/fr/about')`) instead of just calling `i18n.changeLanguage`
- i18n init reads the URL segment first, falls back to localStorage/browser
- A `<LanguageRoute>` wrapper sets `i18n.changeLanguage(lang)` on mount for prefixed routes

Result: 6 languages × 8 pages = **48 indexable URLs** (vs 8 today). French/Spanish/Catalan/Portuguese/German can finally rank in their own Google markets.

## 2. Per-route SEO with react-helmet-async

Replace the current `useSEO` DOM-mutation hook with `react-helmet-async`:
- `<HelmetProvider>` wraps the app in `main.tsx`
- Each page renders `<SEO title="…" description="…" path="/about" lang={currentLang} />`
- SEO component emits: `<title>`, meta description, canonical (per-language URL), `og:*`, `twitter:*`, and **hreflang alternates pointing at the actual per-language URLs** (the current setup points all hreflangs at the same URL, which is invalid and one reason FR/ES aren't indexed)
- Remove the conflicting static canonical / OG block from `index.html` (keep only brand defaults for social crawlers on `/`)

## 3. Sitemap rebuild

Replace hand-edited `public/sitemap.xml` with `scripts/generate-sitemap.ts` (predev/prebuild hooks):
- Emits 8 pages × 6 languages = **48 URLs** + video library entries
- Full `<xhtml:link rel="alternate" hreflang="…">` cross-links per URL
- Auto-regenerated; no more stale dates

## 4. Video Library — the smart alternative to a text blog

You're right: text blogs no one reads ≠ ranking. Video pages CAN rank (rich VideoObject results, video carousels in Google), and you already have ~150 of them. We make them real URLs.

**New routes** (per language):
- `/videos` — gallery page (filterable by industry: clinics, real estate, wellness, hospitality…)
- `/videos/:slug` — individual video landing page

**Each `/videos/:slug` page contains:**
- Embedded YouTube player (lazy-loaded, privacy mode — already done in `VideoCard.tsx`)
- H1 = video title
- 2–4 sentence description (you write once per video, or AI-assist from transcript)
- Industry tag + 3–5 related-video thumbnails
- **VideoObject JSON-LD schema** (name, description, thumbnailUrl, uploadDate, contentUrl, embedUrl, duration) — this is what makes it eligible for video rich results
- CTA: "Talk to Isabella about this →" (your existing chat)

**Why this works:**
- Each video = 1 indexable URL × 6 languages = scalable content without writing blog posts
- Google video carousels often outrank text results for "AI receptionist demo", "AI for clinics video", etc.
- The interactive feel stays — these are not text walls
- Reinforces topical authority (clinics, real estate, wellness)

**Data source:** start with `src/config/videoCatalog.ts` (the curated set Isabella already uses). Add `slug`, `industry`, `description` fields. Phase 2: pull the full ~150 from YouTube Data API or a JSON dump.

**Sitemap:** add a **video sitemap** (`/video-sitemap.xml`) with `<video:video>` entries — Google's official way to surface video content.

## 5. Industry landing pages (light, not bloggy)

Three short, design-rich pages (no walls of text):
- `/industries/clinics`
- `/industries/real-estate`
- `/industries/wellness`

Each = hero + 3-feature grid + 2-3 demo videos from the library + "Talk to Isabella" CTA. ~150 words of copy each, but every word is keyword-aligned.

## 6. CSR mitigation (no Puppeteer)

Skip heavy pre-rendering. Googlebot executes JS and will read Helmet tags. Keep static defaults in `index.html` for LinkedIn/Facebook/WhatsApp previews of the homepage. Same trade-off as wellnespirit — proven to work.

## 7. After publish

- Re-submit `https://www.ovelainteractive.com/sitemap.xml` in Search Console (should jump from 8 → ~200 URLs once videos are in)
- Submit `/video-sitemap.xml` separately
- Add a "Videos" link to main nav

---

## Technical summary (for reference)

| Area | File(s) |
|---|---|
| Per-language routing | `src/App.tsx` (wrap routes in `/:lang?`), new `LanguageRoute.tsx` |
| Language switcher | `src/components/UI/LanguageSwitcher.tsx` → use `navigate()` |
| i18n init | `src/i18n/index.ts` → read URL first |
| Helmet SEO | `bun add react-helmet-async`, new `src/components/SEO.tsx`, replace `useSEO` calls |
| Video library | new `src/pages/VideoLibrary.tsx`, `src/pages/VideoDetail.tsx`, expand `videoCatalog.ts` |
| Industry pages | new `src/pages/industries/Clinics.tsx`, `RealEstate.tsx`, `Wellness.tsx` |
| Sitemap generator | new `scripts/generate-sitemap.ts`, `package.json` predev/prebuild |
| Video sitemap | same script, separate output |
| index.html cleanup | remove conflicting canonical/hreflang |
| Nav | add "Videos" link in `Navigation.tsx` |

---

## Suggested execution order (3 phases)

**Phase 1 — SEO infrastructure (foundation):** per-language URLs + Helmet SEO + sitemap rebuild. Unlocks FR/ES/CA/DE/PT markets immediately. ~1 build.

**Phase 2 — Video Library:** routes + gallery + detail page + VideoObject schema + video sitemap. Start with ~20 curated videos, expand later. ~1 build.

**Phase 3 — Industry pages:** 3 short design-rich landing pages reusing existing components. ~1 build.

Each phase ships independently and improves ranking. No phase damages the cinematic feel — all additions are new routes; existing pages keep their current design untouched (only the i18n URL change affects them, and visually nothing changes).

Confirm and I'll start with Phase 1.