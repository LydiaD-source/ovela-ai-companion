type UnmuteCallback = () => void;

class AutoplayManager {
  private static instance: AutoplayManager | null = null;
  private subscribers: Set<UnmuteCallback> = new Set();
  private hasUserInteracted = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      // Listen for user interaction
      const handleInteraction = () => {
        if (!this.hasUserInteracted) {
          this.hasUserInteracted = true;
          console.log('🔊 User interaction detected, enabling autoplay');
          this.notifySubscribers();
        }
      };

      // Multiple event types to catch interaction
      window.addEventListener('click', handleInteraction, { once: false });
      window.addEventListener('touchstart', handleInteraction, { once: false });
      window.addEventListener('keydown', handleInteraction, { once: false });
    }
  }

  static getInstance(): AutoplayManager {
    if (!AutoplayManager.instance) {
      AutoplayManager.instance = new AutoplayManager();
    }
    return AutoplayManager.instance;
  }

  // Subscribe to be notified when unmuting is allowed
  subscribe(callback: UnmuteCallback): () => void {
    this.subscribers.add(callback);
    
    // If already interacted, call immediately
    if (this.hasUserInteracted) {
      callback();
    }

    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb();
      } catch (e) {
        console.error('Autoplay callback error:', e);
      }
    });
  }

  // Check if autoplay is allowed
  canAutoplay(): boolean {
    return this.hasUserInteracted;
  }

  // Manually trigger (for cases where we know user has interacted)
  triggerInteraction(): void {
    if (!this.hasUserInteracted) {
      this.hasUserInteracted = true;
      this.notifySubscribers();
    }
  }

  // Try to unmute a video element
  async tryUnmute(video: HTMLVideoElement): Promise<boolean> {
    if (!this.hasUserInteracted) {
      console.log('⚠️ Cannot unmute: no user interaction yet');
      return false;
    }

    try {
      video.muted = false;
      await video.play();
      return true;
    } catch (e) {
      console.warn('⚠️ Unmute failed:', e);
      return false;
    }
  }
}

export const GlobalAutoplayManager = AutoplayManager.getInstance();
export default GlobalAutoplayManager;
