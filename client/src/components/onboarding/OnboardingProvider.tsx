import React, { createContext, useContext, ReactNode } from 'react';
import useOnboarding from '@/hooks/useOnboarding';
import Tutorial from './Tutorial';

// Create context
const OnboardingContext = createContext<ReturnType<typeof useOnboarding> | undefined>(undefined);

// Provider component
export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const onboardingState = useOnboarding();
  const { isFirstTimeUser, hasCompletedTutorial, completeTutorial, markAsReturningUser, addXp } = onboardingState;
  
  // Handle tutorial completion
  const handleTutorialComplete = () => {
    completeTutorial();
    markAsReturningUser();
    addXp(100); // Reward for completing tutorial
  };
  
  return (
    <OnboardingContext.Provider value={onboardingState}>
      {/* Main application */}
      {children}
      
      {/* Tutorial overlay */}
      {isFirstTimeUser && !hasCompletedTutorial && (
        <Tutorial onComplete={handleTutorialComplete} isFirstTime={isFirstTimeUser} />
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