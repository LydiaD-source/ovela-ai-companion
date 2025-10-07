import React, { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ 
  onTranscript,
  disabled 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      console.log('🎙️ Starting microphone recording...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('🎙️ Recording stopped, processing...');
        setIsProcessing(true);

        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          console.log(`📊 Audio blob size: ${audioBlob.size} bytes`);

          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            try {
              // Direct fetch to Supabase function
              const sttUrl = 'https://vrpgowcocbztclxfzssu.supabase.co/functions/v1/speech-to-text';
              console.log('📡 STT Fetch URL:', sttUrl);
              console.log('📤 Sending audio directly to Supabase speech-to-text...');
              
              const response = await fetch(sttUrl, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ audio: base64Audio })
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ STT HTTP Error:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
              }

              const data = await response.json();
              console.log('📡 STT Response:', data);

              if (data?.success && data?.text) {
                console.log('✅ Transcription received:', data.text);
                console.log('💬 Sending to Isabella (brand: ovela_client_001)');
                onTranscript(data.text);
              } else {
                console.error('❌ Invalid response from speech-to-text:', data);
                throw new Error('No text received from transcription service');
              }
            } catch (fetchError) {
              console.error('❌ Speech-to-text fetch error:', fetchError);
              toast({
                title: 'Transcription Failed',
                description: fetchError instanceof Error ? fetchError.message : 'Could not transcribe audio',
                variant: 'destructive'
              });
            }

            setIsProcessing(false);
          };
        } catch (err) {
          console.error('❌ Error processing audio:', err);
          toast({
            title: 'Processing Error',
            description: err instanceof Error ? err.message : 'Failed to process audio',
            variant: 'destructive'
          });
          setIsProcessing(false);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      console.log('🎙️ Recording started');

    } catch (err) {
      console.error('❌ Microphone access error:', err);
      toast({
        title: 'Microphone Error',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('🛑 Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "outline"}
      size="icon"
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`transition-all ${isRecording ? 'animate-pulse' : ''}`}
      title={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isProcessing ? (
        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
};