import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,OPTIONS"
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

  try {
    const defaultId = Deno.env.get("DEFAULT_BRAND_TEMPLATE_ID")?.trim() || Deno.env.get("OVELA_CLIENT_ID")?.trim() || "ovela_client_001";
    const baseUrl = Deno.env.get("WELLNESS_GENI_API_URL");
    const apiKey = Deno.env.get("WELLNESS_GENI_API_KEY");
    const envGuide = Deno.env.get("OVELA_GUIDE");

    let status = "unknown";
    let adminStatus: number | null = null;

    if (isValidUrl(baseUrl) && apiKey) {
      try {
        const res = await fetch(`${baseUrl}/brand-templates/${defaultId}`, {
          headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" }
        });
        adminStatus = res.status;
        status = res.ok ? "loaded" : "admin_error";
      } catch (e) {
        status = "admin_fetch_exception";
      }
    } else if (envGuide) {
      status = "env_fallback";
    } else {
      status = "local_fallback";
    }

    const body = {
      brandTemplateId: defaultId,
      status,
      adminUrlValid: isValidUrl(baseUrl),
      adminConfigured: !!apiKey,
      hasEnvGuide: !!envGuide,
      adminStatus
    };

    return new Response(JSON.stringify(body), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});