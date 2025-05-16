import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Wallet, AlertCircle, Check, RefreshCw, Share, TrendingUp } from 'lucide-react';
import CryptoSelector from './CryptoSelector';
import WalletConnect from './WalletConnect';
import ShareBetCard from './ShareBetCard';
import TokenPriceChart from './TokenPriceChart';
import { useToast } from '@/hooks/use-toast';

interface CryptoBetFormProps {
  odds: number;
  totalStake?: number;
  potentialPayout?: number;
  onPlaceBet?: (betData: any) => void;
  isParlay?: boolean;
}

const CryptoBetForm: React.FC<CryptoBetFormProps> = ({
  odds,
  totalStake = 0,
  potentialPayout = 0,
  onPlaceBet,
  isParlay = false
}) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedCrypto, setSelectedCrypto] = useState<any>(null);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletInfo, setWalletInfo] = useState<{ address: string; type: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [useBoost, setUseBoost] = useState<boolean>(false);
  const [showShareCard, setShowShareCard] = useState<boolean>(false);
  const [lastBetData, setLastBetData] = useState<any>(null);
  const [exchangeRates, setExchangeRates] = useState<{[key: string]: number}>({
    bitcoin: 67500,
    ethereum: 3300,
    binancecoin: 600,
    weplaytoken: 0.15 // Custom rate for your token
  });
  
  // Calculate payout based on selected crypto
  const calculateCryptoPayout = () => {
    if (!selectedCrypto || !amount) return 0;
    
    const amountNum = parseFloat(amount) || 0;
    const cryptoRate = exchangeRates[selectedCrypto.id] || 1;
    const usdAmount = amountNum * cryptoRate;
    
    // Apply 5% boost if using WEPT token and boost is enabled
    const boostMultiplier = (selectedCrypto.id === 'weplaytoken' && useBoost) ? 1.05 : 1;
    
    return (usdAmount * odds * boostMultiplier) / cryptoRate;
  };
  
  // Format crypto amount to 8 decimal places max
  const formatCryptoAmount = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  };
  
  // Handle wallet connection
  const handleWalletConnect = (wallet: { address: string; type: string }) => {
    setWalletInfo(wallet);
    setWalletConnected(true);
    
    toast({
      title: "Wallet Connected",
      description: `Successfully connected to ${wallet.type}`,
    });
  };
  
  // Handle wallet disconnection
  const handleWalletDisconnect = () => {
    setWalletInfo(null);
    setWalletConnected(false);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };
  
  // Handle quick amount selection
  const handleAmountSelect = (amount: string) => {
    setAmount(amount);
    setCustomAmount('');
  };
  
  // Handle custom amount input
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val) || val === '') {
      setCustomAmount(val);
      setAmount(val);
    }
  };
  
  // Handle placing bet
  const handlePlaceBet = async () => {
    if (!selectedCrypto || !amount || !walletConnected) {
      toast({
        title: "Cannot Place Bet",
        description: "Please connect your wallet, select a cryptocurrency, and enter an amount",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const betData = {
        cryptoId: selectedCrypto.id,
        cryptoSymbol: selectedCrypto.symbol,
        amount: parseFloat(amount),
        odds,
        potentialPayout: calculateCryptoPayout(),
        walletAddress: walletInfo?.address,
        timestamp: new Date().toISOString(),
        useBoost,
        isParlay
      };
      
      if (onPlaceBet) {
        onPlaceBet(betData);
      }
      
      // Store the bet data to show in share card
      setLastBetData(betData);
      
      // Show special toast for WePlay Token bets
      if (selectedCrypto.id === 'weplaytoken') {
        toast({
          title: "WePlay Token Bet Placed!",
          description: `Your ${amount} WEPT bet was placed successfully! Share and earn rewards`,
        });
        
        // Show the share card automatically for WePlay Token bets
        setShowShareCard(true);
      } else {
        toast({
          title: "Bet Placed Successfully!",
          description: `You've placed a bet of ${amount} ${selectedCrypto.symbol}`,
        });
        
        // For other cryptos, also show share card but with delay
        setTimeout(() => setShowShareCard(true), 1000);
      }
      
      // Reset form fields but keep selected crypto
      setAmount('');
      setCustomAmount('');
    } catch (error) {
      toast({
        title: "Failed to Place Bet",
        description: "An error occurred while placing your bet. Please try again.",
        variant: "destructive"
      });
      console.error("Bet error:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Simulated exchange rate updater
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate small random price fluctuations
      setExchangeRates(prev => {
        const newRates = {...prev};
        Object.keys(newRates).forEach(key => {
          const change = (Math.random() - 0.5) * 0.01; // -0.5% to +0.5%
          newRates[key] = newRates[key] * (1 + change);
        });
        return newRates;
      });
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className="w-full bg-white dark:bg-gray-900 border-green-200 dark:border-green-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Wallet className="h-5 w-5 mr-2 text-green-600" />
          Crypto Betting
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Wallet Connection Section */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">1. Connect Wallet</h3>
          <WalletConnect 
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
          />
        </div>
        
        <Separator />
        
        {/* Cryptocurrency Selection */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">2. Select Cryptocurrency</h3>
          <CryptoSelector 
            onSelect={setSelectedCrypto}
            selectedCrypto={selectedCrypto}
          />
          
          {selectedCrypto && (
            <>
              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="text-gray-500">Current Rate:</span>
                  <Badge variant="outline" className="ml-2">
                    1 {selectedCrypto.symbol} = ${exchangeRates[selectedCrypto.id]?.toLocaleString() || 'N/A'}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    toast({
                      title: "Rates Updated",
                      description: "Latest cryptocurrency rates loaded",
                    });
                  }}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Show price chart for WePlay Token */}
              {selectedCrypto.id === 'weplaytoken' && (
                <div className="mt-3">
                  <TokenPriceChart 
                    tokenId={selectedCrypto.id}
                    tokenSymbol={selectedCrypto.symbol}
                    currentPrice={exchangeRates[selectedCrypto.id] || 0.15}
                    onChange={(newPrice) => {
                      setExchangeRates(prev => ({
                        ...prev,
                        [selectedCrypto.id]: newPrice
                      }));
                    }}
                  />
                </div>
              )}
            </>
          )}
          
          {/* Special boost for WePlay Token */}
          {selectedCrypto && selectedCrypto.id === 'weplaytoken' && (
            <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200 dark:border-orange-800 flex items-center justify-between">
              <div className="flex items-center">
                <Badge className="mr-2 bg-orange-500">BONUS</Badge>
                <span className="text-sm font-medium">5% Odds Boost with WEPT</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="use-boost"
                  checked={useBoost}
                  onCheckedChange={setUseBoost}
                />
                <Label htmlFor="use-boost" className="text-xs">
                  {useBoost ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Bet Amount Section */}
        <div>
          <h3 className="text-sm font-medium mb-2">3. Enter Amount</h3>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {['0.001', '0.01', '0.1', '1'].map((amt) => (
              <Button
                key={amt}
                variant={amount === amt ? "default" : "outline"}
                className={amount === amt ? "bg-green-600 hover:bg-green-700" : ""}
                size="sm"
                onClick={() => handleAmountSelect(amt)}
                disabled={!selectedCrypto || !walletConnected}
              >
                {amt}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Input
                placeholder={`Custom amount (${selectedCrypto?.symbol || 'Crypto'})`}
                value={customAmount}
                onChange={handleCustomAmountChange}
                disabled={!selectedCrypto || !walletConnected}
                className="pr-16"
              />
              {selectedCrypto && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {selectedCrypto.symbol}
                </div>
              )}
            </div>
          </div>
          
          {!walletConnected && (
            <div className="mt-2 text-sm text-amber-600 dark:text-amber-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Please connect your wallet first
            </div>
          )}
        </div>
        
        {/* Bet Summary */}
        {selectedCrypto && amount && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Betting with:</span>
              <span className="font-semibold">{selectedCrypto.symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount:</span>
              <span className="font-semibold">{amount} {selectedCrypto.symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Odds:</span>
              <span className="font-semibold">{useBoost && selectedCrypto.id === 'weplaytoken' ? (odds * 1.05).toFixed(2) : odds.toFixed(2)}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-sm font-bold">
              <span className="text-gray-700 dark:text-gray-300">Potential Payout:</span>
              <span className="text-green-600">{formatCryptoAmount(calculateCryptoPayout())} {selectedCrypto.symbol}</span>
            </div>
            {useBoost && selectedCrypto.id === 'weplaytoken' && (
              <div className="text-xs text-orange-600 dark:text-orange-400 text-right">
                Includes 5% WEPT Boost
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex-col gap-4">
        <Button 
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={!walletConnected || !selectedCrypto || !amount || isProcessing}
          onClick={handlePlaceBet}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <DollarSign className="mr-2 h-4 w-4" />
              Place Bet with Crypto
            </>
          )}
        </Button>
        
        {/* Show share card after successful bet placement */}
        {showShareCard && lastBetData && (
          <div className="w-full mt-4">
            <ShareBetCard betData={{...lastBetData, selections: []}} />
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 w-full text-xs"
              onClick={() => setShowShareCard(false)}
            >
              Hide Share Options
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default CryptoBetForm;