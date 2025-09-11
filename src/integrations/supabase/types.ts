export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          client_id: string
          created_at: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          revoked_at: string | null
          scopes: Json
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          revoked_at?: string | null
          scopes?: Json
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          revoked_at?: string | null
          scopes?: Json
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage_logs: {
        Row: {
          api_key_id: string
          client_id: string
          created_at: string
          endpoint: string
          id: string
          response_time_ms: number | null
          status_code: number | null
          tokens_used: number | null
        }
        Insert: {
          api_key_id: string
          client_id: string
          created_at?: string
          endpoint: string
          id?: string
          response_time_ms?: number | null
          status_code?: number | null
          tokens_used?: number | null
        }
        Update: {
          api_key_id?: string
          client_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          response_time_ms?: number | null
          status_code?: number | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_usage_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      avatar_videos: {
        Row: {
          audio_url: string | null
          created_at: string
          error_message: string | null
          id: string
          message_id: string
          persona_mode: string
          status: string
          updated_at: string
          user_id: string
          video_id: string | null
          video_url: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_id: string
          persona_mode?: string
          status?: string
          updated_at?: string
          user_id: string
          video_id?: string | null
          video_url?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string
          persona_mode?: string
          status?: string
          updated_at?: string
          user_id?: string
          video_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          chat_session: string | null
          content: string | null
          created_at: string
          id: string
          is_deleted: boolean | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          chat_session?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          chat_session?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          contact_info: Json
          created_at: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          contact_info?: Json
          created_at?: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          contact_info?: Json
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      isabella_reminders: {
        Row: {
          confirmed: boolean | null
          created_at: string
          custom_repeat: string | null
          datetime: string | null
          id: string
          mode: string | null
          offset_minutes: number | null
          repeat: string | null
          repeat_until_confirmed: boolean | null
          status: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          confirmed?: boolean | null
          created_at?: string
          custom_repeat?: string | null
          datetime?: string | null
          id?: string
          mode?: string | null
          offset_minutes?: number | null
          repeat?: string | null
          repeat_until_confirmed?: boolean | null
          status?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          confirmed?: boolean | null
          created_at?: string
          custom_repeat?: string | null
          datetime?: string | null
          id?: string
          mode?: string | null
          offset_minutes?: number | null
          repeat?: string | null
          repeat_until_confirmed?: boolean | null
          status?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_isabella_reminders_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      personas: {
        Row: {
          base_template_id: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          base_template_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          base_template_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          adult_mode_enabled: boolean | null
          avatar: string | null
          created_at: string
          default_mode: string | null
          email: string | null
          full_name: string
          id: string
          notifications_frequency: string | null
          persona_behavior: string | null
          persona_behaviors: Json | null
          preferred_language: string | null
          professional_account: boolean | null
          subscription_tier: string | null
          timezone: string | null
          trial_start_date: string | null
          user_id: string
          username: string | null
          voice: string | null
          voice_enabled: boolean | null
          voice_id: string | null
          voice_style: string | null
        }
        Insert: {
          adult_mode_enabled?: boolean | null
          avatar?: string | null
          created_at?: string
          default_mode?: string | null
          email?: string | null
          full_name: string
          id?: string
          notifications_frequency?: string | null
          persona_behavior?: string | null
          persona_behaviors?: Json | null
          preferred_language?: string | null
          professional_account?: boolean | null
          subscription_tier?: string | null
          timezone?: string | null
          trial_start_date?: string | null
          user_id: string
          username?: string | null
          voice?: string | null
          voice_enabled?: boolean | null
          voice_id?: string | null
          voice_style?: string | null
        }
        Update: {
          adult_mode_enabled?: boolean | null
          avatar?: string | null
          created_at?: string
          default_mode?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notifications_frequency?: string | null
          persona_behavior?: string | null
          persona_behaviors?: Json | null
          preferred_language?: string | null
          professional_account?: boolean | null
          subscription_tier?: string | null
          timezone?: string | null
          trial_start_date?: string | null
          user_id?: string
          username?: string | null
          voice?: string | null
          voice_enabled?: boolean | null
          voice_id?: string | null
          voice_style?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          active: boolean
          client_id: string
          content: Json
          created_at: string
          id: string
          persona_id: string
          updated_at: string
          version: number
        }
        Insert: {
          active?: boolean
          client_id: string
          content?: Json
          created_at?: string
          id?: string
          persona_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          active?: boolean
          client_id?: string
          content?: Json
          created_at?: string
          id?: string
          persona_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "templates_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_isabella_configs: {
        Row: {
          appearance_id: string | null
          behavior_mode: string | null
          created_at: string
          enable_reminders: boolean | null
          id: string
          isabella_name: string | null
          language: string | null
          notifications_enabled: boolean | null
          therapist_id: string | null
          therapy_template_id: string | null
          voice_id: string | null
        }
        Insert: {
          appearance_id?: string | null
          behavior_mode?: string | null
          created_at?: string
          enable_reminders?: boolean | null
          id?: string
          isabella_name?: string | null
          language?: string | null
          notifications_enabled?: boolean | null
          therapist_id?: string | null
          therapy_template_id?: string | null
          voice_id?: string | null
        }
        Update: {
          appearance_id?: string | null
          behavior_mode?: string | null
          created_at?: string
          enable_reminders?: boolean | null
          id?: string
          isabella_name?: string | null
          language?: string | null
          notifications_enabled?: boolean | null
          therapist_id?: string | null
          therapy_template_id?: string | null
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_isabella_configs_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      therapist_reminders: {
        Row: {
          confirmed: boolean | null
          created_at: string
          custom_repeat: string | null
          datetime: string | null
          id: string
          mode: string | null
          offset_minutes: number | null
          repeat: string | null
          repeat_until_confirmed: boolean | null
          status: string | null
          therapist_id: string
          title: string | null
        }
        Insert: {
          confirmed?: boolean | null
          created_at?: string
          custom_repeat?: string | null
          datetime?: string | null
          id?: string
          mode?: string | null
          offset_minutes?: number | null
          repeat?: string | null
          repeat_until_confirmed?: boolean | null
          status?: string | null
          therapist_id: string
          title?: string | null
        }
        Update: {
          confirmed?: boolean | null
          created_at?: string
          custom_repeat?: string | null
          datetime?: string | null
          id?: string
          mode?: string | null
          offset_minutes?: number | null
          repeat?: string | null
          repeat_until_confirmed?: boolean | null
          status?: string | null
          therapist_id?: string
          title?: string | null
        }
        Relationships: []
      }
      therapist_settings: {
        Row: {
          appearance: string | null
          behavior_template: string | null
          created_at: string
          custom_prompt: string | null
          id: string
          language: string | null
          reminders_enabled: boolean | null
          updated_at: string | null
          user_id: string
          voice: string | null
        }
        Insert: {
          appearance?: string | null
          behavior_template?: string | null
          created_at?: string
          custom_prompt?: string | null
          id?: string
          language?: string | null
          reminders_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          voice?: string | null
        }
        Update: {
          appearance?: string | null
          behavior_template?: string | null
          created_at?: string
          custom_prompt?: string | null
          id?: string
          language?: string | null
          reminders_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          voice?: string | null
        }
        Relationships: []
      }
      therapy_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string | null
          system_prompt: string | null
          visible_to_all: boolean | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string | null
          system_prompt?: string | null
          visible_to_all?: boolean | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string | null
          system_prompt?: string | null
          visible_to_all?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "therapy_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_settings: {
        Row: {
          behavior: string | null
          client_id: string
          created_at: string
          id: string
          language: string | null
          persona_id: string
          updated_at: string
          user_id: string
          voice: string | null
        }
        Insert: {
          behavior?: string | null
          client_id: string
          created_at?: string
          id?: string
          language?: string | null
          persona_id: string
          updated_at?: string
          user_id: string
          voice?: string | null
        }
        Update: {
          behavior?: string | null
          client_id?: string
          created_at?: string
          id?: string
          language?: string | null
          persona_id?: string
          updated_at?: string
          user_id?: string
          voice?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_api_key: {
        Args: { api_key: string }
        Returns: {
          client_id: string
          client_name: string
          client_status: string
          scopes: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
