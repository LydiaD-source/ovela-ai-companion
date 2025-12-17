import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX, Send, Loader2, RotateCcw, Mic, MicOff } from 'lucide-react';
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
  audioUrl?: string;
  videoUrl?: string;
}

interface LeadDraft {
  name?: string;
  email?: string;
  message?: string;
  inferred?: {
    name: boolean;
    email: boolean;
    message: boolean;
  };
  confirmed?: {
    name: boolean;
    email: boolean;
    message: boolean;
  };
}

interface FullWellnessGeniUIProps {
  isGuestMode?: boolean;
  defaultPersona?: string;
  allowedPersonas?: string[];
  showOnlyPromoter?: boolean;
  onAIResponse?: (text: string) => void;
  onReady?: () => void;
}

const FullWellnessGeniUI: React.FC<FullWellnessGeniUIProps> = ({
  isGuestMode = false,
  defaultPersona = 'isabella-navia',
  allowedPersonas = ['isabella-navia'],
  showOnlyPromoter = true,
  onAIResponse,
  onReady
}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(defaultPersona);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [leadDraft, setLeadDraft] = useState<LeadDraft>({});
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isCollectingLead, setIsCollectingLead] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Real-time Web Speech API hook with auto-send on silence
  const {
    isListening,
    isSupported: isWebSpeechSupported,
    interimTranscript,
    finalTranscript,
    conversationPhase,
    start: startListening,
    stop: stopListening,
    error: speechError
  } = useWebSpeechSTT({
    onAutoSend: (text) => {
      console.log('[WebSpeechSTT] 📤 Auto-sending message:', text);
      sendMessage(text);
    },
    silenceTimeout: 1000, // 1 second pause = turn complete
    continuous: true // keep mic active for natural conversation
  });

  useEffect(() => {
    const chatContainer = messagesEndRef.current?.parentElement;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const initAudio = async () => {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(context);
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };
    initAudio();
  }, []);

  // Notify parent when ready
  useEffect(() => {
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  // Detect contact intent
  const hasContactIntent = (text: string): boolean => {
    const contactIntent = /(contact|get in touch|reach out|email|collaborate|work with|partnership|project|demo|inquiry|pricing|team|connect|talk to|speak with)/i;
    return contactIntent.test(text);
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  };

  // Validate name (letters with accents, spaces, apostrophes or hyphens; min 2 chars)
  const isValidName = (name: string): boolean => {
    const cleaned = name.trim();
    return /^[A-Za-zÀ-ÿ\s'-]+$/.test(cleaned) && cleaned.length >= 2;
  };

  // Extract contact details from user message with robust heuristics
  const extractContactDetails = (text: string, currentDraft: LeadDraft): Partial<LeadDraft> => {
    const extracted: Partial<LeadDraft> = {
      inferred: currentDraft.inferred || { name: false, email: false, message: false },
      confirmed: currentDraft.confirmed || { name: false, email: false, message: false }
    };
    
    // 1) Email detection (highest confidence)
    if (!currentDraft.email) {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = text.match(emailRegex);
      if (emails && emails.length) {
        const potentialEmail = emails[0].toLowerCase().trim();
        extracted.email = potentialEmail;
        extracted.inferred!.email = true;
        console.log('[CRM] 📧 Email:', extracted.email);
      }
    }
    
    // 2) Name detection - multiple patterns + single-token fallback
    if (!currentDraft.name) {
      // Explicit patterns: "my name is", "i'm", "i am", "this is", "call me"
      const namePatterns = [
        /(?:my name is|i am|i'm|this is|call me|name:\s*)\s+([A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)?)/i,
        /^([A-ZÀ-Ý][a-zà-ÿ]+)\s/,  // Capitalized word at start (supports accents)
        /^([A-Za-zÀ-ÿ]+)\s+[A-Za-z0-9._%+-]+@/i  // Word before email (e.g., "kris zgud24@...")
      ];
      
      for (const pattern of namePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const potentialName = match[1].trim();
          // Capitalize first letter
          extracted.name = potentialName.charAt(0).toUpperCase() + potentialName.slice(1).toLowerCase();
          extracted.inferred!.name = true;
          console.log('[CRM] 👤 Name:', extracted.name);
          break;
        }
      }

      // Single-token fallback (e.g., "kris")
      if (!extracted.name) {
        const singleToken = text.trim();
        if (/^[A-Za-zÀ-ÿ]+$/.test(singleToken)) {
          extracted.name = singleToken.charAt(0).toUpperCase() + singleToken.slice(1).toLowerCase();
          extracted.inferred!.name = true;
          console.log('[CRM] 👤 Name (single-token):', extracted.name);
        }
      }
    }
    
    // 3) Message detection (the rest, excluding email and name)
    if (!currentDraft.message) {
      let messageCandidate = text;
      
      // Remove email
      if (extracted.email) {
        messageCandidate = messageCandidate.replace(extracted.email, '');
      }
      
      // Remove name
      if (extracted.name) {
        messageCandidate = messageCandidate.replace(new RegExp(extracted.name, 'gi'), '');
      }
      
      // Clean up common prefixes
      messageCandidate = messageCandidate
        .replace(/^(?:hi|hello|hey|my name is|i'm|i am|this is|call me|about|regarding|message:?|email:?|name:?)[,\s]*/gi, '')
        .trim();
      
      // Accept if substantial enough
      if (messageCandidate.length >= 5) {
        extracted.message = messageCandidate;
        extracted.inferred!.message = true;
        console.log('[CRM] 💬 Message:', extracted.message);
      }
    }
    
    return extracted;
  };

  // Submit lead to CRM
  const submitLeadToCRM = async (draft: LeadDraft) => {
    if (!draft.name || !draft.email || !draft.message || leadSubmitted) {
      console.log('[CRM] Submit attempt skipped', { submitted: leadSubmitted, draft });
      return false;
    }
    
    try {
      console.log('[CRM] 📤 Submitting to CRM:', draft);
      
      // Determine inquiry type based on message content
      let inquiryType: 'modeling' | 'collaboration' | 'brand' | 'general' = 'general';
      const messageLower = draft.message.toLowerCase();
      if (messageLower.includes('partner') || messageLower.includes('collaboration') || messageLower.includes('collab')) {
        inquiryType = 'collaboration';
      } else if (messageLower.includes('brand') || messageLower.includes('promo')) {
        inquiryType = 'brand';
      } else if (messageLower.includes('model') || messageLower.includes('shoot') || messageLower.includes('photo')) {
        inquiryType = 'modeling';
      }
      
      const result = await crmAPI.submitLead({
        name: draft.name,
        email: draft.email,
        inquiry_type: inquiryType,
        message: draft.message,
        source: 'ovela-isabella-chat'
      });
      
      console.log('[CRM] Submission response:', result);
      
      if (result.success) {
        console.log('[CRM] ✅ Submission successful');
        setLeadSubmitted(true);
        return true;
      } else {
        console.error('[CRM] ❌ Submission failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('[CRM] ❌ Error:', error);
      return false;
    }
  };

  const sendMessage = async (text: string, audioData?: Blob) => {
    if (!text.trim() && !audioData) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text || '[Voice message]',
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Detect contact intent and start collection
    if (!isCollectingLead && hasContactIntent(text)) {
      console.log('[CRM] Lead detected');
      setIsCollectingLead(true);
    }

    // Extract contact details on EVERY message when collecting
    let updatedDraft = { ...leadDraft };
    if (isCollectingLead || hasContactIntent(text)) {
      const extracted = extractContactDetails(text, leadDraft);
      updatedDraft = { 
        ...leadDraft, 
        ...extracted,
        inferred: { 
          ...(leadDraft.inferred || { name: false, email: false, message: false }),
          ...(extracted.inferred || {})
        },
        confirmed: {
          ...(leadDraft.confirmed || { name: false, email: false, message: false }),
          ...(extracted.confirmed || {})
        }
      };
      setLeadDraft(updatedDraft);
      console.log('[CRM] Current draft state:', updatedDraft);
    }

    try {
      let assistantText = "";
      let audioUrl = '';
      let videoUrl = '';

      // Handle lead collection with validation
      if ((isCollectingLead || hasContactIntent(text)) && !leadSubmitted) {
        const { name, email, message, confirmed } = updatedDraft;

        // Validate name if present but not confirmed
        if (name && !confirmed?.name) {
          if (!isValidName(name)) {
            setLeadDraft(prev => ({ 
              ...prev, 
              name: undefined, 
              inferred: { ...prev.inferred, name: false } 
            }));
            assistantText = "Hmm, I didn't quite catch that — could you please retype your name so I can save it correctly?";
          } else {
            // Confirm name
            setLeadDraft(prev => ({ 
              ...prev, 
              confirmed: { ...prev.confirmed, name: true } 
            }));
            updatedDraft.confirmed!.name = true;
            
            if (!email) {
              assistantText = `Perfect, thanks ${name}! And your best email address, please?`;
            }
          }
        }

        // Validate email if present but not confirmed
        if (email && !confirmed?.email && confirmed?.name) {
          if (!isValidEmail(email)) {
            setLeadDraft(prev => ({ 
              ...prev, 
              email: undefined, 
              inferred: { ...prev.inferred, email: false } 
            }));
            assistantText = "That doesn't look like a full email — could you double-check it for me?";
          } else {
            // Confirm email
            setLeadDraft(prev => ({ 
              ...prev, 
              confirmed: { ...prev.confirmed, email: true } 
            }));
            updatedDraft.confirmed!.email = true;
            
            if (!message) {
              assistantText = `Got it, ${name}. Could you tell me briefly what you'd like my team to contact you about?`;
            }
          }
        }

        // Confirm message when present
        if (message && !confirmed?.message && confirmed?.name && confirmed?.email) {
          setLeadDraft(prev => ({ 
            ...prev, 
            confirmed: { ...prev.confirmed, message: true } 
          }));
          updatedDraft.confirmed!.message = true;
        }

        // Submit when all fields are validated and confirmed
        if (name && email && message && confirmed?.name && confirmed?.email) {
          console.log('[CRM] All fields validated and confirmed, submitting...');
          console.log('[CRM] Payload ready', { name, email, message });
          setLeadSubmitted(true);
          
          const submitted = await submitLeadToCRM(updatedDraft);
          
          if (submitted) {
            console.log('[CRM] Submission successful');
            assistantText = `Thank you, ${name}! I've sent your details to our team. They'll reach out shortly.`;
            setIsCollectingLead(false);
            setLeadDraft({});
            toast({
              title: "Lead Submitted",
              description: "Your contact information has been sent to our team.",
            });
          } else {
            console.error('[CRM] Submission failed');
            setLeadSubmitted(false);
            assistantText = "It seems there was a small hiccup. Let’s try that again.";
          }
        }

        // Ask for first missing field if no validation happened above
        if (!assistantText) {
          if (!name) {
            assistantText = "May I have your first name, please?";
          } else if (!email) {
            assistantText = "And your best email address, please?";
          } else if (!message) {
            assistantText = "Could you tell me briefly what you'd like my team to contact you about?";
          }
        }
      } else {
        // Normal conversation flow - answer questions about Ovela
        console.log('💬 Sending to Isabella (brand: ovela_client_001)');
        const isa = await isabellaAPI.sendMessage(text, selectedPersona);
        assistantText = isa.message || "I'm sorry — I didn't get the details. Please try again or ask another question.";
        audioUrl = isa.audioUrl || '';
        videoUrl = isa.videoUrl || '';
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: assistantText,
        sender: 'assistant',
        timestamp: new Date(),
        audioUrl: audioUrl,
        videoUrl: videoUrl
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Trigger D-ID avatar if callback is provided
      console.log('💬 About to trigger onAIResponse callback');
      console.log('💬 onAIResponse exists:', typeof onAIResponse);
      console.log('💬 assistantText:', assistantText?.substring(0, 50));
      
      if (onAIResponse && assistantText) {
        console.log('💬 Calling onAIResponse callback with:', assistantText.substring(0, 50));
        onAIResponse(assistantText);
      } else {
        console.log('💬 onAIResponse NOT called - callback:', !!onAIResponse, 'text:', !!assistantText);
      }

      // Generate and play speech if not muted AND no D-ID callback
      // (If D-ID is active, it handles audio through the video)
      if (!isMuted && assistantText && !onAIResponse) {
        console.log('🔊 Playing text-to-speech (no D-ID callback)');
        try {
          await textToSpeechService.speakText(assistantText);
        } catch (error) {
          console.error('Error playing speech:', error);
        }
      } else if (onAIResponse) {
        console.log('🎬 Skipping text-to-speech - D-ID will handle audio');
      }

      // Play video if available
      if (assistantMessage.videoUrl && videoRef.current) {
        videoRef.current.src = assistantMessage.videoUrl;
        videoRef.current.play();
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async (audioUrl: string) => {
    if (!audioContext) return;
    
    try {
      const response = await fetch(audioUrl);
      const audioData = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(audioData);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleResetMessages = () => {
    setMessages([]);
    setLeadDraft({ 
      inferred: { name: false, email: false, message: false },
      confirmed: { name: false, email: false, message: false }
    });
    setLeadSubmitted(false);
    setIsCollectingLead(false);
    console.log('[CRM] 🔄 Chat reset');
    toast({
      title: "Chat Reset",
      description: "Conversation cleared.",
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-transparent" style={{ minHeight: 0 }}>
      {/* Compact Header */}
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
        
        {/* Top Right Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetMessages}
            className="p-2 rounded-full bg-soft-white/10 hover:bg-soft-white/20 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4 text-soft-white" />
          </button>
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-soft-white/10 hover:bg-soft-white/20 transition-colors"
            title={isMuted ? "Unmute Isabella" : "Mute Isabella"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-soft-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-soft-white" />
            )}
          </button>
          
          <button
            onClick={() => {
              if (!isWebSpeechSupported) {
                toast({
                  title: "Voice Input Not Supported",
                  description: "Live voice input works best in Chrome or Edge.",
                  variant: "destructive"
                });
                return;
              }
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors ${
              isListening 
                ? 'bg-red-500/80 hover:bg-red-500 animate-pulse' 
                : 'bg-soft-white/10 hover:bg-soft-white/20'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-white" />
            ) : (
              <Mic className="w-4 h-4 text-soft-white" />
            )}
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ 
          maxHeight: 'calc(100% - 128px)',
          minHeight: '200px',
          overscrollBehavior: 'contain'
        }}
      >
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-3 ${
              message.sender === 'user' 
                ? 'bg-soft-white/20 text-soft-white ml-4' 
                : 'bg-soft-white/10 text-soft-white mr-4'
            }`}>
              <p className="text-sm">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {/* Real-time voice input indicator with phase awareness */}
        {(isListening || conversationPhase === 'processing' || conversationPhase === 'waiting') && (
          <div className="flex justify-start">
            <div className={`rounded-xl p-3 mr-4 border transition-all duration-300 ${
              conversationPhase === 'processing' 
                ? 'bg-champagne-gold/20 border-champagne-gold/30' 
                : conversationPhase === 'waiting'
                ? 'bg-soft-purple/20 border-soft-purple/30'
                : 'bg-red-500/20 border-red-500/30'
            }`}>
              <div className="flex items-center gap-2">
                {/* Animated indicator based on phase */}
                {conversationPhase === 'listening' && (
                  <>
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-red-400">
                      {interimTranscript || finalTranscript || t('chat.listening') || 'Listening...'}
                    </span>
                  </>
                )}
                {conversationPhase === 'processing' && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-champagne-gold" />
                    <span className="text-sm text-champagne-gold">{t('chat.thinking') || 'Thinking...'}</span>
                  </>
                )}
                {conversationPhase === 'waiting' && (
                  <>
                    <div className="h-3 w-3 bg-soft-purple rounded-full animate-pulse" />
                    <span className="text-sm text-soft-purple">{t('chat.yourTurn') || 'Your turn...'}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {isLoading && (
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

      {/* Chat Input */}
      <div className="flex-shrink-0 p-4 border-t border-soft-white/10 bg-soft-white/5 backdrop-blur">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            value={isListening ? (finalTranscript + ' ' + interimTranscript).trim() : inputText}
            onChange={(e) => !isListening && setInputText(e.target.value)}
            placeholder={isListening ? (t('chat.listening') || 'Listening...') : t('chat.placeholder')}
            className="flex-1 bg-soft-white/10 border-soft-white/20 text-soft-white placeholder:text-soft-white/50 focus:border-champagne-gold focus:ring-champagne-gold"
            disabled={isLoading || isListening}
          />
          <Button 
            type="submit" 
            disabled={isLoading || isListening || !inputText.trim()}
            className="bg-champagne-gold/80 hover:bg-champagne-gold text-charcoal"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Hidden video element */}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        muted={isMuted}
      />
    </div>
  );
};

export default FullWellnessGeniUI;
