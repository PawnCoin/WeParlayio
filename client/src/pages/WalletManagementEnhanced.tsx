import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, CreditCard, Bitcoin, Smartphone, Shield, Plus, AlertTriangle, CheckCircle, Star, Crown, TrendingUp, Lock, Eye, EyeOff, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBetting } from "@/contexts/BettingContext";
import WalletConnect from "@/components/auth/WalletConnect";
import { motion, AnimatePresence } from "framer-motion";
import CryptoWalletDetails from '@/components/wallet/CryptoWalletDetails';

interface WalletData {
  id: string;
  name: string;
  icon: string;
  balance: string;
  status: 'connected' | 'disconnected' | 'pending';
  address?: string;
  network?: string;
  isVipOnly?: boolean;
}

interface TransactionHistory {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win';
  amount: number;
  currency: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

const WalletManagementEnhanced: React.FC = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { selectedCurrency } = useBetting();
  const queryClient = useQueryClient();
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [activeTab, setActiveTab] = useState('crypto');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Fetch user wallet data
  const { data: walletData, isLoading: walletsLoading } = useQuery({
    queryKey: ['/api/user/wallets'],
    enabled: isAuthenticated,
  });

  // Fetch transaction history
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/user/transactions'],
    enabled: isAuthenticated,
  });

  // Fetch WeParlay Cash balance
  const { data: cashBalance } = useQuery({
    queryKey: ['/api/user/cash-balance'],
    enabled: isAuthenticated,
  });

  // Connect wallet mutation
  const connectWalletMutation = useMutation({
    mutationFn: async ({ walletType, address }: { walletType: string; address?: string }) => {
      const response = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletType, address }),
      });
      if (!response.ok) throw new Error('Failed to connect wallet');
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: `${variables.walletType} Connected!`,
        description: `Your ${variables.walletType} wallet has been connected successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/wallets'] });
      setSelectedWallet(variables.walletType);
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async ({ amount, method }: { amount: number; method: string }) => {
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method }),
      });
      if (!response.ok) throw new Error('Deposit failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deposit Successful",
        description: "Funds have been added to your account",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/wallets'] });
      setDepositAmount('');
    },
  });

  const defaultWallets: WalletData[] = [
    { 
      id: 'metamask', 
      name: 'MetaMask', 
      icon: '🦊', 
      balance: walletData?.metamask?.balance || '0 ETH', 
      status: walletData?.metamask?.connected ? 'connected' : 'disconnected',
      address: walletData?.metamask?.address,
      network: 'Ethereum'
    },
    { 
      id: 'coinbase', 
      name: 'Coinbase Wallet', 
      icon: '🔷', 
      balance: walletData?.coinbase?.balance || '0 ETH', 
      status: walletData?.coinbase?.connected ? 'connected' : 'disconnected',
      network: 'Multi-chain'
    },
    { 
      id: 'trustwallet', 
      name: 'Trust Wallet', 
      icon: '🛡️', 
      balance: walletData?.trustwallet?.balance || '0 ETH', 
      status: walletData?.trustwallet?.connected ? 'connected' : 'disconnected',
      network: 'Multi-chain'
    },
    { 
      id: 'phantom', 
      name: 'Phantom', 
      icon: '👻', 
      balance: walletData?.phantom?.balance || '0 SOL', 
      status: walletData?.phantom?.connected ? 'connected' : 'disconnected',
      network: 'Solana'
    },
    { 
      id: 'ledger', 
      name: 'Ledger', 
      icon: '🔐', 
      balance: '0 ETH', 
      status: 'disconnected',
      network: 'Multi-chain',
      isVipOnly: true
    },
  ];

  const isVipUser = user?.tier === 'platinum' || user?.tier === 'gold' || user?.isVip;

  const handleConnectWallet = async (walletType: string) => {
    if (!consentGiven) {
      toast({
        title: "Consent Required",
        description: "Please give consent for wallet connection in the Security tab",
        variant: "destructive",
      });
      setActiveTab('security');
      return;
    }

    connectWalletMutation.mutate({ walletType });
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({
      amount: parseFloat(depositAmount),
      method: selectedWallet || 'card'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-12">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to manage your wallets</p>
            <Button onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Wallet className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Wallet Management</h1>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Secure & Fast
        </Badge>
        {isVipUser && (
          <Badge variant="default" className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500">
            <Crown className="h-3 w-3" />
            VIP Access
          </Badge>
        )}
      </motion.div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">WeParlay Cash</p>
                <p className="text-2xl font-bold">{(cashBalance?.balance || 10000).toLocaleString()} WPC</p>
              </div>
              <div className="text-3xl">🎮</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Real Money Balance</p>
                <p className="text-2xl font-bold">${user?.balance?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm">Total Portfolio</p>
                <p className="text-2xl font-bold">${((user?.balance || 0) + (cashBalance?.balance || 0) * 0.01).toFixed(2)}</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="crypto" className="flex items-center gap-2">
            <Bitcoin className="h-4 w-4" />
            Crypto
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Cards
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {defaultWallets.map((wallet, index) => (
                <motion.div
                  key={wallet.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border-2 ${
                    wallet.status === 'connected' 
                      ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 hover:border-blue-300'
                  } transition-all duration-200`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{wallet.icon}</span>
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {wallet.name}
                              {wallet.isVipOnly && (
                                <Badge variant="secondary" className="text-xs">
                                  <Crown className="h-3 w-3 mr-1" />
                                  VIP
                                </Badge>
                              )}
                            </CardTitle>
                            <p className="text-sm text-gray-600">{wallet.balance}</p>
                            <p className="text-xs text-gray-500">{wallet.network}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={wallet.status === 'connected' ? 'default' : 'secondary'}>
                            {wallet.status}
                          </Badge>
                          {wallet.status === 'connected' && wallet.address && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(wallet.address!)}
                              className="text-xs"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              {formatAddress(wallet.address)}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {wallet.status === 'connected' ? (
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              View Transactions
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Explorer
                            </Button>
                          </div>
                          <Button variant="destructive" size="sm" className="w-full">
                            Disconnect
                          </Button>
                        </div>
                      ) : wallet.isVipOnly && !isVipUser ? (
                        <div className="text-center py-4">
                          <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                          <p className="text-sm text-gray-600 mb-2">VIP Feature</p>
                          <Button size="sm" variant="outline" onClick={() => window.location.href = '/vip-features'}>
                            Upgrade to VIP
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => handleConnectWallet(wallet.name)}
                          disabled={connectWalletMutation.isPending}
                        >
                          {connectWalletMutation.isPending ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Connect {wallet.name}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Quick Deposit/Withdraw */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Deposit Amount</Label>
                  <Input 
                    id="deposit-amount" 
                    placeholder="$100" 
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                  <Button 
                    className="w-full" 
                    onClick={handleDeposit}
                    disabled={depositMutation.isPending}
                  >
                    {depositMutation.isPending ? 'Processing...' : 'Instant Deposit'}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Withdraw Amount</Label>
                  <Input 
                    id="withdraw-amount" 
                    placeholder="$50" 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <Button variant="outline" className="w-full">
                    Request Withdrawal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <CryptoWalletDetails />
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
                    <span>{user?.firstName?.toUpperCase() || 'USER'} {user?.lastName?.toUpperCase() || 'NAME'}</span>
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
                <CardTitle>Digital Wallets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'PayPal', icon: 'P', color: 'blue', status: 'Connected' },
                  { name: 'Cash App', icon: '$', color: 'green', status: 'Connect' },
                  { name: 'Venmo', icon: 'V', color: 'red', status: 'Connect' },
                  { name: 'Apple Pay', icon: '🍎', color: 'gray', status: 'Setup' },
                ].map((wallet) => (
                  <div key={wallet.name} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 bg-${wallet.color}-600 rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                        {wallet.icon}
                      </div>
                      <span>{wallet.name}</span>
                    </div>
                    {wallet.status === 'Connected' ? (
                      <Badge variant="default">Connected</Badge>
                    ) : (
                      <Button size="sm" variant="outline">{wallet.status}</Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Payment Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Mobile payments offer instant deposits with lower fees
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {[
                    { name: 'Apple Pay', icon: '📱', available: true },
                    { name: 'Google Pay', icon: '🤖', available: true },
                    { name: 'Samsung Pay', icon: '📲', available: false },
                    { name: 'Zelle', icon: '⚡', available: true },
                  ].map((payment) => (
                    <div key={payment.name} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{payment.icon}</span>
                        <span>{payment.name}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant={payment.available ? "default" : "secondary"}
                        disabled={!payment.available}
                      >
                        {payment.available ? 'Setup' : 'Coming Soon'}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile-deposit">Quick Mobile Deposit</Label>
                    <Input id="mobile-deposit" placeholder="$100" />
                  </div>
                  <Button className="w-full">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Instant Mobile Deposit
                  </Button>
                  <p className="text-sm text-gray-600 text-center">
                    Funds available immediately with mobile payments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposit">
</TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Transaction History
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : transactions?.length ? (
                <div className="space-y-2">
                  {transactions.map((tx: TransactionHistory) => (
                    <div key={tx.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === 'deposit' ? 'bg-green-100 text-green-600' :
                          tx.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                          tx.type === 'win' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {tx.type === 'deposit' ? '↓' : 
                           tx.type === 'withdrawal' ? '↑' :
                           tx.type === 'win' ? '🏆' : '🎯'}
                        </div>
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-sm text-gray-500">{new Date(tx.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          tx.type === 'deposit' || tx.type === 'win' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.type === 'deposit' || tx.type === 'win' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </p>
                        <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Security & Consent Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  WeParlay prioritizes your security. All sensitive operations require explicit consent.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Wallet Connection Consent</h4>
                    <p className="text-sm text-gray-600">Allow WeParlay to connect external wallets</p>
                  </div>
                  <Switch 
                    checked={consentGiven}
                    onCheckedChange={setConsentGiven}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Enhanced security for all transactions</p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Biometric Authentication</h4>
                    <p className="text-sm text-gray-600">Use fingerprint/face ID for quick access</p>
                  </div>
                  <Button size="sm" variant="outline">Setup</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Transaction Alerts</h4>
                    <p className="text-sm text-gray-600">Real-time notifications for all activities</p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Daily Withdrawal Limit</h4>
                    <p className="text-sm text-gray-600">Current limit for security</p>
                  </div>
                  <Badge variant="outline">
                    ${isVipUser ? '25,000' : '5,000'}/day
                  </Badge>
                </div>
              </div>

              {isVipUser && (
                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800">VIP Security Features</h4>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Priority security support</li>
                      <li>• Enhanced withdrawal limits</li>
                      <li>• Advanced fraud protection</li>
                      <li>• Dedicated security specialist</li>
                    </ul>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Security Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>✅ Wallet connection consent updated</span>
                  <span className="text-gray-500">Just now</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>🔐 Two-factor authentication used</span>
                  <span className="text-gray-500">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>📱 New device login detected</span>
                  <span className="text-gray-500">Yesterday</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>🛡️ Security settings reviewed</span>
                  <span className="text-gray-500">3 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletManagementEnhanced;