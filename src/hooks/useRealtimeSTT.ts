import { useCallback } from 'react';
import { useRealtimeSTTWebRTC } from './useRealtimeSTTWebRTC';
import { useOpenAIRealtimeSTT } from './useOpenAIRealtimeSTT';
import { featureFlags, log } from '@/config/featureFlags';
import { useState } from 'react';

interface UseRealtimeSTTProps {
  onTranscript?: (text: string, isFinal?: boolean) => void;
}

/**
 * Unified hook that manages STT with automatic fallbacks:
 * 1. WebRTC (primary, lowest latency)
 * 2. WebSocket (fallback)
 * 3. Record-then-transcribe (final fallback)
 */
export const useRealtimeSTT = ({ onTranscript }: UseRealtimeSTTProps = {}) => {
  const [mode, setMode] = useState<'webrtc' | 'websocket' | 'fallback'>('webrtc');
  
  // WebRTC implementation (primary)
  const webrtc = useRealtimeSTTWebRTC({
    onTranscript: (text, isFinal) => {
      onTranscript?.(text, isFinal);
    },
    onFallback: () => {
      log('WebRTC failed, falling back to WebSocket');
      setMode('websocket');
    }
  });

  // WebSocket implementation (fallback #1)
  const websocket = useOpenAIRealtimeSTT({
    onTranscript: (text) => {
      onTranscript?.(text, true);
    }
  });

  // Determine which implementation to use based on feature flags and mode
  const getActiveImplementation = useCallback(() => {
    if (!featureFlags.realtime_stt_enabled) {
      return null; // Will use record-then-transcribe
    }

    if (mode === 'webrtc') {
      return webrtc;
    } else if (mode === 'websocket') {
      return websocket;
    }
    
    return null;
  }, [mode, webrtc, websocket]);

  const active = getActiveImplementation();

  // Unified API
  return {
    isConnected: active?.isConnected || false,
    isRecording: (mode === 'webrtc' ? webrtc.isListening : websocket.isRecording) || false,
    currentTranscript: (mode === 'webrtc' ? webrtc.partialTranscript : websocket.currentTranscript) || '',
    mode,
    
    connect: async () => {
      if (!featureFlags.realtime_stt_enabled) {
        log('Realtime STT disabled by feature flag');
        return;
      }
      
      if (mode === 'webrtc') {
        const success = await webrtc.connect();
        if (!success) {
          log('WebRTC connection failed, trying WebSocket');
          setMode('websocket');
          await websocket.connect();
        }
      } else if (mode === 'websocket') {
        await websocket.connect();
      }
    },
    
    disconnect: () => {
      if (mode === 'webrtc') {
        webrtc.disconnect();
      } else if (mode === 'websocket') {
        websocket.disconnect();
      }
    },
    
    startRecording: async () => {
      if (mode === 'webrtc') {
        webrtc.startListening();
      } else if (mode === 'websocket') {
        await websocket.startRecording();
      }
    },
    
    stopRecording: () => {
      if (mode === 'webrtc') {
        webrtc.stopListening();
      } else if (mode === 'websocket') {
        websocket.stopRecording();
      }
    },
  };
};
