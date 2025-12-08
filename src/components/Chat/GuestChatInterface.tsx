import React, { useState, useEffect } from 'react';
import AvatarDisplay from '@/components/AvatarDisplay';
import ChatMessages from '@/components/Chat/ChatMessages';
import ChatInput from '@/components/Chat/ChatInput';
import { StreamingService } from '@/services/StreamingService';
import GlobalAutoplayManager from '@/services/GlobalAutoplayManager';

import { useToast } from '@/hooks/use-toast';
import { Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isabellaAPI } from '@/lib/isabellaAPI';

// Cloudinary avatar URL - MUST be accessible by D-ID
const AVATAR_URL = 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1759836676/golddress_ibt1fp.png';

interface GuestChatInterfaceProps {
  isGuestMode?: boolean;
  allowedPersonas?: string[];
  defaultPersona?: string;
  showOnlyPromoter?: boolean;
}

const GuestChatInterface: React.FC<GuestChatInterfaceProps> = ({
  isGuestMode = false,
  allowedPersonas = [],
  defaultPersona = 'isabella-navia',
  showOnlyPromoter = false
}) => {
  const [messages, setMessages] = useState([]);
  const [currentPersona, setCurrentPersona] = useState(defaultPersona);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to StreamingService events
    const unsubConnection = StreamingService.onConnectionChange(setIsConnected);
    const unsubSpeaking = StreamingService.onSpeakingChange(setIsSpeaking);

    // Initialize stream on first user interaction
    const unsubAutoplay = GlobalAutoplayManager.subscribe(async () => {
      try {
        console.log('🚀 Initializing D-ID stream...');
        await StreamingService.init(AVATAR_URL);
      } catch (error) {
        console.error('Failed to init stream:', error);
      }
    });

    return () => {
      unsubConnection();
      unsubSpeaking();
      unsubAutoplay();
    };
  }, []);

  const handleSendMessage = async (message: string) => {
    // Trigger autoplay permission
    GlobalAutoplayManager.triggerInteraction();

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user' as const,
      timestamp: new Date(),
      persona: currentPersona
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('💬 Sending to Isabella (brand: ovela_client_001)');
      const isa = await isabellaAPI.sendMessage(message, currentPersona);
      const assistantText = isa.message || "I'm sorry — I didn't get the details. Please try again or ask another question.";

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        text: assistantText,
        sender: 'assistant' as const,
        timestamp: new Date(),
        persona: currentPersona
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Animate avatar with D-ID if not muted
      if (!isMuted && assistantText) {
        try {
          await StreamingService.speak({
            avatarUrl: AVATAR_URL,
            text: assistantText,
          });
        } catch (error) {
          console.error('Error with avatar animation:', error);
          toast({
            title: "Avatar Animation",
            description: "Voice playback unavailable, text response shown.",
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect right now. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'assistant' as const,
        timestamp: new Date(),
        persona: currentPersona
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[600px] bg-background rounded-lg border">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 p-4">
        <div className="space-y-4">
          <div className="text-center">
            <AvatarDisplay 
              avatarUrl={AVATAR_URL} 
              size="large"
              className="mx-auto"
            />
            <h3 className="font-semibold mt-2">Isabella Navia</h3>
            <p className="text-sm text-muted-foreground">
              {isSpeaking ? 'Speaking...' : 'Information Ambassador'}
            </p>
            
            {/* Connection status */}
            <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${isConnected ? 'text-green-500' : 'text-muted-foreground'}`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isConnected ? 'Live' : 'Click to connect'}</span>
            </div>
          </div>
          
          <button
            className={`w-full p-3 rounded-lg text-left transition-colors ${
              currentPersona === 'isabella-navia' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
            onClick={() => setCurrentPersona('isabella-navia')}
          >
            <div className="font-medium">Isabella Navia</div>
            <div className="text-sm opacity-75">Your AI Ambassador</div>
          </button>

          {showOnlyPromoter && (
            <div className="mt-8 pt-4 border-t">
              <button className="w-full p-3 bg-gradient-to-r from-electric-blue to-neon-purple text-white rounded-lg font-medium">
                Promoter
              </button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Marketing & Brand Ambassador Mode
              </p>
            </div>
          )}

          {/* Audio controls */}
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="w-full justify-center"
            >
              {isMuted ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
              <span className="text-sm">{isMuted ? 'Enable Voice' : 'Disable Voice'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ChatMessages messages={messages} />
        </div>
        
        <div className="border-t p-4">
          <ChatInput 
            onSendMessage={handleSendMessage}
            placeholder="Ask Isabella about Ovela Interactive services..."
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default GuestChatInterface;
