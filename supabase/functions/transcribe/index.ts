import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper: read file from either multipart form-data or JSON base64
async function readAudioFromRequest(req: Request): Promise<Blob> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (file && file instanceof File) {
      return file;
    }
    throw new Error("No 'file' found in multipart form-data");
  }

  // JSON fallback: { audio: base64 }
  const body = await req.json().catch(() => ({} as any));
  const base64 = body?.audio as string | undefined;
  if (!base64) throw new Error("No audio provided");

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: "audio/webm" });
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    // Read audio
    const audioBlob = await readAudioFromRequest(req);

    // Prepare multipart form for OpenAI
    const form = new FormData();
    form.append("file", new File([audioBlob], "recording.webm", { type: audioBlob.type || "audio/webm" }));
    // Use GPT-4o Mini transcription model as requested
    form.append("model", "gpt-4o-mini-transcribe");

    // Optional: language passthrough
    const url = new URL(req.url);
    const lang = url.searchParams.get("language");
    if (lang) form.append("language", lang);

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: form,
    });

    if (!r.ok) {
      const t = await r.text();
      console.error("Transcribe error:", r.status, t);
      return new Response(JSON.stringify({ success: false, error: "Speech-to-text failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const text = data?.text ?? "";

    return new Response(JSON.stringify({ success: true, text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("STT Error", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
