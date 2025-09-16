import { supabase } from '@/integrations/supabase/client';

export class TextToSpeechService {
  private audioContext: AudioContext | null = null;
  private isPlaying = false;

  constructor() {
    // Initialize audio context when first needed
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

    try {
      this.isPlaying = true;
      const audioContext = await this.initAudioContext();

      // For data URLs, we need to extract the base64 part
      let audioData: ArrayBuffer;
      
      if (audioUrl.startsWith('data:audio/mpeg;base64,')) {
        const base64Data = audioUrl.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        audioData = bytes.buffer;
      } else {
        // Regular URL
        const response = await fetch(audioUrl);
        audioData = await response.arrayBuffer();
      }

      const audioBuffer = await audioContext.decodeAudioData(audioData);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        this.isPlaying = false;
      };
      
      source.start(0);
      console.log('Playing audio...');
    } catch (error) {
      console.error('Error playing audio:', error);
      this.isPlaying = false;
    }
  }

  async speakText(text: string, voice?: string): Promise<void> {
    const audioUrl = await this.generateSpeech(text, voice);
    if (audioUrl) {
      await this.playAudio(audioUrl);
    }
  }

  stopAudio(): void {
    if (this.audioContext) {
      // Note: We can't stop individual sources once started,
      // but we can suspend the entire context
      this.audioContext.suspend();
      this.isPlaying = false;
    }
  }

  get isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}

// Export singleton instance
export const textToSpeechService = new TextToSpeechService();