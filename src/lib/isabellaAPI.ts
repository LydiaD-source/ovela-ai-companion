/**
 * Isabella API Service
 * Handles communication with Isabella's backend services via Supabase
 */

import { supabase } from "@/integrations/supabase/client";

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
  /**
   * Send a message to Isabella and get a response
   */
  async sendMessage(message: string, persona?: string): Promise<IsabellaResponse> {
    try {
      const { data: userInfo } = await supabase.auth.getUser();
      const uid = userInfo?.user?.id ?? 'ovela-guest';
      
      const { data, error } = await supabase.functions.invoke('ovela-chat', {
        body: {
          prompt: message,
          client_id: 'ovela_client_001',
          user_id: uid,
          brand_guide: null,
          source: 'ovela',
          context: 'ovela-interactive'
        }
      });

      if (error) {
        throw new Error(`Supabase function error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.message || 'Failed to get response from Isabella');
      }

      return {
        message: data.message || '',
        audioUrl: data.audioUrl,
        videoUrl: data.videoUrl,
        emotion: data.emotion
      };
    } catch (error) {
      console.error('Error sending message to Isabella:', error);
      throw error;
    }
  }

  /**
   * Get Isabella's persona information (placeholder - not implemented yet)
   */
  async getPersonaInfo(persona: string = 'isabella-navia') {
    try {
      // For now, return basic persona info
      return {
        name: 'Isabella Navia',
        persona: persona,
        description: 'AI model and brand ambassador for Ovela Interactive'
      };
    } catch (error) {
      console.error('Error fetching persona info:', error);
      throw error;
    }
  }

  /**
   * Initialize a guest session (placeholder - not needed with Supabase)
   */
  async initGuestSession(source: string = 'ovela') {
    try {
      // For now, return success status
      return { success: true, source };
    } catch (error) {
      console.error('Error initializing guest session:', error);
      throw error;
    }
  }
}

export const isabellaAPI = new IsabellaAPI();
export default isabellaAPI;