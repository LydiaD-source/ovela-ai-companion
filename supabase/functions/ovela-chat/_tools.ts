// Isabella deterministic tools — pricing, ROI, wellness assessment suggestion.
// All math is done server-side so numbers are never hallucinated.

// ─── Eurostat-style annual GROSS salary benchmarks (EUR) ──────────────
// Ranges are realistic 2024-2025 medians for junior–mid level common
// front-office positions. Source: Eurostat earnings + national job boards.
// These are reference points for Isabella; she always says "approximate".
type RoleKey =
  | "receptionist"
  | "front_desk_clinic"
  | "hotel_concierge"
  | "real_estate_junior_filter"
  | "customer_support_agent"
  | "executive_assistant";

const ROLE_BASELINE: Record<RoleKey, { label: string; description: string }> = {
  receptionist:           { label: "Receptionist (general)",          description: "Front-of-house, calls, booking, basic admin." },
  front_desk_clinic:      { label: "Clinic / spa front desk",         description: "Patient intake, bookings, follow-ups." },
  hotel_concierge:        { label: "Hotel / boutique concierge",      description: "Guest service, recommendations, multilingual." },
  real_estate_junior_filter: { label: "Real-estate junior call filter", description: "Multilingual inbound qualifying — passes only relevant leads to senior agents." },
  customer_support_agent: { label: "Customer support agent",          description: "Tier-1 inbound questions, basic resolution." },
  executive_assistant:    { label: "Executive assistant",              description: "Calendar, travel, comms — senior support." },
};

// Country → role → [low, mid, high] ANNUAL GROSS in EUR.
// "ES junior receptionist ~24k" matches user's "≈2000 EUR/mo gross" note.
const SALARY: Record<string, Partial<Record<RoleKey, [number, number, number]>>> = {
  ES: { receptionist:[19000,24000,30000], front_desk_clinic:[20000,25000,31000], hotel_concierge:[22000,28000,36000], real_estate_junior_filter:[22000,26000,32000], customer_support_agent:[20000,25000,32000], executive_assistant:[28000,36000,48000] },
  PT: { receptionist:[14000,18000,23000], front_desk_clinic:[15000,19000,24000], hotel_concierge:[16000,21000,28000], real_estate_junior_filter:[17000,21000,26000], customer_support_agent:[15000,19000,25000], executive_assistant:[22000,28000,38000] },
  FR: { receptionist:[23000,28000,34000], front_desk_clinic:[24000,30000,37000], hotel_concierge:[26000,32000,42000], real_estate_junior_filter:[26000,31000,38000], customer_support_agent:[24000,29000,36000], executive_assistant:[34000,42000,55000] },
  DE: { receptionist:[28000,34000,42000], front_desk_clinic:[30000,36000,44000], hotel_concierge:[30000,37000,48000], real_estate_junior_filter:[32000,38000,46000], customer_support_agent:[30000,36000,44000], executive_assistant:[42000,52000,68000] },
  IT: { receptionist:[20000,25000,31000], front_desk_clinic:[21000,26000,32000], hotel_concierge:[22000,28000,37000], real_estate_junior_filter:[23000,28000,34000], customer_support_agent:[21000,26000,33000], executive_assistant:[30000,38000,50000] },
  NL: { receptionist:[28000,33000,40000], front_desk_clinic:[29000,35000,43000], hotel_concierge:[30000,36000,46000], real_estate_junior_filter:[31000,37000,45000], customer_support_agent:[29000,35000,43000], executive_assistant:[40000,50000,65000] },
  BE: { receptionist:[28000,33000,40000], front_desk_clinic:[29000,35000,42000], hotel_concierge:[29000,36000,46000], real_estate_junior_filter:[30000,36000,44000], customer_support_agent:[29000,35000,42000], executive_assistant:[40000,50000,64000] },
  AD: { receptionist:[22000,27000,33000], front_desk_clinic:[23000,28000,34000], hotel_concierge:[26000,32000,42000], real_estate_junior_filter:[25000,30000,37000], customer_support_agent:[22000,27000,34000], executive_assistant:[32000,40000,52000] },
  CH: { receptionist:[52000,62000,75000], front_desk_clinic:[55000,66000,80000], hotel_concierge:[58000,70000,88000], real_estate_junior_filter:[60000,72000,88000], customer_support_agent:[55000,66000,80000], executive_assistant:[75000,92000,120000] },
  UK: { receptionist:[24000,29000,36000], front_desk_clinic:[25000,30000,38000], hotel_concierge:[26000,32000,42000], real_estate_junior_filter:[27000,33000,40000], customer_support_agent:[25000,30000,38000], executive_assistant:[36000,46000,62000] },
  IE: { receptionist:[28000,33000,40000], front_desk_clinic:[29000,35000,42000], hotel_concierge:[29000,36000,46000], real_estate_junior_filter:[30000,36000,44000], customer_support_agent:[29000,35000,42000], executive_assistant:[40000,50000,64000] },
};

// Employer on-cost multiplier (taxes, social, holiday, sick). Conservative.
const EMPLOYER_ONCOST: Record<string, number> = {
  ES:1.32, PT:1.24, FR:1.42, DE:1.28, IT:1.33, NL:1.22, BE:1.35,
  AD:1.18, CH:1.18, UK:1.18, IE:1.20,
};

function pick<T>(o: Record<string, T>, k: string, fb: T): T {
  return o[k?.toUpperCase()] ?? fb;
}

export function calcReceptionistCost(args: {
  country?: string;
  role?: RoleKey;
  languages?: number;     // total languages required (1 = native only)
  shifts?: "business" | "extended" | "247";
  premium_skills?: boolean; // CRM/medical/legal vocab etc.
}) {
  const country = (args.country || "ES").toUpperCase();
  const role: RoleKey = (args.role as RoleKey) || "receptionist";
  const langs = Math.max(1, Math.min(args.languages ?? 1, 6));
  const shifts = args.shifts || "business";
  const premium = !!args.premium_skills;

  const table = SALARY[country] || SALARY.ES;
  const band = table[role] || SALARY.ES.receptionist!;
  const [lo, mid, hi] = band;

  // Bonuses (kept modest per user note — common positions don't scale wildly).
  const languageBonus = (langs - 1) * 0.05; // +5% per extra language
  const skillBonus = premium ? 0.07 : 0;
  const shiftMultiplier = shifts === "247" ? 3.2 : shifts === "extended" ? 1.6 : 1.0;
  const onCost = EMPLOYER_ONCOST[country] ?? 1.3;

  const adj = (1 + languageBonus + skillBonus) * shiftMultiplier;
  const baseGross = {
    low:   Math.round(lo  * adj),
    mid:   Math.round(mid * adj),
    high:  Math.round(hi  * adj),
  };
  const totalEmployerCost = {
    low:   Math.round(baseGross.low  * onCost),
    mid:   Math.round(baseGross.mid  * onCost),
    high:  Math.round(baseGross.high * onCost),
  };
  // Isabella's published Ovela pricing tiers (annual EUR, multi-language built in, 24/7).
  const isabellaTier = {
    starter:    4788,   // €399/mo
    pro:        9588,   // €799/mo
    enterprise: 19188,  // €1599/mo
  };
  const savingsVsMid = totalEmployerCost.mid - isabellaTier.pro;

  return {
    country, role,
    role_label: ROLE_BASELINE[role]?.label || role,
    inputs: { languages: langs, shifts, premium_skills: premium },
    annual_gross_eur: baseGross,
    annual_total_employer_cost_eur: totalEmployerCost,
    isabella_tiers_eur_per_year: isabellaTier,
    savings_vs_pro_tier_eur: savingsVsMid,
    notes: [
      "Salaries are approximate Eurostat-style mid-2025 ranges.",
      "Total employer cost includes social charges, holiday, sick, and recruitment.",
      "Extended hours ≈ 1.6×, 24/7 coverage ≈ 3.2× single FTE.",
      langs > 1 ? `Multilingual bonus applied for ${langs} languages (+${Math.round(languageBonus*100)}%).` : "Single-language role assumed.",
      "Isabella runs 24/7, every language, no sick days — published Ovela pricing shown for comparison.",
    ],
  };
}

export function calcMissedLeads(args: {
  monthly_inbound: number;
  miss_rate_pct?: number;       // % of inbounds missed (after hours, busy, language)
  conversion_rate_pct?: number; // captured-lead → customer
  avg_deal_value_eur?: number;
}) {
  const inbound = Math.max(0, Math.round(args.monthly_inbound || 0));
  const missPct = Math.min(100, Math.max(0, args.miss_rate_pct ?? 35));
  const convPct = Math.min(100, Math.max(0, args.conversion_rate_pct ?? 20));
  const deal = Math.max(0, args.avg_deal_value_eur ?? 1500);

  const missedPerMonth = Math.round(inbound * missPct / 100);
  const recoverablePerMonth = Math.round(missedPerMonth * convPct / 100);
  const monthlyRevenueLoss = Math.round(recoverablePerMonth * deal);
  const annualRevenueLoss  = monthlyRevenueLoss * 12;

  return {
    inputs: { monthly_inbound: inbound, miss_rate_pct: missPct, conversion_rate_pct: convPct, avg_deal_value_eur: deal },
    missed_inquiries_per_month: missedPerMonth,
    recoverable_customers_per_month: recoverablePerMonth,
    monthly_revenue_loss_eur: monthlyRevenueLoss,
    annual_revenue_loss_eur: annualRevenueLoss,
    isabella_pro_tier_annual_eur: 9588,
    net_annual_benefit_eur: annualRevenueLoss - 9588,
    notes: [
      "Estimates assume Isabella captures 100% of after-hours / language-blocked inbounds.",
      "Conversion rate is what your team already converts on captured leads.",
      "Numbers are directional — actual results depend on follow-up speed.",
    ],
  };
}

// ─── Wellness assessment (SUGGESTION ONLY, NOT diagnosis) ──────────────
// Maps symptom keywords to WellneSpirit package categories.
const SYMPTOM_MAP: { keywords: string[]; tag: string; suggested_package: string; rationale: string }[] = [
  { keywords:["stress","anxious","anxiety","overwhelm","tense","racing thoughts","cant relax","can't relax"],
    tag:"stress", suggested_package:"Stress Management Pack",
    rationale:"Symptoms suggest sustained sympathetic load — stress-focused therapies before any rejuvenation work." },
  { keywords:["burnout","exhausted","fatigue","drained","brain fog","no motivation","cant focus","can't focus"],
    tag:"burnout", suggested_package:"Executive Burnout Recovery Pack",
    rationale:"Pattern fits early burnout — recovery protocol takes priority over generic rejuvenation." },
  { keywords:["sleep","insomnia","wake up","cant sleep","can't sleep","tired"],
    tag:"sleep", suggested_package:"Sleep & Recovery Pack",
    rationale:"Sleep disruption flagged — recovery-first plan recommended." },
  { keywords:["pain","tension","neck","back","shoulder","stiff","sore"],
    tag:"musculoskeletal", suggested_package:"Body Therapy Pack",
    rationale:"Musculoskeletal complaints — manual + movement therapy track." },
  { keywords:["digestion","gut","bloating","stomach","ibs"],
    tag:"digestive", suggested_package:"Gut & Nutrition Assessment",
    rationale:"Digestive flags — nutrition + functional assessment recommended." },
  { keywords:["hormone","cycle","period","menopause","libido","mood swings"],
    tag:"hormonal", suggested_package:"Hormonal Balance Assessment",
    rationale:"Hormonal indicators — full assessment before targeted therapy." },
  { keywords:["skin","wrinkle","aging","glow","tone","rejuven"],
    tag:"aesthetic", suggested_package:"Aesthetic & Rejuvenation Pack",
    rationale:"Aesthetic goals — only after wellness baseline is stable." },
];

export function wellnessAssessmentSuggestion(args: {
  symptoms_text: string;
  language?: string;
}) {
  const text = (args.symptoms_text || "").toLowerCase();
  const matched: typeof SYMPTOM_MAP = [];
  for (const entry of SYMPTOM_MAP) {
    if (entry.keywords.some(k => text.includes(k))) matched.push(entry);
  }
  const primary = matched[0];
  const recommendsFullAssessment =
    matched.length === 0 || matched.length >= 3 || /chronic|months|years|every day/i.test(text);

  return {
    inputs: { symptoms_text: args.symptoms_text },
    matched_tags: matched.map(m => m.tag),
    suggested_package: primary?.suggested_package || "Full Body Wellness Assessment",
    rationale: primary?.rationale ||
      "Your description is broad — a full body wellness assessment at WellneSpirit is the right starting point.",
    recommend_full_assessment: recommendsFullAssessment,
    handoff: {
      partner: "WellneSpirit",
      message: recommendsFullAssessment
        ? "At WellneSpirit we'd suggest booking a full body assessment first — therapy packs are only built after that baseline."
        : `At WellneSpirit, Isabella can guide you to the ${primary?.suggested_package}. Most therapy packs still require an initial assessment before they start.`,
      url: "https://www.wellnespirit.com",
    },
    disclaimer:
      "This is a suggestion based on what you described — not a diagnosis. Isabella is not a medical professional. Always confirm with a qualified practitioner before starting any treatment.",
  };
}
