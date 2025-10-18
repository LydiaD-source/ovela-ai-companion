import { supabase } from '@/integrations/supabase/client';

export interface DIDTalkConfig {
  source_url?: string;
  script: string;
  voice_id?: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_cloned_voice?: boolean;
}

export interface DIDTalkResponse {
  id: string;
  status: 'created' | 'started' | 'done' | 'error';
  result_url?: string;
  error?: {
    kind: string;
    description: string;
  };
}

class DIDService {
  private currentTalkId: string | null = null;
  private pollingInterval: number | null = null;

  /**
   * Create a D-ID talk stream with Isabella's image and text
   */
  async createTalkStream(config: DIDTalkConfig): Promise<DIDTalkResponse> {
    console.log('🎬 didService.createTalkStream called with config:', config);

    const { data, error } = await supabase.functions.invoke('did-streaming', {
      body: {
        action: 'create_talk_stream',
        data: config,
      },
    });

    console.log('🎬 Supabase function response - data:', data, 'error:', error);

    if (error) {
      console.error('❌ Error creating talk stream:', error);
      throw error;
    }

    this.currentTalkId = data.id;
    console.log('✅ Talk stream created:', data);
    return data;
  }

  /**
   * Get the status of a talk stream
   */
  async getTalkStatus(talkId: string): Promise<DIDTalkResponse> {
    const { data, error } = await supabase.functions.invoke('did-streaming', {
      body: {
        action: 'get_talk_status',
        data: { talk_id: talkId },
      },
    });

    if (error) {
      console.error('❌ Error getting talk status:', error);
      throw error;
    }

    return data;
  }

  /**
   * Poll for talk completion and return the result URL
   */
  async pollForCompletion(
    talkId: string,
    onProgress?: (status: string) => void,
    maxAttempts = 60,
    intervalMs = 1000
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const poll = async () => {
        try {
          attempts++;
          const status: any = await this.getTalkStatus(talkId);
          
          console.log(`🔄 Poll attempt ${attempts}/${maxAttempts}:`, status.status);
          onProgress?.(status.status);

          if (status.status === 'done') {
            const videoUrl = status.result_url || status.url || status.video_url || status?.result?.url;
            if (videoUrl) {
              if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;
              }
              resolve(videoUrl);
              return;
            } else {
              console.warn('⚠️ Done without video URL, full status:', status);
            }
          } else if (status.status === 'error') {
            if (this.pollingInterval) {
              clearInterval(this.pollingInterval);
              this.pollingInterval = null;
            }
            reject(new Error(status.error?.description || 'Talk generation failed'));
            return;
          }

          if (attempts >= maxAttempts) {
            if (this.pollingInterval) {
              clearInterval(this.pollingInterval);
              this.pollingInterval = null;
            }
            reject(new Error('Polling timeout'));
          }
        } catch (error) {
          if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
          }
          reject(error);
        }
      };

      // Start polling
      poll();
      this.pollingInterval = setInterval(poll, intervalMs) as any;
    });
  }

  /**
   * Delete a talk stream
   */
  async deleteTalk(talkId: string): Promise<void> {
    await supabase.functions.invoke('did-streaming', {
      body: {
        action: 'delete_talk',
        data: { talk_id: talkId },
      },
    });
  }

  /**
   * Stop current polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Get current talk ID
   */
  getCurrentTalkId(): string | null {
    return this.currentTalkId;
  }

  /**
   * Cleanup current talk
   */
  async cleanup() {
    this.stopPolling();
    if (this.currentTalkId) {
      try {
        await this.deleteTalk(this.currentTalkId);
      } catch (error) {
        console.error('Error cleaning up talk:', error);
      }
      this.currentTalkId = null;
    }
  }
}

export const didService = new DIDService();
