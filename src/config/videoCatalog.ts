/**
 * Video Intelligence Layer — Curated YouTube catalog
 * Maps categories to YouTube video IDs for Isabella to suggest in chat
 * Source: Ovela Interactive YouTube playlists (86 videos across 5 categories)
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
    description: 'High-end brand storytelling, luxury campaigns & digital content',
    keywords: ['marketing', 'campaign', 'content', 'ads', 'brand', 'advertising', 'promo', 'promotion', 'storytelling', 'luxury', 'fashion', 'clips', 'video', 'creative', 'concept', 'film', 'muse', 'lifestyle'],
    videos: [
      { id: '_rAGBwQw07g', title: 'This AI Adapts to YOU (Your Personal Digital Companion)', category: 'interactive_marketing' },
      { id: 'jm_Y25rwiUU', title: 'Every Business Needs This: A 24/7 AI Website Host', category: 'interactive_marketing' },
      { id: '1AE7Cu3i-zc', title: 'This AI Knows Your Exact Size… Instantly', category: 'interactive_marketing' },
      { id: 'RKo1DVWCLVA', title: 'This Is the Future of Gaming Companions', category: 'interactive_marketing' },
      { id: 'CSK11FthtUk', title: "You'll Soon Be Able to Talk to Her… 24/7", category: 'interactive_marketing' },
      { id: 'wPXl2drbWPI', title: 'This AI Will Dress You Better Than You Do', category: 'interactive_marketing' },
      { id: '0EgykAp5bu0', title: 'AI Gaming Host That Guides You Live', category: 'interactive_marketing' },
      { id: 'zY37fX42Mys', title: 'AI That Talks to Your Customers in Any Language', category: 'interactive_marketing' },
      { id: 'zKf24uWfqqE', title: 'Meet Isabella — Your Interactive AI Game Host', category: 'interactive_marketing' },
      { id: 'dJR1L9rqJ4w', title: 'Would You Trust AI to Style You? | 3D Body Scan + Smart Wardrobe', category: 'interactive_marketing' },
      { id: 'OHSHgvpf8uU', title: 'The Future of Interactive AI Assistants (Real-Time Digital Ambassador)', category: 'interactive_marketing' },
      { id: 'xdMLb9yltZM', title: 'AI Digital Host: Transforming Online Platform Experience', category: 'interactive_marketing' },
      { id: 'mNSNw2qA2OI', title: 'This Might Replace Online Clothing Sizes Forever', category: 'interactive_marketing' },
      { id: 'eB4Vta3OJ9c', title: 'Tired of Reading Endless Text? Meet Your AI Guide.', category: 'interactive_marketing' },
      { id: '6ycKwZIUkbw', title: 'How to Make the Street Your Catwalk — Luxury Look, Fraction of the Price', category: 'interactive_marketing' },
      { id: 'eY0oowaBPnc', title: 'How To Make Luxury Fashion Campaigns Without Luxury Budgets', category: 'interactive_marketing' },
      { id: 'irrSwe-mUv8', title: 'Where Wellness Meets Innovation — Spa Moments with Isabella', category: 'interactive_marketing' },
      { id: 'NwGDFcH1xQ4', title: 'From Street to Track Luxury in Motion', category: 'interactive_marketing' },
      { id: 'TgdlFa-4Jdo', title: 'From Street to Track Digital Ambassador Luxury Lifestyle', category: 'interactive_marketing' },
      { id: 'wzDZMhkBC94', title: 'Luxury, in Motion — Episode 1', category: 'interactive_marketing' },
      { id: 'syJGbD3pm_I', title: 'The Brand Beyond the Storefront', category: 'interactive_marketing' },
      { id: 'szYhbZnvEKA', title: 'How Brands Exist Beyond the Store', category: 'interactive_marketing' },
      { id: 'xotQSksFY9k', title: 'How Brands Exist Digitally Today | A Concept Film by Ovela Interactive', category: 'interactive_marketing' },
      { id: 'Cf-d95CCWCs', title: 'The Solaire Presence — A Digital Muse Concept for Luxury Brands', category: 'interactive_marketing' },
      { id: 'lPMz9yBSPko', title: 'This Is How Luxury Introduces Itself Now', category: 'interactive_marketing' },
      { id: '9xo27fDjXuo', title: 'Luxury Shopping in Andorra — A Hidden Gem', category: 'interactive_marketing' },
      { id: 'dpSxmN8GLIs', title: 'Timeless Brands Deserve Modern Presence', category: 'interactive_marketing' },
      { id: 'gLa00ITR41M', title: 'Luxury & Lifestyle (Rémy Martin–style)', category: 'interactive_marketing' },
    ],
  },
  {
    key: 'wellness_spa',
    label: 'Wellness & Spa',
    description: 'Wellness, lifestyle, relaxation, spa & health marketing',
    keywords: ['wellness', 'spa', 'health', 'lifestyle', 'relaxation', 'wellbeing', 'clinic', 'beauty', 'skincare', 'treatment', 'booking', 'hotel', 'concierge'],
    videos: [
      { id: 'sZJl1egIJjk', title: "Your Website Isn't Talking… That's the Problem", category: 'wellness_spa' },
      { id: 'vxvKb9Mq5tE', title: 'Your Website Should Talk Back (AI Hotel & Spa Host)', category: 'wellness_spa' },
      { id: '4G-IGbL44V4', title: "You're Losing Clients After Hours… Here's Why", category: 'wellness_spa' },
      { id: '8oOOYCDc2p4', title: 'AI Host for Your Website 24/7 | Never Miss a Client Again', category: 'wellness_spa' },
      { id: 'NpDgiXIUt2c', title: 'Your Website Can Show the Experience Before Booking', category: 'wellness_spa' },
      { id: 'eQ_Lq68kf24', title: "What Spa Menus Don't Show You… | AI Spa Concierge", category: 'wellness_spa' },
      { id: 'F7XgnqKXygM', title: 'AI Spa Concierge: Elevating Client Experience Before Arrival', category: 'wellness_spa' },
      { id: 'bQC17B_jt_A', title: 'AI Wellness Host: Elevate Client Experience & Increase Retention', category: 'wellness_spa' },
      { id: '14YbLq6cm8Q', title: 'AI Spa Assistant for Live Booking & Client Retention', category: 'wellness_spa' },
      { id: '9H4bdBNLDVU', title: 'Your Spa Experience Should Start Before You Arrive', category: 'wellness_spa' },
      { id: 'PuicKoK2V6A', title: 'How AI Is Transforming Luxury Spa Experience', category: 'wellness_spa' },
      { id: 'WWksZoDvqqw', title: 'How AI Brand Ambassadors Increase Spa Bookings | Wellness Marketing', category: 'wellness_spa' },
      { id: 'PtflxEfaCAA', title: 'How Isabella Sells Wellness Solutions | Your Interactive Digital Ambassador', category: 'wellness_spa' },
      { id: 'irrSwe-mUv8', title: 'Where Wellness Meets Innovation — Spa Moments with Isabella', category: 'wellness_spa' },
    ],
  },
  {
    key: 'real_estate',
    label: 'Real Estate',
    description: 'Property, architecture, luxury listings & premium environments',
    keywords: ['real estate', 'property', 'architecture', 'housing', 'apartment', 'building', 'construction', 'home', 'villa', 'development', 'penthouse', 'listing', 'agent'],
    videos: [
      { id: 'Wks3Oxp7hIA', title: 'Boost Your Real Estate Sales After Hours with AI Host', category: 'real_estate' },
      { id: 'Yewiv1kwo0w', title: 'AI Is Already Handling Real Estate Clients 24/7', category: 'real_estate' },
      { id: 'eaKPR03Uh0A', title: 'AI Is Already Selling Properties 24/7 — Most Businesses Are Behind', category: 'real_estate' },
      { id: 'xVXOTab6UWk', title: 'This AI Real Estate Host Works 24/7… And Speaks Arabic, French & English!', category: 'real_estate' },
      { id: 'ARGXQEPJuAc', title: 'AI Real Estate Host for the Middle East | Arabic Property Tours', category: 'real_estate' },
      { id: 'GFhjCDaueJ4', title: 'Your Real Estate Website Should Work 24/7', category: 'real_estate' },
      { id: 'cI4Z6WTNYyE', title: 'AI Real Estate Agent That Works 24/7', category: 'real_estate' },
      { id: 'V27TGVwI6Xk', title: '24/7 AI Real Estate Agent — Never Miss a Property Lead Again', category: 'real_estate' },
      { id: 'FsEc1eud3Cw', title: 'Still Using Static Real Estate Ads? Watch This.', category: 'real_estate' },
      { id: 'cOkzA2NA7Oc', title: 'Stop Using Static Real Estate Ads — Let AI Sell Your Property 24/7', category: 'real_estate' },
      { id: 'QJLeevdeIh4', title: 'Still Browsing Static Listings? Meet Your 24/7 Property Presenter.', category: 'real_estate' },
      { id: '_-5ibM9N1g0', title: 'How To Add a 24/7 AI Team Member to Your Real Estate Agency', category: 'real_estate' },
      { id: 'Mo9OgA_F-1g', title: 'Real Estate Agents — This Saves You Hours Per Listing', category: 'real_estate' },
      { id: '-gEPmAW5OC8', title: 'The Future of Real Estate Showings — Interactive AI Property Presentation', category: 'real_estate' },
      { id: 'unRkKhgKO9k', title: 'Luxury Penthouse Presentation with Digital Ambassador', category: 'real_estate' },
      { id: 'D4_NNNdyXXw', title: 'Ocean View Property Presentation — Digital Real Estate Ambassador', category: 'real_estate' },
      { id: 'uaj39gNJHwc', title: 'Luxury Real Estate, Presented by a Digital Ambassador', category: 'real_estate' },
      { id: 'rZ3TphNnmBU', title: 'Every View Tells a Story — Paris Penthouse Showcase', category: 'real_estate' },
      { id: '9_cC8Ybr3XY', title: 'Luxury Living, Redefined — Oceanfront Elegance', category: 'real_estate' },
      { id: 'peTBx1M4zgA', title: 'Luxury, Framed by the Horizon', category: 'real_estate' },
      { id: 'sHRGlXTYtLs', title: 'Properties Sell Faster When They Speak Globally', category: 'real_estate' },
      { id: 'rzRT_jH7L04', title: 'Interactive Brand Concept for Real Estate | Ovela Interactive', category: 'real_estate' },
    ],
  },
  {
    key: 'ai_ambassador',
    label: 'AI Brand Ambassador',
    description: 'Isabella capabilities, digital human interaction & ambassador demos',
    keywords: ['ambassador', 'ai host', 'digital human', 'isabella', 'interaction', 'assistant', 'chatbot', 'website host', 'virtual', 'digital model', 'digital ambassador'],
    videos: [
      { id: 'ugYmCLAqCUY', title: 'AI Website Host That Talks to Your Customers 24/7', category: 'ai_ambassador' },
      { id: 'IFbRIofRI8Y', title: 'AI Website Host That Talks to Your Clients 24/7', category: 'ai_ambassador' },
      { id: 'KKpnvS5NAnw', title: 'AI Knows Your Size Already | The Future of Smart Fashion', category: 'ai_ambassador' },
      { id: 'Rj58Doimu4o', title: 'Meet Isabella — The AI Host for the Next Generation of Websites', category: 'ai_ambassador' },
      { id: 'C9Nb85qsHiE', title: 'Most Online Platforms Still Rely on Static FAQs and Delayed Responses', category: 'ai_ambassador' },
      { id: 'xdMLb9yltZM', title: 'AI Digital Host: Transforming Online Platform Experience', category: 'ai_ambassador' },
      { id: 'LgUM7rHkxCg', title: 'Meet Isabella — Your Interactive Wellness Guide!', category: 'ai_ambassador' },
      { id: 'XkgRtTK1rOQ', title: 'Luxury Fashion Shoot with Digital Model', category: 'ai_ambassador' },
      { id: 'YT2TJnsxRW8', title: 'Businesses Are Replacing Traditional Marketing With Digital Ambassadors', category: 'ai_ambassador' },
      { id: 'yJjaPHJ279U', title: 'How To Grow Your Business with Digital Brand Ambassador', category: 'ai_ambassador' },
      { id: 'GEMVsP66NmE', title: 'Luxury in Motion Ep3 — Digital Fashion Ambassador in Action', category: 'ai_ambassador' },
      { id: 'ezP-n1yfA3s', title: 'Luxury in Motion 2 — Digital Brand Ambassador for Luxury Brands', category: 'ai_ambassador' },
      { id: 'oBifEXrA_pw', title: 'From Boardwalk to Coffee — Day to Night Style in Seconds', category: 'ai_ambassador' },
      { id: 'o-5B7YiNLSg', title: 'Digital Fitness Campaigns Simplified', category: 'ai_ambassador' },
      { id: 'MX6Hyh-1ZuI', title: 'She Speaks the World — Multilingual AI Ambassador', category: 'ai_ambassador' },
      { id: 'peKR_rmkm9c', title: 'An Editorial Moment with Our Digital Muse', category: 'ai_ambassador' },
      { id: 'HaA1ImX3dmY', title: 'Meet Isabella Navia — AI Brand Ambassador | Ovela Interactive', category: 'ai_ambassador' },
    ],
  },
  {
    key: 'studio_intro',
    label: 'Studio Overview',
    description: 'General Ovela Interactive portfolio & overview',
    keywords: ['overview', 'portfolio', 'about', 'what do you do', 'show me', 'examples', 'projects', 'work', 'general', 'studio', 'ovela'],
    videos: [
      { id: '5WKhenIQdX8', title: 'Luxury Fashion Shoot with Digital Model', category: 'studio_intro' },
      { id: 'xe-UBYYPzs8', title: 'From Beach to Boardwalk: One Model, Endless Fashion Shoots', category: 'studio_intro' },
      { id: 'w2y1V0-Bmok', title: 'Turn Any Product Into a Story | Digital Calendar Marketing', category: 'studio_intro' },
      { id: 'NbMCU2lmxnQ', title: 'Isabella — A Digital Ambassador for the Modern Brand', category: 'studio_intro' },
      { id: 'aLaMGCOR0fA', title: 'Ovela Interactive — The Future of Modeling Is Interactive', category: 'studio_intro' },
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
