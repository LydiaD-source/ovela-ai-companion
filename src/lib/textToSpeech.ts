import { supabase } from '@/integrations/supabase/client';

export class TextToSpeechService {
  private audioContext: AudioContext | null = null;
  private isPlaying = false;
  private htmlAudio: HTMLAudioElement | null = null;
  private onSpeakingChangeCallback: ((isSpeaking: boolean) => void) | null = null;

  constructor() {
    // Initialize audio context when first needed
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.initAudioContext().catch(() => {});
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('click', unlock);
      window.addEventListener('touchstart', unlock);
    }
  }

  setOnSpeakingChange(callback: (isSpeaking: boolean) => void) {
    this.onSpeakingChangeCallback = callback;
  }

  private async initAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    return this.audioContext;
  }

  async generateSpeech(text: string, voice?: string): Promise<string | null> {
    try {
      console.log('Generating speech for text:', text.substring(0, 50) + '...');
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text.trim(),
          voice: voice || 't0IcnDolatli2xhqgLgn' // Isabella voice
        }
      });

      if (error) {
        console.error('Text-to-speech error:', error);
        return null;
      }

      if (data?.success && data?.audioUrl) {
        console.log('Successfully generated speech');
        return data.audioUrl;
      }

      console.error('Invalid response from text-to-speech service:', data);
      return null;
    } catch (error) {
      console.error('Error generating speech:', error);
      return null;
    }
  }

  async playAudio(audioUrl: string): Promise<void> {
    if (this.isPlaying) {
      console.log('Audio already playing, skipping...');
      return;
    }

    // Prefer HTMLAudioElement for broader autoplay compatibility
    try {
      this.isPlaying = true;
      this.onSpeakingChangeCallback?.(true);
      if (!this.htmlAudio) {
        this.htmlAudio = new Audio();
      } else {
        try { this.htmlAudio.pause(); } catch {}
      }
      this.htmlAudio.src = audioUrl;
      this.htmlAudio.onended = () => { 
        this.isPlaying = false; 
        this.onSpeakingChangeCallback?.(false);
      };
      this.htmlAudio.onerror = () => { 
        this.isPlaying = false; 
        this.onSpeakingChangeCallback?.(false);
      };
      await this.htmlAudio.play();
      console.log('Playing audio (HTMLAudio)...');
      return;
    } catch (htmlErr) {
      console.warn('HTMLAudio playback failed, falling back to WebAudio', htmlErr);
    }

    // Fallback to WebAudio API
    try {
      const audioContext = await this.initAudioContext();

      let audioData: ArrayBuffer;
      if (audioUrl.startsWith('data:audio')) {
        const base64Data = audioUrl.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        audioData = bytes.buffer;
      } else {
        const response = await fetch(audioUrl);
        audioData = await response.arrayBuffer();
      }

      const audioBuffer = await audioContext.decodeAudioData(audioData);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => { 
        this.isPlaying = false; 
        this.onSpeakingChangeCallback?.(false);
      };
      source.start(0);
      console.log('Playing audio (WebAudio)...');
    } catch (error) {
      console.error('Error playing audio (fallback failed):', error);
      this.isPlaying = false;
      this.onSpeakingChangeCallback?.(false);
    }
  }

  async speakText(text: string, voice?: string): Promise<void> {
    const audioUrl = await this.generateSpeech(text, voice);
    if (audioUrl) {
      await this.playAudio(audioUrl);
    }
  }

  stopAudio(): void {
    if (this.htmlAudio) {
      try { this.htmlAudio.pause(); } catch {}
      this.htmlAudio.currentTime = 0;
    }
    if (this.audioContext) {
      // Suspend the entire context as a fallback
      this.audioContext.suspend();
    }
    this.isPlaying = false;
    this.onSpeakingChangeCallback?.(false);
  }

  get isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}

// Export singleton instance
export const textToSpeechService = new TextToSpeechService();