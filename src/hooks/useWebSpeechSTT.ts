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
  const aiSpeakingRef = useRef(false);
  const isRecognitionRunningRef = useRef(false);
  
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

  // Force start recognition with retry
  const forceStartRecognition = useCallback(() => {
    if (!recognitionRef.current || !conversationActiveRef.current) return;
    
    console.log('[STT] 🔄 Force starting recognition...');
    
    // First stop any existing
    try {
      recognitionRef.current.abort();
    } catch (e) {}
    
    isRecognitionRunningRef.current = false;
    
    // Wait a bit then start fresh
    setTimeout(() => {
      if (!conversationActiveRef.current || aiSpeakingRef.current) {
        console.log('[STT] ❌ Skipping start - conversation inactive or AI speaking');
        return;
      }
      
      try {
        recognitionRef.current?.start();
        console.log('[STT] ✅ Recognition started');
      } catch (e: any) {
        console.log('[STT] ⚠️ Start error:', e.message);
        // Retry once more
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e2) {
            console.error('[STT] ❌ Final start failed');
          }
        }, 200);
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      console.log('[STT] 🎙️ Recognition STARTED - ready for input');
      isRecognitionRunningRef.current = true;
      setIsListening(true);
      if (!aiSpeakingRef.current) {
        setConversationPhase('listening');
      }
      setError(null);
    };

    recognition.onend = () => {
      console.log('[STT] 🛑 Recognition ENDED');
      isRecognitionRunningRef.current = false;
      
      // Auto-restart if conversation is active and AI not speaking
      if (conversationActiveRef.current && !aiSpeakingRef.current) {
        console.log('[STT] 🔄 Auto-restarting (conversation active)...');
        setTimeout(() => {
          if (conversationActiveRef.current && !aiSpeakingRef.current) {
            try {
              recognition.start();
            } catch (e) {
              console.log('[STT] Restart error, will retry');
              setTimeout(() => {
                try { recognition.start(); } catch (e2) {}
              }, 200);
            }
          }
        }, 50);
      } else {
        setIsListening(false);
        if (!conversationActiveRef.current) {
          setConversationPhase('idle');
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log('[STT] ⚠️ Error:', event.error);
      
      // Ignore these common errors
      if (event.error === 'aborted' || event.error === 'no-speech') {
        return;
      }
      
      setError(event.error);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // IGNORE input while AI is speaking
      if (aiSpeakingRef.current) {
        console.log('[STT] 🔇 Ignoring (AI speaking)');
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
      conversationActiveRef.current = false;
      try { recognition.abort(); } catch (e) {}
    };
  }, [SpeechRecognitionAPI, lang, silenceTimeout, clearSilenceTimer, autoSendMessage]);

  const start = useCallback(() => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }

    console.log('[STT] ▶️ USER START');
    
    resetTranscripts();
    setError(null);
    conversationActiveRef.current = true;
    aiSpeakingRef.current = false;
    setConversationPhase('listening');

    forceStartRecognition();
  }, [isSupported, resetTranscripts, forceStartRecognition]);

  const stop = useCallback(() => {
    console.log('[STT] ⏹️ USER STOP');
    clearSilenceTimer();
    conversationActiveRef.current = false;
    aiSpeakingRef.current = false;
    
    // Send any pending text
    const text = (finalRef.current + ' ' + interimRef.current).trim();
    if (text && text.length >= MIN_MESSAGE_LENGTH && onAutoSendRef.current && !hasSentRef.current) {
      hasSentRef.current = true;
      onAutoSendRef.current(text);
    }
    
    try { recognitionRef.current?.abort(); } catch (e) {}
    
    resetTranscripts();
    setConversationPhase('idle');
    setIsListening(false);
    isRecognitionRunningRef.current = false;
  }, [clearSilenceTimer, resetTranscripts]);

  const setAISpeaking = useCallback((speaking: boolean) => {
    console.log('[STT] 🔊 AI speaking:', speaking, '| conversation active:', conversationActiveRef.current);
    
    const wasAISpeaking = aiSpeakingRef.current;
    aiSpeakingRef.current = speaking;
    
    if (speaking) {
      // AI started speaking - pause listening
      clearSilenceTimer();
      setConversationPhase('ai_speaking');
      
      // Clear any partial transcripts (might have picked up AI voice)
      resetTranscripts();
      
    } else if (wasAISpeaking && conversationActiveRef.current) {
      // AI finished speaking - resume listening IMMEDIATELY
      console.log('[STT] ▶️ AI DONE - resuming mic NOW');
      
      // Small delay to let audio fully stop, then restart recognition
      setTimeout(() => {
        if (!conversationActiveRef.current) return;
        
        resetTranscripts();
        setConversationPhase('listening');
        
        // Force restart recognition to ensure it's in a good state
        forceStartRecognition();
        
      }, 200); // 200ms delay after AI finishes
    }
  }, [clearSilenceTimer, resetTranscripts, forceStartRecognition]);

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
