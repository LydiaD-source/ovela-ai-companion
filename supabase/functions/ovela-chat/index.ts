import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function sanitizeBaseUrl(raw: string | undefined): { url: string; reason?: string } {
  // Always target the multi-tenant endpoint (full path). If env is invalid/missing, fallback to default.
  const defaultEndpoint = 'https://api.wellnessgeni.com/multitenant-chat';

  if (!raw) return { url: defaultEndpoint, reason: 'using-default' };

  let candidate = raw.trim();
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const u = new URL(candidate);
    // Enforce the correct path to avoid misconfiguration
    if (!u.href.includes('/multitenant-chat')) {
      return { url: defaultEndpoint, reason: 'missing-path-fallback' };
    }
    return { url: u.toString(), reason: 'env' };
  } catch {
    return { url: defaultEndpoint, reason: 'invalid-url-fallback' };
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBaseUrl = Deno.env.get('WELLNESS_GENI_API_URL');
    const { url: baseUrl, reason: urlReason } = sanitizeBaseUrl(rawBaseUrl);
    const apiKey = Deno.env.get('WELLNESS_GENI_API_KEY');
    const ovelaGuide = Deno.env.get('OVELA_GUIDE');

    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: 'Missing WELLNESS_GENI_API_KEY secret' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, persona = 'isabella-navia', brand_guide, userId } = await req.json();

    // Inject OVELA_GUIDE only when brand_guide is missing; no hardcoded fallback
    const effectiveGuide = brand_guide ?? ovelaGuide ?? undefined;

    const payload = {
      message,
      persona,
      ...(effectiveGuide ? { brand_guide: effectiveGuide } : {}),
      userId: userId || 'ovela-guest',
    };

    console.log('ovela-chat request', { baseUrl, urlReason: urlReason ?? 'ok', persona, hasBrandGuide: !!payload.brand_guide, hasUserId: !!userId, autoInjectedGuide: !brand_guide && !!ovelaGuide });
    console.log('ovela-chat payload', JSON.stringify(payload, null, 2));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const wgRes = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Ovela-Supabase-Function/1.0',
          'Origin': 'https://ovela.com',
          'Referer': 'https://ovela.com',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = wgRes.headers.get('content-type') || '';
      let responseBody: any;
      if (contentType.includes('application/json')) {
        responseBody = await wgRes.json();
      } else {
        const text = await wgRes.text();
        responseBody = { raw: text };
      }

      console.log('ovela-chat response', { status: wgRes.status, body: responseBody });

      if (!wgRes.ok) {
        console.error('ovela-chat API error', { 
          status: wgRes.status, 
          statusText: wgRes.statusText,
          url: `${baseUrl}/multitenant-chat`,
          body: responseBody,
          requestPayload: payload
        });
        return new Response(JSON.stringify({
          success: false,
          error: `WellnessGeni API error ${wgRes.status}: ${wgRes.statusText}`,
          details: responseBody,
          baseUrlUsed: baseUrl,
          baseUrlIssue: urlReason ?? null,
        }), {
          status: 200, // Return 200 to frontend to avoid FunctionsHttpError
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(responseBody), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error('ovela-chat fetch error', { error: fetchError.message, baseUrl });
      
      return new Response(JSON.stringify({
        success: false,
        error: `Network error: ${fetchError.message}`,
        baseUrlUsed: baseUrl,
        baseUrlIssue: urlReason ?? null,
      }), {
        status: 200, // Return 200 to frontend
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in ovela-chat function:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});