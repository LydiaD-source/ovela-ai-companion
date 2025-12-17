import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * TURN-CONTROLLED SPEECH-TO-TEXT
 * 
 * Half-duplex conversational audio (like Alexa, Siri, kiosks):
 * - Only ONE side speaks at a time
 * - Recognition stays ALIVE throughout
 * - We IGNORE results when AI is speaking (not stop recognition)
 * - Transitions are automatic and fluid
 */

type ConversationState = 'idle' | 'listening' | 'processing' | 'ai_speaking';

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
  conversationPhase: ConversationState;
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
  const [conversationPhase, setConversationPhase] = useState<ConversationState>('idle');
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // ========== CORE STATE FLAGS ==========
  // Session active = user explicitly started conversation
  const sessionActiveRef = useRef(false);
  // AI speaking guard = ignore all STT results when true
  const aiSpeakingRef = useRef(false);
  // Track if user has spoken valid content
  const hasSpokenRef = useRef(false);
  // Prevent duplicate sends
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
    hasSpokenRef.current = false;
  }, []);

  const autoSendMessage = useCallback(() => {
    // Guard: Don't send if AI is speaking or already sent
    if (hasSentRef.current || !hasSpokenRef.current || aiSpeakingRef.current) {
      return;
    }

    const message = (finalRef.current + ' ' + interimRef.current).trim();
    if (!message || message.length < MIN_MESSAGE_LENGTH) {
      return;
    }

    console.log('[STT] 📤 AUTO-SEND:', message);
    hasSentRef.current = true;
    hasSpokenRef.current = false;
    setConversationPhase('processing');
    
    // Clear transcripts for next turn
    interimRef.current = '';
    finalRef.current = '';
    setInterimTranscript('');
    setFinalTranscript('');
    
    if (onAutoSendRef.current) {
      onAutoSendRef.current(message);
    }
  }, []);

  // Initialize recognition ONCE and keep it alive
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      console.log('[STT] 🎙️ Recognition RUNNING');
      setIsListening(true);
      setError(null);
      
      // Only set to listening if not AI speaking
      if (!aiSpeakingRef.current && sessionActiveRef.current) {
        setConversationPhase('listening');
      }
    };

    recognition.onend = () => {
      console.log('[STT] 🛑 Recognition ENDED | session:', sessionActiveRef.current, '| aiSpeaking:', aiSpeakingRef.current);
      setIsListening(false);
      
      if (!sessionActiveRef.current) {
        setConversationPhase('idle');
        return;
      }
      
      // ========== ALEXA APPROACH ==========
      // NEVER restart while AI is speaking - wait for setAISpeaking(false)
      if (aiSpeakingRef.current) {
        console.log('[STT] ⏸️ AI speaking — waiting for AI to finish before restart');
        return;
      }
      
      // AI is NOT speaking - safe to restart for continued user input
      // This handles the case where recognition naturally times out between user utterances
      console.log('[STT] 🔄 Restarting (AI not speaking, user turn active)');
      setTimeout(() => {
        if (sessionActiveRef.current && !aiSpeakingRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started is fine
          }
        }
      }, 100);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Ignore common non-errors
      if (event.error === 'aborted' || event.error === 'no-speech') {
        return;
      }
      console.log('[STT] ⚠️ Error:', event.error);
      setError(event.error);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // ========== THE KEY GUARD ==========
      // IGNORE all results while AI is speaking
      // Mic is still "hearing" but we don't process
      if (aiSpeakingRef.current) {
        console.log('[STT] 🔇 Ignoring input (AI speaking)');
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

      // Check if user has spoken enough
      const totalText = (finalRef.current + ' ' + final + ' ' + interim).trim();
      if (totalText.length >= MIN_MESSAGE_LENGTH) {
        hasSpokenRef.current = true;
      }

      // Update interim transcript
      if (interim) {
        interimRef.current = interim;
        setInterimTranscript(interim);
        console.log('[STT] 🎤 Interim:', interim);
      }

      // Accumulate final transcript
      if (final) {
        const newFinal = finalRef.current ? `${finalRef.current} ${final}` : final;
        finalRef.current = newFinal;
        setFinalTranscript(newFinal);
        interimRef.current = '';
        setInterimTranscript('');
      }

      // Reset silence timer and set new one
      clearSilenceTimer();
      
      if (hasSpokenRef.current && !aiSpeakingRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          autoSendMessage();
        }, silenceTimeout);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearSilenceTimer();
      sessionActiveRef.current = false;
      try { recognition.abort(); } catch (e) {}
    };
  }, [SpeechRecognitionAPI, lang, silenceTimeout, clearSilenceTimer, autoSendMessage]);

  // ========== PUBLIC API ==========
  
  const start = useCallback(() => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }

    console.log('[STT] ▶️ START SESSION');
    
    resetTranscripts();
    setError(null);
    sessionActiveRef.current = true;
    aiSpeakingRef.current = false;
    setConversationPhase('listening');

    // Start recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        if (!e.message?.includes('already started')) {
          console.log('[STT] Start error, retrying...');
          setTimeout(() => {
            try { recognitionRef.current?.start(); } catch (e2) {}
          }, 100);
        }
      }
    }
  }, [isSupported, resetTranscripts]);

  const stop = useCallback(() => {
    console.log('[STT] ⏹️ STOP SESSION');
    clearSilenceTimer();
    
    // Send any pending text before stopping
    const text = (finalRef.current + ' ' + interimRef.current).trim();
    if (text && text.length >= MIN_MESSAGE_LENGTH && onAutoSendRef.current && !hasSentRef.current) {
      hasSentRef.current = true;
      onAutoSendRef.current(text);
    }
    
    // End session
    sessionActiveRef.current = false;
    aiSpeakingRef.current = false;
    
    try { recognitionRef.current?.stop(); } catch (e) {}
    
    resetTranscripts();
    setConversationPhase('idle');
    setIsListening(false);
  }, [clearSilenceTimer, resetTranscripts]);

  /**
   * TURN CONTROL
   * 
   * When AI starts speaking:
   * - Set guard to ignore STT results
   * - Clear any pending silence timers
   * - Recognition keeps running (don't stop it!)
   * 
   * When AI finishes speaking:
   * - Clear guard immediately
   * - User can speak right away
   * - No restart needed - recognition is still running
   */
  const setAISpeaking = useCallback((speaking: boolean) => {
    console.log('[STT] 🔊 AI Speaking:', speaking, '| session:', sessionActiveRef.current);
    
    // Update ref FIRST before any other logic
    const wasAISpeaking = aiSpeakingRef.current;
    aiSpeakingRef.current = speaking;
    
    if (speaking) {
      // === AI STARTED SPEAKING ===
      clearSilenceTimer();
      setConversationPhase('ai_speaking');
      
      // Clear any partial user input
      interimRef.current = '';
      finalRef.current = '';
      setInterimTranscript('');
      setFinalTranscript('');
      hasSpokenRef.current = false;
      hasSentRef.current = false;
      
      // ========== AUTO-START SESSION ==========
      // If session wasn't active (user typed instead of using mic),
      // start it now so STT is ready when AI finishes speaking
      if (!sessionActiveRef.current) {
        console.log('[STT] 🚀 Auto-starting session (AI speaking, session was inactive)');
        sessionActiveRef.current = true;
        // Don't start recognition yet - AI is speaking
        // We'll start it when AI finishes
      }
      
      console.log('[STT] 🔇 Now ignoring user input while AI speaks');
      
    } else if (wasAISpeaking) {
      // === AI FINISHED SPEAKING (transition from true → false) ===
      console.log('[STT] ▶️ AI finished speaking | session:', sessionActiveRef.current);
      
      if (!sessionActiveRef.current) {
        console.log('[STT] Session not active, not restarting');
        return;
      }
      
      setConversationPhase('listening');
      
      // RESTART recognition - this is the ONLY place we do it
      console.log('[STT] 🎙️ Starting recognition for user turn');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          console.log('[STT] ✅ Recognition started');
        } catch (e: any) {
          if (e.message?.includes('already started')) {
            console.log('[STT] ✅ Recognition was already running');
          } else {
            console.log('[STT] ⚠️ Start failed, retrying in 100ms:', e.message);
            // Retry once after short delay
            setTimeout(() => {
              if (sessionActiveRef.current && !aiSpeakingRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                  console.log('[STT] ✅ Recognition started on retry');
                } catch (e2) {
                  console.log('[STT] ❌ Retry also failed');
                }
              }
            }, 100);
          }
        }
      } else {
        console.log('[STT] ⚠️ No recognition instance available');
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
