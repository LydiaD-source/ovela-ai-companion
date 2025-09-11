import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wellnessGeniAPI } from '@/lib/wellnessGeniAPI';
import { useToast } from '@/hooks/use-toast';

export const useWellnessGeniChat = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const startChat = async (persona: string = 'isabella-navia', source: string = 'ovela') => {
    setIsConnecting(true);

    try {
      // Test connection to WellnessGeni
      const response = await wellnessGeniAPI.getPersonaInfo(persona);
      
      if (response.success) {
        // Navigate to guest chat interface
        navigate('/guest-isabella', { 
          state: { 
            persona, 
            source,
            connectedToWellnessGeni: true 
          } 
        });
        
        toast({
          title: "Connected to WellnessGeni",
          description: "You're now connected to Isabella through our WellnessGeni integration.",
        });
      } else {
        throw new Error(response.error || 'Failed to connect');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to WellnessGeni. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getServicesInfo = async () => {
    try {
      const response = await wellnessGeniAPI.getServicesInfo();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to get services info');
    } catch (error) {
      console.error('Services info error:', error);
      toast({
        title: "Error",
        description: "Unable to fetch services information.",
        variant: "destructive",
      });
      return null;
    }
  };

  const getPricingInfo = async () => {
    try {
      const response = await wellnessGeniAPI.getPricingInfo();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to get pricing info');
    } catch (error) {
      console.error('Pricing info error:', error);
      toast({
        title: "Error",
        description: "Unable to fetch pricing information.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    startChat,
    getServicesInfo,
    getPricingInfo,
    isConnecting
  };
};