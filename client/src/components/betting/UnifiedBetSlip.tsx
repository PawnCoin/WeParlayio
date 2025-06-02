
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedBetSlip } from './UnifiedBetSlipManager';
import { 
  TrendingUp, 
  Trash2, 
  DollarSign, 
  Calculator,
  Share2,
  Bookmark,
  AlertCircle,
  CheckCircle,
  Target
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

const UnifiedBetSlip: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { 
    betSlip, 
    removeFromBetSlip, 
    clearBetSlip, 
    placeBet
  } = useUnifiedBetSlip();
  
  const [betAmount, setBetAmount] = useState('25.00');
  const [betType, setBetType] = useState<'single' | 'parlay'>('single');
  const [currency, setCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate odds and potential payout
  const calculateTotals = () => {
    if (betSlip.length === 0) return { totalOdds: 0, potentialPayout: 0, profit: 0 };
    
    const amount = parseFloat(betAmount) || 0;
    let totalOdds = 1;
    
    if (betType === 'single' && betSlip.length > 0) {
      // For single bets, use the first bet's odds
      const odds = betSlip[0].odds;
      totalOdds = odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
    } else if (betType === 'parlay') {
      // For parlays, multiply all odds
      betSlip.forEach(bet => {
        const decimalOdds = bet.odds > 0 ? (bet.odds / 100) + 1 : (100 / Math.abs(bet.odds)) + 1;
        totalOdds *= decimalOdds;
      });
    }
    
    const potentialPayout = amount * totalOdds;
    const profit = potentialPayout - amount;
    
    return { totalOdds, potentialPayout, profit };
  };

  const { totalOdds, potentialPayout, profit } = calculateTotals();

  // Format odds for display
  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  // Handle bet placement
  const handlePlaceBet = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to place a bet",
        variant: "destructive"
      });
      return;
    }

    if (betSlip.length === 0) {
      toast({
        title: "Empty Bet Slip",
        description: "Add selections to your bet slip first",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bet amount",
        variant: "destructive"
      });
      return;
    }

    if (user && amount > (user.balance || 0)) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this bet",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await placeBet(betAmount, betType, false);
      setBetAmount('25.00');
      setBetType('single');
      
      toast({
        title: "Bet Placed Successfully!",
        description: `Your ${betType} bet for $${amount} has been placed`,
        duration: 5000
      });
    } catch (error) {
      toast({
        title: "Bet Failed",
        description: "There was an error placing your bet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-full bg-background border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Bet Slip</span>
            {betSlip.length > 0 && (
              <Badge variant="secondary">{betSlip.length}</Badge>
            )}
          </div>
          
          {betSlip.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={shareBetSlip}
                className="h-8 w-8 p-0"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => saveBetSlip('My Bet Slip')}
                className="h-8 w-8 p-0"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearBetSlip}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {betSlip.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-muted-foreground mb-2">
              Your bet slip is empty
            </h3>
            <p className="text-sm text-muted-foreground">
              Click on odds to add bets to your slip
            </p>
          </div>
        ) : (
          <>
            {/* Bet Type Toggle */}
            <div className="flex gap-2">
              <Button
                variant={betType === 'single' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setBetType('single')}
              >
                Single
              </Button>
              <Button
                variant={betType === 'parlay' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setBetType('parlay')}
                disabled={betSlip.length < 2}
              >
                Parlay {betSlip.length < 2 && '(2+ needed)'}
              </Button>
            </div>

            {/* Bet Items */}
            <ScrollArea className="max-h-64">
              <AnimatePresence>
                {betSlip.map((bet) => (
                  <motion.div
                    key={bet.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-3 p-3 border border-border rounded-lg bg-card"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{bet.pick}</h4>
                        <p className="text-xs text-muted-foreground">
                          {bet.homeTeam} vs {bet.awayTeam}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromBetSlip(bet.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {bet.betType}
                      </span>
                      <Badge variant="outline">
                        {formatOdds(bet.odds)}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>

            {/* Currency Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">💵 USD (Real Money)</SelectItem>
                  <SelectItem value="WEPARLAY">🎯 WeParlay Cash</SelectItem>
                  <SelectItem value="BTC">₿ Bitcoin</SelectItem>
                  <SelectItem value="ETH">⟠ Ethereum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bet Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Bet Amount</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                  {currency === 'USD' ? '$' : 
                   currency === 'WEPARLAY' ? 'WP' :
                   currency === 'BTC' ? '₿' : '⟠'}
                </div>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="pl-9"
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                />
              </div>
              
              {/* Quick Amount Buttons */}
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setBetAmount(amount.toString())}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Calculation Summary */}
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Total Odds:</span>
                <span className="font-medium">
                  {totalOdds > 2 ? `+${Math.round((totalOdds - 1) * 100)}` : `-${Math.round(100 / (totalOdds - 1))}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Potential Payout:</span>
                <span className="font-medium text-green-600">
                  ${potentialPayout.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Profit:</span>
                <span className="text-green-600">
                  ${profit.toFixed(2)}
                </span>
              </div>
            </div>

            {/* User Balance */}
            {user && (
              <div className="flex justify-between text-sm p-2 bg-secondary rounded">
                <span>Your Balance:</span>
                <span className="font-medium">
                  ${(user.balance || 0).toFixed(2)}
                </span>
              </div>
            )}

            {/* Place Bet Button */}
            <Button
              onClick={handlePlaceBet}
              disabled={isLoading || !isAuthenticated || betSlip.length === 0}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Placing Bet...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Place {betType === 'parlay' ? 'Parlay' : 'Bet'} - ${betAmount}
                </div>
              )}
            </Button>

            {/* Status Messages */}
            {!isAuthenticated && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                Please log in to place bets
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedBetSlip;
