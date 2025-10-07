import React, { useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOpenAIRealtimeSTT } from '@/hooks/useOpenAIRealtimeSTT';

interface RealtimeVoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const RealtimeVoiceButton: React.FC<RealtimeVoiceButtonProps> = ({ 
  onTranscript,
  disabled 
}) => {
  const {
    isConnected,
    isRecording,
    currentTranscript,
    connect,
    disconnect,
    startRecording,
    stopRecording
  } = useOpenAIRealtimeSTT({
    onTranscript: (text) => {
      console.log('Received transcript:', text);
      onTranscript(text);
      stopRecording();
    }
  });

  useEffect(() => {
    if (currentTranscript) {
      console.log('Current transcript updated:', currentTranscript);
    }
  }, [currentTranscript]);

  const handleClick = async () => {
    try {
      console.log('Microphone button clicked. State:', { isConnected, isRecording });
      
      if (!isConnected) {
        console.log('Connecting to OpenAI Realtime...');
        await connect();
        console.log('Connected! Starting recording now...');
        await startRecording();
        console.log('Recording started');
      } else if (isRecording) {
        console.log('Stopping recording...');
        stopRecording();
      } else {
        console.log('Starting recording...');
        await startRecording();
      }
    } catch (error) {
      console.error('Error in handleClick:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={isRecording ? "destructive" : "outline"}
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className={`transition-all ${isRecording ? 'animate-pulse' : ''}`}
      >
        {isRecording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      {currentTranscript && (
        <span className="text-sm text-muted-foreground italic">
          "{currentTranscript}"
        </span>
      )}
    </div>
  );
};
