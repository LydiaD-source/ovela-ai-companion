/**
 * Video SEO content generators
 * - Category-aware industry context paragraphs
 * - Semantic reinforcement copy (80-120 word block)
 * - Category-specific FAQs (used for FAQPage JSON-LD + on-page accordion)
 *
 * NOTE: copy is templated but varied via category + title to avoid duplicate-content flags.
 */

export interface FAQItem {
  question: string;
  answer: string;
}

interface CategorySEO {
  industryContext: string;          // 1-2 sentences, industry framing
  semanticTopics: string[];         // converted from hashtag chips into a prose list
  reinforcement: (title: string) => string;  // 80-120 word block
  faqs: FAQItem[];                  // 4-5 long-tail Q&As
}

const SERIES_LINE =
  'This content is part of the Ovela Interactive series on AI digital employees, multilingual brand ambassadors, and always-on customer communication.';

export const CATEGORY_SEO: Record<string, CategorySEO> = {
  interactive_marketing: {
    industryContext:
      'AI digital employees help luxury brands, retailers, and creative studios present products, tell brand stories, and engage visitors in real time — far beyond traditional ad formats.',
    semanticTopics: [
      'interactive marketing', 'brand storytelling', 'AI digital host',
      'luxury campaigns', 'digital ambassador', 'creative direction', 'conversion'
    ],
    reinforcement: (title) =>
      `Modern audiences expect brands to respond, guide, and personalise — not just broadcast. "${title}" shows how an AI digital employee transforms a static campaign into a live conversation that adapts to each visitor's intent, language, and curiosity. Instead of relying on banner ads or generic chatbots, brands deploy an always-on ambassador that explains the product, answers objections, and captures qualified leads at the exact moment of interest. The result is measurably stronger engagement, longer session times, and a measurable lift in qualified inbound enquiries. ${SERIES_LINE}`,
    faqs: [
      { question: 'What is an AI digital ambassador?', answer: 'An AI digital ambassador is a real-time interactive host — voice, video, and chat — that represents your brand on your website 24/7, answers visitor questions in any language, and captures qualified leads directly into your CRM.' },
      { question: 'How does interactive video improve marketing performance?', answer: 'Interactive video lets the viewer ask questions, get personalised answers, and take action without leaving the page. Engagement time typically increases 3–5x compared to static video, and conversion rates rise because visitors get the exact information they need to decide.' },
      { question: 'Can an AI brand ambassador replace traditional advertising?', answer: 'It does not replace top-of-funnel advertising, but it dramatically improves the conversion stage. Paid traffic that lands on a page with an AI ambassador converts at a much higher rate because visitors get instant, conversational answers instead of reading static pages.' },
      { question: 'How long does it take to deploy an AI ambassador?', answer: 'Typical deployment is two to four weeks: brand voice training, knowledge ingestion, multilingual setup, CRM integration, and live testing. The system goes live as a widget on any existing website without rebuilding it.' },
      { question: 'Which industries benefit most from interactive AI marketing?', answer: 'Real estate, wellness, hospitality, luxury retail, automotive, and any business where visitors have detailed pre-purchase questions and where after-hours enquiries currently go unanswered.' },
    ],
  },

  wellness_spa: {
    industryContext:
      'Wellness centres, spas, clinics, and hospitality brands lose bookings every night when their team is offline. An AI digital concierge greets visitors, explains treatments, and captures bookings around the clock — in the guest\'s own language.',
    semanticTopics: [
      'wellness', 'spa concierge', 'AI booking assistant', 'client retention',
      'treatment guidance', 'multilingual hospitality', 'after-hours bookings'
    ],
    reinforcement: (title) =>
      `Most wellness and hospitality websites still rely on static menus and contact forms — losing the visitor at the exact moment of curiosity. "${title}" demonstrates how an AI concierge replaces that friction with a calm, on-brand conversation: explaining treatments, recommending packages, handling pricing questions, and booking appointments without a human ever picking up the phone. International guests are welcomed in their native language, after-hours enquiries are captured instead of lost, and the on-site team is freed from repetitive questions. ${SERIES_LINE}`,
    faqs: [
      { question: 'How does an AI spa concierge handle bookings?', answer: 'It walks the guest through available treatments, checks availability against your booking system, confirms the slot, and pushes the lead or confirmation directly into your CRM or PMS in real time.' },
      { question: 'Can the AI concierge speak multiple languages?', answer: 'Yes — out of the box it handles English, Spanish, French, German, Portuguese, Catalan, Italian, and Arabic, with native-feel voice and tone in each.' },
      { question: 'Does an AI concierge replace the front-desk team?', answer: 'No. It handles repetitive enquiries and after-hours traffic so your team can focus on in-person guests and high-value conversations. Most clients report a significant reduction in incoming calls within the first month.' },
      { question: 'How does the AI know our treatments and pricing?', answer: 'During onboarding we ingest your service menu, pricing, FAQs, and brand voice. Updates can be pushed at any time — the AI reflects them instantly across all languages.' },
      { question: 'Will it work on our existing website?', answer: 'Yes. The AI concierge embeds as a lightweight widget on any website — WordPress, Shopify, Squarespace, custom builds — without rebuilding the site.' },
    ],
  },

  real_estate: {
    industryContext:
      'Real estate agencies lose international buyers and after-hours leads every day. An AI property presenter walks every visitor through every listing, answers detailed questions, and qualifies leads in the buyer\'s native language — 24 hours a day.',
    semanticTopics: [
      'real estate', 'AI property presenter', 'virtual property tours',
      'lead qualification', 'multilingual agent', 'luxury listings', '24/7 enquiries'
    ],
    reinforcement: (title) =>
      `Buyers research properties at night, on weekends, and across time zones — long after agents have logged off. "${title}" shows how an AI property presenter fills that gap: presenting listings interactively, answering questions about square footage, neighbourhood, pricing, and availability, and routing qualified buyers straight to the agent's inbox. International prospects are engaged in their own language, removing the silent friction that loses agencies foreign business. Agents stop repeating the same tour ten times a week and focus on closing. ${SERIES_LINE}`,
    faqs: [
      { question: 'How does an AI real estate agent qualify leads?', answer: 'It asks the qualifying questions a junior agent would — budget, location, timeline, financing readiness — and only forwards prospects who meet your criteria, with the full conversation transcript attached.' },
      { question: 'Can the AI present specific properties from our listing portfolio?', answer: 'Yes. We ingest your active listings (or sync via your MLS / portal feed) so the AI presenter knows every property in your portfolio and can switch between them mid-conversation.' },
      { question: 'Does the AI work for international buyers?', answer: 'Yes — multilingual is built in. We commonly deploy English, Spanish, French, German, Arabic, and Mandarin for agencies with international clients.' },
      { question: 'Can it replace virtual tours and floor plans?', answer: 'It augments them. The AI presenter narrates the tour, answers questions about what the buyer is looking at, and contextualises the floor plan instead of leaving the visitor to figure it out alone.' },
      { question: 'How are leads delivered to our agents?', answer: 'Real-time email and CRM push (HubSpot, Salesforce, Pipedrive, custom) the moment a qualified lead completes the conversation, with full transcript and contact details.' },
    ],
  },

  ai_ambassador: {
    industryContext:
      'An AI brand ambassador is the new front door of a modern website — greeting every visitor, answering every question, and capturing every qualified lead, in any language, at any hour.',
    semanticTopics: [
      'AI brand ambassador', 'digital human', 'website host', 'multilingual AI',
      'real-time interaction', 'voice and video AI', 'lead capture'
    ],
    reinforcement: (title) =>
      `Static websites belong to the previous decade. "${title}" demonstrates how an AI brand ambassador turns a passive page into a real conversation — voice, video, and natural language — that meets each visitor where they are. Instead of forcing them to dig through menus, the ambassador greets them, understands their goal, and guides them to the right answer or the right action. Every interaction is logged, every lead is qualified, and every language is supported natively. ${SERIES_LINE}`,
    faqs: [
      { question: 'What makes an AI brand ambassador different from a chatbot?', answer: 'Chatbots follow scripted decision trees. An AI ambassador holds a real conversation — voice, video, and free-form chat — understands intent, remembers context, and responds in the brand\'s voice across any topic it has been trained on.' },
      { question: 'How is the ambassador trained on our brand?', answer: 'We ingest your website, product information, FAQs, tone guidelines, and any reference documents. The ambassador then speaks in your brand voice and stays strictly within your scope.' },
      { question: 'Does the ambassador work on mobile?', answer: 'Yes — fully responsive, with optimised voice and video performance on mobile networks.' },
      { question: 'Can the ambassador hand off to a human?', answer: 'Yes. When a conversation requires human follow-up, the ambassador captures the lead, sends a transcript to your team, and can schedule a callback directly.' },
      { question: 'Is the conversation data secure?', answer: 'All conversation data is encrypted in transit and at rest, processed in compliance with GDPR, and never used to train third-party models.' },
    ],
  },

  studio_intro: {
    industryContext:
      'Ovela Interactive builds AI digital employees and brand ambassadors for clinics, real estate agencies, wellness centres, hospitality, and luxury retail — turning websites into always-on revenue channels.',
    semanticTopics: [
      'Ovela Interactive', 'AI studio', 'digital ambassador portfolio',
      'interactive brand experiences', 'multilingual AI', 'case studies'
    ],
    reinforcement: (title) =>
      `Ovela Interactive designs and deploys AI digital employees that represent brands the way a top human host would — only available 24/7, in every language, at scale. "${title}" is part of a portfolio spanning real estate, wellness, hospitality, and luxury retail, showing what becomes possible when a website stops being a brochure and starts being a conversation. Every deployment is custom-trained on the client's brand voice, services, and goals, then integrated directly into the existing site and CRM. ${SERIES_LINE}`,
    faqs: [
      { question: 'What does Ovela Interactive actually build?', answer: 'We build AI digital employees: interactive voice + video + chat ambassadors that live on a client\'s website, represent the brand, answer questions, and capture leads in real time, in any language.' },
      { question: 'Which industries do you work with?', answer: 'Real estate, wellness and spa, hospitality, clinics, luxury retail, and any business losing leads after hours or struggling with multilingual visitors.' },
      { question: 'How long is a typical deployment?', answer: 'Two to four weeks from kickoff to live: brand training, knowledge ingestion, multilingual setup, CRM integration, and QA.' },
      { question: 'Do you offer a pilot or trial?', answer: 'Yes — we run scoped pilots so clients can validate engagement and lead quality before a full rollout.' },
      { question: 'How is pricing structured?', answer: 'A one-time deployment fee plus a monthly subscription that covers hosting, model usage, language support, and ongoing brand updates.' },
    ],
  },
};

export function getCategorySEO(categoryKey: string): CategorySEO {
  return CATEGORY_SEO[categoryKey] || CATEGORY_SEO.studio_intro;
}

/** Convert hashtag-style tags into a clean prose sentence */
export function buildTopicsSentence(tags: string[], fallbackTopics: string[]): string {
  const source = (tags && tags.length > 0 ? tags : fallbackTopics)
    .map((t) => t.replace(/[#_-]+/g, ' ').trim().toLowerCase())
    .filter((t) => t.length > 1 && t.length < 40);
  // Dedupe, cap at 10
  const unique = Array.from(new Set(source)).slice(0, 10);
  if (unique.length === 0) return '';
  return `Topics covered: ${unique.join(', ')}.`;
}
