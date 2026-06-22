# Guide Recovery & Resilience — Parity Fix Brief

**Audience:** WellneSpirit Guide project (store.wellnespirit) — Isabella agent owners
**Source of truth:** Ovela project — `supabase/functions/ovela-chat/_tools.ts` (recoveryResilienceAssessment, lines 2112–2647) and the `RECOVERY_ASSESSMENT_PROMPT` block in `wellnespirit-handover/assessment-prompts.ts`
**Status:** Guide's recovery report is shipping with ~5 inputs out of 30+. That is why the output is one short paragraph instead of the full executive report (Zone, Archetype, Patterns, Drains vs Protectors, 14-day projection, 30/60/90 outlook, 7-day plan).

---

## 1. What went wrong in the conversation you shared

Real transcript captured from Guide:

> "age 60, male, ceo, less stress, hight 186, weight 90kg"
> "65hrs, i sleep 8hrs, stress 7, energy 8"
> → **Report generated.**

Isabella collected **9 fields** and then ran the tool. The tool was designed to receive **30+ fields across 4 mandatory phases**. With everything else defaulted, the math collapses to generic constants and the renderer has nothing rich to show — so the "report" is a single paragraph with one number.

**This is identical to the nutrition failure mode**: the LLM is calling the tool too early to "be helpful," instead of completing the gated intake.

---

## 2. The 4 mandatory phases (HARD GATE — never call the tool before all four are complete)

The tool function expects **all of these** to be populated by the LLM before invocation. If they are missing, the tool falls back to defaults and the report degrades exactly as you're seeing.

### Phase 1 — Personal Profile (6 fields)
- `age`, `gender`, `height_cm`, `weight_kg`, `occupation`
- `primary_goal` ∈ `more_energy | better_recovery | reduce_stress | prevent_burnout | improve_performance | improve_longevity`

### Phase 2 — Workload & Stress (8 fields) ← **Guide is skipping almost all of this**
- `work_hours_per_week`
- `focused_work_hours_per_day`
- `meeting_hours_per_day`
- `travel_hours_per_day`
- `works_evenings` (boolean)
- `works_weekends` (boolean)
- `pressure_frequency` (1–10)
- `responsibility_level` (1–10)

### Phase 3 — Recovery (7 fields) ← **Guide collected only sleep_hours**
- `sleep_hours`
- `sleep_quality` (1–10)
- `wakes_refreshed` (boolean)
- `exercise_sessions_per_week`
- `exercise_type` ∈ `resistance | cardio | walking | mixed | none`
- `takes_recovery_days` (boolean)
- `outdoor_hours_per_week`

### Phase 4 — Lifestyle & Resilience (8 fields) ← **Guide collected only stress + energy**
- `alcohol_units_per_week`
- `caffeine_per_day`
- `water_liters_per_day`
- `social_support` (1–10)
- `work_life_balance` (1–10)
- `stress_level` (1–10)
- `energy_level` (1–10)
- `motivation_level` (1–10)

### Phase 5 — Optional Nutrition Integration (always ask, never gate)
Always ask: *"Have you completed the Isabella Nutrition Assessment? If yes, share your four scores (Protein, Hydration, Recovery fuel, Muscle preservation) — or upload/paste the PDF and I'll read them."*

If provided, pass them in:
```ts
nutrition: {
  protein_score, hydration_score, recovery_score, muscle_preservation_score
}
```
This unlocks the **Combined Resilience Score** (±9 point swing on the resilience headline). Without it, the report is still valid — just without the combined banner.

---

## 3. Drop-in system-prompt block for Guide

Paste this verbatim into Isabella's Guide system prompt under the recovery branch. It mirrors what's in `assessment-prompts.ts` but is rewritten as enforcement rules to stop early tool-calling:

```
RECOVERY REPORT PARITY REQUIREMENT — non-negotiable

You are running the Executive Recovery & Resilience Assessment. The downstream tool
`recovery_resilience_assessment` expects 4 mandatory phases of inputs. Calling it
with fewer than ~25 of the fields below produces a degraded one-paragraph report.
That is a failure mode, not an acceptable shortcut.

HARD GATE: Do NOT call the tool, do NOT emit the fenced assessment-report block,
do NOT produce any score, zone, plan, or PDF until ALL of Phases 1–4 are complete.
Phase 5 (nutrition) is always asked but never blocks.

QUESTION RHYTHM: 2–3 bullet questions per turn, warm and conversational, announced
as "Step 1 of 5", "Step 2 of 5"… Never dump all 30 questions at once. Never
collapse two phases into one turn.

NOISE HANDLING: If the user replies with "ok", "yes", "continue", or anything
that doesn't answer the open question, gently restate the last question and wait.
Never advance on noise. Never call the tool to "be helpful".

PHASE 1 — Personal Profile (collect ALL): age, gender, height_cm, weight_kg,
occupation, primary_goal.

PHASE 2 — Workload & Stress (collect ALL): work_hours_per_week,
focused_work_hours_per_day, meeting_hours_per_day, travel_hours_per_day,
works_evenings, works_weekends, pressure_frequency (1–10),
responsibility_level (1–10).

PHASE 3 — Recovery (collect ALL): sleep_hours, sleep_quality (1–10),
wakes_refreshed, exercise_sessions_per_week, exercise_type
(resistance|cardio|walking|mixed|none), takes_recovery_days,
outdoor_hours_per_week.

PHASE 4 — Lifestyle & Resilience (collect ALL): alcohol_units_per_week,
caffeine_per_day, water_liters_per_day, social_support (1–10),
work_life_balance (1–10), stress_level (1–10), energy_level (1–10),
motivation_level (1–10).

PHASE 5 — Nutrition Integration (ASK, do not gate): "Have you completed the
Isabella Nutrition Assessment? If yes, share your four scores — Protein,
Hydration, Recovery fuel, Muscle preservation — or upload/paste your PDF and
I'll read them." If the user uploads a nutrition PDF, parse the four scores
from it and pass them in `nutrition.{protein_score, hydration_score,
recovery_score, muscle_preservation_score}`. This unlocks the Combined
Resilience Score.

REPORT TRIGGER: The moment Phase 4 is complete (Phase 5 asked, answered or
skipped), call `recovery_resilience_assessment` IN THE SAME TURN. Do NOT post a
"thank you, let me build your report" turn first — that wastes avatar credits
and creates the failure pattern we are fixing. In the SAME reply: a 4–6 sentence
warm executive summary that names the user's top 2–3 fastest wins, THEN the
fenced assessment-report block verbatim so the PDF renders automatically.

ABSOLUTELY FORBIDDEN:
- Calling the tool with fewer than 25 populated fields.
- Producing the report after only Phase 1 + half of Phase 2 (the current bug).
- Emitting an executive_wellness score without `work_hours_per_week`,
  `pressure_frequency`, `sleep_quality`, `exercise_sessions_per_week`,
  `social_support`, AND `work_life_balance` all present.
- Promising the user "I will send your report" without also calling the tool
  and emitting the fenced block in the same turn.
```

---

## 4. Pre-execution validator (defensive — recommended in your edge function)

Add this guard right before invoking the tool in the Guide's chat function. If it trips, send the model a synthetic "tool refused — collect missing fields" message instead of executing:

```ts
const requiredForDetailedRecovery = [
  // Phase 1
  'age', 'gender', 'height_cm', 'weight_kg', 'primary_goal',
  // Phase 2
  'work_hours_per_week', 'pressure_frequency', 'responsibility_level',
  'works_evenings', 'works_weekends',
  // Phase 3
  'sleep_hours', 'sleep_quality', 'exercise_sessions_per_week',
  'exercise_type', 'takes_recovery_days', 'outdoor_hours_per_week',
  // Phase 4
  'alcohol_units_per_week', 'caffeine_per_day', 'water_liters_per_day',
  'social_support', 'work_life_balance', 'stress_level',
  'energy_level', 'motivation_level',
];

const missing = requiredForDetailedRecovery.filter(
  k => args[k] === undefined || args[k] === null || args[k] === ''
);

if (missing.length > 3) {
  // Refuse the call and steer Isabella back to intake
  return {
    refused: true,
    reason: `Cannot generate Executive Recovery report — missing ${missing.length} required fields: ${missing.join(', ')}. Complete Phases 1–4 first.`
  };
}
```

The Ovela tool itself is permissive (it defaults missing fields) — so the *only* defence is at the LLM prompt layer + this pre-call validator. Add both.

---

## 5. Where the report's depth comes from (so Guide stops thinking "more text = better prompt")

The `recoveryResilienceAssessment` function returns a structured object — the renderer (`assessmentReport.ts`) paints sections based on whether those keys are populated. Sections only render when their inputs exist:

| Report section | Driven by inputs |
|---|---|
| **Executive Wellness Score** | recoveryCapacity + stressLoad + resilience + lifestyleRecovery |
| **Recovery Capacity score** | sleep_hours, sleep_quality, wakes_refreshed, exercise_*, takes_recovery_days, outdoor_hours_per_week |
| **Stress Load score** | work_hours_per_week, pressure_frequency, responsibility_level, stress_level, works_evenings, works_weekends, meeting + travel hours |
| **Lifestyle Recovery score** | alcohol_units_per_week, caffeine_per_day, water_liters_per_day |
| **Resilience score** | social_support, work_life_balance, energy_level, motivation_level, stress_level, recoveryCapacity (+ optional nutrition) |
| **Burnout Risk** (Low / Moderate / Elevated) | stressLoad + recoveryCapacity + resilience |
| **Recovery Stage Zone** (Green / Performance / Recovery Deficit / Burnout Risk) | executiveWellness |
| **Executive Recovery Archetype** | workH, pressure, exercise, sleep, stress, energy, work_life_balance |
| **Dominant Recovery Patterns** (up to 4) | combinations across all phases |
| **Recovery Drains vs Protectors** | every factor < 55 = drain; > 65 = protector |
| **Isabella's Clinical Observation** | the full input set woven into a 2–3 sentence pattern read |
| **14-day Projected Gains** | requires baseline scores → only meaningful if Phases 1–4 are complete |
| **30 / 60 / 90-day Outlook** | always rendered but only credible with full inputs |
| **7-Day Recovery Plan** | always rendered |
| **Fastest Wins (top 3)** | requires the full factorScores list — needs all phases |
| **Combined Resilience Score** | only if Phase 5 nutrition scores are passed |

**Bottom line:** No prompt-side wordsmithing will rescue a tool call with 9 inputs. The depth comes from the inputs. Collect them.

---

## 6. Nutrition ↔ Recovery integration (what user asked for)

The user explicitly wants: *"this has to be high quality report… and it should be part of the nutrition assessment if user has one so they can upload when isabella asks for it."*

Implementation on the Guide side:

1. **Phase 5 prompt change** — when asking about prior nutrition assessment, accept all of:
   - Pasted scores (4 numbers)
   - Uploaded WellneSpirit nutrition PDF (parse via existing attachment pipeline)
   - "I did it on Ovela" → ask user to paste/upload the PDF
2. **Cross-reference on the nutrition side** — at the end of every Guide *nutrition* report, add a CTA: *"Would you like to follow up with the Recovery & Resilience Assessment? Your nutrition scores will be folded into the combined resilience banner."*
3. **Memory link** — if both assessments exist for the same `user_id`, the recovery email template should attach BOTH PDFs (nutrition + recovery) and the email body should reference the combined score.

---

## 7. Verification checklist before you mark this fixed

Run this exact test conversation against Guide Isabella and confirm:

- [ ] Isabella announces "Step 1 of 5" and asks Phase 1 only.
- [ ] Isabella does NOT generate a report until after Phase 4.
- [ ] Isabella asks the nutrition cross-link question in Phase 5.
- [ ] The final report contains: Executive Wellness Score, Recovery Capacity, Stress Load, Resilience, Lifestyle Recovery, Burnout Risk, Recovery Stage Zone, Recovery Archetype, Dominant Patterns, Drains vs Protectors, Isabella's Clinical Observation, 14-day Projected Gains, 30/60/90 Outlook, 7-Day Plan, Top 3 Fastest Wins.
- [ ] If nutrition scores were provided, the Combined Resilience Score banner appears.
- [ ] PDF is emailed (BCC to both wellnespirit.digital@gmail.com + ovelainteractive@gmail.com per the email function).

If any section is missing from the PDF, it's an inputs problem, not a renderer problem — go back to the prompt and require the missing phase.

---

**Same handover folder, same contract as nutrition.** If you patch the prompt + add the pre-call validator, recovery reports will jump from one paragraph to the full 6–8 page executive report on the next test run.
