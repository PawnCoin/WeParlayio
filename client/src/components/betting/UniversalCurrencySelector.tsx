import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, Bitcoin, Coins, Wallet, CreditCard, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { useBetting } from '@/contexts/BettingContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CurrencyBalance {
  currency: string;
  balance: number;
  available: number;
  pending: number;
  usdValue: number;
}

interface ExchangeRate {
  currency: string;
  usdRate: number;
  lastUpdated: string;
  change24h: number;
}

export default function UniversalCurrencySelector() {
  const { selectedCurrency, setSelectedCurrency } = useBetting();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch user balances across all currencies
  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ['/api/user/balances'],
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  // Fetch real-time exchange rates
  const { data: exchangeRates } = useQuery({
    queryKey: ['/api/exchange-rates'],
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000, // Update every minute
  });

  // Currency configuration with comprehensive support
  const currencyOptions = [
    {
      code: 'WEPARLAY',
      name: 'WeParlay Cash',
      description: 'Platform virtual currency - perfect for practice and tournaments',
      icon: <Coins className="h-5 w-5 text-blue-500" />,
      type: 'virtual',
      featured: true,
      minBet: 1,
      maxBet: 10000,
      fees: 0,
      instantTransfer: true,
      supportedBetTypes: ['all']
    },
    {
      code: 'USD',
      name: 'US Dollar',
      description: 'Real money betting with instant payouts',
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
      type: 'fiat',
      featured: true,
      minBet: 5,
      maxBet: 50000,
      fees: 2.5,
      instantTransfer: false,
      supportedBetTypes: ['all']
    },
    {
      code: 'BTC',
      name: 'Bitcoin',
      description: 'Decentralized cryptocurrency betting',
      icon: <Bitcoin className="h-5 w-5 text-orange-500" />,
      type: 'crypto',
      featured: true,
      minBet: 0.0001,
      maxBet: 10,
      fees: 1.0,
      instantTransfer: true,
      supportedBetTypes: ['all']
    },
    {
      code: 'ETH',
      name: 'Ethereum',
      description: 'Smart contract powered betting',
      icon: <Bitcoin className="h-5 w-5 text-blue-600" />,
      type: 'crypto',
      featured: true,
      minBet: 0.001,
      maxBet: 100,
      fees: 1.5,
      instantTransfer: true,
      supportedBetTypes: ['all']
    },
    {
      code: 'SOL',
      name: 'Solana',
      description: 'High-speed, low-cost crypto betting',
      icon: <Bitcoin className="h-5 w-5 text-purple-500" />,
      type: 'crypto',
      featured: false,
      minBet: 0.1,
      maxBet: 1000,
      fees: 0.5,
      instantTransfer: true,
      supportedBetTypes: ['all']
    },
    {
      code: 'USDC',
      name: 'USD Coin',
      description: 'Stable cryptocurrency pegged to USD',
      icon: <Wallet className="h-5 w-5 text-cyan-500" />,
      type: 'stablecoin',
      featured: false,
      minBet: 5,
      maxBet: 25000,
      fees: 0.8,
      instantTransfer: true,
      supportedBetTypes: ['all']
    }
  ];

  const selectedCurrencyData = currencyOptions.find(c => c.code === selectedCurrency);
  const userBalance = balances?.find((b: CurrencyBalance) => b.currency === selectedCurrency);
  const exchangeRate = exchangeRates?.find((r: ExchangeRate) => r.currency === selectedCurrency);

  const formatBalance = (balance: number, currency: string) => {
    if (currency === 'USD' || currency === 'USDC') {
      return `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === 'WEPARLAY') {
      return `${balance.toLocaleString()} WP`;
    }
    return `${balance.toFixed(currency === 'BTC' ? 8 : 4)} ${currency}`;
  };

  const getCurrencyIcon = (type: string) => {
    switch (type) {
      case 'virtual': return <Coins className="h-4 w-4" />;
      case 'fiat': return <DollarSign className="h-4 w-4" />;
      case 'crypto': return <Bitcoin className="h-4 w-4" />;
      case 'stablecoin': return <Wallet className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    const currencyData = currencyOptions.find(c => c.code === newCurrency);
    if (!currencyData) return;

    setSelectedCurrency(newCurrency);
    
    toast({
      title: 'Currency Changed',
      description: `Now betting with ${currencyData.name}`,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Universal Currency System
          </CardTitle>
          <CardDescription>
            Bet with any currency across all bet types - real money, crypto, or WeParlay Cash
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="featured">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="all">All Currencies</TabsTrigger>
            </TabsList>

            <TabsContent value="featured" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currencyOptions.filter(c => c.featured).map((currency) => {
                  const balance = balances?.find((b: CurrencyBalance) => b.currency === currency.code);
                  const rate = exchangeRates?.find((r: ExchangeRate) => r.currency === currency.code);
                  const isSelected = selectedCurrency === currency.code;

                  return (
                    <Card 
                      key={currency.code}
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleCurrencyChange(currency.code)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {currency.icon}
                            <span className="font-medium">{currency.name}</span>
                            {isSelected && <Badge>Selected</Badge>}
                          </div>
                          {getCurrencyIcon(currency.type)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {currency.description}
                        </p>

                        {isAuthenticated && balance && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Balance:</span>
                            <span className="font-medium">
                              {formatBalance(balance.available, currency.code)}
                            </span>
                          </div>
                        )}

                        {rate && currency.code !== 'USD' && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span>USD Value:</span>
                            <span className={rate.change24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                              ${rate.usdRate.toFixed(currency.code === 'BTC' ? 0 : 4)}
                              {rate.change24h !== 0 && (
                                <span className="ml-1">
                                  ({rate.change24h >= 0 ? '+' : ''}{rate.change24h.toFixed(2)}%)
                                </span>
                              )}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                          <span>Min Bet:</span>
                          <span>{formatBalance(currency.minBet, currency.code)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency">
                    {selectedCurrencyData && (
                      <div className="flex items-center gap-2">
                        {selectedCurrencyData.icon}
                        <span>{selectedCurrencyData.name}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        {currency.icon}
                        <span>{currency.name}</span>
                        <Badge variant="outline" className="ml-auto">
                          {currency.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCurrencyData && (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Currency Details</span>
                        <Badge variant="outline">{selectedCurrencyData.type}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Min Bet:</span>
                          <div className="font-medium">
                            {formatBalance(selectedCurrencyData.minBet, selectedCurrency)}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Max Bet:</span>
                          <div className="font-medium">
                            {formatBalance(selectedCurrencyData.maxBet, selectedCurrency)}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fees:</span>
                          <div className="font-medium">{selectedCurrencyData.fees}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Transfer:</span>
                          <div className="font-medium">
                            {selectedCurrencyData.instantTransfer ? 'Instant' : '1-3 days'}
                          </div>
                        </div>
                      </div>

                      {userBalance && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Your Balance:</span>
                            <span className="font-medium">
                              {formatBalance(userBalance.available, selectedCurrency)}
                            </span>
                          </div>
                          {userBalance.pending > 0 && (
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Pending:</span>
                              <span>{formatBalance(userBalance.pending, selectedCurrency)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {selectedCurrencyData?.type === 'crypto' && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Cryptocurrency betting requires a connected wallet. 
                {selectedCurrencyData.instantTransfer && ' Transactions are processed instantly on the blockchain.'}
              </AlertDescription>
            </Alert>
          )}

          {selectedCurrencyData?.code === 'USD' && (
            <Alert className="mt-4">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Real money betting is regulated and secure. All transactions are processed through licensed payment providers.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-3 border-t">
            <span>All bet types supported with any currency</span>
            <Button variant="link" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>
          </div>

          {showAdvanced && (
            <Card className="mt-3">
              <CardContent className="p-3">
                <div className="text-xs space-y-2">
                  <div className="font-medium">Supported Bet Types (All Currencies):</div>
                  <div className="text-muted-foreground">
                    • Moneyline bets • Point spreads • Over/under totals
                    • Prop bets • Parlays • Teasers • Live betting
                    • Head-to-head challenges • Tournament betting
                    • Custom bets • Future bets • Player props
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}