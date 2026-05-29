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

  // ─────────────────────────────────────────────────────────────────────
  // 6. AI CLINIC RECEPTIONIST — operational front-desk for clinics
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'ai-clinic-receptionist',
    seoTitle: 'AI Clinic Receptionist — 24/7 Front Desk for Dental, Aesthetic & Wellness Clinics | Ovela Interactive',
    seoDescription:
      'An AI clinic receptionist handles intake, booking, recall, and after-hours enquiries 24/7 — for dental, aesthetic, dermatology, longevity, and wellness clinics. See live demos.',
    h1: 'AI Clinic Receptionist — A 24/7 Front Desk For Modern Clinics',
    tagline: 'Intake, booking, recall, triage — covered every shift, in every language.',
    heroIntro:
      'A clinic receptionist is the single most expensive bottleneck in a modern practice. An AI clinic receptionist removes the bottleneck without removing the team — handling intake, booking, recall, and after-hours enquiries on every channel, in every patient language, twenty-four hours a day. Built specifically for dental, aesthetic, dermatology, longevity, and high-end wellness clinics.',
    videoKeywords: [
      'clinic', 'reception', 'receptionist', 'dental', 'aesthetic', 'dermatology',
      'longevity', 'patient', 'booking', 'intake', 'wellness', '24/7', 'after-hours',
    ],
    sections: [
      {
        heading: 'Why clinics lose more revenue at the front desk than anywhere else',
        body:
          'Most clinics measure clinical performance to two decimals and front-desk performance to nobody. Missed calls during procedures, dropped voicemails, after-hours enquiries that cool off before Monday, recall lists that never get worked — every line item is silently leaking revenue that the clinical team is working overtime to generate. An AI clinic receptionist is built specifically to plug that leak without adding a single human shift.',
      },
      {
        heading: 'What an AI clinic receptionist actually handles',
        body:
          'Inbound chat and form enquiries, appointment booking against your real PMS calendar, patient intake forms, pricing and procedure FAQs, recall and follow-up nudges, and clean escalation of anything sensitive or clinical to the right human team member. It works inside Mindbody, Doctolib, Booksy, Dentally, and most modern practice systems — and pushes every conversation into your CRM with full transcript and tags.',
      },
      {
        heading: 'Designed around clinical escalation rules',
        body:
          'The system never gives medical advice. Anything diagnostic, clinical, or sensitive is routed immediately to the right human staff member with full conversation context. Logistics — booking, pricing, procedure explanations, intake — are handled autonomously. Your team only sees the conversations that actually need them.',
      },
    ],
    subSegments: [
      { title: 'Dental clinics', body: 'Recall management, hygienist booking, treatment-plan follow-up, and after-hours enquiry capture — multilingual where you serve expat or tourist patients.' },
      { title: 'Aesthetic & dermatology', body: 'Pricing transparency, treatment menus, before-and-after FAQs, and consultation booking — without burying staff in repetitive phone calls.' },
      { title: 'Longevity & functional medicine', body: 'Programme explanation, biomarker intake, multi-step assessment booking, and structured follow-up between appointments.' },
      { title: 'Wellness & integrative clinics', body: 'Treatment recommendations, package guidance, and multilingual concierge intake for international clientele.' },
    ],
    faqs: [
      { question: 'How is an AI clinic receptionist different from a generic AI receptionist?', answer: 'It is trained specifically on clinical workflows: PMS integration, intake forms, recall, sensitive-conversation escalation, and the regulatory boundaries clinics operate under. Generic receptionists are not.' },
      { question: 'Does it integrate with our practice management system?', answer: 'Yes — Mindbody, Doctolib, Booksy, Dentally, custom PMS, and most modern booking systems integrate via API or webhook. Calendar is read live; bookings are written back as a human would.' },
      { question: 'Is it GDPR and medical-data compliant?', answer: 'All conversation data is encrypted in transit and at rest, processed in line with GDPR, never used to train third-party models, with configurable retention per clinic.' },
      { question: 'Will it replace our reception team?', answer: 'No — it removes the repetitive and after-hours load so the on-site team focuses on patients in the waiting room and complex cases.' },
      { question: 'How long does deployment take?', answer: 'Two to four weeks: knowledge ingestion, PMS integration, multilingual setup, escalation rules, staging tests, and launch.' },
      { question: 'What does it cost compared to adding a reception shift?', answer: 'A fraction of a single full-time hire while covering every shift, every channel, and every language — with payback typically inside the first quarter from captured after-hours and international enquiries.' },
    ],
    relatedServices: [
      { label: 'Clinics solution', href: '/industries/clinics', description: 'Full clinic-focused offering.' },
      { label: 'Talk to Isabella', href: '/interactive', description: 'See a clinic reception conversation live.' },
      { label: 'Pricing & deployment', href: '/pricing', description: 'How clinic deployments are scoped.' },
    ],
    relatedHubs: [
      { slug: 'ai-receptionist', label: 'AI Receptionist 24/7' },
      { slug: 'ai-patient-communication', label: 'Multilingual Patient Communication' },
      { slug: 'after-hours-lead-capture', label: 'After-Hours Lead Capture' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 7. AFTER-HOURS LEAD CAPTURE — operational pain-point authority
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'after-hours-lead-capture',
    seoTitle: 'After-Hours Lead Capture — Never Lose a Night or Weekend Enquiry Again | Ovela Interactive',
    seoDescription:
      'After-hours lead capture with an AI digital employee: greet, qualify, and book every night, weekend, and holiday enquiry — in every language. For clinics, real estate, wellness, and hospitality.',
    h1: 'After-Hours Lead Capture — Convert The Enquiries Your Team Never Sees',
    tagline: 'The leads that arrive while you sleep are the ones that cost you the most.',
    heroIntro:
      'Most businesses measure their conversion rate against the leads they answer. They never measure the leads that arrived at 22:14, on a Sunday, in German — and silently went to the competitor that answered first. An AI digital employee captures, qualifies, and books every after-hours enquiry the moment it lands, then hands a clean transcript to your team for the next working session.',
    videoKeywords: [
      'after-hours', '24/7', 'lead', 'capture', 'night', 'weekend', 'booking',
      'multilingual', 'concierge', 'receptionist', 'wellness', 'clinic', 'real estate', 'hotel',
    ],
    sections: [
      {
        heading: 'The silent cost of business hours',
        body:
          'A typical service business answers enquiries roughly 35-40% of the calendar week. The remaining 60% — nights, weekends, holidays, lunch breaks, and the moments your team is busy with the patient or guest in front of them — is the window where most premium and international enquiries actually arrive. Those enquiries do not wait. They go to the next listing, the next clinic, the next hotel.',
      },
      {
        heading: 'What "captured" actually means',
        body:
          'Not a contact form. Not a "we will get back to you Monday" autoresponder. A real conversation, in the visitor\'s own language, that greets the prospect, answers the question they actually have, qualifies budget and timeline where relevant, books the appointment against your real calendar, and pushes the full transcript into your CRM tagged for follow-up. The visitor leaves feeling helped, not parked.',
      },
      {
        heading: 'Where after-hours leakage is largest',
        body:
          'Real estate (international buyers browsing in their own timezone), clinics (patients researching late-evening after work), wellness and spa (weekend bookers comparing options), boutique hotels and hospitality (cross-timezone international travellers). In every one of these, the highest-value prospect is statistically the one most likely to arrive outside business hours.',
      },
    ],
    subSegments: [
      { title: 'Night enquiries', body: 'Every conversation between 19:00 and 08:00 captured, qualified, and booked — without an out-of-hours rota.' },
      { title: 'Weekend & holiday coverage', body: 'Saturday and Sunday enquiries handled to the same standard as a Tuesday afternoon, with the full transcript waiting Monday.' },
      { title: 'International timezone reception', body: 'Enquiries from buyers, patients, or guests in different timezones met live instead of two days later.' },
      { title: 'In-the-moment receptionist', body: 'For periods when your team is mid-treatment, mid-viewing, or mid-service — the AI fills the window so no enquiry waits on hold.' },
    ],
    faqs: [
      { question: 'How much after-hours business are we actually losing?', answer: 'Most clients are surprised. Once an AI digital employee is live, we can show real captured-conversation logs broken down by hour — typically a third to a half of qualified enquiries arrive outside standard business hours.' },
      { question: 'Does the AI actually book appointments at 3am?', answer: 'Yes. It checks live calendar availability, confirms the slot in the visitor\'s language, takes any required deposit, and pushes the booking back into your system — the same way a human team member would.' },
      { question: 'Will my team see what happened overnight?', answer: 'Yes. Every conversation lands in your CRM with full transcript, contact details, language used, and qualification tags — ready for follow-up the moment your team logs in.' },
      { question: 'What happens if someone asks something the AI cannot answer?', answer: 'Clean escalation: it captures the question, the contact details, and the context, then queues the conversation for the right human team member with a clear handoff note.' },
      { question: 'Does this work for international buyers in their own language?', answer: 'Yes. English, Spanish, French, German, Portuguese, Catalan, Italian, and Arabic out of the box — the AI greets and books in whichever language the visitor opens the conversation in.' },
      { question: 'How quickly can after-hours capture go live?', answer: 'Two to four weeks from kickoff — brand training, knowledge ingestion, multilingual setup, CRM and calendar integration, staging tests, and launch.' },
    ],
    relatedServices: [
      { label: 'Talk to Isabella', href: '/interactive', description: 'See an after-hours conversation live.' },
      { label: 'Pricing & deployment', href: '/pricing', description: 'How after-hours capture is scoped.' },
      { label: 'Clinics solution', href: '/industries/clinics', description: 'Clinic-specific after-hours coverage.' },
    ],
    relatedHubs: [
      { slug: 'ai-receptionist', label: 'AI Receptionist 24/7' },
      { slug: 'ai-property-presenter', label: 'AI Property Presenter' },
      { slug: 'multilingual-customer-communication', label: 'Multilingual Customer Communication' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 8. MULTILINGUAL CUSTOMER COMMUNICATION — Europe-wide authority
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'multilingual-customer-communication',
    seoTitle: 'Multilingual Customer Communication — AI Across 8+ European Languages | Ovela Interactive',
    seoDescription:
      'AI-powered multilingual customer communication for European businesses: native voice, video, and chat across English, Spanish, French, German, Portuguese, Catalan, Italian and Arabic — without hiring a multilingual team.',
    h1: 'Multilingual Customer Communication — One AI, Every Language Your Customers Speak',
    tagline: 'Stop losing international customers at the language barrier you never measured.',
    heroIntro:
      'European businesses operate in markets — Andorra, Luxembourg, Switzerland, Spain, France, Italy, Portugal — where premium customers routinely arrive speaking three different languages. Building a multilingual reception team for every shift is uneconomic. Building one AI digital employee that natively handles every language is not. This hub explains how multilingual AI customer communication closes the gap between addressable market and reachable market.',
    videoKeywords: [
      'multilingual', 'language', 'international', 'spanish', 'french', 'german',
      'portuguese', 'catalan', 'italian', 'arabic', 'translation', 'reception', 'concierge',
    ],
    sections: [
      {
        heading: 'The market you have versus the market you actually reach',
        body:
          'A clinic in Marbella has a Spanish-speaking team and a Russian, German, French, and British patient base. A real-estate agency in Andorra serves Catalan, Spanish, French, and English speakers in the same week. A boutique hotel in Lake Como is asked the same booking question in Italian, German, English, and Russian inside a single morning. The mismatch between team languages and customer languages is the largest silent loss most premium European businesses carry.',
      },
      {
        heading: 'Native voice — not Google Translate',
        body:
          'Multilingual AI customer communication is not a translation layer bolted onto English. Each language is trained with native phrasing, cultural register, and the polite forms expected in that market. A German enquiry receives a German answer in the formal register a premium German customer expects. A Catalan visitor in Andorra is met in Catalan, not Castellano. The difference is immediately visible in engagement and conversion data.',
      },
      {
        heading: 'Where it matters most in Europe',
        body:
          'Andorra (Catalan, Spanish, French, Portuguese, English), Luxembourg (French, German, English, Portuguese), Switzerland (German, French, Italian, English), the Costa del Sol and Balearic Islands (Spanish, English, German, Russian, Arabic), Côte d\'Azur, Lake Como, the Algarve, and luxury hospitality everywhere. For each of these, an AI multilingual representative is the difference between a leaflet and a real conversation.',
      },
    ],
    subSegments: [
      { title: 'Multilingual reception', body: 'Front-desk coverage across eight core languages without staffing every shift in every language.' },
      { title: 'International buyer reception', body: 'Real-estate-grade conversations in the buyer\'s own language, including cultural register and currency context.' },
      { title: 'Multilingual concierge', body: 'Hospitality-grade guest concierge across every guest language, with calendar and booking integration.' },
      { title: 'Cross-border lead conversion', body: 'Enquiry-to-booking flows that work natively across markets instead of funnelling everyone through English.' },
    ],
    faqs: [
      { question: 'Which languages are supported out of the box?', answer: 'English, Spanish, French, German, Portuguese, Catalan, Italian, and Arabic — with native voice, tone, and register. Additional languages such as Mandarin, Russian, or Dutch are added on request within days.' },
      { question: 'Is this just machine translation under the hood?', answer: 'No. Each language is trained with native phrasing and brand register. The system does not translate English answers — it produces native responses in each language.' },
      { question: 'Can the AI switch languages mid-conversation?', answer: 'Yes. If a visitor opens in English and switches to German, the conversation continues in German without losing context.' },
      { question: 'Does it handle regional variants (Latin American Spanish, European Portuguese, etc.)?', answer: 'Yes — regional variants are configured during onboarding based on the markets you serve.' },
      { question: 'Will it work with our existing CRM and booking system?', answer: 'Yes — multilingual conversations are pushed into your CRM with the language tagged, so follow-up can be routed to the right team member.' },
      { question: 'How is this different from hiring a multilingual receptionist?', answer: 'A single AI representative covers every language on every shift for a fraction of one multilingual hire — and never burns out on the fifth identical Russian-language enquiry of the day.' },
    ],
    relatedServices: [
      { label: 'Talk to Isabella', href: '/interactive', description: 'See multilingual switching live.' },
      { label: 'Real estate solution', href: '/industries/real-estate', description: 'International buyer reception.' },
      { label: 'Clinics solution', href: '/industries/clinics', description: 'Multilingual patient communication.' },
    ],
    relatedHubs: [
      { slug: 'ai-property-presenter', label: 'AI Property Presenter' },
      { slug: 'ai-patient-communication', label: 'Multilingual Patient Communication' },
      { slug: 'digital-concierge-hotels-spa', label: 'Digital Concierge for Hotels & Spa' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 9. AI FOR WELLNESS CLINICS — niche authority page
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'ai-for-wellness-clinics',
    seoTitle: 'AI for Wellness Clinics — Reception, Booking & Patient Communication | Ovela Interactive',
    seoDescription:
      'AI for wellness clinics: multilingual reception, programme explanation, booking, and between-session patient continuity — built for longevity, integrative, executive wellness, and high-end spa clinics.',
    h1: 'AI for Wellness Clinics — Reception, Communication & Continuity',
    tagline: 'A calm, knowledgeable digital colleague for wellness, longevity, and integrative practices.',
    heroIntro:
      'Wellness clinics live and die on the quality of patient communication. Programmes are complex, packages are layered, and clients expect a calm, knowledgeable answer at the moment curiosity strikes — not three working days later. An AI built specifically for wellness clinics holds that conversation in every language, books the consultation, and stays available between sessions as a continuity layer the clinical team simply cannot scale to.',
    videoKeywords: [
      'wellness', 'spa', 'longevity', 'clinic', 'integrative', 'recovery', 'burnout',
      'concierge', 'multilingual', 'consultation', 'programme', 'wellnespirit',
    ],
    sections: [
      {
        heading: 'Why wellness clinics need a different kind of receptionist',
        body:
          'Wellness sales rarely close on the first touch. Clients research at night, compare programmes across weeks, ask the same nuanced questions four different ways, and only book when the answers feel calm and authoritative. A traditional receptionist hands that conversation to a brochure. An AI wellness ambassador holds it — explaining protocols, surfacing the right programme, and booking the consultation the moment the client is ready.',
      },
      {
        heading: 'What it actually does for a wellness clinic',
        body:
          'Programme explanation (longevity panels, executive recovery, integrative protocols), package comparison, pricing transparency, multilingual consultation booking, intake-form pre-fill, and between-session continuity for active clients. It integrates with Mindbody, Booksy, Doctolib, and custom systems, and routes anything clinical to the right human team member.',
      },
      {
        heading: 'WellneSpirit as the proof-of-concept',
        body:
          'WellneSpirit — the executive wellness programme inside the Ovela ecosystem — uses exactly this configuration: a calm, branded AI ambassador available before, during, and between in-person retreats. It is the reference deployment for wellness clinics looking to add an always-on communication layer without hiring an after-hours team.',
      },
    ],
    subSegments: [
      { title: 'Longevity clinics', body: 'Programme explanation, biomarker FAQs, and structured booking for assessment packages.' },
      { title: 'Executive wellness clinics', body: 'Discreet, calm communication for high-performers — including pre-burnout assessment guidance.' },
      { title: 'Integrative & functional medicine', body: 'Multi-step intake, protocol explanation, and continuity between practitioners.' },
      { title: 'High-end spa & wellness resorts', body: 'Multilingual concierge for treatments, packages, and pre-arrival guest communication.' },
    ],
    faqs: [
      { question: 'Is this different from a generic AI receptionist?', answer: 'Yes — it is trained on wellness vocabulary, protocols, and the longer consideration cycle wellness sales actually follow.' },
      { question: 'Can it explain complex programmes accurately?', answer: 'Yes. Programme definitions, inclusions, contraindications, and pricing are loaded during onboarding and the AI stays strictly within that scope.' },
      { question: 'Does it give medical advice?', answer: 'No. Anything clinical is routed to qualified human staff with the full conversation transcript.' },
      { question: 'Will it work between sessions for active clients?', answer: 'Yes — many clinics use it as a continuity layer: clients can ask about their protocol, supplements, or next session without waiting for a human callback.' },
      { question: 'How does it support multilingual international clientele?', answer: 'Native English, Spanish, French, German, Portuguese, Catalan, Italian, and Arabic — with additional languages on request.' },
      { question: 'How long does deployment take for a wellness clinic?', answer: 'Two to four weeks: programme ingestion, brand voice training, multilingual setup, booking integration, staging tests, and launch.' },
    ],
    relatedServices: [
      { label: 'Wellness solution', href: '/industries/wellness', description: 'Full wellness-focused offering.' },
      { label: 'WellneSpirit', href: '/wellnessgeni', description: 'The reference executive wellness deployment.' },
      { label: 'Talk to Isabella', href: '/interactive', description: 'See a wellness consultation conversation live.' },
    ],
    relatedHubs: [
      { slug: 'executive-burnout-recovery', label: 'Executive Wellness Communication' },
      { slug: 'executive-wellness-programs', label: 'Executive Wellness Programmes' },
      { slug: 'ai-clinic-receptionist', label: 'AI Clinic Receptionist' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 10. DIGITAL CONCIERGE FOR HOTELS & SPA — hospitality opportunity
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'digital-concierge-hotels-spa',
    seoTitle: 'Digital Concierge for Hotels & Spa — Multilingual AI Guest Communication | Ovela Interactive',
    seoDescription:
      'Digital concierge for boutique hotels, spa resorts, and wellness retreats: multilingual guest communication, booking, restaurant and treatment reservations, and pre-arrival guidance — 24/7.',
    h1: 'Digital Concierge for Hotels & Spa — Multilingual Guest Communication, 24/7',
    tagline: 'Boutique hotels and spa resorts deserve a concierge that never sleeps and speaks every guest\'s language.',
    heroIntro:
      'Europe is full of boutique hotels, spa resorts, and wellness retreats with extraordinary experiences and underperforming websites. A digital concierge changes that on day one: every guest enquiry — restaurant, treatment, room, transport — handled in the guest\'s own language, twenty-four hours a day, with bookings written straight to the property system.',
    videoKeywords: [
      'concierge', 'hotel', 'spa', 'resort', 'hospitality', 'guest', 'booking',
      'reservation', 'multilingual', 'wellness', 'tourism', 'boutique',
    ],
    sections: [
      {
        heading: 'Why hospitality websites quietly underperform',
        body:
          'A guest arrives on a beautifully designed hotel site, has a specific question — Can the spa accommodate a couple at 18:00 on Friday? Is the restaurant open for non-residents? Is airport transfer included? — and finds either a contact form, a downloadable PDF, or a chatbot that loops back to a contact form. The guest closes the tab. A digital concierge replaces all of that with a calm, multilingual conversation that books the spa, confirms the restaurant, and arranges the transfer in one continuous flow.',
      },
      {
        heading: 'What a digital concierge actually does',
        body:
          'Greets every visitor in their language, answers room and rate questions, books restaurant tables, schedules spa treatments, arranges transfers and excursions, handles pre-arrival enquiries, and pushes every booking into the property management system. For boutique properties without a 24-hour human concierge, it is the difference between a closed shop and an always-open one.',
      },
      {
        heading: 'Built for European tourism',
        body:
          'Most European tourist enquiries arrive in three to five languages within a single week. A digital concierge handles every one natively — English, Spanish, French, German, Italian, Portuguese, Catalan, Arabic — and switches mid-conversation if the guest does.',
      },
    ],
    subSegments: [
      { title: 'Boutique hotels', body: 'A 24/7 multilingual concierge for properties too small to staff a human one but too premium to leave guests without one.' },
      { title: 'Spa resorts & wellness retreats', body: 'Treatment explanation, package comparison, and live booking — in every guest language.' },
      { title: 'Restaurant & F&B reservations', body: 'On-site and non-resident reservations handled natively in the guest\'s language, with calendar push to the booking system.' },
      { title: 'Pre-arrival guest communication', body: 'Pre-stay enquiries — transfers, dietary needs, special occasions — captured and confirmed before check-in.' },
    ],
    faqs: [
      { question: 'How is this different from a hotel chatbot?', answer: 'It holds a real conversation in the guest\'s language, books treatments and tables against live availability, and never loops back to a contact form. Chatbots do not.' },
      { question: 'Does it integrate with our PMS and booking systems?', answer: 'Yes — most modern hospitality PMS, restaurant booking, and spa management systems integrate via API or webhook.' },
      { question: 'Which languages does it cover for international guests?', answer: 'English, Spanish, French, German, Italian, Portuguese, Catalan, and Arabic out of the box, with additional languages on request.' },
      { question: 'Can it handle pre-arrival communication for confirmed bookings?', answer: 'Yes — pre-stay enquiries, dietary preferences, transfer requests, and special occasions are captured and surfaced to the front-of-house team before arrival.' },
      { question: 'Will it replace our human concierge or front desk?', answer: 'No — it handles the after-hours and multilingual load, freeing the on-site team to focus on guests in the lobby and complex requests.' },
      { question: 'How long does deployment take for a boutique hotel?', answer: 'Two to four weeks: brand training, services ingestion, PMS integration, multilingual setup, staging tests, and launch.' },
    ],
    relatedServices: [
      { label: 'Talk to Isabella', href: '/interactive', description: 'See a concierge conversation live.' },
      { label: 'Wellness solution', href: '/industries/wellness', description: 'For spa and wellness resorts.' },
      { label: 'Pricing & deployment', href: '/pricing', description: 'How hospitality deployments are scoped.' },
    ],
    relatedHubs: [
      { slug: 'ai-receptionist', label: 'AI Receptionist 24/7' },
      { slug: 'multilingual-customer-communication', label: 'Multilingual Customer Communication' },
      { slug: 'after-hours-lead-capture', label: 'After-Hours Lead Capture' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 11. EXECUTIVE WELLNESS PROGRAMMES — luxury wellness authority
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'executive-wellness-programs',
    seoTitle: 'Executive Wellness Programmes — Structured Recovery & Longevity for High-Performers | Ovela Interactive',
    seoDescription:
      'Executive wellness programmes for high-performers: structured burnout recovery, longevity optimisation, and AI-supported continuity care — reference deployment via WellneSpirit.',
    h1: 'Executive Wellness Programmes — Structured Recovery for High-Performers',
    tagline: 'Burnout recovery, longevity, and continuity care — designed for executives who do not have time for vague wellness.',
    heroIntro:
      'Executive wellness programmes are different from general wellness because the client is different. High-performers want measurable assessment, structured protocols, discreet delivery, and continuity that survives a packed calendar. This hub explains what a serious executive wellness programme looks like — and how an AI ambassador becomes the continuity layer between in-person sessions.',
    videoKeywords: [
      'executive', 'wellness', 'burnout', 'recovery', 'longevity', 'wellnespirit',
      'retreat', 'programme', 'high-performer', 'continuity', 'concierge',
    ],
    sections: [
      {
        heading: 'What an executive wellness programme actually contains',
        body:
          'Baseline assessment (cortisol, HRV, sleep architecture, cognitive markers, metabolic flexibility), a structured residential or hybrid recovery arc, protocol-driven movement and nutrition, restorative time in a controlled environment, and a measurable post-programme follow-up window. Not a holiday. A protocol — designed to move the client from resistance or exhaustion phase back to a sustainable performance baseline.',
      },
      {
        heading: 'The continuity problem executive programmes share',
        body:
          'The hardest part of executive wellness is not the in-person week. It is the ten weeks after, when the client returns to the same calendar that broke them, with no continuity layer between sessions. Calls go unreturned. Email is too slow. Concierge messaging apps blur the boundary. An always-on AI wellness ambassador solves the continuity problem: the client can ask about their protocol, supplement timing, or the next session at the moment the question lands.',
      },
      {
        heading: 'Why luxury and discretion matter',
        body:
          'Executive wellness is a discretion category before it is a wellness category. The communication layer has to feel as considered as the in-person experience. A calm, on-brand AI ambassador trained on the programme — not a generic chatbot — is the only multilingual continuity layer that meets that bar at scale.',
      },
    ],
    subSegments: [
      { title: 'Pre-burnout recovery', body: 'Structured intervention for high-performers in the resistance-to-exhaustion transition window — typically weeks of recovery instead of months.' },
      { title: 'Established burnout recovery', body: 'Multi-month structured recovery combining residential and at-home phases with continuity guidance throughout.' },
      { title: 'Executive longevity', body: 'Post-recovery optimisation — VO2 max, glucose, sleep, lean mass — built on a recovered baseline.' },
      { title: 'Family and partner wellness', body: 'Programme variants that include the executive\'s immediate family — recognising that recovery rarely sustains in a vacuum.' },
    ],
    faqs: [
      { question: 'How is an executive wellness programme different from a luxury spa stay?', answer: 'A spa stay is restorative time. An executive wellness programme is a measurable protocol — assessment, intervention, follow-up — designed to move specific physiological markers in a defined direction.' },
      { question: 'How long does a typical programme run?', answer: 'Pre-burnout caught early may resolve in weeks. Established burnout typically requires three to six months of structured recovery, with continued maintenance afterwards.' },
      { question: 'What role does the AI ambassador play?', answer: 'Continuity between sessions. Clients can ask about their protocol, supplement timing, next session, or pre-burnout signals at any hour — in any language — without waiting on a human callback.' },
      { question: 'Is the programme discreet?', answer: 'Yes — discretion is the design constraint. Communication, scheduling, and data are handled to a standard expected by senior executives and family offices.' },
      { question: 'Can the AI ambassador be branded for our programme?', answer: 'Yes — every deployment is custom-branded, trained on the specific programme, and stays strictly within scope. WellneSpirit is the reference deployment.' },
      { question: 'How does this fit with our existing wellness team?', answer: 'It augments — never replaces — clinical and coaching staff. The AI handles continuity, logistics, and the calm answer at 02:00; the human team handles protocol design and the in-person sessions.' },
    ],
    relatedServices: [
      { label: 'WellneSpirit', href: '/wellnessgeni', description: 'Reference executive wellness deployment.' },
      { label: 'Wellness solution', href: '/industries/wellness', description: 'Full wellness offering.' },
      { label: 'Talk to Isabella', href: '/interactive', description: 'See an executive wellness conversation live.' },
    ],
    relatedHubs: [
      { slug: 'executive-burnout-recovery', label: 'Executive Wellness Communication' },
      { slug: 'ai-for-wellness-clinics', label: 'AI for Wellness Clinics' },
      { slug: 'ai-digital-employees', label: 'AI Digital Employees — Umbrella' },
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
