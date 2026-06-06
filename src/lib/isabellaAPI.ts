/**
 * Isabella API Service
 * Handles communication with Isabella's backend services via Supabase
 */

import { supabase } from "@/integrations/supabase/client";
import type { AssessmentReport } from "@/lib/assessmentReport";

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
  videoSuggestion?: { category: string; count: number };
  assessmentReport?: AssessmentReport | null;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IsabellaAttachment {
  name?: string;
  mime_type: string;
  data_url?: string;
  text?: string;
}

export interface IsabellaContext {
  page_context?: string;
  tool_context?: string;
  authority_topic?: string;
  attachments?: IsabellaAttachment[];
  language?: string;
}

class IsabellaAPI {
  /**
   * Send a message to Isabella and get a response
   */
  async sendMessage(
    message: string,
    persona?: string,
    conversationHistory?: ConversationMessage[],
    context?: IsabellaContext,
  ): Promise<IsabellaResponse> {
    try {
      const { data: userInfo } = await supabase.auth.getUser();
      // Stable per-browser guest id so the 7-day free trial gate tracks the
      // actual person, not the shared "ovela-guest" placeholder. Logged-in
      // users always use their real auth id.
      let guestId = '';
      try {
        guestId = localStorage.getItem('ovela_guest_id') || '';
        if (!guestId) {
          guestId = (crypto?.randomUUID?.() ?? `g_${Date.now()}_${Math.random().toString(36).slice(2)}`);
          localStorage.setItem('ovela_guest_id', guestId);
        }
      } catch { /* storage unavailable */ }
      const uid = userInfo?.user?.id ?? (guestId ? `guest:${guestId}` : 'ovela-guest');

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
          page_context: context?.page_context,
          tool_context: context?.tool_context,
          authority_topic: context?.authority_topic,
          attachments: context?.attachments || [],
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
        emotion: data.emotion,
        videoSuggestion: data.data?.video_suggestion || undefined,
        assessmentReport: data.data?.assessment_report || null,
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