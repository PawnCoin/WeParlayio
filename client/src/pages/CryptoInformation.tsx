import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Bitcoin, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Shield, 
  Info, 
  Wallet,
  Zap,
  Eye,
  Lock,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  icon: string;
  volume24h: number;
  marketCap: number;
}

const CryptoInformation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basics');
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Mock crypto data with realistic pricing
  const mockCryptoData: CryptoPrice[] = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 67420.50,
      change24h: 2.34,
      icon: '₿',
      volume24h: 28500000000,
      marketCap: 1320000000000
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 3245.80,
      change24h: -1.23,
      icon: 'Ξ',
      volume24h: 15200000000,
      marketCap: 390000000000
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      price: 1.00,
      change24h: 0.01,
      icon: '₮',
      volume24h: 45000000000,
      marketCap: 96000000000
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      price: 1.00,
      change24h: -0.01,
      icon: '$',
      volume24h: 8500000000,
      marketCap: 28000000000
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: 198.45,
      change24h: 5.67,
      icon: '◎',
      volume24h: 3200000000,
      marketCap: 93000000000
    },
    {
      symbol: 'LTC',
      name: 'Litecoin',
      price: 102.33,
      change24h: 1.89,
      icon: 'Ł',
      volume24h: 890000000,
      marketCap: 7600000000
    }
  ];

  useEffect(() => {
    // Simulate loading crypto prices
    const loadCryptoPrices = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCryptoPrices(mockCryptoData);
      setIsLoading(false);
    };

    loadCryptoPrices();

    // Update prices every 30 seconds
    const interval = setInterval(() => {
      setCryptoPrices(prev => prev.map(crypto => ({
        ...crypto,
        price: crypto.price * (1 + (Math.random() - 0.5) * 0.02),
        change24h: crypto.change24h + (Math.random() - 0.5) * 0.5
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshPrices = () => {
    toast({
      title: "Refreshing Prices",
      description: "Getting latest cryptocurrency prices...",
    });

    setCryptoPrices(prev => prev.map(crypto => ({
      ...crypto,
      price: crypto.price * (1 + (Math.random() - 0.5) * 0.01),
      change24h: crypto.change24h + (Math.random() - 0.5) * 0.3
    })));
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(4)}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          Cryptocurrency on WeParlay
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Comprehensive guide to betting with cryptocurrency and managing your digital assets
        </p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Live Prices
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Shield className="h-3 w-3 mr-1" />
            Secure Trading
          </Badge>
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            <Zap className="h-3 w-3 mr-1" />
            Instant Settlements
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="supported">Live Prices</TabsTrigger>
          <TabsTrigger value="fees">Fees & Limits</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="basics">
            <div className="grid gap-6">
              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bitcoin className="h-6 w-6 text-orange-500" />
                    What is Cryptocurrency Betting?
                  </CardTitle>
                  <CardDescription>
                    Revolutionary way to bet using digital currencies with blockchain security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg">
                    Cryptocurrency betting allows you to place wagers using digital currencies like Bitcoin, Ethereum, and others. 
                    Your bets are processed on the blockchain, providing unprecedented transparency, security, and speed.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200">
                      <h3 className="font-bold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Benefits
                      </h3>
                      <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
                        <li className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Lightning-fast transactions (seconds, not days)
                        </li>
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Ultra-low fees (typically under $1)
                        </li>
                        <li className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Complete transparency on blockchain
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Enhanced privacy and security
                        </li>
                        <li className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Global accessibility 24/7
                        </li>
                      </ul>
                    </div>

                    <div className="p-6 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl border border-yellow-200">
                      <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Considerations
                      </h3>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                        <li className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Price volatility can affect bet values
                        </li>
                        <li className="flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Learning curve for beginners
                        </li>
                        <li className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          You're responsible for wallet security
                        </li>
                        <li className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Network confirmations required
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How Crypto Betting Works on WeParlay</CardTitle>
                  <CardDescription>
                    Simple 4-step process to start betting with cryptocurrency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      {
                        step: 1,
                        title: "Connect Your Wallet",
                        description: "Connect your cryptocurrency wallet (MetaMask, Coinbase Wallet, etc.) to WeParlay",
                        icon: <Wallet className="h-5 w-5" />
                      },
                      {
                        step: 2,
                        title: "Fund Your Account",
                        description: "Deposit cryptocurrency to your WeParlay balance with instant confirmation",
                        icon: <DollarSign className="h-5 w-5" />
                      },
                      {
                        step: 3,
                        title: "Place Your Bets",
                        description: "Bet using your cryptocurrency balance with real-time odds and instant settlement",
                        icon: <TrendingUp className="h-5 w-5" />
                      },
                      {
                        step: 4,
                        title: "Withdraw Winnings",
                        description: "Cash out your winnings instantly to your wallet with minimal fees",
                        icon: <CheckCircle className="h-5 w-5" />
                      }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">
                          {item.step}
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-primary">
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="supported">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Live Cryptocurrency Prices
                  </CardTitle>
                  <CardDescription>Real-time prices for supported cryptocurrencies</CardDescription>
                </div>
                <Button onClick={refreshPrices} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {cryptoPrices.map((crypto, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center font-bold text-lg text-white">
                            {crypto.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{crypto.name}</h3>
                            <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <div className="font-bold text-lg">{formatPrice(crypto.price)}</div>
                          <div className={`flex items-center gap-1 text-sm ${
                            crypto.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {crypto.change24h >= 0 ? 
                              <TrendingUp className="h-3 w-3" /> : 
                              <TrendingDown className="h-3 w-3" />
                            }
                            {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                          </div>
                        </div>

                        <div className="text-right text-sm text-muted-foreground">
                          <div>Vol: {formatMarketCap(crypto.volume24h)}</div>
                          <div>MCap: {formatMarketCap(crypto.marketCap)}</div>
                        </div>

                        <Badge variant={crypto.symbol === 'SOL' || crypto.symbol === 'LTC' ? 'secondary' : 'default'}>
                          {crypto.symbol === 'SOL' || crypto.symbol === 'LTC' ? 'Coming Soon' : 'Live'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle>Fees & Limits</CardTitle>
                <CardDescription>Transparent pricing for all cryptocurrency transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Low Fee Guarantee</AlertTitle>
                    <AlertDescription>
                      We only charge network fees - no hidden costs or markup on exchange rates.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Deposit Fees
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse border border-border">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold">Currency</th>
                            <th className="text-right py-3 px-4 font-semibold">Network Fee</th>
                            <th className="text-right py-3 px-4 font-semibold">Minimum Deposit</th>
                            <th className="text-right py-3 px-4 font-semibold">Confirmations</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { currency: 'Bitcoin (BTC)', fee: 'Dynamic (~$2-5)', min: '0.001 BTC (~$67)', conf: '3' },
                            { currency: 'Ethereum (ETH)', fee: 'Dynamic (~$1-3)', min: '0.01 ETH (~$32)', conf: '12' },
                            { currency: 'USDT (ERC-20)', fee: 'ETH Gas (~$1-3)', min: '10 USDT', conf: '12' },
                            { currency: 'USDC (ERC-20)', fee: 'ETH Gas (~$1-3)', min: '10 USDC', conf: '12' },
                            { currency: 'Solana (SOL)', fee: '~$0.01', min: '0.1 SOL (~$20)', conf: '32' },
                            { currency: 'Litecoin (LTC)', fee: '~$0.10', min: '0.1 LTC (~$10)', conf: '6' }
                          ].map((row, index) => (
                            <tr key={index} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4 font-medium">{row.currency}</td>
                              <td className="text-right py-3 px-4 text-green-600">{row.fee}</td>
                              <td className="text-right py-3 px-4">{row.min}</td>
                              <td className="text-right py-3 px-4">{row.conf}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Withdrawal Fees
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse border border-border">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold">Currency</th>
                            <th className="text-right py-3 px-4 font-semibold">WeParlay Fee</th>
                            <th className="text-right py-3 px-4 font-semibold">Minimum Withdrawal</th>
                            <th className="text-right py-3 px-4 font-semibold">Processing Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { currency: 'Bitcoin (BTC)', fee: '0.0002 BTC (~$13)', min: '0.002 BTC (~$135)', time: '10-30 min' },
                            { currency: 'Ethereum (ETH)', fee: '0.003 ETH (~$10)', min: '0.02 ETH (~$65)', time: '5-15 min' },
                            { currency: 'USDT (ERC-20)', fee: '3 USDT', min: '15 USDT', time: '5-15 min' },
                            { currency: 'USDC (ERC-20)', fee: '3 USDC', min: '15 USDC', time: '5-15 min' },
                            { currency: 'Solana (SOL)', fee: '0.01 SOL (~$2)', min: '0.2 SOL (~$40)', time: '1-3 min' },
                            { currency: 'Litecoin (LTC)', fee: '0.002 LTC (~$0.20)', min: '0.1 LTC (~$10)', time: '5-15 min' }
                          ].map((row, index) => (
                            <tr key={index} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4 font-medium">{row.currency}</td>
                              <td className="text-right py-3 px-4 text-orange-600">{row.fee}</td>
                              <td className="text-right py-3 px-4">{row.min}</td>
                              <td className="text-right py-3 px-4 text-green-600">{row.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Security Best Practices & Protection
                </CardTitle>
                <CardDescription>
                  Comprehensive security guide for cryptocurrency betting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Critical Security Notice</AlertTitle>
                  <AlertDescription className="text-red-700">
                    You are responsible for the security of your cryptocurrency wallet. WeParlay cannot recover lost private keys or stolen funds.
                    Always verify addresses and use hardware wallets for large amounts.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Wallet Security
                      </h3>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Use hardware wallets (Ledger, Trezor) for large amounts
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Never share your private keys or seed phrase
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Enable two-factor authentication on all accounts
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Keep wallet software updated to latest version
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Use strong, unique passwords for each wallet
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Transaction Safety
                      </h3>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Always verify wallet addresses before sending
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Start with small test transactions
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Wait for sufficient network confirmations
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Monitor gas fees during network congestion
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Use appropriate gas settings for urgency
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      WeParlay Security Measures
                    </h3>
                    <div className="space-y-3">
                      {[
                        { feature: 'Cold Storage', description: 'Your funds stored in offline, air-gapped wallets', status: 'active' },
                        { feature: 'Multi-Signature', description: 'Multiple approvals required for large transactions', status: 'active' },
                        { feature: 'Security Audits', description: 'Regular third-party security assessments', status: 'active' },
                        { feature: '24/7 Monitoring', description: 'Real-time threat detection and response', status: 'active' },
                        { feature: 'Insurance Coverage', description: 'Protection for platform funds and user deposits', status: 'active' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-green-800">{item.feature}</div>
                            <div className="text-sm text-green-700">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    Advanced Features
                  </CardTitle>
                  <CardDescription>
                    Professional tools for experienced cryptocurrency users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">DeFi Integration</h3>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• Yield farming with betting proceeds</li>
                        <li>• Liquidity mining opportunities</li>
                        <li>• Staking rewards for VIP members</li>
                        <li>• Cross-chain bridge support</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Trading Tools</h3>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• Real-time price charts</li>
                        <li>• Arbitrage opportunities</li>
                        <li>• Portfolio tracking</li>
                        <li>• Tax reporting integration</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regulatory Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Important Regulatory Information</AlertTitle>
                      <AlertDescription>
                        Cryptocurrency regulations vary by jurisdiction. WeParlay complies with all applicable laws and may restrict services based on your location.
                      </AlertDescription>
                    </Alert>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">KYC/AML Compliance</h4>
                        <p className="text-sm text-muted-foreground">
                          Identity verification required for withdrawals over $2,000 daily or $10,000 monthly.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Tax Responsibilities</h4>
                        <p className="text-sm text-muted-foreground">
                          You are responsible for reporting cryptocurrency gains and losses in your jurisdiction.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default CryptoInformation;