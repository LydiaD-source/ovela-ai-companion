import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX, Send, Loader2, RotateCcw, Mic, MicOff, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { textToSpeechService } from '@/lib/textToSpeech';
import { isabellaAPI } from '@/lib/isabellaAPI';
import { crmAPI } from '@/lib/crmAPI';
import { useWebSpeechSTT } from '@/hooks/useWebSpeechSTT';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface LeadDraft {
  name?: string;
  email?: string;
  message?: string;
  inferred?: { name: boolean; email: boolean; message: boolean };
  confirmed?: { name: boolean; email: boolean; message: boolean };
}

interface FullWellnessGeniUIProps {
  isGuestMode?: boolean;
  defaultPersona?: string;
  allowedPersonas?: string[];
  showOnlyPromoter?: boolean;
  onAIResponse?: (text: string) => void;
  onReady?: () => void;
  isAISpeaking?: boolean;
}

const LANGUAGES = [
  { code: 'en-US', label: 'English', flag: '🇬🇧' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl-PL', label: 'Polski', flag: '🇵🇱' },
  { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt-PT', label: 'Português', flag: '🇵🇹' },
];

const EMAIL_ASK_PATTERNS = /(email address|your email|best email|what('s| is) your email)/i;
const CONTACT_INTENT_PATTERNS = /(contact|get in touch|reach out|email|collaborate|work with|partnership|project|demo|inquiry|pricing|team|connect|talk to|speak with)/i;

const FullWellnessGeniUI: React.FC<FullWellnessGeniUIProps> = ({
  defaultPersona = 'isabella-navia',
  onAIResponse,
  onReady,
  isAISpeaking = false
}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [leadDraft, setLeadDraft] = useState<LeadDraft>({});
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isCollectingLead, setIsCollectingLead] = useState(false);
  const [emailInputMode, setEmailInputMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // Web Speech STT with auto-send
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
      sendMessage(text);
    }, []),
    lang: selectedLanguage,
    silenceTimeout: 600
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

  // Validation helpers
  const isValidEmail = (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const isValidName = (name: string) => /^[A-Za-zÀ-ÿ\s'-]+$/.test(name.trim()) && name.trim().length >= 2;

  // Extract contact details from user message
  const extractContactDetails = useCallback((text: string, draft: LeadDraft): Partial<LeadDraft> => {
    const extracted: Partial<LeadDraft> = {
      inferred: draft.inferred || { name: false, email: false, message: false },
      confirmed: draft.confirmed || { name: false, email: false, message: false }
    };
    
    // Email
    if (!draft.email) {
      const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
      if (emails?.length) {
        extracted.email = emails[0].toLowerCase().trim();
        extracted.inferred!.email = true;
      }
    }
    
    // Name
    if (!draft.name) {
      const namePatterns = [
        /(?:my name is|i am|i'm|this is|call me|name:\s*)\s+([A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)?)/i,
        /^([A-ZÀ-Ý][a-zà-ÿ]+)\s/,
        /^([A-Za-zÀ-ÿ]+)\s+[A-Za-z0-9._%+-]+@/i
      ];
      
      for (const pattern of namePatterns) {
        const match = text.match(pattern);
        if (match?.[1]) {
          const name = match[1].trim();
          extracted.name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
          extracted.inferred!.name = true;
          break;
        }
      }

      // Single token fallback
      if (!extracted.name && /^[A-Za-zÀ-ÿ]+$/.test(text.trim())) {
        const name = text.trim();
        extracted.name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        extracted.inferred!.name = true;
      }
    }
    
    // Message
    if (!draft.message) {
      let msg = text;
      if (extracted.email) msg = msg.replace(extracted.email, '');
      if (extracted.name) msg = msg.replace(new RegExp(extracted.name, 'gi'), '');
      msg = msg.replace(/^(?:hi|hello|hey|my name is|i'm|i am|this is|call me|about|regarding|message:?|email:?|name:?)[,\s]*/gi, '').trim();
      
      if (msg.length >= 5) {
        extracted.message = msg;
        extracted.inferred!.message = true;
      }
    }
    
    return extracted;
  }, []);

  // Submit lead to CRM
  const submitLeadToCRM = useCallback(async (draft: LeadDraft) => {
    if (!draft.name || !draft.email || !draft.message || leadSubmitted) return false;
    
    try {
      const messageLower = draft.message.toLowerCase();
      let inquiryType: 'modeling' | 'collaboration' | 'brand' | 'general' = 'general';
      if (messageLower.includes('partner') || messageLower.includes('collab')) inquiryType = 'collaboration';
      else if (messageLower.includes('brand') || messageLower.includes('promo')) inquiryType = 'brand';
      else if (messageLower.includes('model') || messageLower.includes('shoot')) inquiryType = 'modeling';
      
      const result = await crmAPI.submitLead({
        name: draft.name,
        email: draft.email,
        inquiry_type: inquiryType,
        message: draft.message,
        source: 'ovela-isabella-chat'
      });
      
      return result.success;
    } catch {
      return false;
    }
  }, [leadSubmitted]);

  // Send message
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

    // Detect contact intent
    const hasIntent = CONTACT_INTENT_PATTERNS.test(text);
    if (!isCollectingLead && hasIntent) {
      setIsCollectingLead(true);
    }

    // Extract contact details
    let updatedDraft = { ...leadDraft };
    if (isCollectingLead || hasIntent) {
      const extracted = extractContactDetails(text, leadDraft);
      updatedDraft = { 
        ...leadDraft, 
        ...extracted,
        inferred: { ...(leadDraft.inferred || { name: false, email: false, message: false }), ...(extracted.inferred || {}) },
        confirmed: { ...(leadDraft.confirmed || { name: false, email: false, message: false }), ...(extracted.confirmed || {}) }
      };
      setLeadDraft(updatedDraft);
    }

    try {
      let assistantText = "";

      // Lead collection flow
      if ((isCollectingLead || hasIntent) && !leadSubmitted) {
        const { name, email, message, confirmed } = updatedDraft;

        // Validate name
        if (name && !confirmed?.name) {
          if (!isValidName(name)) {
            setLeadDraft(prev => ({ ...prev, name: undefined, inferred: { ...prev.inferred, name: false } }));
            assistantText = "Hmm, I didn't quite catch that — could you please retype your name?";
          } else {
            setLeadDraft(prev => ({ ...prev, confirmed: { ...prev.confirmed, name: true } }));
            updatedDraft.confirmed!.name = true;
            if (!email) assistantText = `Perfect, thanks ${name}! What's your email address?`;
          }
        }

        // Validate email
        if (email && !confirmed?.email && confirmed?.name) {
          if (!isValidEmail(email)) {
            setLeadDraft(prev => ({ ...prev, email: undefined, inferred: { ...prev.inferred, email: false } }));
            assistantText = "That doesn't look like a full email — could you double-check it?";
          } else {
            setLeadDraft(prev => ({ ...prev, confirmed: { ...prev.confirmed, email: true } }));
            updatedDraft.confirmed!.email = true;
            if (!message) assistantText = `Got it, ${name}. What would you like our team to help you with?`;
          }
        }

        // Confirm message
        if (message && !confirmed?.message && confirmed?.name && confirmed?.email) {
          setLeadDraft(prev => ({ ...prev, confirmed: { ...prev.confirmed, message: true } }));
          updatedDraft.confirmed!.message = true;
        }

        // Submit when complete
        if (name && email && message && confirmed?.name && confirmed?.email) {
          setLeadSubmitted(true);
          const submitted = await submitLeadToCRM(updatedDraft);
          
          if (submitted) {
            assistantText = `Thank you, ${name}! I've sent your details to our team. They'll reach out shortly.`;
            setIsCollectingLead(false);
            setLeadDraft({});
            toast({ title: "Lead Submitted", description: "Your contact information has been sent." });
          } else {
            setLeadSubmitted(false);
            assistantText = "It seems there was a small hiccup. Let's try that again.";
          }
        }

        // Ask for missing field
        if (!assistantText) {
          if (!name) assistantText = "May I have your first name?";
          else if (!email) assistantText = "What's your email address?";
          else if (!message) assistantText = "What would you like our team to help you with?";
        }
      } else {
        // Normal conversation - pass full history for context
        const history = messages.map(m => ({
          role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: m.text
        }));
        const isa = await isabellaAPI.sendMessage(text, defaultPersona, history, selectedLanguage);
        assistantText = isa.message || "I'm sorry — I didn't get that. Please try again.";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: assistantText,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Switch to typing mode for email
      if (EMAIL_ASK_PATTERNS.test(assistantText)) {
        setEmailInputMode(true);
        stopListening();
      }

      // Trigger D-ID or TTS
      if (onAIResponse && assistantText) {
        onAIResponse(assistantText);
      } else if (!isMuted && assistantText) {
        try { await textToSpeechService.speakText(assistantText); } catch {}
      }

    } catch (error) {
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [leadDraft, isCollectingLead, leadSubmitted, defaultPersona, onAIResponse, isMuted, extractContactDetails, submitLeadToCRM, stopListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInputMode) setEmailInputMode(false);
    sendMessage(inputText);
  };

  const handleReset = () => {
    setMessages([]);
    setLeadDraft({ inferred: { name: false, email: false, message: false }, confirmed: { name: false, email: false, message: false } });
    setLeadSubmitted(false);
    setIsCollectingLead(false);
    toast({ title: "Chat Reset", description: "Conversation cleared." });
  };

  const toggleMic = () => {
    if (!isWebSpeechSupported) {
      toast({ title: "Voice Not Supported", description: "Use Chrome or Edge for voice input.", variant: "destructive" });
      return;
    }
    isListening ? stopListening() : startListening();
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
          
          <button
            onClick={toggleMic}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/80 hover:bg-red-500 animate-pulse' : 'bg-soft-white/10 hover:bg-soft-white/20'}`}
            title={isListening ? 'Stop' : 'Start voice'}
          >
            {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-soft-white" />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100% - 128px)', minHeight: '200px', overscrollBehavior: 'contain' }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-3 ${message.sender === 'user' ? 'bg-soft-white/20 text-soft-white ml-4' : 'bg-soft-white/10 text-soft-white mr-4'}`}>
              <p className="text-sm">{message.text}</p>
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
      <div className="flex-shrink-0 p-4 border-t border-soft-white/10 bg-soft-white/5 backdrop-blur">
        {emailInputMode && (
          <p className="text-xs text-champagne-gold mb-2">⌨️ Please type your email address below</p>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type={emailInputMode ? "email" : "text"}
            value={isListening && !emailInputMode ? (finalTranscript + ' ' + interimTranscript).trim() : inputText}
            onChange={(e) => (!isListening || emailInputMode) && setInputText(e.target.value)}
            placeholder={emailInputMode ? "your@email.com" : (isListening ? (t('chat.listening') || 'Listening...') : t('chat.placeholder'))}
            className={`flex-1 bg-soft-white/10 border-soft-white/20 text-soft-white placeholder:text-soft-white/50 focus:border-champagne-gold focus:ring-champagne-gold ${emailInputMode ? 'ring-2 ring-champagne-gold/50' : ''}`}
            disabled={isLoading || (isListening && !emailInputMode)}
            autoFocus={emailInputMode}
          />
          <Button type="submit" disabled={isLoading || (isListening && !emailInputMode) || !inputText.trim()} className="bg-champagne-gold/80 hover:bg-champagne-gold text-charcoal">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default FullWellnessGeniUI;
