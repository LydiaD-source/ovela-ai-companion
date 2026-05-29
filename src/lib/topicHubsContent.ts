/**
 * Tier-3 SEO: Topic Hub deep pages.
 *
 * Five authority hubs that anchor the site's most commercially valuable
 * keyword clusters. Each hub is a long-form page with:
 *   - 600-900 words of original prose (sectioned)
 *   - 8-10 long-tail FAQs (FAQPage schema)
 *   - Curated set of related videos pulled by keyword match
 *   - Industry sub-segments (clinics, hotels, etc.)
 *   - Related services + Isabella CTA
 *
 * Hubs:
 *   1. ai-receptionist           — cross-industry, highest priority
 *   2. executive-burnout-recovery — WellneSpirit authority engine
 *   3. ai-property-presenter     — real estate niche
 *   4. ai-patient-communication  — clinics, multilingual reception
 *   5. ai-digital-employees      — umbrella authority page
 *
 * Video selection happens at render time via matchVideosForHub() — keyword
 * matching against ALL_VIDEOS so new YouTube uploads automatically slot in.
 */

import { ALL_VIDEOS, EnrichedVideo } from './videoLibrary';

export interface HubSection {
  heading: string;
  body: string;
}

export interface HubFAQ {
  question: string;
  answer: string;
}

export interface HubSubSegment {
  title: string;
  body: string;
}

export interface RelatedHubService {
  label: string;
  href: string;
  description: string;
}

export interface TopicHub {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  tagline: string;             // shown under H1
  heroIntro: string;           // 2-3 sentence lead
  videoKeywords: string[];     // case-insensitive match against title + tags
  sections: HubSection[];      // long-form body sections
  subSegments: HubSubSegment[]; // industry sub-segments
  faqs: HubFAQ[];
  relatedServices: RelatedHubService[];
  relatedHubs: { slug: string; label: string }[];
}

export const TOPIC_HUBS: TopicHub[] = [
  // ─────────────────────────────────────────────────────────────────────
  // 1. AI RECEPTIONIST — highest priority cross-industry hub
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'ai-receptionist',
    seoTitle: 'AI Receptionist 24/7 — Multilingual Virtual Front Desk | Ovela Interactive',
    seoDescription:
      'An AI receptionist answers calls, captures leads, and books appointments 24/7 in every language — for clinics, hotels, spas, real estate, and more. See live demos.',
    h1: 'AI Receptionist — A 24/7 Multilingual Front Desk For Any Business',
    tagline: 'Always on. Every language. A fraction of the cost of a human team.',
    heroIntro:
      'An AI receptionist is a real-time digital employee that greets every visitor, answers every question, books appointments, and routes qualified leads to your team — twenty-four hours a day, in every language your customers actually speak. It works on your website, on your booking page, and inside your existing tools. No scripts, no menu trees, no missed calls.',
    videoKeywords: [
      'receptionist', 'reception', 'concierge', '24/7', 'host', 'after-hours',
      'multilingual', 'booking', 'appointment', 'front desk', 'ambassador',
      'wellness', 'spa', 'clinic', 'hotel',
    ],
    sections: [
      {
        heading: 'Why traditional reception is the most expensive bottleneck in your business',
        body:
          'A human front desk costs between thirty and seventy thousand euros per year per shift, is unavailable nights and weekends, only speaks one or two languages, and burns out under repetitive enquiries. Every missed call is a lost booking. Every after-hours form submission cools off before anyone responds. International visitors silently leave when the language switch is too clumsy. Multiply that across a year and the silent revenue leak is larger than the salary it would take to fix it.',
      },
      {
        heading: 'What an AI receptionist actually does',
        body:
          'It answers the phone, the website chat, the WhatsApp message, and the booking widget — in whatever language the visitor opens the conversation in. It pulls availability from your calendar, confirms appointments, takes deposits where relevant, captures contact details, and pushes everything into your CRM the moment the conversation ends. It hands off to a human the moment the conversation needs one. It never sleeps, never gets tired of the same five questions, and never makes the visitor wait on hold.',
      },
      {
        heading: 'A fraction of the cost of a human counterpart',
        body:
          'A single AI receptionist runs across every channel, every shift, every language, for the cost of a part-time hire. Most clients see payback inside the first quarter — not from staff replacement, but from the after-hours and international bookings the human team was never positioned to capture in the first place. The human team gets to focus on in-person guests and high-value conversations instead of being buried in scheduling.',
      },
      {
        heading: 'How deployment actually works',
        body:
          'Two to four weeks, end to end. Week one is brand voice and knowledge ingestion: services, pricing, FAQs, tone, booking rules. Week two is multilingual setup and CRM integration. Week three is live testing on a staging widget. Week four is launch on your real website. No replatforming, no rebuild. The receptionist embeds as a lightweight widget on WordPress, Shopify, Squarespace, custom builds, or as a standalone booking page.',
      },
    ],
    subSegments: [
      {
        title: 'AI receptionist for clinics',
        body: 'Patient intake, appointment booking, insurance pre-check, multilingual triage, and after-hours enquiry capture — without adding staff. Particularly valuable for aesthetic, dental, dermatology, longevity, and wellness clinics with international clientele.',
      },
      {
        title: 'AI receptionist for hotels & hospitality',
        body: 'Guest enquiries, room availability, restaurant reservations, spa bookings, and concierge requests in every guest language. Especially powerful for boutique hotels and resorts whose front desk cannot cover every shift in every language.',
      },
      {
        title: 'AI receptionist for spas & wellness centres',
        body: 'Treatment explanations, package recommendations, booking confirmations, and pre-arrival instructions — all in the guest\'s native language, day or night.',
      },
      {
        title: 'AI receptionist for real estate agencies',
        body: 'Buyer qualification, viewing booking, listing enquiries, and international buyer reception. Routes serious prospects directly to the right agent with the full conversation transcript.',
      },
      {
        title: 'AI receptionist for beauty & aesthetic businesses',
        body: 'Treatment menus, pricing transparency, before-and-after FAQs, and instant booking — perfect for high-volume aesthetic clinics where the phone never stops ringing.',
      },
      {
        title: 'Multilingual AI receptionist',
        body: 'Native voice and tone across English, Spanish, French, German, Portuguese, Catalan, Italian, and Arabic out of the box. Additional languages are available on request and added within days, not weeks.',
      },
    ],
    faqs: [
      { question: 'What exactly is an AI receptionist?', answer: 'An AI receptionist is a real-time interactive digital employee — voice, video, and chat — that handles the same front-desk responsibilities as a human receptionist: greeting visitors, answering questions, booking appointments, capturing leads, and routing complex requests to your team. It runs on your website and connects to your booking system and CRM.' },
      { question: 'How is an AI receptionist different from a chatbot?', answer: 'A chatbot follows scripted decision trees and breaks the moment a visitor asks something off-script. An AI receptionist holds a real conversation in natural language, understands intent, remembers context, and stays in your brand voice across any topic it has been trained on. It also speaks fluently across languages — chatbots usually do not.' },
      { question: 'Can the AI receptionist actually book appointments?', answer: 'Yes. It connects to your calendar or booking system (Calendly, Mindbody, Booksy, custom PMS, etc.), checks live availability, confirms the slot, and pushes the booking the same way a human team member would.' },
      { question: 'What does an AI receptionist cost compared to a human receptionist?', answer: 'A full-time human receptionist in Europe typically costs between 30,000 and 70,000 euros per year per shift. An AI receptionist deployment is a one-time setup fee plus a monthly subscription that covers hosting, model usage, multilingual support, and ongoing updates — usually a fraction of a single human salary while covering every shift, every channel, and every language.' },
      { question: 'Which languages does the AI receptionist support?', answer: 'Out of the box: English, Spanish, French, German, Portuguese, Catalan, Italian, and Arabic — with native voice and tone in each. Additional languages can be added on request within days.' },
      { question: 'Does the AI receptionist replace our reception team?', answer: 'No. It handles the repetitive and after-hours load — typically the majority of incoming enquiries — so your team focuses on in-person guests, complex requests, and high-value conversations. Most clients report a significant drop in routine inbound calls within the first month.' },
      { question: 'Will it work with our existing website and booking system?', answer: 'Yes. The AI receptionist embeds as a lightweight widget on any website — WordPress, Shopify, Squarespace, custom builds — and integrates with most modern booking systems and CRMs via standard APIs or webhooks.' },
      { question: 'How long does deployment take?', answer: 'Typical deployment is two to four weeks: brand voice training, knowledge ingestion, multilingual setup, CRM and calendar integration, staging tests, and launch.' },
      { question: 'How does the AI receptionist handle complex or sensitive requests?', answer: 'It captures the lead, takes a clean transcript, and routes the conversation to the right human team member with full context. For sensitive cases (medical questions, complaints, refunds) it follows escalation rules you define during onboarding.' },
      { question: 'Is the conversation data secure and GDPR compliant?', answer: 'Yes. All conversation data is encrypted in transit and at rest, processed in line with GDPR, and never used to train third-party models. Data retention is configurable per client.' },
    ],
    relatedServices: [
      { label: 'Talk to Isabella live', href: '/interactive', description: 'Experience an AI receptionist conversation right now.' },
      { label: 'Clinics solution', href: '/industries/clinics', description: 'Reception + intake for medical and aesthetic clinics.' },
      { label: 'Wellness & spa solution', href: '/industries/wellness', description: 'Concierge and booking for spas and wellness centres.' },
      { label: 'Pricing & deployment', href: '/pricing', description: 'How AI receptionists are scoped and priced.' },
    ],
    relatedHubs: [
      { slug: 'ai-patient-communication', label: 'AI Patient Communication for Clinics' },
      { slug: 'ai-digital-employees', label: 'AI Digital Employees — Umbrella' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 2. EXECUTIVE BURNOUT RECOVERY — WellneSpirit authority engine
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'executive-burnout-recovery',
    seoTitle: 'Executive Wellness Communication — AI for Burnout Recovery & Longevity Clinics | Ovela Interactive',
    seoDescription:
      'AI-powered communication for executive wellness clinics and longevity programmes: burnout phases, pre-burnout signals, structured recovery, and the always-on AI ambassador that guides high-performers between sessions.',
    h1: 'Executive Wellness Communication — AI for Burnout Recovery & Longevity Clinics',
    tagline: 'The stress phases, the recovery system, and the AI ambassador that keeps high-performers in the game.',
    heroIntro:
      'Executive wellness clinics and longevity programmes share one operational problem: the highest-value clients arrive with detailed questions at the worst possible times — late at night, between flights, the morning after a bad week. This hub explains the science of burnout, the structured recovery used by programmes like WellneSpirit, and how an always-on AI ambassador becomes the communication layer that keeps executives engaged between in-person sessions.',
    videoKeywords: [
      'burnout', 'stress', 'recovery', 'wellness', 'wellnespirit', 'longevity',
      'executive', 'fatigue', 'mental health', 'spa', 'reset', 'restorative',
    ],
    sections: [
      {
        heading: 'The three phases of stress — and where most executives ignore the warning',
        body:
          'Hans Selye\'s general adaptation syndrome describes three phases: alarm (the body mobilises), resistance (the body adapts and performs), and exhaustion (the body breaks down). Executives spend years in the resistance phase, mistaking adaptation for resilience. Sleep shortens. Recovery windows disappear. Cognitive flexibility narrows. By the time exhaustion arrives, the runway to recover without intervention is short. Recognising the transition between resistance and exhaustion — the pre-burnout window — is the single most valuable diagnostic in executive wellness.',
      },
      {
        heading: 'Pre-burnout signals high-performers learn to ignore',
        body:
          'Persistent morning fatigue that coffee no longer fixes. Loss of patience over things that previously rolled off. Sleep that no longer feels restorative even at eight hours. A rising inability to disconnect, even on holiday. Subtle cognitive slowing — forgetting names, losing the thread mid-meeting, re-reading the same email three times. None of these signals is dramatic on its own. Stacked together over a quarter, they are a clinical warning that the resistance phase is collapsing.',
      },
      {
        heading: 'Structured executive recovery — what actually works',
        body:
          'Recovery from chronic stress is structural, not motivational. It requires assessment (baseline cortisol, HRV, sleep architecture, cognitive markers), removal of the load (calendar, sleep environment, stimulants), and active restoration (movement protocols, breath work, nutritional rebuilding, targeted restorative time in a controlled environment). Programmes like WellneSpirit compress this into structured residential or hybrid retreats with measurable pre- and post- markers — not a holiday, a protocol.',
      },
      {
        heading: 'The role of AI ambassadors in executive wellness',
        body:
          'High-performers do not engage with generic wellness content. They engage with calm, intelligent guidance available the moment a question lands — at night, between meetings, mid-flight. AI ambassadors built for wellness programmes (like Isabella) explain phases, walk users through self-assessment, recommend the right intervention, and book consultations without forcing the user through a contact form. The result is a wellness brand that meets executives in their actual workflow instead of their imagined free time.',
      },
      {
        heading: 'Longevity is downstream of recovery',
        body:
          'The longevity conversation — VO2 max, glucose response, sleep architecture, lean mass — depends on a recovered baseline. An executive in exhaustion phase cannot meaningfully optimise longevity markers. Burnout recovery is the prerequisite, not a parallel track. Structured executive wellness programmes treat the two as a single arc.',
      },
    ],
    subSegments: [
      {
        title: 'Pre-burnout assessment',
        body: 'Structured self-assessment and clinical markers that distinguish high-performance stress from collapse-stage exhaustion. The earlier the signal is caught, the shorter the recovery arc.',
      },
      {
        title: 'Chronic fatigue & restoration',
        body: 'Multi-week structured restoration combining sleep, movement, nutrition, and targeted restorative time — typically in a controlled wellness environment.',
      },
      {
        title: 'Executive longevity',
        body: 'Post-recovery optimisation: cardiovascular base, metabolic flexibility, cognitive performance, and sleep quality — built on a recovered foundation, not on top of an exhausted one.',
      },
      {
        title: 'WellneSpirit programme',
        body: 'Structured executive wellness retreats and AI-supported continuity care, blending in-person protocols with an always-on AI ambassador for between-stay guidance.',
      },
    ],
    faqs: [
      { question: 'What is the difference between stress and burnout?', answer: 'Stress is the body\'s short-term response to demand. Burnout is the chronic state that follows prolonged stress without adequate recovery — characterised by exhaustion, cynicism, and reduced effectiveness. Burnout is structural; stress is episodic.' },
      { question: 'What are the early signs of executive burnout?', answer: 'Morning fatigue unchanged by sleep or caffeine, loss of patience and motivation, inability to disconnect on holiday, subtle cognitive slowing, and a creeping sense that nothing is restorative anymore. Individually mild — collectively a clinical warning.' },
      { question: 'Can you recover from burnout without taking time off?', answer: 'Mild stress overload responds to lifestyle changes alongside work. True burnout — sustained exhaustion phase — typically requires a structured recovery period away from the trigger environment to allow the nervous and endocrine systems to reset.' },
      { question: 'How long does executive burnout recovery take?', answer: 'Varies widely. Pre-burnout caught early may resolve in weeks. Established burnout with measurable physiological impact typically requires three to six months of structured recovery, with continued maintenance afterwards.' },
      { question: 'What is the WellneSpirit programme?', answer: 'WellneSpirit is a structured executive wellness programme combining in-person restorative retreats with always-on AI-supported continuity care. It targets pre-burnout, chronic fatigue, and longevity optimisation for high-performers.' },
      { question: 'How does AI support burnout recovery?', answer: 'An AI wellness ambassador is available between sessions to answer questions, reinforce protocols, walk users through self-assessment, and surface the right educational content at the moment it lands — without forcing the user into a generic chatbot or a contact form.' },
      { question: 'Is burnout the same as depression?', answer: 'They overlap but are not identical. Burnout is occupationally rooted and tends to lift when the load is removed; clinical depression is a medical condition that persists independently of context and requires medical care.' },
      { question: 'What is "pre-burnout" and why does it matter?', answer: 'Pre-burnout is the transition window between the resistance and exhaustion phases of chronic stress. Catching it here means weeks of recovery instead of months. Most high-performers miss it because the signals look like normal high-output life.' },
    ],
    relatedServices: [
      { label: 'WellneSpirit', href: '/wellnessgeni', description: 'Executive wellness programme and AI ambassador.' },
      { label: 'Wellness industry page', href: '/industries/wellness', description: 'AI ambassadors for wellness brands.' },
      { label: 'Talk to Isabella', href: '/interactive', description: 'Ask our AI ambassador anything about wellness or burnout.' },
    ],
    relatedHubs: [
      { slug: 'ai-digital-employees', label: 'AI Digital Employees — Umbrella' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 3. AI PROPERTY PRESENTER — real estate niche
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'ai-property-presenter',
    seoTitle: 'AI Property Presenter — Multilingual 24/7 Real Estate Agent | Ovela Interactive',
    seoDescription:
      'An AI property presenter walks every buyer through every listing in their own language, qualifies leads, and routes serious prospects to your agents — 24/7.',
    h1: 'AI Property Presenter — The 24/7 Multilingual Listing Agent',
    tagline: 'Every listing. Every buyer. Every language. Every hour.',
    heroIntro:
      'An AI property presenter is a real-time digital agent that walks every buyer through every listing in your portfolio — answering questions, qualifying intent, and routing only serious prospects to your team. It speaks the buyer\'s language, works through the night, and never asks for a callback.',
    videoKeywords: [
      'property', 'real estate', 'listing', 'buyer', 'agent', 'presenter',
      'tour', 'home', 'apartment', 'villa', 'house', 'multilingual',
      'international', 'after-hours',
    ],
    sections: [
      {
        heading: 'The two leads real estate agencies lose most often',
        body:
          'International buyers and after-hours enquiries. International buyers arrive at your portal in their own language, find a contact form in yours, and quietly leave. After-hours enquiries land in an inbox that nobody opens until Monday — by which point the buyer has booked a viewing with the agency that answered first. Both losses are silent. Neither shows up in your CRM as a missed opportunity. Both are larger than most agencies realise.',
      },
      {
        heading: 'What an AI property presenter actually does',
        body:
          'It greets the visitor on the listing page, narrates the property, answers detailed questions about square footage, neighbourhood, schools, transport, pricing, and availability, and switches between listings the moment the buyer\'s interest shifts. It qualifies the buyer — budget, timeline, financing — using the same diagnostic questions a junior agent would. Qualified prospects are routed straight to the right agent with the full conversation transcript attached.',
      },
      {
        heading: 'Built for international buyers',
        body:
          'A buyer browsing Marbella villas from Düsseldorf does not want a German PDF — they want a real conversation, in German, the moment they open the listing. The presenter handles English, Spanish, French, German, Portuguese, Catalan, Italian, and Arabic out of the box, with native voice and tone in each. International buyers stop bouncing. Agencies stop quietly accepting a language barrier they never measured.',
      },
      {
        heading: 'How it connects to your listings',
        body:
          'We ingest your active portfolio — directly from your website, MLS feed, or property management system — so the presenter knows every property in real time. New listings appear in the conversation the moment they go live. Sold listings drop out automatically. The agent team never updates a single file.',
      },
    ],
    subSegments: [
      {
        title: 'Multilingual property presentation',
        body: 'Native voice across eight core languages, with additional languages added on request. Every buyer, every listing, every language — without a translator on staff.',
      },
      {
        title: 'After-hours lead capture',
        body: 'The presenter is awake when your agents are not. Weekend and evening enquiries — historically your highest-loss window — are captured, qualified, and queued for the agent\'s next working session.',
      },
      {
        title: 'International buyer reception',
        body: 'A first-touch experience designed specifically for cross-border buyers: native language, currency context, timezone awareness, and the cultural register international clients expect.',
      },
      {
        title: 'Lead qualification & routing',
        body: 'Budget, timeline, financing readiness, and viewing intent qualified before the lead ever reaches an agent. Each qualified prospect arrives with a clean transcript and routing tag.',
      },
    ],
    faqs: [
      { question: 'How does an AI property presenter qualify leads?', answer: 'It asks the same diagnostic questions a junior agent would — budget, location, timeline, financing readiness — and only forwards prospects who meet your criteria, with the full conversation transcript attached.' },
      { question: 'Can it present specific properties from our listing portfolio?', answer: 'Yes. We ingest your active listings (or sync via your MLS / portal feed) so the presenter knows every property in your portfolio and can switch between them mid-conversation.' },
      { question: 'Which languages does it support for international buyers?', answer: 'English, Spanish, French, German, Portuguese, Catalan, Italian, and Arabic out of the box. Additional languages such as Mandarin or Russian are added on request.' },
      { question: 'Does the presenter replace virtual tours and floor plans?', answer: 'No — it augments them. The presenter narrates the tour, answers questions about what the buyer is looking at, and contextualises floor plans instead of leaving the visitor to figure them out alone.' },
      { question: 'How are leads delivered to our agents?', answer: 'Real-time push to email and your CRM (HubSpot, Salesforce, Pipedrive, custom) the moment a qualified lead completes the conversation — with full transcript, contact details, and interest tags.' },
      { question: 'Will it work with our existing real estate website?', answer: 'Yes. The presenter embeds as a lightweight widget on any agency website or portal, and can be added to individual listing pages or to the homepage.' },
      { question: 'How long does deployment take for an agency?', answer: 'Two to four weeks from kickoff: brand training, listings ingestion, multilingual setup, CRM integration, and launch.' },
      { question: 'How much does an AI property presenter cost compared to extra agents?', answer: 'A single AI presenter covers every listing, every language, every shift. The investment is a fraction of a single agent salary while covering ground no single agent could — particularly nights, weekends, and non-native languages.' },
    ],
    relatedServices: [
      { label: 'Real estate solution', href: '/industries/real-estate', description: 'Detailed real estate offering and case studies.' },
      { label: 'Talk to Isabella', href: '/interactive', description: 'See a presenter-style conversation live.' },
      { label: 'Pricing & deployment', href: '/pricing', description: 'How presenters are scoped and priced.' },
    ],
    relatedHubs: [
      { slug: 'ai-receptionist', label: 'AI Receptionist 24/7' },
      { slug: 'ai-digital-employees', label: 'AI Digital Employees — Umbrella' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 4. AI PATIENT COMMUNICATION — clinics & multilingual reception
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'ai-patient-communication',
    seoTitle: 'Multilingual Patient Communication — AI for International Clinic Patients | Ovela Interactive',
    seoDescription:
      'Multilingual AI patient communication for clinics with international patients: native-language intake, triage, consultation prep, and follow-up across English, Spanish, French, German, Portuguese, Catalan, Italian and Arabic.',
    h1: 'Multilingual Patient Communication',
    tagline: 'Every patient, in their own language — without hiring a multilingual team for every shift.',
    heroIntro:
      'Aesthetic, dental, longevity, and high-end wellness clinics increasingly serve international patients — and increasingly lose them at the first contact form they cannot read. Multilingual AI patient communication closes that gap: native-language intake, treatment explanations, consultation prep, and follow-up across the eight European languages that matter most, day or night, without expanding the human team.',
    videoKeywords: [
      'clinic', 'patient', 'medical', 'dental', 'aesthetic', 'dermatology',
      'longevity', 'wellness', 'reception', 'multilingual', 'booking',
      'concierge', 'consultation', 'spa',
    ],
    sections: [
      {
        heading: 'The three problems every clinic shares',
        body:
          'First — staff overload. Reception teams spend most of their day answering the same fifteen questions about prices, availability, and procedures, leaving no bandwidth for the patients actually in the waiting room. Second — multilingual barriers. International patients arrive needing English, German, French, Russian, or Arabic; most clinic teams cover one or two languages well. Third — after-hours leakage. Enquiries land overnight or on weekends and cool off before anyone responds. Each of these is solvable individually. An AI patient communication system solves all three at once.',
      },
      {
        heading: 'What AI patient communication actually does',
        body:
          'It greets every visitor on the clinic website and chat in their language, explains procedures, gives indicative pricing, books consultations against your real calendar, handles intake forms and pre-consultation questionnaires, and routes complex or sensitive cases to the right human team member. It follows escalation rules you define — anything medical or sensitive is handed off cleanly, with full context.',
      },
      {
        heading: 'Why multilingual matters more than clinics admit',
        body:
          'For aesthetic, dental, longevity, and high-end wellness clinics, a large share of high-value patients are international. A clinic that handles enquiries in only one language is invisible to a meaningful slice of its addressable market. AI patient communication makes "multilingual reception" a default rather than a premium feature — without hiring native speakers for every shift.',
      },
      {
        heading: 'A fraction of the cost of expanding reception',
        body:
          'Adding a second or third reception shift in two or three languages is rarely viable economically. An AI patient communication layer covers every shift in every language for a fraction of the cost of a single hire, while freeing the human team to focus on the patients in front of them. The financial case is rarely close.',
      },
    ],
    subSegments: [
      {
        title: 'AI reception for dental clinics',
        body: 'Appointment booking, recall management, treatment FAQs, and multilingual patient intake — particularly valuable for dental practices serving international or expat patients.',
      },
      {
        title: 'AI reception for aesthetic & dermatology clinics',
        body: 'Pricing transparency, treatment menus, before-and-after explanations, and intake for consultations — with the multilingual reach high-end aesthetic clinics depend on.',
      },
      {
        title: 'AI reception for longevity & wellness clinics',
        body: 'Programme explanations, multi-step intake, biomarker FAQs, and structured booking for assessment packages — without burdening clinical staff with repetitive enquiries.',
      },
      {
        title: 'Multilingual AI patient intake',
        body: 'Native English, Spanish, French, German, Portuguese, Catalan, Italian, and Arabic. Patients self-serve at any hour without waiting for a multilingual team member.',
      },
      {
        title: 'After-hours patient enquiries',
        body: 'Captured, triaged, and queued instead of lost. Especially valuable for clinics whose patient base spans timezones or works irregular hours.',
      },
    ],
    faqs: [
      { question: 'Is AI patient communication compliant with medical regulations?', answer: 'Conversation data is encrypted in transit and at rest, processed in line with GDPR, and never used to train third-party models. Escalation rules ensure clinical questions are routed to qualified human staff rather than answered autonomously by the AI.' },
      { question: 'Will the AI give medical advice?', answer: 'No. By design it does not give diagnostic or treatment advice. It explains procedures, handles logistics (booking, pricing, intake), and routes any clinical question to your team.' },
      { question: 'Can it integrate with our clinic\'s booking and PMS system?', answer: 'Yes. Most modern practice management systems and booking platforms (Mindbody, Booksy, Doctolib, custom) integrate via standard APIs or webhooks. Calendar availability is read live; bookings are pushed back the same way a human receptionist would create them.' },
      { question: 'How does it handle sensitive or emergency situations?', answer: 'Escalation rules defined during onboarding ensure sensitive cases (emergencies, complaints, clinical questions) are routed immediately to the right human team member, with the full conversation transcript attached.' },
      { question: 'Which clinic types benefit most?', answer: 'Aesthetic, dental, dermatology, longevity, fertility, and high-end wellness clinics — particularly those with international or multilingual patient bases or high after-hours enquiry volume.' },
      { question: 'Does it replace our reception team?', answer: 'No. It handles the repetitive and after-hours load — typically the bulk of incoming enquiries — so the on-site team focuses on patients in the waiting room, complex cases, and the human moments AI cannot replicate.' },
      { question: 'How long does deployment take for a clinic?', answer: 'Two to four weeks: knowledge ingestion (services, pricing, FAQs, escalation rules), multilingual setup, PMS integration, staging tests, and launch.' },
      { question: 'How is patient conversation data stored?', answer: 'Encrypted in transit and at rest, with configurable retention policies per clinic, and full GDPR alignment. Transcripts are accessible only to authorised clinic staff.' },
    ],
    relatedServices: [
      { label: 'Clinics solution', href: '/industries/clinics', description: 'Full clinic-focused offering.' },
      { label: 'Wellness solution', href: '/industries/wellness', description: 'For wellness and longevity practices.' },
      { label: 'Talk to Isabella', href: '/interactive', description: 'See a patient-reception conversation live.' },
    ],
    relatedHubs: [
      { slug: 'ai-receptionist', label: 'AI Receptionist 24/7' },
      { slug: 'executive-burnout-recovery', label: 'Executive Burnout Recovery' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 5. AI DIGITAL EMPLOYEES — umbrella authority hub
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'ai-digital-employees',
    seoTitle: 'AI Digital Employees For Business — Custom AI Workforce | Ovela Interactive',
    seoDescription:
      'AI digital employees represent your brand, answer every visitor, and capture every lead — in every language, 24/7. The umbrella guide: what they are, how they work, ROI, and use cases.',
    h1: 'AI Digital Employees — The Modern Workforce For Any Business',
    tagline: 'Custom AI representatives, deployed in weeks, at a fraction of the cost of human counterparts.',
    heroIntro:
      'An AI digital employee is a real-time interactive representative — voice, video, and chat — custom-trained on your brand, your services, and your tone. It greets every visitor, answers every question, books appointments, captures qualified leads, and works in every language your customers speak. It is the modern equivalent of a top human hire, available twenty-four hours a day, at a fraction of the cost.',
    videoKeywords: [
      'digital employee', 'ambassador', 'isabella', 'ai host', 'website',
      '24/7', 'multilingual', 'concierge', 'representative', 'interactive',
    ],
    sections: [
      {
        heading: 'What an AI digital employee actually is',
        body:
          'Not a chatbot. Not a script. A real-time conversational representative — voice, video, and natural-language chat — that lives on your website and represents your brand the way a top human hire would. It is trained on your services, your tone, and your goals, and stays strictly within the scope you define. Visitors talk to it the way they would talk to a knowledgeable team member, get answers in their own language, and complete the action they came for.',
      },
      {
        heading: 'How AI digital employees work',
        body:
          'Three layers. First, a knowledge layer ingests your services, pricing, FAQs, policies, and any reference documents. Second, a brand layer captures your tone, voice, and escalation rules. Third, a delivery layer renders the employee as a real-time widget on your website, integrated with your CRM, calendar, and booking systems. The result is a representative that speaks for your brand, captures every lead, and never goes off-script.',
      },
      {
        heading: 'Which industries benefit most',
        body:
          'Any business where visitors arrive with detailed pre-purchase questions, where after-hours enquiries currently go unanswered, or where international visitors silently churn at the language barrier. In practice: real estate, wellness and spa, hospitality, clinics (dental, aesthetic, longevity), luxury retail, automotive, financial services, and education. The common thread is high consideration plus high silent loss — exactly the gap an AI digital employee closes.',
      },
      {
        heading: 'Return on investment',
        body:
          'A single AI digital employee replaces multiple shifts of human capacity across every language and every channel for a fraction of one salary. The ROI rarely comes from staff reduction — it comes from the revenue your existing setup quietly leaks: after-hours enquiries, weekend leads, non-native visitors, and the repetitive questions burning out your front-line team. Most clients see payback inside the first quarter.',
      },
      {
        heading: 'How AI digital employees differ from chatbots and static websites',
        body:
          'A static website broadcasts. A chatbot follows a decision tree. An AI digital employee holds a conversation. It understands intent, remembers context across the conversation, switches languages mid-sentence, and stays in brand voice across any topic it has been trained on. The difference shows up immediately in engagement time, conversion rates, and lead quality.',
      },
      {
        heading: 'How deployment works',
        body:
          'Two to four weeks from kickoff to live. Brand training, knowledge ingestion, multilingual setup, CRM and booking integration, staging tests, launch. No replatforming, no rebuild, no long enterprise procurement cycle. The employee embeds as a widget on your existing website.',
      },
    ],
    subSegments: [
      {
        title: 'AI ambassadors for brands',
        body: 'On-brand digital representatives for luxury, lifestyle, and consumer brands — turning passive websites into live conversations.',
      },
      {
        title: 'AI receptionists for clinics, hotels & spas',
        body: 'Multilingual front-desk coverage across every shift, every channel, for a fraction of the cost of expanding human reception.',
      },
      {
        title: 'AI property presenters for real estate',
        body: 'Listing-aware presenters that walk every buyer through every property in their own language, 24/7.',
      },
      {
        title: 'AI wellness ambassadors',
        body: 'Calm, knowledgeable representatives for wellness, longevity, and executive recovery programmes — including the WellneSpirit programme.',
      },
      {
        title: 'Custom AI employees for any business',
        body: 'Scoped, trained, and deployed for industries beyond the standard verticals — financial services, automotive, education, professional services.',
      },
    ],
    faqs: [
      { question: 'What is an AI digital employee?', answer: 'A real-time interactive representative — voice, video, and chat — custom-trained on your brand, services, and tone. It represents your business on your website twenty-four hours a day in every language you support.' },
      { question: 'How is an AI digital employee different from a chatbot?', answer: 'Chatbots follow scripted decision trees and break the moment a visitor asks something off-script. An AI digital employee holds a real conversation in natural language, understands intent, remembers context, and stays in your brand voice across any topic it has been trained on.' },
      { question: 'How much does an AI digital employee cost compared to a human hire?', answer: 'A one-time deployment fee plus a monthly subscription — typically a fraction of a single full-time salary while covering every shift, every channel, and every language. The ROI almost always comes from captured-but-previously-lost revenue rather than staff reduction.' },
      { question: 'Which industries do AI digital employees work best in?', answer: 'Real estate, wellness and spa, hospitality, clinics (dental, aesthetic, longevity), luxury retail, automotive, financial services, and education. Any business with high-consideration buyers and silent after-hours or multilingual loss.' },
      { question: 'How long does it take to deploy an AI digital employee?', answer: 'Two to four weeks: brand training, knowledge ingestion, multilingual setup, CRM and booking integration, staging tests, and launch.' },
      { question: 'Can an AI digital employee integrate with our existing tools?', answer: 'Yes. Standard integrations with major CRMs (HubSpot, Salesforce, Pipedrive), calendars and booking systems (Calendly, Mindbody, Doctolib), and custom systems via API or webhook.' },
      { question: 'Will the AI stay in our brand voice?', answer: 'Yes. Brand voice, tone, scope, and escalation rules are defined during onboarding. The employee stays strictly within scope and is updated whenever your brand evolves.' },
      { question: 'What languages are supported?', answer: 'English, Spanish, French, German, Portuguese, Catalan, Italian, and Arabic out of the box. Additional languages are added on request within days.' },
      { question: 'Is the conversation data secure and GDPR compliant?', answer: 'Yes. All conversation data is encrypted in transit and at rest, processed in line with GDPR, never used to train third-party models, with configurable retention per client.' },
      { question: 'How does an AI digital employee differ from a static website?', answer: 'A static website tells visitors things. An AI digital employee has a conversation with them, adapts to what each visitor actually needs, captures every qualified lead, and turns a brochure-style site into a real revenue channel.' },
    ],
    relatedServices: [
      { label: 'Talk to Isabella', href: '/interactive', description: 'Meet our flagship AI digital employee.' },
      { label: 'Our projects', href: '/projects', description: 'Case studies across industries.' },
      { label: 'Pricing & deployment', href: '/pricing', description: 'How deployments are scoped.' },
      { label: 'Partner with us', href: '/partner', description: 'For agencies and resellers.' },
    ],
    relatedHubs: [
      { slug: 'ai-receptionist', label: 'AI Receptionist 24/7' },
      { slug: 'ai-property-presenter', label: 'AI Property Presenter' },
      { slug: 'ai-patient-communication', label: 'AI Patient Communication' },
      { slug: 'executive-burnout-recovery', label: 'Executive Burnout Recovery' },
    ],
  },
];

export function getTopicHubBySlug(slug: string): TopicHub | undefined {
  return TOPIC_HUBS.find((h) => h.slug === slug);
}

/** Pick videos from the full library whose title/tags match this hub's keywords. */
export function matchVideosForHub(hub: TopicHub, limit = 9): EnrichedVideo[] {
  const kws = hub.videoKeywords.map((k) => k.toLowerCase());
  const scored = ALL_VIDEOS.map((v) => {
    const hay = (v.title + ' ' + v.tags.join(' ') + ' ' + v.description).toLowerCase();
    const score = kws.reduce((acc, k) => acc + (hay.includes(k) ? 1 : 0), 0);
    return { v, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.v.viewCount - a.v.viewCount);
  return scored.slice(0, limit).map((x) => x.v);
}
