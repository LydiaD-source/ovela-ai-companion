import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const ALLOWED_EVENTS = ['app_launch', 'chat_open', 'assessment_start'] as const

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))

    const eventName = typeof body?.event_name === 'string' ? body.event_name : 'app_launch'
    if (!ALLOWED_EVENTS.includes(eventName as (typeof ALLOWED_EVENTS)[number])) {
      return new Response(JSON.stringify({ error: 'invalid event_name' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const str = (v: unknown, max = 300) =>
      typeof v === 'string' && v.length ? v.slice(0, max) : null

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )

    const metadata = {
      source: 'ovela',
      app: 'ovela-interactive',
      path: str(body?.path, 500),
      language: str(body?.language, 10),
      referrer: str(body?.referrer, 500),
      session_id: str(body?.session_id, 100),
      user_agent: str(req.headers.get('user-agent'), 400),
      fired_at: new Date().toISOString(),
    }

    // user_events.user_id is NOT NULL; anonymous Ovela site visitors get a
    // stable sentinel id so WG admin can group them as anonymous traffic.


    const { error } = await supabase.from('user_events').insert({
      user_id: '00000000-0000-0000-0000-000000000001',
      user_email: 'anonymous@ovelainteractive.com',
      user_name: 'Ovela Visitor',
      event_type: 'tracking',
      event_name: eventName,
      description: `Ovela ${eventName} on ${metadata.path ?? '/'}`,
      context_mode: 'ovela',
      status: 'new',
      opted_in: false,
      metadata,
    })

    if (error) {
      console.error('ovela-beacon insert failed:', error.message)
      return new Response(JSON.stringify({ error: 'insert failed', details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, event_name: eventName }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('ovela-beacon error:', e)
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
