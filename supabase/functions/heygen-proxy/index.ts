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
        body = {
          avatar_id: payload.avatarId || 'Angela-inblackskirt-20220820',
          quality: 'high',
          version: 'v2',
          ...payload
        };
        break;
      
      case 'start_session':
        endpoint = 'https://api.heygen.com/v1/streaming.start';
        break;
      
      case 'send_task':
        endpoint = 'https://api.heygen.com/v1/streaming.task';
        break;
      
      case 'stop_session':
        endpoint = 'https://api.heygen.com/v1/streaming.stop';
        break;
      
      case 'send_ice':
        endpoint = 'https://api.heygen.com/v1/streaming.ice';
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json',
      },
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
