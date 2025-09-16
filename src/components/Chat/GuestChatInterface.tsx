
import React, { useState, useEffect } from 'react';
import IsabellaAvatar from '@/components/UI/IsabellaAvatar';
import ChatMessages from '@/components/Chat/ChatMessages';
import ChatInput from '@/components/Chat/ChatInput';
import { wellnessGeniAPI } from '@/lib/wellnessGeniAPI';
import { useToast } from '@/hooks/use-toast';
import { textToSpeechService } from '@/lib/textToSpeech';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Extract assistant text robustly from various API response shapes
const extractAssistantText = (data: any): string => {
  const candidates = [
    data?.message,
    data?.response,
    data?.data?.message,
    data?.data?.response,
    data?.answer,
    data?.data?.answer,
    data?.text,
    data?.content,
    data?.choices?.[0]?.message?.content,
  ].filter((v) => typeof v === 'string' && v.trim().length > 0) as string[];
  return candidates[0] || '';
};

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
  const { toast } = useToast();

  useEffect(() => {
    // Keep chat minimal: no initial greeting message
  }, [isGuestMode]);

  return (
    <div className="flex h-[600px] bg-background rounded-lg border">
      {/* Simplified sidebar - only Isabella Navia */}
      <div className="w-64 border-r bg-muted/30 p-4">
        <div className="space-y-4">
          <div className="text-center">
            <IsabellaAvatar size="large" />
            <h3 className="font-semibold mt-2">Isabella Navia</h3>
            <p className="text-sm text-muted-foreground">Information Ambassador</p>
          </div>
          
          {/* Only show Isabella Navia button */}
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
            onSendMessage={async (message) => {
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
                // Send to WellnessGeni API
                const response = await wellnessGeniAPI.sendChatMessage(message, currentPersona);
                
                if (response.success && response.data) {
                  const assistantText = extractAssistantText(response.data);
                  const assistantMessage = {
                    id: (Date.now() + 1).toString(),
                    text: assistantText || "I'm sorry — I didn't get the details. Please try again or ask another question.",
                    sender: 'assistant' as const,
                    timestamp: new Date(),
                    persona: currentPersona
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
                } else {
                  throw new Error(response.error || 'Failed to get response');
                }
              } catch (error) {
                console.error('Chat error:', error);
                toast({
                  title: "Connection Error",
                  description: "Unable to connect right now. Please try again.",
                  variant: "destructive",
                });
                
                // Add error message
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
            }}
            placeholder="Ask Isabella about Ovela Interactive services..."
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default GuestChatInterface;
