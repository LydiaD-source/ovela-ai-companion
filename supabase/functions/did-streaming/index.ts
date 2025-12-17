import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// ============================================
// D-ID Streaming Edge Function v4 - PRODUCTION READY
// Optimized for high-traffic avatar animation
// ============================================

const DID_API_BASE = 'https://api.d-id.com';

// Allowed origins for CORS (production domains)
const ALLOWED_ORIGINS = [
  'https://www.wellnessgeni.com',
  'https://wellnessgeni.com',
  'https://ovelainteractive.com',
  'https://www.ovelainteractive.com',
  'http://localhost:5173',
  'http://localhost:8080',
];

const DID_API_KEY = Deno.env.get('DID_API_KEY');
const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

// Log startup config (once per cold start)
console.log('[did-streaming] v4 PRODUCTION READY:', {
  DID_API_KEY_SET: !!DID_API_KEY,
  DID_API_KEY_LENGTH: DID_API_KEY?.length || 0,
  ELEVEN_KEY_SET: !!ELEVENLABS_API_KEY,
  ELEVEN_KEY_LENGTH: ELEVENLABS_API_KEY?.length || 0,
  version: '2025-12-08-PRODUCTION-V4',
});

// Generate unique request ID for tracing
const generateRequestId = () => Math.random().toString(16).slice(2, 10);

serve(async (req) => {
  const requestId = generateRequestId();
  const origin = req.headers.get('origin') || '';
  const isAllowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o)) || origin === '';
  
  console.log(`[${requestId}] Request from origin: ${origin} Allowed: ${isAllowed}`);

  // Dynamic CORS headers based on origin
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowed ? origin || '*' : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body and support multiple parameter formats for backwards compatibility
    const rawBody = await req.text();
    let requestBody;
    try {
      requestBody = JSON.parse(rawBody);
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse JSON:`, rawBody.substring(0, 500));
      throw new Error('Invalid JSON body');
    }
    
    const { action, data, source_url: topLevelSourceUrl, avatarUrl: topLevelAvatarUrl, ...rest } = requestBody;
    
    console.log(`[${requestId}] Parsed request:`, { 
      action, 
      hasData: !!data, 
      hasTopLevelSourceUrl: !!topLevelSourceUrl,
      hasTopLevelAvatarUrl: !!topLevelAvatarUrl,
      dataKeys: data ? Object.keys(data) : [],
      rawBodyPreview: rawBody.substring(0, 300)
    });
    
    if (!DID_API_KEY) {
      throw new Error('DID_API_KEY is not configured');
    }

    const authHeader = `Basic ${btoa(`${DID_API_KEY}:`)}`;
    console.log(`[${requestId}] Action: ${action}`);

    switch (action) {
      // ============================================
      // CREATE STREAM - WebRTC connection only, NO script
      // Accepts both: { data: { source_url } } OR { source_url } directly
      // ============================================
      case 'createStream': {
        // Support multiple parameter formats for backwards compatibility
        // Priority: data.source_url > data.avatarUrl > topLevelSourceUrl > topLevelAvatarUrl
        const source_url = data?.source_url || data?.avatarUrl || topLevelSourceUrl || topLevelAvatarUrl;
        
        if (!source_url) {
          console.error(`[${requestId}] createStream: Missing avatarUrl/source_url`, { data, topLevelSourceUrl, topLevelAvatarUrl });
          return new Response(JSON.stringify({ success: false, error: { message: 'avatarUrl or source_url is required' } }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const receivedAs = data?.source_url ? 'data.source_url' : data?.avatarUrl ? 'data.avatarUrl' : topLevelSourceUrl ? 'source_url' : 'avatarUrl';
        console.log(`[${requestId}] createStream (NO script):`, { avatarUrl: source_url.substring(0, 80), receivedAs });

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
        
        console.log(`[${requestId}] D-ID Response:`, {
          ok: response.ok,
          status: response.status,
          hasSetCookie: !!response.headers.get('set-cookie'),
          bodyPreview: JSON.stringify(result).substring(0, 200),
        });

        if (!response.ok) {
          console.error(`[${requestId}] ❌ createStream failed:`, response.status, result);
          return new Response(JSON.stringify({ success: false, error: result }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`[${requestId}] createStream SUCCESS:`, {
          stream_id: result.id,
          session_id: result.session_id?.substring(0, 30) + '...',
          has_offer: !!result.offer,
          has_ice_servers: !!result.ice_servers,
          ice_servers_count: result.ice_servers?.length || 0,
        });

        // Return both id and stream_id for compatibility with all frontend versions
        return new Response(JSON.stringify({
          success: true,
          id: result.id,
          stream_id: result.id,  // v8 format - preferred
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
        // Support both nested data object and top-level fields
        const stream_id = data?.stream_id || rest.stream_id;
        const session_id = data?.session_id || rest.session_id;
        const answer = data?.answer || rest.answer;

        if (!stream_id || !session_id || !answer) {
          console.error(`[${requestId}] start: Missing required fields`, { stream_id, session_id, hasAnswer: !!answer });
          return new Response(JSON.stringify({ success: false, error: { message: 'stream_id, session_id, and answer are required' } }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`[${requestId}] start (SDP):`, {
          stream_id,
          session_id: session_id.substring(0, 30) + '...',
        });

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

        console.log(`[${requestId}] D-ID Response:`, {
          ok: response.ok,
          status: response.status,
        });

        if (response.status === 204) {
          console.log(`[${requestId}] start SUCCESS (204)`);
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const result = await response.json();

        if (!response.ok) {
          console.error(`[${requestId}] ❌ start failed:`, response.status, result);
          return new Response(JSON.stringify({ success: false, error: result }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`[${requestId}] start SUCCESS`);
        return new Response(JSON.stringify({ success: true, ...result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ============================================
      // SEND ICE CANDIDATE - Forward ALL including null
      // ============================================
      case 'sendIceCandidate': {
        // Support both nested data object and top-level fields
        const stream_id = data?.stream_id || rest.stream_id;
        const session_id = data?.session_id || rest.session_id;
        const candidate = data?.candidate ?? rest.candidate;
        const sdpMid = data?.sdpMid ?? rest.sdpMid;
        const sdpMLineIndex = data?.sdpMLineIndex ?? rest.sdpMLineIndex;

        if (!stream_id || !session_id) {
          console.error(`[${requestId}] sendIceCandidate: Missing required fields`, { stream_id, session_id });
          return new Response(JSON.stringify({ success: false, error: { message: 'stream_id and session_id are required' } }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // candidate can be null (signals ICE gathering complete)
        const body: Record<string, unknown> = { session_id };
        
        if (candidate !== null && candidate !== undefined) {
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

        console.log(`[${requestId}] D-ID Response:`, {
          ok: response.ok,
          status: response.status,
          hasSetCookie: !!response.headers.get('set-cookie'),
          bodyPreview: response.status !== 204 ? await response.clone().text().then(t => t.substring(0, 200)) : '(204)',
        });

        if (response.status === 204) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const result = await response.json();

        if (!response.ok) {
          console.error(`[${requestId}] ❌ sendIceCandidate failed:`, response.status, result);
          return new Response(JSON.stringify({ success: false, error: result }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`[${requestId}] sendIceCandidate SUCCESS`);
        return new Response(JSON.stringify({ success: true, ...result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ============================================
      // START ANIMATION - Send text script AFTER WebRTC connected
      // This is the main animation trigger
      // ============================================
      case 'startAnimation': {
        // Support both nested data object and top-level fields
        const stream_id = data?.stream_id || rest.stream_id;
        const session_id = data?.session_id || rest.session_id;
        // Support both 'text' and 'message' field names for compatibility
        const text = data?.text || rest.text || data?.message || rest.message;
        const voice_id = data?.voice_id || rest.voice_id || data?.voiceId || rest.voiceId;

        if (!stream_id || !session_id || !text) {
          console.error(`[${requestId}] startAnimation: Missing required fields`, { stream_id, session_id, hasText: !!text });
          return new Response(JSON.stringify({ success: false, error: { message: 'stream_id, session_id, and text are required' } }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const selectedVoice = voice_id || 'EXAVITQu4vr4xnSDxMaL'; // Default: Sarah
        
        console.log(`[${requestId}] startAnimation:`, {
          stream_id,
          session_id: session_id.substring(0, 100) + '...',
          messageLength: text.length,
          messagePreview: text.substring(0, 80),
          voiceId: selectedVoice,
        });

        const headers: Record<string, string> = {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        };

        // CRITICAL: Add ElevenLabs API key for voice synthesis
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

        console.log(`[${requestId}] D-ID Request:`, {
          url: `${DID_API_BASE}/talks/streams/${stream_id}`,
          method: 'POST',
          hasAuth: true,
          hasElevenKey: !!ELEVENLABS_API_KEY,
          hasCookie: false,
          payloadPreview: JSON.stringify(requestBody).substring(0, 200),
        });

        const response = await fetch(`${DID_API_BASE}/talks/streams/${stream_id}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        console.log(`[${requestId}] D-ID Response:`, {
          ok: response.ok,
          status: response.status,
          hasSetCookie: !!response.headers.get('set-cookie'),
          bodyPreview: JSON.stringify(result).substring(0, 200),
        });

        if (!response.ok) {
          console.error(`[${requestId}] ❌ startAnimation failed:`, response.status, result);
          return new Response(JSON.stringify({ success: false, error: result }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`[${requestId}] startAnimation SUCCESS - RTP frames should start flowing!`);

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

        console.log(`[${requestId}] createClip:`, { source_url: source_url.substring(0, 50), textLength: text.length });

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
          console.error(`[${requestId}] ❌ createClip failed:`, response.status, result);
          return new Response(JSON.stringify({ success: false, error: result }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`[${requestId}] createClip SUCCESS:`, { id: result.id, status: result.status });

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
          console.error(`[${requestId}] ❌ getClip failed:`, response.status, result);
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
      // DELETE STREAM - Cleanup when user leaves
      // ============================================
      case 'deleteStream': {
        // Support both nested data object and top-level fields
        const stream_id = data?.stream_id || rest.stream_id;
        const session_id = data?.session_id || rest.session_id;

        if (!stream_id) {
          console.error(`[${requestId}] deleteStream: Missing stream_id`);
          throw new Error('stream_id is required');
        }

        console.log(`[${requestId}] deleteStream:`, stream_id);

        const response = await fetch(`${DID_API_BASE}/talks/streams/${stream_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: session_id ? JSON.stringify({ session_id }) : undefined,
        });

        if (response.status === 204 || response.status === 200) {
          console.log(`[${requestId}] deleteStream SUCCESS`);
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const result = await response.text();
        console.error(`[${requestId}] ❌ deleteStream failed:`, response.status, result);
        
        return new Response(JSON.stringify({ success: false, status: response.status }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    // CRITICAL: Return status 200 with predictable structure to avoid breaking WebRTC lifecycle
    console.error(`[${requestId}] ❌ D-ID streaming error:`, error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        data: null, 
        stream_id: null, 
        error: error?.message || 'Streaming failed' 
      }),
      {
        status: 200,  // Intentionally 200 to prevent WebRTC collapse
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
