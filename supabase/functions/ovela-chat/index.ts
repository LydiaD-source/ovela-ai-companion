// ovela-chat index.ts - defensive, single-source of truth
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { calcReceptionistCost, calcMissedLeads, wellnessAssessmentSuggestion, nutritionAssessment, recoveryResilienceAssessment } from "./_tools.ts";

/**
 * NOTE:
 * - This function will attempt to proxy to WELLNESS_GENI_API_URL if it is a VALID URL.
 * - If WELLNESS_GENI_API_URL is missing or invalid, it will CALL OPENAI directly using OPENAI_API_KEY.
 * - WELLNESS_GENI_API_KEY must be the Ovela client key (wg_...) used when proxying to an external WellnessGeni.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function isValidUrl(v: string | null | undefined) {
  if (!v) return false;
  try {
    // reject values that look like API keys (start with wg_ or are not a URL)
    if (/^wg_/.test(v.trim())) return false;
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Local fallback brand guide if admin fetch is unavailable
const LOCAL_OVELA_BRAND_GUIDE = `{
  "id": "ovela_client_001",
  "status": "active",
  "voice": "Isabella",
  "style": "elegant, confident, emotionally intelligent, conversational",
  "context": "Ovela Interactive - AI-powered fashion, lifestyle, and brand experience guide",
  "guidelines": [
    "Keep replies short, warm, and dynamic",
    "Use storytelling, subtle humor, and empathy",
    "Always align to Ovela's lifestyle & fashion focus",
    "Do not mention AI providers, keys, or developer systems"
  ]
}`;

function extractAssistantText(body: any) {
  try {
    const candidates = [
      body?.message,
      body?.response,
      body?.text,
      body?.content,
      body?.answer,
      body?.reply,
      body?.output,
      body?.result,
      body?.data?.message,
      body?.data?.response,
      body?.data?.text,
      body?.choices?.[0]?.message?.content,
      typeof body === "string" ? body : "",
      body?.raw && typeof body.raw === "string" ? body.raw : ""
    ].filter((v: any) => typeof v === "string" && v.trim().length > 0);
    return candidates[0] || "";
  } catch {
    return "";
  }
}

function parseAssessmentReportBlock(text: string) {
  const match = (text || "").match(/`{2,3}\s*assessment-report\s*([\s\S]*?)`{2,3}/i);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim().replace(/^json\s*/i, ""));
  } catch {
    return null;
  }
}

function isMeaningfulReportPayload(payload: any) {
  if (!payload || typeof payload !== "object") return false;
  const data = payload.data || payload.nutrition_assessment_response || payload.recovery_resilience_response || payload.recovery_resilience_assessment_response || payload.biological_age_response || payload;
  const type = payload.type === "biological_age" ? "recovery_resilience" : payload.type;
  if (type === "nutrition_assessment" || payload.nutrition_assessment_response || data?.daily_meal_framework || data?.muscle_preservation) {
    return Boolean(
      (typeof data?.targets?.daily_calories === "number" && data.targets.daily_calories > 500) ||
      (typeof data?.targets?.protein_g?.low_g === "number" && data.targets.protein_g.low_g > 20) ||
      (typeof data?.muscle_preservation?.recommended_protein_g === "number" && data.muscle_preservation.recommended_protein_g > 20)
    );
  }
  if (type === "recovery_resilience" || payload.recovery_resilience_response || payload.biological_age_response) {
    return Boolean(
      (typeof data?.scores?.executive_wellness === "number" && data.scores.executive_wellness > 0) ||
      (typeof data?.scores?.recovery_capacity === "number" && data.scores.recovery_capacity > 0) ||
      typeof data?.scores?.burnout_risk === "string"
    );
  }
  return false;
}

const ACTIVITY_LEVELS = ["sedentary", "moderate", "active", "athlete"];
const NUTRITION_GOALS = ["fat_loss", "muscle_gain", "performance", "healthy_aging", "energy", "longevity", "recovery", "muscle_maintenance", "maintenance"];
const DIET_TYPES = ["omnivore", "vegetarian", "vegan"];

function normalizeNutritionArgs(args: any, corpus = "") {
  const out = { ...(args || {}) };
  const text = `${corpus || ""}\n${out.occupation || ""}`.toLowerCase();
  const strength = Number(out.strength_sessions_per_week);
  const cardio = Number(out.cardio_sessions_per_week);
  const walk = Number(out.daily_walk_minutes);

  if (!ACTIVITY_LEVELS.includes(out.activity_level)) {
    const sessions = (Number.isFinite(strength) ? strength : 0) + (Number.isFinite(cardio) ? cardio : 0);
    if (/athlete|competitive|bodybuilder|triathlon|marathon/.test(text)) out.activity_level = "athlete";
    else if (/physical|construction|manual|standing|trainer|very active/.test(text) || sessions >= 5 || walk >= 75) out.activity_level = "active";
    else if (/desk|office|sedentary|sitting/.test(text) && sessions <= 1 && (!Number.isFinite(walk) || walk < 30)) out.activity_level = "sedentary";
    else out.activity_level = "moderate";
  }

  if (!DIET_TYPES.includes(out.diet_type)) {
    if (/\bvegan\b|plant[- ]?based/.test(text)) out.diet_type = "vegan";
    else if (/\bvegetarian\b/.test(text) && !/chicken|beef|fish|salmon|tuna|turkey|pork|ham|seafood/.test(text)) out.diet_type = "vegetarian";
    else out.diet_type = "omnivore";
  }

  if (!Number.isFinite(Number(out.est_protein_g))) {
    const mealProtein = [out.breakfast_protein_g, out.lunch_protein_g, out.dinner_protein_g, out.snack_protein_g]
      .map(Number)
      .filter(Number.isFinite)
      .reduce((sum, value) => sum + value, 0);
    if (mealProtein > 0) out.est_protein_g = Math.round(mealProtein);
  }

  if (!Number.isFinite(Number(out.est_hydration_l)) && Number.isFinite(Number(out.water_liters_per_day))) {
    out.est_hydration_l = Number(out.water_liters_per_day);
  }

  return out;
}

function missingCoreNutritionFields(args: any) {
  const missing: string[] = [];
  if (!Number.isFinite(Number(args?.age))) missing.push("age");
  if (!Number.isFinite(Number(args?.height_cm))) missing.push("height");
  if (!Number.isFinite(Number(args?.weight_kg))) missing.push("weight");
  if (!["male", "female", "other"].includes(args?.gender)) missing.push("gender");
  if (!ACTIVITY_LEVELS.includes(args?.activity_level)) missing.push("activity level");
  if (!NUTRITION_GOALS.includes(args?.goal)) missing.push("primary goal");
  if (!DIET_TYPES.includes(args?.diet_type)) missing.push("diet type");
  return missing;
}

function hasUsableNutritionArgs(args: any) {
  const normalized = normalizeNutritionArgs(args);
  return Boolean(
    missingCoreNutritionFields(normalized).length === 0
  );
}

function hasUsableRecoveryArgs(args: any) {
  return Boolean(
    Number.isFinite(Number(args?.age)) &&
    Number.isFinite(Number(args?.work_hours_per_week)) &&
    Number.isFinite(Number(args?.sleep_hours)) &&
    Number.isFinite(Number(args?.stress_level)) &&
    Number.isFinite(Number(args?.energy_level))
  );
}

const GUIDE_TTL_MS = 5 * 60 * 1000;
let guideCache: { text: string; at: number; clientId: string } | null = null;

// Helper to submit lead to CRM
async function submitLeadToCRM(leadData: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('📋 Submitting lead to CRM:', { email: leadData.email, inquiry_type: leadData.inquiry_type, hasApiKey: !!supabaseKey });
    
    const response = await fetch(`${supabaseUrl}/functions/v1/crm-new-lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey || '',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify(leadData)
    });
    
    const result = await response.json();
    console.log('✅ CRM Submission Result:', result);
    return result.success === true;
  } catch (error) {
    console.error('❌ CRM Submission Error:', error);
    return false;
  }
}

// ── 7-day free trial gate for the nutrition assessment ─────────────────
// Tracks first-assessment timestamp per user_key in public.assessment_trial.
// After 7 days, returns trial_expired=true so the chat can replace the
// PDF delivery with the WellneSpirit upsell.
const TRIAL_WINDOW_DAYS = 7;
async function checkAndRecordTrial(userKey: string): Promise<{ trial_expired: boolean; days_used: number; first_at: string | null }> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey || !userKey) {
      return { trial_expired: false, days_used: 0, first_at: null };
    }
    const headers = {
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    };
    // 1) Try to fetch existing record
    const getRes = await fetch(`${supabaseUrl}/rest/v1/assessment_trial?user_key=eq.${encodeURIComponent(userKey)}&select=user_key,first_assessment_at,assessment_count`, { headers });
    let row: any = null;
    if (getRes.ok) {
      const arr = await getRes.json();
      row = Array.isArray(arr) && arr.length ? arr[0] : null;
    }
    const now = Date.now();
    if (!row) {
      // Insert new
      await fetch(`${supabaseUrl}/rest/v1/assessment_trial`, {
        method: "POST",
        headers,
        body: JSON.stringify({ user_key: userKey, first_assessment_at: new Date().toISOString(), assessment_count: 1, last_assessment_at: new Date().toISOString() }),
      });
      return { trial_expired: false, days_used: 0, first_at: new Date().toISOString() };
    }
    const firstAt = new Date(row.first_assessment_at).getTime();
    const daysUsed = Math.floor((now - firstAt) / (1000 * 60 * 60 * 24));
    const expired = daysUsed > TRIAL_WINDOW_DAYS;
    // Bump count + last seen (best-effort)
    await fetch(`${supabaseUrl}/rest/v1/assessment_trial?user_key=eq.${encodeURIComponent(userKey)}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ assessment_count: (row.assessment_count ?? 0) + 1, last_assessment_at: new Date().toISOString() }),
    });
    return { trial_expired: expired, days_used: daysUsed, first_at: row.first_assessment_at };
  } catch (e) {
    console.warn("⚠️ Trial check failed (allowing assessment):", e);
    return { trial_expired: false, days_used: 0, first_at: null };
  }
}

const WELLNESPIRIT_PRE_EXPIRY_FOOTER =
  "\n\nIf you'd like weekly tracking, progress comparisons and monthly reassessments, the full monthly programme lives at our clinical partner WellneSpirit (wellnespirit.com).";

const WELLNESPIRIT_EXPIRED_MESSAGE =
  "Thank you for using your free 7-day Isabella assessment window.\n\nTo continue receiving weekly assessments, progress tracking and ongoing support from Isabella, please activate the full monthly programme at our clinical partner **WellneSpirit** — visit wellnespirit.com and register for the Executive Wellness subscription.\n\nYour previous assessment, scores and recommendations remain valid for the next 14 days.";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Read env vars
    const rawBase = Deno.env.get("WELLNESS_GENI_API_URL");
    const proxiedUrl = isValidUrl(rawBase) ? rawBase!.trim() : null;
    const ovelaApiKey = Deno.env.get("WELLNESS_GENI_API_KEY"); // wg_... client key
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const ovelaGuide = Deno.env.get("OVELA_GUIDE"); // Ovela Interactive brand guide
    const ovelaClientFromEnv = Deno.env.get("OVELA_CLIENT_ID")?.trim() || "ovela_client_001";

    // Diagnostic logging
    console.log("🔍 Brand Template Diagnostics:", {
      hasWellnessGeniUrl: !!rawBase,
      isValidUrl: !!proxiedUrl,
      rawUrlValue: rawBase ? (rawBase.startsWith('wg_') ? '[API_KEY_DETECTED]' : rawBase.substring(0, 30) + '...') : '[NOT_SET]',
      hasApiKey: !!ovelaApiKey,
      hasLocalGuide: !!ovelaGuide,
      clientId: ovelaClientFromEnv
    });

    if (!proxiedUrl && rawBase) {
      console.warn("⚠️ WELLNESS_GENI_API_URL is set but invalid. Value starts with:", rawBase.substring(0, 20));
      console.warn("💡 It should be a URL like 'https://api.wellnessgeni.com', not an API key");
    }

    if (!ovelaApiKey) {
      console.warn("⚠️ WELLNESS_GENI_API_KEY not set. Proxy mode disabled.");
    }

    const body = await req.json().catch(() => ({}));
    const incomingMessage = (body?.prompt ?? body?.message ?? "").toString();
    const persona = body?.persona ?? "isabella-navia";
    const brandGuideIn = body?.brand_guide;
    const userId = body?.user_id ?? body?.userId ?? "ovela-guest";
    const clientId = body?.client_id ?? ovelaClientFromEnv;
    const conversationHistory = body?.conversation_history || [];
    const language = body?.language || "auto";
    // Page / tool context injected from the client (authority pages, calculators, assessments)
    const pageContext = (body?.page_context || "").toString().slice(0, 500);
    const toolContext = (body?.tool_context || "").toString().slice(0, 200); // e.g. "receptionist_cost_calculator"
    const authorityTopic = (body?.authority_topic || "").toString().slice(0, 200);
    // Attachments: { name, mime_type, data_url?, text? } — images sent as data URL to Gemini vision,
    // text/PDF content extracted client-side and passed as `text`. NOT persisted.
    const attachments: Array<{ name?: string; mime_type?: string; data_url?: string; text?: string }> =
      Array.isArray(body?.attachments) ? body.attachments.slice(0, 6) : [];

    // Fetch brand guide from WellnessGeni admin if available
    let fetchedGuide: string | undefined = undefined;

    // 1) Use cache if fresh
    if (guideCache && guideCache.clientId === clientId && Date.now() - guideCache.at < GUIDE_TTL_MS) {
      console.log("🗂️ Using cached brand guide", { clientId });
      fetchedGuide = guideCache.text;
    } else {
      // 2) Try loader edge function first (keeps secrets server-side)
      try {
        const loaderUrl = "https://vrpgowcocbztclxfzssu.functions.supabase.co/functions/v1/load-ovela-brand";
        const loaderRes = await fetch(loaderUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: clientId })
        });
        console.log("📡 load-ovela-brand status:", loaderRes.status);
        if (loaderRes.ok) {
          const j = await loaderRes.json();
          fetchedGuide = j?.guide;
          if (fetchedGuide) {
            guideCache = { text: fetchedGuide, at: Date.now(), clientId };
            console.info("✅ Ovela Brand Guide (ovela_client_001) injected successfully");
          }
        }
      } catch (e) {
        console.warn("⚠️ load-ovela-brand error", String(e));
      }

      // 3) Fallback to direct admin if configured
      if (!fetchedGuide && proxiedUrl && ovelaApiKey) {
        try {
          console.log("🌐 Fetching brand template from WellnessGeni admin for client:", clientId);
          console.log("📍 Admin URL:", proxiedUrl);

          let guideResponse = await fetch(`${proxiedUrl}/brand-templates/${clientId}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${ovelaApiKey}`,
              "Accept": "application/json"
            }
          });
          console.log("📡 Admin brand-templates status:", guideResponse.status);

          if (!guideResponse.ok) {
            guideResponse = await fetch(`${proxiedUrl}/brand-guide`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${ovelaApiKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ action: "getBrandGuide", payload: { client_id: clientId } })
            });
            console.log("📡 Admin legacy brand-guide status:", guideResponse.status);
          }

          if (guideResponse.ok) {
            const guideData = await guideResponse.json();
            fetchedGuide = guideData?.prompt || guideData?.data?.guide_content || guideData?.guide_content;
            if (fetchedGuide) {
              guideCache = { text: fetchedGuide, at: Date.now(), clientId };
              console.info("✅ Ovela Brand Guide (ovela_client_001) injected successfully");
            } else {
              console.warn("⚠️ Admin returned OK but no prompt/guide_content found in response");
            }
          } else {
            const errorText = await guideResponse.text();
            console.warn("❌ Failed to fetch brand guide from admin. Status:", guideResponse.status);
            console.warn("Error response:", errorText.substring(0, 200));
          }
        } catch (err) {
          console.error("❌ Error fetching brand guide from admin:", err);
          console.error("Stack:", err instanceof Error ? err.stack : String(err));
        }
      }
    }

    // Determine brand guide source
    let guideSource: string = "none";
    let effectiveGuide = brandGuideIn ?? fetchedGuide ?? ovelaGuide ?? LOCAL_OVELA_BRAND_GUIDE;
    if (brandGuideIn) guideSource = "inline";
    else if (fetchedGuide) guideSource = "admin";
    else if (ovelaGuide) guideSource = "env";
    else guideSource = "local-fallback";
    const payload = {
      message: incomingMessage,
      persona,
      ...(effectiveGuide ? { brand_guide: effectiveGuide } : {}),
      userId,
      user_id: userId,
      client_id: clientId,
      source: "ovela",
      context: "ovela-interactive"
    };

    console.log("📊 ovela-chat request summary", {
      incomingMessage: incomingMessage ? "[RECEIVED]" : "[empty]",
      persona,
      clientId,
      language,
      usedGuide: !!effectiveGuide,
      guideSource,
      guidePreview: effectiveGuide ? effectiveGuide.substring(0, 100) + '...' : '[none]',
      proxiedUrl: !!proxiedUrl ? "[external]" : "[none]"
    });

    if (effectiveGuide) {
      console.info("✅ Ovela Brand Guide (ovela_client_001) injected successfully");
    } else {
      console.warn("⚠️ Using default fallback prompt for Isabella (ovela_client_001)");
    }

    // Timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // If we have a valid external WellnessGeni URL, proxy to it (useful when you have a hosted WellnessGeni)
    if (proxiedUrl && ovelaApiKey) {
      try {
        const res = await fetch(proxiedUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${ovelaApiKey}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Ovela-Supabase-Function/1.0"
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        const contentType = res.headers.get("content-type") || "";
        const responseBody = contentType.includes("application/json") ? await res.json() : { raw: await res.text() };
        console.log("ovela-chat proxied response", { status: res.status });
        if (!res.ok) {
          return new Response(JSON.stringify({ success: false, message: `Upstream error ${res.status}`, data: {} }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const assistantText = extractAssistantText(responseBody);
        console.log("Isabella (Ovela) ready – brand personality active ✅", { clientId, guideSource });
        return new Response(JSON.stringify({ success: true, message: assistantText, data: {} }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        clearTimeout(timeoutId);
        console.error("ovela-chat proxy fetch error", { err: String(err), proxiedUrl });
        return new Response(JSON.stringify({ success: false, message: `Network error: ${err instanceof Error ? err.message : String(err)}`, data: {} }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // FALLBACK: No valid external WellnessGeni endpoint — use Lovable AI Gateway (Gemini) for local generation
    try {
      const aiMessages: any[] = [];
      
      // Isabella's Ovela Interactive brand ambassador persona
      const isabellaSystemPrompt = `You are Isabella, Ovela Interactive's AI ambassador. You talk like a real person — warm, sharp, and helpful.

CONVERSATION RULES:
- Answer the user's ACTUAL question FIRST. Always.
- Keep replies to 2-3 sentences. Only go longer if user explicitly asks for details.
- No filler. No repeating what the user said. No re-introductions after the first message.
- If user told you their name, remember it and use it naturally.
- If something is unclear, ask ONE short follow-up question.
- After lead capture, CONTINUE the conversation normally — answer questions about services, options, pricing, anything they ask. Never go silent or repeat the confirmation.

LANGUAGE:
- Detect the user's language and ALWAYS reply in that SAME language. Switch seamlessly if they switch.
- Never mention OpenAI, API keys, Lovable AI, or developer systems.

OVELA SERVICES (use this knowledge to answer questions):
- AI-powered interactive digital experiences for websites and campaigns
- Isabella AI deployment — add an AI host to any website that engages visitors, answers questions, and captures leads 24/7
- Interactive content campaigns — AI-driven brand storytelling and engagement
- Website integration packages — embed Isabella on client websites
- Custom AI ambassador creation — tailored persona, voice, and brand knowledge
- Content generation and brand consulting

When asked about options/services, briefly list 2-3 relevant ones and ask which interests them. Expand only when asked.

LEAD CAPTURE (natural flow — not a rigid script):
- Only collect contact info when user shows CLEAR interest in working together, getting a demo, or collaborating
- Ask naturally in ONE message: "What's your name and best email so my team can follow up?"
- Infer inquiry_type from the conversation (collaboration, modeling, brand, demo, general)
- Once you have name + email → USE THE TOOL to submit, then confirm briefly and KEEP TALKING
- If user asks about services/options BEFORE giving contact info, answer their questions first — don't push for contact details prematurely
- NEVER ask for contact info twice. If already submitted, move on.

VIDEO PORTFOLIO (use suggest_videos tool):
- When user shows interest in examples, projects, campaigns, content, asks "what do you do", "show me", "have you worked with brands" — OFFER to show videos first, don't just call the tool
- Say something like "I can show you a few examples — would you like to see brand campaigns, wellness solutions, real estate, or a mix?"
- Categories: interactive_marketing (brand/fashion/luxury campaigns), wellness_spa (wellness/spa/health), real_estate (property/architecture), ai_ambassador (AI host/digital human), studio_intro (general overview)
- After showing videos, guide toward conversion: "Would you like something similar for your brand?"
- Show max 2-3 videos per suggestion

PREMIUM CONTENT CREATION FLOW:
When user mentions creating content, videos, clips, promotions, brand ambassador content, marketing projects, campaigns, product videos, social media videos, YouTube/Instagram content, or asks "how does this work" / "can I create a video" / "promote my brand":
- Present the process as simple and fast. Explain what's needed:
  1) High-resolution product images with logos/brand names
  2) A video script with text they want Isabella to say
  3) Their notes, expressions, or comments for the project
- Emphasize: "Once submitted, expect first test clips within a couple of hours. Priority content creation is available for an additional fee."
- Mention this works for ALL project types: YouTube shorts, Instagram promos, website ads, interactive campaigns — clothing, accessories, or full brand experiences.
- Use premium language: "bespoke," "tailored," "high-end," "exclusive," "professional."
- Keep it concise — inform and connect to team, no checklist walk-through.
- After explaining, if user shows interest → trigger lead capture (name, email, project type, short description).
- Optionally offer to show relevant video examples from the portfolio if context is about content/video.

${effectiveGuide ? `\nBRAND CONTEXT:\n${effectiveGuide}` : ""}

${authorityTopic ? `\nAUTHORITY TOPIC (this conversation is on a ${authorityTopic} page): Speak as the expert on this topic. Frame answers around it.` : ""}
${pageContext ? `\nPAGE CONTEXT: ${pageContext}` : ""}
${toolContext ? `\nTOOL CONTEXT: The user just launched the "${toolContext}" tool. Ask the minimum questions needed to call the matching tool, then call it. Do NOT invent numbers — always use the tool.` : ""}

DETERMINISTIC TOOLS (use them — never guess numbers):
- calculate_receptionist_cost — when user asks salary/cost comparisons, ROI vs hiring, "how much would a receptionist cost in X". Required: country (ES,PT,FR,DE,IT,NL,BE,AD,CH,UK,IE). Optional: role, languages, shifts (business|extended|247), premium_skills. Ask only the 1–2 missing essentials.
- calculate_missed_leads — when user mentions missed calls, after-hours leads, lost revenue, language barriers losing customers. Inputs: monthly_inbound (required), miss_rate_pct, conversion_rate_pct, avg_deal_value_eur (sensible defaults if unknown).
- wellness_assessment_suggestion — when user shares symptoms / how they feel (stress, burnout, sleep, pain, hormones, skin). NEVER diagnose. Always include the disclaimer the tool returns and recommend WellneSpirit handoff. If symptoms are vague or multi-system, recommend the full body assessment.
- nutrition_assessment — Protein & Nutrition Assessment (PRO v2.0 — STRICT PROTOCOL). You are a thoughtful executive-wellness nutrition consultant who behaves like a real nutritionist taking proper intake.

  ABSOLUTE RULES (no exceptions, ever):
  • DO NOT call this tool, generate any PDF, any score, any "assessment-report" block, any calorie/protein number, or any recommendation UNTIL every mandatory phase below has been completed by the USER.
  • If the user sends meaningless, accidental, garbled, one-word, or off-topic input ("ok", "mod", "yes", "continue", "hello", "asdf", a fragment) at ANY phase, you MUST gently acknowledge ("Looks like that might have sent early — no problem"), restate the LAST open question, and WAIT. Never advance on noise. Never call the tool to "be helpful".
  • Every 3–4 turns briefly summarize what you've collected vs. what's still needed (a tiny checklist) so the user knows where they are.

  MANDATORY PHASES (collect in order, 2–3 questions per turn, warm and conversational):
    Phase 1 — Personal Profile: age, gender, height_cm, weight_kg, primary goal (fat_loss / muscle_gain / performance / healthy_aging / energy / longevity / recovery / muscle_maintenance / maintenance). If goal = fat_loss → also ask target_weight_kg ("do you have a goal weight in mind, or shall I estimate one at a healthy BMI of 24?").
    Phase 2 — Activity Profile: strength_sessions_per_week, cardio_sessions_per_week, activity_level (sedentary/moderate/active/athlete), occupation activity (sedentary/mixed/physical).
    Phase 3 — Recovery Profile: sleep_hours, alcohol_units_per_week (glasses of wine / beers per week — ALWAYS ask, never skip), coffee_cups_per_day (ALWAYS ask), daily_walk_minutes (ALWAYS ask — walking is a key longevity marker), water intake, diet_type (omnivore/vegetarian/vegan).
    Phase 4 — WEEKLY FOOD INTAKE (HARD GATE). After Phase 3 say explicitly: "Thank you. I now need your weekly food intake before I can calculate your nutrition assessment. Please share a full typical week — breakfast, lunch, dinner, snacks and drinks. You can type it, paste a diary, upload a PDF, Word doc, screenshot, or photo of your meals. The more detail, the more accurate your report." Accept: typed meals, pasted diary, PDF, DOC, screenshots, photos. A real diary contains multiple meals across multiple days with recognizable foods and quantities. A few words, a single meal, or "I eat healthy" is NOT a diary — re-ask politely.

  VALIDATION LAYER: If at Phase 4 the user writes anything that is not an actual food diary, respond: "I still need your weekly food intake before I can complete the assessment — please share what you typically eat across a full week (meals, snacks, drinks). You can type, paste, or upload it." Repeat until a real diary arrives. NEVER produce a report. NEVER call the tool.

  Phase 5 — ASSESSMENT GENERATION (only after a real diary has been received):
    • Silently estimate est_calories / est_protein_g / est_carbs_g / est_fat_g / est_hydration_l plus breakfast_protein_g / lunch_protein_g / dinner_protein_g / snack_protein_g and qualitative flags. ALWAYS pass alcohol_units_per_week, coffee_cups_per_day and daily_walk_minutes from Phase 3. ALWAYS pass meal_observations: 3-5 specific sentences quoting the actual foods/patterns the user wrote (e.g. "Breakfasts were toast, cereal and coffee with little protein."). ALWAYS pass disliked_foods (foods they avoid/dislike/are allergic to) and preferred_foods (foods they clearly enjoy) — extract these from the diary and earlier turns.
    • CALL nutrition_assessment IN THE SAME TURN as your acknowledgement of the diary. No deferrals, no "next message", no "in a moment".
    • In the SAME reply: warm 4–6 sentence verbal summary highlighting the "fastest win", THEN the fenced assessment-report block verbatim so the PDF renders automatically. User must NEVER have to ask for the PDF.
    • ABSOLUTELY FORBIDDEN: announcing a future report without producing it. Phrases like "I will now generate", "I'll create your report", "generating your assessment", "your report is being prepared", "based on this I've estimated…" are BANNED unless you are ALSO calling nutrition_assessment in the very same turn AND emitting the fenced assessment-report block. If you catch yourself about to defer — STOP, call the tool now, emit the block now.

  KEY CALCULATION RULES the tool applies — explain naturally when relevant: (1) BMI > 28 with fat_loss → macros use TARGET weight (estimated at BMI 24 if none given). (2) Protein follows WHO + ISSN ranges: 1.0–1.4 g/kg for regular adults, 1.4–1.8 g/kg for fat loss and recovery, 1.6–2.2 g/kg ONLY for muscle gain / athletes. Executives are NOT bodybuilders — never push 40 g × 4 meals on a regular adult. (3) Per-meal protein is capped at ~40 g (digestion / leucine threshold) across 3 main meals + 1 modest snack. (4) Adults 50+ get a small protein boost; post-menopausal women +0.1 extra. (5) Carbs scale with goal. (6) Hydration = 33 ml/kg target weight. Educational only, never medical.
- recovery_resilience_assessment — Executive Recovery & Resilience Assessment. Lifestyle-only, never medical, never a diagnosis (not medical, not psychological, not a burnout diagnosis). Tone: calm, professional, executive-level, never alarmist. Estimated time: 3–5 minutes. Always announce progress like "Step 1 of 5", "Step 2 of 5"… Drive 5 mandatory phases in order, 2–3 questions per turn:
    Phase 1 — Personal Profile: age, gender, height_cm, weight_kg, occupation, primary_goal (more_energy / better_recovery / reduce_stress / prevent_burnout / improve_performance / improve_longevity).
    Phase 2 — Workload & Stress: work_hours_per_week, focused_work_hours_per_day, meeting_hours_per_day, travel_hours_per_day, works_evenings, works_weekends, pressure_frequency (1–10), responsibility_level (1–10).
    Phase 3 — Recovery: sleep_hours, sleep_quality (1–10), wakes_refreshed (yes/no), exercise_sessions_per_week, exercise_type (resistance / cardio / walking / mixed / none), takes_recovery_days (yes/no), outdoor_hours_per_week.
    Phase 4 — Lifestyle & Resilience: alcohol_units_per_week, caffeine_per_day (cups), water_liters_per_day, social_support (1–10), work_life_balance (1–10), stress_level (1–10), energy_level (1–10), motivation_level (1–10).
    Phase 5 — Optional Nutrition Integration: ask "Would you like to include your nutrition profile? You can (a) upload a previous Isabella Nutrition Report, (b) run the Nutrition Assessment later, or (c) continue without nutrition data." If the user shares nutrition scores, pass them in the nutrition.{protein_score,hydration_score,recovery_score,muscle_preservation_score} fields.
  HARD GATE: never call the tool, never produce scores, never produce a PDF, never emit the assessment-report block until Phases 1–4 are complete. On noisy / accidental / off-topic input ("ok", "yes", "mod", "asdf", fragments) at any phase: gently acknowledge ("Looks like that might have sent early — no problem"), restate the last open question, and wait. Never advance on noise.
  NEVER ask about diseases, medications, diagnoses, or psychiatric history. NEVER use words like "burnout diagnosis", "depression", "anxiety disorder". Burnout is only spoken of as an indicator level (Low / Moderate / Elevated), never a diagnosis.
  After Phases 1–4 (and the optional Phase 5 prompt), call recovery_resilience_assessment. In the SAME reply: give a warm 4–6 sentence executive summary highlighting the top 2–3 fastest wins, then the fenced assessment-report block verbatim so the PDF renders automatically. The user must NEVER have to ask for the PDF. After the block, deliver the closing line about WellneSpirit (no €19 subscription pitch — Recovery is free; the upsell is the Executive Wellness Program at WellneSpirit).

ASSESSMENT FLOW — YOU DRIVE, but NEVER skip the gate:
- Open with one short line folding the disclaimer into your first Phase 1 question.
- Drive each phase with 2–3 questions per turn. Never produce a nutrition report before Phase 4 has delivered an actual food diary. Never produce a recovery report before Phases 1–4 of that assessment are complete.
- After the tool returns, output the fenced block exactly like this:
\`\`\`assessment-report
{ "type": "nutrition_assessment" | "recovery_resilience", "title": "...", "data": <the tool result> }
\`\`\`
Place the human summary BEFORE the fenced block. After the block, tell the user: "You can download the PDF or use the 'Email PDF to me' button below the report to have it sent to your inbox." Do NOT promise to email the report yourself and do NOT call the extract_contact_details tool just to email a report — the Email PDF button handles delivery directly. extract_contact_details is only for genuine business / partnership / collaboration inquiries.
- Never store health details across conversations.

SPEAKING STYLE (you are spoken aloud — write to be heard, not read):
- Spell out units in words: "grams" not "g", "milliliters" not "ml", "liters" not "L", "kilograms" not "kg", "centimeters" not "cm", "kilocalories" or "calories" not "kcal", "per day" not "/day", "percent" not "%".
- Numbers: write small ranges in words ("one to three"), keep larger numbers as digits but no comma separators inside a single number that will be spoken.
- Avoid bullet glyphs, asterisks, slashes, parentheses, em-dashes, and inline code in spoken sentences. Use plain sentences with commas and periods only.
- Keep replies short and conversational. No reading punctuation aloud, no robotic lists when you are about to be voiced.

After any tool call, present results conversationally (1 short paragraph + key bullet figures), then ask one follow-up question.`;

      aiMessages.push({ role: "system", content: isabellaSystemPrompt });

      
      // Add conversation history for context (this is critical!)
      if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        console.log(`📜 Including ${conversationHistory.length} previous messages for context`);
        for (const msg of conversationHistory) {
          if (msg.role && msg.content) {
            aiMessages.push({ role: msg.role, content: msg.content });
          }
        }
      }

      // Build current user message — multimodal if attachments are present.
      const userText = incomingMessage || "Hello";
      if (attachments.length > 0) {
        const contentParts: any[] = [{ type: "text", text: userText }];
        for (const att of attachments) {
          if (att.data_url && /^image\//i.test(att.mime_type || "")) {
            contentParts.push({ type: "image_url", image_url: { url: att.data_url } });
          } else if (att.text && att.text.trim()) {
            const label = att.name ? `[Attached document "${att.name}" — extracted text]` : "[Attached document — extracted text]";
            contentParts.push({ type: "text", text: `${label}\n${att.text.slice(0, 12000)}` });
          }
        }
        aiMessages.push({ role: "user", content: contentParts });
        console.log(`📎 User message includes ${attachments.length} attachment(s)`);
      } else {
        aiMessages.push({ role: "user", content: userText });
      }

      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableKey) {
        clearTimeout(timeoutId);
        console.error("FATAL: LOVABLE_API_KEY is missing; cannot generate response via Lovable AI.");
        return new Response(JSON.stringify({ success: false, message: "Server misconfiguration: LOVABLE_API_KEY not set", data: {} }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Define tools: CRM contact extraction + Video Intelligence Layer
      const tools = [
        {
          type: "function",
          function: {
            name: "extract_contact_details",
            description: "Extract and submit user contact details to CRM when you have collected: name (from any natural format), email (detected via email pattern), inquiry type (inferred from conversation context), and their message/intent. Call this ONLY when you have all four pieces of information extracted from the user's natural conversation.",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string", description: "User's full name" },
                email: { type: "string", description: "User's email address" },
                inquiry_type: { type: "string", enum: ["modeling", "collaboration", "brand", "demo", "general"], description: "Type inferred from conversation" },
                message: { type: "string", description: "User's interest summary" }
              },
              required: ["name", "email", "inquiry_type", "message"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "suggest_videos",
            description: "Suggest portfolio videos when user shows interest in examples, campaigns, projects, content, or asks 'what do you do', 'show me', 'have you worked with brands', etc. Call this to display relevant video examples in the chat. Always ASK PERMISSION before calling — e.g. 'I can show you a few examples — would you like to see something specific, or a quick mix of my recent work?' Only call AFTER user confirms they want to see videos.",
            parameters: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  enum: ["interactive_marketing", "wellness_spa", "real_estate", "ai_ambassador", "studio_intro"],
                  description: "Category to show: 'interactive_marketing' for brand campaigns/luxury/fashion/content, 'wellness_spa' for wellness/spa/health/lifestyle, 'real_estate' for property/architecture, 'ai_ambassador' for AI host/digital human/Isabella capabilities, 'studio_intro' for general portfolio/overview or when unclear"
                },
                count: {
                  type: "number",
                  description: "Number of videos to show (2-3 recommended, max 3)"
                }
              },
              required: ["category"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "calculate_receptionist_cost",
            description: "Compute realistic annual employer cost of a human reception/front-desk role in a European country, and compare it to Isabella's published Ovela tiers. Use when user asks about cost, salary, ROI vs hiring, or what an employee would cost in their country. Numbers are Eurostat-style 2024-2025 ranges.",
            parameters: {
              type: "object",
              properties: {
                country: { type: "string", description: "ISO country code: ES, PT, FR, DE, IT, NL, BE, AD, CH, UK, IE" },
                role: { type: "string", enum: ["receptionist","front_desk_clinic","hotel_concierge","real_estate_junior_filter","customer_support_agent","executive_assistant"] },
                languages: { type: "number", description: "Total languages required (1 = native only). +5% per extra language." },
                shifts: { type: "string", enum: ["business","extended","247"], description: "business ≈ 1× FTE, extended ≈ 1.6×, 247 ≈ 3.2× FTE for full coverage" },
                premium_skills: { type: "boolean", description: "True for medical/legal/CRM specialist vocabulary." }
              },
              required: ["country"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "calculate_missed_leads",
            description: "Compute revenue lost to missed inbound calls/messages (after-hours, busy lines, language barriers) and net benefit vs Isabella's Pro tier. Use when user mentions missed calls, after-hours, lost leads, slow response, or wants to quantify the cost of not capturing inbounds.",
            parameters: {
              type: "object",
              properties: {
                monthly_inbound: { type: "number", description: "Total inbound inquiries per month (calls + forms + DMs)." },
                miss_rate_pct: { type: "number", description: "% currently missed/unanswered (default 35)." },
                conversion_rate_pct: { type: "number", description: "% of captured leads that become customers (default 20)." },
                avg_deal_value_eur: { type: "number", description: "Average customer value in EUR (default 1500)." }
              },
              required: ["monthly_inbound"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "wellness_assessment_suggestion",
            description: "SUGGESTION ONLY — never a diagnosis. When a user describes symptoms (stress, burnout, sleep, pain, hormones, skin), call this to map their words to a likely WellneSpirit therapy pack and a handoff. Always present the disclaimer the tool returns and recommend a full assessment when symptoms are vague or multi-system. Tool's text already includes the WellneSpirit handoff.",
            parameters: {
              type: "object",
              properties: {
                symptoms_text: { type: "string", description: "The user's own description of how they feel / their symptoms." }
              },
              required: ["symptoms_text"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "nutrition_assessment",
            description: "Protein & Nutrition Assessment. Call ONLY after you have gathered the REQUIRED inputs (age, gender, height_cm, weight_kg, activity_level, primary goal, diet_type) AND your own estimates of daily intake from the meal diary the user provided. You produce the estimates by reading the diary. Tool returns an 8-section enriched report (executive summary, muscle preservation, protein strategy, meal framework, metabolic support, resistance training, biological age impact, weekly action plan). Educational only.",
            parameters: {
              type: "object",
              properties: {
                age: { type: "number" },
                gender: { type: "string", enum: ["male","female","other"] },
                height_cm: { type: "number" },
                weight_kg: { type: "number" },
                target_weight_kg: { type: "number", description: "User's desired goal weight in kg. Strongly recommended for fat_loss." },
                waist_cm: { type: "number", description: "Optional but valuable." },
                body_fat_pct: { type: "number", description: "Optional estimated body fat %." },
                activity_level: { type: "string", enum: ["sedentary","moderate","active","athlete"] },
                occupation: { type: "string" },
                goal: { type: "string", enum: ["fat_loss","muscle_gain","performance","healthy_aging","energy","longevity","recovery","muscle_maintenance","maintenance"] },
                diet_type: { type: "string", enum: ["omnivore","vegetarian","vegan"] },
                sleep_hours: { type: "number" },
                alcohol_units_per_week: { type: "number", description: "Glasses of wine / beers / spirits per week. ALWAYS ASK." },
                coffee_cups_per_day: { type: "number", description: "Average cups of coffee/espresso per day. ALWAYS ASK." },
                daily_walk_minutes: { type: "number", description: "Average minutes of daily walking. ALWAYS ASK." },
                strength_sessions_per_week: { type: "number" },
                cardio_sessions_per_week: { type: "number" },
                est_calories: { type: "number" },
                est_protein_g: { type: "number" },
                est_carbs_g: { type: "number" },
                est_fat_g: { type: "number" },
                est_hydration_l: { type: "number" },
                breakfast_protein_g: { type: "number", description: "Estimated protein at breakfast (for distribution score)." },
                lunch_protein_g: { type: "number" },
                dinner_protein_g: { type: "number" },
                snack_protein_g: { type: "number" },
                low_protein_breakfast: { type: "boolean" },
                sugar_snacks: { type: "boolean" },
                low_vegetables: { type: "boolean" },
                high_processed: { type: "boolean" },
                irregular_meals: { type: "boolean" },
                meal_observations: { type: "array", items: { type: "string" }, description: "REQUIRED. 3-5 SPECIFIC sentences quoting patterns from THIS user's diary. Examples: 'Breakfasts were primarily toast, cereal and coffee with minimal protein.' 'Dinner contained roughly 55% of total daily protein.' 'Vegetables appeared only at dinner.' Be concrete — reference foods the user actually mentioned." },
                disliked_foods: { type: "array", items: { type: "string" }, description: "Foods the user dislikes, avoids, or is allergic to (e.g. 'chicken','dairy','eggs','fish'). Used to filter meal suggestions." },
                preferred_foods: { type: "array", items: { type: "string" }, description: "Foods the user clearly enjoys and eats often (used to bias meal examples)." },
                time_budget: { type: "string", enum: ["enjoys_cooking","cooks_when_time","needs_quick_meals","travels_frequently"], description: "ALWAYS ASK before generating. Tailors recommendations to the user's cooking time. Quick-meal and traveller profiles should never receive recipes that require soaking, marinating or long prep." },
                habit_upgrades: { type: "array", description: "REQUIRED. 3-5 specific upgrades anchored to meals the user ALREADY eats. Example: { existing_meal: 'Your yogurt breakfast', upgrade: 'Add one scoop of whey for +25 g protein', why: 'Closes ~40% of the daily protein gap without changing routine' }. Never suggest a meal the user did not mention.", items: { type: "object", properties: { existing_meal: { type: "string" }, upgrade: { type: "string" }, why: { type: "string" } }, required: ["existing_meal","upgrade","why"] } },
                nutrition_risk_flags: { type: "array", description: "Optional. Observational micronutrient flags inferred from the diary (NOT diagnoses). Allowed nutrients: Fibre, Omega-3, Magnesium, Potassium, Vitamin D, Vitamin B12, Iron, Vegetable diversity.", items: { type: "object", properties: { nutrient: { type: "string" }, confidence: { type: "string", enum: ["low","moderate","high"] }, reasoning: { type: "string" } }, required: ["nutrient","confidence"] } },
                oily_fish_per_week: { type: "number", description: "Servings of oily fish (salmon, mackerel, sardines, trout) per week — used for omega-3 inference." },
                vegetable_servings_per_day: { type: "number", description: "Average vegetable servings per day from the diary." }
              },
              required: ["weight_kg","age","gender","height_cm","activity_level","goal","diet_type"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "recovery_resilience_assessment",
            description: "Executive Recovery & Resilience Assessment. Lifestyle-only, never medical, never a diagnosis. Call ONLY after Phases 1–4 (personal profile, workload & stress, recovery, lifestyle & resilience) have been completed conversationally. Returns recovery_capacity, stress_load, resilience, lifestyle_recovery, burnout_risk (Low/Moderate/Elevated), executive_wellness scores, an executive summary, top 3 fastest wins, and a 7-day recovery plan.",
            parameters: {
              type: "object",
              properties: {
                age: { type: "number" },
                gender: { type: "string", enum: ["male","female","other"] },
                height_cm: { type: "number" },
                weight_kg: { type: "number" },
                occupation: { type: "string" },
                primary_goal: { type: "string", enum: ["more_energy","better_recovery","reduce_stress","prevent_burnout","improve_performance","improve_longevity"] },

                work_hours_per_week: { type: "number" },
                focused_work_hours_per_day: { type: "number" },
                meeting_hours_per_day: { type: "number" },
                travel_hours_per_day: { type: "number" },
                works_evenings: { type: "boolean" },
                works_weekends: { type: "boolean" },
                pressure_frequency: { type: "number", description: "1–10" },
                responsibility_level: { type: "number", description: "1–10" },

                sleep_hours: { type: "number" },
                sleep_quality: { type: "number", description: "1–10" },
                wakes_refreshed: { type: "boolean" },
                exercise_sessions_per_week: { type: "number" },
                exercise_type: { type: "string", enum: ["resistance","cardio","walking","mixed","none"] },
                takes_recovery_days: { type: "boolean" },
                outdoor_hours_per_week: { type: "number" },

                alcohol_units_per_week: { type: "number" },
                caffeine_per_day: { type: "number" },
                water_liters_per_day: { type: "number" },
                social_support: { type: "number", description: "1–10" },
                work_life_balance: { type: "number", description: "1–10" },
                stress_level: { type: "number", description: "1–10" },
                energy_level: { type: "number", description: "1–10" },
                motivation_level: { type: "number", description: "1–10" },

                nutrition: {
                  type: "object",
                  description: "Optional. Passed only if the user shared a previous Isabella Nutrition Report.",
                  properties: {
                    protein_score: { type: "number" },
                    hydration_score: { type: "number" },
                    recovery_score: { type: "number" },
                    muscle_preservation_score: { type: "number" }
                  }
                }
              },
              required: ["age"]
            }
          }
        }
      ];

      console.log("Calling Lovable AI with model google/gemini-2.5-flash");
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: aiMessages,
          tools,
          tool_choice: "auto",
          stream: false
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      console.log("Lovable AI response status:", aiRes.status);
      
      if (!aiRes.ok) {
        const errorText = await aiRes.text();
        console.error("Lovable AI error:", aiRes.status, errorText);
        
        if (aiRes.status === 429) {
          return new Response(JSON.stringify({ success: false, message: "Rate limits exceeded, please try again later.", data: {} }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        if (aiRes.status === 402) {
          return new Response(JSON.stringify({ success: false, message: "Payment required, please add credits to Lovable AI.", data: {} }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        return new Response(JSON.stringify({ success: false, message: `AI gateway error: ${errorText}`, data: {} }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const aiBody = await aiRes.json();
      console.log("Lovable AI response body:", JSON.stringify(aiBody).substring(0, 200));
      
      // Check if AI wants to use tools
      const toolCalls = aiBody?.choices?.[0]?.message?.tool_calls;
      let finalMessage = aiBody?.choices?.[0]?.message?.content || extractAssistantText(aiBody) || "";
      let crmSubmitted = false;
      let videoSuggestion: { category: string; count: number } | null = null;

      let nutritionReportPayload: any = null;
      let bioAgeReportPayload: any = null;
      let assessmentReportResponse: any = null;

      // 🛟 REPORT DELIVERY GUARD — if the model promised or referenced a completed
      // report but didn't call the tool, force a second pass with tool_choice so the
      // user never sees “download/email buttons” without an actual report object.
      let effectiveToolCalls = toolCalls;
      const noToolCall = !effectiveToolCalls || effectiveToolCalls.length === 0;
      if (noToolCall && finalMessage) {
        const DEFER_RE = /(generate|generating|create|creating|prepare|preparing|produce|producing|build|building|compile|compiling|deliver|delivering|complete|completing|finalize|finalizing|ready to (generate|create|complete|deliver|produce)|have (all|everything) (i|we)?\s*need(ed)?|will (now )?(generate|create|prepare|deliver|produce|build|complete))/i;
        const REPORT_RE = /(report|assessment|pdf|action plan|score|download|email pdf)/i;
        const FALSE_DELIVERY_RE = /(here is your (full )?(assessment )?report|your full assessment report|you can download the pdf|email pdf to me|button below|below the report|estimated your current nutrition profile|based on what you('ve| have) shared,? i('ve| have) estimated)/i;
        const isNutrition = /(nutrition|protein|muscle preservation|food|diet|meal)/i.test(finalMessage);
        const isRecovery = /(recovery|resilience|burnout|stress)/i.test(finalMessage);
        const looksDeferred = (DEFER_RE.test(finalMessage) && REPORT_RE.test(finalMessage)) || FALSE_DELIVERY_RE.test(finalMessage);
        const forceTool = looksDeferred ? (isNutrition ? 'nutrition_assessment' : (isRecovery ? 'recovery_resilience_assessment' : null)) : null;

        if (forceTool) {
          console.warn(`🚨 Deferral detected — forcing ${forceTool}. Msg:`, finalMessage.substring(0, 140));
          try {
            const forced = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: { "Authorization": `Bearer ${lovableKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                  ...aiMessages,
                  { role: "assistant", content: finalMessage },
                  { role: "system", content: `You just told the user a report exists or can be downloaded/emailed but DID NOT call the ${forceTool} tool. Call ${forceTool} NOW with your best estimates from the entire conversation. Emit only the tool call. If essential inputs are truly missing, still emit the tool call with the best available fields so the server-side gate can decide what is missing.` }
                ],
                tools,
                tool_choice: { type: "function", function: { name: forceTool } },
                stream: false
              })
            });
            if (forced.ok) {
              const forcedBody = await forced.json();
              const forcedCalls = forcedBody?.choices?.[0]?.message?.tool_calls;
              if (forcedCalls && forcedCalls.length > 0) {
                aiBody.choices[0].message.tool_calls = forcedCalls;
                effectiveToolCalls = forcedCalls;
                finalMessage = "";
                console.log(`✅ Forced ${forceTool} succeeded`);
              } else {
                console.warn("⚠️ Forced retry returned no tool calls");
              }
            }
          } catch (e) {
            console.error("🚨 Deferral retry failed:", e);
          }
        }
      }


      // Trial state for this request (populated by nutrition tool branch)
      let trialDaysUsed: number | null = null;
      let trialForceFinalMessage: string | null = null;

      if (effectiveToolCalls && effectiveToolCalls.length > 0) {
        const toolCalls = effectiveToolCalls;
        const toolResults: any[] = [];


        for (const toolCall of toolCalls) {
          if (toolCall.function?.name === 'extract_contact_details') {
            try {
              const contactDetails = JSON.parse(toolCall.function.arguments);
              console.log('📋 Contact details extracted by Isabella:', contactDetails);
              
              submitLeadToCRM({
                name: contactDetails.name,
                email: contactDetails.email,
                inquiry_type: contactDetails.inquiry_type,
                message: contactDetails.message,
                source: 'isabella-chat'
              }).then(success => {
                console.log(success ? '✅ Lead submitted to CRM successfully' : '⚠️ CRM submission failed');
              }).catch(err => {
                console.error('❌ Async CRM submission error:', err);
              });

              crmSubmitted = true;
              toolResults.push({ id: toolCall.id, content: JSON.stringify({ success: true, message: "Lead submitted successfully" }) });
            } catch (parseError) {
              console.error('❌ Error parsing tool call arguments:', parseError);
              toolResults.push({ id: toolCall.id, content: JSON.stringify({ success: false, message: "Parse error" }) });
            }
          } else if (toolCall.function?.name === 'suggest_videos') {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              videoSuggestion = { category: args.category || 'studio_intro', count: Math.min(args.count || 3, 3) };
              console.log('🎬 Video suggestion requested:', videoSuggestion);
              toolResults.push({ id: toolCall.id, content: JSON.stringify({ success: true, message: `Showing ${videoSuggestion.count} videos from ${videoSuggestion.category}` }) });
            } catch (parseError) {
              console.error('❌ Error parsing suggest_videos arguments:', parseError);
              toolResults.push({ id: toolCall.id, content: JSON.stringify({ success: false, message: "Parse error" }) });
            }
          } else if (toolCall.function?.name === 'calculate_receptionist_cost') {
            try {
              const args = JSON.parse(toolCall.function.arguments || "{}");
              const result = calcReceptionistCost(args);
              console.log('💰 Receptionist cost calc:', { country: result.country, role: result.role });
              toolResults.push({ id: toolCall.id, content: JSON.stringify(result) });
            } catch (e) {
              toolResults.push({ id: toolCall.id, content: JSON.stringify({ error: String(e) }) });
            }
          } else if (toolCall.function?.name === 'calculate_missed_leads') {
            try {
              const args = JSON.parse(toolCall.function.arguments || "{}");
              const result = calcMissedLeads(args);
              console.log('📉 Missed leads calc:', { monthly_inbound: result.inputs.monthly_inbound });
              toolResults.push({ id: toolCall.id, content: JSON.stringify(result) });
            } catch (e) {
              toolResults.push({ id: toolCall.id, content: JSON.stringify({ error: String(e) }) });
            }
          } else if (toolCall.function?.name === 'wellness_assessment_suggestion') {
            try {
              const args = JSON.parse(toolCall.function.arguments || "{}");
              const result = wellnessAssessmentSuggestion(args);
              console.log('🌿 Wellness suggestion:', { tags: result.matched_tags });
              toolResults.push({ id: toolCall.id, content: JSON.stringify(result) });
            } catch (e) {
              toolResults.push({ id: toolCall.id, content: JSON.stringify({ error: String(e) }) });
            }
          } else if (toolCall.function?.name === 'nutrition_assessment') {
            try {
              const args = JSON.parse(toolCall.function.arguments || "{}");
              const FOOD_KEYWORDS = /\b(breakfast|lunch|dinner|snack|brunch|supper|meal|eggs?|chicken|beef|fish|salmon|tuna|rice|pasta|bread|toast|oat|yog(h)?urt|cheese|salad|veg|fruit|banana|apple|coffee|tea|milk|protein|shake|wine|beer|water|almond|nuts?|potato|tomato|avocado|sandwich|soup|steak|pork|turkey|tofu|beans?|lentils?|quinoa|cereal|smoothie|monday|tuesday|wednesday|thursday|friday|saturday|sunday|petit[- ]?d[ée]jeuner|d[ée]jeuner|d[íi]ner|desayuno|comida|cena|frühstück|mittag|abendessen|colazione|pranzo|cena)\b/i;
              const collectFoodText = () => {
                const parts: string[] = [];
                if (incomingMessage) parts.push(incomingMessage);
                for (const att of attachments) {
                  if (att.text) parts.push(att.text);
                  if (att.data_url && /^image\//i.test(att.mime_type || "")) parts.push("[image_attachment]");
                }
                for (const m of conversationHistory) {
                  if (m?.role === 'user' && typeof m.content === 'string') parts.push(m.content);
                }
                return parts.join("\n");
              };
              const corpus = collectFoodText();
              const normalizedArgs = normalizeNutritionArgs(args, corpus);
              const missingCore = missingCoreNutritionFields(normalizedArgs);
              if (!hasUsableNutritionArgs(normalizedArgs)) {
                console.warn('🛑 Nutrition tool blocked — incomplete core inputs', { missing: missingCore, keys: Object.keys(args || {}) });
                toolResults.push({
                  id: toolCall.id,
                  content: JSON.stringify({
                    blocked: true,
                    reason: "NUTRITION_INPUTS_INCOMPLETE",
                    missing: missingCore,
                    instruction: `Do NOT generate a report, PDF, score, or assessment-report block. Ask only for these missing core details: ${missingCore.join(", ")}. Then wait.`
                  })
                });
                continue;
              }

              // HARD GATE: verify a real weekly food diary exists in the conversation history
              // or in the current message / attachments before allowing the assessment to run.
              const matches = corpus.match(new RegExp(FOOD_KEYWORDS, 'gi')) || [];
              const hasImageAttachment = attachments.some(a => /^image\//i.test(a.mime_type || ""));
              const hasDocAttachment = attachments.some(a => a.text && a.text.length > 200);
              const looksLikeDiary = matches.length >= 6 || hasImageAttachment || hasDocAttachment || corpus.length > 600;

              if (!looksLikeDiary) {
                console.warn('🛑 Nutrition tool blocked — no weekly food diary detected', { matches: matches.length, corpusLen: corpus.length });
                nutritionReportPayload = null;
                toolResults.push({
                  id: toolCall.id,
                  content: JSON.stringify({
                    blocked: true,
                    reason: "FOOD_INTAKE_NOT_RECEIVED",
                    instruction: "Do NOT generate a report, PDF, score, or assessment-report block. The user has not yet provided their weekly food intake. Reply with ONLY a warm reminder: 'I still need your weekly food intake before I can complete the assessment — please share what you typically eat across a full week (breakfast, lunch, dinner, snacks, drinks). You can type, paste, upload a PDF or screenshot, or send a photo of your meals.' Then wait. Do not advance the protocol."
                  })
                });
              } else {
                // 7-day free trial gate (Ovela / WellneSpirit free version)
                const trialKey = `${clientId || 'ovela'}::${userId || 'guest'}`;
                const trial = await checkAndRecordTrial(trialKey);
                if (trial.trial_expired) {
                  console.warn('⏳ Trial expired — blocking PDF, sending WellneSpirit upsell', { trialKey, daysUsed: trial.days_used });
                  nutritionReportPayload = null;
                  toolResults.push({
                    id: toolCall.id,
                    content: JSON.stringify({
                      blocked: true,
                      reason: "TRIAL_EXPIRED",
                      days_used: trial.days_used,
                      instruction: "Do NOT generate a report, PDF, score, or assessment-report block. The user's 7-day free assessment window has ended. Reply with ONLY this message verbatim: " + JSON.stringify(WELLNESPIRIT_EXPIRED_MESSAGE)
                    })
                  });
                  // Pre-fill the final message in case the model ignores the instruction
                  trialForceFinalMessage = WELLNESPIRIT_EXPIRED_MESSAGE;
                } else {
                  const result = nutritionAssessment(normalizedArgs);
                  nutritionReportPayload = result;
                  console.log('🥗 Nutrition assessment:', { overall: result.scores.overall_nutrition, daysUsed: trial.days_used });
                  toolResults.push({ id: toolCall.id, content: JSON.stringify(result) });
                  trialDaysUsed = trial.days_used;
                }
              }
            } catch (e) {
              toolResults.push({ id: toolCall.id, content: JSON.stringify({ error: String(e) }) });
            }
          } else if (toolCall.function?.name === 'recovery_resilience_assessment' || toolCall.function?.name === 'biological_age_assessment') {
            try {
              const args = JSON.parse(toolCall.function.arguments || "{}");
              // Backward-compat: legacy callers may still send chronological_age
              if (args.chronological_age && !args.age) args.age = args.chronological_age;
              if (!hasUsableRecoveryArgs(args)) {
                console.warn('🛑 Recovery tool blocked — incomplete usable inputs', { keys: Object.keys(args || {}) });
                toolResults.push({
                  id: toolCall.id,
                  content: JSON.stringify({
                    blocked: true,
                    reason: "RECOVERY_INPUTS_INCOMPLETE",
                    instruction: "Do NOT generate a report, PDF, score, or assessment-report block. Required recovery assessment details are missing. Ask the next missing phase questions and wait."
                  })
                });
                continue;
              }
              const result = recoveryResilienceAssessment(args);
              bioAgeReportPayload = result;
              console.log('🛡️ Recovery & Resilience assessment:', { exec: result.scores.executive_wellness, burnout: result.scores.burnout_risk });
              toolResults.push({ id: toolCall.id, content: JSON.stringify(result) });
            } catch (e) {
              toolResults.push({ id: toolCall.id, content: JSON.stringify({ error: String(e) }) });
            }
          }
        }

        // Follow-up call to get natural text response after tool calls
        if (!finalMessage) {
          try {
            const followUpMessages = [...aiMessages, aiBody.choices[0].message];
            for (const tr of toolResults) {
              followUpMessages.push({ role: "tool", tool_call_id: tr.id, content: tr.content });
            }
            if (nutritionReportPayload || bioAgeReportPayload) {
              const reportType = nutritionReportPayload ? 'nutrition_assessment' : 'recovery_resilience';
              followUpMessages.push({
                role: "system",
                content: `The ${reportType} tool just returned. You MUST now reply in ONE message containing BOTH: (1) a short warm conversational summary (3–6 sentences) of the key findings and top 2–3 recommendations, then (2) on a new line the EXACT fenced block below so the page can render the PDF download and email buttons. Do NOT ask the user if they want a report — just deliver it. Do NOT ask for confirmation to continue.\n\n\`\`\`assessment-report\n{"type":"${reportType}","title":"...","data": <the full tool result JSON verbatim>}\n\`\`\`\n\nAfter the block, add exactly this line: You can download the PDF or use the Email PDF to me button below the report to send it to your inbox.`
              });
            }

            const followUpRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${lovableKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: followUpMessages,
                stream: false
              })
            });

            if (followUpRes.ok) {
              const followUpBody = await followUpRes.json();
              finalMessage = followUpBody?.choices?.[0]?.message?.content || "";
              console.log("📋 Follow-up response after tool call:", finalMessage.substring(0, 80));
            }
          } catch (followUpErr) {
            console.error("⚠️ Follow-up call failed:", followUpErr);
          }

          if (!finalMessage) {
            if (crmSubmitted) {
              finalMessage = "Thank you! I've shared your details with my team — they'll reach out shortly. Is there anything else I can help you with?";
            } else if (videoSuggestion) {
              finalMessage = "Here are some examples of my recent work — take a look!";
            }
          }

        }

        // Guarantee the report is returned as structured data and, when needed,
        // as a valid fenced block regardless of whether the model already wrote text.
        if (nutritionReportPayload || bioAgeReportPayload) {
          const payload = nutritionReportPayload
            ? { type: 'nutrition_assessment', title: 'Executive Nutrition & Muscle Preservation Assessment', data: nutritionReportPayload }
            : { type: 'recovery_resilience', title: 'Executive Recovery & Resilience Assessment', data: bioAgeReportPayload };
          assessmentReportResponse = payload;
          const reportBlockRe = /`{2,3}\s*assessment-report\s*([\s\S]*?)`{2,3}/i;
          const existingReportBlock = finalMessage.match(reportBlockRe);
          let hasValidBlock = false;
          if (existingReportBlock) {
            hasValidBlock = isMeaningfulReportPayload(parseAssessmentReportBlock(finalMessage));
          }
          if (!hasValidBlock) {
            const cleaned = finalMessage.replace(reportBlockRe, '').trim();
            const summary = cleaned.length > 0
              ? cleaned
              : "Here's your personalized assessment — I've outlined your scores, the biggest improvement opportunities, and a weekly action plan.";
            finalMessage = `${summary}\n\n\`\`\`assessment-report\n${JSON.stringify(payload)}\n\`\`\`\n\nYou can download the PDF or use the Email PDF to me button below the report to send it to your inbox.`;
            console.log("🧷 Injected valid assessment-report block for", payload.type);
          }
        }

        if (!assessmentReportResponse && /`{2,3}\s*assessment-report/i.test(finalMessage)) {
          const reportBlockRe = /`{2,3}\s*assessment-report\s*([\s\S]*?)`{2,3}/i;
          const cleaned = finalMessage.replace(reportBlockRe, '').trim();
          finalMessage = cleaned || "I still need the missing assessment details before I can create a complete PDF report.";
          console.warn("🧹 Removed assessment-report block that was not backed by a completed tool result");
        }
      }
      
      if (!assessmentReportResponse && /(here is your (full )?(assessment )?report|your full assessment report|you can download the pdf|email pdf to me|button below|below the report)/i.test(finalMessage)) {
        finalMessage = finalMessage
          .replace(/\n?\s*Here is your full assessment report:\s*/i, '')
          .replace(/\n?\s*You can download the PDF or use the ['"]?Email PDF to me['"]? button below the report to have it sent to your inbox\.*/i, '')
          .trim();
        if (!finalMessage || /download|email pdf|button below/i.test(finalMessage)) {
          finalMessage = "I have your food diary, but I still need to complete the calculation before I can show the PDF controls. Please send one short message saying 'complete my assessment' and I will generate the report directly.";
        }
        console.warn("🛡️ Removed report/download wording because no structured assessment payload was produced");
      }

      console.log("💬 ovela-chat generated reply (Lovable)", { length: finalMessage.length, preview: finalMessage.substring(0, 50), hasVideos: !!videoSuggestion });
      console.log("✅ Isabella (Ovela) ready – brand personality active", { clientId, guideSource, brandTemplateId: clientId, crmSubmitted });
      
      if (!finalMessage) {
        console.error("No assistant text extracted from response");
        return new Response(JSON.stringify({ success: false, message: "No response generated", data: {} }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: finalMessage, 
        data: { 
          crm_submitted: crmSubmitted,
          ...(assessmentReportResponse ? { assessment_report: assessmentReportResponse } : {}),
          ...(videoSuggestion ? { video_suggestion: videoSuggestion } : {})
        } 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("ovela-chat generation error (Lovable)", { err: String(err), stack: err instanceof Error ? err.stack : undefined });
      return new Response(JSON.stringify({ success: false, message: `Generation error: ${err instanceof Error ? err.message : String(err)}`, data: {} }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  } catch (err) {
    console.error("ovela-chat top-level error", { err: String(err) });
    return new Response(JSON.stringify({ success: false, message: err instanceof Error ? err.message : String(err), data: {} }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
