import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ALL_VIDEOS, EnrichedVideo } from './videoLibrary';
import { VIDEO_CATEGORIES } from '@/config/videoCatalog';

interface SyncedRow {
  video_id: string;
  title: string;
  description: string;
  published_at: string | null;
  thumbnail: string | null;
  duration: string | null;
  duration_seconds: number | null;
  view_count: number | null;
  tags: string[] | null;
  category: string;
}

function slugify(title: string, id: string): string {
  const base = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `${base}-${id}`.replace(/^-/, '');
}

const knownIds = new Set(ALL_VIDEOS.map((v) => v.id));
const categoryLabelByKey = new Map(VIDEO_CATEGORIES.map((c) => [c.key, c.label]));

/**
 * Returns the static catalog merged with any auto-synced videos from the DB
 * that aren't already in the static JSON. Used by the Videos library so the
 * weekly Saturday sync surfaces new uploads without a rebuild.
 */
export function useMergedVideoLibrary(): EnrichedVideo[] {
  const [merged, setMerged] = useState<EnrichedVideo[]>(ALL_VIDEOS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('youtube_videos_synced')
        .select('video_id,title,description,published_at,thumbnail,duration,duration_seconds,view_count,tags,category')
        .order('published_at', { ascending: false })
        .limit(200);
      if (cancelled || error || !data) return;
      const extras: EnrichedVideo[] = (data as SyncedRow[])
        .filter((r) => !knownIds.has(r.video_id))
        .map((r) => ({
          id: r.video_id,
          title: r.title,
          category: r.category,
          slug: slugify(r.title, r.video_id),
          thumbnail: r.thumbnail || `https://i.ytimg.com/vi/${r.video_id}/hqdefault.jpg`,
          embedUrl: `https://www.youtube-nocookie.com/embed/${r.video_id}`,
          watchUrl: `https://www.youtube.com/watch?v=${r.video_id}`,
          description: r.description || '',
          publishedAt: r.published_at || '',
          duration: r.duration || '',
          durationSeconds: r.duration_seconds || 0,
          viewCount: Number(r.view_count || 0),
          tags: r.tags || [],
        }));
      if (extras.length === 0) return;
      // Newly synced first, then static catalog
      setMerged([...extras, ...ALL_VIDEOS]);
    })();
    return () => { cancelled = true; };
  }, []);

  return merged;
}
