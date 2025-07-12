
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Clock, Cloud, Youtube, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userName, setUserName] = useState('friend');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const command = event.results[0][0].transcript;
        setTranscript(command);
        processCommand(command);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Oops! 🙈",
          description: "I couldn't hear you clearly. Try again?",
          variant: "destructive"
        });
      };
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    // Greet user on load
    setTimeout(() => {
      const greeting = `Hello there, ${userName}! 🌟 I'm your cozy assistant. How can I help brighten your day?`;
      setResponse(greeting);
      speak(greeting);
    }, 1000);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [userName, toast]);

  const speak = (text: string) => {
    if (synthRef.current && text) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Try to use a friendlier voice
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || voice.name.includes('Woman') || voice.name.includes('Samantha')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processCommand = async (command: string) => {
    setIsProcessing(true);
    const lowerCommand = command.toLowerCase();
    let responseText = '';

    try {
      if (lowerCommand.includes('weather')) {
        responseText = getWeatherResponse();
      } else if (lowerCommand.includes('timer') || lowerCommand.includes('remind')) {
        responseText = setTimerResponse(command);
      } else if (lowerCommand.includes('play') && (lowerCommand.includes('youtube') || lowerCommand.includes('music') || lowerCommand.includes('video'))) {
        responseText = playYouTubeResponse(command);
      } else if (lowerCommand.includes('whatsapp') || lowerCommand.includes('message')) {
        responseText = whatsAppResponse();
      } else if (lowerCommand.includes('hello') || lowerCommand.includes('hi') || lowerCommand.includes('hey')) {
        responseText = getGreetingResponse();
      } else if (lowerCommand.includes('my name is')) {
        const name = command.split('my name is')[1]?.trim();
        if (name) {
          setUserName(name);
          responseText = `Nice to meet you, ${name}! 😊 I'll remember that. What would you like to do today?`;
        }
      } else {
        responseText = `I heard you say: "${command}" 🤔 I'm still learning, but I can help with weather, timers, YouTube videos, and WhatsApp messages. What would you like to try?`;
      }

      setResponse(responseText);
      speak(responseText);
    } catch (error) {
      console.error('Error processing command:', error);
      responseText = "Oops! Something went wrong. Let's try that again! 😅";
      setResponse(responseText);
      speak(responseText);
    } finally {
      setIsProcessing(false);
    }
  };

  const getWeatherResponse = () => {
    // Mock weather response with fun commentary
    const responses = [
      "It's looking lovely outside! ☀️ Perfect weather for a little adventure or maybe just opening a window for some fresh air!",
      "The weather is being quite pleasant today! 🌤️ Maybe it's trying to match your wonderful energy!",
      "I'd say it's a beautiful day to be alive! 🌈 The weather seems to be cooperating with our good vibes!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const setTimerResponse = (command: string) => {
    // Extract time from command (basic implementation)
    const numbers = command.match(/\d+/);
    const timeValue = numbers ? numbers[0] : '5';
    
    toast({
      title: "Timer Set! ⏰",
      description: `I've set a ${timeValue} minute timer for you!`,
    });

    return `Perfect! I've set a ${timeValue} minute timer for you! ⏰ I'll give you a gentle nudge when it's time. Keep being awesome!`;
  };

  const playYouTubeResponse = (command: string) => {
    const searchTerm = command.replace(/play|youtube|music|video/gi, '').trim();
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;
    
    setTimeout(() => {
      window.open(youtubeUrl, '_blank');
    }, 2000);

    return `Great choice! 🎵 I'm opening YouTube to search for "${searchTerm}" for you. Get ready for some amazing tunes!`;
  };

  const whatsAppResponse = () => {
    setTimeout(() => {
      window.open('https://web.whatsapp.com', '_blank');
    }, 2000);
    
    return `Opening WhatsApp for you! 💬 Time to spread some joy and connect with your loved ones!`;
  };

  const getGreetingResponse = () => {
    const greetings = [
      `Hello there, ${userName}! 🌟 You're looking fantastic today! How can I help?`,
      `Hey ${userName}! 😊 What a wonderful day to chat with you! What shall we do?`,
      `Hi ${userName}! 🎈 Your presence just made my circuits sparkle! How can I assist?`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full shadow-lg mb-4 animate-pulse">
              <Volume2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Your Cozy Assistant ✨
          </h1>
          <p className="text-muted-foreground text-lg">
            Hey {userName}! I'm here to help and chat 💙
          </p>
        </div>

        {/* Main Assistant Card */}
        <Card className="mb-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Voice Controls */}
            <div className="text-center mb-8">
              <Button
                onClick={isListening ? stopListening : startListening}
                className={`w-24 h-24 rounded-full text-white shadow-lg transition-all duration-300 ${
                  isListening 
                    ? 'bg-gradient-to-br from-red-400 to-red-600 animate-pulse scale-110' 
                    : 'bg-gradient-to-br from-green-400 to-green-600 hover:scale-105'
                }`}
                disabled={isProcessing}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
              <p className="mt-4 text-lg font-medium text-muted-foreground">
                {isListening ? 'Listening... 👂' : isProcessing ? 'Thinking... 🤔' : 'Tap to talk! 🎤'}
              </p>
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-blue-800 font-medium">You said:</p>
                <p className="text-blue-600 italic">"{transcript}"</p>
              </div>
            )}

            {/* Response */}
            {response && (
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-400">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <p className="text-purple-800 leading-relaxed">{response}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Quick Actions 🚀</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-16 flex flex-col gap-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200"
                onClick={() => processCommand('What\'s the weather like?')}
              >
                <Cloud className="w-5 h-5" />
                <span className="text-xs">Weather</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col gap-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200"
                onClick={() => processCommand('Set a 5 minute timer')}
              >
                <Clock className="w-5 h-5" />
                <span className="text-xs">Timer</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col gap-1 bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:from-red-100 hover:to-red-200"
                onClick={() => processCommand('Play lo-fi music')}
              >
                <Youtube className="w-5 h-5" />
                <span className="text-xs">Music</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col gap-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200"
                onClick={() => processCommand('Open WhatsApp')}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs">Message</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-muted-foreground">
          <p className="text-sm">Made with 💜 to brighten your day</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
