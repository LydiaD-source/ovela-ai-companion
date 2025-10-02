import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { wellnessGeniAPI } from '@/lib/wellnessGeniAPI';
import { toast } from '@/hooks/use-toast';
import { textToSpeechService } from '@/lib/textToSpeech';

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
  const [isActivated, setIsActivated] = useState(false);
  const [showPromotions, setShowPromotions] = useState(true);
  const [isInVoiceMode, setIsInVoiceMode] = useState(false);
  const [voiceStream, setVoiceStream] = useState<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // No initial greeting to keep chat minimal on load
  useEffect(() => {
    setMessages([]);
  }, [isGuestMode]);

  // Auto-scroll to bottom when new messages arrive - only scroll the chat container
  useEffect(() => {
    const chatContainer = messagesEndRef.current?.parentElement;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
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

      // Extract assistant response text from standardized ovela-chat response
      let assistantText = "I'm sorry — I didn't get the details. Please try again or ask another question.";
      let audioUrl = '';
      let videoUrl = '';
      
      if (data) {
        // Handle ovela-chat response format: { success: true, message: "...", data: {} }
        if (data.message) {
          assistantText = data.message;
          audioUrl = data.audioUrl || '';
          videoUrl = data.videoUrl || '';
        } else if (typeof data === 'string') {
          assistantText = data;
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

      // Generate and play speech if not muted
      if (!isMuted && assistantText) {
        try {
          await textToSpeechService.speakText(assistantText);
        } catch (error) {
          console.error('Error playing speech:', error);
        }
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

  const startVoiceMode = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      setVoiceStream(stream);
      setIsInVoiceMode(true);
      
      // Start continuous voice recording with speech detection
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      let chunks: Blob[] = [];
      let silenceTimer: NodeJS.Timeout;
      let isRecordingVoice = false;
      
      // Speech detection using audio analysis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkAudioLevel = () => {
        if (!isInVoiceMode) return;
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        
        // Detect speech (adjust threshold as needed)
        if (average > 25 && !isRecordingVoice) {
          // Start recording
          chunks = [];
          recorder.start();
          isRecordingVoice = true;
          setIsRecording(true);
          clearTimeout(silenceTimer);
        } else if (average <= 25 && isRecordingVoice) {
          // Silence detected, set timer to stop recording
          clearTimeout(silenceTimer);
          silenceTimer = setTimeout(() => {
            if (isRecordingVoice && recorder.state === 'recording') {
              recorder.stop();
              isRecordingVoice = false;
              setIsRecording(false);
            }
          }, 1000); // Stop after 1 second of silence
        }
        
        requestAnimationFrame(checkAudioLevel);
      };
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          // Convert audio to text and send message
          await processVoiceInput(audioBlob);
        }
      };
      
      setMediaRecorder(recorder);
      checkAudioLevel();
      
      toast({
        title: "Voice Mode Active",
        description: "Start speaking naturally - I'll respond with voice!",
      });
      
    } catch (error) {
      console.error('Error starting voice mode:', error);
      toast({
        title: "Error",
        description: "Failed to access microphone for voice mode.",
        variant: "destructive"
      });
    }
  };

  const stopVoiceMode = () => {
    setIsInVoiceMode(false);
    setIsRecording(false);
    
    if (voiceStream) {
      voiceStream.getTracks().forEach(track => track.stop());
      setVoiceStream(null);
    }
    
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    
    toast({
      title: "Voice Mode Disabled",
      description: "Switched back to text chat mode.",
    });
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      // For now, we'll send the audio blob as before but enhance UX
      const userMessage: Message = {
        id: Date.now().toString(),
        text: '🎤 Voice message',
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      // For now, send a placeholder message for voice input
      // TODO: Implement speech-to-text conversion
      const response = await wellnessGeniAPI.sendChatMessage(
        'I just sent a voice message. Please respond naturally as if I spoke to you.',
        selectedPersona,
        undefined,
        isGuestMode ? 'ovela-guest' : 'guest-user'
      );

      if (!response.success) {
        throw new Error(response.error || 'API request failed');
      }

      const data = response.data;
      let assistantText = "I'm sorry — I didn't get the details. Please try again or ask another question.";
      let audioUrl = '';
      let videoUrl = '';
      
      if (data) {
        if (data.message) {
          assistantText = data.message;
          audioUrl = data.audioUrl || '';
          videoUrl = data.videoUrl || '';
        } else if (typeof data === 'string') {
          assistantText = data;
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

      // Always play speech in voice mode
      if (assistantText) {
        try {
          await textToSpeechService.speakText(assistantText);
        } catch (error) {
          console.error('Error playing speech:', error);
        }
      }

      // Play video if available and activated
      if (assistantMessage.videoUrl && videoRef.current && isActivated) {
        videoRef.current.src = assistantMessage.videoUrl;
        videoRef.current.play();
      }

    } catch (error) {
      console.error('Error processing voice input:', error);
      toast({
        title: "Error",
        description: "Failed to process voice message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  return (
    <div className="flex h-full max-w-6xl mx-auto bg-background rounded-xl border shadow-lg overflow-hidden">
      {/* Left side - Isabella Image (Larger, more prominent) */}
      <div className="w-2/5 bg-gradient-to-br from-electric-blue/10 to-neon-purple/10 flex flex-col items-center justify-start p-6 pt-8">
        <div className="w-full max-w-md">
          <img 
            src="/lovable-uploads/747c6d6a-cb67-45f5-9bf0-64ea66c8b8e4.png" 
            alt="Isabella Navia - AI Brand Ambassador"
            className="w-full h-auto rounded-2xl shadow-2xl"
          />
        </div>
        <div className="text-center mt-6">
          <h3 className="text-xl font-semibold text-foreground">Isabella Navia</h3>
          <p className="text-sm text-muted-foreground">AI Brand Ambassador</p>
          <p className="text-xs text-muted-foreground mt-1">Ovela Interactive</p>
        </div>
        
        {/* Audio controls and video display */}
        <div className="mt-6 w-full">
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

      {/* Right side - Chat Interface (More compact) */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header - More compact */}
        <div className="border-b bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Chat with Isabella</h2>
              <p className="text-xs text-muted-foreground">Ask about services & pricing</p>
            </div>
            <div className="flex gap-2">
              {!isActivated && (
                <Button size="sm" onClick={activate} className="hover-scale text-xs px-3 py-1">
                  Activate Animation
                </Button>
              )}
              {showPromotions && (
                <Button size="sm" variant="outline" onClick={() => setShowPromotions(false)} className="text-xs px-3 py-1">
                  Hide Promo
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

        {/* Chat Messages - Adjusted height for better face visibility */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent" style={{ maxHeight: 'calc(100% - 200px)' }}>
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

        {/* Input Area - Positioned higher */}
        <div className="p-3 border-t bg-muted/30 mt-auto">
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
              variant={isInVoiceMode ? "destructive" : isRecording ? "secondary" : "outline"}
              size="sm"
              onClick={isInVoiceMode ? stopVoiceMode : startVoiceMode}
              disabled={isLoading}
              className="p-2"
            >
              {isInVoiceMode ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
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
          
          {isInVoiceMode && (
            <div className="flex items-center justify-center mt-2">
              <Badge variant={isRecording ? "destructive" : "secondary"} className={isRecording ? "animate-pulse" : ""}>
                {isRecording ? "🎤 Listening..." : "🔊 Voice Mode Active - Start Speaking"}
              </Badge>
            </div>
          )}
          
            {isGuestMode && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Powered by Ovela Interactive
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default FullWellnessGeniUI;