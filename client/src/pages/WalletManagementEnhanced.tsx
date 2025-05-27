import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, CreditCard, Bitcoin, Smartphone, Shield, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const WalletManagementEnhanced: React.FC = () => {
  const { toast } = useToast();
  const [selectedWallet, setSelectedWallet] = useState<string>('');

  const connectWallet = (walletType: string) => {
    toast({
      title: `${walletType} Connected!`,
      description: `Your ${walletType} wallet has been connected successfully.`,
    });
    setSelectedWallet(walletType);
  };

  const wallets = [
    { id: 'metamask', name: 'MetaMask', icon: '🦊', balance: '0.5 ETH', status: 'connected' },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔷', balance: '1.2 ETH', status: 'disconnected' },
    { id: 'trustwallet', name: 'Trust Wallet', icon: '🛡️', balance: '0 ETH', status: 'disconnected' },
    { id: 'phantom', name: 'Phantom', icon: '👻', balance: '2.1 SOL', status: 'connected' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Wallet Management</h1>
        <Badge variant="secondary">Secure & Fast</Badge>
      </div>

      <Tabs defaultValue="crypto" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="crypto" className="flex items-center gap-2">
            <Bitcoin className="h-4 w-4" />
            Crypto Wallets
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Cards
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile Pay
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wallets.map((wallet) => (
              <Card key={wallet.id} className={`border-2 ${wallet.status === 'connected' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{wallet.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{wallet.name}</CardTitle>
                        <p className="text-sm text-gray-600">{wallet.balance}</p>
                      </div>
                    </div>
                    <Badge variant={wallet.status === 'connected' ? 'default' : 'secondary'}>
                      {wallet.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {wallet.status === 'connected' ? (
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        View Transactions
                      </Button>
                      <Button variant="destructive" size="sm" className="w-full">
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => connectWallet(wallet.name)}
                    >
                      Connect {wallet.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Crypto Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" onClick={() => connectWallet('Binance Chain Wallet')}>
                  Binance Chain
                </Button>
                <Button variant="outline" onClick={() => connectWallet('WalletConnect')}>
                  WalletConnect
                </Button>
                <Button variant="outline" onClick={() => connectWallet('Ledger')}>
                  Ledger
                </Button>
                <Button variant="outline" onClick={() => connectWallet('Trezor')}>
                  Trezor
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Credit/Debit Cards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm opacity-80">VISA</span>
                    <span className="text-sm opacity-80">💳</span>
                  </div>
                  <p className="font-mono text-lg mb-2">**** **** **** 4532</p>
                  <div className="flex justify-between text-sm opacity-80">
                    <span>JOHN DOE</span>
                    <span>12/26</span>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Card
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PayPal & Bank Transfers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      P
                    </div>
                    <span>PayPal</span>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      $
                    </div>
                    <span>Cash App</span>
                  </div>
                  <Button size="sm" variant="outline">Connect</Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      V
                    </div>
                    <span>Venmo</span>
                  </div>
                  <Button size="sm" variant="outline">Connect</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Mobile Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <span>Apple Pay</span>
                  </div>
                  <Button size="sm">Setup</Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    <span>Google Pay</span>
                  </div>
                  <Button size="sm">Setup</Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <span>Zelle</span>
                  </div>
                  <Button size="sm" variant="outline">Connect</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Deposit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Deposit Amount</Label>
                  <Input id="deposit-amount" placeholder="$100" />
                </div>
                <Button className="w-full">Instant Deposit</Button>
                <p className="text-sm text-gray-600 text-center">
                  Funds available immediately with mobile payments
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Two-Factor Authentication</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Biometric Login</span>
                  <Badge variant="secondary">Setup</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Transaction Alerts</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Withdrawal Limits</span>
                  <Badge variant="outline">$5,000/day</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>MetaMask Connected</span>
                    <span className="text-gray-500">2 min ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PayPal Deposit $500</span>
                    <span className="text-gray-500">1 hour ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Settings Updated</span>
                    <span className="text-gray-500">Yesterday</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletManagementEnhanced;