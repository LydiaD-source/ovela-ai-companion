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
  
  // KEY STATE: Track if user started a conversation session
  const sessionActiveRef = useRef(false);
  const aiSpeakingRef = useRef(false);
  // Track if we should resume after AI finishes (set when AI starts while session active)
  const shouldResumeAfterAIRef = useRef(false);
  
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
    if (hasSentRef.current || !hasSpokenRef.current || aiSpeakingRef.current) {
      return;
    }

    const message = (finalRef.current + ' ' + interimRef.current).trim();
    if (!message || message.length < MIN_MESSAGE_LENGTH) {
      return;
    }

    console.log('[STT] 📤 SENDING:', message);
    hasSentRef.current = true;
    hasSpokenRef.current = false;
    setConversationPhase('processing');
    
    // Clear transcripts
    resetTranscripts();
    
    if (onAutoSendRef.current) {
      onAutoSendRef.current(message);
    }
  }, [resetTranscripts]);

  // Start recognition with retries
  const startRecognition = useCallback(() => {
    if (!recognitionRef.current) return;
    
    console.log('[STT] 🎤 Starting recognition...');
    
    const tryStart = (attempt: number) => {
      if (!sessionActiveRef.current || aiSpeakingRef.current) {
        console.log('[STT] ❌ Cancelled - session:', sessionActiveRef.current, 'aiSpeaking:', aiSpeakingRef.current);
        return;
      }
      
      try {
        recognitionRef.current?.start();
        console.log('[STT] ✅ Recognition started (attempt', attempt, ')');
      } catch (e: any) {
        if (e.message?.includes('already started')) {
          console.log('[STT] Already running');
          return;
        }
        console.log('[STT] Start failed, attempt', attempt);
        if (attempt < 3) {
          setTimeout(() => tryStart(attempt + 1), 150);
        }
      }
    };
    
    // Abort any existing first
    try {
      recognitionRef.current.abort();
    } catch (e) {}
    
    setTimeout(() => tryStart(1), 100);
  }, []);

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      console.log('[STT] 🎙️ STARTED - ready for input');
      setIsListening(true);
      if (!aiSpeakingRef.current && sessionActiveRef.current) {
        setConversationPhase('listening');
      }
      setError(null);
    };

    recognition.onend = () => {
      console.log('[STT] 🛑 ENDED - session:', sessionActiveRef.current, 'aiSpeaking:', aiSpeakingRef.current);
      setIsListening(false);
      
      // Auto-restart if session is active and AI not speaking
      if (sessionActiveRef.current && !aiSpeakingRef.current) {
        console.log('[STT] 🔄 Auto-restart...');
        setTimeout(() => {
          if (sessionActiveRef.current && !aiSpeakingRef.current) {
            try {
              recognition.start();
            } catch (e) {
              setTimeout(() => {
                try { recognition.start(); } catch (e2) {}
              }, 200);
            }
          }
        }, 50);
      } else if (!sessionActiveRef.current) {
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
      // IGNORE input while AI is speaking
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
          console.log('[STT] 🎤 Interim:', transcript);
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

  const start = useCallback(() => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }

    console.log('[STT] ▶️ USER START - beginning session');
    
    resetTranscripts();
    setError(null);
    sessionActiveRef.current = true;
    aiSpeakingRef.current = false;
    shouldResumeAfterAIRef.current = false;
    setConversationPhase('listening');

    startRecognition();
  }, [isSupported, resetTranscripts, startRecognition]);

  const stop = useCallback(() => {
    console.log('[STT] ⏹️ USER STOP - ending session');
    clearSilenceTimer();
    
    // Send any pending text
    const text = (finalRef.current + ' ' + interimRef.current).trim();
    if (text && text.length >= MIN_MESSAGE_LENGTH && onAutoSendRef.current && !hasSentRef.current) {
      hasSentRef.current = true;
      onAutoSendRef.current(text);
    }
    
    // End session AFTER sending
    sessionActiveRef.current = false;
    aiSpeakingRef.current = false;
    shouldResumeAfterAIRef.current = false;
    
    try { recognitionRef.current?.abort(); } catch (e) {}
    
    resetTranscripts();
    setConversationPhase('idle');
    setIsListening(false);
  }, [clearSilenceTimer, resetTranscripts]);

  const setAISpeaking = useCallback((speaking: boolean) => {
    console.log('[STT] 🔊 AI speaking:', speaking, '| session:', sessionActiveRef.current);
    
    if (speaking) {
      // AI started speaking
      aiSpeakingRef.current = true;
      
      // Mark that we should resume when AI finishes (if session was active)
      if (sessionActiveRef.current) {
        shouldResumeAfterAIRef.current = true;
        console.log('[STT] 📌 Will resume after AI finishes');
      }
      
      clearSilenceTimer();
      setConversationPhase('ai_speaking');
      
      // Clear any partial transcripts
      resetTranscripts();
      
      // Stop recognition while AI speaks
      try { recognitionRef.current?.abort(); } catch (e) {}
      
    } else {
      // AI finished speaking
      aiSpeakingRef.current = false;
      
      // Resume if we were in an active session when AI started
      if (shouldResumeAfterAIRef.current) {
        console.log('[STT] ▶️ AI DONE - resuming listening');
        shouldResumeAfterAIRef.current = false;
        
        // Small delay to let audio fully stop
        setTimeout(() => {
          if (!sessionActiveRef.current) {
            console.log('[STT] ❌ Session ended while AI was speaking');
            return;
          }
          
          resetTranscripts();
          setConversationPhase('listening');
          startRecognition();
          
        }, 150);
      } else {
        console.log('[STT] No resume needed (no active session when AI started)');
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
