/**
 * Category landing page metadata — URL slugs, SEO copy, related services.
 * One entry per VIDEO_CATEGORIES key. Powers /videos/category/:slug pages.
 */

export interface RelatedService {
  label: string;
  href: string;        // relative path, prefixed with lang in component
  description: string;
}

export interface CategoryMeta {
  slug: string;        // URL slug
  key: string;         // matches VIDEO_CATEGORIES.key
  seoTitle: string;
  seoDescription: string;
  h1: string;
  intro: string;       // 2-3 sentences shown under H1
  longIntro: string;   // 100-150 word topical authority paragraph
  relatedServices: RelatedService[];
}

export const CATEGORY_META: CategoryMeta[] = [
  {
    slug: 'interactive-marketing',
    key: 'interactive_marketing',
    seoTitle: 'Interactive Marketing Videos — AI Brand Ambassadors | Ovela Interactive',
    seoDescription: 'Watch how AI digital ambassadors transform luxury marketing, brand storytelling, and digital campaigns into live, multilingual conversations that convert.',
    h1: 'Interactive Marketing With AI Digital Ambassadors',
    intro: 'See how brands are replacing static campaigns with always-on AI ambassadors — voice, video, and chat that respond in any language, on any device, around the clock.',
    longIntro:
      'Interactive marketing is no longer a buzzword — it is the difference between a website that broadcasts and a website that converts. Below you will find demos of AI brand ambassadors deployed for luxury fashion, lifestyle, retail, and concept-driven campaigns. Each one shows the same underlying capability: a real-time digital host that greets the visitor, explains the brand, answers objections, and captures qualified leads at the exact moment of interest. Visitors stay longer, brands gain measurable attribution, and creative directors finally get a campaign asset that adapts to its audience instead of waiting for the next print run.',
    relatedServices: [
      { label: 'Talk to Isabella', href: '/interactive', description: 'Live conversation with our AI ambassador.' },
      { label: 'Pricing & deployment', href: '/pricing', description: 'How AI ambassadors are scoped and priced.' },
      { label: 'Our projects', href: '/projects', description: 'Case studies across luxury, wellness, and real estate.' },
    ],
  },
  {
    slug: 'wellness-spa',
    key: 'wellness_spa',
    seoTitle: 'AI Concierge For Wellness, Spa & Hospitality Videos | Ovela Interactive',
    seoDescription: 'Demos of multilingual AI concierges for spas, wellness centres, hotels, and clinics — handling bookings, FAQs, and treatment guidance 24/7.',
    h1: 'AI Concierges For Wellness, Spa & Hospitality',
    intro: 'Most wellness and hospitality bookings are lost after hours, on weekends, or in languages your front desk does not speak. An AI concierge fixes all three.',
    longIntro:
      'Wellness centres, spas, clinics, and hotels share the same silent revenue leak: visitors arrive curious, find a static menu, and leave. The demos below show what changes when a calm, on-brand AI concierge replaces that friction — guiding guests through treatments, answering pricing and availability questions, recommending packages, and capturing bookings in the guest\'s own language. International clientele are welcomed natively, after-hours enquiries are converted instead of forgotten, and the on-site team is freed from repetitive phone calls and emails. Most clients report a measurable drop in incoming routine calls within the first month of deployment.',
    relatedServices: [
      { label: 'Wellness industry page', href: '/industries/wellness', description: 'Detailed wellness & spa solution overview.' },
      { label: 'Clinic AI receptionist', href: '/industries/clinics', description: 'For medical clinics and practices.' },
      { label: 'Talk to Isabella', href: '/interactive', description: 'Experience an AI concierge live.' },
    ],
  },
  {
    slug: 'real-estate',
    key: 'real_estate',
    seoTitle: 'AI Property Presenter Videos For Real Estate | Ovela Interactive',
    seoDescription: 'Watch AI property presenters qualify leads, present listings, and speak every buyer\'s language — 24/7 demos for real estate agencies.',
    h1: 'AI Property Presenters For Real Estate Agencies',
    intro: 'International buyers and after-hours enquiries are the two leads agencies lose most often. An AI property presenter captures both — interactively, in any language.',
    longIntro:
      'Real estate is increasingly international, increasingly digital, and increasingly impatient. Buyers expect to explore a listing the moment curiosity strikes — at night, on weekends, in their own language, without waiting for an agent callback. The demos below show AI property presenters doing exactly that: walking buyers through listings, answering detailed questions about square footage, neighbourhood, pricing, and availability, qualifying intent, and routing only serious prospects to your team with the full conversation transcript attached. Agents stop repeating the same tour twenty times a week and focus on closings. Agencies stop losing international buyers to the language barrier they quietly accepted.',
    relatedServices: [
      { label: 'Real estate industry page', href: '/industries/real-estate', description: 'AI presenter solution for agencies.' },
      { label: 'Pricing & deployment', href: '/pricing', description: 'Typical scope, timeline, and investment.' },
      { label: 'Talk to Isabella', href: '/interactive', description: 'See a presenter conversation live.' },
    ],
  },
  {
    slug: 'ai-ambassador',
    key: 'ai_ambassador',
    seoTitle: 'AI Brand Ambassador Demos — Isabella By Ovela Interactive',
    seoDescription: 'Meet Isabella and other AI brand ambassadors: voice, video, and multilingual chat for any website. See real-time digital human demos.',
    h1: 'AI Brand Ambassadors — Voice, Video & Multilingual Chat',
    intro: 'An AI brand ambassador is the modern front door of a website — greeting every visitor, in every language, at every hour, without a script.',
    longIntro:
      'The demos below introduce Isabella and the wider family of AI ambassadors built by Ovela Interactive. Each one is custom-trained on the client\'s brand voice, services, and tone — then deployed as a real-time conversational host on the client\'s own website. Voice, video, and natural-language chat work together: visitors ask anything, get an answer in their own language, and complete the action they came for. Chatbots follow scripts; ambassadors hold conversations. The difference shows up in engagement time, conversion rates, and the quality of leads delivered straight into the client\'s CRM.',
    relatedServices: [
      { label: 'Talk to Isabella live', href: '/interactive', description: 'A real conversation with our ambassador.' },
      { label: 'About Ovela', href: '/about', description: 'How we build AI digital employees.' },
      { label: 'Partner with us', href: '/partner', description: 'For agencies and reseller partners.' },
    ],
  },
  {
    slug: 'studio-overview',
    key: 'studio_intro',
    seoTitle: 'Ovela Interactive Studio Overview — AI Digital Employee Portfolio',
    seoDescription: 'Studio overview from Ovela Interactive: portfolio demos across real estate, wellness, hospitality, and luxury retail AI ambassadors.',
    h1: 'Ovela Interactive — Studio Overview',
    intro: 'A condensed look at what Ovela Interactive builds: AI digital employees that represent brands the way a top human host would, only available 24/7 in every language.',
    longIntro:
      'Ovela Interactive designs and deploys AI digital employees for clinics, real estate agencies, wellness centres, hospitality, and luxury retail. The studio overview clips below give a fast cross-section of the portfolio: brand ambassadors, property presenters, spa concierges, and interactive campaign hosts. Every deployment starts with brand training and knowledge ingestion, then plugs directly into the client\'s existing website and CRM — typically live within two to four weeks.',
    relatedServices: [
      { label: 'See full portfolio', href: '/projects', description: 'Case studies and detailed project pages.' },
      { label: 'Pricing', href: '/pricing', description: 'How deployments are scoped.' },
      { label: 'Contact us', href: '/contact', description: 'Start a conversation about your project.' },
    ],
  },
];

export function getCategoryMetaBySlug(slug: string): CategoryMeta | undefined {
  return CATEGORY_META.find((c) => c.slug === slug);
}

export function getCategorySlugByKey(key: string): string | undefined {
  return CATEGORY_META.find((c) => c.key === key)?.slug;
}
