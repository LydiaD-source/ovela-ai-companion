/**
 * Fetch YouTube captions for every video in src/data/youtube-videos.json
 * and cache to src/data/youtube-transcripts.json.
 *
 * Run: bunx tsx scripts/fetch-youtube-transcripts.ts
 */
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { YoutubeTranscript } from 'youtube-transcript';

interface YTVideo { id: string; title: string }
interface TranscriptEntry {
  id: string;
  title: string;
  language?: string;
  text: string;
  fetchedAt: string;
  error?: string;
}

const videos: YTVideo[] = JSON.parse(
  readFileSync(resolve('src/data/youtube-videos.json'), 'utf-8')
);
const outPath = resolve('src/data/youtube-transcripts.json');
const existing: Record<string, TranscriptEntry> = existsSync(outPath)
  ? Object.fromEntries(
      (JSON.parse(readFileSync(outPath, 'utf-8')) as TranscriptEntry[]).map((e) => [e.id, e])
    )
  : {};

let ok = 0;
let skipped = 0;
let failed = 0;

for (let i = 0; i < videos.length; i++) {
  const v = videos[i];
  if (existing[v.id] && !existing[v.id].error) {
    skipped++;
    continue;
  }
  try {
    const segments = await YoutubeTranscript.fetchTranscript(v.id, { lang: 'en' }).catch(() =>
      YoutubeTranscript.fetchTranscript(v.id)
    );
    const text = segments
      .map((s: any) => s.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .replace(/\[.*?\]/g, '')
      .trim();
    existing[v.id] = {
      id: v.id,
      title: v.title,
      text,
      fetchedAt: new Date().toISOString(),
    };
    ok++;
    if (i % 10 === 0) console.log(`[${i + 1}/${videos.length}] ${v.id} ✓ ${text.length} chars`);
  } catch (e: any) {
    existing[v.id] = {
      id: v.id,
      title: v.title,
      text: '',
      fetchedAt: new Date().toISOString(),
      error: e?.message || 'fetch failed',
    };
    failed++;
    console.warn(`[${i + 1}/${videos.length}] ${v.id} ✗ ${e?.message}`);
  }
  // throttle gently
  await new Promise((r) => setTimeout(r, 250));
}

writeFileSync(outPath, JSON.stringify(Object.values(existing), null, 2));
console.log(`\nDone. ok=${ok} skipped=${skipped} failed=${failed} -> ${outPath}`);
