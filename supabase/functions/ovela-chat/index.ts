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

    // FALLBACK: No valid external WellnessGeni endpoint — try Lovable AI first, then OpenAI
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (lovableKey) {
      try {
        const messages: any[] = [];
        const systemContent = (effectiveGuide ? `${effectiveGuide}\n\n` : "") + `You are ${persona}, virtual model and brand ambassador for Ovela Interactive. Use warm, promotional, helpful tone. Keep answers concise for animation and TTS.`;
        messages.push({ role: "system", content: systemContent });
        messages.push({ role: "user", content: incomingMessage || "Hello" });

        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages,
            stream: false,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!aiRes.ok) {
          if (aiRes.status === 429) {
            return new Response(JSON.stringify({ success: false, message: "Rate limits exceeded, please try again shortly.", data: {} }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
          if (aiRes.status === 402) {
            return new Response(JSON.stringify({ success: false, message: "AI credits exhausted. Please top up your Lovable AI workspace.", data: {} }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
          const errText = await aiRes.text().catch(() => "");
          console.error("Lovable AI gateway error", { status: aiRes.status, errText });
          // Fall through to OpenAI if available
        } else {
          const aiBody = await aiRes.json().catch(() => ({}));
          const assistantText = extractAssistantText(aiBody) || (aiBody?.choices?.[0]?.message?.content ?? "");
          console.log("ovela-chat lovable generated reply", { length: (assistantText || "").length });
          return new Response(JSON.stringify({ success: true, message: assistantText, data: {} }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.error("ovela-chat lovable generation error", { err: String(err) });
        // Continue to OpenAI fallback
      }
    }

    if (openaiKey) {
      try {
        const messages: any[] = [];
        const systemContent = (effectiveGuide ? `${effectiveGuide}\n\n` : "") + `You are ${persona}, virtual model and brand ambassador for Ovela Interactive. Use warm, promotional, helpful tone. Keep answers concise for animation and TTS.`;
        messages.push({ role: "system", content: systemContent });
        messages.push({ role: "user", content: incomingMessage || "Hello" });

        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            max_tokens: 600,
            temperature: 0.8,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const openaiBody = await openaiRes.json().catch(() => ({}));
        const assistantText = extractAssistantText(openaiBody) || (openaiBody?.choices?.[0]?.message?.content ?? "");
        console.log("ovela-chat openai generated reply", { length: (assistantText || "").length });
        return new Response(JSON.stringify({ success: true, message: assistantText, data: {} }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        clearTimeout(timeoutId);
        console.error("ovela-chat openai generation error", { err: String(err) });
        return new Response(JSON.stringify({ success: false, message: `Generation error: ${err?.message ?? String(err)}`, data: {} }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // If neither key is available
    clearTimeout(timeoutId);
    console.error("FATAL: No AI provider configured. Set LOVABLE_API_KEY or OPENAI_API_KEY.");
    return new Response(JSON.stringify({ success: false, message: "Server misconfiguration: no AI provider configured", data: {} }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("ovela-chat top-level error", { err: String(err) });
    return new Response(JSON.stringify({ success: false, message: err?.message ?? String(err), data: {} }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});