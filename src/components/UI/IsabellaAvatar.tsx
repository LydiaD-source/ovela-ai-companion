
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ISABELLA_FACE_IMAGE_URL = 'https://res.cloudinary.com/di5gj4nyp/image/upload/v1758918813/Flux_Dev_v_0_xhxy5n.jpg';

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
      <AvatarImage src={ISABELLA_FACE_IMAGE_URL} alt="Isabella Navia" className="object-cover object-[center_35%]" />
      <AvatarFallback className="bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 text-electric-blue font-semibold">
        IN
      </AvatarFallback>
    </Avatar>
  );
};

export default IsabellaAvatar;
