/**
 * D-ID Streaming API Service
 * Connects to D-ID API via Supabase edge function
 */

import { didService } from './didService';

export class DIDAvatarService {
  private isActive = false;
  private currentTalkId: string | null = null;

  /**
   * Initialize D-ID streaming session
   */
  async initialize() {
    console.log('🎬 D-ID Avatar Service - Ready');
    this.isActive = true;
  }

  /**
   * Start D-ID talk stream with Isabella avatar
   */
  async startSession() {
    console.log('🎬 Starting D-ID session');
    await this.initialize();
  }

  /**
   * Send text to D-ID avatar for lip-sync and speech
   */
  async speak(text: string): Promise<string> {
    console.log('🎬 D-ID speak requested:', text.substring(0, 50));
    
    const talkResponse = await didService.createTalkStream({
      script: text,
      voice_id: '9BWtsMINqrJLrRacOk9x', // ElevenLabs Aria
      stability: 0.5,
      similarity_boost: 0.75,
    });

    this.currentTalkId = talkResponse.id;

    // Poll for completion and return video URL
    const videoUrl = await didService.pollForCompletion(talkResponse.id);
    return videoUrl;
  }

  /**
   * Stop D-ID streaming session
   */
  async stopSession() {
    if (this.currentTalkId) {
      await didService.cleanup();
      this.currentTalkId = null;
    }
    this.isActive = false;
    console.log('🎬 D-ID session stopped');
  }

  /**
   * Check if D-ID is ready to use
   */
  isReady(): boolean {
    return this.isActive;
  }

  /**
   * Cleanup
   */
  async cleanup() {
    await didService.cleanup();
    this.currentTalkId = null;
    this.isActive = false;
  }
}

export const didAvatarService = new DIDAvatarService();
