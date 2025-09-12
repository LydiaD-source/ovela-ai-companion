import { supabase } from "@/integrations/supabase/client";

export interface WellnessGeniResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class WellnessGeniAPI {
  async sendChatMessage(message: string, persona: string = 'isabella-navia', brand_guide?: string, userId?: string): Promise<WellnessGeniResponse> {
    try {
      const { data: userInfo } = await supabase.auth.getUser();
      const uid = userId ?? userInfo?.user?.id;
      const { data, error } = await supabase.functions.invoke('ovela-chat', {
        body: {
          message,
          prompt: message,
          persona,
          brand_guide,
          userId: uid,
          user_id: uid,
          client_id: 'ovela_client_001'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Chat message error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getPersonaInfo(persona: string = 'isabella-navia'): Promise<WellnessGeniResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('wellness-geni-api', {
        body: {
          action: 'persona-info',
          payload: { persona }
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Persona info error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getServicesInfo(): Promise<WellnessGeniResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('wellness-geni-api', {
        body: {
          action: 'services-info',
          payload: {}
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Services info error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getPricingInfo(): Promise<WellnessGeniResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('wellness-geni-api', {
        body: {
          action: 'pricing-info',
          payload: {}
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Pricing info error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const wellnessGeniAPI = new WellnessGeniAPI();