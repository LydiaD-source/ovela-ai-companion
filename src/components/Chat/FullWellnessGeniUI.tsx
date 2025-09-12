import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { wellnessGeniAPI } from '@/lib/wellnessGeniAPI';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  audioUrl?: string;
  videoUrl?: string;
}

interface FullWellnessGeniUIProps {
  isGuestMode?: boolean;
  defaultPersona?: string;
  allowedPersonas?: string[];
  showOnlyPromoter?: boolean;
}

const FullWellnessGeniUI: React.FC<FullWellnessGeniUIProps> = ({
  isGuestMode = false,
  defaultPersona = 'isabella-navia',
  allowedPersonas = ['isabella-navia'],
  showOnlyPromoter = true
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(defaultPersona);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingChunks, setRecordingChunks] = useState<Blob[]>([]);
  const [isActivated, setIsActivated] = useState(false);
  const [showPromotions, setShowPromotions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      text: isGuestMode 
        ? "Hello! I'm Isabella. How can I help you learn about Ovela Interactive today?"
        : "Welcome to WellnessGeni! I'm Isabella, your AI wellness companion. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [isGuestMode]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(context);
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };
    initAudio();
  }, []);

  const sendMessage = async (text: string, audioData?: Blob) => {
    if (!text.trim() && !audioData) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text || '[Voice message]',
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await wellnessGeniAPI.sendChatMessage(
        text,
        selectedPersona,
        null,
        isGuestMode ? 'ovela-guest' : 'guest-user'
      );

      if (!response.success) {
        throw new Error(response.error || 'API request failed');
      }

      const data = response.data;

      // Extract assistant response text
      let assistantText = "I'm sorry — I didn't get the details. Please try again or ask another question.";
      let audioUrl = '';
      let videoUrl = '';
      
      if (data) {
        // Handle direct response from WellnessGeni API
        if (typeof data === 'string') {
          assistantText = data;
        } else if (data.response || data.message || data.text) {
          assistantText = data.response || data.message || data.text;
          audioUrl = data.audioUrl || data.audio_url || '';
          videoUrl = data.videoUrl || data.video_url || '';
        } else if (data.data) {
          // Handle nested data structure
          if (typeof data.data === 'string') {
            assistantText = data.data;
          } else if (data.data.response || data.data.message || data.data.text) {
            assistantText = data.data.response || data.data.message || data.data.text;
            audioUrl = data.data.audioUrl || data.data.audio_url || '';
            videoUrl = data.data.videoUrl || data.data.video_url || '';
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: assistantText,
        sender: 'assistant',
        timestamp: new Date(),
        audioUrl: audioUrl,
        videoUrl: videoUrl
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Play audio if available and not muted and activated
      if (assistantMessage.audioUrl && !isMuted && isActivated) {
        playAudio(assistantMessage.audioUrl);
      }

      // Play video if available and activated
      if (assistantMessage.videoUrl && videoRef.current && isActivated) {
        videoRef.current.src = assistantMessage.videoUrl;
        videoRef.current.play();
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async (audioUrl: string) => {
    if (!audioContext) return;
    
    try {
      const response = await fetch(audioUrl);
      const audioData = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(audioData);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
};

  const activate = async () => {
    try {
      if (audioContext) {
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
      } else {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(context);
      }
      setIsActivated(true);
      toast({ title: 'Activated', description: 'Animated responses enabled.' });
    } catch (error) {
      console.error('Activation error:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordingChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(recordingChunks, { type: 'audio/webm' });
        sendMessage('', audioBlob);
        setRecordingChunks([]);
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to access microphone.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  return (
    <div className="flex h-full max-w-6xl mx-auto bg-background rounded-xl border shadow-lg overflow-hidden">
      {/* Left side - Large Isabella Image */}
      <div className="w-1/3 bg-gradient-to-br from-electric-blue/10 to-neon-purple/10 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <img 
            src="/lovable-uploads/747c6d6a-cb67-45f5-9bf0-64ea66c8b8e4.png" 
            alt="Isabella Navia - AI Brand Ambassador"
            className="w-full h-auto rounded-2xl shadow-2xl"
          />
        </div>
        <div className="text-center mt-4">
          <h3 className="text-xl font-semibold text-foreground">Isabella Navia</h3>
          <p className="text-sm text-muted-foreground">AI Brand Ambassador</p>
          <p className="text-xs text-muted-foreground mt-1">Ovela Interactive</p>
        </div>
        
        {/* Audio controls and video display */}
        <div className="mt-4 w-full">
          <div className="flex justify-center mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="ml-2 text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
            </Button>
          </div>
          
          {/* D-ID Video Avatar */}
          <video
            ref={videoRef}
            className="w-full h-32 object-cover rounded-lg hidden"
            autoPlay
            muted={isMuted}
            onLoadedData={() => {
              if (videoRef.current) {
                videoRef.current.classList.remove('hidden');
              }
            }}
            onEnded={() => {
              if (videoRef.current) {
                videoRef.current.classList.add('hidden');
              }
            }}
          />
        </div>
      </div>

      {/* Right side - Chat Interface */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="border-b bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Chat with Isabella</h2>
              <p className="text-sm text-muted-foreground">Ask me about Ovela Interactive services & pricing</p>
            </div>
            <div className="flex gap-2">
              {!isActivated && (
                <Button size="sm" onClick={activate} className="hover-scale">
                  Activate animated response
                </Button>
              )}
              {showPromotions && (
                <Button size="sm" variant="outline" onClick={() => setShowPromotions(false)}>
                  Hide Promotions
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Promotions Banner */}
        {showPromotions && isGuestMode && (
          <div className="bg-gradient-to-r from-electric-blue/10 to-neon-purple/10 border-b p-3">
            <div className="text-sm text-center">
              <span className="font-semibold text-electric-blue">🎉 Launch Special:</span>
              <span className="ml-2">50% off for startups & first-time clients</span>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl p-3 ${
                message.sender === 'user' 
                  ? 'bg-primary text-primary-foreground ml-4' 
                  : 'bg-muted mr-4'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-xl p-3 mr-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Isabella is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-muted/30">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message or use voice..."
              disabled={isLoading || isRecording}
              className="flex-1"
            />
            
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className="p-2"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            <Button 
              type="submit" 
              disabled={isLoading || !inputText.trim()}
              size="sm"
              className="p-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          {isRecording && (
            <div className="flex items-center justify-center mt-2">
              <Badge variant="destructive" className="animate-pulse">
                Recording... Click mic to stop
              </Badge>
            </div>
          )}
          
          {isGuestMode && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Powered by Ovela Interactive & WellnessGeni
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullWellnessGeniUI;