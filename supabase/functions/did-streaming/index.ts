import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    const DID_API_KEY = Deno.env.get('DID_API_KEY');

    if (!DID_API_KEY) {
      throw new Error('DID_API_KEY is not configured');
    }

    const authHeader = `Basic ${btoa(`${DID_API_KEY}:`)}`;
    console.log('🎬 D-ID action:', action);

    switch (action) {
      case 'create_talk_stream': {
        const sourceUrl = data.source_url || 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1759836676/golddress_ibt1fp.png';
        
        const response = await fetch('https://api.d-id.com/talks/streams', {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_url: sourceUrl,
            driver_url: 'bank://lively',
          }),
        });

        const result = await response.json();
        console.log('✅ Stream created:', result);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'talk_stream_sdp': {
        const { stream_id, session_id, answer } = data;
        const response = await fetch(`https://api.d-id.com/talks/streams/${stream_id}/sdp`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            answer,
            session_id,
          }),
        });

        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'talk_stream_ice': {
        const { stream_id, session_id, candidate, sdpMid, sdpMLineIndex } = data;
        const response = await fetch(`https://api.d-id.com/talks/streams/${stream_id}/ice`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidate,
            sdpMid,
            sdpMLineIndex,
            session_id,
          }),
        });

        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'talk_stream_speak': {
        const { stream_id, session_id, text } = data;
        console.log('🎤 Speaking text:', text);
        
        const response = await fetch(`https://api.d-id.com/talks/streams/${stream_id}`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            script: {
              type: 'text',
              input: text,
              provider: {
                type: 'elevenlabs',
                voice_id: '9BWtsMINqrJLrRacOk9x', // Aria voice
                voice_config: {
                  stability: 0.5,
                  similarity_boost: 0.75,
                }
              }
            },
            config: {
              stitch: true,
            },
            session_id,
          }),
        });

        const result = await response.json();
        console.log('✅ Speak response:', result);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete_talk_stream': {
        const { stream_id, session_id } = data;
        
        const deleteHeaders: Record<string, string> = {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        };
        
        // D-ID requires session_id as a Cookie header
        if (session_id) {
          deleteHeaders['Cookie'] = session_id;
        }
        
        const response = await fetch(`https://api.d-id.com/talks/streams/${stream_id}`, {
          method: 'DELETE',
          headers: deleteHeaders,
        });

        if (response.status === 204 || response.status === 200) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const result = await response.text();
        console.error('❌ Delete failed:', response.status, result);
        return new Response(JSON.stringify({ success: false, status: response.status }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('❌ D-ID streaming error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
