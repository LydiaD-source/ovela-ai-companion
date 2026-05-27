/**
 * Fetches all videos from the Ovela Interactive YouTube channel via YouTube Data API v3
 * and writes enriched metadata (title, description, thumbnail, duration, publish date,
 * view count, tags) to src/data/youtube-videos.json.
 *
 * Run: YOUTUBE_API_KEY=xxx bunx tsx scripts/fetch-youtube-metadata.ts
 */
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'UC0ZabJImCcMx5OLJkLU8iwg';
// Uploads playlist = channel ID with UC -> UU
const UPLOADS_PLAYLIST = 'UU' + CHANNEL_ID.slice(2);

if (!API_KEY) {
  console.error('Missing YOUTUBE_API_KEY env var');
  process.exit(1);
}

interface YTVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
  tags: string[];
}

async function fetchAllVideoIds(): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;
  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'contentDetails');
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('playlistId', UPLOADS_PLAYLIST);
    url.searchParams.set('key', API_KEY!);
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`playlistItems failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    for (const item of data.items || []) ids.push(item.contentDetails.videoId);
    pageToken = data.nextPageToken;
  } while (pageToken);
  return ids;
}

async function fetchVideoDetails(ids: string[]): Promise<YTVideo[]> {
  const out: YTVideo[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.set('part', 'snippet,contentDetails,statistics');
    url.searchParams.set('id', chunk.join(','));
    url.searchParams.set('key', API_KEY!);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`videos failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    for (const v of data.items || []) {
      const thumbs = v.snippet.thumbnails || {};
      out.push({
        id: v.id,
        title: v.snippet.title,
        description: v.snippet.description || '',
        publishedAt: v.snippet.publishedAt,
        thumbnail:
          thumbs.maxres?.url ||
          thumbs.standard?.url ||
          thumbs.high?.url ||
          `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        duration: v.contentDetails.duration,
        viewCount: v.statistics?.viewCount || '0',
        tags: v.snippet.tags || [],
      });
    }
  }
  return out;
}

(async () => {
  console.log(`Fetching uploads playlist ${UPLOADS_PLAYLIST}...`);
  const ids = await fetchAllVideoIds();
  console.log(`Found ${ids.length} videos. Fetching details...`);
  const videos = await fetchVideoDetails(ids);
  // Sort newest first
  videos.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const outPath = resolve('src/data/youtube-videos.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(videos, null, 2));
  console.log(`Wrote ${videos.length} videos -> ${outPath}`);
})();
