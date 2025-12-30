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
      access_attempts: {
        Row: {
          attempt_type: string
          blocked_reason: string | null
          created_at: string
          email: string
          id: string
          ip_address: unknown
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempt_type: string
          blocked_reason?: string | null
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempt_type?: string
          blocked_reason?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown
          success?: boolean
          user_agent?: string | null
        }
        Relationships: []
      }
      access_trace_log: {
        Row: {
          created_at: string
          details: Json | null
          email: string | null
          event: string
          id: string
          level: string
          path: string | null
          request_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          email?: string | null
          event: string
          id?: string
          level: string
          path?: string | null
          request_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          email?: string | null
          event?: string
          id?: string
          level?: string
          path?: string | null
          request_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      admin_invites: {
        Row: {
          accepted_at: string | null
          consumed: boolean | null
          consumed_at: string | null
          created_at: string
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          status: string
          tier: string
          token_used_by_id: string | null
          used_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          consumed?: boolean | null
          consumed_at?: string | null
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          status?: string
          tier?: string
          token_used_by_id?: string | null
          used_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          consumed?: boolean | null
          consumed_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          status?: string
          tier?: string
          token_used_by_id?: string | null
          used_at?: string | null
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
      appearance_options: {
        Row: {
          active: boolean
          category: string
          created_at: string
          did_agent_id: string | null
          did_registered_at: string | null
          display_order: number | null
          id: string
          image_url: string
          label: string
          tier: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          did_agent_id?: string | null
          did_registered_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          label: string
          tier?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          did_agent_id?: string | null
          did_registered_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          label?: string
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      authorized_users: {
        Row: {
          added_at: string
          added_by: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          notes: string | null
          updated_at: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          notes?: string | null
          updated_at?: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
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
      brand_guides: {
        Row: {
          active: boolean
          client_id: string
          client_name: string
          created_at: string
          created_by: string | null
          guide_content: string
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          client_id: string
          client_name: string
          created_at?: string
          created_by?: string | null
          guide_content: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          client_id?: string
          client_name?: string
          created_at?: string
          created_by?: string | null
          guide_content?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
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
          user_id: string
        }
        Insert: {
          chat_session?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          role?: string | null
          user_id: string
        }
        Update: {
          chat_session?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          role?: string | null
          user_id?: string
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
      crm_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          inquiry_type: string
          message: string
          name: string
          source: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          inquiry_type: string
          message: string
          name: string
          source?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          inquiry_type?: string
          message?: string
          name?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_persona_access_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          custom_persona_id: string
          id: string
          metadata: Json | null
          notes: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          custom_persona_id: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          custom_persona_id?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_persona_access_log_custom_persona_id_fkey"
            columns: ["custom_persona_id"]
            isOneToOne: false
            referencedRelation: "custom_personas"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_persona_avatars: {
        Row: {
          active: boolean | null
          cloudinary_id: string
          cloudinary_url: string | null
          created_at: string
          custom_persona_id: string
          id: string
          is_primary: boolean | null
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          cloudinary_id: string
          cloudinary_url?: string | null
          created_at?: string
          custom_persona_id: string
          id?: string
          is_primary?: boolean | null
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          cloudinary_id?: string
          cloudinary_url?: string | null
          created_at?: string
          custom_persona_id?: string
          id?: string
          is_primary?: boolean | null
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_persona_avatars_custom_persona_id_fkey"
            columns: ["custom_persona_id"]
            isOneToOne: false
            referencedRelation: "custom_personas"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_persona_behaviors: {
        Row: {
          active: boolean | null
          created_at: string
          custom_persona_id: string
          display_name: string
          display_order: number | null
          id: string
          system_prompt: string
          template_name: string
          tier: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          custom_persona_id: string
          display_name: string
          display_order?: number | null
          id?: string
          system_prompt: string
          template_name: string
          tier?: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          custom_persona_id?: string
          display_name?: string
          display_order?: number | null
          id?: string
          system_prompt?: string
          template_name?: string
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_persona_behaviors_custom_persona_id_fkey"
            columns: ["custom_persona_id"]
            isOneToOne: false
            referencedRelation: "custom_personas"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_persona_memory_packs: {
        Row: {
          active: boolean | null
          created_at: string
          custom_persona_id: string
          expires_at: string | null
          id: string
          purchased_at: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          custom_persona_id: string
          expires_at?: string | null
          id?: string
          purchased_at?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          custom_persona_id?: string
          expires_at?: string | null
          id?: string
          purchased_at?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_persona_memory_packs_custom_persona_id_fkey"
            columns: ["custom_persona_id"]
            isOneToOne: false
            referencedRelation: "custom_personas"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_persona_versions: {
        Row: {
          changes_summary: string | null
          created_at: string
          created_by_admin_id: string
          custom_persona_id: string
          id: string
          snapshot: Json
          version_number: number
        }
        Insert: {
          changes_summary?: string | null
          created_at?: string
          created_by_admin_id: string
          custom_persona_id: string
          id?: string
          snapshot: Json
          version_number: number
        }
        Update: {
          changes_summary?: string | null
          created_at?: string
          created_by_admin_id?: string
          custom_persona_id?: string
          id?: string
          snapshot?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "custom_persona_versions_custom_persona_id_fkey"
            columns: ["custom_persona_id"]
            isOneToOne: false
            referencedRelation: "custom_personas"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_persona_voices: {
        Row: {
          active: boolean | null
          created_at: string
          custom_persona_id: string
          id: string
          settings: Json | null
          updated_at: string
          voice_id: string
          voice_name: string | null
          voice_provider: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          custom_persona_id: string
          id?: string
          settings?: Json | null
          updated_at?: string
          voice_id: string
          voice_name?: string | null
          voice_provider?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          custom_persona_id?: string
          id?: string
          settings?: Json | null
          updated_at?: string
          voice_id?: string
          voice_name?: string | null
          voice_provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_persona_voices_custom_persona_id_fkey"
            columns: ["custom_persona_id"]
            isOneToOne: false
            referencedRelation: "custom_personas"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_personas: {
        Row: {
          avatar_cloudinary_id: string | null
          base_persona_id: string | null
          created_at: string
          created_by_admin_id: string | null
          id: string
          ip_agreed_at: string | null
          ip_agreement_version: string | null
          is_active: boolean | null
          is_locked: boolean | null
          name: string
          persona_metadata: Json | null
          updated_at: string
          user_id: string
          voice_template_id: string | null
        }
        Insert: {
          avatar_cloudinary_id?: string | null
          base_persona_id?: string | null
          created_at?: string
          created_by_admin_id?: string | null
          id?: string
          ip_agreed_at?: string | null
          ip_agreement_version?: string | null
          is_active?: boolean | null
          is_locked?: boolean | null
          name: string
          persona_metadata?: Json | null
          updated_at?: string
          user_id: string
          voice_template_id?: string | null
        }
        Update: {
          avatar_cloudinary_id?: string | null
          base_persona_id?: string | null
          created_at?: string
          created_by_admin_id?: string | null
          id?: string
          ip_agreed_at?: string | null
          ip_agreement_version?: string | null
          is_active?: boolean | null
          is_locked?: boolean | null
          name?: string
          persona_metadata?: Json | null
          updated_at?: string
          user_id?: string
          voice_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_personas_base_persona_id_fkey"
            columns: ["base_persona_id"]
            isOneToOne: false
            referencedRelation: "main_persona_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_personas_voice_template_id_fkey"
            columns: ["voice_template_id"]
            isOneToOne: false
            referencedRelation: "voice_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      debug_env: {
        Row: {
          created_at: string | null
          id: number
          key_prefix: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          key_prefix?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          key_prefix?: string | null
        }
        Relationships: []
      }
      did_streaming_diagnostics: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          request_body: Json | null
          request_headers: Json | null
          request_id: string | null
          response_body: Json | null
          response_status: number | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          request_body?: Json | null
          request_headers?: Json | null
          request_id?: string | null
          response_body?: Json | null
          response_status?: number | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          request_body?: Json | null
          request_headers?: Json | null
          request_id?: string | null
          response_body?: Json | null
          response_status?: number | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_text: string
          created_at: string | null
          id: string
          notes: string | null
          subject_line: string
          template_key: string
          template_name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          body_text: string
          created_at?: string | null
          id?: string
          notes?: string | null
          subject_line: string
          template_key: string
          template_name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          body_text?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          subject_line?: string
          template_key?: string
          template_name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      feature_locks: {
        Row: {
          created_at: string
          description: string | null
          feature_key: string
          feature_name: string
          id: string
          is_active: boolean
          required_tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          feature_key: string
          feature_name: string
          id?: string
          is_active?: boolean
          required_tier: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          feature_key?: string
          feature_name?: string
          id?: string
          is_active?: boolean
          required_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      invite_links: {
        Row: {
          active: boolean | null
          code: string
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          max_uses: number | null
          status: string | null
          type: string | null
          updated_at: string
          used: boolean | null
          uses: number | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string
          created_by?: string | null
          email: string
          expires_at: string
          id?: string
          max_uses?: number | null
          status?: string | null
          type?: string | null
          updated_at?: string
          used?: boolean | null
          uses?: number | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          max_uses?: number | null
          status?: string | null
          type?: string | null
          updated_at?: string
          used?: boolean | null
          uses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      isabella_license_agreements: {
        Row: {
          agreed_at: string
          created_at: string
          id: string
          ip_address: unknown
          license_version: string
          pack_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          agreed_at?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          license_version?: string
          pack_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          agreed_at?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          license_version?: string
          pack_type?: string
          user_agent?: string | null
          user_id?: string
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
      legal_documents: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          type: string
          updated_at: string
          url: string | null
          version: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          type: string
          updated_at?: string
          url?: string | null
          version: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          type?: string
          updated_at?: string
          url?: string | null
          version?: string
        }
        Relationships: []
      }
      main_persona_templates: {
        Row: {
          active_status: boolean
          core_prompt: string
          created_at: string
          default_behavior: string | null
          default_voice: string | null
          description: string | null
          display_name: string
          display_order: number | null
          id: string
          persona_name: string
          tier: string
          updated_at: string
        }
        Insert: {
          active_status?: boolean
          core_prompt: string
          created_at?: string
          default_behavior?: string | null
          default_voice?: string | null
          description?: string | null
          display_name: string
          display_order?: number | null
          id?: string
          persona_name: string
          tier?: string
          updated_at?: string
        }
        Update: {
          active_status?: boolean
          core_prompt?: string
          created_at?: string
          default_behavior?: string | null
          default_voice?: string | null
          description?: string | null
          display_name?: string
          display_order?: number | null
          id?: string
          persona_name?: string
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      memory_consent_audit: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_consent_audit_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      persona_templates: {
        Row: {
          active_status: boolean
          category: string
          created_at: string
          description: string | null
          display_name: string
          display_order: number | null
          id: string
          main_persona_id: string | null
          mode: string
          system_prompt: string
          template_name: string
          tier: string
          updated_at: string
        }
        Insert: {
          active_status?: boolean
          category: string
          created_at?: string
          description?: string | null
          display_name: string
          display_order?: number | null
          id?: string
          main_persona_id?: string | null
          mode: string
          system_prompt: string
          template_name: string
          tier?: string
          updated_at?: string
        }
        Update: {
          active_status?: boolean
          category?: string
          created_at?: string
          description?: string | null
          display_name?: string
          display_order?: number | null
          id?: string
          main_persona_id?: string | null
          mode?: string
          system_prompt?: string
          template_name?: string
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "persona_templates_main_persona_id_fkey"
            columns: ["main_persona_id"]
            isOneToOne: false
            referencedRelation: "main_persona_templates"
            referencedColumns: ["id"]
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
      premium_access_log: {
        Row: {
          created_at: string
          email: string
          expires_at: string | null
          grant_type: string
          granted_at: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string | null
          grant_type: string
          granted_at?: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string | null
          grant_type?: string
          granted_at?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          adult_mode_enabled: boolean | null
          avatar: string | null
          avatar_talking_photo_id: string | null
          consent_date: string | null
          created_at: string
          default_mode: string | null
          effective_tier: string | null
          email: string | null
          first_time_in_settings: boolean
          full_name: string
          id: string
          invited_premium_expires_at: string | null
          invited_promo_access: boolean | null
          is_first_login: boolean
          main_persona_name: string | null
          memory_consent_ip: unknown
          memory_deletion_date: string | null
          memory_enabled: boolean | null
          notifications_frequency: string | null
          onboarding_complete: boolean | null
          original_tier_before_invite: string | null
          persona_behavior: string | null
          persona_behaviors: Json | null
          preferred_language: string | null
          professional_account: boolean | null
          promo_access: boolean
          role: string | null
          subscription_active: boolean | null
          subscription_tier: string | null
          timezone: string | null
          tutorial_shown: boolean | null
          updated_at: string | null
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
          avatar_talking_photo_id?: string | null
          consent_date?: string | null
          created_at?: string
          default_mode?: string | null
          effective_tier?: string | null
          email?: string | null
          first_time_in_settings?: boolean
          full_name: string
          id?: string
          invited_premium_expires_at?: string | null
          invited_promo_access?: boolean | null
          is_first_login?: boolean
          main_persona_name?: string | null
          memory_consent_ip?: unknown
          memory_deletion_date?: string | null
          memory_enabled?: boolean | null
          notifications_frequency?: string | null
          onboarding_complete?: boolean | null
          original_tier_before_invite?: string | null
          persona_behavior?: string | null
          persona_behaviors?: Json | null
          preferred_language?: string | null
          professional_account?: boolean | null
          promo_access?: boolean
          role?: string | null
          subscription_active?: boolean | null
          subscription_tier?: string | null
          timezone?: string | null
          tutorial_shown?: boolean | null
          updated_at?: string | null
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
          avatar_talking_photo_id?: string | null
          consent_date?: string | null
          created_at?: string
          default_mode?: string | null
          effective_tier?: string | null
          email?: string | null
          first_time_in_settings?: boolean
          full_name?: string
          id?: string
          invited_premium_expires_at?: string | null
          invited_promo_access?: boolean | null
          is_first_login?: boolean
          main_persona_name?: string | null
          memory_consent_ip?: unknown
          memory_deletion_date?: string | null
          memory_enabled?: boolean | null
          notifications_frequency?: string | null
          onboarding_complete?: boolean | null
          original_tier_before_invite?: string | null
          persona_behavior?: string | null
          persona_behaviors?: Json | null
          preferred_language?: string | null
          professional_account?: boolean | null
          promo_access?: boolean
          role?: string | null
          subscription_active?: boolean | null
          subscription_tier?: string | null
          timezone?: string | null
          tutorial_shown?: boolean | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          voice?: string | null
          voice_enabled?: boolean | null
          voice_id?: string | null
          voice_style?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_main_persona_name_fkey"
            columns: ["main_persona_name"]
            isOneToOne: false
            referencedRelation: "main_persona_templates"
            referencedColumns: ["persona_name"]
          },
        ]
      }
      profiles_backup: {
        Row: {
          adult_mode_enabled: boolean | null
          avatar: string | null
          avatar_talking_photo_id: string | null
          consent_date: string | null
          created_at: string | null
          default_mode: string | null
          effective_tier: string | null
          email: string | null
          first_time_in_settings: boolean | null
          full_name: string | null
          id: string | null
          invited_premium_expires_at: string | null
          invited_promo_access: boolean | null
          is_first_login: boolean | null
          main_persona_name: string | null
          memory_consent_ip: unknown
          memory_deletion_date: string | null
          memory_enabled: boolean | null
          notifications_frequency: string | null
          onboarding_complete: boolean | null
          original_tier_before_invite: string | null
          persona_behavior: string | null
          persona_behaviors: Json | null
          preferred_language: string | null
          professional_account: boolean | null
          promo_access: boolean | null
          role: string | null
          subscription_active: boolean | null
          subscription_tier: string | null
          timezone: string | null
          tutorial_shown: boolean | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          voice: string | null
          voice_enabled: boolean | null
          voice_id: string | null
          voice_style: string | null
        }
        Insert: {
          adult_mode_enabled?: boolean | null
          avatar?: string | null
          avatar_talking_photo_id?: string | null
          consent_date?: string | null
          created_at?: string | null
          default_mode?: string | null
          effective_tier?: string | null
          email?: string | null
          first_time_in_settings?: boolean | null
          full_name?: string | null
          id?: string | null
          invited_premium_expires_at?: string | null
          invited_promo_access?: boolean | null
          is_first_login?: boolean | null
          main_persona_name?: string | null
          memory_consent_ip?: unknown
          memory_deletion_date?: string | null
          memory_enabled?: boolean | null
          notifications_frequency?: string | null
          onboarding_complete?: boolean | null
          original_tier_before_invite?: string | null
          persona_behavior?: string | null
          persona_behaviors?: Json | null
          preferred_language?: string | null
          professional_account?: boolean | null
          promo_access?: boolean | null
          role?: string | null
          subscription_active?: boolean | null
          subscription_tier?: string | null
          timezone?: string | null
          tutorial_shown?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          voice?: string | null
          voice_enabled?: boolean | null
          voice_id?: string | null
          voice_style?: string | null
        }
        Update: {
          adult_mode_enabled?: boolean | null
          avatar?: string | null
          avatar_talking_photo_id?: string | null
          consent_date?: string | null
          created_at?: string | null
          default_mode?: string | null
          effective_tier?: string | null
          email?: string | null
          first_time_in_settings?: boolean | null
          full_name?: string | null
          id?: string | null
          invited_premium_expires_at?: string | null
          invited_promo_access?: boolean | null
          is_first_login?: boolean | null
          main_persona_name?: string | null
          memory_consent_ip?: unknown
          memory_deletion_date?: string | null
          memory_enabled?: boolean | null
          notifications_frequency?: string | null
          onboarding_complete?: boolean | null
          original_tier_before_invite?: string | null
          persona_behavior?: string | null
          persona_behaviors?: Json | null
          preferred_language?: string | null
          professional_account?: boolean | null
          promo_access?: boolean | null
          role?: string | null
          subscription_active?: boolean | null
          subscription_tier?: string | null
          timezone?: string | null
          tutorial_shown?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          voice?: string | null
          voice_enabled?: boolean | null
          voice_id?: string | null
          voice_style?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          client_id: string | null
          created_at: string
          description: string
          discount_percent: number
          duration_months: number | null
          expiry_date: string | null
          id: string
          max_usage: number
          promotion_type: string
          updated_at: string
          used_count: number
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description: string
          discount_percent?: number
          duration_months?: number | null
          expiry_date?: string | null
          id?: string
          max_usage?: number
          promotion_type: string
          updated_at?: string
          used_count?: number
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string
          discount_percent?: number
          duration_months?: number | null
          expiry_date?: string | null
          id?: string
          max_usage?: number
          promotion_type?: string
          updated_at?: string
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount_paid: number
          created_at: string | null
          currency: string
          id: string
          product_type: string
          purchased_at: string | null
          status: string
          stripe_payment_intent_id: string
          stripe_price_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          currency?: string
          id?: string
          product_type: string
          purchased_at?: string | null
          status?: string
          stripe_payment_intent_id: string
          stripe_price_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          currency?: string
          id?: string
          product_type?: string
          purchased_at?: string | null
          status?: string
          stripe_payment_intent_id?: string
          stripe_price_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_products: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          features: Json
          id: string
          is_active: boolean
          name: string
          price_currency: string
          price_monthly: number
          stripe_price_id: string | null
          stripe_product_id: string | null
          tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price_currency?: string
          price_monthly?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          tier: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price_currency?: string
          price_monthly?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
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
      user_consents: {
        Row: {
          consent_date: string
          created_at: string
          id: string
          ip_address: unknown
          privacy_policy_version: string
          terms_of_service_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_date?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          privacy_policy_version: string
          terms_of_service_version: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_date?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          privacy_policy_version?: string
          terms_of_service_version?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_context: {
        Row: {
          created_at: string | null
          greeting_history: Json | null
          id: string
          last_greeting: string | null
          last_message: string | null
          last_reply: string | null
          last_updated: string | null
          memory_enabled: boolean | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          greeting_history?: Json | null
          id?: string
          last_greeting?: string | null
          last_message?: string | null
          last_reply?: string | null
          last_updated?: string | null
          memory_enabled?: boolean | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          greeting_history?: Json | null
          id?: string
          last_greeting?: string | null
          last_message?: string | null
          last_reply?: string | null
          last_updated?: string | null
          memory_enabled?: boolean | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      user_memory: {
        Row: {
          conversation_date: string
          created_at: string | null
          id: string
          last_updated: string | null
          memory_summary: string
          user_id: string
        }
        Insert: {
          conversation_date: string
          created_at?: string | null
          id?: string
          last_updated?: string | null
          memory_summary: string
          user_id: string
        }
        Update: {
          conversation_date?: string
          created_at?: string | null
          id?: string
          last_updated?: string | null
          memory_summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_memory_user_id_fkey"
            columns: ["user_id"]
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
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          promo_expires_at: string | null
          source: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          promo_expires_at?: string | null
          source?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          promo_expires_at?: string | null
          source?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_subscriptions_backup: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string | null
          promo_expires_at: string | null
          source: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string | null
          promo_expires_at?: string | null
          source?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string | null
          promo_expires_at?: string | null
          source?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      voice_templates: {
        Row: {
          active_status: boolean
          created_at: string
          description: string | null
          display_name: string
          display_order: number | null
          id: string
          provider: string
          tier: string
          updated_at: string
          voice_id: string
          voice_name: string
          voice_settings: Json | null
        }
        Insert: {
          active_status?: boolean
          created_at?: string
          description?: string | null
          display_name: string
          display_order?: number | null
          id?: string
          provider?: string
          tier?: string
          updated_at?: string
          voice_id: string
          voice_name: string
          voice_settings?: Json | null
        }
        Update: {
          active_status?: boolean
          created_at?: string
          description?: string | null
          display_name?: string
          display_order?: number | null
          id?: string
          provider?: string
          tier?: string
          updated_at?: string
          voice_id?: string
          voice_name?: string
          voice_settings?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _email_to_bigint: { Args: { keytext: string }; Returns: number }
      admin_fix_orphaned_user: {
        Args: { target_email: string; target_user_id: string }
        Returns: Json
      }
      can_access_adult_content: { Args: never; Returns: boolean }
      check_email_authorized: {
        Args: { check_email: string }
        Returns: boolean
      }
      complete_onboarding_atomic: {
        Args: {
          p_display_name?: string
          p_email: string
          p_invite_id?: string
          p_user_id: string
        }
        Returns: Json
      }
      complete_onboarding_for_email: {
        Args: { user_email: string }
        Returns: Json
      }
      complete_onboarding_invite: {
        Args: { p_email: string; p_invite_token: string; p_user_id: string }
        Returns: Json
      }
      debug_user_authorization: { Args: { check_email: string }; Returns: Json }
      downgrade_expired_invites: { Args: never; Returns: undefined }
      ensure_user_profile:
        | { Args: never; Returns: Json }
        | {
            Args: {
              p_effective_tier?: string
              p_email: string
              p_invited_promo_access?: boolean
              p_premium_expires_at?: string
              p_promo_access?: boolean
              p_subscription_active?: boolean
              p_subscription_tier?: string
              p_tutorial_shown?: boolean
              p_user_id: string
            }
            Returns: {
              created: boolean
              profile_id: string
              updated: boolean
            }[]
          }
        | {
            Args: { uid: string; user_email: string }
            Returns: {
              adult_mode_enabled: boolean | null
              avatar: string | null
              avatar_talking_photo_id: string | null
              consent_date: string | null
              created_at: string
              default_mode: string | null
              effective_tier: string | null
              email: string | null
              first_time_in_settings: boolean
              full_name: string
              id: string
              invited_premium_expires_at: string | null
              invited_promo_access: boolean | null
              is_first_login: boolean
              main_persona_name: string | null
              memory_consent_ip: unknown
              memory_deletion_date: string | null
              memory_enabled: boolean | null
              notifications_frequency: string | null
              onboarding_complete: boolean | null
              original_tier_before_invite: string | null
              persona_behavior: string | null
              persona_behaviors: Json | null
              preferred_language: string | null
              professional_account: boolean | null
              promo_access: boolean
              role: string | null
              subscription_active: boolean | null
              subscription_tier: string | null
              timezone: string | null
              tutorial_shown: boolean | null
              updated_at: string | null
              user_id: string
              username: string | null
              voice: string | null
              voice_enabled: boolean | null
              voice_id: string | null
              voice_style: string | null
            }
            SetofOptions: {
              from: "*"
              to: "profiles"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      ensure_user_profile_and_subscription: {
        Args: {
          p_invite_code?: string
          p_user_email: string
          p_user_id: string
        }
        Returns: Json
      }
      expire_invite_based_premium: { Args: never; Returns: undefined }
      generate_api_key: { Args: never; Returns: string }
      get_current_legal_versions: {
        Args: never
        Returns: {
          privacy_version: string
          terms_version: string
        }[]
      }
      get_custom_persona_for_user: {
        Args: { user_id_param: string }
        Returns: {
          avatar_cloudinary_id: string
          base_persona_id: string
          id: string
          ip_agreed_at: string
          is_active: boolean
          is_locked: boolean
          name: string
          voice_template_id: string
        }[]
      }
      get_public_appearance_options: {
        Args: never
        Returns: {
          category: string
          created_at: string
          display_order: number
          id: string
          image_url: string
          label: string
          tier: string
        }[]
      }
      get_user_tier: { Args: { p_user_id: string }; Returns: string }
      has_active_custom_persona: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      has_active_invite_premium: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      has_active_premium: { Args: { check_user_id: string }; Returns: boolean }
      has_active_premium_subscription: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      has_custom_subscription: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      has_feature_access: {
        Args: { feature_key_param: string; user_id_param: string }
        Returns: boolean
      }
      health_check_access_control: { Args: never; Returns: Json }
      is_admin_or_premium: { Args: never; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_user_authorized: { Args: { user_email: string }; Returns: boolean }
      link_existing_profile_by_email: {
        Args: { p_email: string; p_user_id: string }
        Returns: undefined
      }
      onboard_invite_user:
        | {
            Args: {
              p_invite_code: string
              p_user_email: string
              p_user_id: string
            }
            Returns: Json
          }
        | {
            Args: { p_email: string; p_invite_token: string; p_user_id: string }
            Returns: Json
          }
      onboard_invite_user_atomic:
        | { Args: { _email: string; _user_id: string }; Returns: Json }
        | { Args: { p_email: string; p_invite_code: string }; Returns: Json }
        | {
            Args: { p_email: string; p_invite_code: string; p_user_id: string }
            Returns: Json
          }
        | {
            Args: {
              p_email: string
              p_invite_token: string
              p_promo_expires_at: string
              p_user_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_email: string
              p_full_name: string
              p_subscription_tier?: string
              p_user_id: string
            }
            Returns: undefined
          }
      onboard_user: {
        Args: { _email: string; _full_name?: string; _user_id: string }
        Returns: Json
      }
      reset_tutorial_for_user: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      revert_expired_invite_premium: { Args: never; Returns: undefined }
      revert_expired_promo_access: { Args: never; Returns: undefined }
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
