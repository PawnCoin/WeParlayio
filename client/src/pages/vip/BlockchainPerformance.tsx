import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, Wallet, BarChart } from 'lucide-react';
import TierGuard from '@/components/access/TierGuard';

export default function VIPBlockchainPerformance() {
  const cryptoStats = [
    {
      name: 'Pawn Coin',
      symbol: 'PAWN',
      balance: 15420,
      value: 4632.60,
      change: '+12.5%',
      trend: 'up'
    },
    {
      name: 'WeParlay Token',
      symbol: 'WPT',
      balance: 8900,
      value: 2670.00,
      change: '+8.2%',
      trend: 'up'
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      balance: 2.5,
      value: 3975.50,
      change: '-2.1%',
      trend: 'down'
    }
  ];

  return (
    <TierGuard requiredTier="vip" feature="Blockchain Performance">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">VIP Blockchain Performance</h1>
            <p className="text-xl text-gray-300">
              Advanced Web3 analytics and Pawn Coin tracking
            </p>
            <Badge variant="outline" className="text-green-500 border-green-500 mt-4">
              <Zap className="w-4 h-4 mr-2" />
              VIP Exclusive
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {cryptoStats.map((crypto, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{crypto.name}</CardTitle>
                    <Badge 
                      variant={crypto.trend === 'up' ? 'secondary' : 'destructive'}
                      className={crypto.trend === 'up' ? 'bg-green-600' : 'bg-red-600'}
                    >
                      {crypto.change}
                    </Badge>
                  </div>
                  <p className="text-gray-400">{crypto.symbol}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">Balance</p>
                      <p className="text-2xl font-bold">{crypto.balance.toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm">USD Value</p>
                      <p className="text-xl font-bold text-green-400">${crypto.value.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Trade
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Wallet className="w-4 h-4 mr-2" />
                        Transfer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Portfolio Performance */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-black rounded-lg p-6 text-center">
                    <BarChart className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">Portfolio Chart Placeholder</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Total Portfolio</p>
                      <p className="text-xl font-bold text-green-400">$11,278.10</p>
                    </div>
                    <div>
                      <p className="text-gray-400">24h Change</p>
                      <p className="text-xl font-bold text-green-400">+$892.50</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Web3 Integration */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Web3 Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-20" variant="outline">
                      <div className="text-center">
                        <Wallet className="w-6 h-6 mx-auto mb-2" />
                        <p>Connect Wallet</p>
                      </div>
                    </Button>
                    <Button className="h-20" variant="outline">
                      <div className="text-center">
                        <Zap className="w-6 h-6 mx-auto mb-2" />
                        <p>Pawn Coin Staking</p>
                      </div>
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-gray-900 rounded-lg">
                    <h3 className="font-bold mb-2">VIP Web3 Features:</h3>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Advanced portfolio analytics</li>
                      <li>• Pawn Coin staking rewards</li>
                      <li>• DeFi integration</li>
                      <li>• Cross-chain betting</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TierGuard>
  );
}