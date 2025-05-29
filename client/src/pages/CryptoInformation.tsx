import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bitcoin, DollarSign, TrendingUp, Shield, Info } from 'lucide-react';

const CryptoInformation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basics');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Cryptocurrency on WeParlay</h1>
      <p className="text-muted-foreground mb-6">
        Learn about betting with cryptocurrency and managing your digital assets
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="supported">Supported Coins</TabsTrigger>
          <TabsTrigger value="fees">Fees & Limits</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="basics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bitcoin className="h-5 w-5" />
                    What is Cryptocurrency Betting?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Cryptocurrency betting allows you to place wagers using digital currencies like Bitcoin, Ethereum, and others. 
                    Your bets are processed on the blockchain, providing transparency and security.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Benefits</h3>
                      <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• Fast transactions</li>
                        <li>• Lower fees</li>
                        <li>• Enhanced privacy</li>
                        <li>• Global accessibility</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Considerations</h3>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        <li>• Price volatility</li>
                        <li>• Learning curve</li>
                        <li>• Wallet security responsibility</li>
                        <li>• Transaction confirmations</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">1</div>
                      <div>
                        <h4 className="font-medium">Connect Your Wallet</h4>
                        <p className="text-sm text-muted-foreground">Connect your cryptocurrency wallet to WeParlay</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">2</div>
                      <div>
                        <h4 className="font-medium">Fund Your Account</h4>
                        <p className="text-sm text-muted-foreground">Deposit cryptocurrency to your WeParlay balance</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">3</div>
                      <div>
                        <h4 className="font-medium">Place Your Bets</h4>
                        <p className="text-sm text-muted-foreground">Bet using your cryptocurrency balance</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">4</div>
                      <div>
                        <h4 className="font-medium">Withdraw Winnings</h4>
                        <p className="text-sm text-muted-foreground">Cash out your winnings to your wallet</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="supported">
            <Card>
              <CardHeader>
                <CardTitle>Supported Cryptocurrencies</CardTitle>
                <CardDescription>Digital currencies accepted on WeParlay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {[
                    { name: 'Bitcoin', symbol: 'BTC', icon: '₿', status: 'Live' },
                    { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', status: 'Live' },
                    { name: 'Tether', symbol: 'USDT', icon: '₮', status: 'Live' },
                    { name: 'USD Coin', symbol: 'USDC', icon: '$', status: 'Live' },
                    { name: 'Solana', symbol: 'SOL', icon: '◎', status: 'Coming Soon' },
                    { name: 'Litecoin', symbol: 'LTC', icon: 'Ł', status: 'Coming Soon' }
                  ].map((crypto, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-lg">
                          {crypto.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{crypto.name}</h3>
                          <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
                        </div>
                      </div>
                      <Badge variant={crypto.status === 'Live' ? 'default' : 'secondary'}>
                        {crypto.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle>Fees & Limits</CardTitle>
                <CardDescription>Transaction costs and account limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Deposit Fees</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Currency</th>
                            <th className="text-right py-2">Fee</th>
                            <th className="text-right py-2">Minimum</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">Bitcoin (BTC)</td>
                            <td className="text-right py-2">Network Fee Only</td>
                            <td className="text-right py-2">0.001 BTC</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">Ethereum (ETH)</td>
                            <td className="text-right py-2">Network Fee Only</td>
                            <td className="text-right py-2">0.01 ETH</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">USDT</td>
                            <td className="text-right py-2">Network Fee Only</td>
                            <td className="text-right py-2">10 USDT</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Withdrawal Fees</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Currency</th>
                            <th className="text-right py-2">Fee</th>
                            <th className="text-right py-2">Minimum</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">Bitcoin (BTC)</td>
                            <td className="text-right py-2">0.0005 BTC</td>
                            <td className="text-right py-2">0.002 BTC</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">Ethereum (ETH)</td>
                            <td className="text-right py-2">0.005 ETH</td>
                            <td className="text-right py-2">0.02 ETH</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">USDT</td>
                            <td className="text-right py-2">5 USDT</td>
                            <td className="text-right py-2">15 USDT</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Important Security Notice</AlertTitle>
                  <AlertDescription>
                    You are responsible for the security of your cryptocurrency wallet. WeParlay cannot recover lost private keys or stolen funds.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Wallet Security</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Use hardware wallets for large amounts</li>
                      <li>• Never share your private keys</li>
                      <li>• Enable two-factor authentication</li>
                      <li>• Keep wallet software updated</li>
                      <li>• Use strong, unique passwords</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Transaction Safety</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Always verify wallet addresses</li>
                      <li>• Start with small test transactions</li>
                      <li>• Wait for network confirmations</li>
                      <li>• Be aware of network congestion</li>
                      <li>• Monitor gas fees before transactions</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">WeParlay Security</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Your funds are stored in secure cold wallets</li>
                      <li>• Multi-signature security protocols</li>
                      <li>• Regular security audits</li>
                      <li>• 24/7 monitoring systems</li>
                      <li>• Insurance coverage for platform funds</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default CryptoInformation;