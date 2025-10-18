import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    
    if (!DID_API_KEY) {
      throw new Error('DID_API_KEY not configured');
    }

    const { text, imageUrl } = await req.json();
    
    console.log('🎬 D-ID Streaming - Creating agent stream');
    console.log('📝 Text:', text?.substring(0, 50));
    console.log('🖼️ Image:', imageUrl);

    // Use D-ID Agents/Streaming API (same as WellnessGeni)
    const agentId = 'agt_yC7aMWKC'; // Isabella agent with ElevenLabs integrated
    
    const requestBody = {
      source_url: imageUrl || 'https://res.cloudinary.com/di5gj4nyp/image/upload/w_1920,h_1080,c_fit,dpr_1.0,e_sharpen:200,q_auto:best,f_auto/v1759612035/Default_Fullbody_portrait_of_IsabellaV2_wearing_a_luxurious_go_0_fdabba15-5365-4f04-ab3b-b9079666cdc6_0_shq4b3.png',
      script: {
        type: 'text',
        input: text,
        provider: {
          type: 'elevenlabs',
          voice_id: 'pFZP5JQG7iQjIQuC4Bku', // Lily voice (same as WellnessGeni)
          voice_config: {
            stability: 0.52,
            similarity_boost: 0.70,
            style: 0.35,
            use_speaker_boost: true
          }
        }
      },
      config: {
        stitch: true,
        fluent: false,
        driver_expressions: {
          expressions: [
            { start_frame: 0, expression: 'neutral', intensity: 1.0 }
          ]
        },
        result_format: 'mp4',
        speed: 0.78 // 78% speaking rate
      }
    };

    console.log('📤 Sending to D-ID:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`https://api.d-id.com/agents/${agentId}/streams`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ D-ID API Error:', response.status, errorText);
      throw new Error(`D-ID API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ D-ID Stream Created:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ D-ID streaming error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
