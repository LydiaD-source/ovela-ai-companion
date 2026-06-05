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

// ─── Nutrition Assessment (PRO v2) ────────────────────────────────────
// Executive-wellness model. Practical & longevity-focused, NOT bodybuilding.
//
// Key v2 logic:
//   • Calculation weight = TARGET weight when BMI > 28 and goal = fat_loss
//     (estimated at BMI 24 if user did not supply target_weight_kg).
//   • Age / gender modifiers raise protein for adults 45+ and post-menopausal women.
//   • Carbs, fat, hydration are all g per kg of calculation weight.
//   • Adds: protein distribution score, weekly protein gap, 30g food swaps,
//     vegetarian variants, "fastest win" highlight, muscle preservation reasons.

type ActivityLevel = "sedentary" | "moderate" | "active" | "athlete";
type NutritionGoal =
  | "fat_loss" | "muscle_gain" | "performance"
  | "healthy_aging" | "energy" | "longevity" | "recovery"
  | "muscle_maintenance" | "maintenance";
type DietType = "omnivore" | "vegetarian" | "vegan";

// Conservative executive-wellness protein g/kg of CALCULATION weight.
// Aligned with WHO + ISSN ranges for regular adults (1.2–1.8 g/kg) and
// athletes / muscle-building (1.6–2.2 g/kg). Executives are NOT bodybuilders —
// targets are tuned for compliance and digestion (≤ 40 g per meal × 3 meals).
const PROTEIN_RANGE: Record<NutritionGoal, [number, number]> = {
  fat_loss:           [1.75, 2.0],   // protect lean mass in deficit
  muscle_gain:        [1.6, 2.2],    // ISSN upper range
  performance:        [1.4, 1.8],
  muscle_maintenance: [1.2, 1.6],
  healthy_aging:      [1.0, 1.4],
  energy:             [1.0, 1.4],
  longevity:          [1.0, 1.4],
  recovery:           [1.2, 1.6],
  maintenance:        [1.0, 1.4],
};

// Carbs g/kg of calculation weight by goal.
const CARB_RANGE: Record<NutritionGoal, [number, number]> = {
  fat_loss:           [2.0, 3.0],
  muscle_gain:        [4.0, 5.0],
  performance:        [4.0, 6.0],
  muscle_maintenance: [3.0, 4.0],
  healthy_aging:      [3.0, 4.0],
  energy:             [3.0, 4.0],
  longevity:          [3.0, 4.0],
  recovery:           [3.0, 4.0],
  maintenance:        [3.0, 4.0],
};

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.35, moderate: 1.55, active: 1.75, athlete: 1.95,
};

const PROTEIN_SOURCES: Record<DietType, string[]> = {
  omnivore: ["Eggs", "Greek yogurt", "Chicken breast", "Turkey", "Lean beef", "Fish (salmon, cod, tuna)", "Cottage cheese", "Whey protein"],
  vegetarian: ["Greek yogurt", "Cottage cheese", "Eggs", "Tofu", "Tempeh", "Edamame", "Lentils", "Whey or casein protein"],
  vegan: ["Tofu", "Tempeh", "Edamame", "Lentils", "Chickpeas", "Soy milk", "Pea protein", "Seitan"],
};

// "Add 30g protein — choose ONE" actionable options.
const THIRTY_G_SWAPS: Record<DietType, string[]> = {
  omnivore: [
    "150 g chicken breast",
    "1 scoop whey + 200 g Greek yogurt",
    "200 g cottage cheese",
    "4 eggs + 100 g Greek yogurt",
    "150 g tuna or salmon",
  ],
  vegetarian: [
    "1 scoop whey + 200 g Greek yogurt",
    "250 g cottage cheese",
    "4 eggs + 100 g Greek yogurt",
    "200 g tempeh",
    "300 g Greek yogurt + 30 g nuts",
  ],
  vegan: [
    "1.5 scoops pea protein",
    "200 g tempeh",
    "250 g firm tofu",
    "200 g edamame + 1 scoop pea protein",
    "150 g seitan",
  ],
};

const VEGETARIAN_ALTS = ["Greek yogurt", "Cottage cheese", "Eggs", "Tempeh", "Tofu", "Edamame", "Lentils", "Whey/casein protein"];

function filterByDislikes<T extends string>(list: T[], dislikes: string[]): T[] {
  if (!dislikes?.length) return list;
  const dl = dislikes.map(d => d.toLowerCase());
  const filtered = list.filter(item => !dl.some(d => item.toLowerCase().includes(d)));
  return filtered.length ? filtered : list;
}

function buildMealFramework(diet: DietType, dailyProteinG: number, dislikes: string[] = [], preferred: string[] = []) {
  const meals = [
    { meal: "Breakfast", pct: 0.30, cap: 40 },
    { meal: "Lunch",     pct: 0.30, cap: 40 },
    { meal: "Snack",     pct: 0.15, cap: 25 },
    { meal: "Dinner",    pct: 0.30, cap: 40 },
  ];
  const ex: Record<DietType, Record<string, string[]>> = {
    omnivore: {
      Breakfast: ["3 eggs + Greek yogurt + berries (~30-35 g)", "Cottage cheese + oats + whey (~30 g)", "Smoked salmon + 2 eggs + rye toast (~30 g)"],
      Lunch:     ["Grilled chicken bowl, quinoa, vegetables, olive oil (~35-40 g)", "Tuna and white-bean salad + greens (~35 g)", "Turkey wrap with hummus and vegetables (~35 g)"],
      Snack:     ["Cottage cheese + nuts (~15-20 g)", "Whey shake + fruit (~20 g)", "Greek yogurt + seeds (~15 g)"],
      Dinner:    ["Salmon + sweet potato + greens (~35-40 g)", "Lean beef stir-fry + brown rice (~40 g)", "Roast chicken thighs + roast vegetables (~40 g)"],
    },
    vegetarian: {
      Breakfast: ["Greek yogurt + oats + whey or seeds (~30 g)", "Cottage cheese + berries + nuts (~30 g)", "3-egg vegetable omelette + rye toast (~30 g)"],
      Lunch:     ["Tofu or tempeh grain bowl + vegetables (~35 g)", "Halloumi + chickpea + grain salad (~35 g)", "Paneer + lentil curry + brown rice (~35 g)"],
      Snack:     ["Cottage cheese + fruit (~15-20 g)", "Casein shake (~20 g)", "Greek yogurt + nuts (~15 g)"],
      Dinner:    ["Lentil and paneer stew + brown rice + salad (~35 g)", "Tempeh stir-fry + quinoa + greens (~35 g)", "Bean and cheese enchiladas + salad (~35 g)"],
    },
    vegan: {
      Breakfast: ["Soy yogurt + oats + pea-protein shake (~30 g)", "Tofu scramble + sourdough + avocado (~30 g)", "Overnight oats + soy milk + pea protein (~30 g)"],
      Lunch:     ["Tempeh or seitan grain bowl + edamame (~35 g)", "Chickpea and quinoa salad + tahini (~30 g)", "Lentil + brown rice bowl + tofu (~35 g)"],
      Snack:     ["Roasted chickpeas + pea-protein shake (~15-20 g)", "Soy yogurt + seeds (~15 g)", "Edamame + nuts (~15 g)"],
      Dinner:    ["Tofu stir-fry + lentils + greens (~35 g)", "Seitan + roast vegetables + quinoa (~40 g)", "Tempeh chili + brown rice (~35 g)"],
    },
  };
  const dl = dislikes.map(d => d.toLowerCase());
  const pl = preferred.map(p => p.toLowerCase());
  const pick = (opts: string[]) => {
    const ok = opts.filter(o => !dl.some(d => o.toLowerCase().includes(d)));
    const pref = ok.find(o => pl.some(p => o.toLowerCase().includes(p)));
    return pref || ok[0] || opts[0];
  };
  return meals.map(m => ({
    meal: m.meal,
    protein_g: Math.min(m.cap, Math.round(dailyProteinG * m.pct)),
    example: pick(ex[diet][m.meal]),
  }));
}

export type TimeBudget = "enjoys_cooking" | "cooks_when_time" | "needs_quick_meals" | "travels_frequently";

const TIME_BUDGET_LABEL: Record<TimeBudget, string> = {
  enjoys_cooking: "Enjoys cooking",
  cooks_when_time: "Cooks when time allows",
  needs_quick_meals: "Needs quick meals",
  travels_frequently: "Travels frequently",
};

const TIME_BUDGET_NOTE: Record<TimeBudget, string> = {
  enjoys_cooking: "Full recipes welcome — recommendations include light prep and batch cooking.",
  cooks_when_time: "Mix of quick options and one or two cooked meals per day.",
  needs_quick_meals: "Buy-ready, minimal prep. Most meals under 5 minutes to assemble.",
  travels_frequently: "Hotel- and travel-friendly options: whey, Greek yogurt, ready-cooked protein, eggs.",
};

export function nutritionAssessment(args: {
  age?: number;
  gender?: "male" | "female" | "other";
  height_cm?: number;
  weight_kg: number;
  target_weight_kg?: number;
  waist_cm?: number;
  body_fat_pct?: number;
  activity_level?: ActivityLevel;
  occupation?: string;
  goal?: NutritionGoal;
  diet_type?: DietType;
  sleep_hours?: number;
  alcohol_units_per_week?: number;
  coffee_cups_per_day?: number;
  daily_walk_minutes?: number;
  strength_sessions_per_week?: number;
  cardio_sessions_per_week?: number;
  est_calories?: number;
  est_protein_g?: number;
  est_carbs_g?: number;
  est_fat_g?: number;
  est_hydration_l?: number;
  breakfast_protein_g?: number;
  lunch_protein_g?: number;
  dinner_protein_g?: number;
  snack_protein_g?: number;
  low_protein_breakfast?: boolean;
  sugar_snacks?: boolean;
  low_vegetables?: boolean;
  high_processed?: boolean;
  irregular_meals?: boolean;
  meal_observations?: string[];
  disliked_foods?: string[];
  preferred_foods?: string[];
  time_budget?: TimeBudget;
  habit_upgrades?: Array<{ existing_meal?: string; upgrade?: string; why?: string }>;
  nutrition_risk_flags?: Array<{ nutrient?: string; confidence?: "low" | "moderate" | "high"; reasoning?: string }>;
  meal_framework_replacements?: Array<{ slot?: "Breakfast" | "Lunch" | "Snack" | "Dinner"; current?: string; upgrade?: string }>;
  top_meals?: { strongest?: { meal?: string; why_it_works?: string[]; score?: number }; weakest?: { meal?: string; why_it_hurts?: string[]; score?: number } };
  oily_fish_per_week?: number;
  vegetable_servings_per_day?: number;
}) {
  const weight = Math.max(35, Math.min(args.weight_kg || 70, 250));
  const goal: NutritionGoal = (args.goal as NutritionGoal) || "energy";
  const activity: ActivityLevel = (args.activity_level as ActivityLevel) || "moderate";
  const gender = args.gender || "other";
  const age = args.age || 35;
  const height = args.height_cm || (gender === "female" ? 165 : 178);
  const diet: DietType = (args.diet_type as DietType) || "omnivore";
  const dislikes = args.disliked_foods ?? [];
  const preferred = args.preferred_foods ?? [];
  const mealObservations = (args.meal_observations ?? []).filter(s => typeof s === 'string' && s.trim().length > 0).slice(0, 6);

  const bmi = Math.round((weight / Math.pow(height / 100, 2)) * 10) / 10;

  // Decide CALCULATION weight (target-weight method when overweight + fat_loss).
  let calcWeight = weight;
  let calcMethod: "current_weight" | "target_weight" = "current_weight";
  let targetWeight: number | null = args.target_weight_kg ?? null;
  let estimatedTarget = false;
  const overweightForLoss = (bmi > 28 || (args.body_fat_pct ?? 0) >= 28) && goal === "fat_loss";
  if (overweightForLoss) {
    if (targetWeight && targetWeight < weight) {
      calcWeight = targetWeight;
    } else {
      targetWeight = Math.round(24 * Math.pow(height / 100, 2));
      estimatedTarget = true;
      calcWeight = targetWeight;
    }
    calcMethod = "target_weight";
  }

  // Calories from current weight (Mifflin-St Jeor), adjusted for fat loss.
  const bmr = gender === "female"
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5;
  const tdee = Math.round(bmr * ACTIVITY_FACTOR[activity]);
  const calorieTarget = goal === "fat_loss" ? Math.round(tdee * 0.82) : tdee;

  // Age / gender protein modifier (sarcopenia awareness — kicks in at 50+).
  let ageBoost = 0;
  if (age >= 65) ageBoost = 0.2;
  else if (age >= 50) ageBoost = 0.1;
  if (gender === "female" && age >= 50) ageBoost += 0.1;

  const [pLoBase, pHiBase] = PROTEIN_RANGE[goal];
  const pLo = pLoBase + ageBoost;
  const pHi = pHiBase + ageBoost;
  const proteinTarget = { low_g: Math.round(calcWeight * pLo), high_g: Math.round(calcWeight * pHi) };
  const proteinMid = Math.round((proteinTarget.low_g + proteinTarget.high_g) / 2);

  const hydrationTargetL = Math.round((calcWeight * 0.033) * 10) / 10;
  const [cLo, cHi] = CARB_RANGE[goal];
  const carbTargetRange = { low_g: Math.round(calcWeight * cLo), high_g: Math.round(calcWeight * cHi) };
  const fatTargetRange = { low_g: Math.round(calcWeight * 0.8), high_g: Math.round(calcWeight * 1.0) };

  const proteinGap = args.est_protein_g != null ? Math.round(proteinMid - args.est_protein_g) : null;
  const weeklyProteinGap = proteinGap != null && proteinGap > 0 ? proteinGap * 7 : 0;
  const hydrationGapL = args.est_hydration_l != null ? Math.round((hydrationTargetL - args.est_hydration_l) * 10) / 10 : null;

  const score = (val: number | null, target: number, tolerance = 0.25) => {
    if (val == null) return 50;
    const ratio = val / target;
    if (ratio >= 1 - tolerance && ratio <= 1 + tolerance) return 92;
    if (ratio < 1) return Math.max(20, Math.round(ratio * 95));
    return Math.max(40, Math.round(100 - (ratio - 1) * 80));
  };


  const proteinScore   = score(args.est_protein_g ?? null, proteinMid, 0.2);
  const carbsScore     = args.high_processed ? 55 : score(args.est_carbs_g ?? null, (carbTargetRange.low_g + carbTargetRange.high_g) / 2, 0.3);
  const fatScore       = score(args.est_fat_g ?? null, (fatTargetRange.low_g + fatTargetRange.high_g) / 2, 0.3);
  const hydrationScore = score(args.est_hydration_l ?? null, hydrationTargetL, 0.2);
  const recoveryScore  = Math.max(30,
    80 - (args.low_protein_breakfast ? 15 : 0) - (args.sugar_snacks ? 10 : 0)
       - (args.irregular_meals ? 10 : 0) - (args.low_vegetables ? 10 : 0));
  const overall = Math.round((proteinScore * 1.3 + carbsScore + fatScore + hydrationScore + recoveryScore) / 5.3);

  // Protein distribution (per-meal scoring).
  const distMeals = [
    { meal: "Breakfast", g: args.breakfast_protein_g ?? null },
    { meal: "Lunch",     g: args.lunch_protein_g     ?? null },
    { meal: "Snack",     g: args.snack_protein_g     ?? null },
    { meal: "Dinner",    g: args.dinner_protein_g    ?? null },
  ];
  const hasDistribution = distMeals.some(m => m.g != null);
  const scoreMeal = (g: number | null, isSnack: boolean) => {
    if (g == null) return null;
    if (isSnack) return g >= 10 ? 100 : Math.round(g * 10);
    if (g >= 30) return 100;
    if (g <= 0) return 0;
    return Math.round((g / 30) * 100);
  };
  const distScores = distMeals.map(m => ({ ...m, score: scoreMeal(m.g, m.meal === "Snack") }));
  const valid = distScores.filter(d => d.score != null) as { meal: string; g: number; score: number }[];
  // Weighted blend of average + worst meal — penalises a single under-target meal.
  const distributionScore = valid.length
    ? (() => {
        const avg = valid.reduce((a, b) => a + b.score, 0) / valid.length;
        const minScore = Math.min(...valid.map(v => v.score));
        return Math.round(avg * 0.75 + minScore * 0.25);
      })()
    : null;
  const distributionStatus = distributionScore == null
    ? "Add per-meal protein amounts to score distribution."
    : distributionScore >= 80 ? "Excellent — protein spread evenly across the day."
    : distributionScore >= 55 ? "Moderate — one or two meals are protein-light."
    : "Poor — protein is concentrated at one meal. Anchoring breakfast is your biggest win.";

  // Muscle preservation with explicit reasons (tightened — clinician-grade weighting).
  const strength = args.strength_sessions_per_week ?? 0;
  let musclePres = 50;
  if (args.est_protein_g != null) {
    const r = args.est_protein_g / proteinMid;
    // non-linear penalty when below target; flat once at/above target
    musclePres = Math.round(20 + Math.min(1, r) ** 1.2 * 55);
  }
  musclePres += Math.min(strength, 4) * 5;
  if (age >= 50) musclePres -= 10; else if (age >= 40) musclePres -= 6;
  if (gender === "female" && age >= 50) musclePres -= 4;
  musclePres = Math.max(10, Math.min(100, musclePres));
  const muscleStatus =
    musclePres >= 75 ? "Good — muscle preservation looks well supported." :
    musclePres >= 55 ? "Moderate — improvements would meaningfully protect muscle mass." :
                       "High risk of gradual muscle loss without changes.";
  const muscleReasons: string[] = [];
  if (age >= 40) muscleReasons.push(`Age ${age} — natural muscle loss begins around 40 without resistance training.`);
  if (proteinGap != null && proteinGap > 15) muscleReasons.push(`Protein intake roughly ${proteinGap} g/day below target.`);
  if (strength < 3) muscleReasons.push(`Only ${strength} resistance session${strength === 1 ? "" : "s"} per week (3 is the protective minimum).`);
  if (args.low_protein_breakfast) muscleReasons.push("Breakfast is low in protein — the most leverageable meal.");
  if (gender === "female" && age >= 50) muscleReasons.push("Post-menopausal protein requirements are 10–20% higher.");

  const sleepH = args.sleep_hours ?? 6.5;
  const sleepComp = Math.max(0, 100 - Math.abs(sleepH - 7.5) * 18);
  const metabolicSupport = Math.round((proteinScore * 0.35 + hydrationScore * 0.25 + sleepComp * 0.25 + Math.min(100, strength * 22) * 0.15));

  const reco = (() => {
    const base = age >= 50 ? 3 : age >= 35 ? 3 : 2;
    const cardio = goal === "fat_loss" ? 3 : 2;
    return {
      strength_sessions_per_week: goal === "muscle_gain" ? 4 : base,
      cardio_sessions_per_week: cardio,
      mobility_minutes_per_day: 10,
      reason: age >= 45
        ? "After 45, adults lose roughly 1% of muscle mass per year without resistance training. Two to three short strength sessions per week is the single strongest longevity input."
        : "Resistance training builds the metabolic and structural foundation that protects energy, posture, and long-term health.",
    };
  })();

  const positives: string[] = [];
  const needs: string[] = [];
  if (fatScore >= 75) positives.push("Healthy fat intake");
  if (carbsScore >= 75) positives.push("Reasonable carbohydrate quality");
  if (hydrationScore >= 80) positives.push("Good hydration"); else needs.push("Hydration");
  if (proteinScore >= 75) positives.push("Adequate protein"); else needs.push("Protein intake");
  if (recoveryScore >= 75) positives.push("Good recovery support"); else needs.push("Recovery support");
  if (sleepH >= 7) positives.push("Sleep duration"); else needs.push("Sleep duration");
  if ((args.alcohol_units_per_week ?? 0) > 14) needs.push("Alcohol load");
  if (strength >= 2) positives.push("Resistance training present"); else needs.push("Resistance training");

  const priorities: { title: string; detail: string }[] = [];
  if (args.low_protein_breakfast || (distributionScore != null && distributionScore < 55) || (proteinGap != null && proteinGap > 20)) {
    priorities.push({
      title: "Anchor protein at breakfast",
      detail: "Aim for 30–40 g of protein within an hour of waking. Closes 30–50% of a daily protein gap on its own and stabilises afternoon energy.",
    });
  }
  if (strength < 2) {
    priorities.push({
      title: `Add resistance training (${reco.strength_sessions_per_week}× per week)`,
      detail: "Two to three short strength sessions per week is the single most underused longevity input.",
    });
  }
  if (args.sugar_snacks) priorities.push({ title: "Replace afternoon sugar snacks", detail: "Swap for a protein-forward option (yogurt, eggs, cottage cheese, edamame)." });
  if (hydrationGapL != null && hydrationGapL > 0.6) priorities.push({ title: `Increase hydration by ~${hydrationGapL} L/day`, detail: "Front-load 500 ml on waking and 500 ml between meals." });
  if (args.low_vegetables) priorities.push({ title: "Add one vegetable-forward meal per day", detail: "Half a plate of vegetables improves fibre, micronutrients, and satiety." });
  if ((args.alcohol_units_per_week ?? 0) > 10) priorities.push({ title: "Reduce alcohol load", detail: "Target ≤ 7 units/week — fastest single change for sleep quality, recovery, and visceral fat." });
  while (priorities.length < 3) priorities.push({ title: "Maintain consistency for 7 days", detail: "Repeat the strongest two days from this week. Consistency beats perfection." });

  // Personalized food sources (filtered by dietary dislikes)
  const personalSources = filterByDislikes(PROTEIN_SOURCES[diet], dislikes);
  const personalSwaps = filterByDislikes(THIRTY_G_SWAPS[diet], dislikes);

  // Fastest win — the single highest-impact change.
  const fastestWin = (() => {
    const benefits = ["Improved satiety", "Reduced cravings", "Better recovery", "Easier fat loss"];
    if (proteinGap != null && proteinGap > 15 && (args.low_protein_breakfast || (distributionScore != null && distributionScore < 60))) {
      const closePct = Math.min(50, Math.round(35 / Math.max(proteinGap, 35) * 100));
      return {
        title: "Add 30-35 g of protein at breakfast",
        action: `Choose one: ${personalSwaps[0]}, or ${personalSwaps[1] ?? personalSwaps[0]}.`,
        expected_benefits: benefits,
        closes_pct_of_weekly_gap: closePct,
      };
    }
    if (strength < 2) {
      return {
        title: `Start ${reco.strength_sessions_per_week} short resistance sessions per week`,
        action: "30–40 minutes each. Compound movements: squat, hinge, push, pull.",
        expected_benefits: ["Muscle preservation", "Metabolic health", "Glucose control", "Healthy aging"],
        closes_pct_of_weekly_gap: 0,
      };
    }
    if (hydrationGapL != null && hydrationGapL > 0.6) {
      return {
        title: `Increase hydration by ${hydrationGapL} L/day`,
        action: "500 ml on waking, 500 ml mid-morning, 500 ml mid-afternoon.",
        expected_benefits: ["Energy stability", "Cognitive clarity", "Fewer false hunger cues"],
        closes_pct_of_weekly_gap: 0,
      };
    }
    return {
      title: "Hold the current pattern for 14 days",
      action: "Your foundation is solid — repeat your two best days for two weeks.",
      expected_benefits: ["Cement habits", "Visible body composition change", "Better sleep and recovery"],
      closes_pct_of_weekly_gap: 0,
    };
  })();

  const sevenDay = [
    "Day 1 — Protein breakfast (30–40 g). Hit hydration target.",
    "Day 2 — Add one vegetable-forward meal. Repeat protein breakfast.",
    "Day 3 — First strength session of the week (30–40 min).",
    "Day 4 — Front-load water (500 ml on waking + 500 ml mid-morning).",
    "Day 5 — Aim for protein at every meal (palm-sized portion).",
    "Day 6 — Second strength session + a zone-2 walk.",
    "Day 7 — Light review. Keep the two habits that felt easiest.",
  ];

  const supportPct = Math.round(overall * 0.95);
  const limiting =
    proteinScore < carbsScore && proteinScore < hydrationScore ? "protein intake (and how it is distributed across the day)" :
    hydrationScore < carbsScore ? "hydration" :
    recoveryScore < 60 ? "recovery support (sleep, meal timing, vegetables)" :
    "overall consistency";
  const summaryRisks: string[] = [];
  if (proteinScore < 70) summaryRisks.push("reduced muscle mass and slower recovery");
  if (hydrationScore < 70) summaryRisks.push("lower energy stability");
  if (recoveryScore < 70) summaryRisks.push("blunted recovery and afternoon energy dips");
  if (strength < 2 && age >= 40) summaryRisks.push("accelerated age-related muscle loss");
  const methodLine = calcMethod === "target_weight"
    ? `Your targets are calculated against a healthy target weight of ${calcWeight} kg${estimatedTarget ? " (estimated from your height)" : ""} rather than your current weight — this is the practical, sustainable approach for fat loss.`
    : "";
  const executiveSummary =
    `Your current nutrition supports approximately ${supportPct}% of your body's recovery requirements. ` +
    `The largest limiting factor appears to be ${limiting}. ` +
    (summaryRisks.length
      ? `If maintained long term, this pattern may contribute to ${summaryRisks.slice(0, 3).join(", ")}. `
      : "Your foundation is solid — the focus is fine-tuning rather than rebuilding. ") +
    (methodLine ? methodLine + " " : "") +
    `Small, consistent adjustments over the next 7–14 days produce the most visible change.`;

  const weeklyActions: string[] = [];
  if (proteinGap != null && proteinGap > 0) weeklyActions.push(`Reach ${proteinMid} g of protein daily (currently ~${args.est_protein_g} g).`);
  else weeklyActions.push(`Maintain ${proteinTarget.low_g}–${proteinTarget.high_g} g protein daily.`);
  weeklyActions.push(`Add strength training ${reco.strength_sessions_per_week}× weekly.`);
  weeklyActions.push(`Hydrate to ~${hydrationTargetL} L per day.`);
  weeklyActions.push("Add vegetables to two meals daily.");
  const expectedBenefits = [
    "Improved satiety and fewer cravings",
    "Better recovery and energy stability",
    "Improved body composition over 4–8 weeks",
    "Stronger long-term metabolic and muscular foundation",
  ];

  // ── Lifestyle factors (alcohol, coffee, walking) ────────────────────
  const alcohol = args.alcohol_units_per_week ?? null;
  const coffee = args.coffee_cups_per_day ?? null;
  const walk = args.daily_walk_minutes ?? null;
  const lifestyleFactors = {
    alcohol: alcohol == null ? null : {
      units_per_week: alcohol,
      status:
        alcohol === 0 ? "None reported — optimal for recovery and body composition." :
        alcohol <= 7 ? "Moderate intake. Reducing by 1–2 servings per week may further improve sleep efficiency, recovery quality, and fat-loss progress." :
        alcohol <= 14 ? "Above the recommended weekly load. This range typically blunts sleep depth, protein synthesis, and visceral-fat loss. Aim for ≤ 7 units/week." :
        "Elevated weekly load. Strongest single change for sleep quality, hormonal balance, and body composition is reducing toward ≤ 7 units/week.",
    },
    coffee: coffee == null ? null : {
      cups_per_day: coffee,
      status:
        coffee <= 3 ? "Appropriate if consumed before midday. Avoid caffeine within 8 hours of bedtime if recovery or sleep quality become limiting factors." :
        coffee <= 5 ? "On the higher side. Cap at ~400 mg/day (≈ 4 cups) and keep all intake before 2 pm." :
        "High daily intake. Reduce gradually and shift all consumption to before noon to protect deep sleep.",
    },
    walking: walk == null ? null : {
      minutes_per_day: walk,
      status:
        walk >= 30 ? "Consistent daily walking is one of the strongest longevity markers — keep this habit." :
        walk >= 15 ? "Good base. Extending to 30 min/day adds meaningful cardiovascular and metabolic benefit." :
        "Add a daily 20–30 min walk — one of the highest-ROI, lowest-effort longevity inputs.",
    },
  };

  // Add walking & coffee to the positive/improvement lists when reported.
  if (walk != null && walk >= 30) positives.push("Daily walking habit (≥ 30 min)");
  if (walk != null && walk >= 15 && walk < 30) positives.push("Consistent low-intensity movement");
  if (coffee != null && coffee <= 3) positives.push("Moderate coffee intake");

  // ── Weight-loss projection (only meaningful for fat_loss) ───────────
  const round1 = (n: number) => Math.round(n * 10) / 10;
  const weightLossProjection = goal === "fat_loss" ? (() => {
    const deficit = Math.max(0, tdee - calorieTarget); // ~18% of TDEE
    // ~7700 kcal per kg of fat; project a sustainable 0.3–0.7 kg / week range.
    const weeklyLowRaw = Math.max(0.3, deficit * 7 / 9000);
    const weeklyHighRaw = Math.max(weeklyLowRaw + 0.2, deficit * 7 / 6500);
    const weeklyLow = round1(weeklyLowRaw);
    const weeklyHigh = round1(Math.min(0.9, weeklyHighRaw));
    const monthlyLow = round1(weeklyLow * 4);
    const monthlyHigh = round1(weeklyHigh * 4);
    return {
      assumes: `Protein intake reaches ${proteinTarget.low_g}–${proteinTarget.high_g} g/day and current activity is maintained.`,
      satiety_within_days: "7–14",
      visible_change_weeks: "4–8",
      weekly_kg_low: weeklyLow,
      weekly_kg_high: weeklyHigh,
      monthly_kg_low: monthlyLow,
      monthly_kg_high: monthlyHigh,
      note: `A sustainable fat-loss rate for this profile is approximately ${monthlyLow}–${monthlyHigh} kg per month when nutrition, activity and recovery remain consistent. Educational estimate only.`,
    };
  })() : null;

  // ── Score drivers (transparency — why each score is what it is) ──────
  const hydrationDrivers = (() => {
    const positives: string[] = [];
    const limiting: string[] = [];
    if (args.est_hydration_l != null) {
      if (args.est_hydration_l >= hydrationTargetL * 0.85) {
        positives.push(`Drinking ~${args.est_hydration_l} L/day, near the ${hydrationTargetL} L target`);
      } else {
        limiting.push(`Currently ~${args.est_hydration_l} L/day vs target ~${hydrationTargetL} L (gap ~${hydrationGapL} L)`);
      }
    } else {
      limiting.push("Daily fluid intake not reported");
    }
    if ((args.coffee_cups_per_day ?? 0) >= 4) limiting.push("High coffee intake increases fluid turnover");
    if ((args.alcohol_units_per_week ?? 0) > 7) limiting.push("Alcohol load increases dehydration risk");
    return { positives, limiting };
  })();

  const carbsDrivers = (() => {
    const positives: string[] = [];
    const limiting: string[] = [];
    if (args.high_processed) limiting.push("High intake of refined / processed carbohydrates");
    if (args.low_vegetables) limiting.push("Low vegetable diversity reported");
    if (args.sugar_snacks) limiting.push("Frequent sugar-based snacks");
    if (!args.high_processed) positives.push("Mostly whole-food carbohydrate sources");
    if (!args.low_vegetables) positives.push("Vegetables present in daily meals");
    if (args.est_carbs_g != null) {
      if (args.est_carbs_g < carbTargetRange.low_g) limiting.push(`Carb intake (~${args.est_carbs_g} g) below the ${carbTargetRange.low_g}-${carbTargetRange.high_g} g target`);
      else if (args.est_carbs_g > carbTargetRange.high_g) limiting.push(`Carb intake (~${args.est_carbs_g} g) above the ${carbTargetRange.low_g}-${carbTargetRange.high_g} g target`);
      else positives.push(`Carb intake within the ${carbTargetRange.low_g}-${carbTargetRange.high_g} g target range`);
    }
    return { positives, limiting };
  })();

  const recoveryDrivers = (() => {
    const positives: string[] = [];
    const limiting: string[] = [];
    if (sleepH >= 7) positives.push(`${sleepH} hours of sleep per night`);
    else limiting.push(`Sleep duration ${sleepH} h is below the 7-8 h target`);
    if (walk != null && walk >= 30) positives.push(`Daily walking habit (${walk} min)`);
    else if (walk != null && walk >= 15) positives.push(`Some daily walking (${walk} min)`);
    if (strength >= 2) positives.push(`Resistance training ${strength}x per week`);
    else limiting.push(`Resistance training only ${strength}x per week (target ${reco.strength_sessions_per_week}x)`);
    if (proteinGap != null && proteinGap > 15) limiting.push(`Protein deficit (~${proteinGap} g/day) blunts overnight repair`);
    if (args.low_protein_breakfast) limiting.push("Low-protein breakfast limits morning recovery");
    if (args.sugar_snacks) limiting.push("Sugar-based snacks impair recovery");
    if (args.irregular_meals) limiting.push("Irregular meal timing reduces recovery consistency");
    if (args.low_vegetables) limiting.push("Low vegetable intake limits micronutrient recovery support");
    if ((args.alcohol_units_per_week ?? 0) > 7) limiting.push(`Alcohol intake (~${args.alcohol_units_per_week} units/week) blunts deep sleep`);
    return { positives, limiting };
  })();

  const executivePerformanceImpact = {
    current_likely_influences: [
      "Afternoon energy stability",
      "Training recovery quality",
      "Hunger and craving control",
      "Body composition trajectory",
      "Long-term muscle preservation",
    ],
    strongest_immediate_opportunity: {
      title: fastestWin.title,
      action: fastestWin.action,
      expected_effects: fastestWin.expected_benefits,
    },
  };

  // ── Executive Recovery Capacity (headline trio) ─────────────────────
  const walkScore = walk == null ? 60 : walk >= 30 ? 90 : walk >= 15 ? 70 : 40;
  const alcoholPenalty = alcohol == null ? 0 : alcohol > 14 ? 25 : alcohol > 7 ? 12 : 0;
  const strengthComp = strength >= 3 ? 90 : strength >= 2 ? 75 : strength >= 1 ? 55 : 35;
  const recoveryCapacity = Math.max(20, Math.min(100, Math.round(
    recoveryScore * 0.30 + sleepComp * 0.25 + hydrationScore * 0.15
    + walkScore * 0.15 + strengthComp * 0.15 - alcoholPenalty
  )));

  // ── Long-term outlook (consultant conclusion) ───────────────────────
  const rank = (s: number, hi = 75, mid = 55) => s >= hi ? "Strong foundation" : s >= mid ? "Developing foundation" : "Needs reinforcement";
  const longTermOutlook = {
    muscle_preservation_risk: musclePres >= 75 ? "Low" : musclePres >= 55 ? "Moderate" : "High",
    recovery_capacity: rank(recoveryCapacity),
    fat_loss_potential: goal === "fat_loss"
      ? (proteinScore >= 60 && recoveryCapacity >= 55 ? "High" : "Moderate")
      : "Not the primary goal for this profile",
    longevity_support:
      ((walk ?? 0) >= 20 && strength >= 2 && (alcohol ?? 0) <= 7 && sleepH >= 7 && proteinScore >= 65 && hydrationScore >= 65)
        ? "Strong foundation"
        : recoveryCapacity >= 60 ? "Developing foundation" : "Needs reinforcement",
    most_impactful_improvement: priorities[0]?.title || fastestWin.title,
  };

  // ── Executive Readiness Score (headline number for retention) ───────
  const sleepPenalty = sleepH < 7 ? (7 - sleepH) * 15 : 0;
  const executiveReadiness = Math.max(20, Math.min(100, Math.round(
    recoveryCapacity * 0.30 +
    overall * 0.25 +
    musclePres * 0.25 +
    Math.max(0, 100 - alcoholPenalty - sleepPenalty) * 0.20
  )));
  const executiveReadinessLevel =
    executiveReadiness >= 80 ? "Optimized nutrition" :
    executiveReadiness >= 60 ? "Functional — clear room to improve" :
    executiveReadiness >= 40 ? "Nutrition deficit" :
                               "High nutritional risk";

  // ── Executive Benchmark (peer comparison — psychologically motivating) ─
  const cohortLabel = (() => {
    const lo = Math.max(20, Math.floor(age / 5) * 5);
    return `Adults aged ${lo}-${lo + 9}`;
  })();
  const posLabel = (s: number) =>
    s >= 80 ? "Top 20%" :
    s >= 65 ? "Top 40%" :
    s >= 50 ? "Average" :
    s >= 35 ? "Bottom 40%" :
              "Bottom 25%";
  const benchmarkItems = [
    {
      metric: "Protein intake",
      current: args.est_protein_g != null ? `${args.est_protein_g} g/day` : "Not reported",
      recommended: `${proteinTarget.low_g}-${proteinTarget.high_g} g/day`,
      position: posLabel(proteinScore),
    },
    {
      metric: "Resistance training",
      current: `${strength} session${strength === 1 ? "" : "s"}/week`,
      recommended: `${reco.strength_sessions_per_week}+ sessions/week`,
      position: posLabel(strengthComp),
    },
    {
      metric: "Walking activity",
      current: walk != null ? `${walk} min/day` : "Not reported",
      recommended: "30+ min/day",
      position: posLabel(walkScore),
    },
    {
      metric: "Hydration",
      current: args.est_hydration_l != null ? `${args.est_hydration_l} L/day` : "Not reported",
      recommended: `~${hydrationTargetL} L/day`,
      position: posLabel(hydrationScore),
    },
    {
      metric: "Sleep duration",
      current: `${sleepH} h/night`,
      recommended: "7-8 h/night",
      position: posLabel(sleepComp),
    },
    {
      metric: "Alcohol load",
      current: alcohol != null ? `${alcohol} units/week` : "Not reported",
      recommended: "<= 7 units/week",
      position: alcohol == null ? "Average" : alcohol === 0 ? "Top 20%" : alcohol <= 7 ? "Top 40%" : alcohol <= 14 ? "Bottom 40%" : "Bottom 25%",
    },
  ];
  const overallPosition =
    executiveReadiness >= 75 ? "Above peer average" :
    executiveReadiness >= 55 ? "Moderate vs peers" :
                               "Below peer average";
  const executiveBenchmark = {
    cohort: cohortLabel,
    items: benchmarkItems,
    overall_readiness: executiveReadiness,
    overall_position: overallPosition,
    note: "Peer ranges are educational estimates drawn from European adult-wellness population data — not clinical benchmarks.",
  };

  // ── Reassessment projection (retention hook — "come back in 14 days") ─
  const projectIf = (current: number, bump: number) => Math.min(100, current + bump);
  const reassessmentProjection = {
    reassess_in_days: 14,
    if_you: [
      proteinGap != null && proteinGap > 10 ? `Increase protein toward ${proteinMid} g/day` : "Maintain current protein intake",
      hydrationGapL != null && hydrationGapL > 0.4 ? `Increase hydration by ~${hydrationGapL} L/day` : "Maintain hydration",
      strength < reco.strength_sessions_per_week ? `Reach ${reco.strength_sessions_per_week} resistance sessions/week` : "Maintain resistance training",
      (alcohol ?? 0) > 7 ? "Reduce alcohol toward <= 7 units/week" : "Keep alcohol in current range",
    ],
    expected_changes: [
      { metric: "Executive readiness", from: executiveReadiness, to: projectIf(executiveReadiness, 6) },
      { metric: "Muscle preservation", from: musclePres, to: projectIf(musclePres, 9) },
      { metric: "Recovery capacity", from: recoveryCapacity, to: projectIf(recoveryCapacity, 6) },
      { metric: "Nutrition quality", from: overall, to: projectIf(overall, 7) },
    ],
    note: "Projected ranges assume the actions above are sustained for 14 consecutive days. Educational estimate only.",
  };

  // ── Clinical Perspective (WellneSpirit authority layer) ─────────────
  const clinicalOpportunities: string[] = [];
  if (proteinScore < 70) clinicalOpportunities.push("increasing daily protein intake");
  if (hydrationScore < 70) clinicalOpportunities.push("improving daily hydration");
  if (strength < 2) clinicalOpportunities.push("adding consistent resistance training");
  if ((alcohol ?? 0) > 7) clinicalOpportunities.push("reducing weekly alcohol load");
  if (sleepH < 7) clinicalOpportunities.push("extending sleep duration");
  if (clinicalOpportunities.length === 0) clinicalOpportunities.push("maintaining current habits while fine-tuning consistency");
  const clinicalPerspective =
    `Based on current habits, the strongest opportunities for improvement are ${clinicalOpportunities.slice(0, 3).join(", ")}. ` +
    `These are commonly observed factors affecting energy, body composition, and long-term resilience in adults${age >= 45 ? " over 45" : ""}. ` +
    `This perspective is educational, not diagnostic — confirm with a qualified clinician if relevant.`;

  // ── Nutrition risk flags (observational micronutrient inference) ────
  // Combines model-supplied flags with deterministic inferences from the diary.
  const inferredFlags: Array<{ nutrient: string; confidence: "low" | "moderate" | "high"; reasoning: string }> = [];
  const oilyFish = args.oily_fish_per_week ?? null;
  const vegServ = args.vegetable_servings_per_day ?? null;
  if (args.low_vegetables || (vegServ != null && vegServ < 2)) {
    inferredFlags.push({ nutrient: "Fibre", confidence: "moderate", reasoning: "Low vegetable diversity reported across the week." });
    inferredFlags.push({ nutrient: "Vegetable diversity", confidence: "moderate", reasoning: "Fewer than two vegetable servings/day on most days." });
    inferredFlags.push({ nutrient: "Potassium", confidence: "low", reasoning: "Low vegetable + fruit intake reduces dietary potassium." });
  }
  if (oilyFish != null && oilyFish < 2) {
    inferredFlags.push({ nutrient: "Omega-3 (EPA/DHA)", confidence: "moderate", reasoning: `Oily fish appears only ${oilyFish}×/week (target ≥ 2).` });
  } else if (oilyFish == null && diet !== "vegan" && diet !== "vegetarian") {
    inferredFlags.push({ nutrient: "Omega-3 (EPA/DHA)", confidence: "low", reasoning: "Oily fish intake not clearly visible in the diary." });
  }
  if (diet === "vegan" || diet === "vegetarian") {
    inferredFlags.push({ nutrient: "Vitamin B12", confidence: diet === "vegan" ? "high" : "low", reasoning: diet === "vegan" ? "Plant-only diet — B12 supplementation typically required." : "Lower animal-product intake — worth monitoring." });
    if (diet === "vegan") inferredFlags.push({ nutrient: "Iron", confidence: "moderate", reasoning: "Plant iron has lower bioavailability — pair with vitamin C." });
  }
  if (args.high_processed) {
    inferredFlags.push({ nutrient: "Magnesium", confidence: "low", reasoning: "High processed-food share usually displaces whole-grain magnesium sources." });
  }
  if (age >= 50 || (gender === "female" && age >= 45)) {
    inferredFlags.push({ nutrient: "Vitamin D", confidence: "low", reasoning: `Adults ${age >= 50 ? "50+" : "45+ women"} commonly run low without supplementation.` });
  }
  // Merge with model-supplied flags (model takes precedence on duplicates)
  const modelFlags = (args.nutrition_risk_flags ?? [])
    .filter(f => f && typeof f.nutrient === "string" && f.nutrient.trim().length > 0)
    .map(f => ({
      nutrient: f.nutrient!.trim(),
      confidence: (f.confidence as "low" | "moderate" | "high") || "low",
      reasoning: (f.reasoning ?? "").trim() || "Observed from your diary patterns.",
    }));
  const seenNutrients = new Set(modelFlags.map(f => f.nutrient.toLowerCase()));
  const mergedFlags = [...modelFlags];
  for (const f of inferredFlags) {
    if (!seenNutrients.has(f.nutrient.toLowerCase())) {
      mergedFlags.push(f);
      seenNutrients.add(f.nutrient.toLowerCase());
    }
  }
  const nutritionRiskFlags = mergedFlags.slice(0, 6);

  // ── Habit upgrades ("foods you already eat") ────────────────────────
  const habitUpgrades = (args.habit_upgrades ?? [])
    .filter(h => h && typeof h === "object")
    .map(h => ({
      existing_meal: (h.existing_meal ?? "").toString().trim(),
      upgrade: (h.upgrade ?? "").toString().trim(),
      why: (h.why ?? "").toString().trim(),
    }))
    .filter(h => h.existing_meal && h.upgrade)
    .slice(0, 5);

  // ── Success preview ("what success looks like in 14 days") ──────────
  const successPreview = {
    if_completed: [
      proteinGap != null && proteinGap > 10
        ? `Hit ${proteinMid} g protein on at least 10 of the next 14 days`
        : `Maintain ${proteinTarget.low_g}-${proteinTarget.high_g} g protein daily`,
      strength < reco.strength_sessions_per_week
        ? `${reco.strength_sessions_per_week} resistance sessions per week`
        : `Maintain ${reco.strength_sessions_per_week} resistance sessions per week`,
      hydrationGapL != null && hydrationGapL > 0.4
        ? `Reach ~${hydrationTargetL} L hydration daily`
        : `Maintain ~${hydrationTargetL} L hydration daily`,
      (alcohol ?? 0) > 7 ? "Reduce alcohol toward ≤ 7 units/week" : "Keep alcohol within current range",
    ],
    you_should_notice: [
      "Fewer afternoon energy crashes",
      "Reduced cravings between meals",
      "Improved recovery between training sessions",
      "Improved satiety and steadier mood",
    ],
  };

  // ── Time budget tag (used by PDF + chat tailoring) ──────────────────
  const timeBudget = args.time_budget ?? null;
  const timeBudgetBlock = timeBudget ? {
    key: timeBudget,
    label: TIME_BUDGET_LABEL[timeBudget],
    note: TIME_BUDGET_NOTE[timeBudget],
  } : null;

  // ── Personalised meal framework (current → upgrade, anchored to diary) ─
  const allowedSlots = new Set(["Breakfast", "Lunch", "Snack", "Dinner"]);
  const mealFrameworkReplacements = (args.meal_framework_replacements ?? [])
    .filter(m => m && typeof m === "object")
    .map(m => ({
      slot: (m.slot ?? "").toString().trim(),
      current: (m.current ?? "").toString().trim(),
      upgrade: (m.upgrade ?? "").toString().trim(),
    }))
    .filter(m => allowedSlots.has(m.slot) && m.current && m.upgrade)
    .slice(0, 4);

  // ── Top meals from your week (strongest + weakest) ─────────────────
  const cleanWhy = (arr?: unknown): string[] =>
    Array.isArray(arr) ? arr.map(x => String(x ?? "").trim()).filter(Boolean).slice(0, 4) : [];
  const tm = args.top_meals;
  const topMeals = tm && (tm.strongest?.meal || tm.weakest?.meal) ? {
    strongest: tm.strongest?.meal ? {
      meal: String(tm.strongest.meal).trim(),
      why_it_works: cleanWhy(tm.strongest.why_it_works),
      score: typeof tm.strongest.score === "number" ? Math.max(0, Math.min(100, Math.round(tm.strongest.score))) : null,
    } : null,
    weakest: tm.weakest?.meal ? {
      meal: String(tm.weakest.meal).trim(),
      why_it_hurts: cleanWhy(tm.weakest.why_it_hurts),
      score: typeof tm.weakest.score === "number" ? Math.max(0, Math.min(100, Math.round(tm.weakest.score))) : null,
    } : null,
  } : null;



  return {

    inputs: {
      weight_kg: weight, height_cm: height, bmi,
      target_weight_kg: targetWeight, waist_cm: args.waist_cm ?? null,
      body_fat_pct: args.body_fat_pct ?? null,
      activity_level: activity, goal, gender, age,
      occupation: args.occupation ?? null, diet_type: diet,
      sleep_hours: args.sleep_hours ?? null,
      alcohol_units_per_week: alcohol,
      coffee_cups_per_day: coffee,
      daily_walk_minutes: walk,
      strength_sessions_per_week: strength,
      cardio_sessions_per_week: args.cardio_sessions_per_week ?? null,
    },
    calculation_basis: {
      method: calcMethod,
      calc_weight_kg: calcWeight,
      estimated_target: estimatedTarget,
      age_boost_g_per_kg: ageBoost,
      note: calcMethod === "target_weight"
        ? `Macros use target weight (${calcWeight} kg)${estimatedTarget ? ", estimated at a healthy BMI of 24" : ""} to keep recommendations practical and adherence-friendly.`
        : "Macros use current weight — appropriate at this BMI and goal.",
    },
    targets: {
      daily_calories: calorieTarget,
      maintenance_calories: tdee,
      protein_g: proteinTarget,
      carbs_g: carbTargetRange,
      fat_g: fatTargetRange,
      hydration_l: hydrationTargetL,
    },
    estimated_intake: {
      calories: args.est_calories ?? null, protein_g: args.est_protein_g ?? null,
      carbs_g: args.est_carbs_g ?? null, fat_g: args.est_fat_g ?? null,
      hydration_l: args.est_hydration_l ?? null,
    },
    gaps: { protein_g: proteinGap, weekly_protein_g: weeklyProteinGap, hydration_l: hydrationGapL },
    scores: {
      protein: proteinScore, carbs: carbsScore, fat: fatScore,
      hydration: hydrationScore, recovery_support: recoveryScore,
      protein_distribution: distributionScore,
      muscle_preservation: musclePres, metabolic_support: metabolicSupport,
      recovery_capacity: recoveryCapacity,
      overall_nutrition: overall,
      executive_readiness: executiveReadiness,
    },
    executive_readiness: {
      score: executiveReadiness,
      level: executiveReadinessLevel,
      scale: [
        "80-100 = Optimized nutrition",
        "60-79 = Functional — clear room to improve",
        "40-59 = Nutrition deficit",
        "Below 40 = High nutritional risk",
      ],
      measures: ["Protein adequacy", "Hydration", "Recovery support", "Nutrient density", "Muscle preservation support"],
    },
    executive_benchmark: executiveBenchmark,
    reassessment_projection: reassessmentProjection,
    success_preview: successPreview,
    nutrition_risk_flags: nutritionRiskFlags,
    habit_upgrades: habitUpgrades,
    time_budget: timeBudgetBlock,
    clinical_perspective: clinicalPerspective,
    executive_summary: executiveSummary,
    muscle_preservation: {
      current_protein_g: args.est_protein_g ?? null,
      recommended_protein_g: proteinMid,
      score: musclePres,
      status: muscleStatus,
      reasons: muscleReasons,
      note: age >= 45
        ? "After approximately age 45, adults begin losing 1% of muscle mass per year unless resistance training and adequate protein are maintained."
        : "Building muscle reserves now creates the strongest possible foundation for the decades ahead.",
    },
    protein_strategy: {
      diet_type: diet,
      best_sources: personalSources,
      thirty_gram_options: personalSwaps,
      vegetarian_alternatives: diet === "vegan" ? null : filterByDislikes(VEGETARIAN_ALTS, dislikes),
      distribution: hasDistribution ? {
        meals: distScores.map(d => ({ meal: d.meal, protein_g: d.g, score: d.score })),
        target_per_main_meal_g: "30-40",
        score: distributionScore,
        status: distributionStatus,
      } : {
        meals: null,
        target_per_main_meal_g: "30-40",
        score: null,
        status: distributionStatus,
      },
    },
    daily_meal_framework: { diet_type: diet, total_protein_g: proteinMid, meals: buildMealFramework(diet, proteinMid, dislikes, preferred) },
    meal_observations: mealObservations,
    personalization: { disliked_foods: dislikes, preferred_foods: preferred },
    metabolic_support: {
      score: metabolicSupport,
      biggest_opportunities: [
        proteinScore < 75 ? "Higher protein intake" : null,
        strength < 2 ? "More muscle-building stimulus" : null,
        hydrationScore < 80 ? "Better hydration" : null,
        sleepH < 7 ? "Improved sleep consistency" : null,
      ].filter(Boolean) as string[],
    },
    resistance_training: { age, goal, ...reco },
    biological_age_impact: {
      positive: positives,
      needs_improvement: needs,
      note: "Improving the items above may significantly improve energy, recovery, and long-term resilience. Educational estimate only.",
    },
    improvement_priorities: priorities.filter(p => p.title.toLowerCase() !== fastestWin.title.toLowerCase()).slice(0, 3),
    fastest_win: fastestWin,
    seven_day_plan: sevenDay,
    weekly_action_plan: { priorities: weeklyActions, expected_benefits: expectedBenefits },
    lifestyle_factors: lifestyleFactors,
    weight_loss_projection: weightLossProjection,
    score_drivers: {
      hydration: hydrationDrivers,
      carbs: carbsDrivers,
      recovery_support: recoveryDrivers,
    },
    executive_performance_impact: executivePerformanceImpact,
    long_term_outlook: longTermOutlook,
    disclaimer:
      "This assessment is educational and informational only. It is not a medical diagnosis and should not replace consultation with a qualified healthcare professional.",
  };
}

// ─── Executive Recovery & Resilience Assessment (lifestyle-only, non-diagnostic) ──────────
export function recoveryResilienceAssessment(args: {
  // Phase 1 — Personal Profile
  age: number;
  gender?: "male" | "female" | "other";
  height_cm?: number;
  weight_kg?: number;
  occupation?: string;
  primary_goal?: "more_energy" | "better_recovery" | "reduce_stress" | "prevent_burnout" | "improve_performance" | "improve_longevity";

  // Phase 2 — Workload & Stress
  work_hours_per_week?: number;
  focused_work_hours_per_day?: number;
  meeting_hours_per_day?: number;
  travel_hours_per_day?: number;
  works_evenings?: boolean;
  works_weekends?: boolean;
  pressure_frequency?: number;     // 1–10
  responsibility_level?: number;   // 1–10

  // Phase 3 — Recovery
  sleep_hours?: number;
  sleep_quality?: number;          // 1–10
  wakes_refreshed?: boolean;
  exercise_sessions_per_week?: number;
  exercise_type?: "resistance" | "cardio" | "walking" | "mixed" | "none";
  takes_recovery_days?: boolean;
  outdoor_hours_per_week?: number;

  // Phase 4 — Lifestyle & Resilience
  alcohol_units_per_week?: number;
  caffeine_per_day?: number;
  water_liters_per_day?: number;
  social_support?: number;          // 1–10
  work_life_balance?: number;       // 1–10
  stress_level?: number;            // 1–10
  energy_level?: number;            // 1–10
  motivation_level?: number;        // 1–10

  // Phase 5 — Optional Nutrition Integration
  nutrition?: {
    protein_score?: number;
    hydration_score?: number;
    recovery_score?: number;
    muscle_preservation_score?: number;
  };
}) {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const inv = (s: number) => 110 - s * 10; // invert a 1–10 "bad-when-high" score to 0–100 (good-when-high)

  const age = Math.max(18, Math.min(args.age || 40, 95));

  // ── Recovery Capacity ────────────────────────────────────────
  const sl = args.sleep_hours ?? 6.5;
  const sleepDuration = clamp(100 - Math.abs(sl - 7.5) * 18);
  const sleepQuality = clamp((args.sleep_quality ?? 6) * 10);
  const refreshed = args.wakes_refreshed === true ? 100 : args.wakes_refreshed === false ? 40 : 60;
  const ex = args.exercise_sessions_per_week ?? 2;
  const movement = clamp(40 + Math.min(ex, 6) * 10);
  const exerciseQuality =
    args.exercise_type === "resistance" || args.exercise_type === "mixed" ? 100 :
    args.exercise_type === "cardio" ? 80 :
    args.exercise_type === "walking" ? 60 :
    args.exercise_type === "none" ? 25 : 60;
  const recoveryDays = args.takes_recovery_days === true ? 100 : args.takes_recovery_days === false ? 40 : 65;
  const outdoor = clamp(Math.min(args.outdoor_hours_per_week ?? 3, 10) * 10);

  const recoveryCapacity = clamp(
    (sleepDuration * 1.3 + sleepQuality * 1.2 + refreshed * 0.8 +
     movement * 1.0 + exerciseQuality * 0.7 + recoveryDays * 0.8 + outdoor * 0.5) / 7.3
  );

  // ── Stress Load (higher score = HEAVIER load, 0–100) ─────────
  const workH = args.work_hours_per_week ?? 45;
  const workHoursLoad = clamp(Math.max(0, (workH - 35)) * 3); // 35h baseline → 0, 60h → 75
  const pressure = clamp((args.pressure_frequency ?? 5) * 10);
  const responsibility = clamp((args.responsibility_level ?? 5) * 10);
  const stressSelf = clamp((args.stress_level ?? 5) * 10);
  const eveningsWeekends =
    (args.works_evenings ? 50 : 0) + (args.works_weekends ? 50 : 0);
  const meetingLoad = clamp(((args.meeting_hours_per_day ?? 2) + (args.travel_hours_per_day ?? 0)) * 12);

  const stressLoad = clamp(
    (workHoursLoad * 1.2 + pressure * 1.1 + responsibility * 0.9 +
     stressSelf * 1.3 + eveningsWeekends * 0.8 + meetingLoad * 0.7) / 6.0
  );

  // ── Lifestyle Recovery (0–100, higher better) ────────────────
  let lifestyle = 90;
  const alc = args.alcohol_units_per_week ?? 4;
  if (alc > 21) lifestyle -= 30;
  else if (alc > 14) lifestyle -= 18;
  else if (alc > 7) lifestyle -= 8;
  const caf = args.caffeine_per_day ?? 2;
  if (caf > 5) lifestyle -= 15;
  else if (caf > 3) lifestyle -= 6;
  const water = args.water_liters_per_day ?? 1.5;
  if (water < 1) lifestyle -= 15;
  else if (water < 1.5) lifestyle -= 8;
  const lifestyleRecovery = clamp(lifestyle);

  // ── Resilience Score (0–100) ─────────────────────────────────
  const social = clamp((args.social_support ?? 5) * 10);
  const wlb = clamp((args.work_life_balance ?? 5) * 10);
  const energy = clamp((args.energy_level ?? 6) * 10);
  const motivation = clamp((args.motivation_level ?? 6) * 10);
  const stressInv = clamp(inv(args.stress_level ?? 5));

  let nutritionResilienceBoost = 0;
  let hasNutrition = false;
  if (args.nutrition) {
    hasNutrition = true;
    const n = args.nutrition;
    const nAvg = [(n.protein_score ?? 70), (n.hydration_score ?? 70), (n.recovery_score ?? 70), (n.muscle_preservation_score ?? 70)]
      .reduce((a, b) => a + b, 0) / 4;
    nutritionResilienceBoost = (nAvg - 70) * 0.3; // ±9 swing
  }

  const resilience = clamp(
    (social * 1.0 + wlb * 1.1 + energy * 1.1 + motivation * 1.0 + stressInv * 1.2 + recoveryCapacity * 0.6) / 6.0
    + nutritionResilienceBoost
  );

  // ── Burnout Risk Indicator (categorical, never a diagnosis) ──
  const burnoutScore = clamp(stressLoad * 0.55 + (100 - recoveryCapacity) * 0.30 + (100 - resilience) * 0.15);
  const burnoutRisk: "Low" | "Moderate" | "Elevated" =
    burnoutScore >= 65 ? "Elevated" : burnoutScore >= 40 ? "Moderate" : "Low";

  // ── Overall Executive Wellness Score ─────────────────────────
  const executiveWellness = clamp(
    recoveryCapacity * 0.30 +
    (100 - stressLoad) * 0.25 +
    resilience * 0.25 +
    lifestyleRecovery * 0.20
  );

  // ── Top contributors / weaknesses for "Fastest Wins" ─────────
  const factorScores = [
    { key: "Sleep duration", score: sleepDuration, win: "Anchor a fixed wake time and target 7.5 hours in bed for the next 14 nights." },
    { key: "Sleep quality", score: sleepQuality, win: "Dim screens 60 minutes before bed and keep the bedroom under 19°C." },
    { key: "Workload intensity", score: clamp(100 - workHoursLoad), win: "Protect two evenings per week as fully off-the-grid recovery time." },
    { key: "Recovery consistency", score: recoveryDays, win: "Schedule one full rest day and one walk-only day every week." },
    { key: "Movement", score: movement, win: "Add two resistance sessions per week — the largest single resilience lever for executives." },
    { key: "Hydration & lifestyle", score: lifestyleRecovery, win: "Increase water by 500 ml per day and cap alcohol at 7 units per week." },
    { key: "Stress regulation", score: stressInv, win: "Add a 10-minute slow-breathing block before lunch and before bed." },
    { key: "Social support", score: social, win: "Schedule one meaningful non-work conversation per week." },
    { key: "Work–life balance", score: wlb, win: "Block one full no-meeting half-day per week for deep recovery work." },
    { key: "Outdoor exposure", score: outdoor, win: "Get 20 minutes of outdoor daylight within an hour of waking." },
  ].sort((a, b) => a.score - b.score);

  const fastestWins = factorScores.slice(0, 3).map(f => ({ area: f.key, action: f.win }));

  // ── 7-Day Recovery Plan (free version) ───────────────────────
  const sevenDayPlan = [
    { day: "Day 1", focus: "Sleep reset", action: "Fixed wake time. Lights down 60 min before bed. No alcohol." },
    { day: "Day 2", focus: "Movement", action: "30–40 min resistance session. 1.5 L water minimum." },
    { day: "Day 3", focus: "Stress regulation", action: "Two 10-min slow-breathing blocks. One screen-free evening." },
    { day: "Day 4", focus: "Active recovery", action: "45-min outdoor walk. Cap caffeine at 2 cups before noon." },
    { day: "Day 5", focus: "Strength + nutrition", action: "Resistance session. 30g protein at breakfast. 2 L water." },
    { day: "Day 6", focus: "Full recovery day", action: "No meetings. 20 min daylight on waking. Early dinner." },
    { day: "Day 7", focus: "Reflection", action: "Score sleep, energy, stress. Re-plan the next 7 days." },
  ];

  return {
    inputs: {
      age,
      gender: args.gender ?? null,
      occupation: args.occupation ?? null,
      primary_goal: args.primary_goal ?? null,
      has_nutrition_integration: hasNutrition,
    },
    scores: {
      recovery_capacity: recoveryCapacity,
      stress_load: stressLoad,
      resilience,
      lifestyle_recovery: lifestyleRecovery,
      burnout_risk_score: burnoutScore,
      burnout_risk: burnoutRisk,
      executive_wellness: executiveWellness,
    },
    factor_breakdown: {
      sleep_duration: sleepDuration,
      sleep_quality: sleepQuality,
      wakes_refreshed: refreshed,
      movement,
      exercise_quality: exerciseQuality,
      recovery_days: recoveryDays,
      outdoor_exposure: outdoor,
      workload_intensity: clamp(100 - workHoursLoad),
      meeting_travel_load: clamp(100 - meetingLoad),
      pressure: clamp(100 - pressure),
      responsibility_carried: clamp(100 - responsibility),
      social_support: social,
      work_life_balance: wlb,
      energy_level: energy,
      motivation_level: motivation,
      stress_regulation: stressInv,
      hydration_alcohol_caffeine: lifestyleRecovery,
    },
    executive_summary:
      `Your current recovery capacity supports approximately ${recoveryCapacity}% of your performance demands. ` +
      `The largest limiting factors appear to be ${factorScores.slice(0, 3).map(f => f.key.toLowerCase()).join(", ")}. ` +
      `Small improvements in these areas may significantly improve resilience and energy over the next 30–90 days.`,
    burnout_note:
      burnoutRisk === "Elevated"
        ? "Current indicators suggest elevated accumulated stress and reduced recovery reserves. This is not a diagnosis. If these patterns persist or affect quality of life, consider a comprehensive executive wellness evaluation through WellneSpirit."
        : burnoutRisk === "Moderate"
        ? "Indicators show a moderate stress load relative to current recovery capacity. This is not a diagnosis — it is a signal to protect recovery time over the next several weeks."
        : "Current indicators show a healthy balance between stress load and recovery reserves. Maintain the routines that are working.",
    fastest_wins: fastestWins,
    seven_day_plan: sevenDayPlan,
    closing_recommendation:
      "Your recovery and resilience score suggests several opportunities to improve stress adaptation, energy management, and long-term performance. This assessment is educational only. If symptoms persist or are affecting your quality of life, consider a comprehensive executive wellness evaluation through WellneSpirit.",
    disclaimer:
      "This assessment is educational and informational only. It is not a medical diagnosis, psychological diagnosis, or burnout diagnosis. It should not replace consultation with a qualified healthcare professional.",
  };
}

// Backward-compat alias (legacy import name)
export const biologicalAgeAssessment = recoveryResilienceAssessment;
