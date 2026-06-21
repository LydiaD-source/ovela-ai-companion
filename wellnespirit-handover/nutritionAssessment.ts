/**
 * nutritionAssessment — Executive Nutrition & Muscle Preservation Assessment (PRO v2.3)
 *
 * SOURCE OF TRUTH: supabase/functions/ovela-chat/_tools.ts (lines 809–2109)
 * Extracted verbatim from the Ovela Interactive project on 2026-06-21.
 *
 * This is a PURE function — same inputs always yield the same outputs.
 * It performs ALL math server-side (BMR via Mifflin-St-Jeor, protein bands per
 * WHO + ISSN, hydration optimal-range bands, Executive Readiness Score, waist
 * risk, thyroid screening, etc.) so the LLM never hallucinates numbers.
 *
 * USAGE IN THE WELLNESPIRIT GUIDE AGENT:
 *   import { nutritionAssessment } from "./nutritionAssessment.ts";
 *   const result = nutritionAssessment(toolArgs);
 *   // emit result inside the fenced ```assessment-report block (see README.md)
 *
 * DEPENDENCIES: This function relies on shared constants/types defined in
 * `_tools-shared.ts` (the first 808 lines of _tools.ts). Keep both files
 * together OR inline the constants into this file.
 *
 * OUTPUT CONTRACT: see README.md → "Fenced Output Contract" → nutrition_assessment.
 */

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
  // v2.3 — Personal context & companion intelligence
  medications_affecting_metabolism?: "no" | "yes" | "prefer_not_to_say";
  medication_categories?: Array<"blood_pressure" | "thyroid" | "diabetes" | "digestive" | "corticosteroids" | "hormonal" | "other" | "unsure">;
  recovery_assessment_completed?: boolean;
  recovery_scores_from_user?: { recovery_capacity?: number; resilience?: number; executive_wellness?: number; burnout_risk?: "low" | "moderate" | "elevated" };
  appetite_pattern?: "low" | "normal" | "high" | "irregular";
  food_dislikes_notes?: string;
  cooking_skill?: "beginner" | "intermediate" | "advanced";
  personal_notes?: string; // free-text Isabella captured to remember the person (lifestyle/personality cues)
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
      hydrationOpportunityMlLow > 0 ? `Add ~${hydrationOpportunityMlLow}-${hydrationOpportunityMlHigh} ml/day towards the ${hydrationRangeLowL}-${hydrationRangeHighL} L optimal range` : "Maintain hydration within optimal range",
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
  if (hydrationOpportunityMlLow > 0) {
    opportunitiesList.push({
      label: "Hydration",
      delta: `+${hydrationOpportunityMlLow}-${hydrationOpportunityMlHigh} ml/day`,
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
      hydrationOpportunityMlLow > 0
        ? `Move toward the ${hydrationRangeLowL}–${hydrationRangeHighL} L hydration range (add ~${hydrationOpportunityMlLow}-${hydrationOpportunityMlHigh} ml/day)`
        : `Maintain hydration within ${hydrationRangeLowL}–${hydrationRangeHighL} L/day`,
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

  // ── Medication screening (context, NOT diagnosis) ───────────────────
  const medCats = (args.medication_categories ?? []).filter(Boolean);
  const medicationScreening = (args.medications_affecting_metabolism || medCats.length > 0) ? {
    reported: args.medications_affecting_metabolism ?? (medCats.length > 0 ? "yes" : "no"),
    categories: medCats,
    note: (args.medications_affecting_metabolism === "yes" || medCats.length > 0)
      ? "Current medication use may influence assessment results. Some medications can affect water balance, digestion, appetite, body composition, and recovery — please interpret results with that context, and discuss with your prescribing clinician before changing diet or hydration."
      : args.medications_affecting_metabolism === "prefer_not_to_say"
      ? "Medication information not provided — results are interpreted without that context."
      : "No medications affecting metabolism reported.",
    disclaimer: "Educational only. Isabella does not prescribe, adjust or comment on medications.",
  } : null;

  // ── Recovery & Resilience cross-reference ───────────────────────────
  const rxScores = args.recovery_scores_from_user || {};
  const recoveryCrossRef = args.recovery_assessment_completed === true ? {
    completed: true,
    scores: {
      recovery_capacity: rxScores.recovery_capacity ?? null,
      resilience: rxScores.resilience ?? null,
      executive_wellness: rxScores.executive_wellness ?? null,
      burnout_risk: rxScores.burnout_risk ?? null,
    },
    interpretation: (() => {
      const rc = rxScores.recovery_capacity;
      if (rc == null) return "Recovery context noted — share your Recovery & Resilience scores next time to unlock a combined readiness view.";
      if (rc < 60 && overall >= 70) return `Nutrition habits appear supportive (Nutrition ${overall}). Recovery capacity (${rc}) may currently be the primary limiting factor — prioritise sleep, decompression, and de-load weeks before further nutritional optimisation.`;
      if (rc >= 75 && overall < 65) return `Recovery capacity (${rc}) is strong; the largest leverage point now is nutrition quality (${overall}).`;
      return `Nutrition (${overall}) and recovery (${rc}) are tracking together — keep both moving in parallel.`;
    })(),
  } : args.recovery_assessment_completed === false ? {
    completed: false,
    recommendation: "For a more complete understanding of recovery capacity, stress load and resilience, consider completing the Recovery & Resilience Assessment. It pairs with this report to produce a Combined Readiness view.",
  } : null;

  // ── Biological Context (WHY results may look the way they do) ───────
  const biologicalContext: Array<{ factor: string; influence: string }> = [];
  if (sunMin != null && sunMin < 20) biologicalContext.push({ factor: "Limited sun exposure", influence: "May reduce vitamin D status, circadian anchoring, mood and recovery quality." });
  if (thyroidFlag === "diagnosed") biologicalContext.push({ factor: "Reported thyroid condition", influence: "Can influence energy, recovery, body weight, muscle preservation and metabolic rate." });
  else if (thyroidFlag === "symptom_cluster") biologicalContext.push({ factor: "Thyroid symptom cluster", influence: "Pattern worth discussing with your physician — not a diagnosis." });
  if (medicationScreening && (medicationScreening.reported === "yes" || (medicationScreening.categories?.length ?? 0) > 0)) {
    biologicalContext.push({ factor: "Current medication use", influence: "May affect water balance, digestion, appetite, body composition and recovery." });
  }
  if (digestionScore != null && digestionScore < 70) biologicalContext.push({ factor: "Digestive symptoms", influence: "May reduce nutrient absorption and recovery efficiency." });
  if ((recoveryCapacity ?? 100) < 65) biologicalContext.push({ factor: "Elevated recovery demands", influence: "Workload, sleep or stress patterns may be drawing on recovery faster than nutrition can rebuild." });
  if (hydrationStatusBand === "red") biologicalContext.push({ factor: "Inadequate hydration", influence: "Can blunt afternoon energy, cognitive stamina and appetite regulation." });
  if (args.appetite_pattern === "low") biologicalContext.push({ factor: "Low appetite", influence: "Smaller, more frequent protein-anchored meals may be more sustainable than three large ones." });
  if (args.appetite_pattern === "irregular") biologicalContext.push({ factor: "Irregular appetite", influence: "Anchoring meals to fixed times (rather than hunger cues) often stabilises intake within 7–10 days." });

  // ── Personal Profile Snapshot — the "image of who Isabella is talking to" ─
  const bodyArchetype = (() => {
    if (bmi >= 30) return "Larger frame — strength and joint-friendly progression matter most";
    if (bmi >= 25) return "Solid frame with room to refine body composition";
    if (bmi >= 22) return "Athletic / well-proportioned frame";
    if (bmi >= 18.5) return "Lean frame — muscle preservation is the priority lever";
    return "Underweight range — calorie sufficiency before optimisation";
  })();
  const energyState = subjectiveAvg == null ? "energy not self-reported"
    : subjectiveAvg >= 75 ? "energy steady"
    : subjectiveAvg >= 55 ? "energy uneven"
    : "energy depleted";
  const stressState = args.stress_level == null ? "stress not reported"
    : args.stress_level >= 8 ? "high stress load"
    : args.stress_level >= 5 ? "moderate stress" : "low stress";
  const activityState = activity === "athlete" ? "athlete-level training"
    : activity === "active" ? "consistently active"
    : activity === "moderate" ? "moderately active" : "mostly sedentary";
  const personalProfileSnapshot = {
    headline: `${age}-year-old ${gender === "female" ? "woman" : gender === "male" ? "man" : "person"} · ${bodyArchetype} · ${activityState} · ${energyState} · ${stressState}`,
    body_archetype: bodyArchetype,
    activity_signature: activityState,
    appetite_pattern: args.appetite_pattern ?? null,
    cooking_skill: args.cooking_skill ?? null,
    time_budget: timeBudget,
    notes: args.personal_notes ?? null,
    purpose: "Used by Isabella to remember WHO she is coaching — not a template. Re-read at every follow-up to keep guidance personal.",
  };

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
    medication_screening: medicationScreening,
    recovery_cross_reference: recoveryCrossRef,
    biological_context: biologicalContext.length ? {
      title: "Factors Influencing Your Results",
      items: biologicalContext,
      purpose: "These factors help explain WHY your scores look the way they do — not just what to improve.",
    } : null,
    personal_profile_snapshot: personalProfileSnapshot,
    disclaimer:
      "This assessment is educational and informational only. It is not a medical diagnosis and should not replace consultation with a qualified healthcare professional.",
  };
}
