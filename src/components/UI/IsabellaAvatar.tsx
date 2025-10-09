
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface IsabellaAvatarProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  isSpeaking?: boolean;
}

const IsabellaAvatar: React.FC<IsabellaAvatarProps> = ({ 
  size = 'medium', 
  className = '',
  isSpeaking = false
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-20 h-20'
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className} transition-all duration-300 ${isSpeaking ? 'ring-4 ring-electric-blue/50 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : ''}`}>
      <AvatarImage src="/lovable-uploads/747c6d6a-cb67-45f5-9bf0-64ea66c8b8e4.png" alt="Isabella Navia" />
      <AvatarFallback className="bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 text-electric-blue font-semibold">
        IN
      </AvatarFallback>
    </Avatar>
  );
};

export default IsabellaAvatar;
