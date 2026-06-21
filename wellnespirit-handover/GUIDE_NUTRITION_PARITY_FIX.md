# Guide Nutrition Parity Fix — Make WellneSpirit Isabella Match Ovela Isabella

Paste this to the Guide project agent/team. It explains why the WellneSpirit Guide report collapsed to a shallow 2-page baseline and exactly what must be wired so the Guide nutrition app produces the same detailed, realistic report Ovela Isabella produces here.

---

## Executive diagnosis

The Guide nutrition report is not using the full Ovela nutrition pipeline. It is rendering a partial baseline shell from an incomplete `assessment-report.data` object.

The Ovela report from June 11 generated a full 10-page assessment because Isabella did three things before calling the tool:

1. Collected the full mandatory profile, lifestyle, health-context, hydration, and weekly food-diary gates.
2. Interpreted the weekly diary into numeric estimates and practitioner-style qualitative fields.
3. Called the deterministic `nutritionAssessment()` tool with the full enriched argument object, then emitted the complete tool result inside the fenced `assessment-report` block.

The Guide report from June 21 only produced about 2 pages because most of those enriched fields were missing or stripped. Evidence:

- Calories rendered as `~- kcal`.
- Protein, carbohydrates, and fat targets rendered as `--- g`.
- Protein/carbohydrate/fat quality rendered as `0/100`.
- Recovery Support Score rendered as `0/100`.
- It skipped most report sections: Optimization Score, nutrition benchmark, diary observations, score drivers, top meals, protein opportunity, personalized meal replacements, recovery/lifestyle interpretation, expected progress, dominant patterns, clinical observation, and 14-day reassessment projection.

This is not a PDF styling issue. It is a data-pipeline issue: the Guide agent is either not passing the complete tool arguments into `nutritionAssessment()`, not returning the full tool result to the model, or not preserving the full `data` object when rendering the PDF.

---

## Non-negotiable source of truth

Use the handover files from Ovela exactly:

- `wellnespirit-handover/nutritionAssessment.ts`
- `wellnespirit-handover/_tools-shared.ts`
- `wellnespirit-handover/assessmentReport.ts`
- `wellnespirit-handover/assessment-prompts.ts`

Do not re-create the scoring in the prompt. Do not ask the LLM to invent final scores. The LLM only collects inputs and interprets the diary into tool arguments. The deterministic TypeScript function calculates the math and returns the report object.

The report block must stay exactly:

```markdown
```assessment-report
{
  "type": "nutrition_assessment",
  "title": "Executive Nutrition & Muscle Preservation Assessment",
  "data": { ...FULL nutritionAssessment() return value... }
}
```
```

The renderer must receive the complete `data` object. Do not summarize, flatten, filter, whitelist only a few fields, or rebuild it.

---

## What Ovela Isabella does before scoring

Ovela Isabella does not simply ask for height, weight, water, and a vague food note. She completes a structured intake and diary interpretation before the scoring call.

### Mandatory collection gates

Nutrition reports must not generate until these are complete:

1. Personal profile
   - age
   - gender
   - height_cm
   - weight_kg
   - primary goal
   - target_weight_kg if goal is fat_loss

2. Activity profile
   - strength_sessions_per_week
   - cardio_sessions_per_week
   - activity_level
   - occupation activity
   - appetite_pattern

3. Recovery and lifestyle
   - sleep_hours
   - alcohol_units_per_week
   - coffee_cups_per_day
   - daily_walk_minutes
   - water intake in liters
   - diet_type
   - waist_cm
   - sun_exposure_minutes_per_day
   - energy_level 1-10
   - stress_level 1-10
   - morning_recovery 1-10
   - electrolytes_use
   - heavy_sweat
   - hydration_symptoms

4. Health-context screening, non-diagnostic
   - thyroid_diagnosis
   - thyroid_symptoms
   - digestion_issues
   - medications_affecting_metabolism
   - medication_categories
   - whether recovery assessment was completed
   - recovery scores if available

5. Weekly food intake hard gate
   - full typical week: breakfast, lunch, dinner, snacks, drinks
   - typed diary, pasted diary, PDF, Word doc, screenshot, or photo is acceptable
   - a few words like “I eat healthy” is not acceptable

6. Time budget hard gate
   - enjoy cooking
   - cook when I have time
   - need quick meals
   - travel frequently

If the weekly diary is missing or too thin, Isabella must not call the tool. She must ask again for the diary.

---

## The missing step in Guide: diary-to-tool enrichment

The deterministic tool cannot see the raw conversation unless the Guide passes the interpreted values into the tool call. The Guide model must transform the diary into a full `nutrition_assessment` tool argument object.

At minimum, before tool call, the Guide model must produce and pass:

```ts
{
  age,
  gender,
  height_cm,
  weight_kg,
  target_weight_kg,
  waist_cm,
  activity_level,
  occupation,
  goal,
  diet_type,
  sleep_hours,
  alcohol_units_per_week,
  coffee_cups_per_day,
  daily_walk_minutes,
  strength_sessions_per_week,
  cardio_sessions_per_week,

  // These must be estimated from the full weekly diary.
  est_calories,
  est_protein_g,
  est_carbs_g,
  est_fat_g,
  est_hydration_l,
  breakfast_protein_g,
  lunch_protein_g,
  dinner_protein_g,
  snack_protein_g,

  // Qualitative diary signals.
  low_protein_breakfast,
  sugar_snacks,
  low_vegetables,
  high_processed,
  irregular_meals,
  oily_fish_per_week,
  vegetable_servings_per_day,
  meal_observations,
  top_meals,
  meal_framework_replacements,
  habit_upgrades,
  nutrition_risk_flags,

  // v2.1-v2.3 intelligence.
  sun_exposure_minutes_per_day,
  thyroid_diagnosis,
  thyroid_symptoms,
  digestion_issues,
  energy_level,
  stress_level,
  morning_recovery,
  hydration_symptoms,
  electrolytes_use,
  heavy_sweat,
  medications_affecting_metabolism,
  medication_categories,
  recovery_assessment_completed,
  recovery_scores_from_user,
  appetite_pattern,
  disliked_foods,
  preferred_foods,
  food_dislikes_notes,
  cooking_skill,
  time_budget,
  personal_notes
}
```

If `est_calories`, `est_protein_g`, `est_carbs_g`, `est_fat_g`, and the meal-level protein fields are missing, the report will collapse or show zero/blank scores. That is what happened in the Guide PDF.

---

## Required output keys the PDF renderer expects

After `nutritionAssessment()` runs, the `data` object must include the full returned object. These fields drive the full Ovela-style report:

- `executive_summary`
- `meal_observations`
- `executive_dashboard`
- `executive_readiness`
- `scores`
- `executive_benchmark`
- `subjective_scores`
- `waist_assessment`
- `sun_exposure_assessment`
- `digestion_screening`
- `thyroid_screening`
- `personal_profile_snapshot`
- `medication_screening`
- `recovery_cross_reference`
- `biological_context`
- `hydration_status`
- `score_drivers`
- `targets`
- `calculation_basis`
- `gaps`
- `fastest_win`
- `muscle_preservation`
- `top_meals`
- `protein_opportunity`
- `protein_strategy`
- `daily_meal_framework`
- `meal_framework_replacements`
- `metabolic_support`
- `resistance_training`
- `lifestyle_factors`
- `biological_age_impact`
- `weight_loss_projection`
- `executive_performance_impact`
- `long_term_outlook`
- `improvement_priorities`
- `weekly_action_plan`
- `seven_day_plan`
- `habit_upgrades`
- `nutrition_risk_flags`
- `dominant_nutrition_patterns`
- `clinical_perspective`
- `reassessment_projection`
- `success_preview`
- `disclaimer`

If the Guide logs `Object.keys(payload.data)` and sees only a small subset of this list, the Guide is not production-ready.

---

## Exact instruction to add to the Guide system prompt

Paste this into the Guide nutrition mode prompt after the existing WellneSpirit Isabella persona and before the fenced output contract:

```text
NUTRITION REPORT PARITY REQUIREMENT — OVELA ISABELLA v2.3

You must produce the same depth as Ovela Isabella's Executive Nutrition & Muscle Preservation Assessment, not a short baseline summary.

You are not allowed to generate a report until the full mandatory intake and a real weekly food diary are present. The food diary must contain enough detail to estimate average daily calories, protein, carbohydrates, fat, hydration, meal timing, meal-level protein, vegetable diversity, processed-food share, snacks, drinks, and strongest/weakest meal patterns. If the diary is too vague, ask for the diary again and wait.

Before calling nutrition_assessment, convert the full user intake and food diary into a complete tool argument object. You must estimate and pass est_calories, est_protein_g, est_carbs_g, est_fat_g, est_hydration_l, breakfast_protein_g, lunch_protein_g, dinner_protein_g, snack_protein_g. You must also pass qualitative diary intelligence: meal_observations, top_meals, meal_framework_replacements, habit_upgrades, nutrition_risk_flags, oily_fish_per_week, vegetable_servings_per_day, low_protein_breakfast, sugar_snacks, low_vegetables, high_processed, irregular_meals, disliked_foods, preferred_foods, time_budget, cooking_skill, and personal_notes where available.

The tool performs the scoring. Never invent final report scores yourself. Never replace the tool result with a summary. Never strip fields from the tool result.

After the tool returns, emit a warm 4-6 sentence executive summary, then emit the fenced assessment-report block with type "nutrition_assessment", title "Executive Nutrition & Muscle Preservation Assessment", and data equal to the FULL unmodified nutritionAssessment() result.

Quality gate: If the generated data object does not contain executive_summary, meal_observations, executive_dashboard, executive_readiness, executive_benchmark, hydration_status, score_drivers, targets, muscle_preservation, top_meals, protein_opportunity, protein_strategy, meal_framework_replacements, habit_upgrades, nutrition_risk_flags, dominant_nutrition_patterns, clinical_perspective, reassessment_projection, success_preview, and disclaimer, do not render the PDF. Fix the tool call first.
```

---

## Exact tool-call validation to implement

Before executing `nutritionAssessment(args)`, reject the call and ask follow-up questions if any of these are missing:

```ts
const requiredForDetailedNutrition = [
  'age',
  'gender',
  'height_cm',
  'weight_kg',
  'goal',
  'activity_level',
  'strength_sessions_per_week',
  'cardio_sessions_per_week',
  'sleep_hours',
  'est_hydration_l',
  'est_calories',
  'est_protein_g',
  'est_carbs_g',
  'est_fat_g',
  'breakfast_protein_g',
  'lunch_protein_g',
  'dinner_protein_g',
  'meal_observations',
  'top_meals',
  'meal_framework_replacements',
  'habit_upgrades',
  'nutrition_risk_flags',
  'time_budget'
];
```

Also validate:

```ts
if (!Array.isArray(args.meal_observations) || args.meal_observations.length < 4) reject;
if (!args.top_meals?.strongest?.meal || !args.top_meals?.weakest?.meal) reject;
if (!Array.isArray(args.meal_framework_replacements) || args.meal_framework_replacements.length < 3) reject;
if (!Array.isArray(args.habit_upgrades) || args.habit_upgrades.length < 3) reject;
if (!Array.isArray(args.nutrition_risk_flags) || args.nutrition_risk_flags.length < 3) reject;
if (args.est_protein_g == null || args.est_calories == null || args.est_carbs_g == null || args.est_fat_g == null) reject;
```

For free reports, do not reduce the content to a 2-page shell. The free/paid distinction can control progress tracking, history, dashboard, reassessment comparisons, and ongoing support — not the baseline report quality.

---

## Scoring and evidence rules Isabella uses here

These are the refined nutrition rules from Ovela. They must remain in the deterministic tool, not in ad-hoc LLM prose:

- BMR/calories: Mifflin-St Jeor.
- Fat-loss calories: activity-adjusted maintenance with a controlled deficit.
- If BMI is over 28 and goal is fat_loss, macro calculations use target weight rather than current weight when appropriate.
- Protein bands follow WHO/ISSN-style sports nutrition ranges:
  - regular/healthy aging: about 1.0-1.4 g/kg
  - fat loss/recovery: about 1.4-1.8 g/kg
  - muscle gain/athlete: about 1.6-2.2 g/kg
- Adults over 50 receive a sarcopenia-aware protein boost. Older women receive an additional small boost.
- Per-meal protein target is practical: usually 30-40 g per main meal, capped around real-world digestion/meal behavior.
- Hydration is an activity-scaled optimal range, not a fixed number:
  - Red: below 70% of midpoint
  - Yellow: 70-89%
  - Green: 90-120%
  - Blue: 120-150%
- Hydration guidance is framed as opportunity, not alarm.
- Waist thresholds are observational risk signals:
  - men: 94 cm and 102 cm thresholds
  - women: 80 cm and 88 cm thresholds
- Subjective readiness includes energy, stress, and morning recovery because sleep duration alone does not equal recovery quality.
- Nutrition quality includes protein adequacy, carbohydrate quality, fat quality, hydration, vegetable diversity, processed-food share, and recovery support.
- Recovery support includes sleep, walking, resistance training, hydration, alcohol, coffee timing, stress, sun exposure, and morning recovery.
- Risk flags are observational only: vegetable diversity, fibre, omega-3, potassium, magnesium, processed-food share, digestion context, thyroid context, medication context.
- No diagnosis. Always educational, non-medical, and soft-language.

---

## What the full report should include

The Ovela-style nutrition PDF should normally render about 9-10 pages for a complete diary and include:

1. Summary
2. What Isabella noticed in the diary
3. Biggest opportunities and expected 14-day gains
4. Nutrition Optimization Score
5. Headline scores
6. Nutrition benchmark versus age cohort
7. Executive readiness extended signals
8. Hydration status and hydration opportunity
9. Nutrition snapshot and score drivers
10. Daily targets with calculation basis
11. Fastest win
12. Muscle preservation and performance capacity
13. Top meals from the week
14. Protein opportunity by meal
15. High-performance nutrition strategy
16. Personalized meal framework based on the actual diary
17. Recovery and metabolic efficiency
18. Resistance training recommendation
19. Recovery and lifestyle factors
20. Expected progress
21. How nutrition is affecting results
22. Long-term outlook
23. Highest-priority improvements
24. Isabella's weekly action plan
25. 7-day upgrade plan
26. Upgrade the meals already eaten
27. Nutrition risk flags, observational
28. Dominant nutrition patterns
29. Isabella's clinical observation
30. Reassess in 14 days
31. What success looks like in 14 days
32. Baseline versus tracked progress
33. Continue with WellneSpirit

If the Guide report is only 2 pages, it failed this requirement.

---

## Comparison from the attached PDFs

### Guide PDF from June 21

- 2 pages only.
- Missing Nutrition Optimization Score section.
- Missing diary observations.
- Missing peer benchmark.
- Missing score-driver explanations.
- Missing top meals and weakest meal analysis.
- Missing personalized meal replacements.
- Missing protein opportunity table.
- Missing risk flags and dominant patterns.
- Missing clinical observation.
- Blank or zero macro/score fields indicate incomplete tool args.
- Protein estimate appears wrong for the same person and same diary context.

### Ovela PDF from June 11

- 10 pages.
- Includes full diary interpretation.
- Includes age-cohort benchmark.
- Includes hydration range, percentage of midpoint, and hydration benefits.
- Includes macro targets and calculation basis.
- Includes strongest/weakest meals.
- Includes meal-by-meal protein opportunity.
- Includes personalized upgrades based on actual foods eaten.
- Includes risk flags and dominant patterns.
- Includes clinical-style observation and 14-day projection.

Guide should match the second output, then enhance it with any extra WellneSpirit settings — not replace it with a shorter baseline.

---

## Debug checklist for Guide

Run one test using the same June 11 diary and log these before rendering:

```ts
console.log('nutrition tool args', args);
console.log('nutrition result keys', Object.keys(result));
console.log('nutrition result scores', result.scores);
console.log('nutrition result targets', result.targets);
console.log('nutrition result rich fields', {
  meal_observations: result.meal_observations?.length,
  meal_framework_replacements: result.meal_framework_replacements?.length,
  habit_upgrades: result.habit_upgrades?.length,
  nutrition_risk_flags: result.nutrition_risk_flags?.length,
  dominant_nutrition_patterns: result.dominant_nutrition_patterns?.length,
  has_clinical_perspective: Boolean(result.clinical_perspective),
  has_reassessment_projection: Boolean(result.reassessment_projection),
  has_success_preview: Boolean(result.success_preview)
});
```

Expected for a complete report:

- `est_calories`, `est_protein_g`, `est_carbs_g`, `est_fat_g` are real numbers.
- `targets.daily_calories` is a real number, not `-`.
- `targets.protein_g.low_g` and `high_g` are real numbers.
- `scores.protein`, `scores.carbs`, `scores.fat`, `scores.recovery_support` are not zero unless truly earned.
- `meal_observations.length >= 4`.
- `meal_framework_replacements.length >= 3`.
- `habit_upgrades.length >= 3`.
- `nutrition_risk_flags.length >= 3`.
- PDF renders many sections, not just summary/headline/baseline.

---

## Bottom line instruction for Guide

The WellneSpirit Guide nutrition app must not implement a separate simplified nutrition report. It must use Ovela Isabella's exact nutrition assessment engine and renderer, preserve the full enriched data object, and only add WellneSpirit-specific extras on top.

If WellneSpirit has extra settings or additional questions, map them into extra tool arguments or additional report sections after the Ovela fields are complete. Do not let extra settings replace the Ovela diary interpretation, scoring, or PDF structure.
