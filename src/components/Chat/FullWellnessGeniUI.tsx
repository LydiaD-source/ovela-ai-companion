import * as React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
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
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputText, setInputText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [selectedPersona, setSelectedPersona] = React.useState(defaultPersona);
  const [audioContext, setAudioContext] = React.useState<AudioContext | null>(null);
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const [recordingChunks, setRecordingChunks] = React.useState<Blob[]>([]);
  // Settings state
  const [voiceStyle, setVoiceStyle] = React.useState<'feminine' | 'neutral' | 'energetic'>('feminine');
  const [avatarEnabled, setAvatarEnabled] = React.useState(true);
  const [volume, setVolume] = React.useState(1);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Initialize with welcome message
  React.useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      text: isGuestMode 
        ? "Hi! I'm Isabella Navia, your AI companion from Ovela Interactive. I can help with strategy, content and campaigns. Current promos: Starter €1,500/mo, Growth €3,500/mo (Most Popular), Premium €6,000/mo. Ask me about Ambassador Videos from €750 and Shoutouts from €250. How can I assist you today?"
        : "Welcome to WellnessGeni! I'm Isabella, your AI wellness companion. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [isGuestMode]);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize audio context
  React.useEffect(() => {
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
      const { data, error } = await supabase.functions.invoke('ovela-chat', {
        body: {
          message: text,
          persona: selectedPersona,
          userId: isGuestMode ? undefined : 'guest-user'
        }
      });

      if (error) throw error;

      // Extract assistant response text
      let assistantText = 'I received your message.';
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

      // Play audio if available and not muted
      if (assistantMessage.audioUrl && !isMuted) {
        playAudio(assistantMessage.audioUrl);
      }

      // Play video if available
      if (assistantMessage.videoUrl && videoRef.current) {
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
    try {
      const audio = new Audio(audioUrl);
      audio.volume = isMuted ? 0 : volume;
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
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
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-background rounded-xl border shadow-lg">
      {/* Header */}
      <CardHeader className="border-b bg-muted/50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/lovable-uploads/747c6d6a-cb67-45f5-9bf0-64ea66c8b8e4.png" alt="Isabella Navia" />
              <AvatarFallback className="bg-gradient-to-br from-electric-blue/20 to-neon-purple/20 text-electric-blue font-semibold">
                IN
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Isabella Navia</CardTitle>
              <p className="text-sm text-muted-foreground">AI Companion - Ovela Interactive</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {allowedPersonas.length > 1 && (
              <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allowedPersonas.map(persona => (
                    <SelectItem key={persona} value={persona}>
                      {persona.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2" aria-label="Settings">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Isabella Settings</DialogTitle>
                  <DialogDescription>Adjust voice, avatar and playback</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <Label htmlFor="voice-style">Voice style</Label>
                    <Select value={voiceStyle} onValueChange={(v) => setVoiceStyle(v as any)}>
                      <SelectTrigger id="voice-style"><SelectValue placeholder="Select style" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feminine">Feminine</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="energetic">Energetic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="avatar-enabled">Animated avatar</Label>
                    <Switch id="avatar-enabled" checked={avatarEnabled} onCheckedChange={setAvatarEnabled} />
                  </div>
                  <div className="space-y-2">
                    <Label>Playback volume</Label>
                    <Slider value={[Math.round(volume * 100)]} onValueChange={(vals) => setVolume((vals[0] ?? 100) / 100)} max={100} step={1} />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      {/* Chat Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '400px' }}>
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
      </CardContent>

      {/* D-ID Video Avatar (Hidden by default, shows when video available) */}
      {avatarEnabled && (
        <div className="px-4">
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
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-muted/30 rounded-b-xl">
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
  );
};

export default FullWellnessGeniUI;