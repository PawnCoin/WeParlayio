import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coins, TrendingUp, TrendingDown, ExternalLink, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PawnCoinData {
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  totalSupply: number;
  circulatingSupply: number;
}

interface PawnCoinIntegrationProps {
  onBetPlaced?: (amount: number, transactionHash: string) => void;
  betAmount?: number;
  eventId?: string;
  selection?: string;
  odds?: number;
}

export default function PawnCoinIntegration({ 
  onBetPlaced, 
  betAmount = 0, 
  eventId, 
  selection, 
  odds 
}: PawnCoinIntegrationProps) {
  const [amount, setAmount] = useState<string>(betAmount.toString());
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Contract address for Pawn Coin
  const PAWN_COIN_CONTRACT = '0x2Fe269292f74F0a98C5786088317B4f86313C211';

  // Fetch Pawn Coin data
  const { data: pawnCoinData, isLoading } = useQuery<PawnCoinData>({
    queryKey: ['/api/crypto/pawncoin'],
    refetchInterval: 30000,
  });

  // Place crypto bet mutation
  const placeBetMutation = useMutation({
    mutationFn: async (betData: any) => {
      const response = await fetch('/api/crypto/place-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to place crypto bet');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bet Placed Successfully",
        description: `Your $Pc bet has been placed. Transaction: ${data.transactionHash?.substring(0, 10)}...`,
      });
      
      if (onBetPlaced) {
        onBetPlaced(parseFloat(amount), data.transactionHash);
      }
      
      setAmount('');
    },
    onError: (error: any) => {
      toast({
        title: "Bet Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Connect MetaMask wallet
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        
        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`,
        });
      } catch (error) {
        toast({
          title: "Connection Failed",
          description: "Failed to connect wallet",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use Pawn Coin",
        variant: "destructive",
      });
    }
  };

  // Add Pawn Coin token to MetaMask
  const addTokenToWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: PAWN_COIN_CONTRACT,
              symbol: '$Pc',
              decimals: 18,
              image: 'https://pawncoinpc.com/logo.png',
            },
          },
        });
        
        toast({
          title: "Token Added",
          description: "Pawn Coin ($Pc) has been added to your wallet",
        });
      } catch (error) {
        toast({
          title: "Failed to Add Token",
          description: "Could not add Pawn Coin to your wallet",
          variant: "destructive",
        });
      }
    }
  };

  // Handle bet placement
  const handlePlaceBet = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }

    const betData = {
      eventId,
      selection,
      amount: parseFloat(amount),
      cryptocurrency: '$Pc',
      odds,
      walletAddress,
      betType: 'crypto',
      potentialPayout: parseFloat(amount) * (odds ? Math.abs(odds / 100) + 1 : 2),
    };

    placeBetMutation.mutate(betData);
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-amber-900 to-amber-700 border-amber-600">
        <CardContent className="p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-amber-600 h-12 w-12"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-amber-600 rounded w-3/4"></div>
              <div className="h-4 bg-amber-600 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pawn Coin Market Data */}
      <Card className="bg-gradient-to-br from-amber-900 to-amber-700 border-amber-600">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Coins className="mr-2 text-amber-300" />
            Pawn Coin ($Pc) Live Data
          </CardTitle>
        </CardHeader>
        <CardContent className="text-white">
          {pawnCoinData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-amber-200 text-sm">Price</p>
                <p className="text-xl font-bold">${pawnCoinData.price.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-amber-200 text-sm">24h Change</p>
                <p className={`text-lg font-bold flex items-center ${
                  pawnCoinData.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {pawnCoinData.change24h >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {pawnCoinData.change24h.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-amber-200 text-sm">Market Cap</p>
                <p className="text-lg font-bold">${pawnCoinData.marketCap.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-amber-200 text-sm">24h Volume</p>
                <p className="text-lg font-bold">${pawnCoinData.volume24h.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Loading Pawn Coin market data...
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2 mt-4">
            <Button
              onClick={addTokenToWallet}
              variant="outline"
              size="sm"
              className="bg-amber-800 hover:bg-amber-700 border-amber-600 text-white"
            >
              Add to Wallet
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-amber-800 hover:bg-amber-700 border-amber-600 text-white"
              onClick={() => window.open(`https://etherscan.io/token/${PAWN_COIN_CONTRACT}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View Contract
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Betting Interface */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Wallet className="mr-2 text-amber-400" />
            Bet with Pawn Coin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wallet Connection */}
          {!isConnected ? (
            <Button 
              onClick={connectWallet}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect MetaMask Wallet
            </Button>
          ) : (
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-green-400 text-sm">Wallet Connected</span>
              <Badge variant="outline" className="text-amber-400 border-amber-400">
                {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
              </Badge>
            </div>
          )}

          {/* Bet Amount Input */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Bet Amount ($Pc)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in $Pc"
              className="bg-slate-800 border-slate-600 text-white"
              min="0"
              step="0.01"
            />
            {pawnCoinData && amount && (
              <p className="text-slate-400 text-sm">
                ≈ ${(parseFloat(amount) * pawnCoinData.price).toFixed(4)} USD
              </p>
            )}
          </div>

          {/* Bet Details */}
          {selection && odds && (
            <div className="p-3 bg-slate-800 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Selection:</span>
                <span className="text-white">{selection}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Odds:</span>
                <span className="text-white">{odds > 0 ? '+' : ''}{odds}</span>
              </div>
              {amount && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Potential Payout:</span>
                  <span className="text-green-400 font-medium">
                    {(parseFloat(amount) * (Math.abs(odds / 100) + 1)).toFixed(4)} $Pc
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Place Bet Button */}
          <Button
            onClick={handlePlaceBet}
            disabled={!isConnected || !amount || parseFloat(amount) <= 0 || placeBetMutation.isPending}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
          >
            {placeBetMutation.isPending ? (
              'Placing Bet...'
            ) : (
              `Place Bet ${amount ? `(${amount} $Pc)` : ''}`
            )}
          </Button>

          {/* Contract Info */}
          <div className="text-xs text-slate-500 space-y-1">
            <p>Contract: {PAWN_COIN_CONTRACT}</p>
            <p>Network: Ethereum Mainnet</p>
            <p>All transactions are secured by blockchain technology</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}