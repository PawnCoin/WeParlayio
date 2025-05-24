import React, { createContext, useContext, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

// Define the bet structure
export interface Bet {
  id: string;
  eventId?: string;
  gameTitle?: string;
  pick?: string;
  homeTeam?: string;
  awayTeam?: string;
  selection?: string;
  odds: number;
  betType: string;
  point?: number;
  sportId?: number;
  sport?: string;
  amount?: number;
  potential?: number;
}

// Define a saved bet slip structure
export interface SavedBetSlip {
  id: string;
  name: string;
  bets: Bet[];
  createdAt: Date;
}

// Define the context type
interface BetSlipContextType {
  betSlip: Bet[];
  bets: Bet[];
  savedBetSlips: SavedBetSlip[];
  addToBetSlip: (bet: Omit<Bet, 'id'>) => void;
  addBet: (bet: Bet) => void;
  removeFromBetSlip: (id: string) => void;
  clearBetSlip: () => void;
  saveBetSlip: (name: string) => void;
  loadSavedBetSlip: (id: string) => void;
  deleteSavedBetSlip: (id: string) => void;
  shareBetSlip: () => void;
  placeBet: (amount: string, betType: string, boostEnabled: boolean) => void;
}

// Create the context
const BetSlipContext = createContext<BetSlipContextType | undefined>(undefined);

// Create provider component
export const BetSlipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [betSlip, setBetSlip] = useState<Bet[]>([]);
  const [savedBetSlips, setSavedBetSlips] = useState<SavedBetSlip[]>([]);
  const { toast } = useToast();

  // Add a bet to the slip (original method)
  const addToBetSlip = (bet: Omit<Bet, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newBet = { ...bet, id };
    
    // Check if the bet already exists
    const existingBet = betSlip.find(b => 
      b.homeTeam === bet.homeTeam && 
      b.awayTeam === bet.awayTeam && 
      b.pick === bet.pick
    );
    
    if (existingBet) {
      toast({
        title: "Already in Bet Slip",
        description: "This selection is already in your bet slip",
        variant: "default",
      });
      return;
    }

    setBetSlip(prev => [...prev, newBet]);
    
    toast({
      title: "Added to Bet Slip",
      description: `${bet.pick} added to your bet slip`,
      variant: "default",
    });
  };

  // Add a bet directly (new method for enhanced features)
  const addBet = (bet: Bet) => {
    setBetSlip(prev => [...prev, bet]);
    toast({
      title: "Bet Added!",
      description: `${bet.gameTitle || bet.selection || 'Bet'} added to your bet slip`,
    });
  };

  // Remove a bet from the slip
  const removeFromBetSlip = (id: string) => {
    setBetSlip(prev => prev.filter(bet => bet.id !== id));
    
    toast({
      title: "Removed from Bet Slip",
      description: "Selection removed from your bet slip",
      variant: "default",
    });
  };

  // Clear the entire bet slip
  const clearBetSlip = () => {
    setBetSlip([]);
    
    toast({
      title: "Bet Slip Cleared",
      description: "All selections removed from your bet slip",
      variant: "default",
    });
  };

  // Save the current bet slip
  const saveBetSlip = (name: string) => {
    if (betSlip.length === 0) {
      toast({
        title: "Cannot Save Empty Bet Slip",
        description: "Add selections to your bet slip before saving",
        variant: "destructive",
      });
      return;
    }

    const newSavedSlip: SavedBetSlip = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      bets: [...betSlip],
      createdAt: new Date(),
    };

    setSavedBetSlips(prev => [...prev, newSavedSlip]);
    
    toast({
      title: "Bet Slip Saved",
      description: `Your bet slip "${name}" has been saved`,
      variant: "default",
    });
  };

  // Load a saved bet slip
  const loadSavedBetSlip = (id: string) => {
    const savedSlip = savedBetSlips.find(slip => slip.id === id);
    
    if (!savedSlip) {
      toast({
        title: "Error",
        description: "Could not find the saved bet slip",
        variant: "destructive",
      });
      return;
    }
    
    setBetSlip(savedSlip.bets);
    
    toast({
      title: "Bet Slip Loaded",
      description: `Loaded "${savedSlip.name}"`,
      variant: "default",
    });
  };

  // Delete a saved bet slip
  const deleteSavedBetSlip = (id: string) => {
    setSavedBetSlips(prev => prev.filter(slip => slip.id !== id));
    
    toast({
      title: "Bet Slip Deleted",
      description: "The saved bet slip has been deleted",
      variant: "default",
    });
  };

  // Share bet slip (simulate sharing functionality)
  const shareBetSlip = () => {
    if (betSlip.length === 0) {
      toast({
        title: "Cannot Share Empty Bet Slip",
        description: "Add selections to your bet slip before sharing",
        variant: "destructive",
      });
      return;
    }
    
    // In a real application, this would generate a shareable link or open a share dialog
    // For now, we'll just show a toast message
    toast({
      title: "Bet Slip Shared",
      description: "Your bet slip has been copied to clipboard and is ready to share",
      variant: "default",
    });
  };

  // Place a bet
  const placeBet = (amount: string, betType: string, boostEnabled: boolean) => {
    if (betSlip.length === 0 || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please add selections to your bet slip and enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    // In a real application, this would send the bet to the backend
    // For now, we'll just show a toast message and clear the slip
    toast({
      title: "Bet Placed Successfully!",
      description: `Your ${betType} bet of $${amount} has been placed${boostEnabled ? ' with 5% odds boost' : ''}`,
      variant: "default",
    });
    
    setBetSlip([]);
  };

  return (
    <BetSlipContext.Provider
      value={{
        betSlip,
        savedBetSlips,
        addToBetSlip,
        removeFromBetSlip,
        clearBetSlip,
        saveBetSlip,
        loadSavedBetSlip,
        deleteSavedBetSlip,
        shareBetSlip,
        placeBet,
      }}
    >
      {children}
    </BetSlipContext.Provider>
  );
};

// Create custom hook for using the bet slip context
export const useBetSlip = () => {
  const context = useContext(BetSlipContext);
  
  if (context === undefined) {
    throw new Error('useBetSlip must be used within a BetSlipProvider');
  }
  
  return context;
};