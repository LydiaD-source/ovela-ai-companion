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
      // Navigate directly to the guest chat interface; the chat call itself verifies connectivity
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
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Navigation Error",
        description: "Please try again.",
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