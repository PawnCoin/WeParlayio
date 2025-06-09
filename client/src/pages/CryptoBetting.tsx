import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Zap, 
  Shield, 
  Wallet, 
  DollarSign,
  Activity,
  ChevronRight,
  Star
} from 'lucide-react';
import WalletConnector from '@/components/crypto/WalletConnector';
import CryptoBettingPanel from '@/components/crypto/CryptoBettingPanel';

export default function CryptoBetting() {
  const [stats, setStats] = useState({
    totalVolume: 0,
    activeBets: 0,
    payoutRatio: 0,
    topWinner: 0
  });

  useEffect(() => {
    // Simulate real-time stats
    const interval = setInterval(() => {
      setStats({
        totalVolume: Math.random() * 1000000 + 500000,
        activeBets: Math.floor(Math.random() * 1000) + 200,
        payoutRatio: Math.random() * 5 + 95,
        topWinner: Math.random() * 50 + 10
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const cryptoFeatures = [
    {
      icon: Shield,
      title: "Provably Fair",
      description: "Blockchain-verified odds and transparent betting"
    },
    {
      icon: Zap,
      title: "Instant Payouts",
      description: "Automatic smart contract settlements"
    },
    {
      icon: DollarSign,
      title: "Low Fees",
      description: "Minimal network fees, maximum returns"
    },
    {
      icon: Activity,
      title: "Live Odds",
      description: "Real-time odds from multiple sources"
    }
  ];

  const supportedNetworks = [
    { name: 'Ethereum', fee: '$5-50', time: '2-15 min', color: 'blue' },
    { name: 'Polygon', fee: '$0.01-0.10', time: '1-5 min', color: 'purple' },
    { name: 'Solana', fee: '$0.00025', time: '400ms', color: 'green' },
    { name: 'Arbitrum', fee: '$0.25-2', time: '1-10 min', color: 'cyan' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8 bg-slate-950 min-h-screen">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-950/30 border border-blue-500/30 rounded-full">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-blue-400 text-sm font-medium">Live Crypto Betting</span>
        </div>
        <h1 className="text-5xl font-bold text-white">
          Crypto Sports Betting
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          Bet with Bitcoin, Ethereum, Solana and more. Enjoy provably fair odds, instant payouts, and the lowest fees in the industry.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              ${stats.totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-slate-400">24h Volume</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {stats.activeBets.toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Active Bets</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {stats.payoutRatio.toFixed(2)}%
            </div>
            <div className="text-sm text-slate-400">Payout Ratio</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">
              {stats.topWinner.toFixed(1)} BTC
            </div>
            <div className="text-sm text-slate-400">Biggest Win</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="betting" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-900">
          <TabsTrigger value="betting" className="text-white data-[state=active]:bg-blue-600">
            Place Bets
          </TabsTrigger>
          <TabsTrigger value="wallet" className="text-white data-[state=active]:bg-blue-600">
            Connect Wallet
          </TabsTrigger>
          <TabsTrigger value="features" className="text-white data-[state=active]:bg-blue-600">
            Features
          </TabsTrigger>
          <TabsTrigger value="networks" className="text-white data-[state=active]:bg-blue-600">
            Networks
          </TabsTrigger>
        </TabsList>

        {/* Betting Tab */}
        <TabsContent value="betting" className="space-y-6">
          <CryptoBettingPanel />
        </TabsContent>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="space-y-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Wallet className="h-5 w-5 mr-2 text-blue-400" />
                Wallet Connection
              </CardTitle>
              <p className="text-slate-400">
                Connect your crypto wallet to start betting with Bitcoin, Ethereum, and other cryptocurrencies
              </p>
            </CardHeader>
            <CardContent>
              <WalletConnector />
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Alert className="border-green-500 bg-green-950/30">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-green-300">
              Your wallet remains under your full control. WeParlay never has access to your private keys or funds.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cryptoFeatures.map((feature, index) => (
              <Card key={index} className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-950/50 rounded-lg">
                      <feature.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Advanced Features */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Star className="h-5 w-5 mr-2 text-yellow-400" />
                Advanced Crypto Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Multi-Currency Support</h4>
                  <p className="text-slate-400 text-sm">
                    Bet with Bitcoin, Ethereum, Solana, USDC, USDT, and our native Pawn Coin ($Pc)
                  </p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Smart Contract Automation</h4>
                  <p className="text-slate-400 text-sm">
                    Automatic bet settlement and instant payouts via blockchain smart contracts
                  </p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Cross-Chain Compatibility</h4>
                  <p className="text-slate-400 text-sm">
                    Support for multiple blockchain networks with seamless cross-chain functionality
                  </p>
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Yield Farming Rewards</h4>
                  <p className="text-slate-400 text-sm">
                    Earn additional rewards by staking your crypto while betting
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Networks Tab */}
        <TabsContent value="networks" className="space-y-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Activity className="h-5 w-5 mr-2 text-green-400" />
                Supported Networks
              </CardTitle>
              <p className="text-slate-400">
                Choose the blockchain network that best fits your needs
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportedNetworks.map((network, index) => (
                  <div
                    key={index}
                    className="p-4 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        {network.name}
                      </h3>
                      <Badge 
                        variant="secondary" 
                        className={`bg-${network.color}-900 text-${network.color}-300`}
                      >
                        Active
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Network Fee:</span>
                        <span className="text-white">{network.fee}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Confirmation Time:</span>
                        <span className="text-white">{network.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Network Recommendations */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Network Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-950/30 border border-green-500/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-green-300 font-semibold">Best for Speed: Solana</p>
                  <p className="text-green-400/80 text-sm">Ultra-fast transactions under 1 second</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-950/30 border border-blue-500/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-blue-300 font-semibold">Best for Low Fees: Polygon</p>
                  <p className="text-blue-400/80 text-sm">Minimal transaction costs, high efficiency</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-950/30 border border-orange-500/30 rounded-lg">
                <Shield className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-orange-300 font-semibold">Most Secure: Ethereum</p>
                  <p className="text-orange-400/80 text-sm">Maximum security and decentralization</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-blue-950 to-purple-950 border-blue-500/30">
        <CardContent className="p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Crypto Betting?
          </h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Join thousands of users already betting with cryptocurrency on WeParlay. 
            Experience the future of sports betting with blockchain technology.
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-400">
            <span>Connect your wallet to get started</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}