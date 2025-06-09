import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  Calculator, 
  TrendingUp, 
  Shield, 
  Zap,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Bet {
  id: string;
  eventId: string;
  selection: string;
  odds: number;
  betType: string;
  gameInfo: string;
}

interface CryptoBetSlipProps {
  bets: Bet[];
  onRemoveBet: (betId: string) => void;
  onClearAll: () => void;
}

const CRYPTO_OPTIONS = [
  { symbol: 'BTC', name: 'Bitcoin', minBet: 0.001, icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', minBet: 0.01, icon: 'Ξ' },
  { symbol: 'SOL', name: 'Solana', minBet: 0.1, icon: '◎' },
  { symbol: 'USDC', name: 'USD Coin', minBet: 10, icon: '$' },
  { symbol: 'USDT', name: 'Tether', minBet: 10, icon: '$' },
  { symbol: '$Pc', name: 'Pawn Coin', minBet: 100, icon: '♟' }
];

export default function CryptoBetSlip({ bets, onRemoveBet, onClearAll }: CryptoBetSlipProps) {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [betAmounts, setBetAmounts] = useState<{ [key: string]: string }>({});
  const [connectedWallet, setConnectedWallet] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch live crypto prices
  const { data: cryptoPrices = [] } = useQuery({
    queryKey: ['/api/crypto/live-prices'],
    refetchInterval: 10000,
  });

  // Place crypto bet mutation
  const placeBetMutation = useMutation({
    mutationFn: async (betData: any) => {
      const response = await fetch('/api/crypto/place-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData)
      });
      if (!response.ok) throw new Error('Failed to place bet');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Crypto Bet Placed",
        description: `Transaction hash: ${data.transactionHash?.slice(0, 10)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/crypto-bets'] });
      onClearAll();
      setBetAmounts({});
    },
    onError: (error: any) => {
      toast({
        title: "Bet Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const selectedCryptoData = CRYPTO_OPTIONS.find(crypto => crypto.symbol === selectedCrypto);
  const currentPrice = cryptoPrices.find((crypto: any) => crypto.symbol === selectedCrypto)?.price || 0;

  const calculatePayout = (betId: string) => {
    const bet = bets.find(b => b.id === betId);
    const amount = parseFloat(betAmounts[betId] || '0');
    if (!bet || isNaN(amount) || amount <= 0) return 0;
    
    const odds = bet.odds > 0 ? (bet.odds / 100) + 1 : (100 / Math.abs(bet.odds)) + 1;
    return amount * odds;
  };

  const calculateUSDValue = (amount: string) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !currentPrice) return 0;
    return numAmount * currentPrice;
  };

  const getTotalStake = () => {
    return Object.values(betAmounts).reduce((sum, amount) => {
      const num = parseFloat(amount || '0');
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  };

  const getTotalPayout = () => {
    return bets.reduce((sum, bet) => sum + calculatePayout(bet.id), 0);
  };

  const isValidBetSlip = () => {
    if (bets.length === 0 || !connectedWallet || !selectedCryptoData) return false;
    
    return bets.every(bet => {
      const amount = parseFloat(betAmounts[bet.id] || '0');
      return amount >= selectedCryptoData.minBet && amount > 0;
    });
  };

  const handlePlaceAllBets = async () => {
    if (!isValidBetSlip()) return;

    const betsToPlace = bets.map(bet => ({
      eventId: bet.eventId,
      selection: bet.selection,
      amount: parseFloat(betAmounts[bet.id]),
      cryptocurrency: selectedCrypto,
      odds: bet.odds,
      potentialPayout: calculatePayout(bet.id),
      walletAddress: connectedWallet.address,
      betType: 'crypto'
    }));

    // Place all bets simultaneously
    for (const betData of betsToPlace) {
      placeBetMutation.mutate(betData);
    }
  };

  // Mock wallet detection for demonstration
  useEffect(() => {
    const checkWallet = () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        setConnectedWallet({
          address: '0x742d...35Cc',
          balance: 1.2345,
          network: 'Ethereum'
        });
      }
    };
    checkWallet();
  }, []);

  if (bets.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Wallet className="h-5 w-5 mr-2 text-blue-400" />
            Crypto Bet Slip
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-slate-400 mb-4">Add bets to your slip to get started</p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Shield className="h-4 w-4" />
            <span>Secure blockchain betting</span>
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
            <Wallet className="h-5 w-5 mr-2 text-blue-400" />
            Crypto Bet Slip ({bets.length})
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
        {/* Cryptocurrency Selection */}
        <div>
          <label className="text-slate-400 text-sm mb-2 block">Payment Method</label>
          <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
            <SelectTrigger className="bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {CRYPTO_OPTIONS.map((crypto) => (
                <SelectItem key={crypto.symbol} value={crypto.symbol}>
                  <div className="flex items-center gap-2">
                    <span>{crypto.icon}</span>
                    <span>{crypto.symbol} - {crypto.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentPrice > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              Current Price: ${currentPrice.toLocaleString()}
            </p>
          )}
        </div>

        {/* Individual Bets */}
        <div className="space-y-3">
          {bets.map((bet) => (
            <div key={bet.id} className="p-3 bg-slate-800 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{bet.selection}</p>
                  <p className="text-slate-400 text-xs">{bet.gameInfo}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                      {bet.odds > 0 ? `+${bet.odds}` : bet.odds}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">{bet.betType}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveBet(bet.id)}
                  className="text-slate-400 hover:text-red-400 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-xs">Amount ({selectedCrypto})</label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder={`Min: ${selectedCryptoData?.minBet}`}
                    value={betAmounts[bet.id] || ''}
                    onChange={(e) => setBetAmounts(prev => ({
                      ...prev,
                      [bet.id]: e.target.value
                    }))}
                    className="bg-slate-700 border-slate-600 text-white text-sm"
                  />
                  {betAmounts[bet.id] && (
                    <p className="text-xs text-slate-500 mt-1">
                      ≈ ${calculateUSDValue(betAmounts[bet.id]).toFixed(2)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-slate-400 text-xs">Potential Payout</label>
                  <div className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm">
                    <span className="text-green-400 font-semibold">
                      {calculatePayout(bet.id).toFixed(6)} {selectedCrypto}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wallet Status */}
        {connectedWallet ? (
          <div className="p-3 bg-green-950/30 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-green-300 text-sm font-medium">
                Wallet Connected: {connectedWallet.address}
              </span>
            </div>
          </div>
        ) : (
          <Alert className="border-orange-500 bg-orange-950/30">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-orange-300">
              Connect your crypto wallet to place bets
            </AlertDescription>
          </Alert>
        )}

        {/* Summary */}
        {bets.length > 0 && (
          <div className="p-3 bg-slate-800 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Stake:</span>
              <span className="text-white font-semibold">
                {getTotalStake().toFixed(6)} {selectedCrypto}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Potential Payout:</span>
              <span className="text-green-400 font-semibold">
                {getTotalPayout().toFixed(6)} {selectedCrypto}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Potential Profit:</span>
              <span className="text-blue-400 font-bold">
                {(getTotalPayout() - getTotalStake()).toFixed(6)} {selectedCrypto}
              </span>
            </div>
          </div>
        )}

        {/* Place Bets Button */}
        <Button
          onClick={handlePlaceAllBets}
          disabled={!isValidBetSlip() || placeBetMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700"
        >
          {placeBetMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Place {bets.length} Crypto Bet{bets.length > 1 ? 's' : ''}
            </>
          )}
        </Button>

        {/* Security Notice */}
        <div className="text-center pt-2">
          <p className="text-slate-500 text-xs">
            Secure blockchain transactions • Your keys, your coins
          </p>
        </div>
      </CardContent>
    </Card>
  );
}