// ovela-chat index.ts - defensive, single-source of truth
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { calcReceptionistCost, calcMissedLeads, wellnessAssessmentSuggestion, nutritionAssessment, biologicalAgeAssessment } from "./_tools.ts";

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
- nutrition_assessment — Protein & Nutrition Assessment. You are the analyst. Read the user's meal diary (typed, pasted, or extracted from attachments) and ESTIMATE daily averages: calories, protein_g, carbs_g, fat_g, hydration_l. Note qualitative flags (low_protein_breakfast, sugar_snacks, low_vegetables, high_processed, irregular_meals). REQUIRED before tool: weight_kg, activity_level, goal. Ask for these first if missing. After tool returns, present results conversationally — show scores, the 3 priorities, and the 7-day plan. End by offering: "Would you like me to package this as a downloadable PDF report?"
- biological_age_assessment — Lifestyle-only, never medical. Ask for: chronological_age, gender, height_cm, weight_kg, waist_cm, sleep_hours, exercise_sessions_per_week, stress_level (1–10), alcohol_units_per_week, smoking (never/former/current), energy_level (1–10), recovery_speed (1–10), digestive_health (1–10). Do NOT ask about diseases, medications, or diagnoses. Ask 2–3 questions at a time, conversationally. When you have enough, call the tool. Then present the biological age estimate, score breakdown, top 3 contributors, and the 6/12 month projections. End by offering the PDF.

ASSESSMENT FLOW (nutrition + biological age):
- Open with the GDPR-style disclaimer ONCE at start of an assessment: "Before we begin — this assessment is educational and informational only. It is not a medical diagnosis and should not replace consultation with a qualified healthcare professional. Continue?"
- Ask questions in small batches (1–3 at a time), never as a form. Sound like a wellness consultant, not a calculator.
- For nutrition: offer the four input options upfront — "You can type your week, paste a diary, upload a PDF/screenshot, or describe it to me. What works best?"
- If an attachment is present, acknowledge it ("I've read your meal log — quick clarifications…") and extract the estimates yourself before calling the tool.
- After the tool returns, output the structured report inside a fenced block exactly like this so the page can offer a PDF download:
\`\`\`assessment-report
{ "type": "nutrition_assessment" | "biological_age", "title": "...", "data": <the tool result> }
\`\`\`
Place a 2–3 sentence human summary BEFORE the fenced block. After the block, ask if they want it emailed.
- Never store or remember health details across conversations. If the user starts a new chat, the previous assessment is gone.

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
            description: "Protein & Nutrition Assessment. Call ONLY after you have weight_kg, activity_level, goal AND your own estimates of daily intake from the meal diary the user provided (typed, pasted, or extracted from an attachment). You produce the estimates by reading the diary; the tool returns targets, gaps, scores, priorities, and a 7-day plan. Educational only.",
            parameters: {
              type: "object",
              properties: {
                age: { type: "number" },
                gender: { type: "string", enum: ["male","female","other"] },
                height_cm: { type: "number" },
                weight_kg: { type: "number" },
                activity_level: { type: "string", enum: ["sedentary","moderate","active","athlete"] },
                goal: { type: "string", enum: ["fat_loss","energy","performance","muscle_maintenance","healthy_aging","longevity"] },
                est_calories: { type: "number", description: "Your estimated daily calories from the diary." },
                est_protein_g: { type: "number" },
                est_carbs_g: { type: "number" },
                est_fat_g: { type: "number" },
                est_hydration_l: { type: "number" },
                low_protein_breakfast: { type: "boolean" },
                sugar_snacks: { type: "boolean" },
                low_vegetables: { type: "boolean" },
                high_processed: { type: "boolean" },
                irregular_meals: { type: "boolean" }
              },
              required: ["weight_kg"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "biological_age_assessment",
            description: "Lifestyle-only biological age estimate. Educational, never medical. NEVER ask about diseases, diagnoses, or prescription medications. Call after collecting the lifestyle inputs conversationally (2–3 questions at a time).",
            parameters: {
              type: "object",
              properties: {
                chronological_age: { type: "number" },
                gender: { type: "string", enum: ["male","female","other"] },
                height_cm: { type: "number" },
                weight_kg: { type: "number" },
                waist_cm: { type: "number" },
                sleep_hours: { type: "number" },
                exercise_sessions_per_week: { type: "number" },
                stress_level: { type: "number", description: "1–10" },
                alcohol_units_per_week: { type: "number" },
                smoking: { type: "string", enum: ["never","former","current"] },
                energy_level: { type: "number", description: "1–10" },
                recovery_speed: { type: "number", description: "1–10" },
                digestive_health: { type: "number", description: "1–10" }
              },
              required: ["chronological_age"]
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

      if (toolCalls && toolCalls.length > 0) {
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
              const result = nutritionAssessment(args);
              console.log('🥗 Nutrition assessment:', { overall: result.scores.overall_nutrition });
              toolResults.push({ id: toolCall.id, content: JSON.stringify(result) });
            } catch (e) {
              toolResults.push({ id: toolCall.id, content: JSON.stringify({ error: String(e) }) });
            }
          } else if (toolCall.function?.name === 'biological_age_assessment') {
            try {
              const args = JSON.parse(toolCall.function.arguments || "{}");
              const result = biologicalAgeAssessment(args);
              console.log('⏳ Bio-age assessment:', { delta: result.difference_years });
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
