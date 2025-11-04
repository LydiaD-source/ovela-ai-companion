import { useEffect, useRef, useState } from 'react';
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
} from '@heygen/streaming-avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Interface pour le système de reconnaissance vocale
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface IsabellaAvatarStreamProps {
  onStreamingChange?: (isStreaming: boolean) => void;
}

export const IsabellaAvatarStream = ({ onStreamingChange }: IsabellaAvatarStreamProps) => {
  const { toast } = useToast();
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isUserTalking, setIsUserTalking] = useState(false);

  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const recognition = useRef<SpeechRecognition | null>(null);

  // Initialize avatar on mount
  useEffect(() => {
    avatar.current = new StreamingAvatar({ token: '' });
    
    // Set up event listeners
    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, () => {
      console.log('Avatar started talking');
    });

    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
      console.log('Avatar stopped talking');
    });

    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log('Stream disconnected');
      endSession();
    });

    avatar.current.on(StreamingEvents.STREAM_READY, (event) => {
      console.log('Stream ready:', event.detail);
      setStream(event.detail);
    });

    return () => {
      endSession();
    };
  }, []);

  // Update video element when stream changes
  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        console.log('Playing video stream');
      };
    }
  }, [stream]);

  async function fetchAccessToken() {
    try {
      const { data, error } = await supabase.functions.invoke('heygen-proxy', {
        body: {
          action: 'create_token',
          payload: {}
        }
      });

      if (error) throw error;
      const token = data?.data?.token || data?.token;
      if (!token) throw new Error('Token missing from heygen-proxy response');
      return token as string;
    } catch (error) {
      console.error('Error fetching access token:', error);
      toast({
        title: "Erreur",
        description: "Échec de récupération du token HeyGen",
        variant: "destructive"
      });
      return null;
    }
  }

  async function startSession() {
    setIsLoadingSession(true);
    try {
      const token = await fetchAccessToken();
      if (!token) {
        throw new Error('Failed to get access token');
      }

      avatar.current = new StreamingAvatar({ token });

      // Set up event listeners again with new instance
      avatar.current.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.log('Avatar started talking');
      });

      avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log('Avatar stopped talking');
      });

      avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Stream disconnected');
        endSession();
      });

      avatar.current.on(StreamingEvents.STREAM_READY, (event) => {
        console.log('Stream ready:', event.detail);
        setStream(event.detail);
      });

      // Create streaming session with Isabella V3 avatar
      const sessionInfo = await avatar.current.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: '017021724d054084998f375522ab90d3',
        disableIdleTimeout: false,
      });

      setSessionData(sessionInfo);
      onStreamingChange?.(true);

      toast({
        title: "Connected",
        description: "Isabella is now live!",
      });

      // Say welcome message
      await handleSpeak("Bonjour ! Je suis Isabella, l'IA ambassadrice d'Ovela. Comment puis-je vous aider aujourd'hui ?");

    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to start session",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSession(false);
    }
  }

  async function handleSpeak(text: string) {
    setIsLoadingRepeat(true);
    try {
      if (!avatar.current) {
        throw new Error('Avatar not initialized');
      }

      await avatar.current.speak({
        text: text,
        task_type: TaskType.REPEAT,
        taskMode: TaskMode.SYNC,
      });
    } catch (error) {
      console.error('Error speaking:', error);
      toast({
        title: "Error",
        description: "Failed to generate speech",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRepeat(false);
    }
  }

  async function handleInterrupt() {
    try {
      if (!avatar.current) {
        throw new Error('Avatar not initialized');
      }
      await avatar.current.interrupt();
    } catch (error) {
      console.error('Error interrupting:', error);
    }
  }

  function endSession() {
    try {
      avatar.current?.stopAvatar();
      setStream(null);
      setSessionData(null);
      onStreamingChange?.(false);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  const handleUserTalk = async () => {
    if (isUserTalking) {
      // Stop listening
      if (recognition.current) {
        recognition.current.stop();
      }
      setIsUserTalking(false);
    } else {
      // Start listening
      if (!recognition.current) {
        initSpeechRecognition();
      }
      
      if (recognition.current) {
        try {
          recognition.current.start();
          setIsUserTalking(true);
          toast({
            title: "Écoute activée",
            description: "Parlez maintenant... Isabella vous écoute",
          });
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          toast({
            title: "Erreur",
            description: "Impossible d'activer le microphone",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Non disponible",
          description: "La reconnaissance vocale n'est pas supportée par votre navigateur",
          variant: "destructive"
        });
      }
    }
  };

  const initSpeechRecognition = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      console.error('Speech recognition not supported');
      return;
    }

    recognition.current = new SpeechRecognitionAPI();
    recognition.current.continuous = true;
    recognition.current.interimResults = true;
    recognition.current.lang = 'fr-FR'; // Français par défaut, peut être changé

    recognition.current.onresult = async (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript;
        console.log('User said:', transcript);
        
        // Faire parler Isabella avec la réponse
        await handleSpeak(`Vous avez dit: ${transcript}. Je comprends.`);
      }
    };

    recognition.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsUserTalking(false);
      
      if (event.error === 'not-allowed') {
        toast({
          title: "Permission refusée",
          description: "Veuillez autoriser l'accès au microphone",
          variant: "destructive"
        });
      }
    };

    recognition.current.onend = () => {
      setIsUserTalking(false);
    };
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Avatar Video Container */}
      <div className="relative w-full max-w-3xl aspect-video bg-black/50 rounded-lg overflow-hidden mb-6">
        {stream ? (
          <video
            ref={mediaStream}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          >
            <track kind="captions" />
          </video>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-6xl">👋</span>
              </div>
              <p className="text-white/70 text-lg">
                {isLoadingSession ? 'Connecting to Isabella...' : 'Click "Start Session" to meet Isabella'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4 flex-wrap justify-center">
        {!stream ? (
          <Button
            onClick={startSession}
            disabled={isLoadingSession}
            size="lg"
            className="min-w-[200px]"
          >
            {isLoadingSession ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              'Start Session'
            )}
          </Button>
        ) : (
          <>
            <Button
              onClick={handleUserTalk}
              variant={isUserTalking ? "destructive" : "default"}
              size="lg"
            >
              {isUserTalking ? (
                <>
                  <MicOff className="mr-2 h-5 w-5" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Talk to Isabella
                </>
              )}
            </Button>
            
            <Button
              onClick={handleInterrupt}
              variant="outline"
              size="lg"
            >
              Interrupt
            </Button>
            
            <Button
              onClick={endSession}
              variant="secondary"
              size="lg"
            >
              End Session
            </Button>
          </>
        )}
      </div>

      {/* Session Info */}
      {sessionData && (
        <div className="mt-4 text-sm text-white/50 text-center">
          Session ID: {sessionData.session_id}
        </div>
      )}
    </div>
  );
};
