// ovela-chat index.ts - defensive, single-source of truth
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const supabaseKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
    
    console.log('📋 Submitting lead to CRM:', { email: leadData.email, inquiry_type: leadData.inquiry_type });
    
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
    const language = body?.language || "en-US";
    
    // Map language code to language name for AI instruction
    const languageNames: Record<string, string> = {
      'en-US': 'English',
      'fr-FR': 'French',
      'es-ES': 'Spanish',
      'de-DE': 'German',
      'pl-PL': 'Polish',
      'it-IT': 'Italian',
      'pt-PT': 'Portuguese'
    };
    const responseLang = languageNames[language] || 'English';

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
      
      // Isabella's full Ovela Interactive brand ambassador persona with context awareness
      const isabellaSystemPrompt = `You are Isabella, the official Ovela Interactive AI ambassador.

CRITICAL CONTEXT RULES:
- You ALWAYS remember our entire conversation - never re-introduce yourself after the first greeting
- If user already told you their name, USE IT and don't ask again
- If you already introduced yourself, continue the conversation naturally without saying "I'm Isabella" again
- Stay in the flow: follow up on what the user said, don't restart the conversation
- If you asked for email and user responds, acknowledge it and continue the lead capture process
- If something is unclear, ask for clarification instead of starting over

PERSONALITY & STYLE:
- Speak with warmth, confidence, and enthusiasm — personal, emotionally intelligent tone
- Use a mix of storytelling, humor, and empathy
- Keep replies short, friendly, and dynamic — like a digital brand spokesperson
- IMPORTANT: You MUST respond in ${responseLang}. All your replies should be in ${responseLang}.
- Never mention OpenAI, API keys, Lovable AI, or developer systems — stay in character

OVELA KNOWLEDGE:
- You represent Ovela Interactive platform: creative digital experiences, branding, wellness tech, human-AI collaboration
- You can discuss Ovela features, upcoming projects, the 24-hour date promo with WellnessGeni
- Explain how users can participate or benefit from Ovela services

LEAD CAPTURE FLOW (follow this sequence):
1. When user shows interest in collaboration/partnership/modeling/demo/contact:
2. If you don't have their name yet → ask naturally: "What's your name?"
3. Once you have name → ask for email: "And what's the best email to reach you?"
4. Infer inquiry_type from their interest (collaboration, modeling, brand, demo, general)
5. When you have name + email + inquiry type → USE THE TOOL to submit
6. After submission → confirm: "Perfect! I've shared your details with my team. They'll reach out shortly."

${effectiveGuide ? `\nBRAND CONTEXT:\n${effectiveGuide}` : ""}`;
      
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
      
      // Add current user message
      aiMessages.push({ role: "user", content: incomingMessage || "Hello" });

      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableKey) {
        clearTimeout(timeoutId);
        console.error("FATAL: LOVABLE_API_KEY is missing; cannot generate response via Lovable AI.");
        return new Response(JSON.stringify({ success: false, message: "Server misconfiguration: LOVABLE_API_KEY not set", data: {} }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Define CRM tool for intelligent natural language contact extraction
      const tools = [
        {
          type: "function",
          function: {
            name: "extract_contact_details",
            description: "Extract and submit user contact details to CRM when you have collected: name (from any natural format), email (detected via email pattern), inquiry type (inferred from conversation context), and their message/intent. Call this ONLY when you have all four pieces of information extracted from the user's natural conversation.",
            parameters: {
              type: "object",
              properties: {
                name: { 
                  type: "string", 
                  description: "User's full name extracted from natural language - works with 'Robert', 'I'm Robert', 'My name is Robert', 'Robert here', etc." 
                },
                email: { 
                  type: "string", 
                  description: "User's email address extracted from any format - 'email@domain.com', 'Email: email@domain.com', 'my email is email@domain.com', etc." 
                },
                inquiry_type: { 
                  type: "string", 
                  enum: ["modeling", "collaboration", "brand", "demo", "general"],
                  description: "Type inferred from conversation context: 'collaboration' for partnerships/working together, 'modeling' for model applications, 'brand' for brand deals/sponsorships, 'demo' for product demos, 'general' for other inquiries" 
                },
                message: { 
                  type: "string", 
                  description: "User's message, interest summary, or what they want to discuss - extracted from their conversational input about their goals/needs" 
                }
              },
              required: ["name", "email", "inquiry_type", "message"]
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
      
      // Check if AI wants to extract contact details via tool call
      const toolCalls = aiBody?.choices?.[0]?.message?.tool_calls;
      let finalMessage = aiBody?.choices?.[0]?.message?.content || extractAssistantText(aiBody) || "";
      let crmSubmitted = false;

      if (toolCalls && toolCalls.length > 0) {
        for (const toolCall of toolCalls) {
          if (toolCall.function?.name === 'extract_contact_details') {
            try {
              const contactDetails = JSON.parse(toolCall.function.arguments);
              console.log('📋 Contact details extracted by Isabella:', contactDetails);
              
              // Submit to CRM asynchronously (don't block the response)
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

              // Override message with success confirmation
              finalMessage = "Perfect — I've shared your details with my team. They'll reach out shortly to plan your collaboration.";
              crmSubmitted = true;
            } catch (parseError) {
              console.error('❌ Error parsing tool call arguments:', parseError);
            }
          }
        }
      }
      
      console.log("💬 ovela-chat generated reply (Lovable)", { length: finalMessage.length, preview: finalMessage.substring(0, 50) });
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
        data: { crm_submitted: crmSubmitted } 
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
