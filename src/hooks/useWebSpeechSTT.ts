/**
 * useWebSpeechSTT - Push-to-Talk Speech-to-Text
 * 
 * User clicks mic to start, clicks again to stop & send.
 * No auto-send on silence. Full manual control.
 * Language auto-detection via empty lang (browser default).
 */

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

const MIN_MESSAGE_LENGTH = 2;

export const useWebSpeechSTT = ({
  onAutoSend,
  lang = '',
}: UseWebSpeechSTTProps = {}): UseWebSpeechSTTReturn => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conversationPhase, setConversationPhase] = useState<'idle' | 'listening' | 'processing' | 'ai_speaking'>('idle');
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const interimRef = useRef('');
  const finalRef = useRef('');
  const onAutoSendRef = useRef(onAutoSend);
  const isActiveRef = useRef(false);
  const aiSpeakingRef = useRef(false);
  
  const isSupported = !!SpeechRecognitionAPI;

  useEffect(() => {
    onAutoSendRef.current = onAutoSend;
  }, [onAutoSend]);

  const resetTranscripts = useCallback(() => {
    interimRef.current = '';
    finalRef.current = '';
    setInterimTranscript('');
    setFinalTranscript('');
  }, []);

  // Initialize recognition instance
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    // Empty lang = browser auto-detects language
    if (lang) recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setConversationPhase('listening');
    };

    recognition.onend = () => {
      setIsListening(false);
      // Do NOT auto-restart. User controls via button.
      if (!isActiveRef.current) {
        setConversationPhase('idle');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      setError(event.error);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (aiSpeakingRef.current) return;

      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
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
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch {}
    };
  }, [lang]);

  // Start listening (user presses mic)
  const start = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('not-supported');
      return;
    }
    isActiveRef.current = true;
    aiSpeakingRef.current = false;
    resetTranscripts();
    setError(null);
    try {
      recognitionRef.current.start();
    } catch {
      // may already be running
    }
  }, [isSupported, resetTranscripts]);

  // Stop listening and send accumulated text
  const stop = useCallback(() => {
    isActiveRef.current = false;
    
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    // Send accumulated text
    const text = (finalRef.current + ' ' + interimRef.current).trim();
    if (text && text.length >= MIN_MESSAGE_LENGTH) {
      setConversationPhase('processing');
      onAutoSendRef.current?.(text);
    } else {
      setConversationPhase('idle');
    }
    
    resetTranscripts();
    setIsListening(false);
  }, [resetTranscripts]);

  const setAISpeaking = useCallback((speaking: boolean) => {
    aiSpeakingRef.current = speaking;
    if (speaking) {
      // Pause recognition while AI speaks
      if (recognitionRef.current && isActiveRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setConversationPhase('ai_speaking');
      resetTranscripts();
    } else {
      // AI done speaking - go back to idle. User clicks mic to talk again.
      if (!isActiveRef.current) {
        setConversationPhase('idle');
      }
    }
  }, [resetTranscripts]);

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
