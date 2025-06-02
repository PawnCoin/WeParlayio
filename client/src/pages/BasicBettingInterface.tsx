import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  Calculator,
  X,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface BetSelection {
  id: string;
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  market: string;
  selection: string;
  odds: number;
  point?: number;
  bookmaker: string;
}

interface BetSlipItem extends BetSelection {
  stake: number;
  potentialWin: number;
}

export default function BasicBettingInterface() {
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [quickStakes] = useState([10, 25, 50, 100]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user balance
  const { data: balanceData } = useQuery({
    queryKey: ['/api/user/cash-balance'],
    refetchInterval: 30000,
  });

  // Place bet mutation
  const placeBetMutation = useMutation({
    mutationFn: async (betData: any) => {
      const response = await fetch('/api/bets/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData),
      });
      if (!response.ok) throw new Error('Failed to place bet');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bet Placed Successfully",
        description: "Your bet has been placed and is now active.",
      });
      setBetSlip([]);
      setShowConfirmation(false);
      queryClient.invalidateQueries({ queryKey: ['/api/user/cash-balance'] });
    },
    onError: (error: any) => {
      toast({
        title: "Bet Placement Failed",
        description: error.message || "Unable to place bet at this time.",
        variant: "destructive",
      });
    },
  });

  // Add bet to slip
  const addToBetSlip = (selection: BetSelection) => {
    const existingBet = betSlip.find(bet => bet.id === selection.id);
    if (existingBet) {
      toast({
        title: "Already in Bet Slip",
        description: "This selection is already in your bet slip.",
        variant: "destructive",
      });
      return;
    }

    const newBet: BetSlipItem = {
      ...selection,
      stake: 0,
      potentialWin: 0,
    };

    setBetSlip([...betSlip, newBet]);
    toast({
      title: "Added to Bet Slip",
      description: `${selection.selection} added to your bet slip.`,
    });
  };

  // Remove bet from slip
  const removeFromBetSlip = (betId: string) => {
    setBetSlip(betSlip.filter(bet => bet.id !== betId));
  };

  // Update stake for a bet
  const updateStake = (betId: string, stake: number) => {
    setBetSlip(betSlip.map(bet => {
      if (bet.id === betId) {
        const potentialWin = calculatePotentialWin(stake, bet.odds);
        return { ...bet, stake, potentialWin };
      }
      return bet;
    }));
  };

  // Set quick stake for a bet
  const setQuickStake = (betId: string, amount: number) => {
    updateStake(betId, amount);
  };

  // Calculate potential winnings
  const calculatePotentialWin = (stake: number, odds: number) => {
    if (odds > 0) {
      return (stake * odds) / 100;
    } else {
      return (stake * 100) / Math.abs(odds);
    }
  };

  // Get total stake
  const getTotalStake = () => {
    return betSlip.reduce((total, bet) => total + bet.stake, 0);
  };

  // Get total potential win
  const getTotalPotentialWin = () => {
    return betSlip.reduce((total, bet) => total + bet.potentialWin, 0);
  };

  // Check if bet slip is valid
  const isBetSlipValid = () => {
    if (betSlip.length === 0) return false;
    if (betSlip.some(bet => bet.stake <= 0)) return false;
    if (getTotalStake() > (balanceData?.balance || 0)) return false;
    return true;
  };

  // Place all bets
  const handlePlaceBets = () => {
    if (!isBetSlipValid()) return;
    
    const betData = {
      bets: betSlip.map(bet => ({
        eventId: bet.eventId,
        market: bet.market,
        selection: bet.selection,
        odds: bet.odds,
        stake: bet.stake,
        point: bet.point,
      })),
      totalStake: getTotalStake(),
    };

    placeBetMutation.mutate(betData);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Sample betting markets for demonstration
  const sampleBets: BetSelection[] = [
    {
      id: 'bet_001',
      eventId: 'nfl_001',
      homeTeam: 'Dallas Cowboys',
      awayTeam: 'Green Bay Packers',
      market: 'moneyline',
      selection: 'Dallas Cowboys',
      odds: -150,
      bookmaker: 'DraftKings'
    },
    {
      id: 'bet_002',
      eventId: 'nfl_001',
      homeTeam: 'Dallas Cowboys',
      awayTeam: 'Green Bay Packers',
      market: 'spread',
      selection: 'Green Bay Packers',
      odds: -110,
      point: 3.5,
      bookmaker: 'FanDuel'
    },
    {
      id: 'bet_003',
      eventId: 'nba_001',
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      market: 'totals',
      selection: 'Over',
      odds: -105,
      point: 225.5,
      bookmaker: 'BetMGM'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Betting Interface</h1>
        <p className="text-gray-600">Place your bets with confidence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Bets */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleBets.map((bet) => (
                  <div key={bet.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">
                        {bet.awayTeam} @ {bet.homeTeam}
                      </h4>
                      <Badge variant="outline">{bet.bookmaker}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 capitalize">{bet.market}</p>
                        <p className="font-medium">
                          {bet.selection}
                          {bet.point && (
                            <span className="text-sm text-gray-600 ml-1">
                              {bet.point > 0 ? '+' : ''}{bet.point}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-lg">
                          {bet.odds > 0 ? '+' : ''}{bet.odds}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => addToBetSlip(bet)}
                          disabled={betSlip.some(b => b.id === bet.id)}
                        >
                          {betSlip.some(b => b.id === bet.id) ? 'Added' : 'Add'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bet Slip */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Bet Slip</span>
                </CardTitle>
                {betSlip.length > 0 && (
                  <Badge variant="outline">{betSlip.length}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {betSlip.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Your bet slip is empty</p>
                  <p className="text-sm">Add selections to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {betSlip.map((bet) => (
                    <div key={bet.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {bet.awayTeam} @ {bet.homeTeam}
                          </p>
                          <p className="text-xs text-gray-600 capitalize">
                            {bet.market} - {bet.selection}
                            {bet.point && ` ${bet.point > 0 ? '+' : ''}${bet.point}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromBetSlip(bet.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Odds:</span>
                          <span className="font-medium">
                            {bet.odds > 0 ? '+' : ''}{bet.odds}
                          </span>
                        </div>

                        <div>
                          <Label htmlFor={`stake-${bet.id}`} className="text-sm">
                            Stake
                          </Label>
                          <Input
                            id={`stake-${bet.id}`}
                            type="number"
                            placeholder="0.00"
                            value={bet.stake || ''}
                            onChange={(e) => updateStake(bet.id, parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {quickStakes.map((amount) => (
                            <Button
                              key={amount}
                              variant="outline"
                              size="sm"
                              onClick={() => setQuickStake(bet.id, amount)}
                            >
                              ${amount}
                            </Button>
                          ))}
                        </div>

                        {bet.stake > 0 && (
                          <div className="flex items-center justify-between text-sm font-medium">
                            <span>To Win:</span>
                            <span className="text-green-600">
                              {formatCurrency(bet.potentialWin)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <Separator />

                  {/* Bet Slip Summary */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-medium">
                      <span>Total Stake:</span>
                      <span>{formatCurrency(getTotalStake())}</span>
                    </div>
                    <div className="flex items-center justify-between font-medium">
                      <span>Potential Win:</span>
                      <span className="text-green-600">
                        {formatCurrency(getTotalPotentialWin())}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Available Balance:</span>
                      <span>{formatCurrency(balanceData?.balance || 0)}</span>
                    </div>

                    {getTotalStake() > (balanceData?.balance || 0) && (
                      <div className="flex items-center space-x-2 text-sm text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Insufficient balance</span>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => setShowConfirmation(true)}
                      disabled={!isBetSlipValid() || placeBetMutation.isPending}
                    >
                      {placeBetMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Placing Bet...</span>
                        </div>
                      ) : (
                        <>
                          <Calculator className="h-4 w-4 mr-2" />
                          Place Bet{betSlip.length > 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Account Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(balanceData?.balance || 0)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Available to bet</p>
              </div>
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full">
                  Deposit Funds
                </Button>
                <Button variant="outline" className="w-full">
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bet Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h3 className="text-lg font-semibold">Confirm Your Bet</h3>
            </div>

            <div className="space-y-4 mb-6">
              {betSlip.map((bet) => (
                <div key={bet.id} className="border rounded p-3">
                  <p className="font-medium text-sm">
                    {bet.awayTeam} @ {bet.homeTeam}
                  </p>
                  <p className="text-xs text-gray-600">
                    {bet.selection} ({bet.odds > 0 ? '+' : ''}{bet.odds})
                  </p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>Stake: {formatCurrency(bet.stake)}</span>
                    <span>To Win: {formatCurrency(bet.potentialWin)}</span>
                  </div>
                </div>
              ))}

              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total Stake:</span>
                  <span>{formatCurrency(getTotalStake())}</span>
                </div>
                <div className="flex justify-between font-semibold text-green-600">
                  <span>Total To Win:</span>
                  <span>{formatCurrency(getTotalPotentialWin())}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handlePlaceBets}
                disabled={placeBetMutation.isPending}
              >
                {placeBetMutation.isPending ? 'Placing...' : 'Confirm Bet'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}