import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { log, logError, featureFlags } from '@/config/featureFlags';

interface UseRealtimeSTTWebRTCProps {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onFallback?: () => void;
}

export const useRealtimeSTTWebRTC = ({ 
  onTranscript,
  onFallback 
}: UseRealtimeSTTWebRTCProps = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionStartRef = useRef<number>(0);
  const lastActivityRef = useRef<number>(0);
  const tokenRef = useRef<string | null>(null);
  
  const { toast } = useToast();

  // Emit analytics event
  const emitEvent = useCallback((eventName: string, data?: any) => {
    log(`📊 Event: ${eventName}`, data);
    // TODO: Send to analytics/Sentry
  }, []);

  // Graceful fallback
  const triggerFallback = useCallback((reason: string) => {
    logError('Triggering fallback:', reason);
    emitEvent('realtime_fallback_triggered', { reason });
    
    toast({
      title: 'Switching to Safe Mode',
      description: 'Realtime speech temporarily unavailable. Using standard mode.',
    });
    
    onFallback?.();
  }, [onFallback, toast, emitEvent]);

  // Request ephemeral token
  const requestToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://vrpgowcocbztclxfzssu.functions.supabase.co/functions/v1/openai-realtime-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await response.json();
      
      if (data.fallback || !data.token) {
        triggerFallback(data.error || 'token_unavailable');
        return null;
      }

      emitEvent('realtime_token_issued');
      log('Token received:', data);
      return data.token;
      
    } catch (error) {
      logError('Token request failed:', error);
      triggerFallback('token_request_error');
      return null;
    }
  }, [triggerFallback, emitEvent]);

  // Initialize WebRTC connection
  const connect = useCallback(async () => {
    try {
      emitEvent('realtime_connect_attempt');
      
      // Get ephemeral token
      const token = await requestToken();
      if (!token) return false;
      
      tokenRef.current = token;

      // Create peer connection
      pcRef.current = new RTCPeerConnection();
      
      // Set up audio element for remote audio (if needed)
      if (!audioElRef.current) {
        audioElRef.current = document.createElement("audio");
        audioElRef.current.autoplay = true;
      }

      // Handle remote audio track
      pcRef.current.ontrack = (e) => {
        log('Received remote track');
        if (audioElRef.current) {
          audioElRef.current.srcObject = e.streams[0];
        }
      };

      // Get local audio
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      
      // Add local audio track to peer connection
      stream.getTracks().forEach(track => {
        pcRef.current?.addTrack(track, stream);
      });

      // Set up data channel for events
      dcRef.current = pcRef.current.createDataChannel("oai-events");
      
      dcRef.current.onopen = () => {
        log('Data channel opened');
        setIsConnected(true);
        sessionStartRef.current = Date.now();
        lastActivityRef.current = Date.now();
        emitEvent('realtime_connect_success');
      };

      dcRef.current.onmessage = (evt) => {
        try {
          const event = JSON.parse(evt.data);
          log('Received event:', event.type);
          
          lastActivityRef.current = Date.now();

          switch (event.type) {
            case 'conversation.item.input_audio_transcription.completed':
              const transcript = event.transcript || '';
              log('Final transcript:', transcript);
              setFinalTranscript(transcript);
              onTranscript?.(transcript, true);
              emitEvent('realtime_transcript_final', { 
                charCount: transcript.length,
                latencyMs: Date.now() - lastActivityRef.current 
              });
              break;
              
            case 'conversation.item.input_audio_transcription.delta':
              const delta = event.delta || '';
              log('Partial transcript:', delta);
              setPartialTranscript(prev => prev + delta);
              onTranscript?.(delta, false);
              emitEvent('realtime_transcript_partial', { 
                charCount: delta.length 
              });
              break;
              
            case 'error':
              logError('OpenAI error:', event.error);
              triggerFallback(`openai_error: ${event.error?.message}`);
              break;
          }
        } catch (error) {
          logError('Error processing message:', error);
        }
      };

      dcRef.current.onerror = (error) => {
        logError('Data channel error:', error);
        triggerFallback('data_channel_error');
      };

      // Create offer
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      // Exchange SDP with OpenAI Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`SDP exchange failed: ${sdpResponse.status}`);
      }

      const answerSdp = await sdpResponse.text();
      const answer = {
        type: "answer" as RTCSdpType,
        sdp: answerSdp,
      };
      
      await pcRef.current.setRemoteDescription(answer);
      log('WebRTC connection established');
      
      return true;

    } catch (error) {
      logError('Connection error:', error);
      emitEvent('realtime_connect_failure', { error: String(error) });
      triggerFallback('connection_failed');
      return false;
    }
  }, [requestToken, onTranscript, triggerFallback, emitEvent]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isConnected) {
      logError('Not connected - cannot start listening');
      return;
    }
    
    setIsListening(true);
    setPartialTranscript('');
    setFinalTranscript('');
    log('Started listening');
  }, [isConnected]);

  // Stop listening
  const stopListening = useCallback(() => {
    setIsListening(false);
    log('Stopped listening');
  }, []);

  // Disconnect and cleanup
  const disconnect = useCallback(() => {
    const sessionDuration = Date.now() - sessionStartRef.current;
    
    emitEvent('realtime_session_close', { durationMs: sessionDuration });
    
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }
    
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsConnected(false);
    setIsListening(false);
    log('Disconnected');
  }, [emitEvent]);

  // Session timeout monitoring
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const sessionDuration = now - sessionStartRef.current;
      const idleDuration = now - lastActivityRef.current;

      // Check max session length
      if (sessionDuration > featureFlags.MAX_SESSION_LENGTH_MS) {
        log('Max session length reached - rotating session');
        disconnect();
        connect(); // Auto-reconnect with new token
        return;
      }

      // Check idle timeout
      if (idleDuration > featureFlags.SESSION_IDLE_TIMEOUT_MS && !isListening) {
        log('Session idle timeout - disconnecting');
        disconnect();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isConnected, isListening, disconnect, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isListening,
    partialTranscript,
    finalTranscript,
    connect,
    disconnect,
    startListening,
    stopListening,
  };
};
