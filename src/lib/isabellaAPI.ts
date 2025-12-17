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

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

class IsabellaAPI {
  /**
   * Send a message to Isabella and get a response
   * @param message - Current user message
   * @param persona - Isabella's persona
   * @param conversationHistory - Previous messages for context (last 10 kept for efficiency)
   * @param language - Language code for response (e.g., 'en-US', 'fr-FR')
   */
  async sendMessage(
    message: string, 
    persona?: string,
    conversationHistory?: ConversationMessage[],
    language?: string
  ): Promise<IsabellaResponse> {
    try {
      const { data: userInfo } = await supabase.auth.getUser();
      const uid = userInfo?.user?.id ?? 'ovela-guest';
      
      // Keep only last 10 messages for efficiency
      const recentHistory = conversationHistory?.slice(-10) || [];
      
      const { data, error } = await supabase.functions.invoke('ovela-chat', {
        body: {
          prompt: message,
          client_id: 'ovela_client_001',
          user_id: uid,
          persona: persona || 'isabella-navia',
          source: 'ovela',
          context: 'ovela-interactive',
          conversation_history: recentHistory,
          language: language || 'en-US'
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
   * Get Isabella's persona information
   */
  async getPersonaInfo(persona: string = 'isabella-navia') {
    return {
      name: 'Isabella Navia',
      persona: persona,
      description: 'AI model and brand ambassador for Ovela Interactive'
    };
  }

  /**
   * Initialize a guest session
   */
  async initGuestSession(source: string = 'ovela') {
    return { success: true, source };
  }
}

export const isabellaAPI = new IsabellaAPI();
export default isabellaAPI;