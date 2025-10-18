import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    if (!DID_API_KEY) {
      throw new Error('DID_API_KEY not configured');
    }

    const { action, data } = await req.json();
    console.log(`🎬 D-ID Action: ${action}`, data);

    switch (action) {
      case 'create_talk_stream': {
        const {
          source_url = 'https://res.cloudinary.com/di5gj4nyp/image/upload/w_1920,h_1080,c_fit,dpr_1.0,e_sharpen:200,q_auto:best,f_auto/v1759612035/Default_Fullbody_portrait_of_IsabellaV2_wearing_a_luxurious_go_0_fdabba15-5365-4f04-ab3b-b9079666cdc6_0_shq4b3.png',
          script,
          voice_id = '9BWtsMINqrJLrRacOk9x', // ElevenLabs Aria voice
          stability = 0.5,
          similarity_boost = 0.75,
          style = 0.0,
          use_cloned_voice = false,
        } = data;

        // Configure provider based on whether we're using ElevenLabs or not
        const provider = ELEVENLABS_API_KEY ? 'elevenlabs' : 'microsoft';
        
        const requestBody: any = {
          source_url,
          script: {
            type: 'text',
            input: script,
            provider,
          },
          config: {
            stitch: true,
            // Speech rate: 78 (optimal, not too fast)
            fluent: false,
            pad_audio: 0.0,
            driver_expressions: {
              expressions: [
                { start_frame: 0, expression: 'neutral', intensity: 1.0 }
              ]
            },
            align_driver: true,
            align_expand_factor: 0.0,
            auto_match: true,
            motion_factor: 1.0,
            normalization_factor: 1.0,
            sharpen: true,
            result_format: 'mp4',
          }
        };

        // Add ElevenLabs-specific configuration if API key is available
        if (provider === 'elevenlabs') {
          requestBody.script.voice_config = {
            voice_id,
            stability,
            similarity_boost,
            style,
            use_speaker_boost: true,
          };
          // Set speech rate to 78 (0.78 in API terms)
          requestBody.config.speed = 0.78;
        } else {
          // Microsoft TTS configuration with rate control
          requestBody.script.ssml = false;
          // For Microsoft, adjust rate via SSML or pitch
          requestBody.config.speed = 0.78;
        }

        console.log('🎬 Creating D-ID talk stream with config:', JSON.stringify(requestBody, null, 2));

        const response = await fetch('https://api.d-id.com/talks', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${DID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ D-ID API Error:', errorText);
          throw new Error(`D-ID API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ D-ID talk stream created:', result);

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_talk_status': {
        const { talk_id } = data;

        const response = await fetch(`https://api.d-id.com/talks/${talk_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${DID_API_KEY}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`D-ID API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete_talk': {
        const { talk_id } = data;

        const response = await fetch(`https://api.d-id.com/talks/${talk_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Basic ${DID_API_KEY}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`D-ID API error: ${response.status} - ${errorText}`);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
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
