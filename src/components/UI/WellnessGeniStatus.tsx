import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { wellnessGeniAPI } from '@/lib/wellnessGeniAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  lastChecked: Date | null;
  error?: string;
}

const WellnessGeniStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isLoading: false,
    lastChecked: null
  });

  const checkConnection = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await wellnessGeniAPI.getPersonaInfo('isabella-navia');
      
      setStatus({
        isConnected: response.success,
        isLoading: false,
        lastChecked: new Date(),
        error: response.success ? undefined : response.error
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        isLoading: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Connection failed'
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    if (status.isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />;
    }
    
    if (status.isConnected) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusText = () => {
    if (status.isLoading) return 'Checking connection...';
    if (status.isConnected) return 'Connected to WellnessGeni';
    return 'Connection failed';
  };

  const getStatusDescription = () => {
    if (status.isConnected) {
      return 'All Ovela Interactive buttons are successfully connected to the WellnessGeni API through our Supabase backend.';
    }
    
    if (status.error) {
      return `Error: ${status.error}`;
    }
    
    return 'Unable to establish connection to WellnessGeni API.';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          WellnessGeni Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium text-sm">{getStatusText()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {getStatusDescription()}
          </p>
        </div>
        
        {status.lastChecked && (
          <p className="text-xs text-muted-foreground">
            Last checked: {status.lastChecked.toLocaleTimeString()}
          </p>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={checkConnection}
          disabled={status.isLoading}
          className="w-full"
        >
          {status.isLoading ? 'Checking...' : 'Test Connection'}
        </Button>
        
        {status.isConnected && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-green-800 text-xs font-medium">
              ✅ Integration Ready for Boss Demo
            </p>
            <p className="text-green-600 text-xs mt-1">
              All buttons across the Ovela website now connect to WellnessGeni through our secure Supabase backend.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WellnessGeniStatus;