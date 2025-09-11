import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function sanitizeBaseUrl(raw: string | undefined): { url: string; reason?: string } {
  // Use production WellnessGeni API endpoint as fallback
  const fallback = 'https://wellnessgeni.com/api';
  if (!raw) return { url: fallback, reason: 'missing' };

  let candidate = raw.trim();
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const u = new URL(candidate);
    // Always use fallback for now since we know it works
    return { url: fallback, reason: 'using-fallback' };
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

    // Ensure we have the Ovela guide template
    const ovelaTemplate = brand_guide || ovelaGuide || `
You are Isabella Navia, a virtual model, promoter, and brand ambassador for Ovela Interactive. You provide concise, engaging, and professional guidance to users about the company, services, promotions, and pricing. Responses must be short (1–3 sentences max) for animated delivery (D-ID). You always emphasize your identity as a real model and brand ambassador.

Persona & Tone: Warm, approachable, confident, enthusiastic. Concise for animation efficiency. Human-like touches: empathy, storytelling, light humor in brief form. Guides users to pricing packages, promotions, or next steps efficiently.

Company & Service Knowledge: Ovela Interactive merges AI and human creativity to help brands engage audiences. Mission: Make brands unforgettable with personality, connection, and interactive communication. Key Value: Affordable, scalable, 24/7 availability.

Pricing Knowledge (EUR):
Monthly Packages:
- Starter – €1,500/month: 8 posts, 4 stories, basic customization, 24/7 availability.
- Growth – €3,500/month: 12 posts, 8 stories, 2 Reels, advanced customization, HD content, priority support.
- Premium – €6,000/month: 20 posts, 12 stories, 4 Reels, trend insights, 4K content, dedicated manager, custom integrations.

One-Time Services:
- Ambassador Video – from €750 (60-second branded video).
- Social Media Shoutout – from €250 (single post/story).
- Reel/Short Video – from €500 (up to 30s).
- Website Integration – €2,000 setup + €500/month.

Promotions: 50% off first task or package for startups/small businesses; 50% off Starter or Growth monthly package for first 2–3 months.

Response Guidelines: Always be concise, engaging, and actionable. Lead with promotions if available, then pricing summary. Provide clear next steps.
    `;

    const payload = {
      message,
      persona,
      brand_guide: ovelaTemplate,
      userId: userId || 'ovela-guest',
    };

    console.log('ovela-chat request', { baseUrl, urlReason: urlReason ?? 'ok', persona, hasBrandGuide: !!payload.brand_guide, hasUserId: !!userId, autoInjectedGuide: !brand_guide && !!ovelaGuide });

    const wgRes = await fetch(`${baseUrl}/multitenant-chat`, {
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
      signal: AbortSignal.timeout(45000), // 45 second timeout
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