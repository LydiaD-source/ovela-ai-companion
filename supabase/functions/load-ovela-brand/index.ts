import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST,OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => ({}));
    const clientId = (body?.client_id || body?.clientId || "ovela_client_001").toString();

    const adminKey = Deno.env.get("WELLNESS_GENI_API_KEY");
    if (!adminKey) {
      console.error("[load-ovela-brand] Missing WELLNESS_GENI_API_KEY secret");
      return new Response(JSON.stringify({ success: false, message: "Server misconfiguration: WELLNESS_GENI_API_KEY not set" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const upstreamUrl = "https://vrpgowcocbztclxfzssu.functions.supabase.co/brand-guide";
    console.log("[load-ovela-brand] Fetching brand guide via admin edge", { clientId, upstreamUrl });

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminKey}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ action: "getBrandGuide", payload: { client_id: clientId } })
    });

    const text = await upstream.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { /* not json */ }

    console.log("[load-ovela-brand] upstream status", upstream.status);

    if (!upstream.ok) {
      return new Response(JSON.stringify({ success: false, message: text.substring(0, 200) }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const guide = json?.data?.guide_content || json?.guide_content || json?.prompt || "";
    if (!guide) {
      console.warn("[load-ovela-brand] No guide_content found in upstream response");
    }

    return new Response(JSON.stringify({ success: true, guide }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[load-ovela-brand] error", String(err));
    return new Response(JSON.stringify({ success: false, message: err?.message ?? String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});