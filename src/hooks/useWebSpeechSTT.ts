import { useState, useRef, useCallback, useEffect } from 'react';

interface UseWebSpeechSTTProps {
  onAutoSend?: (text: string) => void;
  lang?: string;
  silenceTimeout?: number; // ms before auto-send (default 1500)
}

interface UseWebSpeechSTTReturn {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  finalTranscript: string;
  conversationPhase: 'idle' | 'listening' | 'processing' | 'ai_speaking' | 'waiting';
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setAISpeaking: (speaking: boolean) => void;
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
  silenceTimeout = 1500
}: UseWebSpeechSTTProps = {}): UseWebSpeechSTTReturn => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conversationPhase, setConversationPhase] = useState<'idle' | 'listening' | 'processing' | 'ai_speaking' | 'waiting'>('idle');
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSentRef = useRef(false);
  const isActiveRef = useRef(false);
  const hasSpokenRef = useRef(false);
  const isPausedRef = useRef(false); // Track if paused for AI speaking
  const shouldResumeRef = useRef(false); // Track if we should auto-resume
  
  // Use refs to track transcript for stable callbacks
  const interimRef = useRef('');
  const finalRef = useRef('');
  const onAutoSendRef = useRef(onAutoSend);
  
  const MIN_MESSAGE_LENGTH = 3;
  
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

  // Auto-send function
  const autoSendMessage = useCallback(() => {
    if (hasSentRef.current) {
      console.log('[WebSpeechSTT] ⏳ Already sent, skipping');
      return;
    }

    const message = (finalRef.current + ' ' + interimRef.current).trim();
    
    if (!message || message.length < MIN_MESSAGE_LENGTH) {
      console.log('[WebSpeechSTT] 📭 Message too short:', message);
      return;
    }
    
    if (!hasSpokenRef.current) {
      console.log('[WebSpeechSTT] 🔇 No meaningful speech detected');
      return;
    }

    console.log('[WebSpeechSTT] 📤 Auto-sending:', message);
    hasSentRef.current = true;
    hasSpokenRef.current = false;
    setConversationPhase('processing');
    
    // Stop recognition - will resume after AI finishes speaking
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
    isActiveRef.current = false;
    isPausedRef.current = true;
    shouldResumeRef.current = true; // We want to resume after AI speaks
    setIsListening(false);
    
    // Clear transcripts
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

  // Initialize recognition instance
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    console.log('[WebSpeechSTT] 🔧 Initializing recognition');
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
      isActiveRef.current = true;
      isPausedRef.current = false;
    };

    recognition.onend = () => {
      console.log('[WebSpeechSTT] 🛑 Recognition ended, paused:', isPausedRef.current);
      setIsListening(false);
      
      // Only go to idle if not paused for AI speaking
      if (!isPausedRef.current && conversationPhase !== 'processing' && conversationPhase !== 'ai_speaking') {
        setConversationPhase('idle');
      }
      isActiveRef.current = false;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[WebSpeechSTT] ❌ Error:', event.error);
      
      if (event.error === 'aborted' || event.error === 'no-speech') {
        // Don't show error, just stay in current phase if paused
        if (!isPausedRef.current) {
          setConversationPhase('idle');
        }
        isActiveRef.current = false;
        return;
      }
      
      setError(event.error);
      setIsListening(false);
      if (!isPausedRef.current) {
        setConversationPhase('idle');
      }
      isActiveRef.current = false;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          if (confidence > 0.5 || confidence === 0) {
            final += transcript;
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
        console.log('[WebSpeechSTT] 📝 Interim:', interim);
        interimRef.current = interim;
        setInterimTranscript(interim);
      }

      if (final) {
        console.log('[WebSpeechSTT] ✅ Final:', final);
        const newFinal = finalRef.current ? `${finalRef.current} ${final}` : final;
        finalRef.current = newFinal;
        setFinalTranscript(newFinal);
        interimRef.current = '';
        setInterimTranscript('');
      }

      clearSilenceTimer();
      
      if (hasSpokenRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          console.log('[WebSpeechSTT] ⏰ Silence detected');
          autoSendMessage();
        }, silenceTimeout);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      console.log('[WebSpeechSTT] 🧹 Cleanup');
      clearSilenceTimer();
      isPausedRef.current = false;
      shouldResumeRef.current = false;
      isActiveRef.current = false;
      recognition.abort();
    };
  }, [SpeechRecognitionAPI, lang, silenceTimeout, clearSilenceTimer, autoSendMessage]);

  const start = useCallback(() => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }

    console.log('[WebSpeechSTT] ▶️ Starting');
    
    interimRef.current = '';
    finalRef.current = '';
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);
    hasSentRef.current = false;
    hasSpokenRef.current = false;
    isPausedRef.current = false;
    shouldResumeRef.current = true; // User started, so we want continuous conversation
    isActiveRef.current = true;
    setConversationPhase('listening');

    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.log('[WebSpeechSTT] Restart attempt');
      try {
        recognitionRef.current?.stop();
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e2) {
            console.error('[WebSpeechSTT] Failed:', e2);
          }
        }, 100);
      } catch (e2) {
        console.error('[WebSpeechSTT] Failed:', e2);
      }
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    console.log('[WebSpeechSTT] ⏹️ Stopping completely');
    clearSilenceTimer();
    isPausedRef.current = false;
    shouldResumeRef.current = false;
    isActiveRef.current = false;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      
      const completeTranscript = (finalRef.current + ' ' + interimRef.current).trim();
      
      if (completeTranscript && completeTranscript.length >= MIN_MESSAGE_LENGTH && onAutoSendRef.current && !hasSentRef.current) {
        console.log('[WebSpeechSTT] 📤 Sending on stop:', completeTranscript);
        hasSentRef.current = true;
        onAutoSendRef.current(completeTranscript);
      }
      
      interimRef.current = '';
      finalRef.current = '';
      setInterimTranscript('');
      setFinalTranscript('');
      setConversationPhase('idle');
    }
  }, [clearSilenceTimer]);

  // Pause for AI speaking (keeps conversation active)
  const pause = useCallback(() => {
    console.log('[WebSpeechSTT] ⏸️ Pausing for AI speech');
    clearSilenceTimer();
    isPausedRef.current = true;
    setConversationPhase('ai_speaking');
    
    if (recognitionRef.current && isActiveRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
    setIsListening(false);
  }, [clearSilenceTimer]);

  // Resume after AI finishes speaking
  const resume = useCallback(() => {
    if (!isSupported || !shouldResumeRef.current) {
      console.log('[WebSpeechSTT] 🔇 Not resuming - not supported or not active conversation');
      setConversationPhase('idle');
      return;
    }

    console.log('[WebSpeechSTT] ▶️ Resuming after AI speech');
    
    // Small delay to ensure AI audio is fully stopped
    setTimeout(() => {
      interimRef.current = '';
      finalRef.current = '';
      setInterimTranscript('');
      setFinalTranscript('');
      setError(null);
      hasSentRef.current = false;
      hasSpokenRef.current = false;
      isPausedRef.current = false;
      isActiveRef.current = true;
      setConversationPhase('listening');

      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.log('[WebSpeechSTT] Resume failed, retrying');
        try {
          recognitionRef.current?.abort();
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (e2) {
              console.error('[WebSpeechSTT] Resume failed:', e2);
              setConversationPhase('waiting');
            }
          }, 200);
        } catch (e2) {
          setConversationPhase('waiting');
        }
      }
    }, 300); // 300ms delay to let AI audio finish
  }, [isSupported]);

  // Set AI speaking state (called from parent)
  const setAISpeaking = useCallback((speaking: boolean) => {
    console.log('[WebSpeechSTT] 🔊 AI speaking:', speaking);
    if (speaking) {
      pause();
    } else {
      resume();
    }
  }, [pause, resume]);

  return {
    isListening,
    isSupported,
    interimTranscript,
    finalTranscript,
    conversationPhase,
    start,
    stop,
    pause,
    resume,
    setAISpeaking,
    error
  };
};
