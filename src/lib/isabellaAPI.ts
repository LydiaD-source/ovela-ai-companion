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
    // Use Supabase proxy to avoid CORS issues
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      this.baseUrl = `${supabaseUrl}/functions/v1`;
    } else {
      // Fallback to direct API for now
      this.baseUrl = 'https://isabela-soul-connect.lovable.app/api';
    }
  }

  /**
   * Send a message to Isabella and get a response
   */
  async sendMessage(message: string, persona?: string): Promise<IsabellaResponse> {
    try {
      const endpoint = this.baseUrl.includes('functions/v1') ? 'isabella-chat' : 'chat';
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          persona: persona || 'isabella-navia',
          source: 'ovela'
        }),
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