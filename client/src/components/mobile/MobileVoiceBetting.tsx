import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { Button } from "@/components/ui/button";
import BetConfetti from "@/components/betting/BetConfetti";
import {
  Mic, MicOff, Volume2, VolumeX
} from "lucide-react";

interface MobileVoiceBettingProps {
  onBetPlaced?: () => void;
}

const MobileVoiceBetting: React.FC<MobileVoiceBettingProps> = ({ onBetPlaced }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTextToSpeechEnabled, setIsTextToSpeechEnabled] = useState(true);
  const { toast } = useToast();
  const { addBet } = useBetSlip();

  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
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

        if (!result.isFinal) return;
        processVoiceCommand(transcriptText);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setFeedbackMessage(`Error: ${event.error}. Please try again.`);
        stopListening();
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setFeedbackMessage("Your browser doesn't support voice recognition. Please try another browser.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const speakFeedback = (text: string) => {
    if (!isTextToSpeechEnabled) return;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 1;
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    setTranscript("");
    setFeedbackMessage("Listening... Say your bet.");
    setIsListening(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        startAnimation();
      } catch (err) {
        console.error("Error starting voice recognition:", err);
        setFeedbackMessage("Could not start voice recognition. Please try again.");
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
    stopAnimation();
  };

  const startAnimation = () => {
    let startTime: number | null = null;
    const duration = 10000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setAnimationProgress(progress);

      if (progress < 1 && isListening) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        stopListening();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setAnimationProgress(0);
  };

  const processVoiceCommand = (command: string) => {
    const lowercaseCommand = command.toLowerCase();
    console.log("Processing voice command:", lowercaseCommand);

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

    const amountMatch = lowercaseCommand.match(/\$?([0-9]+)/);
    const betAmount = amountMatch ? parseInt(amountMatch[1]) : 20;

    let betType = "moneyline";
    if (lowercaseCommand.includes("spread") || lowercaseCommand.includes("point")) {
      betType = "spread";
    } else if (lowercaseCommand.includes("over") || lowercaseCommand.includes("under") || lowercaseCommand.includes("total")) {
      betType = "total";
    }

    if (detectedTeam) {
      const betInfo = {
        team: detectedTeam,
        amount: betAmount,
        type: betType,
        odds: -110,
      };

      const feedbackText = `Adding $${betInfo.amount} ${betInfo.type} bet on ${betInfo.team}.`;
      setFeedbackMessage(feedbackText);
      speakFeedback(feedbackText);

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

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      toast({
        title: "Bet Added Successfully! 🎉",
        description: `$${betInfo.amount} on ${betInfo.team} (${betInfo.type}) has been added to your bet slip.`,
      });

      if (onBetPlaced) {
        onBetPlaced();
      }
    } else {
      const errorMessage = "I didn't catch a team name. Please try again.";
      setFeedbackMessage(errorMessage);
      speakFeedback(errorMessage);

      toast({
        title: "Couldn't Process Bet",
        description: "Please specify a team name clearly in your command.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start">
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg flex items-center justify-center"
        >
          <Mic className="h-6 w-6" />
        </Button>

        {isListening && (
          <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-75"></span>
        )}
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 mb-4 w-full max-w-sm"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {showConfetti && <BetConfetti />}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Voice Betting</h3>
                <div className="flex space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setIsTextToSpeechEnabled(!isTextToSpeechEnabled)}
                  >
                    {isTextToSpeechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setIsExpanded(false)}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <button
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                    isListening
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  onClick={isListening ? stopListening : startListening}
                >
                  {isListening ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
                </button>

                {isListening && (
                  <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${animationProgress * 100}%` }}
                    />
                  </div>
                )}

                <div className="mt-3 text-center">
                  {transcript ? (
                    <p className="font-medium">{transcript}</p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      {feedbackMessage || "Tap the mic and speak your bet"}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Example commands:</p>
                <div className="space-y-1 text-xs">
                  <p className="bg-gray-100 dark:bg-gray-700 py-1 px-2 rounded">"Bet $50 on Lakers to win"</p>
                  <p className="bg-gray-100 dark:bg-gray-700 py-1 px-2 rounded">"$100 on Chiefs spread"</p>
                  <p className="bg-gray-100 dark:bg-gray-700 py-1 px-2 rounded">"Put $25 on Yankees under"</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileVoiceBetting;