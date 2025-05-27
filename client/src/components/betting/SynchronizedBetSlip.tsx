import React, { createContext, useContext, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Bet {
  id: string;
  sport: string;
  event: string;
  team: string;
  betType: string;
  odds: number;
  amount: number;
  potentialPayout: number;
}

interface BetSlipContextType {
  bets: Bet[];
  addBet: (bet: Omit<Bet, 'id' | 'amount' | 'potentialPayout'>) => void;
  removeBet: (id: string) => void;
  updateBetAmount: (id: string, amount: number) => void;
  clearBets: () => void;
  totalStake: number;
  totalPayout: number;
}

const BetSlipContext = createContext<BetSlipContextType | undefined>(undefined);

export const BetSlipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const { toast } = useToast();

  const addBet = (newBet: Omit<Bet, 'id' | 'amount' | 'potentialPayout'>) => {
    const id = `bet-${Date.now()}-${Math.random()}`;
    const amount = 10; // Default amount
    const potentialPayout = amount * newBet.odds;
    
    setBets(prev => [...prev, { 
      ...newBet, 
      id, 
      amount, 
      potentialPayout 
    }]);
    
    toast({
      title: "Bet Added",
      description: `${newBet.team} ${newBet.betType} added to bet slip`,
    });
  };

  const removeBet = (id: string) => {
    setBets(prev => prev.filter(bet => bet.id !== id));
    toast({
      title: "Bet Removed",
      description: "Bet removed from slip",
    });
  };

  const updateBetAmount = (id: string, amount: number) => {
    setBets(prev => prev.map(bet => 
      bet.id === id 
        ? { ...bet, amount, potentialPayout: amount * bet.odds }
        : bet
    ));
  };

  const clearBets = () => {
    setBets([]);
    toast({
      title: "Bet Slip Cleared",
      description: "All bets removed",
    });
  };

  const totalStake = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalPayout = bets.reduce((sum, bet) => sum + bet.potentialPayout, 0);

  return (
    <BetSlipContext.Provider value={{
      bets,
      addBet,
      removeBet,
      updateBetAmount,
      clearBets,
      totalStake,
      totalPayout
    }}>
      {children}
    </BetSlipContext.Provider>
  );
};

export const useBetSlip = () => {
  const context = useContext(BetSlipContext);
  if (!context) {
    throw new Error('useBetSlip must be used within BetSlipProvider');
  }
  return context;
};

export const BetSlipWidget: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { bets, removeBet, updateBetAmount, clearBets, totalStake, totalPayout } = useBetSlip();
  const { toast } = useToast();

  const placeBets = async () => {
    try {
      for (const bet of bets) {
        await apiRequest('POST', '/api/bets/place', {
          eventId: bet.event,
          amount: bet.amount,
          odds: bet.odds,
          selection: bet.team,
          betType: bet.betType,
          currency: 'USD'
        });
      }
      
      clearBets();
      toast({
        title: "Bets Placed Successfully!",
        description: `${bets.length} bets placed for $${totalStake.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Bet Placement Failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className={`${className} h-fit sticky top-4`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Bet Slip</CardTitle>
          <Badge variant="outline">{bets.length} bets</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {bets.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No bets selected
          </p>
        ) : (
          <>
            {bets.map((bet) => (
              <div key={bet.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{bet.team}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeBet(bet.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {bet.sport} • {bet.betType} • {bet.odds > 0 ? '+' : ''}{bet.odds}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateBetAmount(bet.id, Math.max(1, bet.amount - 5))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    value={bet.amount}
                    onChange={(e) => updateBetAmount(bet.id, Math.max(1, parseFloat(e.target.value) || 1))}
                    className="text-center h-8"
                    min="1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateBetAmount(bet.id, bet.amount + 5)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xs">
                  Payout: ${bet.potentialPayout.toFixed(2)}
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Stake:</span>
                <span className="font-medium">${totalStake.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Potential Payout:</span>
                <span className="font-medium text-green-600">${totalPayout.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={placeBets}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Place {bets.length} Bet{bets.length !== 1 ? 's' : ''}
                </Button>
                <Button 
                  onClick={clearBets}
                  variant="outline"
                  className="w-full"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};