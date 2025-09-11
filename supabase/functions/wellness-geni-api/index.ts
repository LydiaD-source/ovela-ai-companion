import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const wellnessGeniApiKey = Deno.env.get('WELLNESS_GENI_API_KEY')!;
    const wellnessGeniApiUrl = Deno.env.get('WELLNESS_GENI_API_URL') || 'https://api.wellnessgeni.com';

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { action, payload } = await req.json();

    console.log('WellnessGeni API Request:', { action, payload });

    // Log API usage
    await supabase.from('api_usage_logs').insert({
      client_id: (await supabase.from('clients').select('id').eq('name', 'Ovela Interactive').single()).data?.id,
      endpoint: `/wellness-geni-api/${action}`,
      status_code: 200,
      tokens_used: 0
    });

    let wellnessGeniResponse;

    switch (action) {
      case 'chat':
        wellnessGeniResponse = await fetch(`${wellnessGeniApiUrl}/chat`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${wellnessGeniApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: payload.message,
            persona: payload.persona || 'isabella-navia',
            context: payload.context || 'ovela-interactive'
          }),
        });
        break;

      case 'persona-info':
        wellnessGeniResponse = await fetch(`${wellnessGeniApiUrl}/personas/${payload.persona}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${wellnessGeniApiKey}`,
            'Content-Type': 'application/json',
          },
        });
        break;

      case 'services-info':
        wellnessGeniResponse = await fetch(`${wellnessGeniApiUrl}/services`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${wellnessGeniApiKey}`,
            'Content-Type': 'application/json',
          },
        });
        break;

      case 'pricing-info':
        wellnessGeniResponse = await fetch(`${wellnessGeniApiUrl}/pricing`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${wellnessGeniApiKey}`,
            'Content-Type': 'application/json',
          },
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (!wellnessGeniResponse.ok) {
      throw new Error(`WellnessGeni API error: ${wellnessGeniResponse.status}`);
    }

    const data = await wellnessGeniResponse.json();

    console.log('WellnessGeni API Response:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in wellness-geni-api function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});