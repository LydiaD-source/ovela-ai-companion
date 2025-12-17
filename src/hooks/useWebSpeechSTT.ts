import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * TURN-BASED SPEECH-TO-TEXT
 * 
 * Uses module-level state to survive component remounts.
 * This ensures the conversation state persists even if React re-renders.
 */

// MODULE-LEVEL STATE - survives component remounts
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
  // React state for UI
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conversationPhase, setConversationPhase] = useState<'idle' | 'listening' | 'processing' | 'ai_speaking'>('idle');
  
  // Refs for recognition instance and timers
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecognitionRunningRef = useRef(false);
  
  // Transcript buffers
  const interimRef = useRef('');
  const finalRef = useRef('');
  const onAutoSendRef = useRef(onAutoSend);
  
  // Sync callback ref
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

  const startRecognition = useCallback(() => {
    if (!recognitionRef.current) {
      console.log('[STT] ❌ No recognition instance');
      return;
    }
    
    if (isRecognitionRunningRef.current) {
      console.log('[STT] ℹ️ Already running');
      return;
    }
    
    try {
      recognitionRef.current.start();
      console.log('[STT] ✅ Recognition started');
    } catch (e: any) {
      if (e.message?.includes('already started')) {
        console.log('[STT] ℹ️ Already running (caught)');
        isRecognitionRunningRef.current = true;
      } else {
        console.log('[STT] ⚠️ Start failed:', e.message);
        setTimeout(() => {
          if (!isRecognitionRunningRef.current && recognitionRef.current) {
            try { 
              recognitionRef.current.start(); 
              console.log('[STT] ✅ Retry succeeded');
            } catch (e2) {
              console.log('[STT] ❌ Retry failed');
            }
          }
        }, 150);
      }
    }
  }, []);

  const autoSendMessage = useCallback(() => {
    if (globalAISpeaking) {
      console.log('[STT] ⏸️ Not sending - AI speaking');
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
      isRecognitionRunningRef.current = true;
      setIsListening(true);
      setError(null);
      if (!globalAISpeaking) {
        setConversationPhase('listening');
      }
    };

    recognition.onend = () => {
      console.log('[STT] 🛑 Recognition ENDED | globalActive:', globalIsActive, '| globalAISpeaking:', globalAISpeaking);
      isRecognitionRunningRef.current = false;
      setIsListening(false);
      
      // Auto-restart if active and AI not speaking
      if (globalIsActive && !globalAISpeaking) {
        console.log('[STT] 🔄 Auto-restarting...');
        setTimeout(() => {
          if (globalIsActive && !globalAISpeaking && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('[STT] ⚠️ Restart failed in onend');
            }
          }
        }, 100);
      } else if (!globalIsActive) {
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
      if (globalAISpeaking) {
        return; // Silent ignore while AI speaks
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
      isRecognitionRunningRef.current = false;
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
    startRecognition();
  }, [isSupported, resetTranscripts, startRecognition]);

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
    isRecognitionRunningRef.current = false;
    
    try { recognitionRef.current?.stop(); } catch (e) {}
    
    resetTranscripts();
    setConversationPhase('idle');
    setIsListening(false);
  }, [clearSilenceTimer, resetTranscripts]);

  /**
   * TURN CONTROL - Uses global state to survive remounts
   */
  const setAISpeaking = useCallback((speaking: boolean) => {
    console.log('[STT] 🔊 setAISpeaking:', speaking, '| globalActive:', globalIsActive);
    
    if (speaking) {
      // AI STARTED SPEAKING
      globalAISpeaking = true;
      clearSilenceTimer();
      setConversationPhase('ai_speaking');
      resetTranscripts();
      
      // Auto-activate conversation
      if (!globalIsActive) {
        console.log('[STT] 🚀 Auto-activating conversation');
        globalIsActive = true;
      }
      
    } else {
      // AI FINISHED SPEAKING
      const wasActive = globalIsActive;
      globalAISpeaking = false;
      
      console.log('[STT] ▶️ AI finished | wasActive:', wasActive);
      
      if (wasActive) {
        console.log('[STT] ▶️ Starting user turn NOW');
        setConversationPhase('listening');
        
        // Force start recognition
        setTimeout(() => {
          if (!globalAISpeaking && globalIsActive) {
            startRecognition();
          }
        }, 50);
      }
    }
  }, [clearSilenceTimer, resetTranscripts, startRecognition]);

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
