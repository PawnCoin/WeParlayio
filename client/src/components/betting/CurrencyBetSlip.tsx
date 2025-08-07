import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Wallet, DollarSign, CreditCard, Trash2, Calculator } from 'lucide-react';

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

interface CurrencyBetSlipProps {
  bets: BetSlipItem[];
  onRemoveBet: (betId: string) => void;
  onClearAll: () => void;
}

export const CurrencyBetSlip: React.FC<CurrencyBetSlipProps> = ({
  bets,
  onRemoveBet,
  onClearAll
}) => {
  const [currency, setCurrency] = useState<'weparlay_cash' | 'real_money' | 'crypto'>('weparlay_cash');
  const [cryptocurrencyType, setCryptocurrencyType] = useState('BTC');
  const [walletAddress, setWalletAddress] = useState('');
  const [betAmounts, setBetAmounts] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user balances
  const { data: balancesData } = useQuery({
    queryKey: ['/api/user/balances'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const balances = balancesData?.balances || {};

  // Place bets mutation
  const placeBetsMutation = useMutation({
    mutationFn: async (betData: any) => {
      return apiRequest('/api/bets/place', {
        method: 'POST',
        body: JSON.stringify(betData),
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Bets Placed Successfully',
        description: `${data.bets.length} bet(s) placed using ${data.currency.replace('_', ' ')}. Remaining balance: $${data.remainingBalance.toFixed(2)}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bets/user'] });
      onClearAll();
      setBetAmounts({});
    },
    onError: (error: any) => {
      toast({
        title: 'Bet Failed',
        description: error.message || 'Failed to place bets',
        variant: 'destructive'
      });
    }
  });

  const updateBetAmount = (betId: string, amount: string) => {
    setBetAmounts(prev => ({
      ...prev,
      [betId]: amount
    }));
  };

  const calculatePotential = (bet: BetSlipItem, amount: string) => {
    const betAmount = parseFloat(amount || '0');
    if (isNaN(betAmount) || betAmount <= 0) return 0;
    
    const odds = bet.odds;
    const multiplier = odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
    return betAmount * multiplier;
  };

  const getTotalStake = () => {
    return Object.values(betAmounts).reduce((sum, amount) => {
      const num = parseFloat(amount || '0');
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  };

  const getTotalPotential = () => {
    return bets.reduce((sum, bet) => {
      const amount = betAmounts[bet.id] || '0';
      return sum + calculatePotential(bet, amount);
    }, 0);
  };

  const getCurrentBalance = () => {
    return balances[currency] || 0;
  };

  const isValidBetSlip = () => {
    if (bets.length === 0) return false;
    
    const totalStake = getTotalStake();
    if (totalStake <= 0 || totalStake > getCurrentBalance()) return false;
    
    // Check if all bets have valid amounts
    const allBetsValid = bets.every(bet => {
      const amount = parseFloat(betAmounts[bet.id] || '0');
      return amount > 0;
    });
    
    // For crypto, check wallet address
    if (currency === 'crypto' && !walletAddress.trim()) return false;
    
    return allBetsValid;
  };

  const handlePlaceBets = async () => {
    if (!isValidBetSlip()) return;

    const betsToPlace = bets.map(bet => ({
      ...bet,
      amount: parseFloat(betAmounts[bet.id] || '0'),
      potential: calculatePotential(bet, betAmounts[bet.id] || '0')
    }));

    const betData = {
      bets: betsToPlace,
      currency,
      cryptocurrencyType: currency === 'crypto' ? cryptocurrencyType : undefined,
      walletAddress: currency === 'crypto' ? walletAddress : undefined
    };

    placeBetsMutation.mutate(betData);
  };

  if (bets.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="text-center py-8">
          <p className="text-slate-400 mb-4">Add bets to your slip to get started</p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <DollarSign className="h-4 w-4" />
              <span>WeParlay Cash</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <CreditCard className="h-4 w-4" />
              <span>Real Money</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Wallet className="h-4 w-4" />
              <span>Crypto</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-white">
            <Calculator className="h-5 w-5 mr-2 text-blue-400" />
            Bet Slip ({bets.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-slate-400 hover:text-white"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Currency Selection */}
        <div className="space-y-3">
          <Label className="text-white">Payment Method</Label>
          <Select value={currency} onValueChange={(value: any) => setCurrency(value)}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="weparlay_cash" className="text-white">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-amber-500" />
                  WeParlay Cash (${balances.weparlay_cash?.toFixed(2) || '0.00'})
                </div>
              </SelectItem>
              <SelectItem value="real_money" className="text-white">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-500" />
                  Real Money (${balances.real_money?.toFixed(2) || '0.00'})
                </div>
              </SelectItem>
              <SelectItem value="crypto" className="text-white">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-500" />
                  Cryptocurrency (${balances.crypto?.toFixed(2) || '0.00'})
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Crypto Options */}
        {currency === 'crypto' && (
          <div className="space-y-3">
            <div>
              <Label className="text-white">Cryptocurrency</Label>
              <Select value={cryptocurrencyType} onValueChange={setCryptocurrencyType}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="BTC" className="text-white">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH" className="text-white">Ethereum (ETH)</SelectItem>
                  <SelectItem value="SOL" className="text-white">Solana (SOL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Wallet Address</Label>
              <Input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your crypto wallet address"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>
        )}

        <Separator className="bg-slate-700" />

        {/* Individual Bets */}
        <div className="space-y-3">
          {bets.map((bet) => (
            <div key={bet.id} className="bg-slate-800 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {bet.sport}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {bet.betType}
                    </Badge>
                  </div>
                  <p className="text-white text-sm font-medium">
                    {bet.gameInfo ? `${bet.gameInfo.homeTeam} vs ${bet.gameInfo.awayTeam}` : bet.selection}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {bet.selection} {bet.odds > 0 ? '+' : ''}{bet.odds}
                    {bet.point && ` (${bet.point > 0 ? '+' : ''}${bet.point})`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveBet(bet.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-slate-400 text-xs">Bet Amount</Label>
                  <Input
                    type="number"
                    value={betAmounts[bet.id] || ''}
                    onChange={(e) => updateBetAmount(bet.id, e.target.value)}
                    placeholder="0.00"
                    className="bg-slate-700 border-slate-600 text-white text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-slate-400 text-xs">Potential Win</Label>
                  <div className="text-green-400 text-sm font-medium py-2">
                    ${calculatePotential(bet, betAmounts[bet.id] || '0').toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-slate-700" />

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-white">
            <span>Total Stake:</span>
            <span>${getTotalStake().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-green-400 font-medium">
            <span>Potential Payout:</span>
            <span>${getTotalPotential().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-400 text-sm">
            <span>Available Balance:</span>
            <span>${getCurrentBalance().toFixed(2)}</span>
          </div>
        </div>

        {/* Place Bet Button */}
        <Button
          onClick={handlePlaceBets}
          disabled={!isValidBetSlip() || placeBetsMutation.isPending}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {placeBetsMutation.isPending 
            ? 'Placing Bets...' 
            : `Place ${bets.length} Bet(s) - $${getTotalStake().toFixed(2)}`
          }
        </Button>

        {/* Balance Warning */}
        {getTotalStake() > getCurrentBalance() && (
          <div className="text-red-400 text-sm text-center">
            Insufficient balance. Need ${(getTotalStake() - getCurrentBalance()).toFixed(2)} more.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrencyBetSlip;