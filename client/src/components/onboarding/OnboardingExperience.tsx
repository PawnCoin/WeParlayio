import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import BetConfetti from '@/components/betting/BetConfetti';
import { 
  ChevronRight, 
  Star, 
  User, 
  Check, 
  Trophy, 
  Headphones, 
  Facebook,
  Zap
} from 'lucide-react';

interface OnboardingStepProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: React.ReactNode;
}

const OnboardingExperience: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Only show the onboarding to new users or when explicitly requested
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasCompletedOnboarding');
    if (!hasSeenOnboarding) {
      // Delay the appearance to let the page load first
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const completeOnboarding = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setIsComplete(true);
    setShowConfetti(true);
    
    // Show completion toast
    toast({
      title: "Onboarding Complete!",
      description: "You're all set to start your betting journey with WeParlay.",
    });
    
    // Hide the onboarding after animation completes
    setTimeout(() => {
      setShowOnboarding(false);
      setShowConfetti(false);
    }, 3000);
  };
  
  const skipOnboarding = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
    
    // Show toast
    toast({
      title: "Onboarding Skipped",
      description: "You can always access the guide from your profile settings.",
    });
  };
  
  const onboardingSteps: OnboardingStepProps[] = [
    {
      title: "Welcome to WeParlay!",
      description: "Your premium sports betting experience starts here. Let's get you set up in just a few steps.",
      icon: <Trophy className="h-10 w-10 text-blue-500" />,
      action: (
        <Button onClick={() => setCurrentStep(1)} className="mt-4 w-full">
          Let's Get Started <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    {
      title: "Personalize Your Experience",
      description: "Select your favorite sports and teams to get personalized recommendations and odds.",
      icon: <User className="h-10 w-10 text-blue-500" />,
      action: (
        <Button onClick={() => setCurrentStep(2)} className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
          Set My Preferences <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    {
      title: "Voice Betting",
      description: "Try our innovative voice betting feature to place bets hands-free. Just tap the mic button and say your bet!",
      icon: <Headphones className="h-10 w-10 text-blue-500" />,
      action: (
        <Button onClick={() => setCurrentStep(3)} className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
          Try Voice Betting <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    {
      title: "Connect Social Accounts",
      description: "Link your social media accounts to share bets, invite friends, and earn referral bonuses.",
      icon: <Facebook className="h-10 w-10 text-blue-500" />,
      action: (
        <Button onClick={() => setCurrentStep(4)} className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
          Connect Accounts <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    {
      title: "Explore VIP Benefits",
      description: "Upgrade to VIP for enhanced odds, unlimited voice betting, and exclusive features.",
      icon: <Star className="h-10 w-10 text-amber-500" />,
      action: (
        <Button onClick={() => completeOnboarding()} className="mt-4 w-full bg-amber-600 hover:bg-amber-700">
          Complete Setup <Check className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  ];
  
  if (!showOnboarding) return null;
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          // Close when clicking backdrop
          if (e.target === e.currentTarget) {
            skipOnboarding();
          }
        }}
      >
        {showConfetti && <BetConfetti />}
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="border-blue-200 dark:border-blue-900 shadow-xl">
            <CardHeader className="pb-4 relative">
              <button 
                onClick={skipOnboarding} 
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex items-center mb-2">
                {onboardingSteps[currentStep].icon}
                <CardTitle className="ml-3">{onboardingSteps[currentStep].title}</CardTitle>
              </div>
              
              <Progress value={((currentStep + 1) / onboardingSteps.length) * 100} className="h-1" />
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Step {currentStep + 1} of {onboardingSteps.length}
              </p>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                {onboardingSteps[currentStep].description}
              </p>
              
              {/* Step-specific content */}
              {currentStep === 1 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {['NFL', 'NBA', 'MLB', 'NHL', 'UFC', 'Boxing'].map((sport) => (
                    <Button 
                      key={sport} 
                      variant="outline" 
                      className="border-blue-200 hover:border-blue-500 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
                    >
                      {sport}
                    </Button>
                  ))}
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="mt-4 relative bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center">
                  <div className="mr-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Voice Betting Demo</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Say "Bet $50 on Lakers to win" to place a quick bet
                    </p>
                  </div>
                  <div className="absolute right-0 top-0 h-full flex items-center pr-4">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                      <Headphones className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="mt-4 space-y-2">
                  {['Facebook', 'Twitter', 'Instagram'].map((platform) => (
                    <div 
                      key={platform} 
                      className="flex items-center justify-between p-3 border rounded-lg border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                          <Facebook className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span>{platform}</span>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                  ))}
                </div>
              )}
              
              {currentStep === 4 && (
                <div className="mt-4 p-4 border rounded-lg border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20">
                  <div className="flex items-start">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full mr-3">
                      <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-900 dark:text-amber-200">VIP Membership Benefits</h4>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          Enhanced odds boost up to 7.5%
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          Unlimited voice betting commands
                        </li>
                        <li className="flex items-center">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          Facebook integrations
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
              {currentStep > 0 ? (
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={skipOnboarding}
                >
                  Skip Tour
                </Button>
              )}
              
              {onboardingSteps[currentStep].action}
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingExperience;