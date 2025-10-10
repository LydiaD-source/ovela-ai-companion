// Feature flags for controlled rollout
export const featureFlags = {
  // Real-time STT feature flag (default: false for safety)
  realtime_stt_enabled: false,
  
  // Debug mode for verbose logging
  realtime_stt_debug: false,
  
  // Session configuration
  SESSION_IDLE_TIMEOUT_MS: 60000, // 60 seconds
  MAX_SESSION_LENGTH_MS: 300000, // 5 minutes
  SILENCE_TIMEOUT_MS: 800, // Auto-finalize on silence
  
  // Rate limits
  MAX_TOKENS_PER_MINUTE: 4,
  MAX_CONCURRENT_SESSIONS: 1,
  
  // Fallback configuration
  WEBRTC_CONNECT_TIMEOUT_MS: 5000,
  WEBSOCKET_CONNECT_TIMEOUT_MS: 3000,
};

// Environment-based overrides
if (import.meta.env.MODE === 'development') {
  featureFlags.realtime_stt_enabled = true; // Enable in dev for testing
  featureFlags.realtime_stt_debug = true;
}

export const log = (...args: any[]) => {
  if (featureFlags.realtime_stt_debug) {
    console.log('[Realtime STT]', ...args);
  }
};

export const logError = (...args: any[]) => {
  console.error('[Realtime STT Error]', ...args);
};
