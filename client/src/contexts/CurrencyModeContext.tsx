import React, { createContext, useState, useContext, useEffect } from 'react';

type CurrencyMode = 'real' | 'virtual';

interface CurrencyModeContextType {
  mode: CurrencyMode;
  setMode: (mode: CurrencyMode) => void;
  toggleMode: () => void;
  isVirtual: boolean;
}

const CurrencyModeContext = createContext<CurrencyModeContextType | undefined>(undefined);

export const CurrencyModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check localStorage for saved preference, default to virtual mode for new users
  const [mode, setMode] = useState<CurrencyMode>(() => {
    const savedMode = localStorage.getItem('currencyMode');
    return (savedMode as CurrencyMode) || 'virtual';
  });

  // Update localStorage when mode changes
  useEffect(() => {
    localStorage.setItem('currencyMode', mode);
  }, [mode]);

  // Convenience function to toggle between modes
  const toggleMode = () => {
    setMode(prevMode => prevMode === 'real' ? 'virtual' : 'real');
  };

  // Convenience boolean for check if virtual
  const isVirtual = mode === 'virtual';

  const value = {
    mode,
    setMode,
    toggleMode,
    isVirtual
  };

  return (
    <CurrencyModeContext.Provider value={value}>
      {children}
    </CurrencyModeContext.Provider>
  );
};

// Export as named function to ensure Fast Refresh compatibility
export function useCurrencyMode(): CurrencyModeContextType {
  const context = useContext(CurrencyModeContext);
  
  if (context === undefined) {
    throw new Error('useCurrencyMode must be used within a CurrencyModeProvider');
  }
  
  return context;
}