/**
 * useWebSpeechSTT - Optimized Turn-Based Speech-to-Text
 * 
 * Features:
 * - Module-level state for robustness across remounts
 * - Simple turn management: STOP when AI speaks, START when AI finishes
 * - Auto-restart on silence, duplicate prevention
 * - Multi-language support
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

const DUPLICATE_WINDOW_MS = 2500;
const MIN_MESSAGE_LENGTH = 2;
const RESTART_DELAY_MS = 100;

import { useState, useRef, useCallback, useEffect } from 'react';

export const useWebSpeechSTT = ({
  onAutoSend,
  lang = 'en-US',
  silenceTimeout = 700
}: UseWebSpeechSTTProps = {}): UseWebSpeechSTTReturn => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conversationPhase, setConversationPhase] = useState<'idle' | 'listening' | 'processing' | 'ai_speaking'>('idle');
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const interimRef = useRef('');
  const finalRef = useRef('');
  const onAutoSendRef = useRef(onAutoSend);
  
  const isSupported = !!SpeechRecognitionAPI;

  // Keep callback ref updated
  useEffect(() => {
    onAutoSendRef.current = onAutoSend;
  }, [onAutoSend]);

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const resetTranscripts = useCallback(() => {
    interimRef.current = '';
    finalRef.current = '';
    setInterimTranscript('');
    setFinalTranscript('');
  }, []);

  const stopRecognition = useCallback(() => {
    clearTimers();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore - may already be stopped
      }
    }
    setIsListening(false);
  }, [clearTimers]);

  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || globalAISpeaking) return;
    
    // Ensure stopped first
    stopRecognition();
    
    restartTimerRef.current = setTimeout(() => {
      if (!globalAISpeaking && globalIsActive && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // May fail if already running - ignore
        }
      }
    }, RESTART_DELAY_MS);
  }, [stopRecognition]);

  const sendMessage = useCallback((text: string) => {
    if (globalAISpeaking || !text || text.length < MIN_MESSAGE_LENGTH) return;

    const now = Date.now();
    if (text === globalLastSentText && (now - globalLastSentTime) < DUPLICATE_WINDOW_MS) {
      resetTranscripts();
      return;
    }

    globalLastSentText = text;
    globalLastSentTime = now;
    
    setConversationPhase('processing');
    resetTranscripts();
    
    onAutoSendRef.current?.(text);
  }, [resetTranscripts]);

  // Initialize recognition instance
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      if (!globalAISpeaking) {
        setConversationPhase('listening');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      
      // Auto-restart if session active and AI not speaking
      if (globalIsActive && !globalAISpeaking) {
        restartTimerRef.current = setTimeout(() => {
          if (globalIsActive && !globalAISpeaking && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // Ignore
            }
          }
        }, RESTART_DELAY_MS);
      } else if (!globalIsActive) {
        setConversationPhase('idle');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Ignore common non-error states
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      setError(event.error);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (globalAISpeaking) return;

      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          // Accept if confidence is good OR if confidence is 0 (some browsers)
          if (confidence > 0.4 || confidence === 0) {
            final += transcript;
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

      // Silence detection - send after user pauses
      clearTimers();
      const currentText = (finalRef.current + ' ' + interimRef.current).trim();
      if (currentText.length >= MIN_MESSAGE_LENGTH && !globalAISpeaking) {
        silenceTimerRef.current = setTimeout(() => {
          sendMessage(currentText);
        }, silenceTimeout);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearTimers();
      try { recognition.abort(); } catch {}
    };
  }, [lang, silenceTimeout, clearTimers, sendMessage]);

  // PUBLIC API
  
  const start = useCallback(() => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }

    globalIsActive = true;
    globalAISpeaking = false;
    resetTranscripts();
    setError(null);
    setConversationPhase('listening');
    startRecognition();
  }, [isSupported, resetTranscripts, startRecognition]);

  const stop = useCallback(() => {
    clearTimers();
    
    // Send any pending text
    const text = (finalRef.current + ' ' + interimRef.current).trim();
    if (text && text.length >= MIN_MESSAGE_LENGTH) {
      const now = Date.now();
      if (text !== globalLastSentText || (now - globalLastSentTime) >= DUPLICATE_WINDOW_MS) {
        globalLastSentText = text;
        globalLastSentTime = now;
        onAutoSendRef.current?.(text);
      }
    }
    
    globalIsActive = false;
    globalAISpeaking = false;
    
    stopRecognition();
    resetTranscripts();
    setConversationPhase('idle');
  }, [clearTimers, resetTranscripts, stopRecognition]);

  /**
   * Turn Control
   * AI starts → STOP recognition
   * AI finishes → START recognition
   */
  const setAISpeaking = useCallback((speaking: boolean) => {
    if (speaking) {
      // AI starts speaking
      globalAISpeaking = true;
      clearTimers();
      setConversationPhase('ai_speaking');
      resetTranscripts();
      
      // Ensure session is active
      if (!globalIsActive) {
        globalIsActive = true;
      }
      
      stopRecognition();
    } else {
      // AI finishes speaking
      globalAISpeaking = false;
      
      if (globalIsActive) {
        setConversationPhase('listening');
        startRecognition();
      }
    }
  }, [clearTimers, resetTranscripts, stopRecognition, startRecognition]);

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
