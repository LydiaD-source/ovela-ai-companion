import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'origin, content-type, authorization, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests first
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('Isabella basic proxy called');

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
        JSON.stringify({ 
          error: 'Upstream error', 
          status: response.status, 
          details: errorText 
        }),
        { 
          status: 502, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const data = await response.json();
    console.log('Wellness Geni response data:', data);

    // Normalize response format
    const normalized = {
      response: data?.message || data?.response || '',
      persona: body?.persona || data?.persona || 'isabella-navia',
      timestamp: new Date().toISOString(),
      ...data
    };

    return new Response(JSON.stringify(normalized), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error in isabella-basic proxy:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error?.message ?? String(error) 
      }),
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