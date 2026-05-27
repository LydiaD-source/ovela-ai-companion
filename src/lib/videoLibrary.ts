import { VIDEO_CATEGORIES, VideoItem } from '@/config/videoCatalog';
import ytData from '@/data/youtube-videos.json';

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

export interface EnrichedVideo extends VideoItem {
  slug: string;
  thumbnail: string;
  embedUrl: string;
  watchUrl: string;
  description: string;
  publishedAt: string;
  duration: string;        // ISO 8601 (PT2M30S)
  durationSeconds: number;
  viewCount: number;
  tags: string[];
}

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

function isoDurationToSeconds(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0));
}

// Build id -> category map from curated catalog
const idToCategory = new Map<string, string>();
const catalogTitle = new Map<string, string>();
for (const cat of VIDEO_CATEGORIES) {
  for (const v of cat.videos) {
    if (!idToCategory.has(v.id)) {
      idToCategory.set(v.id, cat.key);
      catalogTitle.set(v.id, v.title);
    }
  }
}

// Auto-categorize uncurated videos by keyword match
function autoCategorize(title: string, tags: string[]): string {
  const hay = (title + ' ' + tags.join(' ')).toLowerCase();
  for (const cat of VIDEO_CATEGORIES) {
    if (cat.keywords.some((k) => hay.includes(k.toLowerCase()))) return cat.key;
  }
  return VIDEO_CATEGORIES[0].key;
}

// Build a fallback rich description if YouTube description is empty/short
function buildDescription(title: string, ytDescription: string, categoryLabel: string): string {
  const trimmed = (ytDescription || '').trim();
  if (trimmed.length >= 120) return trimmed;
  const base = `${title}. Discover how Ovela Interactive deploys AI digital employees and multilingual AI representatives for ${categoryLabel.toLowerCase()} — real-time, always-on customer communication that converts visitors into qualified leads 24/7.`;
  return trimmed ? `${trimmed}\n\n${base}` : base;
}

const categoryLabelByKey = new Map(VIDEO_CATEGORIES.map((c) => [c.key, c.label]));

// Build enriched library from YouTube data (155 videos), merged with curated category map
export const ALL_VIDEOS: EnrichedVideo[] = (ytData as YTVideo[]).map((y) => {
  const category = idToCategory.get(y.id) || autoCategorize(y.title, y.tags);
  const title = catalogTitle.get(y.id) || y.title;
  const categoryLabel = categoryLabelByKey.get(category) || 'AI digital employee';
  return {
    id: y.id,
    title,
    category,
    slug: slugify(title, y.id),
    thumbnail: y.thumbnail || `https://i.ytimg.com/vi/${y.id}/hqdefault.jpg`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${y.id}`,
    watchUrl: `https://www.youtube.com/watch?v=${y.id}`,
    description: buildDescription(title, y.description, categoryLabel),
    publishedAt: y.publishedAt,
    duration: y.duration,
    durationSeconds: isoDurationToSeconds(y.duration),
    viewCount: parseInt(y.viewCount || '0', 10),
    tags: y.tags || [],
  };
});

export const VIDEO_LIBRARY_CATEGORIES = VIDEO_CATEGORIES.map((c) => ({
  key: c.key,
  label: c.label,
  description: c.description,
}));

export function getVideoBySlug(slug: string): EnrichedVideo | undefined {
  return ALL_VIDEOS.find((v) => v.slug === slug);
}

export function getVideosByCategoryKey(key: string): EnrichedVideo[] {
  return ALL_VIDEOS.filter((v) => v.category === key);
}

export function getRelatedVideos(slug: string, limit = 4): EnrichedVideo[] {
  const current = getVideoBySlug(slug);
  if (!current) return ALL_VIDEOS.slice(0, limit);
  return ALL_VIDEOS.filter((v) => v.category === current.category && v.slug !== slug).slice(0, limit);
}
