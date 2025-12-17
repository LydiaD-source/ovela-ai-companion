import { useState, useRef, useCallback, useEffect } from 'react';

interface UseWebSpeechSTTProps {
  onAutoSend?: (text: string) => void;
  lang?: string;
  silenceTimeout?: number; // ms before auto-send (default 1000)
  continuous?: boolean; // keep mic active after send (default true)
}

interface UseWebSpeechSTTReturn {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  finalTranscript: string;
  conversationPhase: 'idle' | 'listening' | 'processing' | 'waiting';
  start: () => void;
  stop: () => void;
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
  silenceTimeout = 1500, // Increased default for stability
  continuous = false // Disabled auto-restart by default
}: UseWebSpeechSTTProps = {}): UseWebSpeechSTTReturn => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conversationPhase, setConversationPhase] = useState<'idle' | 'listening' | 'processing' | 'waiting'>('idle');
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSentRef = useRef(false);
  const shouldRestartRef = useRef(false);
  const isActiveRef = useRef(false);
  const hasSpokenRef = useRef(false); // Track if user actually spoke
  
  // Use refs to track transcript for stable callbacks
  const interimRef = useRef('');
  const finalRef = useRef('');
  const onAutoSendRef = useRef(onAutoSend);
  
  // Minimum characters required before auto-send (filters noise)
  const MIN_MESSAGE_LENGTH = 3;
  
  // Update ref when callback changes
  useEffect(() => {
    onAutoSendRef.current = onAutoSend;
  }, [onAutoSend]);
  
  // Check browser support
  const SpeechRecognitionAPI = typeof window !== 'undefined' 
    ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
    : null;
  const isSupported = !!SpeechRecognitionAPI;

  // Clear silence timer
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Auto-send function - reads from refs for stability
  const autoSendMessage = useCallback(() => {
    if (hasSentRef.current) {
      console.log('[WebSpeechSTT] ⏳ Already sent, skipping');
      return;
    }

    const message = (finalRef.current + ' ' + interimRef.current).trim();
    
    // Require minimum length to filter out noise/partial words
    if (!message || message.length < MIN_MESSAGE_LENGTH) {
      console.log('[WebSpeechSTT] 📭 Message too short or empty, skipping:', message);
      return;
    }
    
    // Only send if user actually spoke meaningful content
    if (!hasSpokenRef.current) {
      console.log('[WebSpeechSTT] 🔇 No meaningful speech detected');
      return;
    }

    console.log('[WebSpeechSTT] 📤 Auto-sending:', message);
    hasSentRef.current = true;
    hasSpokenRef.current = false;
    setConversationPhase('processing');
    
    // Stop recognition while processing to avoid picking up AI response
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
    isActiveRef.current = false;
    shouldRestartRef.current = false;
    setIsListening(false);
    
    // Clear transcripts (both state and refs)
    finalRef.current = '';
    interimRef.current = '';
    setFinalTranscript('');
    setInterimTranscript('');
    
    // Call the send callback
    if (onAutoSendRef.current) {
      onAutoSendRef.current(message);
    }

    // Reset send guard after delay, then go to waiting
    setTimeout(() => {
      hasSentRef.current = false;
      setConversationPhase('waiting');
    }, 1000);
  }, []);

  // Initialize recognition instance - only once
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    console.log('[WebSpeechSTT] 🔧 Initializing recognition instance');
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
    };

    recognition.onend = () => {
      console.log('[WebSpeechSTT] 🛑 Recognition ended');
      setIsListening(false);
      
      // Don't auto-restart - user must click mic again
      // This prevents picking up Isabella's audio response
      if (!hasSentRef.current && conversationPhase !== 'processing') {
        setConversationPhase('idle');
      }
      isActiveRef.current = false;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[WebSpeechSTT] ❌ Error:', event.error);
      
      // Don't show error for aborted (user stopped) or no-speech
      if (event.error === 'aborted' || event.error === 'no-speech') {
        setConversationPhase('idle');
        isActiveRef.current = false;
        return;
      }
      
      setError(event.error);
      setIsListening(false);
      setConversationPhase('idle');
      isActiveRef.current = false;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          // Only accept high-confidence results
          if (confidence > 0.5 || confidence === 0) { // 0 means not available
            final += transcript;
          }
        } else {
          interim += transcript;
        }
      }

      // Track that user actually spoke something meaningful
      const totalText = (finalRef.current + ' ' + final + ' ' + interim).trim();
      if (totalText.length >= MIN_MESSAGE_LENGTH) {
        hasSpokenRef.current = true;
      }

      // Update interim transcript (shows as user speaks)
      if (interim) {
        console.log('[WebSpeechSTT] 📝 Interim:', interim);
        interimRef.current = interim;
        setInterimTranscript(interim);
      }

      // When we get final transcript, accumulate it
      if (final) {
        console.log('[WebSpeechSTT] ✅ Final segment:', final);
        const newFinal = finalRef.current ? `${finalRef.current} ${final}` : final;
        finalRef.current = newFinal;
        setFinalTranscript(newFinal);
        interimRef.current = ''; // Clear interim when we have final
        setInterimTranscript('');
      }

      // Reset silence timer on every speech event
      clearSilenceTimer();
      
      // Only start timer if we have meaningful content
      if (hasSpokenRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          console.log('[WebSpeechSTT] ⏰ Silence detected, auto-sending');
          autoSendMessage();
        }, silenceTimeout);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      console.log('[WebSpeechSTT] 🧹 Cleanup - stopping recognition');
      clearSilenceTimer();
      shouldRestartRef.current = false;
      isActiveRef.current = false;
      recognition.abort();
    };
  }, [SpeechRecognitionAPI, lang, silenceTimeout, clearSilenceTimer, autoSendMessage]);

  const start = useCallback(() => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }

    console.log('[WebSpeechSTT] ▶️ Starting voice input');
    
    // Reset state for new session
    interimRef.current = '';
    finalRef.current = '';
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);
    hasSentRef.current = false;
    hasSpokenRef.current = false;
    shouldRestartRef.current = false; // Don't auto-restart
    isActiveRef.current = true;
    setConversationPhase('listening');

    try {
      recognitionRef.current?.start();
    } catch (e) {
      // Already started - try stopping and restarting
      console.log('[WebSpeechSTT] Attempting restart');
      try {
        recognitionRef.current?.stop();
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e2) {
            console.error('[WebSpeechSTT] Failed to restart:', e2);
          }
        }, 100);
      } catch (e2) {
        console.error('[WebSpeechSTT] Failed to stop/restart:', e2);
      }
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    console.log('[WebSpeechSTT] ⏹️ Stopping voice input');
    clearSilenceTimer();
    shouldRestartRef.current = false;
    isActiveRef.current = false;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      
      // Send any remaining transcript
      const completeTranscript = (finalRef.current + ' ' + interimRef.current).trim();
      
      if (completeTranscript && onAutoSendRef.current && !hasSentRef.current) {
        console.log('[WebSpeechSTT] 📤 Sending on stop:', completeTranscript);
        hasSentRef.current = true;
        onAutoSendRef.current(completeTranscript);
      }
      
      // Reset transcripts
      interimRef.current = '';
      finalRef.current = '';
      setInterimTranscript('');
      setFinalTranscript('');
      setConversationPhase('idle');
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
    error
  };
};
