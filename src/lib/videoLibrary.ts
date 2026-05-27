import { VIDEO_CATEGORIES, VideoItem } from '@/config/videoCatalog';

export interface EnrichedVideo extends VideoItem {
  slug: string;
  thumbnail: string;
  embedUrl: string;
  watchUrl: string;
  description: string;
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

function describe(title: string, categoryLabel: string): string {
  return `${title}. Discover how Ovela Interactive deploys AI digital employees and AI representatives for ${categoryLabel.toLowerCase()} — real-time, multilingual, and always-on customer communication.`;
}

// Build a flat de-duplicated list of enriched videos.
const seen = new Set<string>();
export const ALL_VIDEOS: EnrichedVideo[] = VIDEO_CATEGORIES.flatMap((cat) =>
  cat.videos
    .filter((v) => {
      const key = v.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((v) => ({
      ...v,
      category: cat.key,
      slug: slugify(v.title, v.id),
      thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
      watchUrl: `https://www.youtube.com/watch?v=${v.id}`,
      description: describe(v.title, cat.label),
    })),
);

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
