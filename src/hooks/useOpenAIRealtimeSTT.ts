import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
              console.log('Speech stopped, requesting response');
              try {
                wsRef.current?.send(JSON.stringify({ type: 'response.create' }));
              } catch (e) { console.error('Failed to request response:', e); }
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
  }, [toast]);

  const stopRecording = useCallback(() => {
    // Signal end of audio and request response
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('Committing audio buffer and requesting response');
        wsRef.current.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
        wsRef.current.send(JSON.stringify({ type: 'response.create' }));
      }
    } catch (e) {
      console.error('Failed to finalize audio:', e);
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
