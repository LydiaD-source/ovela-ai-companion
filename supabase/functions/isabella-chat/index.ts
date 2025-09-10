import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    console.log('Forwarding to:', `${wellnessGeniUrl}/api/chat`);
    const response = await fetch(`${wellnessGeniUrl}/api/chat`, {
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
      throw new Error(`Wellness Geni API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Wellness Geni response data:', data);

    return new Response(
      JSON.stringify(data),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );

  } catch (error) {
    console.error('Error in isabella-chat proxy:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});