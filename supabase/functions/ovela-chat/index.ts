import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function sanitizeBaseUrl(raw: string | undefined): { url: string; reason?: string } {
  // Always target the multi-tenant endpoint (full path). If env is invalid/missing, fallback to default.
  const defaultEndpoint = Deno.env.get('WELLNESS_GENI_API_URL') || 'https://vrpgowcocbztclxfzssu.supabase.co/functions/v1/ovela-chat';

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

// Extract assistant text robustly from various API response shapes
function extractAssistantText(body: any): string {
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
      typeof body === 'string' ? body : '',
      body?.raw && typeof body.raw === 'string' ? body.raw : ''
    ].filter((v) => typeof v === 'string' && v.trim().length > 0);
    return candidates[0] || '';
  } catch {
    return '';
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

    const body: any = await req.json().catch(() => ({}));

    const incomingMessage = (body?.message ?? body?.prompt ?? '').toString();
    const persona = body?.persona ?? 'isabella-navia';
    const brand_guide_in = body?.brand_guide;
    const userId = body?.userId ?? body?.user_id ?? 'ovela-guest';
    const clientId = body?.client_id ?? 'ovela_client_001';

    // Inject OVELA_GUIDE only when brand_guide is missing; no hardcoded fallback
    const effectiveGuide = brand_guide_in ?? ovelaGuide ?? undefined;

    const payload = {
      message: incomingMessage,
      persona,
      ...(effectiveGuide ? { brand_guide: effectiveGuide } : {}),
      userId,
      user_id: userId,
      client_id: clientId,
      source: 'ovela',
      context: 'ovela-interactive',
    };

    console.log('ovela-chat request', { baseUrl, urlReason: urlReason ?? 'ok', persona, clientId, hasBrandGuide: !!payload.brand_guide, hasUserId: !!userId, autoInjectedGuide: !brand_guide_in && !!ovelaGuide });
    console.log('ovela-chat payload', JSON.stringify({ ...payload, brand_guide: effectiveGuide ? '[injected]' : undefined }, null, 2));

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
          url: baseUrl,
          body: responseBody,
          requestPayload: payload
        });
        return new Response(JSON.stringify({
          success: false,
          message: `WellnessGeni API error ${wgRes.status}: ${wgRes.statusText}`,
          data: {}
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const assistantText = extractAssistantText(responseBody);

      return new Response(JSON.stringify({
        success: true,
        message: assistantText,
        data: {}
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error('ovela-chat fetch error', { error: fetchError.message, baseUrl });
      
      return new Response(JSON.stringify({
        success: false,
        message: `Network error: ${fetchError.message}`,
        data: {}
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in ovela-chat function:', error);
    return new Response(JSON.stringify({ success: false, message: error.message, data: {} }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});