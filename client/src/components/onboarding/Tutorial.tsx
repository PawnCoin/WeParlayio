import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Trophy, 
  DollarSign, 
  Users, 
  BarChart,
  Gift
} from 'lucide-react';
import Mascot from './Mascot';
import { Progress } from '@/components/ui/progress';

// Define the tutorial steps
const tutorialSteps = [
  {
    id: 1,
    title: "Welcome to WeParlay!",
    description: "Let's get you started with sports betting. I'm Parlay Pal, and I'll guide you through everything you need to know.",
    emotion: "excited" as const,
    target: "welcome",
    path: "/",
    xp: 10
  },
  {
    id: 2,
    title: "Live Betting",
    description: "Check out our live betting section where you can place bets on games happening right now!",
    emotion: "happy" as const,
    target: "live-betting",
    path: "/live-betting",
    xp: 15
  },
  {
    id: 3,
    title: "Bet Slip",
    description: "Your bet slip shows all your active bets. Click on odds to add bets to your slip!",
    emotion: "default" as const,
    target: "bet-slip",
    path: "/live-betting",
    xp: 20
  },
  {
    id: 4,
    title: "Social Features",
    description: "Connect with friends, share your bets, and see what others are betting on!",
    emotion: "excited" as const,
    target: "social",
    path: "/social",
    xp: 25
  },
  {
    id: 5,
    title: "Your Profile",
    description: "Check your stats, manage your funds, and track your betting history here.",
    emotion: "default" as const,
    target: "profile",
    path: "/",
    xp: 30
  }
];

interface TutorialProps {
  onComplete?: () => void;
  isFirstTime?: boolean;
}

const Tutorial: React.FC<TutorialProps> = ({ 
  onComplete, 
  isFirstTime = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(isFirstTime);
  const [isMinimized, setIsMinimized] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [totalXp, setTotalXp] = useState(100); // Total XP needed for level 1
  const [, setLocation] = useLocation();
  
  const currentStepData = tutorialSteps[currentStep];
  
  // Navigate to the correct page when step changes
  useEffect(() => {
    if (currentStepData && isVisible && !isMinimized) {
      setLocation(currentStepData.path);
    }
  }, [currentStep, isVisible, isMinimized, setLocation]);
  
  // Add XP when completing steps
  useEffect(() => {
    if (currentStep > 0 && currentStep <= tutorialSteps.length) {
      setXpEarned(prev => prev + tutorialSteps[currentStep - 1].xp);
    }
  }, [currentStep]);
  
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleComplete = () => {
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
    
    // Show completion reward
    setTimeout(() => {
      showReward();
    }, 500);
  };
  
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  const showReward = () => {
    // Implement reward logic here
    alert("Congratulations! You've earned 100 XP and unlocked a free $5 bet!");
  };
  
  // Progress calculation
  const progress = Math.min(100, Math.round((currentStep / (tutorialSteps.length - 1)) * 100));
  const xpProgress = Math.min(100, Math.round((xpEarned / totalXp) * 100));
  
  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      {isMinimized ? (
        <motion.div
          className="fixed bottom-4 right-4 z-50"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <Button
            onClick={handleMinimize}
            className="rounded-full w-16 h-16 bg-black text-white shadow-lg hover:bg-gray-800"
          >
            <div className="relative">
              <Mascot size="sm" emotion="happy" />
              <Badge className="absolute -top-2 -right-2 bg-blue-600">
                {tutorialSteps.length - currentStep}
              </Badge>
            </div>
          </Button>
        </motion.div>
      ) : (
        <motion.div
          className="fixed bottom-4 right-4 z-50 w-[350px]"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="border-black shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-black to-gray-800 text-white pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Tutorial {currentStep + 1}/{tutorialSteps.length}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white" onClick={handleMinimize}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white" onClick={() => setIsVisible(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Progress value={progress} className="h-2 mt-2" />
            </CardHeader>
            
            <CardContent className="pt-4 pb-2">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Mascot emotion={currentStepData.emotion} size="md" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{currentStepData.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{currentStepData.description}</p>
                </div>
              </div>
              
              <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-medium">Reward:</span>
                  </div>
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                    +{currentStepData.xp} XP
                  </Badge>
                </div>
                
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>XP Progress</span>
                    <span>{xpEarned}/{totalXp} XP</span>
                  </div>
                  <Progress value={xpProgress} className="h-2" />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-2 pb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={handleNext}
                className="bg-black hover:bg-gray-800 text-white px-3"
              >
                {currentStep < tutorialSteps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  'Complete!'
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Tutorial;