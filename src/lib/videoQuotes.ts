import quotesData from '@/data/video-quotes.json';

export interface VideoQuote {
  text: string;
  score: number;
}

interface QuoteEntry {
  id: string;
  title: string;
  quotes: VideoQuote[];
}

const byId = new Map<string, VideoQuote[]>(
  (quotesData as QuoteEntry[]).map((e) => [e.id, e.quotes || []])
);

export function getVideoQuotes(videoId: string): VideoQuote[] {
  return byId.get(videoId) || [];
}
