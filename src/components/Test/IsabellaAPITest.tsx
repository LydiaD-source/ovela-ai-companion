import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { isabellaAPI, type IsabellaResponse } from '@/lib/isabellaAPI';
import { Loader2, Send, CheckCircle, XCircle } from 'lucide-react';

const IsabellaAPITest = () => {
  const [message, setMessage] = useState('Bonjour Isabella, peux-tu me dire bonjour depuis Ovela Interactive?');
  const [response, setResponse] = useState<IsabellaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    if (!message.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un message",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await isabellaAPI.sendMessage(message, 'isabella-navia');
      setResponse(result);
      toast({
        title: "✅ Connexion réussie!",
        description: "Isabella a répondu depuis Wellness Geni",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      toast({
        title: "❌ Erreur de connexion",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testGuestSession = async () => {
    setLoading(true);
    try {
      const result = await isabellaAPI.initGuestSession('ovela');
      toast({
        title: "✅ Session invité initialisée",
        description: "La session invité fonctionne correctement",
      });
      console.log('Guest session result:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      toast({
        title: "❌ Erreur session invité",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Test de Connexion Isabella API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-message">Message de test</Label>
            <Input
              id="test-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tapez votre message de test..."
              disabled={loading}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={testConnection} 
              disabled={loading || !message.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Test en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Tester Message
                </>
              )}
            </Button>
            
            <Button 
              onClick={testGuestSession} 
              variant="outline"
              disabled={loading}
            >
              Tester Session Invité
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 text-destructive">
              <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Erreur de connexion</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card className="border-green-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 text-green-700">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold">Réponse d'Isabella</h3>
                <div className="mt-3 space-y-2">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm">{response.message}</p>
                  </div>
                  
                  {response.audioUrl && (
                    <div>
                      <Label className="text-xs">URL Audio:</Label>
                      <p className="text-xs text-muted-foreground break-all">{response.audioUrl}</p>
                    </div>
                  )}
                  
                  {response.videoUrl && (
                    <div>
                      <Label className="text-xs">URL Vidéo:</Label>
                      <p className="text-xs text-muted-foreground break-all">{response.videoUrl}</p>
                    </div>
                  )}
                  
                  {response.emotion && (
                    <div>
                      <Label className="text-xs">Émotion:</Label>
                      <p className="text-xs text-muted-foreground">{response.emotion}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IsabellaAPITest;