// Server-side usage beacon: reports Ovela app activity into the shared
// `user_events` table so it appears in the WellnessGeni admin tracking view.
// Independent of GA4/cookie consent (no cookies, no personal data stored).

import { supabase } from '@/integrations/supabase/client';

type BeaconEvent = 'app_launch' | 'chat_open' | 'assessment_start';

const SESSION_KEY = 'ovela_beacon_session';
const SENT_KEY_PREFIX = 'ovela_beacon_sent:';

const getSessionId = (): string => {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'no-session';
  }
};

/** Fire a usage beacon. Fails silently — never blocks the UI. */
export const sendBeacon = async (
  eventName: BeaconEvent,
  extra: Record<string, string> = {}
): Promise<void> => {
  if (typeof window === 'undefined') return;
  try {
    await supabase.functions.invoke('ovela-beacon', {
      body: {
        event_name: eventName,
        path: window.location.pathname,
        language: document.documentElement.lang || navigator.language,
        referrer: document.referrer || '',
        session_id: getSessionId(),
        ...extra,
      },
    });
  } catch (err) {
    console.debug('[beacon] skipped:', err);
  }
};

/** Fire once per browser session (used for app_launch). */
export const sendBeaconOncePerSession = (
  eventName: BeaconEvent,
  extra: Record<string, string> = {}
): void => {
  try {
    const key = `${SENT_KEY_PREFIX}${eventName}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    /* storage blocked — still send */
  }
  void sendBeacon(eventName, extra);
};

export const trackAppLaunch = () => sendBeaconOncePerSession('app_launch');
export const trackChatOpen = () => void sendBeacon('chat_open');
export const trackAssessmentStart = (tool: string) =>
  void sendBeacon('assessment_start', { tool });
