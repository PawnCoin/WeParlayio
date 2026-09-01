import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lightbulb, User, DollarSign, Trophy, History } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const SimpleOnboarding: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Updated tour steps for current WeParlay platform
  const steps: TourStep[] = [
    {
      title: "Welcome to WeParlay! 🎉",
      description: "Your premier destination for sports betting with live odds, VIP features, and social betting challenges. Let's show you around!",
      icon: <Lightbulb className="h-8 w-8 text-yellow-400" />
    },
    {
      title: "Explore Sports & Odds",
      description: "Navigate to 'Sports' or 'Betting Hub' in the sidebar to see live odds for NFL, NBA, MLB, NHL and more. All odds update in real-time!",
      icon: <DollarSign className="h-8 w-8 text-green-500" />
    },
    {
      title: "Place Your Bets",
      description: "Click any spread, moneyline, or total to add it to the one universal slip. Verified new accounts receive 10,000 WeParlay Cash.",
      icon: <Trophy className="h-8 w-8 text-purple-500" />
    },
    {
      title: "VIP Features & Live Streaming",
      description: "Access VIP live streaming with 296+ sports channels, exclusive tournaments, and advanced analytics. Upgrade your tier for premium features!",
      icon: <User className="h-8 w-8 text-blue-500" />
    },
    {
      title: "Track Everything",
      description: "Monitor your bets in 'My Bets', check your balance, and join head-to-head challenges with other users. Good luck!",
      icon: <History className="h-8 w-8 text-orange-500" />
    }
  ];

  // Start tour automatically on first visit
  useEffect(() => {
    const hasTakenTour = localStorage.getItem('weparlay_simple_tour_completed');
    if (!hasTakenTour) {
      setTimeout(() => {
        setOpen(true);
      }, 1500);
    }
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    setOpen(false);
    localStorage.setItem('weparlay_simple_tour_completed', 'true');
    
    // Reset for the next time
    setTimeout(() => {
      setCurrentStep(0);
    }, 500);
  };

  const restartTour = () => {
    localStorage.removeItem('weparlay_simple_tour_completed');
    setCurrentStep(0);
    setOpen(true);
  };

  return (
    <>
      {/* Tour Guide Button - Positioned left of other buttons */}
      <motion.div 
        className="fixed bottom-4 right-20 z-50"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 3 }}
      >
        <Button 
          onClick={restartTour} 
          className="bg-blue-600 hover:bg-blue-700 rounded-full h-12 w-12 p-0 shadow-lg"
          title="Take Platform Tour"
        >
          <Lightbulb className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Tour Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {steps[currentStep].icon}
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {steps[currentStep].title}
              </motion.span>
            </AnimatePresence>
          </DialogTitle>
          
          <DialogDescription>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="block min-h-[80px]"
              >
                {steps[currentStep].description}
              </motion.span>
            </AnimatePresence>
          </DialogDescription>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
              )}
              {currentStep === 0 && (
                <Button variant="outline" onClick={completeTour}>
                  Skip Tour
                </Button>
              )}
            </div>
            
            <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Get Started!"
              )}
            </Button>
          </DialogFooter>
          
          {/* Tour progress indicator */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-1.5 rounded-full ${index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'}`}
                  initial={{ width: index === currentStep ? 12 : 6 }}
                  animate={{ width: index === currentStep ? 20 : 8 }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SimpleOnboarding;
