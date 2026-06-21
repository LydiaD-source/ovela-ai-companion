/**
 * recoveryResilienceAssessment — Executive Recovery & Resilience Assessment
 *
 * SOURCE OF TRUTH: supabase/functions/ovela-chat/_tools.ts (lines 2112–2647)
 * Extracted verbatim from the Ovela Interactive project on 2026-06-21.
 *
 * Lifestyle-only — never medical, never a diagnosis. Returns scores for
 * executive_wellness, recovery_capacity, burnout_risk, plus fastest_wins
 * and a seven_day_plan. Optionally integrates nutrition scores (passed in
 * via args.nutrition) to compute a Combined Resilience Score.
 *
 * DEPENDENCIES: shared constants in `_tools-shared.ts`.
 *
 * OUTPUT CONTRACT: see README.md → "Fenced Output Contract" → recovery_resilience.
 *
 * Backward-compat alias exported at the bottom: `biologicalAgeAssessment`.
 */

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
export const biologicalAgeAssessment = recoveryResilienceAssessment;
