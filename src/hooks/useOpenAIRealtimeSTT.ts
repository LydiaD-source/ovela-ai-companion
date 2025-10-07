import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseOpenAIRealtimeSTTProps {
  onTranscript?: (text: string) => void;
  onAudioDelta?: (audioData: string) => void;
}

export const useOpenAIRealtimeSTT = ({ onTranscript, onAudioDelta }: UseOpenAIRealtimeSTTProps = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptBufferRef = useRef<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const connect = useCallback(async () => {
    try {
      const WS_URL = 'wss://vrpgowcocbztclxfzssu.functions.supabase.co/functions/v1/openai-realtime-relay';

      await new Promise<void>((resolve, reject) => {
        let opened = false;
        wsRef.current = new WebSocket(WS_URL);

        wsRef.current.onopen = () => {
          console.log('Connected to OpenAI Realtime API');
          setIsConnected(true);
          opened = true;
          resolve();
        };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'session.created':
              console.log('Session created');
              break;

            case 'session.updated':
              console.log('Session updated');
              break;

            case 'input_audio_buffer.speech_started':
              console.log('Speech started');
              break;

            case 'input_audio_buffer.speech_stopped':
              console.log('Speech stopped (server VAD)');
              // With server VAD enabled, do not manually commit or create response
              break;

            case 'response.audio_transcript.delta':
              // Build up live transcript as deltas arrive
              transcriptBufferRef.current += data.delta || '';
              setCurrentTranscript(transcriptBufferRef.current);
              break;

            case 'response.done':
            case 'response.audio.done':
              if (transcriptBufferRef.current.trim()) {
                const finalText = transcriptBufferRef.current.trim();
                console.log('Final transcript:', finalText);
                onTranscript?.(finalText);
              }
              transcriptBufferRef.current = '';
              break;

            case 'response.audio.delta':
              onAudioDelta?.(data.delta);
              break;

            case 'error':
              console.error('OpenAI error:', data.error);
              toast({
                title: 'Error',
                description: (data.error && (data.error.message || data.error)) || 'An error occurred',
                variant: 'destructive'
              });
              break;

            default:
              // Uncomment for verbose logging
              // console.log('WS event:', data.type);
              break;
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          toast({
            title: 'Connection Error',
            description: 'Failed to connect to speech service',
            variant: 'destructive'
          });
          if (!opened) reject(error as any);
        };

        wsRef.current.onclose = () => {
          console.log('WebSocket closed');
          setIsConnected(false);
          setIsRecording(false);
          if (!opened) reject(new Error('WebSocket closed before opening'));
        };
      });
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize speech service',
        variant: 'destructive'
      });
      throw error;
    }
  }, [onTranscript, onAudioDelta, toast]);

  const startRecording = useCallback(async () => {
    try {
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

      const useWebSocket = wsRef.current?.readyState === WebSocket.OPEN;

      if (useWebSocket) {
        // Realtime path: stream PCM16 frames to OpenAI via WS
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        const source = audioContextRef.current.createMediaStreamSource(stream);
        processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

        processorRef.current.onaudioprocess = (e) => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16Array = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            const uint8Array = new Uint8Array(int16Array.buffer);
            let binary = '';
            const chunkSize = 0x8000;
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
              binary += String.fromCharCode.apply(null, Array.from(chunk));
            }
            const base64Audio = btoa(binary);
            wsRef.current.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: base64Audio
            }));
          }
        };

        source.connect(processorRef.current);
        processorRef.current.connect(audioContextRef.current.destination);
      } else {
        // Fallback path: record short clip and send to Whisper STT edge function
        mediaChunksRef.current = [];
        try {
          mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        } catch (e) {
          // Safari may not support audio/webm; try default
          mediaRecorderRef.current = new MediaRecorder(stream);
        }

        mediaRecorderRef.current.ondataavailable = (e: BlobEvent) => {
          if (e.data && e.data.size > 0) mediaChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          try {
            const blob = new Blob(mediaChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
            mediaChunksRef.current = [];
            const arrayBuffer = await blob.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            const chunkSize = 0x8000;
            for (let i = 0; i < bytes.length; i += chunkSize) {
              const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
              binary += String.fromCharCode.apply(null, Array.from(chunk));
            }
            const base64Audio = btoa(binary);

            const { data, error } = await supabase.functions.invoke('speech-to-text', {
              body: { audio: base64Audio }
            });

            if (error) {
              console.error('Whisper STT error:', error);
              toast({ title: 'Speech-to-text failed', description: 'Please try again', variant: 'destructive' });
            } else if (data?.success && data?.text) {
              setCurrentTranscript(data.text);
              onTranscript?.(data.text);
            } else {
              console.warn('Unexpected STT response', data);
            }
          } catch (err) {
            console.error('Failed processing recorded audio:', err);
          }
        };

        mediaRecorderRef.current.start(250); // gather small chunks for responsiveness
      }

      setIsRecording(true);
      setCurrentTranscript('');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Microphone Error',
        description: 'Failed to access microphone',
        variant: 'destructive'
      });
    }
  }, [onTranscript, toast]);

  const stopRecording = useCallback(() => {
    // If using fallback recorder, stop it (onstop handler will process STT)
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        console.log('Stopping MediaRecorder fallback');
        mediaRecorderRef.current.stop();
      }
    } catch (e) {
      console.warn('Failed to stop MediaRecorder:', e);
    }

    // Realtime path: rely on server VAD, do not manually commit or request response
    try {
      if (processorRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('Stopping realtime capture (no manual commit, server VAD active)');
      }
    } catch (e) {
      console.error('Failed to finalize WS audio:', e);
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
  }, []);

  const disconnect = useCallback(() => {
    stopRecording();
    wsRef.current?.close();
    setIsConnected(false);
  }, [stopRecording]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isRecording,
    currentTranscript,
    connect,
    disconnect,
    startRecording,
    stopRecording
  };
};
