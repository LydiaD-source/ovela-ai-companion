import { useState, useRef, useCallback, useEffect } from 'react';

interface UseWebSpeechSTTProps {
  onFinalTranscript?: (text: string) => void;
  lang?: string;
}

interface UseWebSpeechSTTReturn {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  finalTranscript: string;
  start: () => void;
  stop: () => void;
  error: string | null;
}

// Extend Window interface for Speech Recognition
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export const useWebSpeechSTT = ({
  onFinalTranscript,
  lang = 'en-US'
}: UseWebSpeechSTTProps = {}): UseWebSpeechSTTReturn => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  
  // Check browser support
  const SpeechRecognitionAPI = typeof window !== 'undefined' 
    ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
    : null;
  const isSupported = !!SpeechRecognitionAPI;

  // Initialize recognition instance
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      console.log('[WebSpeechSTT] 🎙️ Recognition started');
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      console.log('[WebSpeechSTT] 🛑 Recognition ended');
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[WebSpeechSTT] ❌ Error:', event.error);
      
      // Don't show error for aborted (user stopped) or no-speech
      if (event.error === 'aborted' || event.error === 'no-speech') {
        setIsListening(false);
        return;
      }
      
      setError(event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      // Update interim transcript (shows as user speaks)
      if (interim) {
        console.log('[WebSpeechSTT] 📝 Interim:', interim);
        setInterimTranscript(interim);
      }

      // When we get final transcript, accumulate it
      if (final) {
        console.log('[WebSpeechSTT] ✅ Final:', final);
        setFinalTranscript(prev => {
          const newFinal = prev ? `${prev} ${final}` : final;
          return newFinal;
        });
        setInterimTranscript(''); // Clear interim when we have final
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [SpeechRecognitionAPI, lang]);

  const start = useCallback(() => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }

    // Reset transcripts on new session
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);

    try {
      recognitionRef.current?.start();
    } catch (e) {
      // Already started
      console.log('[WebSpeechSTT] Already running');
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      
      // Combine final + any remaining interim as the complete transcript
      const completeTranscript = finalTranscript + (interimTranscript ? ' ' + interimTranscript : '');
      
      if (completeTranscript.trim() && onFinalTranscript) {
        console.log('[WebSpeechSTT] 📤 Complete transcript:', completeTranscript.trim());
        onFinalTranscript(completeTranscript.trim());
      }
      
      // Reset for next use
      setInterimTranscript('');
      setFinalTranscript('');
    }
  }, [finalTranscript, interimTranscript, onFinalTranscript]);

  return {
    isListening,
    isSupported,
    interimTranscript,
    finalTranscript,
    start,
    stop,
    error
  };
};
