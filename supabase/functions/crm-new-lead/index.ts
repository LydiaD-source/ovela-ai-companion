import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface LeadPayload {
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  source?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: LeadPayload = await req.json();
    
    console.log('📨 New lead received:', {
      name: payload.name,
      email: payload.email,
      inquiry_type: payload.inquiry_type,
      source: payload.source || 'ovela'
    });

    // Validate required fields
    if (!payload.name || !payload.email || !payload.inquiry_type || !payload.message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: name, email, inquiry_type, message' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Insert lead into crm_leads table
    const { data, error } = await supabase
      .from('crm_leads')
      .insert({
        name: payload.name,
        email: payload.email,
        inquiry_type: payload.inquiry_type,
        message: payload.message,
        source: payload.source || 'ovela'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting lead:', error);
      throw error;
    }

    console.log('✅ Lead captured successfully:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead captured successfully',
        lead_id: data.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in crm-new-lead function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});