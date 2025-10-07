import { supabase } from '@/integrations/supabase/client';

export interface HeyGenStreamingSession {
  sessionId: string;
  sdp: string;
  iceServers: RTCIceServer[];
}

export class HeyGenAPIClient {
  async createStreamingSession(avatarId?: string): Promise<HeyGenStreamingSession> {
    const { data, error } = await supabase.functions.invoke('heygen-proxy', {
      body: {
        action: 'create_streaming_session',
        payload: {
          avatarId: avatarId || 'Angela-inblackskirt-20220820'
        }
      }
    });

    if (error) throw error;
    if (!data.data) throw new Error('No session data received');

    return {
      sessionId: data.data.session_id,
      sdp: data.data.sdp,
      iceServers: data.data.ice_servers2 || []
    };
  }

  async startSession(sessionId: string, sdp: string): Promise<void> {
    const { error } = await supabase.functions.invoke('heygen-proxy', {
      body: {
        action: 'start_session',
        payload: {
          session_id: sessionId,
          sdp
        }
      }
    });

    if (error) throw error;
  }

  async sendTask(sessionId: string, text: string): Promise<void> {
    const { error } = await supabase.functions.invoke('heygen-proxy', {
      body: {
        action: 'send_task',
        payload: {
          session_id: sessionId,
          text
        }
      }
    });

    if (error) throw error;
  }

  async stopSession(sessionId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('heygen-proxy', {
      body: {
        action: 'stop_session',
        payload: {
          session_id: sessionId
        }
      }
    });

    if (error) throw error;
  }

  async sendICE(sessionId: string, candidate: RTCIceCandidate): Promise<void> {
    const { error } = await supabase.functions.invoke('heygen-proxy', {
      body: {
        action: 'send_ice',
        payload: {
          session_id: sessionId,
          candidate: candidate.toJSON()
        }
      }
    });

    if (error) throw error;
  }
}

export const heygenClient = new HeyGenAPIClient();
