import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import sportsBetAPI from "@/lib/sportsBetAPI";

interface BetItem {
  id: string;
  type: string;
  eventName: string;
  selection: string;
  opponent: string;
  odds: number;
}

const BettingSlip: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [wagerAmount, setWagerAmount] = useState("50.00");
  const [betItems, setBetItems] = useState<BetItem[]>([
    {
      id: "1",
      type: "NBA - Money Line",
      eventName: "Boston Celtics",
      selection: "Boston Celtics",
      opponent: "LA Lakers",
      odds: -145
    },
    {
      id: "2",
      type: "NBA - Point Spread",
      eventName: "LA Lakers +4.5",
      selection: "LA Lakers +4.5",
      opponent: "Boston Celtics",
      odds: -110
    }
  ]);
  
  const isEmpty = betItems.length === 0;
  
  const totalOdds = betItems.reduce((acc, item) => {
    // Convert American odds to decimal
    let decimalOdds;
    if (item.odds > 0) {
      decimalOdds = (item.odds / 100) + 1;
    } else {
      decimalOdds = (100 / Math.abs(item.odds)) + 1;
    }
    return acc * decimalOdds;
  }, 1);
  
  // Convert back to American odds
  const displayOdds = totalOdds > 2 
    ? `+${Math.round((totalOdds - 1) * 100)}`
    : `-${Math.round(100 / (totalOdds - 1))}`;
  
  const potentialPayout = parseFloat(wagerAmount) * totalOdds;
  const profit = potentialPayout - parseFloat(wagerAmount);
  
  const handleRemoveBet = (id: string) => {
    setBetItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  const handleWagerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input with up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setWagerAmount(value);
    }
  };
  
  const handleQuickAmount = (amount: number) => {
    setWagerAmount(amount.toFixed(2));
  };
  
  const handlePlaceBet = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to place a bet",
        variant: "destructive"
      });
      return;
    }
    
    if (isEmpty) {
      toast({
        title: "No Bets Selected",
        description: "Please add selections to your betting slip",
        variant: "destructive"
      });
      return;
    }
    
    const amount = parseFloat(wagerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid wager amount",
        variant: "destructive"
      });
      return;
    }
    
    if (user && amount > user.balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance to place this bet",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // In a real app, we would submit each bet to the API
      // Here we'll just simulate success
      toast({
        title: "Bet Placed Successfully",
        description: "Your bet has been placed",
      });
      
      // Clear betting slip
      setBetItems([]);
      setWagerAmount("50.00");
    } catch (error) {
      console.error("Error placing bet:", error);
      toast({
        title: "Error Placing Bet",
        description: "An error occurred while placing your bet",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Betting Slip</h2>
        <div className="flex">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary mr-2"
            onClick={() => setBetItems([])}
          >
            <i className="fas fa-trash-alt"></i>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
          >
            <i className="fas fa-cog"></i>
          </Button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <Tabs defaultValue="single">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="single">Single</TabsTrigger>
          <TabsTrigger value="parlay">Parlay</TabsTrigger>
          <TabsTrigger value="teaser">Teaser</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single">
          {isEmpty ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-receipt text-gray-400 text-2xl"></i>
              </div>
              <h3 className="font-medium text-gray-600 dark:text-gray-300 mb-2">Your Slip is Empty</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add selections by clicking on odds</p>
              <Button variant="link" className="text-primary">
                View Bet History
              </Button>
            </div>
          ) : (
            <>
              {/* Bet Items */}
              <div className="space-y-3 mb-4">
                {betItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-primary transition-colors">
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">{item.type}</div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-gray-400 hover:text-danger dark:text-gray-500 dark:hover:text-red-400"
                        onClick={() => handleRemoveBet(item.id)}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    </div>
                    <div className="text-base font-semibold mb-1">{item.selection}</div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">vs {item.opponent}</div>
                      <div className="text-sm font-medium">{item.odds}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Wager Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Wager Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">$</span>
                  </div>
                  <Input
                    type="text"
                    value={wagerAmount}
                    onChange={handleWagerChange}
                    className="pl-8 pr-20"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <Button 
                      variant="ghost"
                      className="h-full border-l border-gray-200 dark:border-gray-700 px-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none rounded-r-md"
                      onClick={() => user && setWagerAmount(user.balance.toFixed(2))}
                    >
                      Max
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Quick Amounts */}
              <div className="flex space-x-2 mb-4">
                <Button 
                  variant="outline" 
                  className="flex-1 py-1 text-sm"
                  onClick={() => handleQuickAmount(10)}
                >
                  $10
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 py-1 text-sm"
                  onClick={() => handleQuickAmount(25)}
                >
                  $25
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 py-1 text-sm"
                  onClick={() => handleQuickAmount(50)}
                >
                  $50
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 py-1 text-sm"
                  onClick={() => handleQuickAmount(100)}
                >
                  $100
                </Button>
              </div>
              
              {/* Bet Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Odds</span>
                  <span className="font-medium">{displayOdds}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Potential Payout</span>
                  <span className="font-medium">${potentialPayout.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Profit</span>
                  <span className="font-medium text-secondary">${profit.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Place Bet Button */}
              <Button 
                className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary/90"
                onClick={handlePlaceBet}
              >
                Place Bet
              </Button>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="parlay">
          <div className="text-center py-10">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Add multiple selections to create a parlay bet
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="teaser">
          <div className="text-center py-10">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Create a teaser bet by adjusting the point spread
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Responsible Gaming */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <Shield className="inline-block h-3 w-3 mr-1" />
          <a href="#" className="text-primary hover:underline">Responsible Gaming</a>
          • Must be 21+ to bet
        </p>
      </div>
    </div>
  );
};

export default BettingSlip;
