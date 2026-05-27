/**
 * Extract quality-gated quotes from YouTube transcripts.
 * Two-pass: extract candidates, then self-score 0-10. Keep only score >= 8.
 *
 * Run: bunx tsx scripts/extract-video-quotes.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const API_KEY = process.env.LOVABLE_API_KEY;
if (!API_KEY) {
  console.error('Missing LOVABLE_API_KEY');
  process.exit(1);
}

interface TranscriptEntry { id: string; title: string; text: string; error?: string }
interface Quote { text: string; score: number; reason: string }
interface QuoteOut { id: string; title: string; quotes: Quote[]; extractedAt: string }

const MIN_CHARS = 250;     // skip very short transcripts
const MIN_SCORE = 8;       // quality gate
const MAX_QUOTES = 3;

const transcripts: TranscriptEntry[] = JSON.parse(
  readFileSync(resolve('src/data/youtube-transcripts.json'), 'utf-8')
);

const outPath = resolve('src/data/video-quotes.json');
const existing: Record<string, QuoteOut> = existsSync(outPath)
  ? Object.fromEntries(
      (JSON.parse(readFileSync(outPath, 'utf-8')) as QuoteOut[]).map((e) => [e.id, e])
    )
  : {};

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Lovable-API-Key': API_KEY!,
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) throw new Error(`Gateway ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '{}';
}

const EXTRACT_PROMPT = (title: string, transcript: string) => `You are extracting standalone insight quotes from a video transcript. The transcript is from YouTube auto-captions, so it may contain transcription errors, mishearings (e.g., "Isabella" rendered as "is a bell a"), and filler words.

Video title: "${title}"
Transcript:
"""${transcript.slice(0, 6000)}"""

Extract up to 3 candidate quote-worthy sentences. For each, also self-score it on a 0-10 scale based on these strict criteria:
- 10 = clear, complete, business-relevant insight that reads professionally and stands alone
- 8-9 = strong insight, professional, minor smoothing OK (you may lightly fix obvious caption errors like brand name spelling, but DO NOT paraphrase or invent words)
- 5-7 = decent but has issues (incomplete thought, filler, mishearings affecting meaning)
- 0-4 = filler, broken, or marketing-fluff-sounding

Hard rules:
- Use verbatim sentences from the transcript. Only correct obvious mishearings of "Isabella", "Ovela", "WellneSpirit", brand names, and add proper punctuation/capitalization. Never add new ideas or words.
- Reject anything that sounds like generic marketing copy.
- If NO sentence qualifies (transcript is too noisy, too short, or all filler), return an empty array.
- Score honestly. Most transcripts should yield 0-2 quotes, not 3.

Respond ONLY with valid JSON:
{"quotes":[{"text":"...","score":8,"reason":"why this score"}]}`;

let processed = 0;
let kept = 0;
let totalQuotes = 0;

for (let i = 0; i < transcripts.length; i++) {
  const t = transcripts[i];
  if (existing[t.id]) { continue; }
  if (t.error || !t.text || t.text.length < MIN_CHARS) {
    existing[t.id] = { id: t.id, title: t.title, quotes: [], extractedAt: new Date().toISOString() };
    continue;
  }

  try {
    const raw = await callGemini(EXTRACT_PROMPT(t.title, t.text));
    const parsed = JSON.parse(raw);
    const candidates: Quote[] = Array.isArray(parsed.quotes) ? parsed.quotes : [];
    const passing = candidates
      .filter((q) => typeof q.text === 'string' && q.text.length >= 30 && q.score >= MIN_SCORE)
      .slice(0, MAX_QUOTES);

    existing[t.id] = {
      id: t.id,
      title: t.title,
      quotes: passing,
      extractedAt: new Date().toISOString(),
    };

    processed++;
    if (passing.length > 0) {
      kept++;
      totalQuotes += passing.length;
    }
    if (processed % 10 === 0) {
      console.log(`[${i + 1}/${transcripts.length}] processed=${processed} kept=${kept} quotes=${totalQuotes}`);
      // Periodic save
      writeFileSync(outPath, JSON.stringify(Object.values(existing), null, 2));
    }
  } catch (e: any) {
    console.warn(`[${i + 1}] ${t.id} extract failed:`, e?.message);
    existing[t.id] = { id: t.id, title: t.title, quotes: [], extractedAt: new Date().toISOString() };
  }

  await new Promise((r) => setTimeout(r, 400));
}

writeFileSync(outPath, JSON.stringify(Object.values(existing), null, 2));
console.log(`\nDone. processed=${processed} videos_with_quotes=${kept} total_quotes=${totalQuotes}`);
console.log(`-> ${outPath}`);
