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

// ─── Nutrition Assessment (deterministic targets + scoring) ──────────────
// Isabella sends the *estimated* intake numbers she derived from the meal diary
// (or a parsed document). This function returns the targets, gaps, and scores.
// All ranges are evidence-based, conservative, non-prescriptive.

type ActivityLevel = "sedentary" | "moderate" | "active" | "athlete";
type NutritionGoal = "fat_loss" | "energy" | "performance" | "muscle_maintenance" | "healthy_aging" | "longevity";

const PROTEIN_RANGE: Record<NutritionGoal, [number, number]> = {
  fat_loss:           [1.6, 2.2],
  energy:             [1.2, 1.6],
  performance:        [1.8, 2.2],
  muscle_maintenance: [1.4, 2.0],
  healthy_aging:      [1.4, 2.0],
  longevity:          [1.2, 1.8],
};

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.35,
  moderate:  1.55,
  active:    1.75,
  athlete:   1.95,
};

export function nutritionAssessment(args: {
  age?: number;
  gender?: "male" | "female" | "other";
  height_cm?: number;
  weight_kg: number;
  activity_level?: ActivityLevel;
  goal?: NutritionGoal;
  // Isabella's estimated DAILY averages from the diary:
  est_calories?: number;
  est_protein_g?: number;
  est_carbs_g?: number;
  est_fat_g?: number;
  est_hydration_l?: number;
  // Qualitative flags Isabella inferred from the diary text:
  low_protein_breakfast?: boolean;
  sugar_snacks?: boolean;
  low_vegetables?: boolean;
  high_processed?: boolean;
  irregular_meals?: boolean;
}) {
  const weight = Math.max(35, Math.min(args.weight_kg || 70, 250));
  const goal: NutritionGoal = (args.goal as NutritionGoal) || "energy";
  const activity: ActivityLevel = (args.activity_level as ActivityLevel) || "moderate";
  const gender = args.gender || "other";
  const age = args.age || 35;
  const height = args.height_cm || (gender === "female" ? 165 : 178);

  // Mifflin-St Jeor BMR, then TDEE via activity factor.
  const bmr = gender === "female"
    ? 10*weight + 6.25*height - 5*age - 161
    : 10*weight + 6.25*height - 5*age + 5;
  const tdee = Math.round(bmr * ACTIVITY_FACTOR[activity]);

  // Targets
  const [pLo, pHi] = PROTEIN_RANGE[goal];
  const proteinTarget = {
    low_g:  Math.round(weight * pLo),
    high_g: Math.round(weight * pHi),
  };
  const hydrationTargetL = Math.round((weight * 0.033) * 10) / 10; // ~33 ml/kg
  const carbTargetRange = {
    low_g:  Math.round((tdee * 0.40) / 4),
    high_g: Math.round((tdee * 0.55) / 4),
  };
  const fatTargetRange = {
    low_g:  Math.round((tdee * 0.25) / 9),
    high_g: Math.round((tdee * 0.35) / 9),
  };

  // Gaps (only if estimates provided)
  const proteinMid = (proteinTarget.low_g + proteinTarget.high_g) / 2;
  const proteinGap = args.est_protein_g != null
    ? Math.round(proteinMid - args.est_protein_g)
    : null;
  const hydrationGapL = args.est_hydration_l != null
    ? Math.round((hydrationTargetL - args.est_hydration_l) * 10) / 10
    : null;

  // Scores (0–100), gentle curves. Missing data → neutral 60.
  const score = (val: number | null, target: number, tolerance = 0.25) => {
    if (val == null) return 60;
    const ratio = val / target;
    if (ratio >= 1 - tolerance && ratio <= 1 + tolerance) return 95;
    const dist = Math.abs(1 - ratio);
    return Math.max(20, Math.round(100 - dist * 120));
  };

  const proteinScore   = score(args.est_protein_g ?? null, proteinMid, 0.2);
  const carbsScore     = args.high_processed ? 55 : score(args.est_carbs_g ?? null, (carbTargetRange.low_g + carbTargetRange.high_g)/2, 0.3);
  const fatScore       = score(args.est_fat_g ?? null, (fatTargetRange.low_g + fatTargetRange.high_g)/2, 0.3);
  const hydrationScore = score(args.est_hydration_l ?? null, hydrationTargetL, 0.2);
  const recoveryScore  = Math.max(30,
    80
    - (args.low_protein_breakfast ? 15 : 0)
    - (args.sugar_snacks ? 10 : 0)
    - (args.irregular_meals ? 10 : 0)
    - (args.low_vegetables ? 10 : 0)
  );
  const overall = Math.round(
    (proteinScore*1.3 + carbsScore + fatScore + hydrationScore + recoveryScore) / 5.3
  );

  // Improvement priorities — ordered, no diet plans, no recipes.
  const priorities: { title: string; detail: string }[] = [];
  if (args.low_protein_breakfast || (proteinGap != null && proteinGap > 20)) {
    priorities.push({
      title: "Anchor protein at breakfast",
      detail: `Aim for 30–40 g of protein within an hour of waking. This single change typically closes ~30–50% of a daily protein gap.`,
    });
  }
  if (args.sugar_snacks) {
    priorities.push({
      title: "Replace afternoon sugar snacks",
      detail: "Swap sweet snacks for a protein-forward option (yoghurt, eggs, cottage cheese, jerky, edamame). Stabilises energy through the afternoon dip.",
    });
  }
  if (hydrationGapL != null && hydrationGapL > 0.6) {
    priorities.push({
      title: `Increase hydration by ~${hydrationGapL} L/day`,
      detail: "Front-load 500 ml on waking and 500 ml between meals. Coffee and tea count partially.",
    });
  }
  if (args.low_vegetables) {
    priorities.push({
      title: "Add one vegetable-forward meal per day",
      detail: "Half a plate of vegetables at lunch or dinner improves fibre, micronutrients, and satiety without restriction.",
    });
  }
  if (priorities.length < 3 && proteinGap != null && proteinGap > 10) {
    priorities.push({
      title: "Close remaining protein gap at lunch or dinner",
      detail: `Add ~${Math.min(40, proteinGap)} g via a palm-sized protein source at your largest meal.`,
    });
  }
  while (priorities.length < 3) priorities.push({
    title: "Maintain consistency for 7 days",
    detail: "Repeat the strongest two days from this week. Consistency beats perfection.",
  });

  // 7-day action plan (improvement-only, no recipes).
  const sevenDay = [
    "Day 1 — Protein breakfast (30–40 g). Hit hydration target.",
    "Day 2 — Add one vegetable-forward meal. Repeat protein breakfast.",
    "Day 3 — Replace afternoon sugar snack with protein option.",
    "Day 4 — Front-load water (500 ml on waking + 500 ml mid-morning).",
    "Day 5 — Aim for protein at every meal (palm-sized portion).",
    "Day 6 — Repeat your best day so far. Notice energy stability.",
    "Day 7 — Light review. Keep the two habits that felt easiest.",
  ];

  return {
    inputs: { weight_kg: weight, activity_level: activity, goal, gender, age },
    targets: {
      daily_calories: tdee,
      protein_g: proteinTarget,
      carbs_g: carbTargetRange,
      fat_g: fatTargetRange,
      hydration_l: hydrationTargetL,
    },
    estimated_intake: {
      calories: args.est_calories ?? null,
      protein_g: args.est_protein_g ?? null,
      carbs_g: args.est_carbs_g ?? null,
      fat_g: args.est_fat_g ?? null,
      hydration_l: args.est_hydration_l ?? null,
    },
    gaps: {
      protein_g: proteinGap,
      hydration_l: hydrationGapL,
    },
    scores: {
      protein: proteinScore,
      carbs: carbsScore,
      fat: fatScore,
      hydration: hydrationScore,
      recovery_support: recoveryScore,
      overall_nutrition: overall,
    },
    improvement_priorities: priorities.slice(0, 3),
    seven_day_plan: sevenDay,
    disclaimer:
      "This assessment is educational and informational only. It is not a medical diagnosis and should not replace consultation with a qualified healthcare professional.",
  };
}

// ─── Biological Age Assessment (lifestyle-only, non-diagnostic) ──────────
export function biologicalAgeAssessment(args: {
  chronological_age: number;
  gender?: "male" | "female" | "other";
  height_cm?: number;
  weight_kg?: number;
  waist_cm?: number;
  sleep_hours?: number;           // average per night
  exercise_sessions_per_week?: number;
  stress_level?: number;          // 1–10
  alcohol_units_per_week?: number;
  smoking?: "never" | "former" | "current";
  energy_level?: number;          // 1–10 (self-reported)
  recovery_speed?: number;        // 1–10
  digestive_health?: number;      // 1–10
}) {
  const age = Math.max(18, Math.min(args.chronological_age || 40, 95));
  const weight = args.weight_kg;
  const height = args.height_cm;
  const bmi = (weight && height) ? weight / Math.pow(height/100, 2) : null;
  const waist = args.waist_cm;

  // Per-category scoring (0–100; higher is better)
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  // Movement
  const ex = args.exercise_sessions_per_week ?? 2;
  const movement = clamp(40 + Math.min(ex, 6) * 10); // 0→40, 6+→100

  // Sleep (target ~7–8h)
  const sl = args.sleep_hours ?? 6.5;
  const sleep = clamp(100 - Math.abs(sl - 7.5) * 18);

  // Stress (lower is better)
  const st = args.stress_level ?? 5;
  const stress = clamp(110 - st * 9);

  // Recovery (energy + recovery speed + digestion → recovery score)
  const recovery = clamp(((args.energy_level ?? 6) + (args.recovery_speed ?? 6) + (args.digestive_health ?? 6)) * (100/30));

  // Metabolic (BMI + waist)
  let metabolic = 80;
  if (bmi != null) {
    if (bmi < 18.5 || bmi > 30) metabolic -= 25;
    else if (bmi > 27) metabolic -= 15;
    else if (bmi > 25) metabolic -= 8;
  }
  if (waist != null) {
    const waistThreshold = args.gender === "female" ? 88 : 102;
    if (waist > waistThreshold) metabolic -= 15;
    else if (waist > waistThreshold - 8) metabolic -= 8;
  }
  metabolic = clamp(metabolic);

  // Lifestyle (alcohol + smoking)
  let lifestyle = 90;
  const alc = args.alcohol_units_per_week ?? 4;
  if (alc > 21) lifestyle -= 30;
  else if (alc > 14) lifestyle -= 18;
  else if (alc > 7) lifestyle -= 8;
  if (args.smoking === "current") lifestyle -= 30;
  else if (args.smoking === "former") lifestyle -= 8;
  lifestyle = clamp(lifestyle);

  // Nutrition placeholder (educational; user may not have done nutrition tool)
  const nutrition = 67;

  const longevityIndex = clamp(
    (movement*1.1 + sleep*1.2 + stress*1.1 + recovery*1.0 + metabolic*1.0 + lifestyle*1.1 + nutrition*0.5) / 7.0
  );

  // Map longevity index → biological age delta.
  // Index 50 ≈ same as chronological. Each 10 points away ≈ ±3 years (capped ±10).
  const delta = Math.max(-10, Math.min(10, Math.round((50 - longevityIndex) / 10 * 3)));
  const biologicalAge = age + delta;

  // Identify weakest contributors (lowest 3 scores).
  const cats = [
    { key: "Sleep", score: sleep },
    { key: "Stress", score: stress },
    { key: "Movement", score: movement },
    { key: "Recovery", score: recovery },
    { key: "Metabolic Health", score: metabolic },
    { key: "Lifestyle (alcohol/smoking)", score: lifestyle },
  ].sort((a, b) => a.score - b.score);

  const weakest = cats.slice(0, 3);
  const priorities = weakest.map(w => {
    switch (w.key) {
      case "Sleep": return { title: "Increase sleep consistency", detail: "Anchor a fixed wake time and target 7.5 h in bed. The single biggest longevity lever for most adults." };
      case "Stress": return { title: "Lower baseline stress load", detail: "Add 10 min/day of slow breathing or a daily walk. Reduces sympathetic load measurably within 2–3 weeks." };
      case "Movement": return { title: "Add 2 movement sessions per week", detail: "Mix one strength session and one zone-2 cardio session. Strength is the most underused longevity input." };
      case "Recovery": return { title: "Improve recovery scheduling", detail: "Protect one full rest day and one walk-only day per week. Recovery is where adaptation actually happens." };
      case "Metabolic Health": return { title: "Tighten metabolic markers", detail: "Focus on waist circumference and post-meal walks. Metabolic flexibility tracks closely with biological age." };
      case "Lifestyle (alcohol/smoking)": return { title: "Reduce alcohol load", detail: "Target ≤ 7 units/week. The fastest single lifestyle change for most reversible markers." };
      default: return { title: w.key, detail: "Targeted improvement opportunity." };
    }
  });

  // Projections (gentle, motivational, capped)
  const proj6 = Math.max(-5, Math.round(delta * 0.4));   // up to 40% of delta in 6 mo
  const proj12 = Math.max(-7, Math.round(delta * 0.7));  // up to 70% in 12 mo
  const projection6 = age + Math.min(delta, proj6);
  const projection12 = age + Math.min(delta, proj12);

  return {
    inputs: {
      chronological_age: age,
      bmi: bmi ? Math.round(bmi * 10) / 10 : null,
      waist_cm: waist ?? null,
    },
    chronological_age: age,
    estimated_biological_age: biologicalAge,
    difference_years: delta,
    scores: {
      recovery,
      stress,
      movement,
      sleep,
      metabolic,
      lifestyle,
      nutrition,
      longevity_index: longevityIndex,
    },
    strongest_contributors: weakest.map(w => w.key),
    improvement_priorities: priorities,
    projection: {
      six_months_estimated_age: projection6,
      twelve_months_estimated_age: projection12,
      note: "Projections assume consistent application of the priorities above. Educational estimate only.",
    },
    disclaimer:
      "This assessment is educational and informational only. It is not a medical assessment, diagnosis, or substitute for laboratory testing. Please confirm with a qualified healthcare professional before changing routines.",
  };
}
