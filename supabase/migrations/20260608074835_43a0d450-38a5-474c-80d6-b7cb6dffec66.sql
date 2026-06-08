
CREATE TABLE public.youtube_videos_synced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  published_at timestamptz,
  thumbnail text,
  duration text,
  duration_seconds integer DEFAULT 0,
  view_count bigint DEFAULT 0,
  tags text[] DEFAULT '{}',
  category text NOT NULL,
  keywords text[] DEFAULT '{}',
  source_channel text NOT NULL DEFAULT 'ovela',
  synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.youtube_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_channel text NOT NULL DEFAULT 'ovela',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  new_videos_count integer DEFAULT 0,
  total_fetched integer DEFAULT 0,
  status text NOT NULL DEFAULT 'running',
  error text,
  new_video_ids text[] DEFAULT '{}'
);

GRANT SELECT ON public.youtube_videos_synced TO anon, authenticated;
GRANT ALL ON public.youtube_videos_synced TO service_role;

GRANT SELECT ON public.youtube_sync_runs TO authenticated;
GRANT ALL ON public.youtube_sync_runs TO service_role;

ALTER TABLE public.youtube_videos_synced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read synced videos"
  ON public.youtube_videos_synced FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can read sync runs"
  ON public.youtube_sync_runs FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX youtube_videos_synced_category_idx ON public.youtube_videos_synced(category);
CREATE INDEX youtube_videos_synced_published_idx ON public.youtube_videos_synced(published_at DESC);

CREATE TRIGGER update_youtube_videos_synced_updated_at
  BEFORE UPDATE ON public.youtube_videos_synced
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
