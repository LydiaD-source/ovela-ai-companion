import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RealtimeVoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const ENABLE_STT_TESTING = true; // limits to ~5s and logs
const TRANSCRIBE_URL = 'https://vrpgowcocbztclxfzssu.supabase.co/functions/v1/transcribe';

export const RealtimeVoiceButton: React.FC<RealtimeVoiceButtonProps> = ({ 
  onTranscript,
  disabled 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<string>('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
  }, []);

  const handleClick = async () => {
    if (isRecording) {
      recorderRef.current?.stop();
      return;
    }

    try {
      setStatus('Listening…');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data?.size) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        setIsRecording(false);
        setStatus('Transcribing…');
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const form = new FormData();
        form.append('file', blob, 'recording.webm');
        try {
          const resp = await fetch(TRANSCRIBE_URL, { method: 'POST', body: form });
          const data = await resp.json();
          if (!resp.ok || !data?.text) throw new Error(data?.error || 'Transcription failed');
          console.log('Transcribed:', data.text);
          setStatus('');
          onTranscript(data.text);
        } catch (err) {
          console.error('STT error', err);
          setStatus('');
        }
      };

      recorder.start();
      setIsRecording(true);

      if (ENABLE_STT_TESTING) {
        stopTimerRef.current = window.setTimeout(() => {
          if (recorder.state === 'recording') recorder.stop();
        }, 5000);
      }

      recorderRef.current = recorder;
    } catch (e) {
      console.error('Mic error', e);
      setIsRecording(false);
      setStatus('');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={isRecording ? 'destructive' : 'secondary'}
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        title={isRecording ? 'Stop recording' : 'Speak'}
        className={`transition-all ${isRecording ? 'animate-pulse' : ''}`}
      >
        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      {status && (
        <span className="text-sm text-muted-foreground italic">{status}</span>
      )}
    </div>
  );
};
