import React from 'react';
import { useLocation } from 'react-router-dom';
import FullWellnessGeniUI from '@/components/Chat/FullWellnessGeniUI';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const GuestIsabella = () => {
  const location = useLocation();
  const { persona = 'isabella-navia', source = 'ovela', connectedToWellnessGeni = false } = location.state || {};

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center mb-8">
            <h1 className="heading-lg mb-4">Chat with Isabella</h1>
            <p className="text-muted-foreground">
              {connectedToWellnessGeni 
                ? "Connected to WellnessGeni - Chat with Isabella about Ovela Interactive services"
                : "Guest Chat Mode - Learn about Ovela Interactive"
              }
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto" style={{ height: '600px' }}>
          <FullWellnessGeniUI 
            isGuestMode={true}
            defaultPersona={persona}
            allowedPersonas={[persona]}
            showOnlyPromoter={source === 'ovela'}
          />
        </div>
      </div>
    </div>
  );
};

export default GuestIsabella;