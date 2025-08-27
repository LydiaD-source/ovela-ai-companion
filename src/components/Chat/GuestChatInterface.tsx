
import React, { useState, useEffect } from 'react';
import IsabellaAvatar from '@/components/UI/IsabellaAvatar';
import ChatMessages from '@/components/Chat/ChatMessages';
import ChatInput from '@/components/Chat/ChatInput';

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
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ChatMessages messages={messages} />
        </div>
        
        <div className="border-t p-4">
          <ChatInput 
            onSendMessage={(message) => {
              // Handle message sending logic here
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: message,
                sender: 'user',
                timestamp: new Date(),
                persona: currentPersona
              }]);
            }}
            placeholder="Ask Isabella about Ovela Interactive services..."
          />
        </div>
      </div>
    </div>
  );
};

export default GuestChatInterface;
