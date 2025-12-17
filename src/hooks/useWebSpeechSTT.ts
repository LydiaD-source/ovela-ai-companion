import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * SIMPLE TURN-BASED SPEECH-TO-TEXT
 * 
 * Industry-standard approach (Alexa, Siri, Google Assistant):
 * - Recognition automatically starts when AI finishes speaking
 * - Recognition pauses (results ignored) when AI speaks
 * - No complex session management needed
 * - Self-managing lifecycle
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
  silenceTimeout = 1200
}: UseWebSpeechSTTProps = {}): UseWebSpeechSTTReturn => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conversationPhase, setConversationPhase] = useState<'idle' | 'listening' | 'processing' | 'ai_speaking'>('idle');
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Core state - simple booleans
  const isActiveRef = useRef(false); // User wants conversation active
  const aiSpeakingRef = useRef(false); // AI is currently speaking
  const hasUserSpokenRef = useRef(false);
  const hasSentRef = useRef(false);
  
  // Transcript buffers
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

  const resetTranscripts = useCallback(() => {
    interimRef.current = '';
    finalRef.current = '';
    setInterimTranscript('');
    setFinalTranscript('');
    hasSentRef.current = false;
    hasUserSpokenRef.current = false;
  }, []);

  // Start recognition safely
  const startRecognition = useCallback(() => {
    if (!recognitionRef.current) {
      console.log('[STT] ❌ No recognition instance');
      return;
    }
    
    try {
      recognitionRef.current.start();
      console.log('[STT] ✅ Recognition started');
    } catch (e: any) {
      if (e.message?.includes('already started')) {
        console.log('[STT] ✅ Already running');
      } else {
        console.log('[STT] ⚠️ Start failed:', e.message);
        // Retry once
        setTimeout(() => {
          try { 
            recognitionRef.current?.start(); 
            console.log('[STT] ✅ Retry succeeded');
          } catch (e2) {
            console.log('[STT] ❌ Retry failed');
          }
        }, 100);
      }
    }
  }, []);

  const autoSendMessage = useCallback(() => {
    if (hasSentRef.current || !hasUserSpokenRef.current || aiSpeakingRef.current) {
      return;
    }

    const message = (finalRef.current + ' ' + interimRef.current).trim();
    if (!message || message.length < MIN_MESSAGE_LENGTH) {
      return;
    }

    console.log('[STT] 📤 AUTO-SEND:', message);
    hasSentRef.current = true;
    hasUserSpokenRef.current = false;
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
      setIsListening(true);
      setError(null);
      if (!aiSpeakingRef.current) {
        setConversationPhase('listening');
      }
    };

    recognition.onend = () => {
      console.log('[STT] 🛑 Recognition ENDED | active:', isActiveRef.current, '| aiSpeaking:', aiSpeakingRef.current);
      setIsListening(false);
      
      // Auto-restart logic: only if active AND AI not speaking
      if (isActiveRef.current && !aiSpeakingRef.current) {
        console.log('[STT] 🔄 Auto-restarting...');
        setTimeout(() => {
          if (isActiveRef.current && !aiSpeakingRef.current) {
            startRecognition();
          }
        }, 100);
      } else if (!isActiveRef.current) {
        setConversationPhase('idle');
      }
      // If AI is speaking, we wait - setAISpeaking(false) will restart
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
        return; // Silent ignore - no log spam
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
        hasUserSpokenRef.current = true;
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
      if (hasUserSpokenRef.current && !aiSpeakingRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          autoSendMessage();
        }, silenceTimeout);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearSilenceTimer();
      isActiveRef.current = false;
      try { recognition.abort(); } catch (e) {}
    };
  }, [SpeechRecognitionAPI, lang, silenceTimeout, clearSilenceTimer, autoSendMessage, startRecognition]);

  // ========== PUBLIC API ==========
  
  const start = useCallback(() => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }

    console.log('[STT] ▶️ START');
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
    if (text && text.length >= MIN_MESSAGE_LENGTH && onAutoSendRef.current && !hasSentRef.current) {
      hasSentRef.current = true;
      onAutoSendRef.current(text);
    }
    
    isActiveRef.current = false;
    aiSpeakingRef.current = false;
    
    try { recognitionRef.current?.stop(); } catch (e) {}
    
    resetTranscripts();
    setConversationPhase('idle');
    setIsListening(false);
  }, [clearSilenceTimer, resetTranscripts]);

  /**
   * TURN CONTROL - The core of the solution
   * 
   * When AI starts speaking:
   * - Auto-activate the conversation (so user can respond after)
   * - Ignore STT results (guard in onresult)
   * 
   * When AI finishes speaking:
   * - Immediately start recognition for user's turn
   */
  const setAISpeaking = useCallback((speaking: boolean) => {
    const wasAISpeaking = aiSpeakingRef.current;
    aiSpeakingRef.current = speaking;
    
    console.log('[STT] 🔊 AI Speaking:', speaking, '| wasAISpeaking:', wasAISpeaking, '| active:', isActiveRef.current);
    
    if (speaking) {
      // === AI STARTED SPEAKING ===
      clearSilenceTimer();
      setConversationPhase('ai_speaking');
      resetTranscripts();
      
      // AUTO-ACTIVATE: If user sent a text message, activate for voice response
      if (!isActiveRef.current) {
        console.log('[STT] 🚀 Auto-activating conversation');
        isActiveRef.current = true;
      }
      
    } else if (wasAISpeaking && isActiveRef.current) {
      // === AI FINISHED SPEAKING ===
      console.log('[STT] ▶️ AI finished → starting user turn');
      setConversationPhase('listening');
      
      // Start recognition for user's turn
      startRecognition();
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
