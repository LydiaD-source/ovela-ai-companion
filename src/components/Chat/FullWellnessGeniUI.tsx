import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { wellnessGeniAPI } from '@/lib/wellnessGeniAPI';
import { toast } from '@/hooks/use-toast';
import { textToSpeechService } from '@/lib/textToSpeech';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeVoiceButton } from '@/components/Chat/RealtimeVoiceButton';


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
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      let chunks: Blob[] = [];
      let silenceTimer: NodeJS.Timeout;
      let isRecordingVoice = false;
      
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
        
        if (average > 25 && !isRecordingVoice) {
          chunks = [];
          recorder.start();
          if (true /* ENABLE_STT_TESTING */) {
            setTimeout(() => {
              if (recorder.state === 'recording') recorder.stop();
            }, 5000);
          }
          isRecordingVoice = true;
          setIsRecording(true);
          clearTimeout(silenceTimer);
        } else if (average <= 25 && isRecordingVoice) {
          clearTimeout(silenceTimer);
          silenceTimer = setTimeout(() => {
            if (isRecordingVoice && recorder.state === 'recording') {
              recorder.stop();
              isRecordingVoice = false;
              setIsRecording(false);
            }
          }, 1000);
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
      setIsLoading(true);

      // Convert audio blob to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Call new public transcribe edge function with multipart upload
      const form = new FormData();
      form.append('file', audioBlob, 'recording.webm');
      const resp = await fetch('https://vrpgowcocbztclxfzssu.supabase.co/functions/v1/transcribe', {
        method: 'POST',
        body: form,
      });
      const transcriptionData = await resp.json();
      if (!resp.ok || !transcriptionData?.text) {
        throw new Error(transcriptionData?.error || 'Failed to transcribe audio');
      }

      const transcribedText = transcriptionData.text as string;
      console.log('Transcribed text:', transcribedText);

      const userMessage: Message = {
        id: Date.now().toString(),
        text: transcribedText || '🎤 Voice message',
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      const response = await wellnessGeniAPI.sendChatMessage(
        transcribedText || 'I just sent a voice message. Please respond naturally as if I spoke to you.',
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

      if (assistantText) {
        try {
          await textToSpeechService.speakText(assistantText);
        } catch (error) {
          console.error('Error playing speech:', error);
        }
      }

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

  const handleResetMessages = () => {
    setMessages([]);
    toast({
      title: "Chat Reset",
      description: "Conversation cleared.",
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-transparent" style={{ minHeight: 0 }}>
      {/* Compact Header */}
      <div className="flex items-center justify-between p-3 border-b border-soft-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-champagne-gold/20 to-soft-purple/20 flex items-center justify-center">
            <span className="text-lg">✨</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-soft-white">Isabella</h3>
            <p className="text-xs text-soft-white/60">AI Brand Ambassador</p>
          </div>
        </div>
        
        {/* Top Right Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetMessages}
            className="p-2 rounded-full bg-soft-white/10 hover:bg-soft-white/20 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4 text-soft-white" />
          </button>
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-soft-white/10 hover:bg-soft-white/20 transition-colors"
            title={isMuted ? "Unmute Isabella" : "Mute Isabella"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-soft-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-soft-white" />
            )}
          </button>
          
          <button
            onClick={isInVoiceMode ? stopVoiceMode : startVoiceMode}
            className={`p-2 rounded-full transition-colors ${
              isInVoiceMode 
                ? 'bg-champagne-gold/80 hover:bg-champagne-gold' 
                : 'bg-soft-white/10 hover:bg-soft-white/20'
            } ${isRecording ? 'animate-pulse' : ''}`}
            title={isInVoiceMode ? "Stop voice mode" : "Start voice mode"}
          >
            {isInVoiceMode ? (
              <MicOff className="w-4 h-4 text-charcoal" />
            ) : (
              <Mic className="w-4 h-4 text-soft-white" />
            )}
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ 
          maxHeight: 'calc(100% - 128px)',
          minHeight: '200px',
          overscrollBehavior: 'contain'
        }}
      >
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-3 ${
              message.sender === 'user' 
                ? 'bg-soft-white/20 text-soft-white ml-4' 
                : 'bg-soft-white/10 text-soft-white mr-4'
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
            <div className="bg-soft-white/10 rounded-xl p-3 mr-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-soft-white" />
                <span className="text-sm text-soft-white">Isabella is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="flex-shrink-0 p-4 border-t border-soft-white/10 bg-soft-white/5 backdrop-blur">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <RealtimeVoiceButton 
            onTranscript={(t) => sendMessage(t)}
            disabled={isLoading}
          />
          <Input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Isabella about modeling, pricing, availability..."
            className="flex-1 bg-soft-white/10 border-soft-white/20 text-soft-white placeholder:text-soft-white/50 focus:border-champagne-gold focus:ring-champagne-gold"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !inputText.trim()}
            className="bg-champagne-gold/80 hover:bg-champagne-gold text-charcoal"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Hidden video element */}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        muted={isMuted}
      />
    </div>
  );
};

export default FullWellnessGeniUI;
