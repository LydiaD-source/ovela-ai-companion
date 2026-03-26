import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface LeadPayload {
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
  source?: string;
}

async function sendAdminNotification(lead: LeadPayload, leadId: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.warn('⚠️ RESEND_API_KEY not set — skipping admin notification');
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Isabella <onboarding@resend.dev>',
        to: ['support@ovelainteractive.com'],
        subject: `🔔 New ${lead.inquiry_type} Lead — ${lead.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0A0A23, #1a1a3e); padding: 30px; border-radius: 12px; color: white;">
              <h2 style="color: #D4AF37; margin: 0 0 10px;">New Lead from ${lead.source || 'Ovela'}</h2>
              <p style="color: #ccc; margin: 0;">Received via your website</p>
            </div>
            <div style="padding: 25px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #888; width: 120px;">Name</td><td style="padding: 8px 0; font-weight: bold;">${lead.name}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0;"><a href="mailto:${lead.email}" style="color: #D4AF37;">${lead.email}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Type</td><td style="padding: 8px 0;">${lead.inquiry_type}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Source</td><td style="padding: 8px 0;">${lead.source || 'ovela'}</td></tr>
              </table>
              <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                <p style="color: #888; margin: 0 0 8px; font-size: 12px;">MESSAGE</p>
                <p style="margin: 0; line-height: 1.6;">${lead.message}</p>
              </div>
            </div>
            <div style="text-align: center; padding-top: 15px; border-top: 1px solid #eee;">
              <a href="mailto:${lead.email}" style="display: inline-block; background: #D4AF37; color: #0A0A23; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reply to ${lead.name}</a>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('❌ Admin notification failed:', err);
    } else {
      console.log('✅ Admin notification sent');
    }
  } catch (error) {
    console.error('❌ Admin notification error:', error);
  }
}

async function sendUserConfirmation(lead: LeadPayload) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.warn('⚠️ RESEND_API_KEY not set — skipping user confirmation');
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Isabella from Ovela <onboarding@resend.dev>',
        to: [lead.email],
        subject: `Thank you, ${lead.name} — We received your message`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0A0A23, #1a1a3e); padding: 30px; border-radius: 12px; color: white; text-align: center;">
              <h1 style="color: #D4AF37; margin: 0 0 10px; font-size: 24px;">Thank You, ${lead.name}!</h1>
              <p style="color: #ccc; margin: 0;">Your message has been received</p>
            </div>
            <div style="padding: 25px 0; line-height: 1.7;">
              <p>Hi ${lead.name},</p>
              <p>I'm Isabella, your AI ambassador at Ovela Interactive. I've received your inquiry and our team will review it shortly.</p>
              <p>In the meantime, feel free to chat with me directly on our website — I can answer questions about our services, pricing, and how we can help your business.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.ovelainteractive.com/?chat=open" style="display: inline-block; background: #D4AF37; color: #0A0A23; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Chat with Isabella Now</a>
              </div>
              <p style="color: #888; font-size: 13px;">We typically respond within 24 hours during business days (Mon–Fri, 9am–6pm CET).</p>
            </div>
            <div style="border-top: 1px solid #eee; padding-top: 15px; text-align: center; color: #888; font-size: 12px;">
              <p>Ovela Interactive · Andorra La Vella</p>
              <p><a href="https://www.ovelainteractive.com" style="color: #D4AF37;">www.ovelainteractive.com</a></p>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('❌ User confirmation failed:', err);
    } else {
      console.log('✅ User confirmation sent to', lead.email);
    }
  } catch (error) {
    console.error('❌ User confirmation error:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const payload: LeadPayload = await req.json();

    console.log('📨 New lead received:', {
      name: payload.name,
      email: payload.email,
      inquiry_type: payload.inquiry_type,
      source: payload.source || 'ovela'
    });

    if (!payload.name || !payload.email || !payload.inquiry_type || !payload.message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: name, email, inquiry_type, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabase
      .from('crm_leads')
      .insert({
        name: payload.name,
        email: payload.email,
        inquiry_type: payload.inquiry_type,
        message: payload.message,
        source: payload.source || 'ovela'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting lead:', error);
      throw error;
    }

    console.log('✅ Lead captured successfully:', data.id);

    // Send emails in parallel (non-blocking — don't fail the lead capture)
    await Promise.allSettled([
      sendAdminNotification(payload, data.id),
      sendUserConfirmation(payload),
    ]);

    return new Response(
      JSON.stringify({ success: true, message: 'Lead captured successfully', lead_id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in crm-new-lead function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
