/**
 * HeyGen API Integration
 * Documentation: https://docs.heygen.com/docs/streaming-api
 * 
 * HeyGen provides AI-powered video avatars with real-time streaming capabilities.
 * This is configured for Isabella's avatar integration.
 */

export interface HeyGenConfig {
  apiKey: string;
  avatarId: string;
  voiceId: string;
}

export interface HeyGenStreamingSession {
  sessionId: string;
  sdp: string;
  iceServers: any[];
}

export class HeyGenAPI {
  private apiKey: string;
  private baseUrl = 'https://api.heygen.com/v1';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Create a new streaming session for Isabella
   * @param avatarId - HeyGen avatar ID for Isabella
   * @param voiceId - Voice ID to use (optional, defaults to avatar's voice)
   * @returns Session details including SDP for WebRTC connection
   */
  async createStreamingSession(
    avatarId: string,
    voiceId?: string
  ): Promise<HeyGenStreamingSession> {
    const response = await fetch(`${this.baseUrl}/streaming.new`, {
      method: 'POST',
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        avatar_id: avatarId,
        voice: voiceId ? { voice_id: voiceId } : undefined,
        quality: 'high',
        version: 'v2'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HeyGen API error: ${error}`);
    }

    const data = await response.json();
    return {
      sessionId: data.data.session_id,
      sdp: data.data.sdp,
      iceServers: data.data.ice_servers2 || []
    };
  }

  /**
   * Send text to the streaming avatar for speech
   * @param sessionId - Active session ID
   * @param text - Text for avatar to speak
   */
  async sendTask(sessionId: string, text: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/streaming.task`, {
      method: 'POST',
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        text: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HeyGen task error: ${error}`);
    }
  }

  /**
   * Start the streaming session
   * @param sessionId - Session ID to start
   * @param sdp - SDP answer from client
   */
  async startSession(sessionId: string, sdp: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/streaming.start`, {
      method: 'POST',
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        sdp: sdp,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HeyGen start error: ${error}`);
    }
  }

  /**
   * Stop and close the streaming session
   * @param sessionId - Session ID to stop
   */
  async stopSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/streaming.stop`, {
      method: 'POST',
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HeyGen stop error: ${error}`);
    }
  }

  /**
   * Send ICE candidate for WebRTC connection
   * @param sessionId - Active session ID
   * @param candidate - ICE candidate object
   */
  async sendICE(sessionId: string, candidate: RTCIceCandidate): Promise<void> {
    const response = await fetch(`${this.baseUrl}/streaming.ice`, {
      method: 'POST',
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        candidate: candidate.toJSON(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HeyGen ICE error: ${error}`);
    }
  }
}

/**
 * Example usage for Isabella:
 * 
 * const heygenAPI = new HeyGenAPI(process.env.HEYGEN_API_KEY);
 * const session = await heygenAPI.createStreamingSession(
 *   'ISABELLA_AVATAR_ID',
 *   'ISABELLA_VOICE_ID'
 * );
 * 
 * // Set up WebRTC connection with session.sdp and session.iceServers
 * // Then start the session:
 * await heygenAPI.startSession(session.sessionId, clientSDP);
 * 
 * // Send text for Isabella to speak:
 * await heygenAPI.sendTask(session.sessionId, "Hello! I'm Isabella...");
 * 
 * // When done:
 * await heygenAPI.stopSession(session.sessionId);
 */
