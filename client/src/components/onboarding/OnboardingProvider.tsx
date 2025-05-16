import React, { createContext, useState, useContext, useEffect } from 'react';
import TourGuide from './TourGuide';

interface OnboardingContextType {
  showTour: boolean;
  startTour: () => void;
  endTour: () => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
  showTour: false,
  startTour: () => {},
  endTour: () => {},
});

export const useOnboarding = () => useContext(OnboardingContext);

interface OnboardingProviderProps {
  children: React.ReactNode;
}

const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [showTour, setShowTour] = useState(false);

  // Check if it's the first visit
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('weparlay_onboarding_completed');
    if (!hasCompletedOnboarding) {
      // Wait a moment before showing the tour
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => {
    setShowTour(true);
  };

  const endTour = () => {
    setShowTour(false);
    localStorage.setItem('weparlay_onboarding_completed', 'true');
  };

  return (
    <OnboardingContext.Provider value={{ showTour, startTour, endTour }}>
      {children}
      <TourGuide />
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;