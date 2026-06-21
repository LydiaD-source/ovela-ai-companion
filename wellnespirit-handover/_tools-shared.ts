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

