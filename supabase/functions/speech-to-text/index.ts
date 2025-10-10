import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio, mimeType } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    const OPENAI_API_KEY = (Deno.env.get('OPENAI_API_KEY') || '').trim();
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    console.log('🎙️ Transcribing audio...', { mimeType: mimeType || 'audio/webm' });
    console.log('🔐 OpenAI key length:', OPENAI_API_KEY.length);

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    console.log(`📊 Audio size: ${binaryAudio.length} bytes`);
    
    // Prepare blob once
    const blob = new Blob([binaryAudio], { type: mimeType || 'audio/webm' });

    // Prefer ElevenLabs STT if key is available
    const ELEVENLABS_API_KEY = (Deno.env.get('ELEVENLABS_API_KEY') || '').trim();
    if (ELEVENLABS_API_KEY) {
      try {
        console.log('🟢 Using ElevenLabs STT (scribe_v1)');
        const elForm = new FormData();
        elForm.append('model_id', 'scribe_v1');
        elForm.append('file', blob, 'audio.webm');
        const elResp = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
          method: 'POST',
          headers: { 'xi-api-key': ELEVENLABS_API_KEY },
          body: elForm,
        });
        if (elResp.ok) {
          const elJson = await elResp.json();
          // Best-effort text extraction across possible shapes
          const text = elJson?.text
            || elJson?.transcript
            || (Array.isArray(elJson?.transcripts) && elJson.transcripts.map((t: any) => t?.text).filter(Boolean).join(' '))
            || (Array.isArray(elJson?.results) && elJson.results.map((r: any) => r?.text).filter(Boolean).join(' '))
            || '';
          console.log('✅ ElevenLabs transcription received:', text?.slice(0, 120));
          if (text && text.trim().length > 0) {
            return new Response(
              JSON.stringify({ success: true, text }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          console.warn('⚠️ ElevenLabs response missing text field:', elJson);
        } else {
          const t = await elResp.text();
          console.error('❌ ElevenLabs STT error:', elResp.status, t);
        }
      } catch (e) {
        console.error('❌ ElevenLabs STT request failed:', e);
      }
    } else {
      console.log('ℹ️ ELEVENLABS_API_KEY not set, falling back to OpenAI Whisper');
    }

    // Fallback to OpenAI Whisper API
    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API error', status: response.status, details: errorText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('✅ Transcription received (OpenAI):', result.text);

    return new Response(
      JSON.stringify({ success: true, text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Speech-to-text error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
