
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import GuestChatInterface from '@/components/Chat/GuestChatInterface';

const GuestIsabella = () => {
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source');
  
  // Only allow access from Ovela
  if (source !== 'ovela') {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Welcome from Ovela Interactive</h1>
          <p className="text-muted-foreground">Chat with Isabella Navia - Your AI Information Ambassador</p>
        </div>
        
        <GuestChatInterface 
          isGuestMode={true}
          allowedPersonas={['isabella-navia']}
          defaultPersona="isabella-navia"
          showOnlyPromoter={true}
        />
      </div>
    </div>
  );
};

export default GuestIsabella;
