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

    const { action, data } = await req.json();
    console.log(`🎬 D-ID Action: ${action}`);

    switch (action) {
      // 1. Create Talk Stream
      case 'create_talk_stream': {
        const { source_url } = data;
        
        console.log('📝 Creating talk stream with source:', source_url);
        
        const response = await fetch('https://api.d-id.com/talks/streams', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${DID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ source_url })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Create stream error:', errorText);
          throw new Error(`Failed to create stream: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Stream created:', result.id);
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 2. Send SDP Answer
      case 'talk_stream_sdp': {
        const { stream_id, session_id, answer } = data;
        
        console.log('📝 Sending SDP answer for stream:', stream_id);
        
        const response = await fetch(`https://api.d-id.com/talks/streams/${stream_id}/sdp`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${DID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            answer,
            session_id
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ SDP error:', errorText);
          throw new Error(`Failed to send SDP: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ SDP answer sent');
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 3. Send ICE Candidate
      case 'talk_stream_ice': {
        const { stream_id, session_id, candidate, sdpMid, sdpMLineIndex } = data;
        
        console.log('📝 Sending ICE candidate for stream:', stream_id);
        
        const response = await fetch(`https://api.d-id.com/talks/streams/${stream_id}/ice`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${DID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidate,
            sdpMid,
            sdpMLineIndex,
            session_id
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ ICE error:', errorText);
          throw new Error(`Failed to send ICE: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ ICE candidate sent');
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 4. Speak Text
      case 'talk_stream_speak': {
        const { stream_id, session_id, text } = data;
        
        console.log('📝 Sending speak command:', text.substring(0, 50));
        
        const response = await fetch(`https://api.d-id.com/talks/streams/${stream_id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${DID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            script: {
              type: 'text',
              input: text,
              provider: {
                type: 'elevenlabs',
                voice_id: 't0IcnDolatli2xhqgLgn', // Isabella voice
                voice_config: {
                  model_id: 'eleven_flash_v2_5',
                  stability: 0.75,
                  similarity_boost: 0.70,
                  style: 0.35,
                  use_speaker_boost: true
                }
              }
            },
            config: {
              stitch: true,
              fluent: false,
              speed: 0.78
            },
            session_id
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Speak error:', errorText);
          throw new Error(`Failed to speak: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Speak command sent');
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 5. Delete Stream
      case 'delete_talk_stream': {
        const { stream_id, session_id } = data;
        
        console.log('📝 Deleting stream:', stream_id);
        
        const response = await fetch(`https://api.d-id.com/talks/streams/${stream_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Basic ${DID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_id })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Delete error:', errorText);
          throw new Error(`Failed to delete stream: ${response.status}`);
        }

        console.log('✅ Stream deleted');
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ D-ID error:', error);
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
