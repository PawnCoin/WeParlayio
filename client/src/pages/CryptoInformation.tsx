import React, { memo, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Wallet, 
  Shield, 
  Zap, 
  AlertTriangle, 
  Info, 
  Clock, 
  Calculator, 
  Network, 
  Fuel,
  RefreshCw
} from 'lucide-react';

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  networkFee?: number;
  confirmations?: number;
  minDeposit?: number;
  maxWithdrawal?: number;
}

interface NetworkInfo {
  name: string;
  avgGasFee: string;
  confirmationTime: string;
  securityLevel: 'High' | 'Medium' | 'Low';
  recommended: boolean;
}

// Secure network configuration data
const NETWORK_INFO: readonly NetworkInfo[] = [
  {
    name: 'Bitcoin Network',
    avgGasFee: '$8-25',
    confirmationTime: '10-60 minutes',
    securityLevel: 'High',
    recommended: true
  },
  {
    name: 'Ethereum Mainnet',
    avgGasFee: '$5-50',
    confirmationTime: '2-15 minutes',
    securityLevel: 'High',
    recommended: true
  },
  {
    name: 'Polygon',
    avgGasFee: '$0.01-0.10',
    confirmationTime: '1-5 minutes',
    securityLevel: 'High',
    recommended: true
  },
  {
    name: 'Solana',
    avgGasFee: '$0.00025',
    confirmationTime: '400ms-2 minutes',
    securityLevel: 'High',
    recommended: true
  },
  {
    name: 'Arbitrum One',
    avgGasFee: '$0.25-2',
    confirmationTime: '1-10 minutes',
    securityLevel: 'High',
    recommended: true
  }
] as const;

// Memoized loading skeleton component
const CryptoSkeleton = memo(() => (
  <div className="container mx-auto p-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 6 }, (_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
));

// Memoized crypto card component
const CryptoCard = memo(({ 
  crypto, 
  isSelected, 
  onSelect 
}: { 
  crypto: CryptoData; 
  isSelected: boolean; 
  onSelect: (symbol: string) => void;
}) => {
  const handleClick = useCallback(() => {
    onSelect(crypto.symbol);
  }, [crypto.symbol, onSelect]);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 6 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  }, []);

  const priceChangeColor = crypto.change24h >= 0 ? 'text-green-500' : 'text-red-500';
  const TrendIcon = crypto.change24h >= 0 ? TrendingUp : TrendingDown;

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="font-bold">{crypto.symbol}</span>
          <TrendIcon className={`h-4 w-4 ${priceChangeColor}`} />
        </CardTitle>
        <p className="text-sm text-slate-400 truncate">{crypto.name}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-slate-400">Price:</span>
          <span className="font-semibold text-white">{formatPrice(crypto.price)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-400">24h Change:</span>
          <span className={`text-sm font-medium ${priceChangeColor}`}>
            {crypto.change24h > 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
          </span>
        </div>
        {crypto.networkFee && (
          <div className="flex justify-between">
            <span className="text-sm text-slate-400">Network Fee:</span>
            <span className="text-sm text-white">${crypto.networkFee}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Main component with security enhancements
export default function CryptoInformation() {
  const [selectedCrypto, setSelectedCrypto] = React.useState<string>('BTC');

  // Secure data fetching with proper error handling
  const { 
    data: cryptoData = [], 
    isLoading, 
    error, 
    refetch, 
    isRefetching 
  } = useQuery({
    queryKey: ['/api/crypto/live-prices'],
    refetchInterval: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    select: (data: any) => {
      // Secure data validation and sanitization
      if (!Array.isArray(data)) return [];
      return data.filter(item => 
        item && 
        typeof item.symbol === 'string' && 
        typeof item.name === 'string' && 
        typeof item.price === 'number' && 
        !isNaN(item.price)
      );
    }
  });

  // Memoized selected crypto data with fallback
  const selectedCryptoData = useMemo(() => {
    if (!cryptoData.length) return null;
    return cryptoData.find((crypto: CryptoData) => crypto.symbol === selectedCrypto) || cryptoData[0];
  }, [cryptoData, selectedCrypto]);

  // Memoized crypto selection handler
  const handleCryptoSelect = useCallback((symbol: string) => {
    setSelectedCrypto(symbol);
  }, []);

  // Memoized refresh handler
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state with skeleton
  if (isLoading) {
    return <CryptoSkeleton />;
  }

  // Error state with retry option
  if (error || !cryptoData.length) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error ? 'Failed to load crypto data. Please try again.' : 'No crypto data available.'}
            </AlertDescription>
          </Alert>
          <Button onClick={handleRefresh} disabled={isRefetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Refreshing...' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 bg-slate-950 min-h-screen">
      {/* Enhanced header with refresh button */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-4xl font-bold text-white">Crypto Information</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefetching}
            className="border-slate-700 hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-lg text-slate-400 max-w-3xl mx-auto">
          Real-time cryptocurrency data and comprehensive gambling guide for WeParlay platform
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-900">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-blue-600">Overview</TabsTrigger>
          <TabsTrigger value="fees" className="text-white data-[state=active]:bg-blue-600">Fees & Costs</TabsTrigger>
          <TabsTrigger value="security" className="text-white data-[state=active]:bg-blue-600">Security</TabsTrigger>
          <TabsTrigger value="networks" className="text-white data-[state=active]:bg-blue-600">Networks</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Enhanced with real data */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cryptoData.map((crypto: CryptoData) => (
              <CryptoCard
                key={crypto.symbol}
                crypto={crypto}
                isSelected={selectedCrypto === crypto.symbol}
                onSelect={handleCryptoSelect}
              />
            ))}
          </div>

          {/* Selected Crypto Details */}
          {selectedCryptoData && (
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <DollarSign className="h-5 w-5 mr-2 text-blue-400" />
                  {selectedCryptoData.name} ({selectedCryptoData.symbol}) - Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center text-white">
                      <Fuel className="h-4 w-4 mr-2 text-orange-400" />
                      Transaction Costs
                    </h4>
                    <p className="text-sm text-slate-400">
                      Network Fee: ${selectedCryptoData.networkFee || 'Variable'}
                    </p>
                    <p className="text-sm text-slate-400">WeParlay Fee: 1.5%</p>
                    <p className="text-sm text-slate-400">
                      Total: ~${((selectedCryptoData.networkFee || 0) + (selectedCryptoData.price * 0.015)).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center text-white">
                      <Clock className="h-4 w-4 mr-2 text-green-400" />
                      Processing Times
                    </h4>
                    <p className="text-sm text-slate-400">
                      Confirmations: {selectedCryptoData.confirmations || 3}
                    </p>
                    <p className="text-sm text-slate-400">Deposit: 5-30 min</p>
                    <p className="text-sm text-slate-400">Withdrawal: 10-60 min</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center text-white">
                      <Wallet className="h-4 w-4 mr-2 text-purple-400" />
                      Limits
                    </h4>
                    <p className="text-sm text-slate-400">
                      Min Deposit: {selectedCryptoData.minDeposit || 0.001} {selectedCryptoData.symbol}
                    </p>
                    <p className="text-sm text-slate-400">
                      Max Withdrawal: {selectedCryptoData.maxWithdrawal || 'Unlimited'}
                    </p>
                    <p className="text-sm text-slate-400">Daily Limit: No Limit</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center text-white">
                      <Shield className="h-4 w-4 mr-2 text-blue-400" />
                      Security
                    </h4>
                    <p className="text-sm text-slate-400">Multi-sig: ✓</p>
                    <p className="text-sm text-slate-400">Cold Storage: ✓</p>
                    <p className="text-sm text-slate-400">Insurance: ✓</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Fees Tab - Streamlined and secure */}
        <TabsContent value="fees" className="space-y-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Calculator className="h-5 w-5 mr-2 text-green-400" />
                Fee Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Deposit Fees</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Standard Deposits:</span>
                      <span className="text-green-400 font-semibold">0% (Free)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Express Deposits:</span>
                      <span className="text-yellow-400">1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Network Fees:</span>
                      <span className="text-slate-300">Variable</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Withdrawal Fees</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bitcoin:</span>
                      <span className="text-slate-300">0.0005 BTC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ethereum:</span>
                      <span className="text-slate-300">0.005 ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Stablecoins:</span>
                      <span className="text-slate-300">$5 flat</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Shield className="h-5 w-5 mr-2 text-blue-400" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Multi-signature Wallets</span>
                  <Badge variant="secondary" className="bg-green-900 text-green-300">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cold Storage</span>
                  <Badge variant="secondary" className="bg-green-900 text-green-300">95%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Insurance Coverage</span>
                  <Badge variant="secondary" className="bg-green-900 text-green-300">Full</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Regular Audits</span>
                  <Badge variant="secondary" className="bg-green-900 text-green-300">Monthly</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Uptime</span>
                  <span className="text-green-400 font-semibold">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Avg Response Time</span>
                  <span className="text-green-400 font-semibold">&lt;100ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Daily Volume</span>
                  <span className="text-blue-400 font-semibold">$2.5M+</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Networks Tab */}
        <TabsContent value="networks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {NETWORK_INFO.map((network) => (
              <Card key={network.name} className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <span className="text-sm">{network.name}</span>
                    {network.recommended && (
                      <Badge variant="secondary" className="bg-blue-900 text-blue-300">Recommended</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Gas Fee:</span>
                    <span className="text-white text-sm">{network.avgGasFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Confirmation:</span>
                    <span className="text-white text-sm">{network.confirmationTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Security:</span>
                    <Badge 
                      variant="secondary" 
                      className={
                        network.securityLevel === 'High' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-yellow-900 text-yellow-300'
                      }
                    >
                      {network.securityLevel}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}