# Isabella Assessment Handover — Ovela → WellneSpirit Guide

> **Purpose:** Port the **Nutrition** and **Recovery & Resilience** assessments from Ovela Interactive (this project) to the WellneSpirit Guide project, so the WellneSpirit Isabella can run the exact same flows and produce the **exact same PDF report** — same structure, same sections, same disclaimer/footer chrome.
>
> **Mental model:** WellneSpirit's homepage Isabella stays on WellneSpirit. She simply launches **the same chat surface and the same Guide AI** with `assessment_mode = "nutrition" | "recovery"`. Everything else (booking, product knowledge, email confirmations, cancellations) is unchanged. There is no second Isabella, no second chat — only one Guide with a mode branch.
>
> **Last sync:** 2026-06-21 from `ovela-ai-companion` (this repo). All files below are verbatim extracts from this repo at that date.

---

## 1) Folder contents (this is the canonical package — port these 4+1 files)

| File | Source in this repo | Purpose |
|------|--------------------|---------|
| `nutritionAssessment.ts` | `supabase/functions/ovela-chat/_tools.ts` lines **809–2109** | Pure deterministic scoring function (BMR, protein bands, hydration, Executive Readiness, etc.) |
| `recoveryResilienceAssessment.ts` | `supabase/functions/ovela-chat/_tools.ts` lines **2112–2647** | Pure deterministic scoring (Executive Wellness, Recovery Capacity, Burnout Risk, fastest wins, 7-day plan) |
| `assessmentReport.ts` | `src/lib/assessmentReport.ts` (exact copy) | Client-side `jsPDF` renderer that parses the fenced ` ```assessment-report ` block and produces the branded PDF |
| `assessment-prompts.ts` | `supabase/functions/ovela-chat/index.ts` lines **604–665** | The `[ASSESSMENT_MODE]` system-prompt branches for nutrition + recovery, plus the language protocol, no-recap rule, and fenced-output contract — **persona-stripped** (Ovela voice removed; only the assessment protocol remains so it can drop into WellneSpirit Isabella's persona) |
| `_tools-shared.ts` | `supabase/functions/ovela-chat/_tools.ts` lines **1–808** | Shared constants/types/helpers that the two assessment functions depend on. Keep alongside or inline. |
| `email-assessment-report__index.ts` | `supabase/functions/email-assessment-report/index.ts` | Reference Resend edge function template for emailing the rendered PDF (the WG branded version replaces the `from` + HTML chrome). |
| `sample-nutrition-assessment.pdf` | `public/sample-nutrition-assessment.pdf` | Real PDF render — use to visually match fonts, section order, disclaimer & footer chrome before wiring the renderer into the WG branded PDF pipeline. |
| `sample-recovery-resilience.json` | Generated from a real run on 2026-06-21 | Reference JSON payload (the shape inside the fenced block) for the recovery type. Run it through `assessmentReport.ts` locally to produce the matching sample PDF. |

> **Note on sample PDFs:** Only one rendered sample PDF (nutrition) ships in this handover folder. The recovery PDF is generated client-side by `assessmentReport.ts`, so we ship the canonical JSON payload (`sample-recovery-resilience.json`) — paste it inside a fenced ` ```assessment-report ` block in any session and the same renderer produces a structurally identical PDF. If you want a pre-rendered recovery PDF instead, tell me and I'll attach one in the next push.

---

## 2) Fenced Output Contract (THE thing the Guide agent must emit)

Isabella must ALWAYS emit the report inside a fenced block with the exact label `assessment-report` so `assessmentReport.ts` can parse it:

```
```assessment-report
{
  "type": "nutrition_assessment" | "recovery_resilience",
  "title": "Executive Nutrition & Muscle Preservation Assessment" | "Executive Recovery & Resilience Assessment",
  "data": { ... the FULL tool result JSON ... }
}
```
```

Parser regex (verbatim from `supabase/functions/ovela-chat/index.ts` line 71):

```ts
/`{2,3}\s*assessment-report\s*([\s\S]*?)`{2,3}/i
```

Rules:
- `type` is **required** and must be exactly `"nutrition_assessment"` or `"recovery_resilience"`. Legacy alias `"biological_age"` is mapped to `"recovery_resilience"` server-side.
- `data` is the **entire** return value of the tool function — do not strip, reorder, or summarize fields.
- The human 4–6 sentence executive summary goes **BEFORE** the fenced block.
- After the block, append: *"You can download the PDF or use the 'Email PDF to me' button below the report to have it sent to your inbox."*

### `data` shape — `nutrition_assessment`

Top-level keys returned by `nutritionAssessment()` (see file for full types):

- `inputs` — echoed user inputs
- `targets` — `{ daily_calories, protein_g: { low_g, mid_g, high_g }, carbs_g, fat_g, hydration_l_range: [low, high] }`
- `muscle_preservation` — `{ recommended_protein_g, per_meal_protein_g, leucine_strategy, ... }`
- `hydration` — `{ optimal_range_l, status_band: "red"|"yellow"|"green"|"blue", efficiency_score, symptoms_flag, ... }`
- `executive_readiness` — `{ score (0–100), level, drivers[], drift_factors[] }`
- `risk_flags` — `{ waist, thyroid_signal, medications_context, digestion, ... }` (signal-only, non-diagnostic)
- `daily_meal_framework` — `{ breakfast, lunch, dinner, snack, swap_suggestions[] }`
- `top_meals` — `{ strongest, weakest }`
- `habit_upgrades[]`, `fastest_wins[]`, `seven_day_plan`
- `personal_notes` — short string for memory continuity
- `closing_recommendation`, `disclaimer` (educational-only string — render verbatim in the PDF footer)

### `data` shape — `recovery_resilience`

- `inputs`
- `scores` — `{ executive_wellness (0–100), recovery_capacity (0–100), burnout_risk: "low"|"moderate"|"elevated"|"high", combined_resilience_score (only if nutrition scores were passed) }`
- `workload_profile`, `recovery_profile`, `lifestyle_profile`
- `fastest_wins[]`, `seven_day_plan`
- `personal_profile_snapshot`
- `closing_recommendation`, `disclaimer`

---

## 3) How the WellneSpirit Guide wires this in

```ts
// pseudo-code inside the WellneSpirit Guide edge function
import { nutritionAssessment } from "./assessments/nutritionAssessment.ts";
import { recoveryResilienceAssessment } from "./assessments/recoveryResilienceAssessment.ts";
import {
  NUTRITION_ASSESSMENT_PROMPT,
  RECOVERY_ASSESSMENT_PROMPT,
  SHARED_ASSESSMENT_RULES,
  LANGUAGE_PROTOCOL,
  FENCED_OUTPUT_CONTRACT,
} from "./assessments/assessment-prompts.ts";

const assessmentMode = req.assessment_mode; // "nutrition" | "recovery" | null

let systemPrompt = WELLNESPIRIT_ISABELLA_PERSONA; // your existing persona
if (assessmentMode) {
  systemPrompt += "\n\n" + SHARED_ASSESSMENT_RULES;
  systemPrompt += "\n\n" + LANGUAGE_PROTOCOL(req.language);
  if (assessmentMode === "nutrition") systemPrompt += "\n\n" + NUTRITION_ASSESSMENT_PROMPT;
  if (assessmentMode === "recovery")  systemPrompt += "\n\n" + RECOVERY_ASSESSMENT_PROMPT;
  systemPrompt += "\n\n" + FENCED_OUTPUT_CONTRACT;
}

// Register the matching tool with your LLM provider (function-calling).
// Tool name MUST be exactly: "nutrition_assessment" or "recovery_resilience_assessment".
// On tool-call, run the pure function and return its JSON to the model so it
// can emit the fenced block in the SAME turn.
```

Client-side, the WellneSpirit chat UI parses the fenced block with the regex above and calls `renderAssessmentPDF(payload)` from `assessmentReport.ts`. The "Email PDF to me" button posts the base64 PDF to your Resend edge function (`email-assessment-report` template included).

---

## 4) What WellneSpirit Isabella keeps doing (unchanged)

- Bookings, product/solution knowledge, cancellations, transactional emails — all stay in the existing WellneSpirit Guide agent.
- The WellneSpirit homepage Isabella is the **only** Isabella the user sees on WG. She launches the chat with `assessment_mode` set and the URL/return-to handled by your existing pattern (the same WG voice/avatar/branding throughout).
- After the PDF is delivered, Isabella offers a natural "Return to dashboard" CTA and the conversation continues in normal WG mode.

---

## 5) Confirmation checklist (so we both know nothing's drifting)

- [ ] All 4 canonical files present (`nutritionAssessment.ts`, `recoveryResilienceAssessment.ts`, `assessmentReport.ts`, `assessment-prompts.ts`)
- [ ] `_tools-shared.ts` imported by both assessment files
- [ ] Tool names registered exactly: `nutrition_assessment`, `recovery_resilience_assessment`
- [ ] Fenced block label is literally `assessment-report` (lowercase, hyphen)
- [ ] `type` field uses `nutrition_assessment` or `recovery_resilience` (snake_case, no spaces)
- [ ] Human summary precedes the fenced block, "Email PDF to me" instruction follows it
- [ ] Disclaimer text rendered verbatim in PDF footer
- [ ] Hard gates respected: Phase 5 diary required for nutrition; Phases 1–4 complete for recovery; no report on noisy input
- [ ] PDF visually matches `sample-nutrition-assessment.pdf` (fonts, section order, footer chrome)

When all 9 boxes are checked you're production-ready. Ping back if anything diverges and I'll patch this folder.
