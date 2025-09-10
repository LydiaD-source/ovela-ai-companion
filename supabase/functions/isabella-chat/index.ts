import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Isabella chat proxy called');

    // Get the Wellness Geni API URL from environment
    const wellnessGeniUrl = Deno.env.get('WELLNESS_GENI_API_URL');
    console.log('Wellness Geni URL:', wellnessGeniUrl);

    if (!wellnessGeniUrl) {
      throw new Error('WELLNESS_GENI_API_URL not configured');
    }

    // Parse the request body
    const body = await req.json();
    console.log('Request body:', body);

    // Forward the request to Wellness Geni API
    const target = `${wellnessGeniUrl}/api/chat`;
    console.log('Forwarding to:', target);

    const response = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Wellness Geni response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Wellness Geni API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Upstream error', status: response.status, details: errorText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Wellness Geni response data:', data);

    // Normalize payload: keep original keys and add response, persona, timestamp
    const normalized = {
      ...data,
      response: (data as any)?.response ?? (data as any)?.message ?? '',
      persona: body?.persona ?? (data as any)?.persona ?? 'isabella-navia',
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(normalized), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error in isabella-chat proxy:', error);

    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error?.message ?? String(error) }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});