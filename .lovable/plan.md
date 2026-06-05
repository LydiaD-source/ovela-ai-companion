# Final Free-Version Polish (Ovela + WellneSpirit upsell)

Goal: lock the **Free Assessment v1.0** so it's ready to publish on both ovelainteractive.com and wellnespirit.com. After this, the next stage (paid Pro on WellneSpirit) adds Stripe, accounts, weekly tracking, memory.

This plan only covers what we do **now** in the free version. Paid features are deferred.

---

## 1. Trial gating (7-day free window)

**Where:** `supabase/functions/ovela-chat/index.ts` + tiny client signal.

- Track `first_assessment_at` per `user_id` in a lightweight Supabase table (`assessment_trial`) — anonymous users keyed by stable `client_id` cookie already sent.
- On every assessment tool call, the edge function:
  - If no record → insert `first_assessment_at = now()`, allow.
  - If record exists and `now() - first_assessment_at <= 7 days` → allow.
  - If > 7 days → still return the report **once more** with a `trial_expired: true` flag, and Isabella's closing message becomes the upsell:
    > "Your 7-day free assessment window has ended. To continue receiving weekly assessments, progress tracking and Isabella's ongoing support, activate the full monthly programme at **wellnespirit.com** — our clinical partner for executive nutrition."
- After expiration, subsequent assessment requests return the upsell message only (no new PDF).

**Migration:** new table `public.assessment_trial(user_id text pk, first_assessment_at timestamptz)` with GRANTs + RLS (service_role only, edge function writes).

## 2. Time-budget profiling

**Where:** `_tools.ts` schema + `index.ts` system prompt + `assessmentReport.ts`.

- Add `time_budget` enum field to the nutrition assessment tool:
  `enjoys_cooking | cooks_when_time | needs_quick_meals | travels_frequently`
- Isabella must ask one short question before generating: *"Which best describes you: enjoy cooking, cook when you have time, need quick meals, or travel frequently?"*
- Recommendations adapt:
  - `needs_quick_meals` / `travels_frequently` → "buy this, add this, done in 2 minutes" style (ready-to-eat protein, pre-cooked options, no soaking/prep verbs).
  - `enjoys_cooking` → full recipes allowed.
- Render a small "Tailored for: Quick meals" chip near the meal framework section.

## 3. Food-specific recommendations ("foods you already eat")

**Where:** `_tools.ts` schema adds `habit_upgrades: [{existing_meal, upgrade, why}]` (3–5 items). Prompt requires Isabella to anchor each suggestion to a meal from the diary.

- Render new section **"Upgrade the meals you already eat"** between "What Isabella noticed" and "Fastest Win".
- Examples baked into the prompt so the model produces the right tone: "Your yogurt breakfast → add one scoop whey for +25g protein."

## 4. Micronutrient risk flags (observational, not diagnostic)

**Where:** `_tools.ts` adds `nutrition_risk_flags: [{nutrient, confidence: low|moderate|high, reasoning}]`.

- Allowed nutrients: fibre, omega-3, magnesium, potassium, vitamin D, vegetable diversity.
- Confidence inferred from diary patterns (no oily fish → omega-3 moderate; <2 veg servings/day → fibre + vegetable diversity moderate, etc.).
- Render as **"Nutrition risk flags (observational)"** section with amber-styled chips. Disclaimer line: *"Observations from your diary — not a diagnosis. Confirm with a clinician if relevant."*

## 5. "What success looks like in 14 days"

**Where:** `_tools.ts` already has `reassessment_projection`. Add sibling `success_preview: {if_completed: string[], you_should_notice: string[]}`.

- Renders inside the closing "Reassess in 14 days" section as a two-column checklist (Actions ✓ / Expected wins).

## 6. WellneSpirit upsell footer (always, even before trial expires)

- Last page of every PDF + closing chat message after report: soft mention that weekly tracking & monthly reassessments live at WellneSpirit.com.
- Pre-expiry tone: invitational. Post-expiry: required to continue.

## 7. Dedupe + polish pass

- Confirm "Fastest Win" appears exactly once.
- Verify color hierarchy (green / amber / red) still reads cleanly with new sections.
- Renumber sections 1–19 sequentially in `assessmentReport.ts`.

---

## What we are NOT doing in this stage

Deferred to **Stage 2 — WellneSpirit Pro**:
- Stripe checkout + €19/month subscription
- User accounts / login
- Assessment memory (compare today vs last month)
- Weekly automated reassessment emails
- Product link integrations (whey, supplements, etc.)
- Recovery & Resilience assessment
- Biological age / longevity scoring

---

## Technical surfaces touched

- `supabase/migrations/<new>.sql` — `assessment_trial` table + GRANTs + RLS
- `supabase/functions/ovela-chat/_tools.ts` — schema additions (time_budget, habit_upgrades, nutrition_risk_flags, success_preview)
- `supabase/functions/ovela-chat/index.ts` — trial check, upsell injection, prompt updates requiring the new fields
- `src/lib/assessmentReport.ts` — render new sections, footer upsell, renumber

## Verification

1. Run a full fake assessment via curl — confirm new fields present in tool output.
2. Inspect generated PDF: new sections render, dedupe holds, colors correct.
3. Simulate trial expiry by backdating the row — confirm upsell message replaces report.
4. Confirm "Email PDF" + download buttons still appear when report is delivered.

Reply **go** to execute, or tell me what to change.