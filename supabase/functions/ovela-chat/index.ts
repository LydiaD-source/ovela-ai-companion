import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function sanitizeBaseUrl(raw: string | undefined): { url: string; reason?: string } {
  const fallback = 'https://api.wellnessgeni.com';
  if (!raw) return { url: fallback, reason: 'missing' };
  const trimmed = raw.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    // If no protocol, add https://
    const withProtocol = `https://${trimmed}`;
    try {
      const u = new URL(withProtocol);
      return { url: u.origin, reason: 'no-protocol-added' };
    } catch {
      return { url: fallback, reason: 'invalid-url-after-protocol' };
    }
  }
  try {
    const u = new URL(trimmed);
    return { url: u.origin };
  } catch {
    return { url: fallback, reason: 'invalid-url' };
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

    const payload = {
      message,
      persona,
      brand_guide: brand_guide || ovelaGuide, // Auto-inject OVELA_GUIDE if not provided
      userId,
    };

    console.log('ovela-chat request', { baseUrl, urlReason: urlReason ?? 'ok', persona, hasBrandGuide: !!payload.brand_guide, hasUserId: !!userId, autoInjectedGuide: !brand_guide && !!ovelaGuide });

    const wgRes = await fetch(`${baseUrl}/multitenant-chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Ovela-Supabase-Function/1.0',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    const contentType = wgRes.headers.get('content-type') || '';
    let responseBody: any;
    if (contentType.includes('application/json')) {
      responseBody = await wgRes.json();
    } else {
      const text = await wgRes.text();
      responseBody = { raw: text };
    }

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
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ovela-chat function:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});