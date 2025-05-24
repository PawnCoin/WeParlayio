import React, { createContext, useContext, useState, useEffect } from 'react';

interface OnboardingData {
  personalInfo: {
    displayName: string;
    favoriteTeams: string[];
    experience: string;
    interests: string[];
  };
  preferences: {
    betTypes: string[];
    sports: string[];
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      profileVisible: boolean;
      shareWins: boolean;
    };
  };
  account: {
    depositMethod: string;
    initialDeposit: number;
    twoFactorAuth: boolean;
  };
}

interface OnboardingContextType {
  showOnboarding: boolean;
  onboardingData: OnboardingData | null;
  isNewUser: boolean;
  completeOnboarding: (data: OnboardingData) => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem('weparlay-onboarding-completed');
    const userData = localStorage.getItem('weparlay-onboarding-data');
    
    if (completed === 'true' && userData) {
      setOnboardingData(JSON.parse(userData));
      setShowOnboarding(false);
    } else {
      // Check if this is a new user (no previous login data)
      const hasAccount = localStorage.getItem('weparlay-user-data') || 
                        localStorage.getItem('currentUser') ||
                        localStorage.getItem('weparlay-demo-user');
      
      if (!hasAccount) {
        setIsNewUser(true);
        setShowOnboarding(true);
      }
    }
  }, []);

  const completeOnboarding = async (data: OnboardingData) => {
    try {
      // Save onboarding data locally
      localStorage.setItem('weparlay-onboarding-completed', 'true');
      localStorage.setItem('weparlay-onboarding-data', JSON.stringify(data));
      
      // Apply user preferences to the platform
      if (data.preferences.notifications.email) {
        localStorage.setItem('weparlay-email-notifications', 'enabled');
      }
      
      if (data.preferences.notifications.sms) {
        localStorage.setItem('weparlay-sms-notifications', 'enabled');
      }
      
      // Save user preferences for future use
      const userPreferences = {
        sports: data.preferences.sports,
        betTypes: data.preferences.betTypes,
        favoriteTeams: data.personalInfo.favoriteTeams,
        experience: data.personalInfo.experience,
        interests: data.personalInfo.interests
      };
      
      localStorage.setItem('weparlay-user-preferences', JSON.stringify(userPreferences));
      
      setOnboardingData(data);
      setShowOnboarding(false);
      setIsNewUser(false);
      
      // Send onboarding data to server if user is logged in
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        try {
          await fetch('/api/user/onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
        } catch (error) {
          console.log('Could not save onboarding data to server:', error);
        }
      }
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem('weparlay-onboarding-skipped', 'true');
    setShowOnboarding(false);
    setIsNewUser(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('weparlay-onboarding-completed');
    localStorage.removeItem('weparlay-onboarding-data');
    localStorage.removeItem('weparlay-onboarding-skipped');
    localStorage.removeItem('weparlay-user-preferences');
    setOnboardingData(null);
    setShowOnboarding(true);
    setIsNewUser(true);
  };

  return (
    <OnboardingContext.Provider value={{
      showOnboarding,
      onboardingData,
      isNewUser,
      completeOnboarding,
      skipOnboarding,
      resetOnboarding
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}