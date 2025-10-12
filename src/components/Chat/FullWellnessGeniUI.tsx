import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Send, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoiceInputButton } from './VoiceInputButton';
import { toast } from '@/hooks/use-toast';
import { textToSpeechService } from '@/lib/textToSpeech';
import { isabellaAPI } from '@/lib/isabellaAPI';
import { crmAPI } from '@/lib/crmAPI';

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
}

interface FullWellnessGeniUIProps {
  isGuestMode?: boolean;
  defaultPersona?: string;
  allowedPersonas?: string[];
  showOnlyPromoter?: boolean;
}

const FullWellnessGeniUI: React.FC<FullWellnessGeniUIProps> = ({
  isGuestMode = false,
  defaultPersona = 'isabella-navia',
  allowedPersonas = ['isabella-navia'],
  showOnlyPromoter = true
}) => {
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

  // No initial greeting to keep chat minimal on load
  useEffect(() => {
    setMessages([]);
  }, [isGuestMode]);

  // Auto-scroll to bottom when new messages arrive - only scroll the chat container
  useEffect(() => {
    const chatContainer = messagesEndRef.current?.parentElement;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  // Initialize audio context
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

  // Detect contact intent
  const hasContactIntent = (text: string): boolean => {
    const contactIntent = /(contact|get in touch|reach out|email|collaborate|work with|partnership|project|demo|inquiry|pricing|schedule|call|meeting)/i;
    return contactIntent.test(text);
  };

  // Extract contact details from user message
  const extractContactDetails = (text: string, currentDraft: LeadDraft): Partial<LeadDraft> => {
    const extracted: Partial<LeadDraft> = {};
    
    // Extract email (only if not already captured)
    if (!currentDraft.email) {
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        extracted.email = emailMatch[0];
        console.log('[LeadDetection] 📧 Email detected:', extracted.email);
      }
    }
    
    // Extract name (only if not already captured)
    if (!currentDraft.name) {
      const nameMatch = text.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/);
      if (nameMatch) {
        extracted.name = nameMatch[0];
        console.log('[LeadDetection] 👤 Name detected:', extracted.name);
      }
    }
    
    // Extract message (remaining text after removing email and name)
    if (!currentDraft.message) {
      let messageText = text;
      if (extracted.email) {
        messageText = messageText.replace(extracted.email, '');
      }
      if (extracted.name) {
        messageText = messageText.replace(extracted.name, '');
      }
      messageText = messageText.replace(/^(?:hi|hello|hey|my name is|i'm|i am|this is)[,\s]*/i, '').trim();
      
      if (messageText.length > 5) {
        extracted.message = messageText;
        console.log('[LeadDetection] 💬 Message detected:', extracted.message);
      }
    }
    
    return extracted;
  };

  // Submit lead to CRM
  const submitLeadToCRM = async (draft: LeadDraft) => {
    if (!draft.name || !draft.email || !draft.message || leadSubmitted) {
      return false;
    }
    
    try {
      console.log('📤 Submitting lead to CRM:', draft);
      
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
      
      if (result.success) {
        console.log('✅ CRM submission successful');
        setLeadSubmitted(true);
        return true;
      } else {
        console.error('❌ CRM submission failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error submitting to CRM:', error);
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

    // Detect contact intent
    if (!isCollectingLead && hasContactIntent(text)) {
      console.log('[LeadDetection] 🎯 Contact intent detected, starting lead capture...');
      setIsCollectingLead(true);
    }

    // Extract contact details if in collection mode
    let updatedDraft = { ...leadDraft };
    if (isCollectingLead) {
      const extracted = extractContactDetails(text, leadDraft);
      updatedDraft = { ...leadDraft, ...extracted };
      setLeadDraft(updatedDraft);
      console.log('[LeadDetection] Current draft:', updatedDraft);
    }

    try {
      let assistantText = "";
      let audioUrl = '';
      let videoUrl = '';

      // Check if we're collecting lead data
      if (isCollectingLead && !leadSubmitted) {
        const { name, email, message } = updatedDraft;

        // Check if all fields are present
        if (name && email && message) {
          console.log('[LeadDetection] 🎯 All contact details collected, submitting to CRM...');
          const submitted = await submitLeadToCRM(updatedDraft);
          
          if (submitted) {
            assistantText = `Perfect, ${name} — I've shared your details with my team. They'll reach out shortly to continue this conversation. ✨`;
            setIsCollectingLead(false);
            setLeadDraft({});
            console.log('[LeadSubmitted] ✅ Success');
          } else {
            assistantText = "Thank you! I've noted your info and will have my team contact you manually.";
            console.log('[LeadSubmitted] ⚠️ Failed, manual follow-up needed');
          }
        } else {
          // Ask only for missing fields in order
          if (!name) {
            assistantText = "Could I have your first name, please?";
          } else if (!email) {
            assistantText = "And your best email address so my team can follow up?";
          } else if (!message) {
            assistantText = "Lovely — could you tell me what you'd like to discuss or create together?";
          }
        }
      } else {
        // Normal conversation flow
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

      // Generate and play speech if not muted
      if (!isMuted && assistantText) {
        try {
          await textToSpeechService.speakText(assistantText);
        } catch (error) {
          console.error('Error playing speech:', error);
        }
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
    setLeadDraft({});
    setLeadSubmitted(false);
    setIsCollectingLead(false);
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
          
          <VoiceInputButton 
            onTranscript={(text) => sendMessage(text)}
            disabled={isLoading}
          />
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
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-soft-white/10 rounded-xl p-3 mr-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-soft-white" />
                <span className="text-sm text-soft-white">Isabella is thinking...</span>
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
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Isabella about modeling, pricing, availability..."
            className="flex-1 bg-soft-white/10 border-soft-white/20 text-soft-white placeholder:text-soft-white/50 focus:border-champagne-gold focus:ring-champagne-gold"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !inputText.trim()}
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
