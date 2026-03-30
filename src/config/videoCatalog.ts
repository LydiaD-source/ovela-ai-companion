/**
 * Video Intelligence Layer — Curated YouTube catalog
 * Maps categories to YouTube video IDs for Isabella to suggest in chat
 */

export interface VideoItem {
  id: string;       // YouTube video ID
  title: string;
  category: string;
}

export interface VideoCategory {
  key: string;
  label: string;
  description: string;
  keywords: string[];   // Intent-matching keywords
  videos: VideoItem[];
}

export const VIDEO_CATEGORIES: VideoCategory[] = [
  {
    key: 'interactive_marketing',
    label: 'Interactive Marketing',
    description: 'High-end brand storytelling & luxury campaigns',
    keywords: ['marketing', 'campaign', 'content', 'ads', 'brand', 'advertising', 'promo', 'promotion', 'storytelling', 'luxury', 'fashion', 'clips', 'video', 'creative'],
    videos: [
      { id: '_rAGBwQw07g', title: 'This AI Adapts to YOU (Your Personal Digital Companion)', category: 'interactive_marketing' },
      { id: 'jm_Y25rwiUU', title: 'This AI Knows Your Exact Size… Instantly', category: 'interactive_marketing' },
      { id: 'RKo1DVWCLVA', title: "You'll Soon Be Able to Talk to Her… 24/7", category: 'interactive_marketing' },
      { id: 'CSK11FthtUk', title: 'This AI Will Dress You Better Than You Do', category: 'interactive_marketing' },
      { id: '0EgykAp5bu0', title: 'AI That Talks to Your Customers in Any Language', category: 'interactive_marketing' },
    ],
  },
  {
    key: 'wellness_spa',
    label: 'Wellness & Spa',
    description: 'Wellness, lifestyle, relaxation & health',
    keywords: ['wellness', 'spa', 'health', 'lifestyle', 'relaxation', 'wellbeing', 'clinic', 'beauty', 'skincare', 'treatment'],
    videos: [
      { id: 'sZJl1egIJjk', title: "Your Website Isn't Talking… That's the Problem", category: 'wellness_spa' },
      { id: 'vxvKb9Mq5tE', title: "You're Losing Clients After Hours… Here's Why", category: 'wellness_spa' },
      { id: '4G-IGbL44V4', title: 'AI Host for Your Website 24/7 | Never Miss a Client Again', category: 'wellness_spa' },
      { id: 'NpDgiXIUt2c', title: "What Spa Menus Don't Show You… | AI Spa Concierge", category: 'wellness_spa' },
      { id: 'eQ_Lq68kf24', title: 'AI Spa Concierge: Elevating Client Experience Before Arrival', category: 'wellness_spa' },
    ],
  },
  {
    key: 'real_estate',
    label: 'Real Estate',
    description: 'Property, architecture & premium environments',
    keywords: ['real estate', 'property', 'architecture', 'housing', 'apartment', 'building', 'construction', 'home', 'villa', 'development'],
    videos: [
      { id: 'Wks3Oxp7hIA', title: 'Boost Your Real Estate Sales After Hours with AI Host', category: 'real_estate' },
      { id: 'Yewiv1kwo0w', title: 'AI Is Already Selling Properties 24/7 — Most Businesses Are Behind', category: 'real_estate' },
      { id: 'eaKPR03Uh0A', title: 'This AI Real Estate Host Works 24/7… And Speaks Arabic, French & English!', category: 'real_estate' },
      { id: 'ARGXQEPJuAc', title: 'Your Real Estate Website Should Work 24/7', category: 'real_estate' },
      { id: 'GFhjCDaueJ4', title: 'AI Real Estate Agent That Works 24/7', category: 'real_estate' },
    ],
  },
  {
    key: 'ai_ambassador',
    label: 'AI Brand Ambassador',
    description: 'Isabella capabilities, digital human interaction',
    keywords: ['ambassador', 'ai host', 'digital human', 'isabella', 'interaction', 'assistant', 'chatbot', 'website host', 'virtual', 'digital model'],
    videos: [
      { id: 'ugYmCLAqCUY', title: 'AI Website Host That Talks to Your Customers 24/7', category: 'ai_ambassador' },
      { id: 'KKpnvS5NAnw', title: 'Meet Isabella — The AI Host for the Next Generation of Websites', category: 'ai_ambassador' },
      { id: 'C9Nb85qsHiE', title: 'AI Digital Host: Transforming Online Platform Experience', category: 'ai_ambassador' },
      { id: 'xdMLb9yltZM', title: 'Meet Isabella — Your Interactive Wellness Guide!', category: 'ai_ambassador' },
      { id: 'XkgRtTK1rOQ', title: 'Businesses Are Replacing Traditional Marketing With Digital Ambassadors', category: 'ai_ambassador' },
    ],
  },
  {
    key: 'studio_intro',
    label: 'Studio Overview',
    description: 'General Ovela Interactive portfolio & overview',
    keywords: ['overview', 'portfolio', 'about', 'what do you do', 'show me', 'examples', 'projects', 'work', 'general'],
    videos: [
      { id: '5WKhenIQdX8', title: 'Luxury Fashion Shoot with Digital Model', category: 'studio_intro' },
      { id: 'xe-UBYYPzs8', title: 'Turn Any Product Into a Story | Digital Calendar Marketing', category: 'studio_intro' },
      { id: 'w2y1V0-Bmok', title: 'Isabella — A Digital Ambassador for the Modern Brand', category: 'studio_intro' },
      { id: 'NbMCU2lmxnQ', title: 'Ovela Interactive — The Future of Modeling Is Interactive', category: 'studio_intro' },
    ],
  },
];

/** Get videos for a specific category key */
export function getVideosByCategory(categoryKey: string): VideoItem[] {
  return VIDEO_CATEGORIES.find(c => c.key === categoryKey)?.videos || [];
}

/** Get the fallback/mixed category */
export function getFallbackVideos(): VideoItem[] {
  return getVideosByCategory('studio_intro');
}
