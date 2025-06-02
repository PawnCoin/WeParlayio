import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

// Unified bet interface
export interface UnifiedBet {
  id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  betType: 'moneyline' | 'spread' | 'total' | 'parlay';
  pick: string;
  odds: number;
  point?: number;
  amount?: number;
  potential?: number;
}

// Context type
interface UnifiedBetSlipContextType {
  betSlip: UnifiedBet[];
  parlaySlip: UnifiedBet[];
  addToBetSlip: (bet: Omit<UnifiedBet, 'id'>) => void;
  addToParlay: (bet: Omit<UnifiedBet, 'id'>) => void;
  removeFromBetSlip: (id: string) => void;
  removeFromParlay: (id: string) => void;
  clearBetSlip: () => void;
  clearParlay: () => void;
  placeBet: (amount: string, betType: string) => void;
}

const UnifiedBetSlipContext = createContext<UnifiedBetSlipContextType | undefined>(undefined);

export const UnifiedBetSlipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [betSlip, setBetSlip] = useState<UnifiedBet[]>([]);
  const [parlaySlip, setParlaySlip] = useState<UnifiedBet[]>([]);
  const { toast } = useToast();

  // Sync both slips - when a bet is added to one, it should be available in both
  const addToBetSlip = (bet: Omit<UnifiedBet, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newBet = { ...bet, id };
    
    setBetSlip(prev => [...prev, newBet]);
    
    // If it's a parlay-eligible bet, also add to parlay slip
    if (bet.betType !== 'parlay') {
      setParlaySlip(prev => [...prev, newBet]);
    }
    
    toast({
      title: "Added to Bet Slip",
      description: `${bet.pick} added to your bet slip`,
      variant: "default",
    });
  };

  const addToParlay = (bet: Omit<UnifiedBet, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newBet = { ...bet, id, betType: 'parlay' as const };
    
    setParlaySlip(prev => [...prev, newBet]);
    setBetSlip(prev => [...prev, newBet]);
    
    toast({
      title: "Added to Parlay",
      description: `${bet.pick} added to your parlay slip`,
      variant: "default",
    });
  };

  const removeFromBetSlip = (id: string) => {
    setBetSlip(prev => prev.filter(bet => bet.id !== id));
    setParlaySlip(prev => prev.filter(bet => bet.id !== id));
    
    toast({
      title: "Bet Removed",
      description: "Bet removed from your slip",
      variant: "default",
    });
  };

  const removeFromParlay = (id: string) => {
    setParlaySlip(prev => prev.filter(bet => bet.id !== id));
    setBetSlip(prev => prev.filter(bet => bet.id !== id));
  };

  const clearBetSlip = () => {
    setBetSlip([]);
    setParlaySlip([]);
  };

  const clearParlay = () => {
    setParlaySlip([]);
  };

  const placeBet = (amount: string, betType: string) => {
    const relevantSlip = betType === 'parlay' ? parlaySlip : betSlip;
    
    if (relevantSlip.length === 0 || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please add selections to your bet slip and enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Bet Placed Successfully!",
      description: `Your ${betType} bet of $${amount} has been placed`,
      variant: "default",
    });
    
    setBetSlip([]);
    setParlaySlip([]);
  };

  return (
    <UnifiedBetSlipContext.Provider
      value={{
        betSlip,
        parlaySlip,
        addToBetSlip,
        addToParlay,
        removeFromBetSlip,
        removeFromParlay,
        clearBetSlip,
        clearParlay,
        placeBet,
      }}
    >
      {children}
    </UnifiedBetSlipContext.Provider>
  );
};

export const useUnifiedBetSlip = () => {
  const context = useContext(UnifiedBetSlipContext);
  if (context === undefined) {
    throw new Error('useUnifiedBetSlip must be used within a UnifiedBetSlipProvider');
  }
  return context;
};