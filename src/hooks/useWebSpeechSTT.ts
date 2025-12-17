import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * TURN-BASED SPEECH-TO-TEXT - Clean Implementation
 * 
 * Simple approach:
 * - STOP recognition when AI speaks
 * - START recognition when AI finishes
 * - No trying to keep recognition alive while ignoring results
 */

// Module-level state - survives component remounts
let globalIsActive = false;
let globalAISpeaking = false;
let globalLastSentText = '';
let globalLastSentTime = 0;

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
  conversationPhase: 'idle' | 'listening' | 'processing' | 'ai_speaking';
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

const SpeechRecognitionAPI = typeof window !== 'undefined' 
  ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
  : null;

const DUPLICATE_WINDOW_MS = 3000;
const MIN_MESSAGE_LENGTH = 2;

export const useWebSpeechSTT = ({
  onAutoSend,
  lang = 'en-US',
  silenceTimeout = 800
}: UseWebSpeechSTTProps = {}): UseWebSpeechSTTReturn => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conversationPhase, setConversationPhase] = useState<'idle' | 'listening' | 'processing' | 'ai_speaking'>('idle');
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Transcript buffers
  const interimRef = useRef('');
  const finalRef = useRef('');
  const onAutoSendRef = useRef(onAutoSend);
  
  useEffect(() => {
    onAutoSendRef.current = onAutoSend;
  }, [onAutoSend]);
  
  const isSupported = !!SpeechRecognitionAPI;

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const resetTranscripts = useCallback(() => {
    interimRef.current = '';
    finalRef.current = '';
    setInterimTranscript('');
    setFinalTranscript('');
  }, []);

  // Force stop recognition
  const forceStopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        console.log('[STT] 🛑 Recognition force stopped');
      } catch (e) {
        // Ignore
      }
    }
    setIsListening(false);
  }, []);

  // Force start recognition
  const forceStartRecognition = useCallback(() => {
    if (!recognitionRef.current) {
      console.log('[STT] ❌ No recognition instance');
      return;
    }
    
    // First ensure it's stopped
    try {
      recognitionRef.current.abort();
    } catch (e) {
      // Ignore
    }
    
    // Small delay then start fresh
    setTimeout(() => {
      if (!globalAISpeaking && globalIsActive && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          console.log('[STT] ✅ Recognition force started');
        } catch (e: any) {
          console.log('[STT] ⚠️ Start error:', e.message);
          // Retry once more
          setTimeout(() => {
            if (!globalAISpeaking && globalIsActive && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log('[STT] ✅ Retry succeeded');
              } catch (e2) {
                console.log('[STT] ❌ Retry failed');
              }
            }
          }, 200);
        }
      }
    }, 100);
  }, []);

  const autoSendMessage = useCallback(() => {
    if (globalAISpeaking) {
      return;
    }

    const message = (finalRef.current + ' ' + interimRef.current).trim();
    if (!message || message.length < MIN_MESSAGE_LENGTH) {
      return;
    }

    // Duplicate check
    const now = Date.now();
    if (message === globalLastSentText && (now - globalLastSentTime) < DUPLICATE_WINDOW_MS) {
      console.log('[STT] 🚫 Duplicate prevented:', message);
      resetTranscripts();
      return;
    }

    console.log('[STT] 📤 AUTO-SEND:', message);
    globalLastSentText = message;
    globalLastSentTime = now;
    
    setConversationPhase('processing');
    resetTranscripts();
    
    if (onAutoSendRef.current) {
      onAutoSendRef.current(message);
    }
  }, [resetTranscripts]);

  // Initialize recognition
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      console.log('[STT] 🎙️ Recognition STARTED');
      setIsListening(true);
      setError(null);
      if (!globalAISpeaking) {
        setConversationPhase('listening');
      }
    };

    recognition.onend = () => {
      console.log('[STT] 🛑 Recognition ENDED | active:', globalIsActive, '| aiSpeaking:', globalAISpeaking);
      setIsListening(false);
      
      // ONLY auto-restart if active AND AI not speaking
      if (globalIsActive && !globalAISpeaking) {
        console.log('[STT] 🔄 Auto-restarting in onend...');
        setTimeout(() => {
          if (globalIsActive && !globalAISpeaking && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              console.log('[STT] ✅ Auto-restart succeeded');
            } catch (e) {
              console.log('[STT] ⚠️ Auto-restart failed');
            }
          }
        }, 150);
      } else if (!globalIsActive) {
        setConversationPhase('idle');
      }
      // If AI is speaking, we do nothing - setAISpeaking(false) will restart
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted' || event.error === 'no-speech') {
        return;
      }
      console.log('[STT] ⚠️ Error:', event.error);
      setError(event.error);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Skip if AI is speaking
      if (globalAISpeaking) {
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

      // Silence detection
      clearSilenceTimer();
      const currentText = (finalRef.current + ' ' + interimRef.current).trim();
      if (currentText.length >= MIN_MESSAGE_LENGTH && !globalAISpeaking) {
        silenceTimerRef.current = setTimeout(() => {
          autoSendMessage();
        }, silenceTimeout);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearSilenceTimer();
      try { recognition.abort(); } catch (e) {}
    };
  }, [lang, silenceTimeout, clearSilenceTimer, autoSendMessage]);

  // PUBLIC API
  
  const start = useCallback(() => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }

    console.log('[STT] ▶️ START (user initiated)');
    globalIsActive = true;
    globalAISpeaking = false;
    resetTranscripts();
    setError(null);
    setConversationPhase('listening');
    forceStartRecognition();
  }, [isSupported, resetTranscripts, forceStartRecognition]);

  const stop = useCallback(() => {
    console.log('[STT] ⏹️ STOP');
    clearSilenceTimer();
    
    // Send pending text
    const text = (finalRef.current + ' ' + interimRef.current).trim();
    if (text && text.length >= MIN_MESSAGE_LENGTH && onAutoSendRef.current) {
      const now = Date.now();
      if (text !== globalLastSentText || (now - globalLastSentTime) >= DUPLICATE_WINDOW_MS) {
        globalLastSentText = text;
        globalLastSentTime = now;
        onAutoSendRef.current(text);
      }
    }
    
    globalIsActive = false;
    globalAISpeaking = false;
    
    forceStopRecognition();
    resetTranscripts();
    setConversationPhase('idle');
  }, [clearSilenceTimer, resetTranscripts, forceStopRecognition]);

  /**
   * TURN CONTROL - Simple and Clean
   * 
   * AI starts speaking → STOP recognition
   * AI finishes speaking → START recognition
   */
  const setAISpeaking = useCallback((speaking: boolean) => {
    console.log('[STT] 🔊 setAISpeaking:', speaking, '| globalActive:', globalIsActive);
    
    if (speaking) {
      // === AI STARTS SPEAKING ===
      globalAISpeaking = true;
      clearSilenceTimer();
      setConversationPhase('ai_speaking');
      resetTranscripts();
      
      // Auto-activate conversation if not already
      if (!globalIsActive) {
        console.log('[STT] 🚀 Auto-activating conversation');
        globalIsActive = true;
      }
      
      // STOP recognition while AI speaks
      forceStopRecognition();
      
    } else {
      // === AI FINISHES SPEAKING ===
      globalAISpeaking = false;
      
      console.log('[STT] ▶️ AI finished speaking | globalActive:', globalIsActive);
      
      if (globalIsActive) {
        console.log('[STT] ▶️ Starting user turn');
        setConversationPhase('listening');
        
        // START recognition for user's turn
        forceStartRecognition();
      }
    }
  }, [clearSilenceTimer, resetTranscripts, forceStopRecognition, forceStartRecognition]);

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
