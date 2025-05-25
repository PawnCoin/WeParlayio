import React, { createContext, useContext, useState, useEffect } from 'react';

interface BetItem {
  id: string;
  type: string;
  eventName: string;
  selection: string;
  opponent: string;
  odds: number;
  timestamp?: string;
  status?: 'pending' | 'won' | 'lost' | 'cashout';
}

interface BettingContextType {
  betItems: BetItem[];
  addBet: (bet: BetItem) => void;
  removeBet: (id: string) => void;
  clearBets: () => void;
  updateBet: (id: string, updates: Partial<BetItem>) => void;
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
}

const BettingContext = createContext<BettingContextType | undefined>(undefined);

export const useBetting = () => {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
};

export const BettingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [betItems, setBetItems] = useState<BetItem[]>(() => {
    // Load from localStorage on initialization
    try {
      const savedBets = localStorage.getItem('weparlay_betting_slip');
      return savedBets ? JSON.parse(savedBets) : [];
    } catch {
      return [];
    }
  });

  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    // Default to WeParlay Cash for safer practice
    try {
      const savedCurrency = localStorage.getItem('weparlay_selected_currency');
      return savedCurrency || 'WEPARLAY';
    } catch {
      return 'WEPARLAY';
    }
  });

  // Save to localStorage whenever betItems changes
  useEffect(() => {
    try {
      localStorage.setItem('weparlay_betting_slip', JSON.stringify(betItems));
    } catch (error) {
      console.error('Failed to save betting slip to localStorage:', error);
    }
  }, [betItems]);

  const addBet = (bet: BetItem) => {
    setBetItems(prev => {
      // Check if bet already exists
      const existingBetIndex = prev.findIndex(item => item.id === bet.id);
      if (existingBetIndex !== -1) {
        // Update existing bet
        const updated = [...prev];
        updated[existingBetIndex] = { ...updated[existingBetIndex], ...bet };
        return updated;
      }
      // Add new bet
      return [...prev, { ...bet, timestamp: new Date().toISOString() }];
    });
  };

  const removeBet = (id: string) => {
    setBetItems(prev => prev.filter(item => item.id !== id));
  };

  const clearBets = () => {
    setBetItems([]);
  };

  const updateBet = (id: string, updates: Partial<BetItem>) => {
    setBetItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  // Save currency selection to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('weparlay_selected_currency', selectedCurrency);
    } catch (error) {
      console.error('Failed to save currency selection:', error);
    }
  }, [selectedCurrency]);

  return (
    <BettingContext.Provider value={{
      betItems,
      addBet,
      removeBet,
      clearBets,
      updateBet,
      selectedCurrency,
      setSelectedCurrency
    }}>
      {children}
    </BettingContext.Provider>
  );
};