
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Alert, AlertDescription } from '../components/ui/alert';
import { TrendingUp, TrendingDown, DollarSign, Activity, Wallet, Shield, Zap, AlertTriangle, Info, Clock, Calculator, Network, Fuel } from 'lucide-react';

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

export default function CryptoInformation() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTC');

  // Fetch real crypto data on component mount
  useEffect(() => {
    const fetchRealCryptoData = async () => {
      try {
        const response = await fetch('/api/crypto/live-prices');
        const data = await response.json();
        setCryptoData(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch real crypto data:', error);
        setError('Failed to load crypto data');
        setLoading(false);
      }
    };
    
    fetchRealCryptoData();
    const interval = setInterval(fetchRealCryptoData, 30000);
    return () => clearInterval(interval);
  }, []);

  const networkInfo: NetworkInfo[] = [
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
  ];

  // Real crypto data loaded via the useEffect above

  const getSelectedCryptoData = () => {
    return cryptoData.find((crypto: any) => crypto.symbol === selectedCrypto) || cryptoData[0];
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Comprehensive Crypto Gambling Guide</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Everything you need to know about cryptocurrency gambling on WeParlay - from beginner basics to professional strategies, fees, and advanced features.
        </p>
        {error && (
          <Alert className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fees">Fees & Costs</TabsTrigger>
          <TabsTrigger value="beginner">Beginner Guide</TabsTrigger>
          <TabsTrigger value="professional">Pro Features</TabsTrigger>
          <TabsTrigger value="technical">Technical Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cryptoData.map((crypto: any) => (
              <Card 
                key={crypto.symbol} 
                className={`cursor-pointer transition-all hover:shadow-lg ${selectedCrypto === crypto.symbol ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedCrypto(crypto.symbol)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>{crypto.symbol}</span>
                    <div className="flex items-center">
                      {crypto.change24h >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{crypto.name}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Price:</span>
                    <span className="font-semibold">${crypto.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Network Fee:</span>
                    <span className="text-sm">${crypto.networkFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Min Deposit:</span>
                    <span className="text-sm">{crypto.minDeposit} {crypto.symbol}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Crypto Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                {getSelectedCryptoData().name} ({getSelectedCryptoData().symbol}) - Gambling Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center">
                    <Fuel className="h-4 w-4 mr-2" />
                    Transaction Costs
                  </h4>
                  <p className="text-sm text-muted-foreground">Network Fee: ${getSelectedCryptoData().networkFee}</p>
                  <p className="text-sm text-muted-foreground">WeParlay Fee: 1.5%</p>
                  <p className="text-sm text-muted-foreground">Total Cost: ~${(getSelectedCryptoData().networkFee! + (getSelectedCryptoData().price * 0.015)).toFixed(2)}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Processing Times
                  </h4>
                  <p className="text-sm text-muted-foreground">Confirmations: {getSelectedCryptoData().confirmations}</p>
                  <p className="text-sm text-muted-foreground">Deposit Time: 5-30 min</p>
                  <p className="text-sm text-muted-foreground">Withdrawal Time: 10-60 min</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center">
                    <Wallet className="h-4 w-4 mr-2" />
                    Limits
                  </h4>
                  <p className="text-sm text-muted-foreground">Min Deposit: {getSelectedCryptoData().minDeposit} {getSelectedCryptoData().symbol}</p>
                  <p className="text-sm text-muted-foreground">Max Withdrawal: {getSelectedCryptoData().maxWithdrawal} {getSelectedCryptoData().symbol}</p>
                  <p className="text-sm text-muted-foreground">Daily Limit: Unlimited</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </h4>
                  <p className="text-sm text-muted-foreground">Multi-sig Wallet: ✓</p>
                  <p className="text-sm text-muted-foreground">Cold Storage: ✓</p>
                  <p className="text-sm text-muted-foreground">Insurance: ✓</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees & Costs Tab */}
        <TabsContent value="fees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Complete Fee Structure
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Transparent breakdown of all costs associated with crypto gambling on WeParlay
              </p>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="deposit-fees">
                  <AccordionTrigger>Deposit Fees</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Network Fees (Paid to Blockchain)</h4>
                          <ul className="space-y-1 text-sm">
                            <li>Bitcoin: $8-25 (varies by network congestion)</li>
                            <li>Ethereum: $5-50 (varies by gas price)</li>
                            <li>Solana: $0.00025 (nearly free)</li>
                            <li>Polygon: $0.01-0.10 (very low)</li>
                            <li>USDC/USDT: Same as network fee</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">WeParlay Processing Fees</h4>
                          <ul className="space-y-1 text-sm">
                            <li>Standard Deposits: 0% (We cover the cost)</li>
                            <li>Express Deposits: 1% (Instant credit)</li>
                            <li>Large Deposits (&gt;$10,000): 0.5%</li>
                            <li>VIP Members: 0% on all deposits</li>
                          </ul>
                        </div>
                      </div>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Pro Tip: Use Polygon or Solana for minimal fees. Bitcoin and Ethereum fees vary greatly based on network congestion.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="withdrawal-fees">
                  <AccordionTrigger>Withdrawal Fees</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Standard Withdrawals</h4>
                          <ul className="space-y-1 text-sm">
                            <li>Bitcoin: 0.0005 BTC (~$21.50)</li>
                            <li>Ethereum: 0.005 ETH (~$12.90)</li>
                            <li>Solana: 0.01 SOL (~$1.25)</li>
                            <li>USDC: $5 flat fee</li>
                            <li>Processing Time: 1-6 hours</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Priority Withdrawals</h4>
                          <ul className="space-y-1 text-sm">
                            <li>Additional 50% fee on top of standard</li>
                            <li>Processing Time: 10-30 minutes</li>
                            <li>Available 24/7</li>
                            <li>Guaranteed execution</li>
                          </ul>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <h4 className="font-semibold mb-2">VIP Withdrawal Benefits</h4>
                        <ul className="space-y-1 text-sm">
                          <li>✓ 3 free withdrawals per month</li>
                          <li>✓ 50% reduction on all fees after free limit</li>
                          <li>✓ Priority processing for all withdrawals</li>
                          <li>✓ Higher daily/monthly limits</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="betting-fees">
                  <AccordionTrigger>Betting & Gaming Fees</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Sports Betting</h4>
                          <ul className="space-y-1 text-sm">
                            <li>Standard Bets: 0% (Built into odds)</li>
                            <li>Live Betting: 0% (Built into odds)</li>
                            <li>Parlays: 0% (Built into odds)</li>
                            <li>Props: 0% (Built into odds)</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Exchange Rate</h4>
                          <ul className="space-y-1 text-sm">
                            <li>Spread: 0.5% (Industry standard)</li>
                            <li>Real-time rates from CoinGecko</li>
                            <li>Rate locked at bet confirmation</li>
                            <li>No hidden markups</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Special Features</h4>
                          <ul className="space-y-1 text-sm">
                            <li>WePlay Token Boost: 5% odds improvement</li>
                            <li>Crypto-only promotions available</li>
                            <li>Staking rewards for holding WPT</li>
                            <li>Reduced juice on crypto bets</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Network Fee Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="h-5 w-5 mr-2" />
                Network Comparison for Gambling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {networkInfo.map((network, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${network.recommended ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{network.name}</h4>
                      {network.recommended && (
                        <Badge className="bg-green-500">Recommended</Badge>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Avg Fee:</span>
                        <span className="font-medium">{network.avgGasFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Speed:</span>
                        <span className="font-medium">{network.confirmationTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Security:</span>
                        <Badge variant={network.securityLevel === 'High' ? 'default' : 'secondary'}>
                          {network.securityLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Beginner Guide Tab */}
        <TabsContent value="beginner" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Crypto Gambling for Beginners
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Step-by-step guide to get started with cryptocurrency gambling safely and efficiently
              </p>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="step-1">
                  <AccordionTrigger>Step 1: Understanding Cryptocurrency Basics</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          New to crypto? Don't worry! WeParlay makes it easy to get started with comprehensive guides and 24/7 support.
                        </AlertDescription>
                      </Alert>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">What is Cryptocurrency?</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Digital money secured by blockchain technology</li>
                            <li>• No central authority (like banks) controlling it</li>
                            <li>• Transactions are recorded on a public ledger</li>
                            <li>• Provides privacy and fast international transfers</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Why Use Crypto for Gambling?</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Faster deposits and withdrawals</li>
                            <li>• Lower fees compared to traditional banking</li>
                            <li>• Enhanced privacy and security</li>
                            <li>• Access to crypto-exclusive bonuses</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-2">
                  <AccordionTrigger>Step 2: Choosing Your First Cryptocurrency</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                          <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">🥇 Best for Beginners: USDC</h4>
                          <ul className="space-y-1 text-sm">
                            <li>✓ Stable value (always $1)</li>
                            <li>✓ No price volatility to worry about</li>
                            <li>✓ Easy to understand and track</li>
                            <li>✓ Low fees on most networks</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                          <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">🥈 Great Option: Solana (SOL)</h4>
                          <ul className="space-y-1 text-sm">
                            <li>✓ Extremely low fees (~$0.00025)</li>
                            <li>✓ Very fast transactions</li>
                            <li>✓ Growing ecosystem</li>
                            <li>⚠ Price can fluctuate</li>
                          </ul>
                        </div>
                      </div>
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Avoid Bitcoin and Ethereum as a beginner due to high and unpredictable fees. Start with stablecoins like USDC or low-fee networks like Solana.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-3">
                  <AccordionTrigger>Step 3: Setting Up Your Wallet</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">🦊 MetaMask</h4>
                          <p className="text-sm text-muted-foreground mb-2">Best for Ethereum & Layer 2s</p>
                          <ul className="space-y-1 text-xs">
                            <li>• Browser extension</li>
                            <li>• Mobile app available</li>
                            <li>• Supports multiple networks</li>
                            <li>• Easy to use interface</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">👻 Phantom</h4>
                          <p className="text-sm text-muted-foreground mb-2">Best for Solana</p>
                          <ul className="space-y-1 text-xs">
                            <li>• Solana-focused wallet</li>
                            <li>• Ultra-low fees</li>
                            <li>• Fast transactions</li>
                            <li>• User-friendly design</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">🏦 Coinbase Wallet</h4>
                          <p className="text-sm text-muted-foreground mb-2">Best for beginners</p>
                          <ul className="space-y-1 text-xs">
                            <li>• Connected to Coinbase exchange</li>
                            <li>• Easy to buy crypto</li>
                            <li>• Strong security features</li>
                            <li>• 24/7 customer support</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-4">
                  <AccordionTrigger>Step 4: Making Your First Deposit</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <h4 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">⚠️ Important Security Checklist</h4>
                        <ul className="space-y-1 text-sm">
                          <li>✓ Double-check the deposit address</li>
                          <li>✓ Start with a small test transaction</li>
                          <li>✓ Ensure you're on the correct network</li>
                          <li>✓ Save your transaction hash for tracking</li>
                        </ul>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold">Deposit Process:</h4>
                          <ol className="list-decimal pl-5 space-y-1 text-sm">
                            <li>Connect your wallet to WeParlay</li>
                            <li>Go to "Deposit" in your account</li>
                            <li>Select your cryptocurrency</li>
                            <li>Copy the provided deposit address</li>
                            <li>Send from your wallet to this address</li>
                            <li>Wait for confirmations (5-30 minutes)</li>
                          </ol>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold">Recommended First Deposit:</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Amount: $25-100 to start</li>
                            <li>• Cryptocurrency: USDC for stability</li>
                            <li>• Network: Polygon for low fees</li>
                            <li>• Test bet: $5-10 to learn the interface</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Features Tab */}
        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Professional Crypto Gambling Features
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Advanced tools and features for experienced crypto gamblers and high-volume players
              </p>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="advanced-features">
                  <AccordionTrigger>Advanced Trading & Arbitrage Tools</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Real-Time Analytics</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            <span>Live odds movement tracking across multiple sportsbooks</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            <span>Arbitrage opportunity alerts with profit calculations</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            <span>Historical odds data and pattern analysis</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            <span>ROI tracking by sport, league, and bet type</span>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold">Automated Features</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            <span>Auto-betting with custom strategy rules</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            <span>Stop-loss and take-profit automation</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            <span>Portfolio rebalancing based on performance</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            <span>Custom webhook notifications for API integration</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="liquidity">
                  <AccordionTrigger>Liquidity & Market Making</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2 text-purple-600 dark:text-purple-400">Peer-to-Peer Betting</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Create your own betting markets</li>
                            <li>• Set custom odds and terms</li>
                            <li>• Earn commission as market maker</li>
                            <li>• Direct player-vs-player wagering</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2 text-orange-600 dark:text-orange-400">Liquidity Mining</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Provide liquidity to betting pools</li>
                            <li>• Earn WePlay Tokens as rewards</li>
                            <li>• Share in house edge profits</li>
                            <li>• Lock-up periods with bonus APY</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">Cross-Exchange Arbitrage</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Real-time price comparison</li>
                            <li>• Automated arbitrage execution</li>
                            <li>• Multi-exchange account linking</li>
                            <li>• Risk-free profit opportunities</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="risk-management">
                  <AccordionTrigger>Advanced Risk Management</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Portfolio Analytics</h4>
                          <div className="p-4 border rounded-lg">
                            <ul className="space-y-2 text-sm">
                              <li>• Sharpe ratio calculation for betting strategies</li>
                              <li>• Value at Risk (VaR) modeling</li>
                              <li>• Kelly Criterion position sizing</li>
                              <li>• Correlation analysis between different sports</li>
                              <li>• Monte Carlo simulation for strategy testing</li>
                            </ul>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-semibold">Risk Controls</h4>
                          <div className="p-4 border rounded-lg">
                            <ul className="space-y-2 text-sm">
                              <li>• Daily/weekly/monthly loss limits</li>
                              <li>• Maximum bet size per event</li>
                              <li>• Cooling-off periods after losses</li>
                              <li>• Automatic account suspension triggers</li>
                              <li>• Multi-signature wallet requirements</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="vip-benefits">
                  <AccordionTrigger>VIP & High Roller Benefits</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20">
                          <h4 className="font-semibold mb-2 text-yellow-700 dark:text-yellow-300">Gold Tier ($10K+ Volume)</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• 1 free withdrawal/month</li>
                            <li>• 25% reduced fees</li>
                            <li>• Priority customer support</li>
                            <li>• Higher betting limits</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                          <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Platinum Tier ($50K+ Volume)</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• 3 free withdrawals/month</li>
                            <li>• 50% reduced fees</li>
                            <li>• Dedicated account manager</li>
                            <li>• Custom betting limits</li>
                            <li>• Access to exclusive markets</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
                          <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Diamond Tier ($250K+ Volume)</h4>
                          <ul className="space-y-1 text-sm">
                            <li>• Unlimited free withdrawals</li>
                            <li>• Zero platform fees</li>
                            <li>• White-glove service</li>
                            <li>• Market making opportunities</li>
                            <li>• Revenue sharing programs</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Details Tab */}
        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="h-5 w-5 mr-2" />
                Technical Infrastructure & Security
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Deep dive into WeParlay's technical implementation, security measures, and blockchain integrations
              </p>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="blockchain-integration">
                  <AccordionTrigger>Blockchain Integration Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Supported Networks</h4>
                          <div className="space-y-3">
                            <div className="p-3 border rounded">
                              <h5 className="font-medium">Ethereum Mainnet</h5>
                              <p className="text-sm text-muted-foreground">RPC: Infura + Alchemy redundancy</p>
                              <p className="text-sm text-muted-foreground">Gas Strategy: EIP-1559 with automatic optimization</p>
                            </div>
                            <div className="p-3 border rounded">
                              <h5 className="font-medium">Polygon</h5>
                              <p className="text-sm text-muted-foreground">RPC: QuickNode + Polygon official</p>
                              <p className="text-sm text-muted-foreground">Gas Strategy: Dynamic pricing with 1 GWEI minimum</p>
                            </div>
                            <div className="p-3 border rounded">
                              <h5 className="font-medium">Solana</h5>
                              <p className="text-sm text-muted-foreground">RPC: Solana Labs + GenesysGo</p>
                              <p className="text-sm text-muted-foreground">Commitment Level: Confirmed for speed, Finalized for security</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-semibold">Smart Contract Architecture</h4>
                          <div className="space-y-3">
                            <div className="p-3 border rounded">
                              <h5 className="font-medium">Betting Contract</h5>
                              <p className="text-sm text-muted-foreground">Multi-sig controlled with 3/5 threshold</p>
                              <p className="text-sm text-muted-foreground">Upgradeable proxy pattern for security patches</p>
                            </div>
                            <div className="p-3 border rounded">
                              <h5 className="font-medium">Treasury Management</h5>
                              <p className="text-sm text-muted-foreground">Time-locked withdrawals for large amounts</p>
                              <p className="text-sm text-muted-foreground">Multi-party computation for key management</p>
                            </div>
                            <div className="p-3 border rounded">
                              <h5 className="font-medium">Oracle Integration</h5>
                              <p className="text-sm text-muted-foreground">Chainlink VRF for provably fair outcomes</p>
                              <p className="text-sm text-muted-foreground">Multiple oracle consensus for price feeds</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="security-measures">
                  <AccordionTrigger>Security & Audit Information</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-3 text-green-600 dark:text-green-400">Smart Contract Security</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Audited by ConsenSys Diligence
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Formal verification using Certora
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Bug bounty program ($50K max)
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Open source contracts
                            </li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">Infrastructure Security</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              AWS SOC 2 Type II compliance
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              End-to-end encryption (TLS 1.3)
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              Hardware Security Modules
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              Real-time threat monitoring
                            </li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-3 text-purple-600 dark:text-purple-400">Operational Security</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                              95% funds in cold storage
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                              Multi-geographic backups
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                              24/7 security operations center
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                              Incident response team
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="api-integration">
                  <AccordionTrigger>API & Developer Integration</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold">RESTful API Endpoints</h4>
                          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm">
                            <div className="space-y-1">
                              <div><span className="text-green-600">GET</span> /api/v1/markets</div>
                              <div><span className="text-blue-600">POST</span> /api/v1/bets</div>
                              <div><span className="text-green-600">GET</span> /api/v1/odds/:eventId</div>
                              <div><span className="text-orange-600">PUT</span> /api/v1/wallet/balance</div>
                              <div><span className="text-green-600">GET</span> /api/v1/history/:userId</div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Rate limits: 1000 requests/minute for authenticated users, 100/minute for public endpoints
                          </p>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-semibold">WebSocket Streams</h4>
                          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm">
                            <div className="space-y-1">
                              <div>wss://api.weparlay.io/ws/odds</div>
                              <div>wss://api.weparlay.io/ws/markets</div>
                              <div>wss://api.weparlay.io/ws/user/:userId</div>
                              <div>wss://api.weparlay.io/ws/chat</div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Real-time updates for odds changes, bet confirmations, and account notifications
                          </p>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <h4 className="font-semibold mb-2">SDK Availability</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <span className="p-2 bg-white dark:bg-gray-800 rounded">JavaScript/TypeScript</span>
                          <span className="p-2 bg-white dark:bg-gray-800 rounded">Python</span>
                          <span className="p-2 bg-white dark:bg-gray-800 rounded">Go</span>
                          <span className="p-2 bg-white dark:bg-gray-800 rounded">Rust</span>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom CTA */}
      <Card className="text-center">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Crypto Gambling?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of players already using cryptocurrency on WeParlay for faster, cheaper, and more secure gambling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Connect Wallet & Start
            </button>
            <button className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-accent transition-colors">
              View Live Crypto Tutorial
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
