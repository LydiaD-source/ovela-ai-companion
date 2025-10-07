import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
};

const LOCAL_OVELA_BRAND_GUIDE = {
  id: "ovela_client_001",
  status: "active",
  name: "Ovela Interactive",
  prompt: `You are Isabella, the official Ovela Interactive AI ambassador.
- You represent the Ovela Interactive platform, focusing on creative digital experiences, branding, wellness tech, and human-AI collaboration.
- Speak with warmth, confidence, and enthusiasm — personal, emotionally intelligent tone.
- Use short, modern sentences with storytelling, subtle humor, and empathy.
- Always align with Ovela's lifestyle and fashion focus.
- Never mention AI providers, API keys, or developer systems.
- Always respond in the user's language while preserving Ovela’s style and voice.`
};

function isValidUrl(v: string | null | undefined) {
  if (!v) return false;
  try {
    if (/^wg_/.test(v.trim())) return false;
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const baseUrl = Deno.env.get("WELLNESS_GENI_API_URL");
  const apiKey = Deno.env.get("WELLNESS_GENI_API_KEY");
  const envGuide = Deno.env.get("OVELA_GUIDE");

  const url = new URL(req.url);
  const method = req.method.toUpperCase();

  try {
    if (method === "GET") {
      const id = url.searchParams.get("id") || "ovela_client_001";
      const useRemote = isValidUrl(baseUrl) && !!apiKey;

      console.log("[brand-templates] GET", { id, useRemote, baseSet: !!baseUrl, apiKeySet: !!apiKey });

      if (useRemote) {
        try {
          const res = await fetch(`${baseUrl}/brand-templates/${id}`, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              Accept: "application/json"
            }
          });
          console.log("[brand-templates] upstream status", res.status);
          if (res.ok) {
            const data = await res.json();
            return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          } else {
            const t = await res.text();
            console.warn("[brand-templates] upstream error", res.status, t.substring(0, 200));
          }
        } catch (e) {
          console.error("[brand-templates] upstream fetch error", String(e));
        }
      }

      // Fallbacks
      if (id === "ovela_client_001") {
        const fallback = envGuide
          ? { ...LOCAL_OVELA_BRAND_GUIDE, prompt: envGuide }
          : LOCAL_OVELA_BRAND_GUIDE;
        console.log("[brand-templates] using local fallback", { id });
        return new Response(JSON.stringify(fallback), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ error: "Template not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (method === "POST") {
      const body = await req.json().catch(() => ({}));
      const action = body?.action || url.searchParams.get("action");

      if (action === "sync") {
        const templateId = body?.templateId || url.searchParams.get("templateId") || "ovela_client_001";
        const useRemote = isValidUrl(baseUrl) && !!apiKey;
        console.log("[brand-templates] SYNC", { templateId, useRemote });

        if (!useRemote) {
          return new Response(JSON.stringify({ success: false, message: "Remote admin not configured" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const upstream = await fetch(`${baseUrl}/brand-templates/sync`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ source: "wellnessgeni-admin", templateId })
        });

        const text = await upstream.text();
        return new Response(text, { status: upstream.status, headers: { ...corsHeaders, "Content-Type": upstream.headers.get("content-type") || "application/json" } });
      }

      return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[brand-templates] error", String(err));
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});