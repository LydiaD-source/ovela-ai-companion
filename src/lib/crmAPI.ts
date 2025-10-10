import { supabase } from "@/integrations/supabase/client";

export interface LeadData {
  name: string;
  email: string;
  inquiry_type: 'modeling' | 'collaboration' | 'brand' | 'general';
  message: string;
  source?: string;
}

export class CRMAPI {
  async submitLead(leadData: LeadData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📨 Submitting lead to CRM:', leadData);
      
      const { data, error } = await supabase.functions.invoke('crm-new-lead', {
        body: {
          name: leadData.name,
          email: leadData.email,
          inquiry_type: leadData.inquiry_type,
          message: leadData.message,
          source: leadData.source || 'ovela'
        }
      });

      if (error) {
        console.error('❌ CRM API error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Lead submitted successfully:', data);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to submit lead:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const crmAPI = new CRMAPI();