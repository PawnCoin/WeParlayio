import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type CurrencyMode = 'real' | 'virtual';

interface CurrencyModeContextType {
  mode: CurrencyMode;
  setMode: (mode: CurrencyMode) => void;
  toggleMode: () => void;
  isVirtual: boolean;
}

const CurrencyModeContext = createContext<CurrencyModeContextType | undefined>(undefined);

export const CurrencyModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  // Default to virtual currency for safety
  const [mode, setMode] = useState<CurrencyMode>('virtual');
  
  // Load saved preference from localStorage on initial render
  useEffect(() => {
    const savedMode = localStorage.getItem('weparlay-currency-mode');
    if (savedMode === 'real' || savedMode === 'virtual') {
      setMode(savedMode);
    }
  }, []);
  
  // Save preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('weparlay-currency-mode', mode);
  }, [mode]);
  
  const toggleMode = () => {
    const newMode = mode === 'real' ? 'virtual' : 'real';
    setMode(newMode);
    
    // Show toast notification
    toast({
      title: newMode === 'virtual' ? "Virtual Mode Enabled" : "Real Money Mode Enabled",
      description: newMode === 'virtual' 
        ? "Now betting with WeParlay Cash. Have fun!" 
        : "Now betting with real money and crypto. Bet responsibly!",
      variant: newMode === 'virtual' ? "default" : "destructive",
    });
  };
  
  const value = {
    mode,
    setMode,
    toggleMode,
    isVirtual: mode === 'virtual'
  };
  
  return (
    <CurrencyModeContext.Provider value={value}>
      {children}
    </CurrencyModeContext.Provider>
  );
};

export const useCurrencyMode = (): CurrencyModeContextType => {
  const context = useContext(CurrencyModeContext);
  if (context === undefined) {
    throw new Error('useCurrencyMode must be used within a CurrencyModeProvider');
  }
  return context;
};