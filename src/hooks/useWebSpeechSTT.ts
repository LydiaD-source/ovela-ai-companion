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
  const phaseRef = useRef<'idle' | 'listening' | 'processing' | 'ai_speaking' | 'waiting'>('idle');
  
  const interimRef = useRef('');
  const finalRef = useRef('');
  const onAutoSendRef = useRef(onAutoSend);
  
  const MIN_MESSAGE_LENGTH = 2;
  
  useEffect(() => {
    onAutoSendRef.current = onAutoSend;
  }, [onAutoSend]);
  
  useEffect(() => {
    phaseRef.current = conversationPhase;
  }, [conversationPhase]);
  
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

  const autoSendMessage = useCallback(() => {
    console.log('[WebSpeechSTT] ⏰ autoSendMessage, hasSent:', hasSentRef.current, 'hasSpoken:', hasSpokenRef.current);
    
    if (hasSentRef.current) {
      console.log('[WebSpeechSTT] ⏳ Already sent');
      return;
    }

    const message = (finalRef.current + ' ' + interimRef.current).trim();
    console.log('[WebSpeechSTT] 📝 Message:', message, 'len:', message.length);
    
    if (!message || message.length < MIN_MESSAGE_LENGTH) {
      console.log('[WebSpeechSTT] 📭 Too short');
      return;
    }
    
    if (!hasSpokenRef.current) {
      console.log('[WebSpeechSTT] 🔇 No speech');
      return;
    }

    console.log('[WebSpeechSTT] 📤 SENDING:', message);
    hasSentRef.current = true;
    hasSpokenRef.current = false;
    setConversationPhase('processing');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
    setIsListening(false);
    
    finalRef.current = '';
    interimRef.current = '';
    setFinalTranscript('');
    setInterimTranscript('');
    
    if (onAutoSendRef.current) {
      console.log('[WebSpeechSTT] 📞 Calling onAutoSend');
      onAutoSendRef.current(message);
    } else {
      console.log('[WebSpeechSTT] ⚠️ No callback!');
    }

    setTimeout(() => {
      hasSentRef.current = false;
    }, 500);
  }, []);

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    console.log('[WebSpeechSTT] 🔧 Init');
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      console.log('[WebSpeechSTT] 🎙️ Started');
      setIsListening(true);
      setConversationPhase('listening');
      setError(null);
      hasSentRef.current = false;
    };

    recognition.onend = () => {
      console.log('[WebSpeechSTT] 🛑 Ended, phase:', phaseRef.current);
      setIsListening(false);
      
      if (phaseRef.current === 'listening') {
        setConversationPhase('idle');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[WebSpeechSTT] ❌ Error:', event.error);
      
      if (event.error === 'aborted' || event.error === 'no-speech') {
        return;
      }
      
      setError(event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          if (confidence > 0.4 || confidence === 0) {
            final += transcript;
            console.log('[WebSpeechSTT] ✅ Final:', transcript);
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
      
      if (hasSpokenRef.current) {
        console.log('[WebSpeechSTT] ⏱️ Timer:', silenceTimeout, 'ms');
        silenceTimerRef.current = setTimeout(() => {
          console.log('[WebSpeechSTT] ⏰ Timer fired!');
          autoSendMessage();
        }, silenceTimeout);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      console.log('[WebSpeechSTT] 🧹 Cleanup');
      clearSilenceTimer();
      conversationActiveRef.current = false;
      recognition.abort();
    };
  }, [SpeechRecognitionAPI, lang, silenceTimeout, clearSilenceTimer, autoSendMessage]);

  const start = useCallback(() => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }

    console.log('[WebSpeechSTT] ▶️ START');
    
    interimRef.current = '';
    finalRef.current = '';
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);
    hasSentRef.current = false;
    hasSpokenRef.current = false;
    conversationActiveRef.current = true;
    setConversationPhase('listening');

    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.log('[WebSpeechSTT] Retry');
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
    console.log('[WebSpeechSTT] ⏹️ STOP');
    clearSilenceTimer();
    conversationActiveRef.current = false;
    
    if (recognitionRef.current) {
      const text = (finalRef.current + ' ' + interimRef.current).trim();
      
      if (text && text.length >= MIN_MESSAGE_LENGTH && onAutoSendRef.current && !hasSentRef.current) {
        console.log('[WebSpeechSTT] 📤 Send on stop:', text);
        hasSentRef.current = true;
        onAutoSendRef.current(text);
      }
      
      recognitionRef.current.stop();
      
      interimRef.current = '';
      finalRef.current = '';
      setInterimTranscript('');
      setFinalTranscript('');
      setConversationPhase('idle');
    }
  }, [clearSilenceTimer]);

  const resumeListening = useCallback(() => {
    if (!isSupported || !conversationActiveRef.current) {
      console.log('[WebSpeechSTT] 🔇 Not resuming');
      return;
    }

    console.log('[WebSpeechSTT] ▶️ RESUME');
    
    setTimeout(() => {
      interimRef.current = '';
      finalRef.current = '';
      setInterimTranscript('');
      setFinalTranscript('');
      setError(null);
      hasSentRef.current = false;
      hasSpokenRef.current = false;
      setConversationPhase('listening');

      try {
        recognitionRef.current?.start();
        console.log('[WebSpeechSTT] 🎙️ Resumed');
      } catch (e) {
        console.log('[WebSpeechSTT] Resume retry');
        try {
          recognitionRef.current?.abort();
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (e2) {
              console.error('[WebSpeechSTT] Resume fail:', e2);
              setConversationPhase('waiting');
            }
          }, 200);
        } catch (e2) {
          setConversationPhase('waiting');
        }
      }
    }, 400);
  }, [isSupported]);

  const setAISpeaking = useCallback((speaking: boolean) => {
    console.log('[WebSpeechSTT] 🔊 AI:', speaking, 'active:', conversationActiveRef.current);
    
    if (speaking) {
      console.log('[WebSpeechSTT] ⏸️ Pause for AI');
      clearSilenceTimer();
      setConversationPhase('ai_speaking');
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
      setIsListening(false);
    } else {
      if (conversationActiveRef.current) {
        console.log('[WebSpeechSTT] ▶️ AI done, resume');
        resumeListening();
      } else {
        console.log('[WebSpeechSTT] 🔇 AI done, no convo');
      }
    }
  }, [clearSilenceTimer, resumeListening]);

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
