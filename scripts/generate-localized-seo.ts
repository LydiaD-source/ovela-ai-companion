/**
 * Generates market-aware localized content for the 5 topic hubs and 5 video
 * categories across ES, FR, DE, PT, CA via the Lovable AI Gateway.
 *
 * NOT translation. The model produces FAQs and intros tuned to each market's
 * concerns (e.g. Spanish wellness register vs German efficiency framing).
 *
 * Output: src/data/localized-seo.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { TOPIC_HUBS } from '../src/lib/topicHubsContent';
import { CATEGORY_META } from '../src/lib/videoCategoryMeta';
import { CATEGORY_SEO } from '../src/lib/videoSEOContent';

const KEY = process.env.LOVABLE_API_KEY;
if (!KEY) { console.error('LOVABLE_API_KEY missing'); process.exit(1); }

const MODEL = 'google/gemini-3-flash-preview';
const ENDPOINT = 'https://ai.gateway.lovable.dev/v1/chat/completions';

const LANGS = [
  { code: 'es', name: 'Spanish (Spain)', marketNote: 'Spanish market — warm, relational tone; wellness, real estate, and clinics are mature B2B segments; emphasise multilingual reach for international clientele (Marbella, Barcelona, Madrid, Costa del Sol).' },
  { code: 'fr', name: 'French (France)', marketNote: 'French market — precise, professional register; strong concern for data protection, GDPR, and quality of service; luxury and wellness are premium segments.' },
  { code: 'de', name: 'German (Germany)', marketNote: 'German market — efficiency, ROI, compliance, and reliability are top concerns; direct register, no marketing fluff; emphasise integration depth and measurable outcomes.' },
  { code: 'pt', name: 'Portuguese (Brazil + Portugal blend, lean Brazil)', marketNote: 'Portuguese market — accessible, warm tone; wellness and hospitality are growth segments in Brazil; real estate in Portugal (Lisbon, Algarve, Porto) heavily serves international buyers.' },
  { code: 'ca', name: 'Catalan (Catalunya)', marketNote: 'Catalan market — proud regional identity; Barcelona is the hub for design-forward businesses, clinics, wellness, and real estate; use native Catalan, not Spanish-translated Catalan.' },
];

async function callAI(systemPrompt: string, userPrompt: string): Promise<any> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI gateway ${res.status}: ${txt.slice(0, 400)}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('empty AI response');
  return JSON.parse(content);
}

const HUB_SYSTEM = `You are a multilingual SEO copywriter for Ovela Interactive, a studio that builds AI digital employees (AI receptionists, AI ambassadors, AI property presenters, AI patient communication) for businesses worldwide. You write NATIVE marketing copy for specific European/Latin markets — not translations. You understand cultural register, market-specific concerns, and SEO intent in each language. Always return valid JSON only.`;

const CAT_SYSTEM = HUB_SYSTEM;

async function localizeHub(hub: typeof TOPIC_HUBS[number], lang: typeof LANGS[number]) {
  const sectionsSrc = hub.sections.map((s, i) => `  ${i + 1}. ${s.heading}\n     ${s.body}`).join('\n');
  const subSrc = hub.subSegments.map((s, i) => `  ${i + 1}. ${s.title}\n     ${s.body}`).join('\n');

  const prompt = `Generate market-aware localized SEO content for the topic hub "${hub.h1}" in ${lang.name}.

MARKET CONTEXT: ${lang.marketNote}

SOURCE (English, for reference only — DO NOT translate literally, REWRITE for the target market):
- Tagline: "${hub.tagline}"
- Hero intro: "${hub.heroIntro}"

SOURCE SECTIONS (you MUST return exactly ${hub.sections.length} sections in the same order, same topic, but rewritten natively):
${sectionsSrc}

SOURCE SUB-SEGMENTS (you MUST return exactly ${hub.subSegments.length} sub-segments in the same order, same topic, but rewritten natively):
${subSrc || '  (none)'}

Return JSON with this exact shape:
{
  "seoTitle": "60-65 chars max, includes the primary keyword in ${lang.name}, ends with '| Ovela Interactive'",
  "seoDescription": "150-160 chars, market-tuned, includes a benefit + CTA verb",
  "tagline": "8-14 words, punchy, native to ${lang.name}",
  "heroIntro": "2-3 sentences (60-90 words), market-tuned, NOT a literal translation",
  "sections": [
    { "heading": "native heading", "body": "100-180 words, native register, same topic as source #N, rewritten not translated" }
  ],
  "subSegments": [
    { "title": "native title", "body": "40-80 words, native, same topic as source #N" }
  ],
  "faqs": [
    { "question": "...", "answer": "..." }
  ]
}

CRITICAL: "sections" array length MUST equal ${hub.sections.length}. "subSegments" array length MUST equal ${hub.subSegments.length}.

For "faqs", produce 8 native questions a ${lang.name} buyer would actually search/ask in this market — different from a generic translation. Answers should be 2-4 sentences each, specific, no fluff. Use the proper conventions of ${lang.name} (e.g. Catalan must be Catalan, not Spanish).`;

  return callAI(HUB_SYSTEM, prompt);
}

async function localizeCategory(cat: typeof CATEGORY_META[number], lang: typeof LANGS[number]) {
  const seo = CATEGORY_SEO[cat.key];
  const prompt = `Generate market-aware localized SEO content for the video category hub "${cat.h1}" in ${lang.name}.

MARKET CONTEXT: ${lang.marketNote}

SOURCE (English, reference only — REWRITE, do not translate):
- Intro: "${cat.intro}"
- Long intro: "${cat.longIntro}"
- Industry framing: "${seo?.industryContext || ''}"

Return JSON:
{
  "seoTitle": "60-65 chars, includes primary keyword in ${lang.name}, ends with '| Ovela Interactive'",
  "seoDescription": "150-160 chars, native and benefit-led",
  "intro": "1-2 sentences (30-45 words), native",
  "longIntro": "100-150 words, market-tuned",
  "faqs": [
    { "question": "...", "answer": "..." }
  ]
}

For "faqs", produce 5 native questions a ${lang.name} buyer would actually search/ask. Answers 2-3 sentences. Native register, no English calques.`;

  return callAI(CAT_SYSTEM, prompt);
}

// ─────────────────────────────────────────────────────────────────────
async function runWithRetry<T>(fn: () => Promise<T>, label: string, tries = 3): Promise<T> {
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e: any) {
      console.error(`  ✗ ${label} attempt ${i + 1}: ${e.message}`);
      if (i === tries - 1) throw e;
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
  throw new Error('unreachable');
}

async function main() {
  const out: any = { hubs: {}, categories: {} };

  // Hubs
  for (const hub of TOPIC_HUBS) {
    out.hubs[hub.slug] = {};
    console.log(`\n▶ Hub: ${hub.slug}`);
    // Process langs in parallel for this hub
    const results = await Promise.all(
      LANGS.map(async (lang) => {
        const data = await runWithRetry(() => localizeHub(hub, lang), `${hub.slug}/${lang.code}`);
        console.log(`  ✓ ${lang.code}`);
        return [lang.code, data] as const;
      })
    );
    for (const [code, data] of results) out.hubs[hub.slug][code] = data;
  }

  // Categories
  for (const cat of CATEGORY_META) {
    out.categories[cat.slug] = {};
    console.log(`\n▶ Category: ${cat.slug}`);
    const results = await Promise.all(
      LANGS.map(async (lang) => {
        const data = await runWithRetry(() => localizeCategory(cat, lang), `${cat.slug}/${lang.code}`);
        console.log(`  ✓ ${lang.code}`);
        return [lang.code, data] as const;
      })
    );
    for (const [code, data] of results) out.categories[cat.slug][code] = data;
  }

  const outPath = resolve('src/data/localized-seo.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\n✅ Wrote ${outPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
