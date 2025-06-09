import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Zap, 
  Shield, 
  Clock,
  Calculator,
  Wallet,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WalletConnector from './WalletConnector';

interface BetOption {
  id: string;
  label: string;
  odds: number;
  probability: number;
  payout: number;
}

interface SportEvent {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: 'upcoming' | 'live' | 'finished';
  odds: {
    home: number;
    away: number;
    draw?: number;
  };
}

interface CryptoBet {
  eventId: string;
  selection: string;
  amount: number;
  cryptocurrency: string;
  odds: number;
  potentialPayout: number;
  walletAddress: string;
  transactionHash?: string;
}

const SUPPORTED_CRYPTOS = [
  { symbol: 'BTC', name: 'Bitcoin', minBet: 0.001, fee: 0.0002 },
  { symbol: 'ETH', name: 'Ethereum', minBet: 0.01, fee: 0.002 },
  { symbol: 'SOL', name: 'Solana', minBet: 0.1, fee: 0.01 },
  { symbol: 'USDC', name: 'USD Coin', minBet: 10, fee: 1 },
  { symbol: 'USDT', name: 'Tether', minBet: 10, fee: 1 },
  { symbol: '$Pc', name: 'Pawn Coin', minBet: 100, fee: 5 }
];

export default function CryptoBettingPanel() {
  const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [betAmount, setBetAmount] = useState('');
  const [selectedOdds, setSelectedOdds] = useState<BetOption | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch live sports events with real odds
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/sports'],
    refetchInterval: 30000,
    select: (data: any[]) => {
      return data.slice(0, 10).map(event => ({
        id: event.id,
        sport: event.sport,
        homeTeam: event.homeTeam?.name || 'Home Team',
        awayTeam: event.awayTeam?.name || 'Away Team',
        startTime: event.startTime || new Date().toISOString(),
        status: event.status || 'upcoming',
        odds: {
          home: event.odds?.home || 1.95,
          away: event.odds?.away || 1.95,
          draw: event.odds?.draw
        }
      }));
    }
  });

  // Fetch live crypto prices
  const { data: cryptoPrices = [] } = useQuery({
    queryKey: ['/api/crypto/live-prices'],
    refetchInterval: 10000,
    select: (data: any[]) => {
      return data.reduce((acc, crypto) => {
        acc[crypto.symbol] = crypto.price;
        return acc;
      }, {});
    }
  });

  // Place crypto bet mutation
  const placeBetMutation = useMutation({
    mutationFn: async (betData: CryptoBet) => {
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
        title: "Bet Placed Successfully",
        description: `Bet placed with transaction hash: ${data.transactionHash}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/bets'] });
      resetBetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Bet Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const selectedCryptoData = useMemo(() => {
    return SUPPORTED_CRYPTOS.find(crypto => crypto.symbol === selectedCrypto);
  }, [selectedCrypto]);

  const calculatePayout = useCallback(() => {
    if (!betAmount || !selectedOdds || !selectedCryptoData) return 0;
    const amount = parseFloat(betAmount);
    if (isNaN(amount)) return 0;
    return amount * selectedOdds.odds - selectedCryptoData.fee;
  }, [betAmount, selectedOdds, selectedCryptoData]);

  const calculateUSDValue = useCallback(() => {
    if (!betAmount || !cryptoPrices[selectedCrypto]) return 0;
    const amount = parseFloat(betAmount);
    if (isNaN(amount)) return 0;
    return amount * cryptoPrices[selectedCrypto];
  }, [betAmount, selectedCrypto, cryptoPrices]);

  const isValidBet = useMemo(() => {
    if (!betAmount || !selectedEvent || !selectedOdds || !connectedWallet || !selectedCryptoData) {
      return false;
    }
    const amount = parseFloat(betAmount);
    return amount >= selectedCryptoData.minBet && amount > 0;
  }, [betAmount, selectedEvent, selectedOdds, connectedWallet, selectedCryptoData]);

  const getBetOptions = useCallback((event: SportEvent): BetOption[] => {
    const options: BetOption[] = [
      {
        id: `${event.id}_home`,
        label: `${event.homeTeam} to Win`,
        odds: event.odds.home,
        probability: 1 / event.odds.home,
        payout: event.odds.home
      },
      {
        id: `${event.id}_away`,
        label: `${event.awayTeam} to Win`,
        odds: event.odds.away,
        probability: 1 / event.odds.away,
        payout: event.odds.away
      }
    ];

    if (event.odds.draw) {
      options.push({
        id: `${event.id}_draw`,
        label: 'Draw',
        odds: event.odds.draw,
        probability: 1 / event.odds.draw,
        payout: event.odds.draw
      });
    }

    return options;
  }, []);

  const handlePlaceBet = useCallback(async () => {
    if (!isValidBet || !selectedEvent || !selectedOdds || !connectedWallet) return;

    const betData: CryptoBet = {
      eventId: selectedEvent.id,
      selection: selectedOdds.label,
      amount: parseFloat(betAmount),
      cryptocurrency: selectedCrypto,
      odds: selectedOdds.odds,
      potentialPayout: calculatePayout(),
      walletAddress: connectedWallet.address
    };

    placeBetMutation.mutate(betData);
  }, [isValidBet, selectedEvent, selectedOdds, connectedWallet, betAmount, selectedCrypto, calculatePayout]);

  const resetBetForm = useCallback(() => {
    setBetAmount('');
    setSelectedOdds(null);
    setSelectedEvent(null);
  }, []);

  if (!connectedWallet) {
    return (
      <div className="space-y-6">
        <Alert className="border-blue-500 bg-blue-950/30">
          <Wallet className="h-4 w-4" />
          <AlertDescription>
            Connect your crypto wallet to start betting with cryptocurrency
          </AlertDescription>
        </Alert>
        <WalletConnector />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Status */}
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">
                Wallet Connected: {connectedWallet.address.slice(0, 8)}...
              </span>
            </div>
            <Badge variant="secondary" className="bg-green-900 text-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="place-bet" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-900">
          <TabsTrigger value="place-bet" className="text-white data-[state=active]:bg-blue-600">
            Place Bet
          </TabsTrigger>
          <TabsTrigger value="live-odds" className="text-white data-[state=active]:bg-blue-600">
            Live Odds
          </TabsTrigger>
          <TabsTrigger value="my-bets" className="text-white data-[state=active]:bg-blue-600">
            My Bets
          </TabsTrigger>
        </TabsList>

        {/* Place Bet Tab */}
        <TabsContent value="place-bet" className="space-y-6">
          {/* Event Selection */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                Select Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedEvent?.id === event.id
                          ? 'border-blue-500 bg-blue-950/30'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">
                            {event.homeTeam} vs {event.awayTeam}
                          </p>
                          <p className="text-slate-400 text-sm">{event.sport}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="border-green-500 text-green-400">
                            {event.odds.home}
                          </Badge>
                          <Badge variant="outline" className="border-red-500 text-red-400">
                            {event.odds.away}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bet Options */}
          {selectedEvent && (
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Calculator className="h-5 w-5 mr-2 text-blue-400" />
                  Betting Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getBetOptions(selectedEvent).map((option) => (
                    <div
                      key={option.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedOdds?.id === option.id
                          ? 'border-blue-500 bg-blue-950/30'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                      onClick={() => setSelectedOdds(option)}
                    >
                      <div className="text-center">
                        <p className="text-white font-semibold mb-2">{option.label}</p>
                        <Badge variant="secondary" className="bg-green-900 text-green-300 text-lg">
                          {option.odds.toFixed(2)}
                        </Badge>
                        <p className="text-slate-400 text-sm mt-1">
                          {(option.probability * 100).toFixed(1)}% probability
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bet Amount */}
          {selectedOdds && (
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Wallet className="h-5 w-5 mr-2 text-purple-400" />
                  Bet Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">Cryptocurrency</label>
                    <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {SUPPORTED_CRYPTOS.map((crypto) => (
                          <SelectItem key={crypto.symbol} value={crypto.symbol}>
                            {crypto.symbol} - {crypto.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">
                      Amount ({selectedCrypto})
                    </label>
                    <Input
                      type="number"
                      step="0.000001"
                      placeholder={`Min: ${selectedCryptoData?.minBet}`}
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                {betAmount && (
                  <div className="p-4 bg-slate-800 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">USD Value:</span>
                      <span className="text-white font-semibold">
                        ${calculateUSDValue().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Potential Payout:</span>
                      <span className="text-green-400 font-semibold">
                        {calculatePayout().toFixed(6)} {selectedCrypto}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Network Fee:</span>
                      <span className="text-red-400">
                        {selectedCryptoData?.fee} {selectedCrypto}
                      </span>
                    </div>
                    <div className="border-t border-slate-700 pt-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Net Profit:</span>
                        <span className="text-blue-400 font-bold">
                          {(calculatePayout() - parseFloat(betAmount || '0')).toFixed(6)} {selectedCrypto}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePlaceBet}
                  disabled={!isValidBet || placeBetMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700"
                >
                  {placeBetMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Placing Bet...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Place Crypto Bet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Live Odds Tab */}
        <TabsContent value="live-odds" className="space-y-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                Live Sports Odds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="p-4 border border-slate-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">
                          {event.homeTeam} vs {event.awayTeam}
                        </p>
                        <p className="text-slate-400 text-sm">{event.sport}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="border-green-500 text-green-400">
                          {event.homeTeam}: {event.odds.home}
                        </Badge>
                        <Badge variant="outline" className="border-red-500 text-red-400">
                          {event.awayTeam}: {event.odds.away}
                        </Badge>
                        {event.odds.draw && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                            Draw: {event.odds.draw}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Bets Tab */}
        <TabsContent value="my-bets">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Clock className="h-5 w-5 mr-2 text-blue-400" />
                My Crypto Bets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-slate-400">No bets placed yet</p>
                <p className="text-slate-500 text-sm mt-2">
                  Place your first crypto bet to see it here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}