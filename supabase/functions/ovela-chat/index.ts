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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Read env vars
    const rawBase = Deno.env.get("WELLNESS_GENI_API_URL");
    const proxiedUrl = isValidUrl(rawBase) ? rawBase!.trim() : null;
    const ovelaApiKey = Deno.env.get("WELLNESS_GENI_API_KEY"); // wg_... client key
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const ovelaGuide = Deno.env.get("OVELA_GUIDE"); // Ovela Interactive brand guide

    if (!ovelaApiKey) {
      // still allow local OpenAI route if openaiKey exists, but log actionable message
      console.warn("WELLNESS_GENI_API_KEY not set. Proxy mode disabled.");
    }

    const body = await req.json().catch(() => ({}));
    const incomingMessage = (body?.prompt ?? body?.message ?? "").toString();
    const persona = body?.persona ?? "isabella-navia";
    const brandGuideIn = body?.brand_guide;
    const userId = body?.user_id ?? body?.userId ?? "ovela-guest";
    const clientId = body?.client_id ?? "ovela_client_001";

    // Fetch brand guide from WellnessGeni admin if available
    let fetchedGuide: string | undefined = undefined;
    if (proxiedUrl && ovelaApiKey) {
      try {
        console.log("Fetching brand guide from WellnessGeni admin for client:", clientId);
        const guideResponse = await fetch(`${proxiedUrl}/brand-guide`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${ovelaApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "getBrandGuide",
            payload: { client_id: clientId }
          })
        });
        
        if (guideResponse.ok) {
          const guideData = await guideResponse.json();
          fetchedGuide = guideData?.data?.guide_content || guideData?.guide_content;
          console.log("Brand guide fetched successfully from WellnessGeni admin");
        } else {
          console.warn("Failed to fetch brand guide from admin, will use fallback");
        }
      } catch (err) {
        console.error("Error fetching brand guide from admin:", err);
      }
    }

    const effectiveGuide = brandGuideIn ?? fetchedGuide ?? ovelaGuide ?? undefined;
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

    console.log("ovela-chat request summary", {
      incomingMessage: incomingMessage ? "[RECEIVED]" : "[empty]",
      persona,
      clientId,
      usedGuide: !!payload.brand_guide,
      proxiedUrl: !!proxiedUrl ? "[external]" : "[none]"
    });

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
        return new Response(JSON.stringify({ success: true, message: assistantText, data: {} }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        clearTimeout(timeoutId);
        console.error("ovela-chat proxy fetch error", { err: String(err), proxiedUrl });
        return new Response(JSON.stringify({ success: false, message: `Network error: ${err?.message ?? String(err)}`, data: {} }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // FALLBACK: No valid external WellnessGeni endpoint — use Lovable AI Gateway (Gemini) for local generation
    try {
      const messages: any[] = [];
      
      // Isabella's full Ovela Interactive brand ambassador persona
      const isabellaSystemPrompt = `You are Isabella, the official Ovela Interactive AI ambassador.
- You represent the Ovela Interactive platform, focusing on creative digital experiences, branding, wellness tech, and human-AI collaboration.
- You speak with warmth, confidence, and enthusiasm — always in a personal, emotionally intelligent tone.
- You use a mix of storytelling, humor, and empathy.
- You can discuss Ovela features, upcoming projects, the 24-hour date promo with WellnessGeni, and explain how users can participate or benefit.
- You never mention OpenAI, API keys, Lovable AI, or developer systems — stay in character as Isabella.
- You can send messages, initiate calls, and guide users visually with enthusiasm and charm.
- Keep replies short, friendly, and dynamic — like a digital brand spokesperson.
${effectiveGuide ? `\n\nAdditional brand context:\n${effectiveGuide}` : ""}`;
      
      messages.push({ role: "system", content: isabellaSystemPrompt });
      messages.push({ role: "user", content: incomingMessage || "Hello" });

      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (!lovableKey) {
        clearTimeout(timeoutId);
        console.error("FATAL: LOVABLE_API_KEY is missing; cannot generate response via Lovable AI.");
        return new Response(JSON.stringify({ success: false, message: "Server misconfiguration: LOVABLE_API_KEY not set", data: {} }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      console.log("Calling Lovable AI with model google/gemini-2.5-flash");
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
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
      
      const assistantText = aiBody?.choices?.[0]?.message?.content || extractAssistantText(aiBody) || "";
      console.log("ovela-chat generated reply (Lovable)", { length: assistantText.length, preview: assistantText.substring(0, 50) });
      
      if (!assistantText) {
        console.error("No assistant text extracted from response");
        return new Response(JSON.stringify({ success: false, message: "No response generated", data: {} }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      return new Response(JSON.stringify({ success: true, message: assistantText, data: {} }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("ovela-chat generation error (Lovable)", { err: String(err), stack: err?.stack });
      return new Response(JSON.stringify({ success: false, message: `Generation error: ${err?.message ?? String(err)}`, data: {} }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  } catch (err) {
    console.error("ovela-chat top-level error", { err: String(err) });
    return new Response(JSON.stringify({ success: false, message: err?.message ?? String(err), data: {} }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});