import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useBetSlip } from "@/contexts/BetSlipContext";
import BetConfetti from "@/components/betting/BetConfetti";
import { Mic, MicOff, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceActivatedBettingProps {
  onBetPlaced?: () => void;
}

const VoiceActivatedBetting: React.FC<VoiceActivatedBettingProps> = ({ onBetPlaced }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(20).fill(0));
  const { toast } = useToast();
  const { addBet } = useBetSlip();
  
  const recognitionRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Initialize Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0];
        const transcriptText = result[0].transcript;
        setTranscript(transcriptText);
        setConfidence(result[0].confidence * 100);
        
        // Process the voice command
        processVoiceCommand(transcriptText);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive"
        });
        stopListening();
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition. Please try another browser.",
        variant: "destructive"
      });
    }
    
    return () => {
      stopVisualization();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);
  
  const startListening = async () => {
    setTranscript("");
    setConfidence(0);
    setIsListening(true);
    
    try {
      if (recognitionRef.current) {
        // Start audio visualization
        await startVisualization();
        recognitionRef.current.start();
        
        toast({
          title: "Listening for Bet Commands",
          description: "Try saying: 'Bet $50 on Lakers to win' or 'Place $25 on Chiefs spread'",
        });
      }
    } catch (err) {
      console.error("Error starting voice recognition:", err);
      toast({
        title: "Voice Recognition Error",
        description: "Could not start voice recognition. Please try again.",
        variant: "destructive"
      });
      setIsListening(false);
    }
  };
  
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
    stopVisualization();
  };
  
  const startVisualization = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      source.connect(analyserRef.current);
      
      const updateVisualizer = () => {
        if (!analyserRef.current || !isListening) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Convert the data to a smaller array for visualization
        const scaledData = Array.from({ length: 20 }, (_, i) => {
          const index = Math.floor(i * dataArray.length / 20);
          return dataArray[index] / 255; // Normalize to 0-1
        });
        
        setVisualizerData(scaledData);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      
      updateVisualizer();
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };
  
  const stopVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setVisualizerData(Array(20).fill(0));
    
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.suspend();
    }
  };
  
  const processVoiceCommand = (command: string) => {
    // Convert to lowercase for easier matching
    const lowercaseCommand = command.toLowerCase();
    
    // Extract team name (this is a simple version, could be enhanced with a more robust solution)
    const teams = [
      "lakers", "celtics", "warriors", "bulls", "heat", 
      "chiefs", "eagles", "49ers", "cowboys", "packers",
      "yankees", "dodgers", "red sox", "cubs", "mets"
    ];
    
    let detectedTeam = "";
    for (const team of teams) {
      if (lowercaseCommand.includes(team)) {
        detectedTeam = team;
        break;
      }
    }
    
    // Extract bet amount
    const amountMatch = lowercaseCommand.match(/\\$([0-9]+)/);
    const betAmount = amountMatch ? parseInt(amountMatch[1]) : 20; // Default to $20 if not specified
    
    // Detect bet type
    let betType = "moneyline"; // Default
    if (lowercaseCommand.includes("spread") || lowercaseCommand.includes("point")) {
      betType = "spread";
    } else if (lowercaseCommand.includes("over") || lowercaseCommand.includes("under") || lowercaseCommand.includes("total")) {
      betType = "total";
    }
    
    if (detectedTeam) {
      // Process the bet
      const betInfo = {
        team: detectedTeam,
        amount: betAmount,
        type: betType,
        odds: -110, // Default odds
        eventId: 1, // Would come from actual event data in a real implementation
      };
      
      // Add bet to slip
      if (typeof addBet === 'function') {
        addBet({
          id: Date.now().toString(),
          teamName: betInfo.team,
          betType: betInfo.type,
          odds: betInfo.odds,
          wager: betInfo.amount,
          potentialWin: (betInfo.amount * (betInfo.odds > 0 ? betInfo.odds / 100 : 100 / Math.abs(betInfo.odds))),
        });
      }
      
      // Trigger confetti effect
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      // Show success toast with bet details
      toast({
        title: "Bet Added Successfully! 🎉",
        description: `$${betInfo.amount} on ${betInfo.team} (${betInfo.type}) has been added to your bet slip.`,
      });
      
      // Invoke callback if provided
      if (onBetPlaced) {
        onBetPlaced();
      }
    } else {
      // No team detected
      toast({
        title: "Couldn't Process Bet",
        description: "Please specify a team name clearly in your command.",
        variant: "destructive"
      });
    }
    
    // Stop listening after processing
    setTimeout(stopListening, 1000);
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full p-4">
      {showConfetti && <BetConfetti />}
      
      <div className="relative w-full max-w-lg py-6">
        <div className="mb-6 flex justify-center">
          <Button
            onClick={isListening ? stopListening : startListening}
            className={`rounded-full w-16 h-16 flex items-center justify-center transition-colors ${
              isListening 
                ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </Button>
        </div>
        
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 text-center"
            >
              <div className="flex justify-center space-x-1 h-8 items-end mb-3">
                {visualizerData.map((level, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-primary rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, level * 32)}px` }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {transcript || "Speak now..."}
              </p>
              {confidence > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 dark:bg-gray-700">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full" 
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="text-center space-y-2">
          <h3 className="font-medium flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Voice-Activated Betting
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click the mic and say something like:<br />
            "Bet $50 on Lakers to win" or "Place $25 on Chiefs spread"
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceActivatedBetting;