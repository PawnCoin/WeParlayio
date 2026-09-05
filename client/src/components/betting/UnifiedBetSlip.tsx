import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash2, Wallet, CreditCard, Ticket, Mail, MessageSquareText, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { calculateParlay } from '@/lib/betMath';

// Helper function to format odds to 2 decimal places
const formatOdds = (odds: number) => {
  if (!odds && odds !== 0) return '0';
  return Number(odds).toFixed(2).replace(/\.?0+$/, '');
};

interface BetSlipItem {
  id: string;
  eventId: string;
  betType: string;
  selection: string;
  odds: number;
  amount: number;
  potential: number;
  point?: number;
  sport: string;
  gameInfo?: {
    homeTeam: string;
    awayTeam: string;
    startTime?: string;
  };
}

interface UnifiedBetSlipProps {
  betSlip: BetSlipItem[];
  onUpdateBet: (id: string, amount: number) => void;
  onRemoveBet: (id: string) => void;
  onClearAll: () => void;
  balances: {
    weparlay_cash?: number;
    real_money?: number;
    crypto?: number;
  };
}

interface PlaceBetsResponse {
  success: boolean;
  message: string;
}

const UnifiedBetSlip: React.FC<UnifiedBetSlipProps> = ({
  betSlip,
  onUpdateBet,
  onRemoveBet,
  onClearAll,
  balances
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCurrency, setSelectedCurrency] = useState<'weparlay_cash' | 'real_money'>('weparlay_cash');
  const [wagerMode, setWagerMode] = useState<'straight' | 'parlay'>('straight');
  const [parlayStake, setParlayStake] = useState('');
  const [localBetSlip, setLocalBetSlip] = useState<BetSlipItem[]>([]);

  // Listen for custom bet slip events from addToBothSlips
  useEffect(() => {
    const handleBetSlipUpdate = (event: CustomEvent) => {
      const { type, bet } = event.detail;
      
      if (type === 'add') {
        // Convert bet to BetSlipItem format
        const betSlipItem: BetSlipItem = {
          id: bet.id,
          eventId: bet.eventId || '',
          betType: bet.betType,
          selection: bet.selection || bet.pick,
          odds: bet.odds,
          amount: bet.amount || 0,
          potential: bet.potential || 0,
          point: bet.point,
          sport: bet.sport,
          gameInfo: {
            homeTeam: bet.homeTeam || '',
            awayTeam: bet.awayTeam || '',
            startTime: bet.startTime || ''
          }
        };
        
        setLocalBetSlip(prev => [...prev, betSlipItem]);
        
        toast({
          title: "Bet Synchronized",
          description: `${bet.pick || bet.selection} synced to unified bet slip`,
          variant: "default",
        });
      }
    };

    window.addEventListener('betSlipUpdate', handleBetSlipUpdate as EventListener);
    
    return () => {
      window.removeEventListener('betSlipUpdate', handleBetSlipUpdate as EventListener);
    };
  }, [toast]);

  // Update local slip when props change
  useEffect(() => {
    if (Array.isArray(betSlip)) {
      setLocalBetSlip(betSlip);
    }
  }, [betSlip]);

  // Place bets mutation
  const placeBetsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/bets/place', data);
      return response.json() as Promise<PlaceBetsResponse>;
    },
    onSuccess: (data) => {
      toast({
        title: 'Bets Placed Successfully!',
        description: data.message,
      });
      onClearAll();
      queryClient.invalidateQueries({ queryKey: ['/api/bets/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Bet Placement Failed',
        description: error.message || 'Failed to place bets',
        variant: 'destructive'
      });
    }
  });

  // Render with combined bet slip data (context + local)  
  const safeBetSlip = Array.isArray(betSlip) ? betSlip : [];
  const safeLocalBetSlip = Array.isArray(localBetSlip) ? localBetSlip : [];
  
  const displayBetSlip = [
    ...safeBetSlip, 
    ...safeLocalBetSlip.filter(local => 
      !safeBetSlip.some(context => context.id === local.id)
    )
  ];

  const currentBalance = balances?.[selectedCurrency] || 0;
  const parlayEligible = displayBetSlip.length >= 2 && displayBetSlip.length <= 9;
  const parsedParlayStake = Number.parseFloat(parlayStake) || 0;
  const parlayQuote = parlayEligible && parsedParlayStake > 0
    ? calculateParlay(displayBetSlip.map((bet) => bet.odds), parsedParlayStake)
    : null;
  const totalAmount = wagerMode === 'parlay' ? parsedParlayStake : displayBetSlip.reduce((sum, bet) => sum + (bet.amount || 0), 0);
  const totalPotential = wagerMode === 'parlay' ? (parlayQuote?.payout || 0) : displayBetSlip.reduce((sum, bet) => sum + (bet.potential || 0), 0);
  const shareText = encodeURIComponent(`WeParlay challenge: ${displayBetSlip.map(bet => bet.selection).join(', ')}. Open the invitation to sign in and accept or decline.`);

  useEffect(() => {
    if (wagerMode === 'parlay' && !parlayEligible) setWagerMode('straight');
  }, [wagerMode, parlayEligible]);

  const handlePlaceBets = () => {
    if (displayBetSlip.length === 0) {
      toast({
        title: 'No Bets Selected',
        description: 'Add some bets to your slip first',
        variant: 'destructive'
      });
      return;
    }

    if (wagerMode === 'parlay' && !parlayQuote) {
      toast({ title: 'Parlay stake required', description: 'Enter one stake for all 2–9 selections.', variant: 'destructive' });
      return;
    }

    if (totalAmount > currentBalance) {
      toast({
        title: 'Insufficient Balance',
        description: `You need $${totalAmount.toFixed(2)} but only have $${currentBalance.toFixed(2)}`,
        variant: 'destructive'
      });
      return;
    }

    const straightBets = displayBetSlip.map(bet => ({
        eventId: bet.eventId,
        betType: bet.betType,
        selection: bet.selection,
        odds: bet.odds,
        amount: bet.amount,
        potential: bet.potential,
        point: bet.point,
        gameInfo: bet.gameInfo
      }));
    const betsData = {
      bets: wagerMode === 'parlay' ? [{
        eventId: displayBetSlip.map((bet) => bet.eventId).join(','),
        betType: 'parlay',
        selection: displayBetSlip.map((bet) => bet.selection).join(' + '),
        odds: parlayQuote?.americanOdds,
        amount: parsedParlayStake,
        potential: parlayQuote?.payout,
        gameInfo: { legs: straightBets },
      }] : straightBets,
      wagerMode,
      currency: selectedCurrency,
    };

    placeBetsMutation.mutate(betsData);
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'weparlay_cash':
        return <Wallet className="h-4 w-4" />;
      case 'real_money':
        return <CreditCard className="h-4 w-4 text-emerald-500" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getCurrencyLabel = (currency: string) => {
    switch (currency) {
      case 'weparlay_cash':
        return 'WeParlay Cash';
      case 'real_money':
        return 'Debit Card';
      default:
        return 'USD';
    }
  };

  return (
    <div className="space-y-4">
      {/* Unified Bet Slip Header with Currency Toggle */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Ticket className="h-5 w-5 mr-2 text-emerald-500" />
              Bet Slip ({displayBetSlip.length || 0})
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Currency Selection */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Choose Your Currency
            </label>
            <Select value={selectedCurrency} onValueChange={(value: 'weparlay_cash' | 'real_money') => setSelectedCurrency(value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select currency..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="weparlay_cash" className="text-white hover:bg-slate-700">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Wallet className="h-4 w-4 mr-2 text-emerald-500" />
                      WeParlay Cash
                    </div>
                    <span className="text-green-400">${(balances?.weparlay_cash || 0).toFixed(2)}</span>
                  </div>
                </SelectItem>
                <SelectItem value="real_money" disabled className="text-white hover:bg-slate-700">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-emerald-500" />
                      Debit Card (Verification required)
                    </div>
                    <span className="text-green-400">${(balances?.real_money || 0).toFixed(2)}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-slate-400">Debit-card wagering requires real identity, age, location, and jurisdiction verification. It remains unavailable until compliance and payment-provider approval are complete.</p>

          {/* Current Balance Display */}
          <div className="bg-slate-800 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getCurrencyIcon(selectedCurrency)}
                <span className="text-white ml-2 font-medium">
                  {getCurrencyLabel(selectedCurrency)} Balance:
                </span>
              </div>
              <span className="text-green-400 font-bold text-lg">
                ${currentBalance.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant={wagerMode === 'straight' ? 'default' : 'outline'} onClick={() => setWagerMode('straight')}>Straight</Button>
            <Button variant={wagerMode === 'parlay' ? 'default' : 'outline'} disabled={!parlayEligible} onClick={() => setWagerMode('parlay')}>Parlay (2–9)</Button>
          </div>
          {!parlayEligible && displayBetSlip.length > 0 && <p className="text-xs text-slate-400">Parlay unlocks with 2–9 teams. Provider odds and parlay rules apply.</p>}
          {wagerMode === 'parlay' && parlayEligible && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
              <label className="mb-2 block text-sm font-medium text-white">One parlay stake</label>
              <Input type="number" min="1" step="0.01" value={parlayStake} onChange={(event) => setParlayStake(event.target.value)} placeholder="Parlay stake" className="bg-slate-800 border-slate-600 text-white" />
              <div className="mt-2 flex justify-between text-xs text-slate-300"><span>Combined odds</span><strong>{parlayQuote ? `${parlayQuote.americanOdds > 0 ? '+' : ''}${parlayQuote.americanOdds}` : 'Enter stake'}</strong></div>
            </div>
          )}

          {displayBetSlip.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <p className="text-slate-400">Add bets to your slip to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Individual Bets */}
              {displayBetSlip.map((bet, index) => (
                <div key={bet.id} className="bg-slate-800 p-3 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">
                        {bet.gameInfo?.homeTeam} vs {bet.gameInfo?.awayTeam}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {bet.selection} {bet.point && `(${bet.point > 0 ? '+' : ''}${formatOdds(bet.point)})`}
                      </div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {bet.odds > 0 ? `+${formatOdds(bet.odds)}` : formatOdds(bet.odds)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveBet(bet.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="h-4 w-4 text-emerald-500" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Bet amount"
                        value={bet.amount || ''}
                        onChange={(e) => onUpdateBet(bet.id, parseFloat(e.target.value) || 0)}
                        disabled={wagerMode === 'parlay'}
                        className="bg-slate-700 border-slate-600 text-white text-sm disabled:opacity-40"
                        min="1"
                        max={currentBalance}
                      />
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 text-sm font-medium">
                        ${bet.potential?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-slate-400 text-xs">potential</div>
                    </div>
                  </div>
                </div>
              ))}

              <Separator className="bg-slate-700" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-white">
                  <span>Total Bet:</span>
                  <span className="font-bold">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Potential Win:</span>
                  <span className="font-bold">${totalPotential.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Remaining Balance:</span>
                  <span className="font-bold">${(currentBalance - totalAmount).toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <a href={`mailto:?subject=WeParlay%20bet%20challenge&body=${shareText}`}><Button variant="outline" size="sm" className="w-full"><Mail className="h-4 w-4 text-emerald-500" /></Button></a>
                <a href={`sms:?&body=${shareText}`}><Button variant="outline" size="sm" className="w-full"><MessageSquareText className="h-4 w-4 text-emerald-500" /></Button></a>
                <Button variant="outline" size="sm" onClick={() => navigator.share?.({ title: 'WeParlay challenge', text: decodeURIComponent(shareText), url: window.location.origin })}><Share2 className="h-4 w-4 text-emerald-500" /></Button>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={handlePlaceBets}
                  disabled={placeBetsMutation.isPending || totalAmount === 0 || totalAmount > currentBalance}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {placeBetsMutation.isPending ? 'Placing...' : `Place Bets ($${totalAmount.toFixed(2)})`}
                </Button>
                <Button
                  variant="outline"
                  onClick={onClearAll}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedBetSlip;
