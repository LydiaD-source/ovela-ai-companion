import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const DID_API_BASE = 'https://api.d-id.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    if (!DID_API_KEY) {
      throw new Error('DID_API_KEY is not configured');
    }

    const authHeader = `Basic ${btoa(`${DID_API_KEY}:`)}`;
    console.log(`🎬 D-ID action: ${action}`);

    switch (action) {
      // ============================================
      // CREATE STREAM - WebRTC connection only, NO script
      // ============================================
      case 'createStream': {
        const { source_url } = data;
        
        if (!source_url) {
          throw new Error('source_url is required for createStream');
        }

        console.log('🔗 Creating D-ID stream with source:', source_url);

        const response = await fetch(`${DID_API_BASE}/talks/streams`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_url,
            stream_warmup: true,
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          console.error('❌ D-ID createStream failed:', response.status, result);
          return new Response(JSON.stringify({ success: false, error: result }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('✅ Stream created:', {
          id: result.id,
          status: result.status,
          session_id: result.session_id?.substring(0, 20) + '...',
        });

        return new Response(JSON.stringify({
          success: true,
          id: result.id,
          session_id: result.session_id,
          offer: result.offer,
          ice_servers: result.ice_servers,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ============================================
      // START - Send SDP answer after local description set
      // ============================================
      case 'start': {
        const { stream_id, session_id, answer } = data;

        if (!stream_id || !session_id || !answer) {
          throw new Error('stream_id, session_id, and answer are required');
        }

        console.log('📡 Sending SDP answer to D-ID:', { stream_id, session_id: session_id.substring(0, 20) + '...' });

        const response = await fetch(`${DID_API_BASE}/talks/streams/${stream_id}/sdp`, {
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

        if (!response.ok) {
          console.error('❌ D-ID SDP exchange failed:', response.status, result);
          return new Response(JSON.stringify({ success: false, error: result }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('✅ SDP answer accepted');
        return new Response(JSON.stringify({ success: true, ...result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ============================================
      // SEND ICE CANDIDATE - Forward ALL including null (gathering complete)
      // ============================================
      case 'sendIceCandidate': {
        const { stream_id, session_id, candidate, sdpMid, sdpMLineIndex } = data;

        if (!stream_id || !session_id) {
          throw new Error('stream_id and session_id are required');
        }

        // candidate can be null (signals gathering complete)
        console.log('🧊 Sending ICE candidate:', { 
          stream_id, 
          hasCandidate: candidate !== null,
          sdpMid,
          sdpMLineIndex 
        });

        const body: Record<string, unknown> = { session_id };
        
        if (candidate !== null) {
          body.candidate = candidate;
          body.sdpMid = sdpMid;
          body.sdpMLineIndex = sdpMLineIndex;
        }

        const response = await fetch(`${DID_API_BASE}/talks/streams/${stream_id}/ice`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        // ICE endpoints often return 204
        if (response.status === 204) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const result = await response.json();

        if (!response.ok) {
          console.error('❌ ICE candidate failed:', response.status, result);
          return new Response(JSON.stringify({ success: false, error: result }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true, ...result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ============================================
      // START ANIMATION - Send text script AFTER WebRTC connected
      // ============================================
      case 'startAnimation': {
        const { stream_id, session_id, text, voice_id } = data;

        if (!stream_id || !session_id || !text) {
          throw new Error('stream_id, session_id, and text are required');
        }

        const selectedVoice = voice_id || 'EXAVITQu4vr4xnSDxMaL'; // Default: Sarah
        
        console.log('🎤 Starting animation:', { 
          stream_id, 
          textLength: text.length,
          voice: selectedVoice 
        });

        const headers: Record<string, string> = {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        };

        // Add ElevenLabs API key if available
        if (ELEVENLABS_API_KEY) {
          headers['xi-elevenlabs-api-key'] = ELEVENLABS_API_KEY;
        }

        const requestBody = {
          script: {
            type: 'text',
            input: text,
            provider: {
              type: 'elevenlabs',
              voice_id: selectedVoice,
              voice_config: {
                stability: 0.5,
                similarity_boost: 0.75,
              },
            },
          },
          config: {
            stitch: true,
          },
          session_id,
        };

        console.log('📤 Animation request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(`${DID_API_BASE}/talks/streams/${stream_id}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('❌ startAnimation failed:', response.status, result);
          return new Response(JSON.stringify({ success: false, error: result }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('✅ Animation started:', { 
          status: result.status,
          duration: result.duration 
        });

        return new Response(JSON.stringify({ success: true, ...result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ============================================
      // CREATE CLIP - Fallback async video generation
      // ============================================
      case 'createClip': {
        const { source_url, text, voice_id } = data;

        if (!source_url || !text) {
          throw new Error('source_url and text are required for createClip');
        }

        const selectedVoice = voice_id || 'EXAVITQu4vr4xnSDxMaL';

        console.log('🎬 Creating async clip:', { source_url, textLength: text.length });

        const headers: Record<string, string> = {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        };

        if (ELEVENLABS_API_KEY) {
          headers['xi-elevenlabs-api-key'] = ELEVENLABS_API_KEY;
        }

        const response = await fetch(`${DID_API_BASE}/talks`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            source_url,
            script: {
              type: 'text',
              input: text,
              provider: {
                type: 'elevenlabs',
                voice_id: selectedVoice,
              },
            },
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('❌ createClip failed:', response.status, result);
          return new Response(JSON.stringify({ success: false, error: result }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log('✅ Clip created:', { id: result.id, status: result.status });

        return new Response(JSON.stringify({ 
          success: true, 
          id: result.id,
          status: result.status,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ============================================
      // GET CLIP - Check clip status and get video URL
      // ============================================
      case 'getClip': {
        const { clip_id } = data;

        if (!clip_id) {
          throw new Error('clip_id is required');
        }

        const response = await fetch(`${DID_API_BASE}/talks/${clip_id}`, {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('❌ getClip failed:', response.status, result);
          return new Response(JSON.stringify({ success: false, error: result }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          status: result.status,
          result_url: result.result_url,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ============================================
      // DELETE STREAM - Cleanup
      // ============================================
      case 'deleteStream': {
        const { stream_id, session_id } = data;

        if (!stream_id) {
          throw new Error('stream_id is required');
        }

        console.log('🗑️ Deleting stream:', stream_id);

        const response = await fetch(`${DID_API_BASE}/talks/streams/${stream_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_id }),
        });

        if (response.status === 204 || response.status === 200) {
          console.log('✅ Stream deleted');
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
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
