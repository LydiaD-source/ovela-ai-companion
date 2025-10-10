import React, { useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRealtimeSTT } from '@/hooks/useRealtimeSTT';
import { featureFlags } from '@/config/featureFlags';

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
    mode,
    connect,
    disconnect,
    startRecording,
    stopRecording
  } = useRealtimeSTT({
    onTranscript: (text, isFinal) => {
      console.log('Received transcript:', text, 'Final:', isFinal);
      onTranscript(text);
    }
  });

  useEffect(() => {
    if (currentTranscript) {
      console.log('Current transcript updated:', currentTranscript);
    }
  }, [currentTranscript]);

  const handleClick = async () => {
    if (!isConnected) {
      await connect();
      setTimeout(() => startRecording(), 500);
    } else if (isRecording) {
      stopRecording();
    } else {
      startRecording();
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
        title={featureFlags.realtime_stt_enabled ? `Realtime mode: ${mode}` : 'Record mode'}
      >
        {isRecording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      {isRecording && featureFlags.realtime_stt_enabled && (
        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md">
          Listening...
        </span>
      )}
    </div>
  );
};
