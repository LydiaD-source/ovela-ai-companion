// Sends a generated Isabella assessment PDF as an email attachment via Resend.
// The PDF itself is generated client-side and sent here as base64.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface Payload {
  email: string;
  name?: string;
  report_type: 'nutrition_assessment' | 'recovery_resilience';
  pdf_base64: string;
  filename?: string;
}

const TITLES: Record<string, string> = {
  nutrition_assessment: 'Executive Nutrition & Muscle Preservation Assessment',
  recovery_resilience: 'Executive Recovery & Resilience Assessment',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ success: false, error: 'RESEND_API_KEY missing' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = (await req.json()) as Payload;
    const { email, name, report_type, pdf_base64 } = payload || ({} as Payload);

    if (!email || !pdf_base64 || !report_type) {
      return new Response(JSON.stringify({ success: false, error: 'Missing email, report_type, or pdf_base64' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid email' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const title = TITLES[report_type] || 'Your Assessment Report';
    const filename = (payload.filename || `isabella-${report_type}-${new Date().toISOString().slice(0, 10)}.pdf`).replace(/[^a-z0-9_\-\.]/gi, '_');
    const greeting = name ? `Dear ${name},` : 'Hello,';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Isabella Navia <isabella.navia@ovelainteractive.com>',
        to: [email],
        bcc: ['isabella.navia@ovelainteractive.com'],
        subject: `Your ${title} — Ovela Interactive`,
        html: `
          <div style="font-family: Georgia, serif; max-width:600px; margin:0 auto; background:#ffffff;">
            <div style="background:linear-gradient(135deg,#0A0A23,#1a1a3e);padding:35px 30px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="color:#D4AF37;margin:0 0 6px;font-size:24px;">Ovela Interactive</h1>
              <p style="color:#aaa;margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;">AI-Powered Digital Experiences</p>
            </div>
            <div style="padding:30px;color:#333;line-height:1.7;font-size:15px;">
              <p>${greeting}</p>
              <p>As promised, here is your personalised <strong>${title}</strong>, attached as a PDF.</p>
              <p>This report is educational and informational only — it is not a medical diagnosis. Use it as a clear starting point and revisit it whenever you adjust your routine.</p>
              <p>If you'd like to go deeper, I'm available on our website any time to walk through priorities or recommend a next step with our wellness partners.</p>
              <p style="margin-top:25px;">Warm regards,<br/><strong style="color:#0A0A23;">Isabella Navia</strong><br/><span style="color:#888;font-size:13px;">AI Ambassador · Ovela Interactive</span></p>
            </div>
            <div style="background:#f8f8f8;padding:15px 30px;border-radius:0 0 12px 12px;text-align:center;">
              <a href="https://www.ovelainteractive.com" style="color:#D4AF37;text-decoration:none;font-size:12px;">www.ovelainteractive.com</a>
            </div>
          </div>
        `,
        attachments: [
          { filename, content: pdf_base64 },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('❌ Resend error:', err);
      return new Response(JSON.stringify({ success: false, error: err }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('email-assessment-report error:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
