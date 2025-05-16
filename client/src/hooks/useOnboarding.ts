import { useState, useEffect } from 'react';

interface OnboardingState {
  isFirstTimeUser: boolean;
  hasCompletedTutorial: boolean;
  currentLevel: number;
  xp: number;
  xpForNextLevel: number;
  achievements: string[];
}

const STORAGE_KEY = 'weparlay_onboarding';

export function useOnboarding() {
  // Default initial state
  const defaultState: OnboardingState = {
    isFirstTimeUser: true,
    hasCompletedTutorial: false,
    currentLevel: 0,
    xp: 0,
    xpForNextLevel: 100,
    achievements: []
  };
  
  // Load state from localStorage or use default
  const [state, setState] = useState<OnboardingState>(() => {
    if (typeof window === 'undefined') return defaultState;
    
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : defaultState;
  });
  
  // Save to localStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);
  
  // Mark user as having completed the tutorial
  const completeTutorial = () => {
    setState(prev => ({ 
      ...prev, 
      hasCompletedTutorial: true 
    }));
  };
  
  // Mark user as no longer a first-time user
  const markAsReturningUser = () => {
    setState(prev => ({ 
      ...prev, 
      isFirstTimeUser: false 
    }));
  };
  
  // Add XP and level up if necessary
  const addXp = (amount: number) => {
    setState(prev => {
      const newXp = prev.xp + amount;
      const xpNeeded = prev.xpForNextLevel;
      
      // Check if user should level up
      if (newXp >= xpNeeded) {
        const newLevel = prev.currentLevel + 1;
        const remainingXp = newXp - xpNeeded;
        const nextLevelXp = Math.round(xpNeeded * 1.5); // Increase XP needed by 50% each level
        
        return {
          ...prev,
          currentLevel: newLevel,
          xp: remainingXp,
          xpForNextLevel: nextLevelXp
        };
      }
      
      // Just add XP without leveling up
      return {
        ...prev,
        xp: newXp
      };
    });
  };
  
  // Add an achievement
  const addAchievement = (achievement: string) => {
    setState(prev => {
      if (prev.achievements.includes(achievement)) {
        return prev; // Don't add duplicates
      }
      
      return {
        ...prev,
        achievements: [...prev.achievements, achievement]
      };
    });
  };
  
  // Reset onboarding state (mainly for testing)
  const resetOnboarding = () => {
    setState(defaultState);
  };
  
  return {
    ...state,
    completeTutorial,
    markAsReturningUser,
    addXp,
    addAchievement,
    resetOnboarding
  };
}

export default useOnboarding;