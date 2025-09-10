
import React, { useState, useEffect } from 'react';
import IsabellaAvatar from '@/components/UI/IsabellaAvatar';
import ChatMessages from '@/components/Chat/ChatMessages';
import ChatInput from '@/components/Chat/ChatInput';
import { isabellaAPI } from '@/lib/isabellaAPI';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with Isabella Navia welcome message for Ovela visitors
    if (isGuestMode) {
      setMessages([{
        id: '1',
        text: "Hi! I'm Isabella Navia, your AI information ambassador from Ovela Interactive. I'm here to help you learn about our services, pricing, and how we can work together. What would you like to know?",
        sender: 'assistant',
        timestamp: new Date(),
        persona: 'isabella-navia'
      }]);
    }
  }, [isGuestMode]);

  return (
    <div className="flex h-[520px] bg-background rounded-lg border">
      {/* Simplified sidebar - only Isabella Navia */}
      <div className="w-64 border-r bg-muted/30 p-4">
        <div className="space-y-4">
          <div className="text-center">
            <IsabellaAvatar size="large" className="w-24 h-24" />
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
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ChatMessages messages={messages} />
        </div>
        
        <div className="border-t p-3">
          <ChatInput 
            onSendMessage={async (message) => {
              // Add user message immediately
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
                // Send to Isabella API with Ovela context
                const response = await isabellaAPI.sendMessage(message, 'isabella-navia');
                
                // Add Isabella's response
                const isabellaMessage = {
                  id: (Date.now() + 1).toString(),
                  text: response.response || response.message || 'Je suis désolée, je n\'ai pas pu traiter votre message.',
                  sender: 'assistant' as const,
                  timestamp: new Date(),
                  persona: 'isabella-navia'
                };
                
                setMessages(prev => [...prev, isabellaMessage]);
                
                toast({
                  title: "Message envoyé",
                  description: "Isabella a répondu à votre message.",
                });
              } catch (error) {
                console.error('Error sending message:', error);
                
                // Add error message
                const errorMessage = {
                  id: (Date.now() + 1).toString(),
                  text: 'Je suis désolée, je rencontre des difficultés techniques. Veuillez réessayer dans un moment.',
                  sender: 'assistant' as const,
                  timestamp: new Date(),
                  persona: 'isabella-navia'
                };
                
                setMessages(prev => [...prev, errorMessage]);
                
                toast({
                  title: "Erreur",
                  description: "Impossible de contacter Isabella. Veuillez réessayer.",
                  variant: "destructive",
                });
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
