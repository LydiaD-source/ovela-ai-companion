import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX, Send, Loader2, RotateCcw, Mic, MicOff, Globe, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { textToSpeechService } from '@/lib/textToSpeech';
import { isabellaAPI } from '@/lib/isabellaAPI';
import VideoCard from '@/components/Chat/VideoCard';
import { VIDEO_CATEGORIES, getVideosByCategory, getFallbackVideos } from '@/config/videoCatalog';

import { useWebSpeechSTT } from '@/hooks/useWebSpeechSTT';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  videoCategory?: string;
  videoCount?: number;
}


interface FullWellnessGeniUIProps {
  isGuestMode?: boolean;
  defaultPersona?: string;
  allowedPersonas?: string[];
  showOnlyPromoter?: boolean;
  onAIResponse?: (text: string) => void;
  onReady?: () => void;
  isAISpeaking?: boolean;
  onClose?: () => void;
}

const LANGUAGES = [
  { code: '', label: 'Auto-Detect', flag: '🌍' },
  { code: 'en-US', label: 'English', flag: '🇬🇧' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl-PL', label: 'Polski', flag: '🇵🇱' },
  { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt-PT', label: 'Português', flag: '🇵🇹' },
];

// Lead capture is handled entirely by the AI backend via tool calls — no frontend patterns needed

const FullWellnessGeniUI: React.FC<FullWellnessGeniUIProps> = ({
  defaultPersona = 'isabella-navia',
  onAIResponse,
  onReady,
  isAISpeaking = false,
  onClose
}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [emailInputMode, setEmailInputMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // Ref to hold latest sendMessage to avoid stale closures
  const sendMessageRef = useRef<(text: string) => void>(() => {});

  // Web Speech STT - fills input on stop so user clicks Send
  const {
    isListening,
    isSupported: isWebSpeechSupported,
    interimTranscript,
    finalTranscript,
    conversationPhase,
    start: startListening,
    stop: stopListening,
    setAISpeaking,
    error: speechError
  } = useWebSpeechSTT({
    onAutoSend: useCallback((text: string) => {
      // Instead of auto-sending, populate input so user hits Send
      setInputText(text);
    }, []),
    lang: selectedLanguage,
  });

  // Sync AI speaking state
  useEffect(() => {
    setAISpeaking(isAISpeaking);
  }, [isAISpeaking, setAISpeaking]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.parentElement?.scrollTo({
      top: messagesEndRef.current.parentElement.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  // Notify parent when ready
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };
    
    if (showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLanguageMenu]);

  // Send message — all lead capture is handled by the AI backend via tool calls
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Pass full conversation history so Isabella has context
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text
      }));
      const isa = await isabellaAPI.sendMessage(text, defaultPersona, history);
      const assistantText = isa.message || "I'm sorry — I didn't get that. Please try again.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: assistantText,
        sender: 'assistant',
        timestamp: new Date(),
        videoCategory: isa.videoSuggestion?.category,
        videoCount: isa.videoSuggestion?.count || 3,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Trigger D-ID or TTS
      if (onAIResponse && assistantText) {
        onAIResponse(assistantText);
      } else if (!isMuted && assistantText) {
        try { await textToSpeechService.speakText(assistantText); } catch {}
      }

    } catch (error) {
      console.error('Chat error:', error);
      // Only show toast for genuine failures, not CRM-related post-processing
      const errMsg = error instanceof Error ? error.message : String(error);
      if (!/lead captured|email sent|crm/i.test(errMsg)) {
        toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  }, [defaultPersona, onAIResponse, isMuted, stopListening, messages]);

  // Keep sendMessageRef updated with latest sendMessage
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInputMode) setEmailInputMode(false);
    sendMessage(inputText);
  };

  const handleReset = () => {
    setMessages([]);
    toast({ title: "Chat Reset", description: "Conversation cleared." });
  };

    const toggleMic = () => {
    if (!isWebSpeechSupported) {
      toast({ title: "Voice Not Supported", description: "Use Chrome or Edge for voice input.", variant: "destructive" });
      return;
    }
    if (isListening) {
      // Stop listening — transcript goes to input, user will tap Send on the pill
      stopListening();
    } else {
      startListening();
    }
  };

    const handleVoiceSend = () => {
    // Send whatever is in the input (populated by STT)
    const text = (finalTranscript + ' ' + interimTranscript).trim() || inputText.trim();
    if (text) {
      setInputText(text);
      sendMessage(text);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-transparent" style={{ minHeight: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-soft-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-champagne-gold/20 to-soft-purple/20 flex items-center justify-center">
            <span className="text-lg">✨</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-soft-white">Isabella</h3>
            <p className="text-xs text-soft-white/60">AI Brand Ambassador</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="p-2 rounded-full bg-soft-white/10 hover:bg-soft-white/20 transition-colors" title="Reset">
            <RotateCcw className="w-4 h-4 text-soft-white" />
          </button>
          
          {/* Custom Language Selector */}
          <div className="relative" ref={languageMenuRef}>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowLanguageMenu(!showLanguageMenu);
              }}
              className="p-2 rounded-full bg-soft-white/10 hover:bg-soft-white/20 transition-colors flex items-center gap-1" 
              title="Chat Language"
              type="button"
            >
              <Globe className="w-4 h-4 text-soft-white" />
              <span className="text-xs text-soft-white/70">
                {LANGUAGES.find(l => l.code === selectedLanguage)?.flag}
              </span>
            </button>
            
            {/* Language Dropdown Menu */}
            {showLanguageMenu && (
              <div 
                className="absolute right-0 top-full mt-2 z-[9999] bg-deep-navy/95 backdrop-blur-sm border border-soft-white/20 rounded-lg shadow-xl min-w-[160px] py-1"
                style={{ position: 'absolute' }}
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedLanguage(lang.code);
                      setShowLanguageMenu(false);
                      toast({
                        title: "Language Changed",
                        description: `Chat language set to ${lang.label}`,
                      });
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-soft-white hover:bg-soft-white/20 transition-colors ${
                      selectedLanguage === lang.code ? 'bg-soft-white/30 font-medium' : ''
                    }`}
                    type="button"
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm">{lang.label}</span>
                    {selectedLanguage === lang.code && <Check className="w-4 h-4 ml-auto text-champagne-gold" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full bg-soft-white/10 hover:bg-soft-white/20 transition-colors" title={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <VolumeX className="w-4 h-4 text-soft-white" /> : <Volume2 className="w-4 h-4 text-soft-white" />}
          </button>
          
          {/* Speak / Send toggle pill button */}
          {isListening ? (
            <button
              onClick={() => { stopListening(); setTimeout(() => handleVoiceSend(), 200); }}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-champagne-gold text-charcoal font-medium text-xs transition-all hover:bg-champagne-gold/90 shadow-lg"
              title="Send voice message"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          ) : (
            <button
              onClick={toggleMic}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-soft-white/10 hover:bg-soft-white/20 text-soft-white text-xs transition-colors"
              title="Click to speak"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Speak</span>
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-soft-white/10 hover:bg-red-500/30 transition-colors"
              title="Close chat"
            >
              <X className="w-4 h-4 text-soft-white" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100% - 128px)', minHeight: '200px', overscrollBehavior: 'contain' }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-3 ${message.sender === 'user' ? 'bg-soft-white/20 text-soft-white ml-4' : 'bg-soft-white/10 text-soft-white mr-4'}`}>
              <p className="text-sm">{message.text}</p>
              {/* Video cards when Isabella suggests portfolio videos */}
              {message.videoCategory && (
                <div className="mt-3 flex flex-col gap-2">
                  {(getVideosByCategory(message.videoCategory).length > 0
                    ? getVideosByCategory(message.videoCategory)
                    : getFallbackVideos()
                  ).slice(0, message.videoCount || 3).map(video => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              )}
              <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
        
        {/* Phase indicator */}
        {conversationPhase !== 'idle' && (
          <div className="flex justify-start">
            <div className={`rounded-xl p-3 mr-4 border transition-all duration-300 ${
              conversationPhase === 'processing' ? 'bg-champagne-gold/20 border-champagne-gold/30' 
              : conversationPhase === 'ai_speaking' ? 'bg-soft-purple/20 border-soft-purple/30'
              : 'bg-red-500/20 border-red-500/30'
            }`}>
              <div className="flex items-center gap-2">
                {conversationPhase === 'listening' && (
                  <>
                    <div className="flex gap-1">
                      {[0, 150, 300].map(delay => (
                        <div key={delay} className="h-2 w-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: `${delay}ms` }} />
                      ))}
                    </div>
                    <span className="text-sm text-red-400">{interimTranscript || finalTranscript || t('chat.listening') || 'Listening...'}</span>
                  </>
                )}
                {conversationPhase === 'processing' && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-champagne-gold" />
                    <span className="text-sm text-champagne-gold">{t('chat.thinking') || 'Thinking...'}</span>
                  </>
                )}
                {conversationPhase === 'ai_speaking' && (
                  <>
                    <div className="flex gap-0.5">
                      {[0, 100, 200, 300, 400].map((delay, i) => (
                        <div key={delay} className={`w-1 bg-soft-purple rounded-full animate-pulse`} style={{ height: [12, 16, 8, 16, 12][i], animationDelay: `${delay}ms` }} />
                      ))}
                    </div>
                    <span className="text-sm text-soft-purple">{t('chat.isabellaSpeaking') || 'Isabella speaking...'}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {isLoading && conversationPhase === 'idle' && (
          <div className="flex justify-start">
            <div className="bg-soft-white/10 rounded-xl p-3 mr-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-soft-white" />
                <span className="text-sm text-soft-white">{t('chat.thinking')}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 pt-2 pb-3 border-t border-soft-white/10 bg-soft-white/5 backdrop-blur">
        {emailInputMode && (
          <p className="mb-1 pl-1 text-xs text-champagne-gold">Please type your email address below</p>
        )}
        {!emailInputMode && !isListening && inputText && !messages.length && (
          <p className="mb-1 pl-1 text-left text-xs text-champagne-gold animate-pulse">Tap the gold arrow to send your message</p>
        )}
        {!emailInputMode && !isListening && !inputText && messages.length === 0 && (
          <p className="mb-1 pl-1 text-left text-xs text-soft-white/50">Click "Speak" above or type below</p>
        )}
        {!emailInputMode && isListening && (
          <p className="mb-1 pl-1 text-left text-xs text-champagne-gold animate-pulse">Speak now — tap "Send" when ready</p>
        )}
        <form onSubmit={handleSubmit} className="mt-0 flex w-full items-end">
          <div className="relative w-full min-w-0">
            <Input
              type={emailInputMode ? "email" : "text"}
              value={isListening && !emailInputMode ? (finalTranscript + ' ' + interimTranscript).trim() : inputText}
              onChange={(e) => (!isListening || emailInputMode) && setInputText(e.target.value)}
              placeholder={emailInputMode ? "your@email.com" : (isListening ? (t('chat.listening') || 'Listening...') : t('chat.placeholder'))}
              className={`h-12 w-full pr-14 bg-soft-white/10 border-soft-white/20 text-soft-white placeholder:text-soft-white/50 focus:border-champagne-gold focus:ring-champagne-gold ${emailInputMode ? 'ring-2 ring-champagne-gold/50' : ''}`}
              disabled={isLoading || (isListening && !emailInputMode)}
              autoFocus={emailInputMode}
            />
            <button
              type="submit"
              aria-label="Send message"
              title="Send message"
              disabled={isLoading || (isListening && !emailInputMode) || !inputText.trim()}
              className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-champagne-gold text-charcoal shadow-lg transition-colors hover:bg-champagne-gold/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FullWellnessGeniUI;
