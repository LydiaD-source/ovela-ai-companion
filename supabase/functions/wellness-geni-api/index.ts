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
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const wellnessGeniApiKey = Deno.env.get('WELLNESS_GENI_API_KEY');
    const wellnessGeniApiUrl = Deno.env.get('WELLNESS_GENI_API_URL') || 'https://api.wellnessgeni.com';

    if (!wellnessGeniApiKey) {
      return new Response(JSON.stringify({ success: false, error: 'Missing WELLNESS_GENI_API_KEY secret' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role for any internal logging if needed (RLS-safe)
    const supabase = supabaseServiceRole
      ? createClient(supabaseUrl, supabaseServiceRole, { auth: { persistSession: false, autoRefreshToken: false } })
      : null;

    const { action, payload } = await req.json();

    console.log('WellnessGeni API Request:', { action, payload });

    // Prepare headers for WellnessGeni (support both Authorization and x-api-key)
    const wgHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${wellnessGeniApiKey}`,
      'x-api-key': wellnessGeniApiKey,
    };

    // (Optional) Add internal logging here if needed

    let wellnessGeniResponse;

    switch (action) {
      case 'chat':
        wellnessGeniResponse = await fetch(`${wellnessGeniApiUrl}/chat`, {
          method: 'POST',
          headers: wgHeaders,
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
          headers: wgHeaders,
        });
        break;

      case 'services-info':
        wellnessGeniResponse = await fetch(`${wellnessGeniApiUrl}/services`, {
          method: 'GET',
          headers: wgHeaders,
        });
        break;

      case 'pricing-info':
        wellnessGeniResponse = await fetch(`${wellnessGeniApiUrl}/pricing`, {
          method: 'GET',
          headers: wgHeaders,
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Try to parse JSON, otherwise return raw text for debugging
    const contentType = wellnessGeniResponse.headers.get('content-type') || '';
    let responseBody: any;
    if (contentType.includes('application/json')) {
      responseBody = await wellnessGeniResponse.json();
    } else {
      const text = await wellnessGeniResponse.text();
      responseBody = { raw: text };
    }

    if (!wellnessGeniResponse.ok) {
      console.error('WellnessGeni API non-200', { status: wellnessGeniResponse.status, body: responseBody });
      return new Response(JSON.stringify({ 
        success: false, 
        error: `WellnessGeni API error ${wellnessGeniResponse.status}`,
        details: responseBody
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('WellnessGeni API Response:', responseBody);

    return new Response(JSON.stringify(responseBody), {
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