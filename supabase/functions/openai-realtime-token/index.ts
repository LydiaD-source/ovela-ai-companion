import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: simple in-memory store (use Redis in production)
const tokenRequests = new Map<string, number[]>();

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userRequests = tokenRequests.get(userId) || [];
  
  // Clean old requests (older than 1 minute)
  const recentRequests = userRequests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= 4) {
    console.warn(`Rate limit exceeded for user ${userId}`);
    return false;
  }
  
  recentRequests.push(now);
  tokenRequests.set(userId, recentRequests);
  return true;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Simple auth check (you can enhance with actual session validation)
    const authHeader = req.headers.get('authorization');
    const userId = authHeader ? 'authenticated-user' : 'anonymous'; // Simplify for now
    
    // Rate limiting
    if (!checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({ 
          error: 'rate_limit_exceeded',
          fallback: true,
          message: 'Too many token requests. Please try again in a moment.'
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🎫 Issuing ephemeral token for user:', userId);

    // Request ephemeral session token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        // Transcription-focused configuration
        modalities: ["text", "audio"],
        instructions: "You are a helpful voice assistant. Transcribe user speech accurately.",
        input_audio_transcription: {
          model: "whisper-1"
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI token request failed:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'token_issue',
          fallback: true,
          message: 'Could not obtain realtime session. Using fallback mode.'
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('✅ Ephemeral token issued successfully');

    return new Response(
      JSON.stringify({
        token: data.client_secret?.value || data.token,
        expires_at: data.expires_at,
        model: data.model,
        session_id: data.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in openai-realtime-token:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        fallback: true,
        message: 'Service temporarily unavailable. Using fallback mode.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
