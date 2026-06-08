// Weekly YouTube channel sync for Ovela Interactive.
// Triggered by pg_cron every Saturday 19:00 UTC (= 20:00 CET / 21:00 CEST).
// Manual trigger also supported (POST any body, optional { secret }).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CHANNEL_ID = 'UC0ZabJImCcMx5OLJkLU8iwg'; // Ovela Interactive
const UPLOADS_PLAYLIST = 'UU' + CHANNEL_ID.slice(2);
const NOTIFY_EMAIL = 'ovelainteractive@gmail.com';
const FROM_EMAIL = 'Isabella <isabella@notify.luxdeftec.eu>';
const SITE_URL = 'https://www.ovelainteractive.com';

// Category rules (mirror src/config/videoCatalog.ts)
const CATEGORIES = [
  { key: 'wellness_spa', label: 'Wellness & Spa', keywords: ['wellness','spa','health','relaxation','wellbeing','clinic','beauty','skincare','treatment','hotel','burnout','stress','executive health','high performer','recovery','fatigue','exhaustion','longevity','wellnespirit','andorra','dr picard','tired','sleep'] },
  { key: 'real_estate', label: 'Real Estate', keywords: ['real estate','property','properties','architecture','housing','apartment','building','construction','villa','penthouse','listing','agent','luxury home','realtor'] },
  { key: 'ai_ambassador', label: 'AI Brand Ambassador', keywords: ['ai host','digital human','isabella','chatbot','website host','virtual','digital model','digital ambassador','digital employee','digital team member','ai team','lost revenue','automation','lead generation','24/7','multilingual','ai receptionist','after hours'] },
  { key: 'interactive_marketing', label: 'Interactive Marketing', keywords: ['marketing','campaign','content','ads','brand','advertising','promo','promotion','storytelling','luxury','fashion','creative','concept','film','muse','lifestyle'] },
  { key: 'studio_intro', label: 'Studio Overview', keywords: ['overview','portfolio','about','examples','projects','studio','ovela'] },
];

function autoCategorize(title: string, description: string, tags: string[]): { key: string; label: string; keywords: string[] } {
  const hay = (title + ' ' + description + ' ' + tags.join(' ')).toLowerCase();
  for (const c of CATEGORIES) {
    if (c.keywords.some(k => hay.includes(k.toLowerCase()))) return c;
  }
  return CATEGORIES[2]; // default ai_ambassador
}

function isoToSec(iso: string): number {
  const m = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0)) : 0;
}

function stripHashtags(text: string): string {
  return text.replace(/#[\p{L}\p{N}_]+/gu, '').replace(/\n{3,}/g, '\n\n').trim();
}

function buildDescription(title: string, raw: string, categoryLabel: string): string {
  const trimmed = stripHashtags((raw || '').trim());
  if (trimmed.length >= 120) return trimmed;
  const fallback = `${title}. Discover how Ovela Interactive deploys AI digital employees and multilingual AI ambassadors for ${categoryLabel.toLowerCase()} — real-time, always-on customer communication that converts visitors into qualified leads 24/7.`;
  return trimmed ? `${trimmed}\n\n${fallback}` : fallback;
}

async function fetchAllVideoIds(): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;
  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'contentDetails');
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('playlistId', UPLOADS_PLAYLIST);
    url.searchParams.set('key', YOUTUBE_API_KEY);
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`playlistItems ${res.status}: ${await res.text()}`);
    const data = await res.json();
    for (const item of data.items || []) ids.push(item.contentDetails.videoId);
    pageToken = data.nextPageToken;
  } while (pageToken);
  return ids;
}

async function fetchVideoDetails(ids: string[]) {
  const out: any[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.set('part', 'snippet,contentDetails,statistics');
    url.searchParams.set('id', chunk.join(','));
    url.searchParams.set('key', YOUTUBE_API_KEY);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`videos ${res.status}: ${await res.text()}`);
    const data = await res.json();
    for (const v of data.items || []) {
      const thumbs = v.snippet.thumbnails || {};
      out.push({
        id: v.id,
        title: v.snippet.title,
        description: v.snippet.description || '',
        publishedAt: v.snippet.publishedAt,
        thumbnail: thumbs.maxres?.url || thumbs.standard?.url || thumbs.high?.url || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        duration: v.contentDetails.duration,
        viewCount: Number(v.statistics?.viewCount || 0),
        tags: v.snippet.tags || [],
      });
    }
  }
  return out;
}

async function sendIsabellaEmail(newVideos: any[], totalFetched: number) {
  const count = newVideos.length;
  const list = count
    ? newVideos.slice(0, 25).map(v => `<li style="margin-bottom:8px"><strong>${v.title}</strong><br/><span style="color:#9b8c5c">${v.categoryLabel}</span> · <a href="https://youtu.be/${v.video_id}" style="color:#d4af37">Watch</a></li>`).join('')
    : '<li style="color:#888">No new videos this week. Channel scanned successfully.</li>';

  const html = `
  <div style="background:#0a0f1c;color:#e8e8e8;padding:32px;font-family:Georgia,serif;max-width:640px;margin:0 auto">
    <h1 style="font-family:'Playfair Display',Georgia,serif;color:#d4af37;font-size:26px;margin:0 0 6px">Weekly YouTube Sync — Ovela</h1>
    <p style="color:#9b8c5c;margin:0 0 24px;font-size:13px">${new Date().toUTCString()}</p>
    <p style="color:#e8e8e8;line-height:1.6">Hi — Isabella here. I just finished the weekly scan of the Ovela Interactive YouTube channel.</p>
    <div style="background:#111827;border:1px solid #1f2937;border-radius:8px;padding:20px;margin:20px 0">
      <p style="margin:0;color:#d4af37;font-size:18px"><strong>${count}</strong> new video${count === 1 ? '' : 's'} added</p>
      <p style="margin:6px 0 0;color:#9b8c5c;font-size:13px">${totalFetched} total scanned · auto-categorized · SEO descriptions expanded · keywords applied</p>
    </div>
    <h3 style="color:#d4af37;font-size:16px;margin:24px 0 8px">Newly synced</h3>
    <ul style="padding-left:18px;color:#e8e8e8;line-height:1.5">${list}</ul>
    <p style="color:#9b8c5c;font-size:12px;margin-top:32px;border-top:1px solid #1f2937;padding-top:16px">Sitemap is auto-refreshed; Google re-crawls on its weekly schedule. View live: <a href="${SITE_URL}/videos" style="color:#d4af37">${SITE_URL}/videos</a></p>
  </div>`;

  const res = await fetch('https://connector-gateway.lovable.dev/resend/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': RESEND_API_KEY,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [NOTIFY_EMAIL],
      subject: `Isabella · Weekly YouTube sync — ${count} new video${count === 1 ? '' : 's'}`,
      html,
    }),
  });
  if (!res.ok) console.error('Resend failed', res.status, await res.text());
}

async function pingGoogleSitemap() {
  // Google deprecated the ping endpoint in 2023, but it's harmless.
  // Real re-indexing happens via the sitemap's <lastmod> + <changefreq>weekly</changefreq>.
  try {
    await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(SITE_URL + '/sitemap.xml')}`);
  } catch {}
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: runRow } = await supabase
    .from('youtube_sync_runs')
    .insert({ source_channel: 'ovela', status: 'running' })
    .select()
    .single();
  const runId = runRow?.id;

  try {
    const ids = await fetchAllVideoIds();
    // Find which already exist
    const { data: existing } = await supabase
      .from('youtube_videos_synced')
      .select('video_id')
      .in('video_id', ids);
    const known = new Set((existing || []).map((r: any) => r.video_id));
    const newIds = ids.filter(id => !known.has(id));

    let inserted: any[] = [];
    if (newIds.length) {
      const details = await fetchVideoDetails(newIds);
      const rows = details.map(v => {
        const cat = autoCategorize(v.title, v.description, v.tags);
        return {
          video_id: v.id,
          title: v.title,
          description: buildDescription(v.title, v.description, cat.label),
          published_at: v.publishedAt,
          thumbnail: v.thumbnail,
          duration: v.duration,
          duration_seconds: isoToSec(v.duration),
          view_count: v.viewCount,
          tags: v.tags,
          category: cat.key,
          keywords: cat.keywords.slice(0, 15),
          source_channel: 'ovela',
        };
      });
      const { data: ins, error } = await supabase
        .from('youtube_videos_synced')
        .insert(rows)
        .select('video_id, title, category');
      if (error) throw error;
      inserted = (ins || []).map((r: any) => ({
        ...r,
        categoryLabel: CATEGORIES.find(c => c.key === r.category)?.label || r.category,
      }));
    }

    await sendIsabellaEmail(inserted, ids.length);
    await pingGoogleSitemap();

    if (runId) {
      await supabase.from('youtube_sync_runs').update({
        finished_at: new Date().toISOString(),
        new_videos_count: inserted.length,
        total_fetched: ids.length,
        status: 'success',
        new_video_ids: inserted.map(v => v.video_id),
      }).eq('id', runId);
    }

    return new Response(JSON.stringify({ ok: true, total: ids.length, new: inserted.length, videos: inserted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('sync-youtube-channel error:', msg);
    if (runId) {
      await supabase.from('youtube_sync_runs').update({
        finished_at: new Date().toISOString(),
        status: 'error',
        error: msg,
      }).eq('id', runId);
    }
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
