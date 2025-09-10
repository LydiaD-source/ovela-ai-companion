/**
 * Isabella API Service
 * Handles communication with Isabella's backend services
 */

export interface IsabellaMessage {
  id: string;
  text: string;
  sender: 'user' | 'isabella';
  timestamp: Date;
  persona?: string;
}

export interface IsabellaResponse {
  message: string;
  audioUrl?: string;
  videoUrl?: string;
  emotion?: string;
}

class IsabellaAPI {
  private baseUrl: string;

  constructor() {
    // Use your Supabase edge function to proxy requests and avoid CORS
this.baseUrl = 'https://vrpgowcocbztclxfzssu.supabase.co/functions/v1';
  }

  /**
   * Send a message to Isabella and get a response
   */
  async sendMessage(message: string, persona?: string): Promise<IsabellaResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/isabella-basic`, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, persona, source: 'ovela' }),
});

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message to Isabella:', error);
      throw error;
    }
  }

  /**
   * Get Isabella's persona information
   */
  async getPersonaInfo(persona: string = 'isabella-navia') {
    try {
      const response = await fetch(`${this.baseUrl}/api/personas/${persona}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching persona info:', error);
      throw error;
    }
  }

  /**
   * Initialize a guest session
   */
  async initGuestSession(source: string = 'ovela') {
    try {
      const response = await fetch(`${this.baseUrl}/api/guest/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error initializing guest session:', error);
      throw error;
    }
  }
}

export const isabellaAPI = new IsabellaAPI();
export default isabellaAPI;