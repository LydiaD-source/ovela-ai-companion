import { supabase } from '@/integrations/supabase/client';

export interface HeyGenStreamingSession {
  sessionId: string;
  sdp: string;
  iceServers: RTCIceServer[];
}

export class HeyGenAPIClient { private sessionToken?: string;
  async createSessionToken(): Promise<string> {
    const { data, error } = await supabase.functions.invoke('heygen-proxy', {
      body: {
        action: 'create_token',
        payload: {}
      }
    });
    if (error) throw error;
    const token = data?.data?.token || data?.token;
    if (!token) throw new Error('No session token received');
    this.sessionToken = token;
    return token;
  }

  async createStreamingSession(
    avatarId?: string,
    elevenLabsVoiceId?: string,
    sessionToken?: string
  ): Promise<HeyGenStreamingSession> {
    const token = sessionToken ?? this.sessionToken;
    const { data, error } = await supabase.functions.invoke('heygen-proxy', {
      body: {
        action: 'create_streaming_session',
        payload: {
          avatarId: avatarId || 'Angela-inblackskirt-20220820',
          avatarName: avatarId || 'Angela-inblackskirt-20220820',
          elevenLabsVoiceId: elevenLabsVoiceId || 't0IcnDolatli2xhqgLgn',
          ...(token ? { session_token: token, version: 'v2' } : {})
        }
      }
    });

    if (error) throw error;
    if (!data.data) throw new Error('No session data received');

    return {
      sessionId: data.data.session_id,
      sdp: data.data.sdp || data.data.offer_sdp || '',
      iceServers: data.data.ice_servers2 || data.data.ice_servers || []
    };
  }

  async startSession(sessionId: string, sdp: string): Promise<void> {
    const { error } = await supabase.functions.invoke('heygen-proxy', {
      body: {
        action: 'start_session',
        payload: {
          session_id: sessionId,
          sdp,
          ...(this.sessionToken ? { session_token: this.sessionToken } : {})
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
          text,
          ...(this.sessionToken ? { session_token: this.sessionToken } : {})
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
          session_id: sessionId,
          ...(this.sessionToken ? { session_token: this.sessionToken } : {})
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
          candidate: candidate.toJSON(),
          ...(this.sessionToken ? { session_token: this.sessionToken } : {})
        }
      }
    });

    if (error) throw error;
  }
}

export const heygenClient = new HeyGenAPIClient();
