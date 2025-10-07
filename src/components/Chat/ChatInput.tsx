
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  placeholder = "Type your message...",
  disabled = false 
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleTranscript = (transcript: string) => {
    if (transcript.trim()) {
      console.log('📝 Transcript received, sending to chat:', transcript);
      onSendMessage(transcript.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <VoiceInputButton 
        onTranscript={handleTranscript}
        disabled={disabled}
      />
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
      <Button 
        type="submit" 
        disabled={!message.trim() || disabled}
        size="icon"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};

export default ChatInput;
