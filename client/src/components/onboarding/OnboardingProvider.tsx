import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import useOnboarding from '@/hooks/useOnboarding';
import Tutorial from './Tutorial';
import ProgressIndicator from './ProgressIndicator';
import MascotTip from './MascotTip';

// Create context
const OnboardingContext = createContext<ReturnType<typeof useOnboarding> | undefined>(undefined);

// Provider component
export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const onboardingState = useOnboarding();
  const { 
    isFirstTimeUser, 
    hasCompletedTutorial, 
    completeTutorial, 
    markAsReturningUser, 
    addXp,
    addAchievement,
    currentLevel 
  } = onboardingState;
  
  const [activeTip, setActiveTip] = useState<{
    message: string;
    type: 'tip' | 'achievement' | 'reward';
    xpReward: number;
  } | null>(null);
  
  // Handle tutorial completion
  const handleTutorialComplete = () => {
    completeTutorial();
    markAsReturningUser();
    addXp(100); // Reward for completing tutorial
    addAchievement('Tutorial Completed');
    
    // Show a reward message after completing the tutorial
    setActiveTip({
      message: "You've completed the tutorial and earned 100 XP!",
      type: 'reward',
      xpReward: 0 // Already added XP above
    });
  };
  
  // Show welcome message after mounting (if not first time user)
  useEffect(() => {
    if (!isFirstTimeUser && hasCompletedTutorial) {
      const timer = setTimeout(() => {
        setActiveTip({
          message: `Welcome back to WeParlay! You're currently at Level ${currentLevel}.`,
          type: 'tip',
          xpReward: 5
        });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isFirstTimeUser, hasCompletedTutorial, currentLevel]);
  
  // Handle tip dismissal
  const handleTipDismiss = () => {
    setActiveTip(null);
  };
  
  return (
    <OnboardingContext.Provider value={onboardingState}>
      {/* Main application */}
      {children}
      
      {/* Tutorial overlay */}
      {isFirstTimeUser && !hasCompletedTutorial && (
        <Tutorial onComplete={handleTutorialComplete} isFirstTime={isFirstTimeUser} />
      )}
      
      {/* Progress indicator - only show if user has completed tutorial */}
      {hasCompletedTutorial && <ProgressIndicator />}
      
      {/* Mascot tip - conditionally shown */}
      {activeTip && (
        <MascotTip
          message={activeTip.message}
          type={activeTip.type}
          xpReward={activeTip.xpReward}
          duration={7000}
          onDismiss={handleTipDismiss}
          position="bottom-right"
        />
      )}
    </OnboardingContext.Provider>
  );
};

// Hook for using the onboarding context
export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return context;
};

export default OnboardingProvider;