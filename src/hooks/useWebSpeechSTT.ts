import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * TURN-BASED SPEECH-TO-TEXT - Bulletproof Version
 * 
 * Key fixes:
 * - No dependency on wasAISpeaking (refs can reset on remount)
 * - Duplicate send prevention with lastSentText tracking
 * - Aggressive restart when AI finishes speaking
 */

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
  
  // State tracking with refs
  const isActiveRef = useRef(false);
  const aiSpeakingRef = useRef(false);
  const isRecognitionRunningRef = useRef(false);
  
  // Transcript tracking
  const interimRef = useRef('');
  const finalRef = useRef('');
  const onAutoSendRef = useRef(onAutoSend);
  
  // DUPLICATE PREVENTION: Track last sent text and timestamp
  const lastSentTextRef = useRef('');
  const lastSentTimeRef = useRef(0);
  const DUPLICATE_WINDOW_MS = 3000; // 3 seconds
  
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

  const resetTranscripts = useCallback(() => {
    interimRef.current = '';
    finalRef.current = '';
    setInterimTranscript('');
    setFinalTranscript('');
  }, []);

  // Start recognition safely
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
        // Retry once after delay
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
    if (aiSpeakingRef.current) {
      console.log('[STT] ⏸️ Not sending - AI speaking');
      return;
    }

    const message = (finalRef.current + ' ' + interimRef.current).trim();
    if (!message || message.length < MIN_MESSAGE_LENGTH) {
      return;
    }

    // DUPLICATE CHECK: Don't send same text within window
    const now = Date.now();
    if (message === lastSentTextRef.current && (now - lastSentTimeRef.current) < DUPLICATE_WINDOW_MS) {
      console.log('[STT] 🚫 Duplicate prevented:', message);
      resetTranscripts();
      return;
    }

    console.log('[STT] 📤 AUTO-SEND:', message);
    lastSentTextRef.current = message;
    lastSentTimeRef.current = now;
    
    setConversationPhase('processing');
    resetTranscripts();
    
    if (onAutoSendRef.current) {
      onAutoSendRef.current(message);
    }
  }, [resetTranscripts]);

  // Initialize recognition ONCE
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
      if (!aiSpeakingRef.current) {
        setConversationPhase('listening');
      }
    };

    recognition.onend = () => {
      console.log('[STT] 🛑 Recognition ENDED | active:', isActiveRef.current, '| aiSpeaking:', aiSpeakingRef.current);
      isRecognitionRunningRef.current = false;
      setIsListening(false);
      
      // Auto-restart if conversation is active and AI not speaking
      if (isActiveRef.current && !aiSpeakingRef.current) {
        console.log('[STT] 🔄 Auto-restarting (onend)');
        setTimeout(() => startRecognition(), 100);
      } else if (!isActiveRef.current) {
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
      // GUARD: Ignore results while AI is speaking
      if (aiSpeakingRef.current) {
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

      // Silence detection for auto-send
      clearSilenceTimer();
      const currentText = (finalRef.current + ' ' + interimRef.current).trim();
      if (currentText.length >= MIN_MESSAGE_LENGTH && !aiSpeakingRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          autoSendMessage();
        }, silenceTimeout);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearSilenceTimer();
      isActiveRef.current = false;
      isRecognitionRunningRef.current = false;
      try { recognition.abort(); } catch (e) {}
    };
  }, [SpeechRecognitionAPI, lang, silenceTimeout, clearSilenceTimer, autoSendMessage, startRecognition]);

  // ========== PUBLIC API ==========
  
  const start = useCallback(() => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }

    console.log('[STT] ▶️ START (user initiated)');
    isActiveRef.current = true;
    aiSpeakingRef.current = false;
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
      // Check duplicate before sending
      const now = Date.now();
      if (text !== lastSentTextRef.current || (now - lastSentTimeRef.current) >= DUPLICATE_WINDOW_MS) {
        lastSentTextRef.current = text;
        lastSentTimeRef.current = now;
        onAutoSendRef.current(text);
      }
    }
    
    isActiveRef.current = false;
    aiSpeakingRef.current = false;
    isRecognitionRunningRef.current = false;
    
    try { recognitionRef.current?.stop(); } catch (e) {}
    
    resetTranscripts();
    setConversationPhase('idle');
    setIsListening(false);
  }, [clearSilenceTimer, resetTranscripts]);

  /**
   * TURN CONTROL
   * 
   * When AI starts speaking: pause STT, set phase
   * When AI finishes speaking: ALWAYS restart STT if active
   */
  const setAISpeaking = useCallback((speaking: boolean) => {
    console.log('[STT] 🔊 setAISpeaking:', speaking, '| active:', isActiveRef.current, '| running:', isRecognitionRunningRef.current);
    
    if (speaking) {
      // === AI STARTED SPEAKING ===
      aiSpeakingRef.current = true;
      clearSilenceTimer();
      setConversationPhase('ai_speaking');
      resetTranscripts();
      
      // Auto-activate conversation (text message triggered AI response)
      if (!isActiveRef.current) {
        console.log('[STT] 🚀 Auto-activating conversation for voice response');
        isActiveRef.current = true;
      }
      
    } else {
      // === AI FINISHED SPEAKING ===
      aiSpeakingRef.current = false;
      
      // ALWAYS restart if conversation is active
      if (isActiveRef.current) {
        console.log('[STT] ▶️ AI finished → Starting user turn NOW');
        setConversationPhase('listening');
        
        // Force restart recognition
        setTimeout(() => {
          if (!aiSpeakingRef.current && isActiveRef.current) {
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
