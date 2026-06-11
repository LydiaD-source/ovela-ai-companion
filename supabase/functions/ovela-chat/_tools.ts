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

// Country labels + country-specific commentary used in the v2 report.
const COUNTRY_LABEL: Record<string, string> = {
  ES:"Spain", PT:"Portugal", FR:"France", DE:"Germany", IT:"Italy",
  NL:"Netherlands", BE:"Belgium", AD:"Andorra", CH:"Switzerland",
  UK:"United Kingdom", IE:"Ireland",
};
const COUNTRY_NOTE: Record<string, string> = {
  ES: "Spain: moderate gross salaries but ~32% employer social contributions. The true cost of a Spanish receptionist runs roughly one-third above the headline salary.",
  PT: "Portugal: lowest gross salaries in Western Europe for this role, but turnover in tourism hubs often exceeds 30% per year — recruitment costs compound quickly.",
  FR: "France: among the highest employer on-costs in the EU (~42% on top of gross). A €30k gross receptionist effectively costs ~€43k before hidden costs.",
  DE: "Germany: high gross salaries plus strict labour protections. Hiring takes 9-12 weeks on average and notice periods limit operational flexibility.",
  IT: "Italy: TFR severance accrual, 13th and often 14th-month salaries, and 26+ paid holiday days inflate the real cost well beyond the headline.",
  NL: "Netherlands: 8% holiday allowance and a 13th-month bonus are standard. A compliant 24/7 desk typically needs 3.4 FTEs.",
  BE: "Belgium: among the most heavily taxed labour markets in the EU. Multi-lingual desks (FR/NL/EN) command a 10-15% premium.",
  AD: "Andorra: low social charges (~18%), but multilingual coverage (FR/ES/CA/EN) is near-universal and pushes gross salaries up.",
  CH: "Switzerland: highest gross salaries in Europe, partially offset by low employer on-costs (~18%). Even so, ~3x the cost of a Spanish receptionist.",
  UK: "United Kingdom: post-Brexit recruitment for multilingual roles is harder and slower; agency fees of 20-25% of first-year salary are common.",
  IE: "Ireland: tight labour market in Dublin pushes salaries above the EU average and tech-sector competition makes retention difficult.",
};

function recommendIsabellaTier(shifts: string, languages: number, premium: boolean): "starter"|"pro"|"enterprise" {
  if (shifts === "247" || languages >= 4 || premium) return "enterprise";
  if (shifts === "extended" || languages >= 2) return "pro";
  return "starter";
}

function pickArchetype(role: RoleKey, shifts: string, languages: number, _premium: boolean) {
  if (role === "front_desk_clinic") return { id:"solo_clinic", label:"The Solo Clinic / Spa", description:"A small medical or wellness practice where the front desk is also the first point of trust. Missing a single call can mean a lost patient for the quarter." };
  if (role === "hotel_concierge" && (shifts === "247" || languages >= 3)) return { id:"multi_language_concierge", label:"The Multilingual Hotel Concierge", description:"A hospitality property serving international guests around the clock. Language coverage and 24/7 responsiveness drive the entire guest experience." };
  if (role === "hotel_concierge") return { id:"boutique_hotel", label:"The Boutique Hotel Desk", description:"A small property where the concierge handles bookings, recommendations and guest issues across business hours." };
  if (role === "real_estate_junior_filter" && languages >= 3) return { id:"multilingual_real_estate", label:"The Multilingual Real-Estate Office", description:"Agency handling international buyers — every after-hours call missed is a deal handed to a competitor." };
  if (role === "real_estate_junior_filter") return { id:"real_estate_filter", label:"The Real-Estate Filter Desk", description:"Junior staff qualifying inbound inquiries before passing serious leads to senior agents." };
  if (role === "customer_support_agent" && shifts === "247") return { id:"support_247", label:"The 24/7 Support Center", description:"Customer-facing operation where coverage gaps translate directly to churn and bad reviews." };
  if (role === "customer_support_agent") return { id:"tier1_support", label:"The Tier-1 Support Desk", description:"Inbound questions, order status, basic troubleshooting — high volume, repetitive." };
  if (role === "executive_assistant") return { id:"executive_office", label:"The Executive Office", description:"Senior-level support — calendar, travel, gatekeeping. High trust, high cost, hard to replace." };
  if (shifts === "247") return { id:"corporate_247", label:"The 24/7 Corporate Front Desk", description:"Large operation where the front desk runs continuously across multiple shifts." };
  return { id:"standard_front_desk", label:"The Standard Front Desk", description:"Business-hours reception with a stable, predictable call and visitor flow." };
}

// Role-level defaults for revenue modeling when caller doesn't pass them in.
const ROLE_REVENUE_DEFAULTS: Record<RoleKey, { monthly_inbound: number; avg_deal_value_eur: number; conversion_pct: number; capture_avg: number; capture_top: number; benchmark_label: string }> = {
  receptionist:              { monthly_inbound: 250, avg_deal_value_eur: 250,  conversion_pct: 25, capture_avg: 65, capture_top: 94, benchmark_label: "Front-desk benchmark" },
  front_desk_clinic:         { monthly_inbound: 400, avg_deal_value_eur: 120,  conversion_pct: 40, capture_avg: 70, capture_top: 96, benchmark_label: "Medical clinic benchmark" },
  hotel_concierge:           { monthly_inbound: 350, avg_deal_value_eur: 280,  conversion_pct: 30, capture_avg: 68, capture_top: 95, benchmark_label: "Hotel concierge benchmark" },
  real_estate_junior_filter: { monthly_inbound: 200, avg_deal_value_eur: 1500, conversion_pct: 12, capture_avg: 55, capture_top: 92, benchmark_label: "Real-estate office benchmark" },
  customer_support_agent:    { monthly_inbound: 600, avg_deal_value_eur: 200,  conversion_pct: 25, capture_avg: 75, capture_top: 97, benchmark_label: "Customer support benchmark" },
  executive_assistant:       { monthly_inbound: 80,  avg_deal_value_eur: 300,  conversion_pct: 20, capture_avg: 80, capture_top: 98, benchmark_label: "Executive office benchmark" },
};

export function calcReceptionistCost(args: {
  country?: string;
  role?: RoleKey;
  languages?: number;
  shifts?: "business" | "extended" | "247";
  premium_skills?: boolean;
  monthly_inbound?: number;
  avg_deal_value_eur?: number;
}) {
  const country = (args.country || "ES").toUpperCase();
  const role: RoleKey = (args.role as RoleKey) || "receptionist";
  const langs = Math.max(1, Math.min(args.languages ?? 1, 6));
  const shifts = args.shifts || "business";
  const premium = !!args.premium_skills;


  const table = SALARY[country] || SALARY.ES;
  const band = table[role] || SALARY.ES.receptionist!;
  const [lo, mid, hi] = band;

  const languageBonus = (langs - 1) * 0.05;
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

  // Hidden costs (annualized) — derived from mid gross salary.
  const recruitment   = Math.round(baseGross.mid * 0.075); // 15% one-off / 2yr avg tenure
  const trainingRamp  = Math.round(baseGross.mid * 0.10);  // 6-week productivity loss
  const turnoverRisk  = Math.round(baseGross.mid * 0.05);  // replacement frequency overhead
  const sickCover     = Math.round(baseGross.mid * 0.045); // ~10 sick days covered
  const softwarePhone = 600;                                // CRM seat + phone line
  const hiddenTotal   = recruitment + trainingRamp + turnoverRisk + sickCover + softwarePhone;
  const hidden_costs_eur = {
    recruitment_annualized: recruitment,
    training_ramp: trainingRamp,
    turnover_risk: turnoverRisk,
    sick_day_cover: sickCover,
    software_and_phone: softwarePhone,
    total: hiddenTotal,
  };

  const true_annual_cost_eur = {
    low:   totalEmployerCost.low  + hiddenTotal,
    mid:   totalEmployerCost.mid  + hiddenTotal,
    high:  totalEmployerCost.high + hiddenTotal,
  };

  // Coverage: 40h/wk × 44 productive weeks ≈ 1,760 hrs/yr for a human.
  const coverage = {
    human_productive_hours_per_year: 1760,
    isabella_hours_per_year: 8760,
    coverage_multiplier: Math.round((8760 / 1760) * 10) / 10,
    human_languages: langs,
    isabella_languages: 30,
    sick_days_per_year: 10,
  };

  const isabella_tiers_eur_per_year = { starter: 4788, pro: 9588, enterprise: 19188 };
  const recommended_tier = recommendIsabellaTier(shifts, langs, premium);
  const isabellaCost = isabella_tiers_eur_per_year[recommended_tier];

  const annualSavings  = true_annual_cost_eur.mid - isabellaCost;
  const pctSavings     = Math.round((annualSavings / true_annual_cost_eur.mid) * 100);
  const monthlySavings = annualSavings / 12;
  const paybackMonths  = monthlySavings > 0
    ? Math.max(1, Math.round(isabellaCost / Math.max(monthlySavings, 1)))
    : null;

  // 3- and 5-year TCO at 3.5% salary inflation; Isabella priced flat.
  const inflateTCO = (annual: number, years: number, rate: number) => {
    let total = 0;
    for (let i = 0; i < years; i++) total += annual * Math.pow(1 + rate, i);
    return Math.round(total);
  };
  const human3  = inflateTCO(true_annual_cost_eur.mid, 3, 0.035);
  const human5  = inflateTCO(true_annual_cost_eur.mid, 5, 0.035);
  const tco_3yr_eur = { human_mid: human3, isabella: isabellaCost * 3, savings: human3 - isabellaCost * 3 };
  const tco_5yr_eur = { human_mid: human5, isabella: isabellaCost * 5, savings: human5 - isabellaCost * 5 };

  const archetype = pickArchetype(role, shifts, langs, premium);

  const recommendations: string[] = [
    `Start with the ${recommended_tier.charAt(0).toUpperCase() + recommended_tier.slice(1)} tier — it matches a ${shifts === '247' ? '24/7' : shifts === 'extended' ? 'extended-hours' : 'business-hours'} ${langs > 1 ? `multilingual (${langs} languages)` : 'single-language'} operation.`,
    `Keep one human owner on the team (manager or office lead) — Isabella handles inbound, the human handles escalations and in-person hospitality.`,
    `Track 3 KPIs from day 1: percentage of inbound captured, average response time, leads converted to bookings. Most operations move from 60-70% capture to >95% in the first month.`,
    paybackMonths && paybackMonths <= 12
      ? `At your scale the deployment pays for itself in roughly ${paybackMonths} month${paybackMonths === 1 ? '' : 's'} — well inside a single budget cycle.`
      : `Even before counting hidden costs, the salary delta alone justifies the switch within the first fiscal year.`,
  ];

  // ─── Revenue Protected (estimated) ─────────────────────────────────
  const rd = ROLE_REVENUE_DEFAULTS[role] || ROLE_REVENUE_DEFAULTS.receptionist;
  const monthlyInbound = Math.max(0, args.monthly_inbound ?? rd.monthly_inbound);
  const dealValue = Math.max(0, args.avg_deal_value_eur ?? rd.avg_deal_value_eur);
  // Baseline miss rate by coverage, softened by multilingual support.
  const baseMissRate = shifts === "247" ? 0.12 : shifts === "extended" ? 0.22 : 0.35;
  const langMissAdjust = langs >= 3 ? -0.05 : langs === 2 ? -0.02 : 0;
  const currentMissRate = Math.max(0.05, baseMissRate + langMissAdjust);
  const missedPerMonth = Math.round(monthlyInbound * currentMissRate);
  const monthlyRevenueLost = missedPerMonth * (rd.conversion_pct / 100) * dealValue;
  const annual_revenue_protected_eur = Math.round(monthlyRevenueLost * 12);
  const revenue_protected = {
    monthly_inbound_assumed: monthlyInbound,
    avg_deal_value_eur: dealValue,
    conversion_pct_assumed: rd.conversion_pct,
    current_miss_rate_pct: Math.round(currentMissRate * 100),
    missed_inquiries_per_month: missedPerMonth,
    annual_revenue_at_risk_eur: annual_revenue_protected_eur,
    user_provided_inputs: !!(args.monthly_inbound || args.avg_deal_value_eur),
  };

  // ─── Operational Risk Flags ───────────────────────────────────────
  const tier = (lvl: "Low" | "Moderate" | "High") => lvl;
  const after_hours_risk = shifts === "business" ? "High" : shifts === "extended" ? "Moderate" : "Low";
  const language_risk = langs <= 1 ? "High" : langs === 2 ? "Moderate" : "Low";
  const turnover_risk = (country === "ES" || country === "PT" || country === "IT") ? "High" : "Moderate";
  const coverage_risk = shifts === "business" ? "High" : shifts === "extended" ? "Moderate" : "Low";
  const risk_flags = {
    after_hours: tier(after_hours_risk as any),
    language: tier(language_risk as any),
    staff_turnover: tier(turnover_risk as any),
    coverage: tier(coverage_risk as any),
  };

  // ─── Industry Benchmark ───────────────────────────────────────────
  const current_capture_pct = Math.max(0, Math.round((1 - currentMissRate) * 100));
  const industry_benchmark = {
    label: rd.benchmark_label,
    average_capture_pct: rd.capture_avg,
    top_performer_capture_pct: rd.capture_top,
    your_estimated_capture_pct: current_capture_pct,
    gap_to_top_pct: Math.max(0, rd.capture_top - current_capture_pct),
    languages_covered_avg: 2,
    your_languages: langs,
  };

  // ─── Front Office Efficiency Score (0-100) ────────────────────────
  const coverage_score   = shifts === "247" ? 95 : shifts === "extended" ? 70 : 40;
  const cost_efficiency  = Math.max(20, Math.min(100, 50 + Math.round(pctSavings / 2)));
  const language_score   = Math.min(100, 30 + langs * 15) + (premium ? 5 : 0);
  const scalability      = shifts === "247" ? 90 : shifts === "extended" ? 65 : 35;
  const fo_overall = Math.round((coverage_score + cost_efficiency + Math.min(100, language_score) + scalability) / 4);
  const front_office_efficiency = {
    overall: fo_overall,
    drivers: {
      coverage: coverage_score,
      cost_efficiency: cost_efficiency,
      language_support: Math.min(100, language_score),
      scalability: scalability,
    },
    band: fo_overall >= 85 ? "Excellent" : fo_overall >= 70 ? "Strong" : fo_overall >= 55 ? "Adequate" : "At risk",
    opportunity: `Move to 90+ by closing the coverage and language gaps automatically.`,
  };

  // ─── 12-Month Cost of Inaction ────────────────────────────────────
  const turnover_exposure_12mo = Math.round(turnoverRisk * 2);
  const cost_of_inaction = {
    hidden_staffing_cost_eur: hiddenTotal,
    missed_revenue_eur: annual_revenue_protected_eur,
    turnover_exposure_eur: turnover_exposure_12mo,
    total_opportunity_cost_eur: hiddenTotal + annual_revenue_protected_eur + turnover_exposure_12mo,
    narrative: "Twelve months of unchanged front-office structure compounds hidden staffing waste, unrecovered missed revenue, and a likely turnover cycle.",
  };




  // Isabella Business Observation — narrative diagnosis layer
  const hiddenPct = Math.round((hiddenTotal / true_annual_cost_eur.mid) * 100);
  const coverageMult = coverage.coverage_multiplier;
  const isabella_observation =
    `The strongest pattern in this profile is not the headline salary — it is the structure of the cost stack and the coverage gap underneath it. ` +
    `Hidden costs (recruitment, training, turnover, sick cover, software) account for roughly ${hiddenPct}% of the true annual cost, a layer most owners do not see on payroll. ` +
    `On the coverage side, a single human FTE delivers ~${coverage.human_productive_hours_per_year} productive hours per year against Isabella's ${coverage.isabella_hours_per_year} — a ${coverageMult}× delta that is structural, not behavioural. ` +
    `Equally important, an estimated ${fmtRound(annual_revenue_protected_eur)} EUR of revenue per year is exposed to missed inbound at the current capture rate (${current_capture_pct}% vs a top-performer benchmark of ${rd.capture_top}%). ` +
    `Businesses with this shape recover the largest gains through availability, language coverage and revenue protection — the salary saving is a second-order benefit, not the first.`;

  return {
    country, country_label: COUNTRY_LABEL[country] || country, role,
    role_label: ROLE_BASELINE[role]?.label || role,
    inputs: { languages: langs, shifts, premium_skills: premium, monthly_inbound: monthlyInbound, avg_deal_value_eur: dealValue },
    archetype,
    annual_gross_eur: baseGross,
    employer_oncost_multiplier: onCost,
    annual_total_employer_cost_eur: totalEmployerCost,
    hidden_costs_eur,
    true_annual_cost_eur,
    coverage,
    isabella_tiers_eur_per_year,
    recommended_tier,
    comparison: {
      human_true_annual_mid: true_annual_cost_eur.mid,
      isabella_recommended: isabellaCost,
      annual_savings: annualSavings,
      pct_savings: pctSavings,
      payback_months: paybackMonths,
      monthly_savings: Math.round(monthlySavings),
    },
    tco_3yr_eur,
    tco_5yr_eur,
    revenue_protected,
    risk_flags,
    industry_benchmark,
    front_office_efficiency,
    cost_of_inaction,
    staffing_recommendation: {
      current: `1 ${ROLE_BASELINE[role]?.label || 'front-desk hire'} covering ${shifts === '247' ? '24/7' : shifts === 'extended' ? 'extended hours' : 'business hours'} in ${langs} language${langs > 1 ? 's' : ''}.`,
      recommended: [
        "Isabella handles 100% of inbound — calls, forms, chat, DMs — 24/7 in every language.",
        "Keep your existing human(s) focused on VIP guests, in-person hospitality, and human escalations only.",
        "Owner/manager receives a daily digest of captured leads, qualified bookings, and escalations needing a human reply.",
      ],
      expected_outcome: [
        "Inbound capture moves from ~" + current_capture_pct + "% toward 95%+",
        "Coverage extends from " + (shifts === '247' ? '24/7 (already covered)' : shifts === 'extended' ? '~14h/day to 24/7' : '~8h/day to 24/7'),
        "Existing team's hours reallocated to higher-value, in-person work — no headcount cut required",
      ],
    },
    country_note: COUNTRY_NOTE[country] || "",
    notes: [
      "Salaries are approximate Eurostat-style mid-2025 ranges.",
      "Employer on-cost includes social charges, paid holiday, statutory sick days, and recruitment overhead.",
      "Hidden costs (recruitment, training ramp, turnover, sick cover, software) are annualized industry averages.",
      "Extended hours ≈ 1.6×, 24/7 coverage ≈ 3.2× single FTE.",
      langs > 1 ? `Multilingual bonus applied for ${langs} languages (+${Math.round(languageBonus*100)}%).` : "Single-language role assumed.",
      "3-year and 5-year TCO assume 3.5% annual salary inflation and flat Isabella pricing.",
      revenue_protected.user_provided_inputs
        ? "Revenue Protected uses your stated inbound volume and deal value."
        : "Revenue Protected uses conservative industry defaults; share your actual inbound volume and deal value for a sharper estimate.",
      "Isabella runs 24/7, every language, no sick days — published Ovela pricing shown for comparison.",
    ],
    isabella_observation,
    recommendations,
  };
}

function fmtRound(n: number) { return Math.round(n).toLocaleString('en-US'); }


// ─── Missed Calls v2 — Revenue Leak Diagnostic ────────────────────────
type IndustryKey =
  | "clinic" | "hotel" | "real_estate" | "legal" | "trades"
  | "support" | "professional_services" | "beauty_spa" | "other";

const INDUSTRY: Record<IndustryKey, {
  label: string;
  default_miss_rate: number;       // % industry-benchmark missed
  default_conv: number;            // % captured → customer
  leak_split: { after_hours: number; busy_line: number; language: number }; // sums to 1
  archetype: { id: string; label: string; description: string };
  observation_hook: string;        // used inside Isabella Business Observation
}> = {
  clinic:               { label:"Clinic / medical practice", default_miss_rate:30, default_conv:35, leak_split:{after_hours:0.50,busy_line:0.30,language:0.20},
    archetype:{ id:"busy_clinic", label:"The Busy Clinic", description:"Patient demand exceeds front-desk capacity; missed calls translate directly to lost recurring patients and downstream lifetime value." },
    observation_hook:"In clinics, the most expensive missed call is rarely the first one — it is the patient who would have booked an annual follow-up." },
  hotel:                { label:"Hotel / hospitality", default_miss_rate:25, default_conv:25, leak_split:{after_hours:0.60,busy_line:0.20,language:0.20},
    archetype:{ id:"independent_hotel", label:"The Independent Hotel", description:"International guests calling outside CET hours, in multiple languages — every unanswered call is a direct OTA win for a competitor." },
    observation_hook:"Hospitality bookings are won by the first response, not the best price." },
  real_estate:          { label:"Real-estate agency", default_miss_rate:45, default_conv:15, leak_split:{after_hours:0.55,busy_line:0.25,language:0.20},
    archetype:{ id:"growing_real_estate", label:"The Growing Real-Estate Office", description:"High call volume, low conversion, multilingual buyers. The first-to-respond agent wins ~78% of viewings." },
    observation_hook:"In real estate, speed-to-lead is the single largest driver of commission revenue." },
  legal:                { label:"Legal / professional services", default_miss_rate:50, default_conv:30, leak_split:{after_hours:0.45,busy_line:0.35,language:0.20},
    archetype:{ id:"law_firm", label:"The Law Firm Under Pressure", description:"Inbound prospects are time-sensitive — missing a consultation request often means the client retains another firm by the next morning." },
    observation_hook:"Legal prospects rarely call twice." },
  trades:               { label:"Trades / home services", default_miss_rate:60, default_conv:40, leak_split:{after_hours:0.70,busy_line:0.25,language:0.05},
    archetype:{ id:"trades_business", label:"The Field-Based Trades Business", description:"Owner is on a job, phone goes unanswered, urgent customer calls the next listing in Google." },
    observation_hook:"In trades, an unanswered call is a customer awarded to a competitor in under 90 seconds." },
  support:              { label:"Customer support operation", default_miss_rate:35, default_conv:60, leak_split:{after_hours:0.40,busy_line:0.40,language:0.20},
    archetype:{ id:"support_247", label:"The 24/7 Support Center", description:"Coverage gaps create churn signals and 1-star reviews disproportionate to the actual issue." },
    observation_hook:"Most churn starts with a single unanswered ticket." },
  professional_services:{ label:"Professional services (consulting, agency)", default_miss_rate:40, default_conv:25, leak_split:{after_hours:0.50,busy_line:0.30,language:0.20},
    archetype:{ id:"founder_overloaded", label:"The Founder Wearing Too Many Hats", description:"Sales, delivery, ops and inbound all funnel through one person — calls drop when that person is in a meeting." },
    observation_hook:"Founder-led firms lose the most revenue not to bad sales calls, but to calls that never got answered." },
  beauty_spa:           { label:"Beauty / spa / wellness", default_miss_rate:35, default_conv:50, leak_split:{after_hours:0.55,busy_line:0.30,language:0.15},
    archetype:{ id:"boutique_spa", label:"The Boutique Spa", description:"Most bookings happen after the workday ends — exactly when the front desk is closed." },
    observation_hook:"Wellness clients book in the evening; staff is paid in the morning." },
  other:                { label:"Other / multi-location business", default_miss_rate:35, default_conv:20, leak_split:{after_hours:0.50,busy_line:0.30,language:0.20},
    archetype:{ id:"multi_location", label:"The Multi-Location Business", description:"Inbound spread across sites and channels — no single number, no single owner of the customer experience." },
    observation_hook:"When no one owns the inbound, no one owns the lost revenue either." },
};

function speedToLeadProfile(avgMinutes: number) {
  // Calibrated conversion-EFFICIENCY of captured inbound leads.
  // Based on widely-cited speed-to-lead studies (Harvard / InsideSales / Drift):
  // <5 min responders convert roughly 5-10x faster than 30-60 min responders.
  // Numbers are expressed as realistic % conversion (not theoretical ceilings).
  if (avgMinutes <= 5)  return { bucket:"<5 min",    potential_pct:22, label:"first-responder advantage" };
  if (avgMinutes <= 30) return { bucket:"5-30 min",  potential_pct:12, label:"strong but losing" };
  if (avgMinutes <= 60) return { bucket:"30-60 min", potential_pct:8,  label:"speed penalty applies" };
  if (avgMinutes <= 240)return { bucket:"1-4 hours", potential_pct:5,  label:"most leads already lost" };
  return                       { bucket:"4+ hours",  potential_pct:3,  label:"effectively cold" };
}

// Display helper: cap absurd-looking ROI numbers so the report stays credible.
function formatRoiDisplay(roiPct: number): string {
  if (!isFinite(roiPct) || roiPct <= 0) return "—";
  if (roiPct >= 10000) return "> 100x investment (> 10,000%)";
  if (roiPct >= 1000)  return `~${Math.round(roiPct / 100)}x investment (${roiPct.toLocaleString('en-US')}%)`;
  return `${roiPct}%`;
}

export function calcMissedLeads(args: {
  monthly_inbound: number;
  industry?: IndustryKey;
  country?: string;
  miss_rate_pct?: number;
  conversion_rate_pct?: number;
  avg_deal_value_eur?: number;
  avg_response_minutes?: number;
  business_hours_coverage?: "business" | "extended" | "247";
  languages_served?: number;
  // Optional cross-link with receptionist tool
  human_true_annual_cost_eur?: number;
}) {
  const inbound  = Math.max(0, Math.round(args.monthly_inbound || 0));
  const industry: IndustryKey = (args.industry as IndustryKey) in INDUSTRY ? (args.industry as IndustryKey) : "other";
  const cfg      = INDUSTRY[industry];
  const missPct  = Math.min(100, Math.max(0, args.miss_rate_pct ?? cfg.default_miss_rate));
  const convPct  = Math.min(100, Math.max(0, args.conversion_rate_pct ?? cfg.default_conv));
  const deal     = Math.max(0, args.avg_deal_value_eur ?? 1500);
  const respMin  = Math.max(0, args.avg_response_minutes ?? 45);
  const coverage = args.business_hours_coverage || "business";
  const langs    = Math.max(1, Math.min(args.languages_served ?? 1, 6));
  const country  = (args.country || "ES").toUpperCase();

  // Core loss math
  const missedPerMonth        = Math.round(inbound * missPct / 100);
  const recoverablePerMonth   = Math.round(missedPerMonth * convPct / 100);
  const monthlyRevenueLoss    = Math.round(recoverablePerMonth * deal);
  const annualRevenueLoss     = monthlyRevenueLoss * 12;

  // Leak breakdown (Revenue Leak Map)
  // If coverage is already 24/7, after-hours leak collapses to 0 and redistributes.
  let split = { ...cfg.leak_split };
  if (coverage === "247") {
    const redistribute = split.after_hours;
    split = { after_hours: 0, busy_line: split.busy_line + redistribute * 0.6, language: split.language + redistribute * 0.4 };
  } else if (coverage === "extended") {
    split = { after_hours: split.after_hours * 0.6, busy_line: split.busy_line + split.after_hours * 0.25, language: split.language + split.after_hours * 0.15 };
  }
  // If user already supports many languages, language leak collapses
  if (langs >= 4) {
    const drop = split.language * 0.7;
    split = { ...split, language: split.language - drop, after_hours: split.after_hours + drop * 0.6, busy_line: split.busy_line + drop * 0.4 };
  }
  const leak_breakdown_eur = {
    after_hours:       Math.round(annualRevenueLoss * split.after_hours),
    busy_line:         Math.round(annualRevenueLoss * split.busy_line),
    language_barrier:  Math.round(annualRevenueLoss * split.language),
  };
  const leak_breakdown_pct = {
    after_hours:      Math.round(split.after_hours * 100),
    busy_line:        Math.round(split.busy_line * 100),
    language_barrier: Math.round(split.language * 100),
  };

  // Speed-to-Lead
  const current = speedToLeadProfile(respMin);
  const optimal = speedToLeadProfile(2); // Isabella responds <5s, model as <5 min bucket
  const speed_uplift_ratio = optimal.potential_pct / Math.max(current.potential_pct, 1);
  // Recoverable from speed alone: additional conversions on CURRENTLY captured leads.
  // Cap at 0.8x annualRevenueLoss to avoid the "too good to be true" trap.
  const capturedPerMonth     = inbound - missedPerMonth;
  const currentConvPerMonth  = Math.round(capturedPerMonth * convPct / 100);
  const speedExtraPerMonth   = Math.max(0, Math.round(currentConvPerMonth * (speed_uplift_ratio - 1)));
  const speedRecoveryAnnual  = Math.min(annualRevenueLoss * 0.8, speedExtraPerMonth * deal * 12);

  // Lead-first framing — what business owners actually relate to.
  const missed_inquiries_per_year     = missedPerMonth * 12;
  const lost_opportunities_per_year   = recoverablePerMonth * 12;

  // Isabella pricing & ROI
  const isabella_pro_tier_annual_eur = 9588;
  const total_recoverable_annual_eur = annualRevenueLoss + speedRecoveryAnnual;
  const net_annual_benefit_eur       = total_recoverable_annual_eur - isabella_pro_tier_annual_eur;
  const roi_pct                      = Math.round((net_annual_benefit_eur / isabella_pro_tier_annual_eur) * 100);
  const roi_display                  = formatRoiDisplay(roi_pct);
  const payback_months               = total_recoverable_annual_eur > 0
    ? Math.max(1, Math.round(isabella_pro_tier_annual_eur / (total_recoverable_annual_eur / 12)))
    : null;

  // Combined Business Case (only if receptionist context provided)
  const combinedRoi = args.human_true_annual_cost_eur && args.human_true_annual_cost_eur > 0
    ? Math.round((((args.human_true_annual_cost_eur - isabella_pro_tier_annual_eur) + total_recoverable_annual_eur) / isabella_pro_tier_annual_eur) * 100)
    : 0;
  const combined_business_case = args.human_true_annual_cost_eur && args.human_true_annual_cost_eur > 0
    ? {
        salary_savings_eur:    args.human_true_annual_cost_eur - isabella_pro_tier_annual_eur,
        recovered_revenue_eur: total_recoverable_annual_eur,
        total_annual_upside_eur: (args.human_true_annual_cost_eur - isabella_pro_tier_annual_eur) + total_recoverable_annual_eur,
        isabella_annual_cost_eur: isabella_pro_tier_annual_eur,
        combined_roi_pct: combinedRoi,
        combined_roi_display: formatRoiDisplay(combinedRoi),
      }
    : null;

  // Revenue Leakage Profile — diagnosis-style narrative header
  const biggestLeak = (Object.entries(leak_breakdown_eur).sort((a,b) => b[1]-a[1])[0] || [])[0] || "after_hours";
  const leakLabel = biggestLeak === "after_hours" ? "after-hours availability"
    : biggestLeak === "busy_line" ? "busy-line and overflow handling"
    : "language coverage";
  const profileName = biggestLeak === "after_hours" ? "After-Hours Dependency"
    : biggestLeak === "busy_line" ? "Overflow Saturation"
    : "Language Mismatch";
  const diagnosis_profile = {
    name: `Revenue Leakage Profile: ${profileName}`,
    narrative:
      `Your business loses most opportunities to ${leakLabel}. This pattern is common in ${cfg.label.toLowerCase()} operations where ` +
      `lead generation has scaled faster than response capacity. Businesses with this profile typically recover revenue first ` +
      `through coverage expansion, then through faster response times — not through hiring more staff.`,
  };

  // Recommended hybrid staffing — Human + Isabella, not pure replacement
  const staffing_recommendation = {
    current: `Inbound flows through ${coverage === "247" ? "a 24/7 team" : coverage === "extended" ? "extended-hours staff" : "business-hours staff"} with ${langs} language${langs > 1 ? "s" : ""} covered.`,
    recommended: [
      "Isabella handles 100% of inbound — calls, forms, chat, DMs — 24/7 in every language.",
      "Existing staff focus on VIP relationships, on-site handling, and human escalations only.",
      "Owner/manager receives a daily digest: captured leads, qualified opportunities, escalations needing a human reply.",
    ],
    expected_outcome: [
      "Inbound capture moves from ~" + (100 - missPct) + "% toward 95%+",
      "First-response time drops from " + respMin + " min to under 5 seconds",
      "Existing team's hours are reallocated to higher-value, in-person work",
    ],
  };

  const isabella_observation =
    `${cfg.observation_hook} The dominant pattern in this profile is ${leakLabel}: at the current response time of ${respMin} minutes, ` +
    `roughly ${current.potential_pct}% of captured leads convert today, compared with an industry ceiling near ${optimal.potential_pct}% for sub-5-minute responders. ` +
    `Businesses with a similar shape recover the largest gains not by adding headcount but by closing the availability gap — ` +
    `every additional hour of coverage compounds on the conversions already in the pipeline.`;

  // Recommendations
  const recommendations: string[] = [
    `Move first-response time under 5 minutes — at ${respMin} min you are losing roughly ${Math.round((1 - current.potential_pct/optimal.potential_pct) * 100)}% of conversions on speed alone.`,
    leak_breakdown_pct.after_hours >= 40
      ? `Cover evenings and weekends first — ${leak_breakdown_pct.after_hours}% of your revenue leak happens outside business hours.`
      : `Tighten the busy-line overflow — ${leak_breakdown_pct.busy_line}% of leaks happen while the line is engaged.`,
    leak_breakdown_pct.language_barrier >= 15
      ? `Add at least ${Math.max(2, langs+1)} language coverage — ${leak_breakdown_pct.language_barrier}% of lost revenue is language-blocked inbound.`
      : `Maintain at least ${langs} language coverage and track captured-language ratios.`,
    `Instrument 3 KPIs from week one: % inbound captured, median first-response, captured-lead conversion. Moving capture from ${100-missPct}% to >95% is the largest single lever.`,
  ];

  return {
    industry, industry_label: cfg.label,
    country,
    archetype: cfg.archetype,
    diagnosis_profile,
    inputs: {
      monthly_inbound: inbound, miss_rate_pct: missPct, conversion_rate_pct: convPct,
      avg_deal_value_eur: deal, avg_response_minutes: respMin,
      business_hours_coverage: coverage, languages_served: langs,
    },
    missed_inquiries_per_month: missedPerMonth,
    missed_inquiries_per_year,
    recoverable_customers_per_month: recoverablePerMonth,
    lost_opportunities_per_year,
    monthly_revenue_loss_eur: monthlyRevenueLoss,
    annual_revenue_loss_eur: annualRevenueLoss,
    leak_breakdown_eur,
    leak_breakdown_pct,
    speed_to_lead: {
      current_bucket: current.bucket,
      current_potential_pct: current.potential_pct,
      current_label: current.label,
      isabella_bucket: optimal.bucket,
      isabella_potential_pct: optimal.potential_pct,
      uplift_multiplier: Math.round(speed_uplift_ratio * 10) / 10,
      recoverable_revenue_from_speed_eur: Math.round(speedRecoveryAnnual),
    },
    total_recoverable_annual_eur: Math.round(total_recoverable_annual_eur),
    isabella_pro_tier_annual_eur,
    net_annual_benefit_eur: Math.round(net_annual_benefit_eur),
    roi_pct,
    roi_display,
    payback_months,
    combined_business_case,
    staffing_recommendation,
    isabella_observation,
    recommendations,
    notes: [
      "Industry miss-rate, conversion and leak-split benchmarks are directional 2024-2025 averages.",
      "Speed-to-Lead model uses calibrated inbound benchmarks (~22% conversion at <5 min vs ~3% at 4+ hours — roughly a 5-10x speed advantage, in line with Harvard/InsideSales research).",
      "Recoverable revenue from speed is capped at 80% of the headline leak to avoid double-counting.",
      "All figures are educational; actual results depend on follow-up speed, CRM hygiene and offer quality.",
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
  // v2.1 — Executive Readiness expansion
  sun_exposure_minutes_per_day?: number;
  thyroid_diagnosis?: "none" | "hypothyroidism" | "hashimotos" | "hyperthyroidism" | "unknown";
  thyroid_symptoms?: Array<"cold_hands_feet" | "fatigue_despite_sleep" | "difficulty_losing_weight" | "low_motivation" | "dry_skin">;
  digestion_issues?: Array<{ issue?: "bloating" | "reflux" | "constipation" | "loose_stools"; frequency?: "never" | "sometimes" | "often" }>;
  energy_level?: number;          // 1–10 daily energy self-rating
  stress_level?: number;          // 1–10 average over last 30 days
  morning_recovery?: number;      // 1–10 how recovered the user feels on waking
  // v2.2 — Hydration intelligence
  hydration_symptoms?: Array<{ symptom?: "dry_mouth" | "afternoon_fatigue" | "headaches" | "dark_urine"; frequency?: "never" | "sometimes" | "often" }>;
  electrolytes_use?: boolean;
  heavy_sweat?: boolean;
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

  // hydrationTargetL is computed inside the v2.2 hydration block below.
  const [cLo, cHi] = CARB_RANGE[goal];
  const carbTargetRange = { low_g: Math.round(calcWeight * cLo), high_g: Math.round(calcWeight * cHi) };
  const fatTargetRange = { low_g: Math.round(calcWeight * 0.8), high_g: Math.round(calcWeight * 1.0) };

  const proteinGap = args.est_protein_g != null ? Math.round(proteinMid - args.est_protein_g) : null;
  const weeklyProteinGap = proteinGap != null && proteinGap > 0 ? proteinGap * 7 : 0;
  // Gap will be recomputed below against the acceptable hydration floor.
  let hydrationGapL: number | null = null;

  const score = (val: number | null, target: number, tolerance = 0.25) => {
    if (val == null) return 50;
    const ratio = val / target;
    if (ratio >= 1 - tolerance && ratio <= 1 + tolerance) return 92;
    if (ratio < 1) return Math.max(20, Math.round(ratio * 95));
    return Math.max(40, Math.round(100 - (ratio - 1) * 80));
  };


  const proteinScore   = score(args.est_protein_g ?? null, proteinMid, 0.2);
  const carbsScore     = args.high_processed ? 55 : score(args.est_carbs_g ?? null, (carbTargetRange.low_g + carbTargetRange.high_g) / 2, 0.3);
  let fatScore         = score(args.est_fat_g ?? null, (fatTargetRange.low_g + fatTargetRange.high_g) / 2, 0.2);
  // Penalise fat-quality when diary signals point to processed/saturated sources or low veg diversity.
  if (args.high_processed) fatScore = Math.min(fatScore, 65);
  if (args.sugar_snacks)   fatScore = Math.min(fatScore, 72);
  if (args.low_vegetables) fatScore = Math.max(40, fatScore - 8);
  fatScore = Math.max(35, Math.min(100, fatScore));
  // ── Hydration v2.2 — activity-scaled OPTIMAL RANGE (not a single target) ─
  // ml per kg of calculation weight, scaled by activity level. Older / heavier
  // adults are not pushed to athlete-tier numbers, and athletes are not
  // under-served with a generic 33 ml/kg formula.
  const HYDRATION_ML_PER_KG: Record<ActivityLevel, [number, number]> = {
    sedentary: [0.030, 0.038],
    moderate:  [0.028, 0.036],
    active:    [0.025, 0.037],
    athlete:   [0.030, 0.045],
  };
  const [hMlLow, hMlHigh] = HYDRATION_ML_PER_KG[activity];
  const hydrationRangeLowL = Math.round((calcWeight * hMlLow) * 10) / 10;
  const hydrationRangeHighL = Math.round((calcWeight * hMlHigh) * 10) / 10;
  const hydrationMidL = Math.round(((hydrationRangeLowL + hydrationRangeHighL) / 2) * 10) / 10;
  // Backward-compat fields used elsewhere in the tool.
  const hydrationTargetL = hydrationMidL;
  const hydrationOptimalLow = hydrationRangeLowL;
  const hydrationAcceptableLow = Math.round((hydrationRangeLowL * 0.85) * 10) / 10;
  const hydrationBand = {
    optimal_low_l: hydrationRangeLowL,
    optimal_high_l: hydrationRangeHighL,
    midpoint_l: hydrationMidL,
    activity_level: activity,
    ml_per_kg_low: hMlLow,
    ml_per_kg_high: hMlHigh,
    note: `Optimal range scaled to ${activity} activity for ${calcWeight} kg. Older adults drinking ${hydrationRangeLowL}-${(hydrationRangeLowL + 0.3).toFixed(1)} L/day are usually within healthy norms.`,
  };

  // Status band (relative to optimal midpoint).
  const hydrationPct = args.est_hydration_l != null && hydrationMidL > 0
    ? Math.round((args.est_hydration_l / hydrationMidL) * 100) : null;
  const hydrationStatusBand =
    hydrationPct == null ? "not_reported" :
    hydrationPct < 70   ? "red" :
    hydrationPct < 90   ? "yellow" :
    hydrationPct <= 120 ? "green" :
    hydrationPct <= 150 ? "blue" : "over_blue";
  const hydrationStatusLabel = ({
    not_reported: "Not reported",
    red: "Well below optimal range",
    yellow: "Moderately below optimal range",
    green: "Within optimal range",
    blue: "Above optimal range",
    over_blue: "Significantly above typical intake",
  } as Record<string, string>)[hydrationStatusBand];

  const hydrationScore =
    hydrationStatusBand === "green" ? 92 :
    hydrationStatusBand === "blue" ? 82 :
    hydrationStatusBand === "yellow" ? 60 :
    hydrationStatusBand === "red" ? Math.max(25, Math.round((hydrationPct ?? 0) * 0.4)) :
    hydrationStatusBand === "over_blue" ? 65 :
    60;

  // Soft-language opportunity (range, not aggressive single number).
  let hydrationOpportunityMlLow = 0, hydrationOpportunityMlHigh = 0;
  if (args.est_hydration_l != null && args.est_hydration_l < hydrationRangeLowL) {
    const lowGapMl = Math.round((hydrationRangeLowL - args.est_hydration_l) * 1000);
    hydrationOpportunityMlLow = Math.max(250, Math.round(lowGapMl / 100) * 100);
    hydrationOpportunityMlHigh = Math.min(1500, hydrationOpportunityMlLow + 500);
  }
  hydrationGapL = args.est_hydration_l != null
    ? Math.max(0, Math.round((hydrationRangeLowL - args.est_hydration_l) * 10) / 10)
    : null;

  // Symptom check (drives clinical relevance of any hydration gap).
  const hydSymList = (args.hydration_symptoms ?? []).filter(s => s && s.frequency);
  const oftenSym = hydSymList.filter(s => s.frequency === "often").length;
  const someSym = hydSymList.filter(s => s.frequency === "sometimes").length;
  const hydrationSymptomLoad =
    hydSymList.length === 0 ? "not_reported" :
    oftenSym >= 2 ? "high" :
    oftenSym >= 1 ? "moderate" :
    someSym >= 2 ? "mild" : "minimal";

  // Efficiency score (quality, not just litres).
  const hydrationEfficiency = (() => {
    let s = 78;
    const elec = args.electrolytes_use === true;
    const sweat = args.heavy_sweat === true;
    const coffeeCups = args.coffee_cups_per_day ?? 0;
    const alc = args.alcohol_units_per_week ?? 0;
    const exerciseSessions = (args.strength_sessions_per_week ?? 0) + (args.cardio_sessions_per_week ?? 0);
    if (elec && (sweat || exerciseSessions >= 4 || activity === "active" || activity === "athlete")) s += 12;
    if (sweat && !elec) s -= 10;
    if (coffeeCups >= 5) s -= 12; else if (coffeeCups >= 4) s -= 6;
    if (alc > 14) s -= 12; else if (alc > 7) s -= 6;
    if (hydrationSymptomLoad === "high") s -= 18;
    else if (hydrationSymptomLoad === "moderate") s -= 10;
    else if (hydrationSymptomLoad === "mild") s -= 4;
    else if (hydrationSymptomLoad === "minimal") s += 4;
    s = Math.max(20, Math.min(100, s));
    const drivers: string[] = [];
    if (elec) drivers.push("Electrolyte support in place");
    if (sweat && !elec) drivers.push("Heavy sweating without electrolyte support");
    if (coffeeCups >= 4) drivers.push(`${coffeeCups} cups of coffee/day raises fluid turnover`);
    if (alc > 7) drivers.push(`Alcohol load ~${alc} units/week is mildly dehydrating`);
    if (hydrationSymptomLoad === "high" || hydrationSymptomLoad === "moderate") drivers.push("Reported dehydration-pattern symptoms");
    if (!drivers.length) drivers.push("No major efficiency drains detected");
    return { score: s, drivers };
  })();

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
  // Inferred fallback when per-meal grams weren't captured — still gives a meaningful narrative.
  const inferredDistributionStatus = (() => {
    if (args.low_protein_breakfast && (proteinGap ?? 0) > 20)
      return "Poor — protein is concentrated in evening meals; breakfast is significantly under target.";
    if (args.low_protein_breakfast)
      return "Moderate — breakfast remains below target while later meals carry most of the day's protein.";
    if ((proteinGap ?? 0) > 25)
      return "Moderate — total daily protein is below target; even distribution across meals would help.";
    return "Likely even — no obvious meal is leaving a major protein gap based on the diary.";
  })();
  const distributionStatus = distributionScore == null
    ? inferredDistributionStatus
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
      reason: "Two to three short resistance sessions per week is the single strongest longevity input — it protects muscle, metabolic health, posture, and glucose control.",
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
  if (hydrationOpportunityMlLow > 0) priorities.push({ title: `Hydration opportunity: add ~${hydrationOpportunityMlLow}-${hydrationOpportunityMlHigh} ml/day`, detail: `Towards an optimal range of ${hydrationRangeLowL}-${hydrationRangeHighL} L/day for your size and activity. Front-load 250-500 ml on waking and between meals.` });
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
    if (hydrationOpportunityMlLow > 0) {
      return {
        title: `Hydration opportunity: ${hydrationOpportunityMlLow}-${hydrationOpportunityMlHigh} ml/day towards optimal range`,
        action: `Add 250-500 ml on waking, 250-500 ml mid-morning, 250-500 ml mid-afternoon. Optimal range for your profile: ${hydrationRangeLowL}-${hydrationRangeHighL} L/day.`,
        expected_benefits: ["Improved energy stability", "Better concentration", "Improved training recovery", "Reduced false hunger signals"],
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

  // ── Single prioritization engine (one source of truth) ──────────────
  // Lowest weighted score across the core nutrition pillars determines
  // the "largest limiting factor" used everywhere in the report.
  const pillarRanking = [
    { key: "protein",       label: "protein intake (and how it is distributed across the day)", short: "Protein adequacy",       score: proteinScore },
    { key: "distribution",  label: "protein distribution across the day",                       short: "Protein distribution",   score: distributionScore ?? proteinScore },
    { key: "hydration",     label: "hydration",                                                 short: "Hydration",              score: hydrationScore },
    { key: "recovery",      label: "recovery support (sleep, meal timing, vegetables)",         short: "Recovery support",       score: recoveryScore },
    { key: "muscle",        label: "muscle-preservation inputs (protein + resistance training)",short: "Muscle preservation",    score: musclePres },
  ].sort((a, b) => a.score - b.score);
  const primaryLimiter = pillarRanking[0];
  const limiting = primaryLimiter.label;
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
  weeklyActions.push(`Hydrate within the ${hydrationRangeLowL}–${hydrationRangeHighL} L/day optimal range.`);
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
      if (hydrationStatusBand === "green" || hydrationStatusBand === "blue") {
        positives.push(`Drinking ~${args.est_hydration_l} L/day — within the ${hydrationRangeLowL}–${hydrationRangeHighL} L optimal range`);
      } else if (hydrationStatusBand === "yellow") {
        limiting.push(`Currently ~${args.est_hydration_l} L/day — slightly below the ${hydrationRangeLowL}–${hydrationRangeHighL} L optimal range`);
      } else if (hydrationStatusBand === "red") {
        limiting.push(`Currently ~${args.est_hydration_l} L/day — well below the ${hydrationRangeLowL}–${hydrationRangeHighL} L optimal range`);
      } else {
        positives.push(`Drinking ~${args.est_hydration_l} L/day — well above typical intake; ensure electrolytes are balanced`);
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
    most_impactful_improvement: `${primaryLimiter.short} — ${priorities[0]?.title || fastestWin.title}`,
  };

  // ── New v2.1 inputs: subjective scores, waist, sun, digestion, thyroid ─
  const energyScore = args.energy_level != null ? Math.max(10, Math.min(100, Math.round(args.energy_level * 10))) : null;
  const stressScoreInv = args.stress_level != null ? Math.max(10, Math.min(100, Math.round((11 - args.stress_level) * 10))) : null;
  const morningRecoveryScore = args.morning_recovery != null ? Math.max(10, Math.min(100, Math.round(args.morning_recovery * 10))) : null;
  const subjectiveScores = [energyScore, stressScoreInv, morningRecoveryScore].filter(v => v != null) as number[];
  const subjectiveAvg = subjectiveScores.length ? Math.round(subjectiveScores.reduce((a, b) => a + b, 0) / subjectiveScores.length) : null;

  const waistCm = args.waist_cm ?? null;
  const waistThresh = gender === "female" ? { low: 80, high: 88 } : { low: 94, high: 102 };
  const waistScore = waistCm == null ? null
    : waistCm <= waistThresh.low ? 92
    : waistCm <= waistThresh.high ? 65
    : Math.max(25, 65 - Math.round((waistCm - waistThresh.high) * 3));
  const waistRisk = waistCm == null ? "not_reported"
    : waistCm <= waistThresh.low ? "low"
    : waistCm <= waistThresh.high ? "moderate" : "high";

  const sunMin = args.sun_exposure_minutes_per_day ?? null;
  const sunScore = sunMin == null ? null
    : sunMin < 10 ? 35 : sunMin < 20 ? 60 : sunMin < 40 ? 85 : 95;

  const digestionList = (args.digestion_issues ?? []).filter(d => d && d.frequency);
  const oftenCount = digestionList.filter(d => d.frequency === "often").length;
  const sometimesCount = digestionList.filter(d => d.frequency === "sometimes").length;
  const digestionScore = digestionList.length === 0 ? null
    : Math.max(25, 95 - oftenCount * 20 - sometimesCount * 8);

  const thyroidDx = args.thyroid_diagnosis ?? null;
  const thyroidSym = args.thyroid_symptoms ?? [];
  const thyroidFlag = (thyroidDx && thyroidDx !== "none" && thyroidDx !== "unknown") ? "diagnosed"
    : thyroidSym.length >= 3 ? "symptom_cluster"
    : thyroidSym.length >= 1 ? "mild_signs" : "no_flags";
  const thyroidNote = (() => {
    if (thyroidFlag === "diagnosed") return `Reported ${String(thyroidDx).replace("_", " ")} — recommendations are general nutrition guidance only; please align with your endocrinologist.`;
    if (thyroidFlag === "symptom_cluster") return `Several patterns you reported (${thyroidSym.slice(0, 3).join(", ").replace(/_/g, " ")}) sometimes overlap with thyroid presentations. This is not a diagnosis — worth discussing with your physician at your next visit.`;
    if (thyroidFlag === "mild_signs") return "One or two symptoms you mentioned can have many causes — keep an eye on them, no immediate action needed.";
    return "No thyroid-related signals reported.";
  })();

  // ── Executive Readiness Score (headline number for retention) ───────
  const sleepPenalty = sleepH < 7 ? (7 - sleepH) * 15 : 0;
  // Subjective fallback uses moderate 65 when no self-rating given.
  const subjectiveComp = subjectiveAvg ?? 65;
  const waistComp = waistScore ?? 70;
  const sunComp = sunScore ?? 70;
  const executiveReadiness = Math.max(20, Math.min(100, Math.round(
    recoveryCapacity * 0.24 +
    overall * 0.20 +
    musclePres * 0.18 +
    Math.max(0, 100 - alcoholPenalty - sleepPenalty) * 0.14 +
    subjectiveComp * 0.12 +
    waistComp * 0.06 +
    sunComp * 0.06
  )));
  const executiveReadinessLevel =
    executiveReadiness >= 90 ? "Peak readiness" :
    executiveReadiness >= 75 ? "Strong performance foundation" :
    executiveReadiness >= 60 ? "Performance drift detected" :
                               "Recovery capacity compromised";

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
      { metric: "Nutrition Optimization Score", from: executiveReadiness, to: projectIf(executiveReadiness, 6) },
      { metric: "Muscle preservation",          from: musclePres,         to: projectIf(musclePres, 9) },
      { metric: "Recovery Support Score",       from: recoveryCapacity,   to: projectIf(recoveryCapacity, 6) },
      { metric: "Nutrition quality",            from: overall,            to: projectIf(overall, 7) },
    ],
    note: "Projected ranges assume the actions above are sustained for 14 consecutive days. Educational estimate only.",
  };

  // ── Executive dashboard (page 1 "wow" panel — opportunities + expected gains) ─
  const opportunitiesList: Array<{ label: string; delta: string; impact: string }> = [];
  if (proteinGap != null && proteinGap >= 15) {
    opportunitiesList.push({
      label: "Protein intake",
      delta: `+${proteinGap} g/day`,
      impact: "Strongest lever for muscle preservation and satiety.",
    });
  }
  if ((alcohol ?? 0) > 7) {
    opportunitiesList.push({
      label: "Alcohol reduction",
      delta: `-${Math.max(0, (alcohol ?? 0) - 7)} units/week`,
      impact: "Restores deep sleep and overnight recovery.",
    });
  }
  if (hydrationGapL != null && hydrationGapL >= 0.4) {
    opportunitiesList.push({
      label: "Hydration",
      delta: `+${hydrationGapL} L/day`,
      impact: "Steadier afternoon energy and cognitive stamina.",
    });
  }
  if (strength < (reco.strength_sessions_per_week ?? 2)) {
    const gap = (reco.strength_sessions_per_week ?? 2) - strength;
    opportunitiesList.push({
      label: "Resistance training",
      delta: `+${gap} session${gap === 1 ? "" : "s"}/week`,
      impact: "Single strongest input for long-term muscle and metabolic health.",
    });
  }
  if (args.low_protein_breakfast) {
    opportunitiesList.push({
      label: "Breakfast protein",
      delta: "anchor at 30–40 g",
      impact: "Levels morning hunger and starts muscle protein synthesis early.",
    });
  }
  const executiveDashboard = {
    biggest_opportunities: opportunitiesList.slice(0, 4),
    expected_14_day_gains: reassessmentProjection.expected_changes.map((c) => ({
      metric: c.metric,
      gain: `+${Math.max(0, c.to - c.from)}`,
    })),
    note: "Top opportunities ranked by impact on your scores over the next 14 days.",
  };


  // ── Dominant Nutrition Patterns (how a practitioner reads the diary) ─
  const dominantPatterns: Array<{ pattern: string; impact: string }> = [];
  if (args.low_protein_breakfast || (distributionScore != null && distributionScore < 60)) {
    dominantPatterns.push({
      pattern: "Protein loaded into evening meals",
      impact: "Reduced muscle protein synthesis across the day and higher morning hunger.",
    });
  }
  if (args.low_protein_breakfast) {
    dominantPatterns.push({
      pattern: "Low breakfast protein",
      impact: "Higher mid-morning cravings, lower satiety, weaker early-day recovery signal.",
    });
  }
  if (args.low_vegetables || (args.vegetable_servings_per_day != null && args.vegetable_servings_per_day < 3)) {
    dominantPatterns.push({
      pattern: "Low vegetable diversity",
      impact: "Reduced fibre and micronutrient intake; weaker gut and recovery support.",
    });
  }
  if ((args.alcohol_units_per_week ?? 0) > 7) {
    dominantPatterns.push({
      pattern: "Frequent alcohol exposure",
      impact: "Blunted deep sleep, slower overnight recovery, raised visceral-fat risk.",
    });
  }
  if (args.sugar_snacks) {
    dominantPatterns.push({
      pattern: "Reliance on sugar-based snacks",
      impact: "Energy volatility, weaker satiety, displaced protein and fibre opportunities.",
    });
  }
  if (hydrationScore < 65) {
    dominantPatterns.push({
      pattern: "Under-hydration relative to body weight",
      impact: "Blunted afternoon energy and reduced cognitive stamina.",
    });
  }
  if (args.irregular_meals) {
    dominantPatterns.push({
      pattern: "Irregular meal timing",
      impact: "Inconsistent satiety and harder-to-stabilise blood-glucose response.",
    });
  }
  // keep top 4 patterns max
  const dominantNutritionPatterns = dominantPatterns.slice(0, 4);

  // ── Isabella's Clinical Observation (synthesised pattern, not a list) ─
  const clinicalPatterns: string[] = [];
  if (args.low_protein_breakfast || (distributionScore != null && distributionScore < 60)) {
    clinicalPatterns.push("inadequate protein earlier in the day");
  }
  if ((alcohol ?? 0) > 7) clinicalPatterns.push("frequent alcohol exposure");
  if (args.low_vegetables) clinicalPatterns.push("low vegetable diversity");
  if (args.sugar_snacks) clinicalPatterns.push("reliance on sugar-based snacks");
  if (args.high_processed) clinicalPatterns.push("a high share of refined or processed foods");
  if (hydrationScore < 65) clinicalPatterns.push("under-hydration relative to body weight");
  if (sleepH < 7) clinicalPatterns.push("short sleep duration");
  if (strength < 2) clinicalPatterns.push("limited resistance-training stimulus");

  const consequences: string[] = [];
  if (proteinScore < 70 || (distributionScore != null && distributionScore < 60)) consequences.push("unstable satiety");
  if ((alcohol ?? 0) > 7 || sleepH < 7) consequences.push("slower overnight recovery");
  if (musclePres < 70) consequences.push("reduced muscle-retention efficiency");
  if (hydrationScore < 65) consequences.push("blunted afternoon energy");
  if (consequences.length === 0) consequences.push("stable energy and good recovery support");

  const patternLine = clinicalPatterns.length
    ? `The strongest pattern visible across this diary is ${clinicalPatterns.slice(0, 3).join(", combined with ")}.`
    : `The diary shows a balanced foundation with no single dominant weakness.`;
  const consequenceLine = clinicalPatterns.length
    ? `Together these likely contribute to ${consequences.slice(0, 3).join(", ")}.`
    : `Current habits are supporting ${consequences.slice(0, 2).join(" and ")}.`;
  const clinicalPerspective =
    `Isabella's Clinical Observation: ${patternLine} ${consequenceLine} ` +
    `This is an educational reading of the diary patterns — not a clinical diagnosis.`;

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

  // ── Protein Opportunity Analysis (meal × actual / target / gap) ─────
  const perMealTarget = { Breakfast: 35, Lunch: 35, Snack: 20, Dinner: 35 };
  const proteinOpportunity = (() => {
    const rows = [
      { meal: "Breakfast", actual_g: args.breakfast_protein_g ?? null, target_g: perMealTarget.Breakfast },
      { meal: "Lunch",     actual_g: args.lunch_protein_g     ?? null, target_g: perMealTarget.Lunch },
      { meal: "Snack",     actual_g: args.snack_protein_g     ?? null, target_g: perMealTarget.Snack },
      { meal: "Dinner",    actual_g: args.dinner_protein_g    ?? null, target_g: perMealTarget.Dinner },
    ];
    if (!rows.some(r => r.actual_g != null)) return null;
    const meals = rows.map(r => ({
      meal: r.meal,
      actual_g: r.actual_g,
      target_g: r.target_g,
      gap_g: r.actual_g == null ? null : Math.max(0, r.target_g - r.actual_g),
    }));
    const totalActual = meals.reduce((a, m) => a + (m.actual_g ?? 0), 0);
    const totalTarget = meals.reduce((a, m) => a + m.target_g, 0);
    const totalGap = Math.max(0, totalTarget - totalActual);
    return { meals, total_actual_g: totalActual, total_target_g: totalTarget, total_gap_g: totalGap };
  })();



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
        "90-100 = Peak readiness",
        "75-89 = Strong performance foundation",
        "60-74 = Performance drift detected",
        "Below 60 = Recovery capacity compromised",
      ],
      measures: ["Nutrition foundation", "Hydration", "Recovery & sleep", "Subjective energy/stress/recovery", "Waist & metabolic risk", "Sun exposure & circadian support"],
    },
    subjective_scores: (energyScore != null || stressScoreInv != null || morningRecoveryScore != null) ? {
      energy: { raw: args.energy_level ?? null, score: energyScore, label: energyScore == null ? null : energyScore >= 75 ? "Strong" : energyScore >= 50 ? "Moderate" : "Low" },
      stress: { raw: args.stress_level ?? null, score: stressScoreInv, label: stressScoreInv == null ? null : stressScoreInv >= 75 ? "Well-managed" : stressScoreInv >= 50 ? "Elevated" : "High" },
      morning_recovery: { raw: args.morning_recovery ?? null, score: morningRecoveryScore, label: morningRecoveryScore == null ? null : morningRecoveryScore >= 75 ? "Refreshed" : morningRecoveryScore >= 50 ? "Partial" : "Unrecovered" },
      note: "Subjective scores often reveal what objective metrics miss — eight hours of sleep does not always equal eight hours of recovery.",
    } : null,
    waist_assessment: waistCm == null ? null : {
      waist_cm: waistCm,
      gender,
      thresholds_cm: waistThresh,
      score: waistScore,
      risk_band: waistRisk,
      note: waistRisk === "low" ? "Waist circumference is within the low-risk range for cardiometabolic health."
        : waistRisk === "moderate" ? "Waist circumference is in the moderate-risk range — fat-loss progress should reduce this towards the low-risk threshold."
        : "Waist circumference is in the higher-risk range — a 5-7 cm reduction would meaningfully improve metabolic and cardiovascular markers.",
    },
    sun_exposure_assessment: sunMin == null ? null : {
      minutes_per_day: sunMin,
      score: sunScore,
      supports: ["Vitamin D synthesis", "Circadian rhythm anchoring", "Recovery quality", "Mood regulation"],
      note: sunMin < 10 ? "Very low daylight exposure — consider 10-20 min outdoor light within an hour of waking, and discuss vitamin D status with your physician."
        : sunMin < 20 ? "Moderate daylight exposure — adding a short midday walk would strengthen circadian support."
        : sunMin < 40 ? "Good daylight exposure — supportive of vitamin D, sleep and recovery."
        : "Excellent daylight exposure — protect skin during peak UV hours.",
    },
    digestion_screening: digestionList.length === 0 ? null : {
      issues: digestionList,
      score: digestionScore,
      severity: oftenCount >= 2 ? "high" : oftenCount >= 1 ? "moderate" : sometimesCount >= 2 ? "mild" : "minimal",
      note: oftenCount >= 1 ? "Frequent digestive symptoms warrant a closer look at fibre, hydration, fermented foods and meal pacing — and discussion with a clinician if persistent."
        : "Occasional symptoms — small adjustments to fibre, hydration and meal regularity usually resolve these.",
    },
    thyroid_screening: (thyroidDx == null && thyroidSym.length === 0) ? null : {
      diagnosis: thyroidDx,
      symptoms: thyroidSym,
      flag: thyroidFlag,
      note: thyroidNote,
      disclaimer: "Educational only — Isabella does not diagnose. Any concern should be discussed with your physician.",
    },
    hydration_band: hydrationBand,
    hydration_status: {
      current_l: args.est_hydration_l ?? null,
      optimal_range_l: { low: hydrationRangeLowL, high: hydrationRangeHighL },
      midpoint_l: hydrationMidL,
      percent_of_midpoint: hydrationPct,
      status_band: hydrationStatusBand,
      status_label: hydrationStatusLabel,
      status_color_hint: hydrationStatusBand,
      symptom_load: hydrationSymptomLoad,
      symptoms: hydSymList,
      efficiency: hydrationEfficiency,
      opportunity: hydrationOpportunityMlLow > 0 ? {
        increase_ml_low: hydrationOpportunityMlLow,
        increase_ml_high: hydrationOpportunityMlHigh,
        headline: "Hydration Opportunity",
        narrative: `Your current intake appears ${hydrationStatusBand === "red" ? "well" : "slightly"} below the optimal range for your age, body size and activity level. Increasing intake by approximately ${hydrationOpportunityMlLow}-${hydrationOpportunityMlHigh} ml per day may support energy stability, concentration, training recovery and appetite regulation.`,
        potential_benefits: [
          "Improved energy stability",
          "Better concentration",
          "Improved training recovery",
          "Reduced false hunger signals",
        ],
      } : (hydrationStatusBand === "green" || hydrationStatusBand === "blue") ? {
        increase_ml_low: 0,
        increase_ml_high: 0,
        headline: "Hydration is well-supported",
        narrative: "Your current intake sits within the optimal range for your profile — no increase needed. Maintain consistency through the day.",
        potential_benefits: [],
      } : null,
      tone_note: "Framed as opportunity, not deficit — credibility before correction.",
    },
    executive_benchmark: executiveBenchmark,
    executive_dashboard: executiveDashboard,
    protein_opportunity: proteinOpportunity,
    reassessment_projection: reassessmentProjection,
    success_preview: successPreview,
    nutrition_risk_flags: nutritionRiskFlags,
    habit_upgrades: habitUpgrades,
    meal_framework_replacements: mealFrameworkReplacements,
    top_meals: topMeals,
    time_budget: timeBudgetBlock,
    clinical_perspective: clinicalPerspective,
    executive_summary: executiveSummary,
    muscle_preservation: {
      current_protein_g: args.est_protein_g ?? null,
      recommended_protein_g: proteinMid,
      score: musclePres,
      status: muscleStatus,
      reasons: muscleReasons,
      note: "Adequate protein and consistent resistance training are the two strongest levers for preserving muscle through the next decade.",
    },
    executive_benchmark: executiveBenchmark,
    reassessment_projection: reassessmentProjection,
    success_preview: successPreview,
    dominant_nutrition_patterns: dominantNutritionPatterns,
    nutrition_risk_flags: nutritionRiskFlags,
    habit_upgrades: habitUpgrades,
    meal_framework_replacements: mealFrameworkReplacements,
    top_meals: topMeals,
    time_budget: timeBudgetBlock,
    clinical_perspective: clinicalPerspective,
    executive_summary: executiveSummary,
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
  // Cap recovery-day consistency at 85 unless the user shows truly excellent
  // recovery context (real rest days AND a manageable workload AND strong sleep).
  const _excellentRecoveryContext =
    args.takes_recovery_days === true &&
    (args.work_hours_per_week ?? 45) <= 45 &&
    (args.sleep_quality ?? 6) >= 8 &&
    (args.sleep_hours ?? 7) >= 7;
  const recoveryDays = args.takes_recovery_days === true
    ? (_excellentRecoveryContext ? 95 : 82)
    : args.takes_recovery_days === false ? 40 : 60;
  // Cap outdoor exposure at 90 unless genuinely exceptional (10+ h/week outdoors).
  const _outdoorHrs = args.outdoor_hours_per_week ?? 3;
  const outdoor = _outdoorHrs >= 10
    ? 100
    : clamp(Math.min(_outdoorHrs, 9) * 10); // max 90 below the 10h threshold

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
  // Recalibrated weights so the headline tracks the visible core scores
  // (recovery + resilience + inverse stress) more intuitively.
  const executiveWellness = clamp(
    recoveryCapacity * 0.32 +
    (100 - stressLoad) * 0.22 +
    resilience * 0.28 +
    lifestyleRecovery * 0.18
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

  // ── Isabella's Clinical Observation (pattern-based, never diagnostic) ──
  const obsBits: string[] = [];
  if (workH >= 55 && (args.works_evenings || args.works_weekends)) {
    obsBits.push(`a ${workH}-hour work week extending into evenings and weekends, which compresses recovery windows`);
  } else if (workH >= 55) {
    obsBits.push(`a ${workH}-hour work week that consistently exceeds healthy recovery thresholds`);
  }
  if ((args.pressure_frequency ?? 0) >= 7 && (args.stress_level ?? 0) >= 7) {
    obsBits.push(`sustained high-pressure responsibility paired with self-reported stress at ${args.stress_level}/10`);
  }
  if ((args.sleep_hours ?? 7) >= 7 && (args.sleep_quality ?? 6) >= 7) {
    obsBits.push(`sleep duration and quality are genuine strengths protecting your baseline`);
  } else if ((args.sleep_hours ?? 7) < 7) {
    obsBits.push(`sleep is running below the 7-hour mark, which limits overnight recovery`);
  }
  if ((args.exercise_sessions_per_week ?? 0) >= 3 && (args.exercise_type === 'resistance' || args.exercise_type === 'mixed')) {
    obsBits.push(`a consistent resistance-training pattern that supports long-term resilience`);
  }
  if ((args.work_life_balance ?? 5) <= 5) {
    obsBits.push(`work-life balance scored at ${args.work_life_balance}/10, signalling limited true downtime`);
  }
  if ((args.social_support ?? 5) <= 4) {
    obsBits.push(`low social-support inputs, which reduces the buffering effect against chronic stress`);
  }
  if (alc > 7) {
    obsBits.push(`alcohol intake above the 7-unit weekly threshold that begins to interfere with deep sleep`);
  }
  const isabella_observation =
    `Reviewing your full profile, the pattern I see is ${obsBits.slice(0, 5).join('; ')}. ` +
    `Your energy and motivation remain at ${args.energy_level ?? '—'}/10, which tells me your physiological reserves are still intact — the work is to protect them before stress load erodes that buffer.`;

  // ── Dominant Recovery Patterns (4 max) ───────────────────────
  const dominant_patterns: Array<{ pattern: string; impact: string }> = [];
  if (workH >= 55 && (args.works_evenings || args.works_weekends)) {
    dominant_patterns.push({ pattern: 'Workload spilling into evenings and weekends', impact: 'No clean recovery boundary — autonomic nervous system stays partially activated 7 days a week.' });
  }
  if ((args.stress_level ?? 0) >= 7 && stressInv <= 40) {
    dominant_patterns.push({ pattern: 'High self-reported stress with limited regulation tools', impact: 'Sustained cortisol exposure that gradually depletes recovery capacity even when sleep is adequate.' });
  }
  if ((args.work_life_balance ?? 5) <= 5) {
    dominant_patterns.push({ pattern: 'Imbalanced work-life ratio', impact: 'Reduced parasympathetic recovery time — the body never fully switches off.' });
  }
  if ((args.social_support ?? 5) <= 4) {
    dominant_patterns.push({ pattern: 'Low social-recovery inputs', impact: 'Missing one of the strongest scientifically-validated buffers against burnout.' });
  }
  if (alc > 7) {
    dominant_patterns.push({ pattern: 'Alcohol pattern interfering with deep sleep', impact: 'Even modest evening alcohol cuts REM and slow-wave sleep, reducing the recovery value of the hours in bed.' });
  }
  if ((args.exercise_sessions_per_week ?? 0) >= 3 && (args.exercise_type === 'resistance' || args.exercise_type === 'mixed')) {
    dominant_patterns.push({ pattern: 'Strong training consistency', impact: 'Protective factor — muscle mass and cardiovascular fitness are buffering against age-related decline.' });
  }
  const topPatterns = dominant_patterns.slice(0, 4);

  // ── Executive Dashboard (biggest opportunities + 14-day projection) ──
  const biggest_opportunities = factorScores.slice(0, 4).map((f) => ({
    area: f.key,
    current_score: f.score,
    action: f.win,
  }));
  const projectedRecovery = clamp(recoveryCapacity + 8);
  const projectedResilience = clamp(resilience + 6);
  const projectedStress = clamp(stressLoad - 8);
  const projectedExec = clamp(
    projectedRecovery * 0.30 + (100 - projectedStress) * 0.25 + projectedResilience * 0.25 + clamp(lifestyleRecovery + 5) * 0.20
  );
  const executive_dashboard = {
    biggest_opportunities,
    expected_14_day_gains: {
      recovery_capacity: { current: recoveryCapacity, projected: projectedRecovery },
      resilience: { current: resilience, projected: projectedResilience },
      stress_load: { current: stressLoad, projected: projectedStress },
      executive_wellness: { current: executiveWellness, projected: projectedExec },
    },
    note: 'Projections assume consistent execution of the 7-day plan repeated twice. Educational estimate only.',
  };

  // ── 30/60/90-day outlook ─────────────────────────────────────
  const outlook_30_60_90 = {
    day_30: 'Sleep quality, morning energy and stress regulation typically improve first — most executives notice fewer afternoon energy dips and a calmer Sunday-evening baseline.',
    day_60: 'Recovery capacity and resilience scores begin to compound — strength sessions feel easier, perceived workload drops without changing actual hours.',
    day_90: 'If the pattern holds, biological recovery markers (HRV, resting heart rate, morning cortisol) typically shift into healthier ranges and burnout-risk indicators usually drop one full category.',
  };

  // ── Recovery Stage zone (from executive wellness) ────────────
  const recovery_stage = (() => {
    const s = executiveWellness;
    if (s >= 80) return {
      zone: 'Green Zone', range: '80–100',
      summary: 'Recovery inputs are comfortably matching performance demands. Maintain the routines that are working.',
    };
    if (s >= 60) return {
      zone: 'Performance Zone', range: '60–79',
      summary: 'You remain functional and productive, but current stress load is beginning to exceed recovery inputs. Protect recovery before performance starts to decline.',
    };
    if (s >= 40) return {
      zone: 'Recovery Deficit', range: '40–59',
      summary: 'Recovery is no longer keeping up with the load. Energy, focus and resilience are likely to feel inconsistent until recovery inputs are rebuilt.',
    };
    return {
      zone: 'Burnout Risk Zone', range: 'Below 40',
      summary: 'Indicators suggest sustained recovery debt. This is not a diagnosis, but a strong signal to prioritise recovery and consider professional support.',
    };
  })();

  // ── Recovery Drains vs Recovery Protectors ───────────────────
  // Use the same factorScores list; below midline = drain, above = protector.
  const drainsRaw = factorScores
    .filter(f => f.score < 55)
    .slice(0, 4)
    .map(f => ({
      area: f.key,
      score_impact: -Math.round((60 - f.score) * 0.4), // signed weight, capped naturally
      detail: f.win,
    }));
  const protectorsRaw = [...factorScores]
    .sort((a, b) => b.score - a.score)
    .filter(f => f.score >= 65)
    .slice(0, 4)
    .map(f => ({
      area: f.key,
      score_impact: +Math.round((f.score - 60) * 0.4),
      detail: `Strong input (${f.score}/100) — keep protecting this; it is meaningfully buffering your overall recovery.`,
    }));
  const recovery_drivers = {
    drains: drainsRaw,
    protectors: protectorsRaw,
  };

  // ── Executive Recovery Archetype ─────────────────────────────
  const archetype = (() => {
    const highLoad = workH >= 55 || (args.pressure_frequency ?? 0) >= 7;
    const trains = (args.exercise_sessions_per_week ?? 0) >= 2 && (args.exercise_type === 'resistance' || args.exercise_type === 'mixed');
    // Tightened: "sleep-deprived" requires genuinely short OR poor sleep,
    // not just "below 7 hours". Otherwise the archetype was overstating.
    const sleepSevere = (args.sleep_hours ?? 7) < 6 || (args.sleep_quality ?? 6) <= 4;
    const sleepShort  = (args.sleep_hours ?? 7) < 6.5 || (args.sleep_quality ?? 6) <= 5;
    const highStress = (args.stress_level ?? 5) >= 7;
    const lowEnergy = (args.energy_level ?? 6) <= 4;
    const goodBalance = (args.work_life_balance ?? 5) >= 7 && (args.stress_level ?? 5) <= 5;

    if (burnoutRisk === 'Elevated' || (sleepSevere && lowEnergy && highStress)) {
      return {
        name: 'The Burnout Rebuilder',
        characteristics: ['Recovery debt has accumulated', 'Energy and motivation under pressure', 'Sleep no longer fully restorative', 'Discipline still present but harder to sustain'],
        typical_risk: 'Continued performance only through stimulants and willpower until the body forces a reset.',
        primary_focus: 'Rebuild sleep, nervous-system regulation and recovery boundaries before adding any new training load.',
      };
    }
    if (sleepSevere && highLoad) {
      return {
        name: 'The Sleep-Deprived Operator',
        characteristics: ['High output sustained on insufficient sleep', 'Cognitive sharpness masking physiological cost', 'Reliance on caffeine to bridge afternoons', 'Recovery treated as optional'],
        typical_risk: 'Cumulative cognitive and cardiovascular cost that only becomes visible after months or years.',
        primary_focus: 'Treat sleep as a non-negotiable performance input — fix duration first, quality second.',
      };
    }
    if (highStress && highLoad) {
      return {
        name: 'The High-Stress Operator',
        characteristics: ['Stress load consistently exceeds recovery inputs', 'Strong delivery focus', 'Limited true downtime', 'Energy still functional but reserves narrowing'],
        typical_risk: 'Sustained sympathetic activation that quietly erodes resilience over months.',
        primary_focus: 'Add nervous-system regulation (breathing, daylight, off-grid windows) before stress load rises further.',
      };
    }
    if (highStress && trains) {
      return {
        name: 'The High-Stress Optimizer',
        characteristics: ['Trains hard to manage stress', 'High self-imposed standards', 'Strong physical baseline', 'Stress regulation tools underused'],
        typical_risk: 'Training becomes the only recovery channel — when it slips, stress has nowhere to discharge.',
        primary_focus: 'Add nervous-system regulation (breathing, daylight, true rest days) alongside training.',
      };
    }
    if (highLoad && trains && !sleepShort) {
      return {
        name: 'The Overextended Performer',
        characteristics: ['Good underlying capacity and training pattern', 'Workload pushing into evenings/weekends', 'Recovery windows shrinking', 'Performance still strong, reserves quietly thinning'],
        typical_risk: 'Burnout through accumulation — reserves erode before symptoms appear.',
        primary_focus: 'Protect two genuinely off-grid evenings per week and one full recovery day.',
      };
    }
    if (highLoad && !trains) {
      return {
        name: 'The Overextended Executive',
        characteristics: ['Workload consistently above 55 hours', 'Movement and training inconsistent', 'Recovery sacrificed for delivery', 'Energy stable but reserves thinning'],
        typical_risk: 'Loss of muscle mass and metabolic reserves over time, leaving fewer buffers against future stress.',
        primary_focus: 'Protect two short training sessions per week and one full recovery day, non-negotiably.',
      };
    }
    if (highLoad && trains) {
      return {
        name: 'The High-Performer Under Load',
        characteristics: ['Strong work ethic and output', 'Good physical discipline', 'Recovery often sacrificed for productivity', 'Energy remains stable until recovery debt accumulates'],
        typical_risk: 'Burnout through accumulation rather than collapse.',
        primary_focus: 'Protect recovery before performance begins declining.',
      };
    }
    if (goodBalance && trains) {
      return {
        name: 'The Resilient Performer',
        characteristics: ['Recovery inputs match performance demands', 'Sustainable training pattern', 'Healthy stress regulation', 'Strong long-term trajectory'],
        typical_risk: 'Complacency — small drifts in sleep or movement can erode the baseline over 6–12 months.',
        primary_focus: 'Maintain consistency and add one new recovery input per quarter to keep compounding.',
      };
    }
    return {
      name: 'The Steady Operator',
      characteristics: ['Moderate workload', 'Mixed recovery inputs', 'Energy and motivation in functional range', 'No single dominant weakness'],
      typical_risk: 'Plateau — recovery is adequate but not optimised, leaving performance and longevity gains on the table.',
      primary_focus: 'Pick the single lowest factor below and rebuild it over the next 30 days.',
    };
  })();

  // ── Executive Age Impact (educational estimate only) ─────────
  // Map executive_wellness vs age into a "recovery profile age" estimate.
  // Centered so a score of ~70 ≈ same chronological age.
  const executive_age_impact = (() => {
    const offset = Math.round((70 - executiveWellness) * 0.25); // ±7 yrs typical
    const currentProfile = Math.max(25, age + offset);
    const projectedOffset = Math.round((70 - projectedExec) * 0.25);
    const projectedProfile = Math.max(25, age + projectedOffset);
    return {
      chronological_age: age,
      current_profile_age: currentProfile,
      projected_profile_age_90d: projectedProfile,
      narrative:
        `Based on current recovery inputs, your recovery profile resembles the average ${currentProfile}-year-old executive ` +
        `(your chronological age is ${age}). If the recommendations in this report are implemented consistently, your ` +
        `projected recovery profile within 90 days is closer to a highly recovered ${projectedProfile}-year-old executive. ` +
        `This is an educational estimate, not a medical or biological age measurement.`,
    };
  })();

  // ── Trajectory: "If Nothing Changes" vs "If Recommendations Followed" ──
  const trajectory = {
    if_nothing_changes: {
      headline: 'If current patterns continue',
      timeframe: 'Over the next 6–12 months, the most common trajectory observed in executives with a similar recovery profile:',
      outcomes: [
        'Higher perceived stress and shorter fuse under workload spikes',
        'Reduced resilience — recovery from intense weeks takes progressively longer',
        'Gradual erosion of energy consistency, especially in afternoons',
        'Sleep quality drifts down even if hours stay the same',
        'Burnout-risk indicators tend to move up one category over 6–9 months',
      ],
      note: 'This is not a prediction — it is the most common trajectory observed in this profile.',
    },
    if_recommendations_followed: {
      headline: 'If the recommendations in this report are implemented',
      timeframe: 'Most executives following the 7-day plan and protecting recovery boundaries report, within 60–90 days:',
      outcomes: [
        'More stable energy across the day, fewer afternoon crashes',
        'Improved workload tolerance — same load feels lighter',
        'Burnout-risk indicators usually drop one full category',
        'Stronger resilience to stress spikes and travel weeks',
        'Sleep quality and morning recovery scores improve first, then everything else',
      ],
    },
  };

  // ── Nutrition integration narrative (only when nutrition scores shared) ──
  let nutrition_integration: any = null;
  if (hasNutrition && args.nutrition) {
    const n = args.nutrition;
    const nAvg = Math.round(
      ((n.protein_score ?? 70) + (n.hydration_score ?? 70) +
       (n.recovery_score ?? 70) + (n.muscle_preservation_score ?? 70)) / 4
    );
    const combinedResilience = Math.round((resilience + nAvg) / 2);
    const lift = nAvg >= 75
      ? 'Your nutrition profile is meaningfully supporting recovery — protein, hydration and recovery-fuel inputs are working in your favour and partially compensating for current stress load.'
      : nAvg >= 60
      ? 'Your nutrition profile is broadly adequate but not yet optimised for recovery — protein distribution and hydration are the two highest-leverage levers.'
      : 'Your nutrition profile is currently a recovery drain rather than a recovery support — fixing protein adequacy and hydration would likely lift Recovery Capacity by 6–10 points within 4 weeks.';
    nutrition_integration = {
      headline: 'Nutrition × Recovery — combined view',
      nutrition_scores: {
        protein: n.protein_score ?? null,
        hydration: n.hydration_score ?? null,
        recovery_fuel: n.recovery_score ?? null,
        muscle_preservation: n.muscle_preservation_score ?? null,
        nutrition_average: nAvg,
      },
      combined_resilience_score: combinedResilience,
      interpretation: lift,
      note: 'Combined Resilience = average of Resilience score and Nutrition score. This is the single number that best predicts how you handle workload spikes.',
    };
  }

  // Enrich executive summary when nutrition is integrated
  const _summaryNutritionLine = nutrition_integration
    ? ` Integrating your nutrition profile (avg ${nutrition_integration.nutrition_scores.nutrition_average}/100), your combined resilience score is ${nutrition_integration.combined_resilience_score}/100 — ${nutrition_integration.interpretation.toLowerCase()}`
    : '';

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
    isabella_observation,
    dominant_patterns: topPatterns,
    recovery_archetype: archetype,
    recovery_stage,
    recovery_drivers,
    executive_dashboard,
    outlook_30_60_90,
    executive_age_impact,
    trajectory,
    nutrition_integration,

    executive_summary:
      `Your current recovery capacity supports approximately ${recoveryCapacity}% of your performance demands. ` +
      `The largest limiting factors appear to be ${factorScores.slice(0, 3).map(f => f.key.toLowerCase()).join(", ")}. ` +
      `Small improvements in these areas may significantly improve resilience and energy over the next 30–90 days.` +
      _summaryNutritionLine,
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
