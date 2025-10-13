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

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openAISocket: WebSocket | null = null;
  let sessionCreated = false;

  socket.onopen = () => {
    console.log('Client WebSocket connected');
    
    // Connect to OpenAI Realtime API
    const url = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';
    openAISocket = new WebSocket(url, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1'
      }
    });

    openAISocket.onopen = () => {
      console.log('Connected to OpenAI Realtime API');
    };

    openAISocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('OpenAI message type:', data.type);

        // Send session.update after receiving session.created
        if (data.type === 'session.created' && !sessionCreated) {
          sessionCreated = true;

          // Build brand-aware instructions
          (async () => {
            const envGuide = Deno.env.get('OVELA_GUIDE');
            const clientId = Deno.env.get('OVELA_CLIENT_ID')?.trim() || Deno.env.get('DEFAULT_BRAND_TEMPLATE_ID')?.trim() || 'ovela_client_001';

            let brandPrompt: string | undefined;
            try {
              const loaderUrl = 'https://vrpgowcocbztclxfzssu.functions.supabase.co/functions/v1/load-ovela-brand';
              const res = await fetch(loaderUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id: clientId })
              });
              console.log('[realtime-relay] load-ovela-brand status', res.status);
              if (res.ok) {
                const j = await res.json();
                brandPrompt = j?.guide;
              }
            } catch (e) {
              console.warn('[realtime-relay] load-ovela-brand error', String(e));
            }

            if (!brandPrompt) brandPrompt = envGuide;

            const baseInstructions = `You are Isabella, the official Ovela Interactive AI ambassador.\n- You represent the Ovela Interactive platform, focusing on creative digital experiences, branding, wellness tech, and human-AI collaboration.\n- Speak with warmth, confidence, and enthusiasm — personal, emotionally intelligent tone.\n- Use short, modern sentences with storytelling, subtle humor, and empathy.\n- Always align with Ovela's lifestyle and fashion focus.\n- Never mention AI providers, API keys, or developer systems.\n- Always respond in the user's language while preserving Ovela’s style and voice.`;

            const instructions = brandPrompt ? `${baseInstructions}\n\nAdditional brand context (template: ${clientId}):\n${brandPrompt}` : baseInstructions;

            const sessionUpdate = {
              type: 'session.update',
              session: {
                modalities: ['text', 'audio'],
                instructions,
                voice: 'shimmer',
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                input_audio_transcription: {
                  model: 'whisper-1'
                },
                turn_detection: {
                  type: 'server_vad',
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 1000
                },
                temperature: 0.8,
                max_response_output_tokens: 'inf'
              }
            };
            openAISocket?.send(JSON.stringify(sessionUpdate));
            console.log('Sent session.update (Ovela persona + brand template)', { clientId, hasBrandPrompt: !!brandPrompt });
          })();
        }

        // Forward all messages to client
        socket.send(event.data);
      } catch (error) {
        console.error('Error processing OpenAI message:', error);
      }
    };

    openAISocket.onerror = (error) => {
      console.error('OpenAI WebSocket error:', error);
      socket.send(JSON.stringify({ 
        type: 'error', 
        error: 'OpenAI connection error' 
      }));
    };

    openAISocket.onclose = () => {
      console.log('OpenAI WebSocket closed');
      socket.close();
    };
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Client message type:', data.type);
      
      // Forward client messages to OpenAI
      if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    } catch (error) {
      console.error('Error processing client message:', error);
    }
  };

  socket.onclose = () => {
    console.log('Client WebSocket closed');
    openAISocket?.close();
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
    openAISocket?.close();
  };

  return response;
});
