import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!HEYGEN_API_KEY) {
      throw new Error('HEYGEN_API_KEY not configured');
    }

    const { action, payload } = await req.json();
    console.log('HeyGen proxy action:', action);

    let endpoint = '';
    let method = 'POST';
    let body: any = payload;

    switch (action) {
      case 'create_streaming_session':
        endpoint = 'https://api.heygen.com/v1/streaming.new';
        
        // Build voice configuration for ElevenLabs
        const voiceConfig: any = {};
        
        // If ElevenLabs API key is available, use Isabella's custom voice
        if (ELEVENLABS_API_KEY && payload.elevenLabsVoiceId) {
          voiceConfig.voice_id = payload.elevenLabsVoiceId; // Isabella's ElevenLabs voice ID
          voiceConfig.rate = 1.0;
        }
        
        body = {
          quality: payload.quality || 'high',
          // V2 prefers avatarName; keep avatar_id for backward compatibility
          avatar_id: payload.avatarId || 'Angela-inblackskirt-20220820',
          avatarName: payload.avatarName || payload.avatarId || 'Angela-inblackskirt-20220820',
          ...(payload.session_token ? { version: payload.version || 'v2' } : {}),
          ...(Object.keys(voiceConfig).length > 0 && { voice: voiceConfig })
        };
        break;
      
      case 'start_session':
        endpoint = 'https://api.heygen.com/v1/streaming.start';
        break;
      
      case 'send_task':
        endpoint = 'https://api.heygen.com/v1/streaming.task';
        // Add task_type to make avatar speak with movements
        body = {
          ...payload,
          task_type: payload.task_type || 'repeat', // 'repeat' for text-to-speech with gestures
          task_mode: payload.task_mode || 'sync'
        };
        break;
      
      case 'stop_session':
        endpoint = 'https://api.heygen.com/v1/streaming.stop';
        break;
      
      case 'send_ice':
        endpoint = 'https://api.heygen.com/v1/streaming.ice';
        break;
      
      case 'create_token':
        endpoint = 'https://api.heygen.com/v1/streaming.create_token';
        body = {};
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Build headers dynamically: use Bearer token for v2 (session token), else x-api-key
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (action === 'create_streaming_session' && payload?.session_token) {
      headers['Authorization'] = `Bearer ${payload.session_token}`;
    } else {
      headers['x-api-key'] = HEYGEN_API_KEY;
    }
    
    // Add ElevenLabs API key if available (for custom voices)
    if (ELEVENLABS_API_KEY && action === 'create_streaming_session') {
      headers['elevenlabs-api-key'] = ELEVENLABS_API_KEY;
    }
    
    const response = await fetch(endpoint, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('HeyGen API error:', error);
      throw new Error(`HeyGen API error: ${error}`);
    }

    const data = await response.json();
    console.log('HeyGen response:', data);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('HeyGen proxy error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
