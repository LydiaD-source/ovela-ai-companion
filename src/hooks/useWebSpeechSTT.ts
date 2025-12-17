import { useState, useRef, useCallback, useEffect } from 'react';

interface UseWebSpeechSTTProps {
  onAutoSend?: (text: string) => void;
  lang?: string;
  silenceTimeout?: number;
}

interface UseWebSpeechSTTReturn {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  finalTranscript: string;
  conversationPhase: 'idle' | 'listening' | 'processing' | 'ai_speaking' | 'waiting';
  start: () => void;
  stop: () => void;
  setAISpeaking: (speaking: boolean) => void;
  error: string | null;
}

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
  onAutoSend,
  lang = 'en-US',
  silenceTimeout = 1200
}: UseWebSpeechSTTProps = {}): UseWebSpeechSTTReturn => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conversationPhase, setConversationPhase] = useState<'idle' | 'listening' | 'processing' | 'ai_speaking' | 'waiting'>('idle');
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSentRef = useRef(false);
  const hasSpokenRef = useRef(false);
  const conversationActiveRef = useRef(false);
  const mutedRef = useRef(false); // Mute instead of stop - ignore input while AI speaks
  
  const interimRef = useRef('');
  const finalRef = useRef('');
  const onAutoSendRef = useRef(onAutoSend);
  
  const MIN_MESSAGE_LENGTH = 2;
  
  useEffect(() => {
    onAutoSendRef.current = onAutoSend;
  }, [onAutoSend]);
  
  const SpeechRecognitionAPI = typeof window !== 'undefined' 
    ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
    : null;
  const isSupported = !!SpeechRecognitionAPI;

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const autoSendMessage = useCallback(() => {
    if (hasSentRef.current || !hasSpokenRef.current || mutedRef.current) {
      return;
    }

    const message = (finalRef.current + ' ' + interimRef.current).trim();
    if (!message || message.length < MIN_MESSAGE_LENGTH) {
      return;
    }

    console.log('[STT] 📤 SENDING:', message);
    hasSentRef.current = true;
    hasSpokenRef.current = false;
    mutedRef.current = true; // Mute while processing
    setConversationPhase('processing');
    
    // Clear transcripts but keep recognition running
    finalRef.current = '';
    interimRef.current = '';
    setFinalTranscript('');
    setInterimTranscript('');
    
    if (onAutoSendRef.current) {
      onAutoSendRef.current(message);
    }

    setTimeout(() => {
      hasSentRef.current = false;
    }, 500);
  }, []);

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      console.log('[STT] 🎙️ Started');
      setIsListening(true);
      if (!mutedRef.current) {
        setConversationPhase('listening');
      }
      setError(null);
    };

    recognition.onend = () => {
      console.log('[STT] 🛑 Ended, active:', conversationActiveRef.current);
      setIsListening(false);
      
      // Auto-restart to keep continuous listening
      if (conversationActiveRef.current) {
        console.log('[STT] 🔄 Auto-restarting...');
        setTimeout(() => {
          if (conversationActiveRef.current) {
            try {
              recognition.start();
            } catch (e) {
              console.log('[STT] Restart failed:', e);
            }
          }
        }, 100);
      } else {
        setConversationPhase('idle');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted' || event.error === 'no-speech') {
        return;
      }
      console.log('[STT] ⚠️ Error:', event.error);
      setError(event.error);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // IGNORE all input while muted (AI speaking or processing)
      if (mutedRef.current) {
        console.log('[STT] 🔇 Ignoring input (muted)');
        return;
      }

      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          if (confidence > 0.4 || confidence === 0) {
            final += transcript;
            console.log('[STT] ✅ Final:', transcript);
          }
        } else {
          interim += transcript;
        }
      }

      const totalText = (finalRef.current + ' ' + final + ' ' + interim).trim();
      if (totalText.length >= MIN_MESSAGE_LENGTH) {
        hasSpokenRef.current = true;
      }

      if (interim) {
        interimRef.current = interim;
        setInterimTranscript(interim);
      }

      if (final) {
        const newFinal = finalRef.current ? `${finalRef.current} ${final}` : final;
        finalRef.current = newFinal;
        setFinalTranscript(newFinal);
        interimRef.current = '';
        setInterimTranscript('');
      }

      clearSilenceTimer();
      
      if (hasSpokenRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          autoSendMessage();
        }, silenceTimeout);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearSilenceTimer();
      conversationActiveRef.current = false;
      recognition.abort();
    };
  }, [SpeechRecognitionAPI, lang, silenceTimeout, clearSilenceTimer, autoSendMessage]);

  const start = useCallback(() => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }

    console.log('[STT] ▶️ START');
    
    interimRef.current = '';
    finalRef.current = '';
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);
    hasSentRef.current = false;
    hasSpokenRef.current = false;
    conversationActiveRef.current = true;
    mutedRef.current = false;
    setConversationPhase('listening');

    try {
      recognitionRef.current?.start();
    } catch (e) {
      setTimeout(() => {
        try {
          recognitionRef.current?.start();
        } catch (e2) {
          console.error('[STT] Start failed:', e2);
        }
      }, 100);
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    console.log('[STT] ⏹️ STOP');
    clearSilenceTimer();
    conversationActiveRef.current = false;
    mutedRef.current = false;
    
    const text = (finalRef.current + ' ' + interimRef.current).trim();
    if (text && text.length >= MIN_MESSAGE_LENGTH && onAutoSendRef.current && !hasSentRef.current) {
      hasSentRef.current = true;
      onAutoSendRef.current(text);
    }
    
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    
    interimRef.current = '';
    finalRef.current = '';
    setInterimTranscript('');
    setFinalTranscript('');
    setConversationPhase('idle');
    setIsListening(false);
  }, [clearSilenceTimer]);

  const setAISpeaking = useCallback((speaking: boolean) => {
    console.log('[STT] 🔊 AI speaking:', speaking);
    
    if (speaking) {
      // Mute - ignore input but keep recognition running
      mutedRef.current = true;
      clearSilenceTimer();
      setConversationPhase('ai_speaking');
      // Clear any partial transcripts from AI voice pickup
      interimRef.current = '';
      finalRef.current = '';
      setInterimTranscript('');
      setFinalTranscript('');
      hasSpokenRef.current = false;
    } else {
      // Unmute - start accepting input again
      if (conversationActiveRef.current) {
        console.log('[STT] ▶️ AI done, unmuting');
        // Small delay to let AI audio fully stop
        setTimeout(() => {
          mutedRef.current = false;
          hasSentRef.current = false;
          hasSpokenRef.current = false;
          setConversationPhase('listening');
        }, 300);
      }
    }
  }, [clearSilenceTimer]);

  return {
    isListening,
    isSupported,
    interimTranscript,
    finalTranscript,
    conversationPhase,
    start,
    stop,
    setAISpeaking,
    error
  };
};
