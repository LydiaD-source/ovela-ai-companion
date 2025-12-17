import { useState, useRef, useCallback, useEffect } from 'react';

interface UseWebSpeechSTTProps {
  onAutoSend?: (text: string) => void;
  lang?: string;
  silenceTimeout?: number; // ms before auto-send (default 1000)
  continuous?: boolean; // keep mic active after send (default true)
}

interface UseWebSpeechSTTReturn {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  finalTranscript: string;
  conversationPhase: 'idle' | 'listening' | 'processing' | 'waiting';
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
  onAutoSend,
  lang = 'en-US',
  silenceTimeout = 1000,
  continuous = true
}: UseWebSpeechSTTProps = {}): UseWebSpeechSTTReturn => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conversationPhase, setConversationPhase] = useState<'idle' | 'listening' | 'processing' | 'waiting'>('idle');
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSentRef = useRef(false);
  const shouldRestartRef = useRef(false);
  
  // Check browser support
  const SpeechRecognitionAPI = typeof window !== 'undefined' 
    ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
    : null;
  const isSupported = !!SpeechRecognitionAPI;

  // Clear silence timer
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Auto-send function with double-send protection
  const autoSendMessage = useCallback(() => {
    if (hasSentRef.current) {
      console.log('[WebSpeechSTT] ⏳ Already sent, skipping');
      return;
    }

    const currentFinal = finalTranscript;
    const currentInterim = interimTranscript;
    const message = (currentFinal + ' ' + currentInterim).trim();
    
    if (!message) {
      console.log('[WebSpeechSTT] 📭 No message to send');
      return;
    }

    console.log('[WebSpeechSTT] 📤 Auto-sending:', message);
    hasSentRef.current = true;
    setConversationPhase('processing');
    
    // Clear transcripts
    setFinalTranscript('');
    setInterimTranscript('');
    
    // Call the send callback
    if (onAutoSend) {
      onAutoSend(message);
    }

    // Reset send guard after short delay
    setTimeout(() => {
      hasSentRef.current = false;
      if (continuous && shouldRestartRef.current) {
        setConversationPhase('waiting');
      }
    }, 500);
  }, [finalTranscript, interimTranscript, onAutoSend, continuous]);

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
      setConversationPhase('listening');
      setError(null);
      hasSentRef.current = false;
    };

    recognition.onend = () => {
      console.log('[WebSpeechSTT] 🛑 Recognition ended');
      setIsListening(false);
      
      // Auto-restart if continuous mode and we should continue
      if (continuous && shouldRestartRef.current && !hasSentRef.current) {
        console.log('[WebSpeechSTT] 🔄 Auto-restarting recognition');
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.log('[WebSpeechSTT] Could not restart:', e);
          }
        }, 100);
      } else if (!shouldRestartRef.current) {
        setConversationPhase('idle');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[WebSpeechSTT] ❌ Error:', event.error);
      
      // Don't show error for aborted (user stopped) or no-speech
      if (event.error === 'aborted' || event.error === 'no-speech') {
        // For no-speech, restart if continuous
        if (event.error === 'no-speech' && continuous && shouldRestartRef.current) {
          console.log('[WebSpeechSTT] 🔄 Restarting after no-speech');
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              console.log('[WebSpeechSTT] Could not restart:', e);
            }
          }, 100);
        }
        return;
      }
      
      setError(event.error);
      setIsListening(false);
      setConversationPhase('idle');
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
        console.log('[WebSpeechSTT] ✅ Final segment:', final);
        setFinalTranscript(prev => {
          const newFinal = prev ? `${prev} ${final}` : final;
          return newFinal;
        });
        setInterimTranscript(''); // Clear interim when we have final
      }

      // Reset silence timer on every speech event
      clearSilenceTimer();
      
      silenceTimerRef.current = setTimeout(() => {
        console.log('[WebSpeechSTT] ⏰ Silence detected, auto-sending');
        autoSendMessage();
      }, silenceTimeout);
    };

    recognitionRef.current = recognition;

    return () => {
      clearSilenceTimer();
      shouldRestartRef.current = false;
      recognition.abort();
    };
  }, [SpeechRecognitionAPI, lang, silenceTimeout, continuous, clearSilenceTimer, autoSendMessage]);

  const start = useCallback(() => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }

    // Reset state for new session
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);
    hasSentRef.current = false;
    shouldRestartRef.current = true;
    setConversationPhase('listening');

    try {
      recognitionRef.current?.start();
    } catch (e) {
      // Already started
      console.log('[WebSpeechSTT] Already running');
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    clearSilenceTimer();
    shouldRestartRef.current = false;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      
      // Send any remaining transcript
      const completeTranscript = (finalTranscript + ' ' + interimTranscript).trim();
      
      if (completeTranscript && onAutoSend && !hasSentRef.current) {
        console.log('[WebSpeechSTT] 📤 Sending on stop:', completeTranscript);
        hasSentRef.current = true;
        onAutoSend(completeTranscript);
      }
      
      // Reset transcripts
      setInterimTranscript('');
      setFinalTranscript('');
      setConversationPhase('idle');
    }
  }, [finalTranscript, interimTranscript, onAutoSend, clearSilenceTimer]);

  return {
    isListening,
    isSupported,
    interimTranscript,
    finalTranscript,
    conversationPhase,
    start,
    stop,
    error
  };
};
