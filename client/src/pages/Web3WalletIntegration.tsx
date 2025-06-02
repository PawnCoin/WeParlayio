import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  ExternalLink,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Coins,
  CreditCard,
  QrCode
} from 'lucide-react';

interface WalletConnection {
  address: string;
  balance: string;
  network: 'ethereum' | 'polygon' | 'bsc' | 'solana';
  connected: boolean;
  provider: 'metamask' | 'walletconnect' | 'phantom' | 'coinbase';
}

interface CryptoBalance {
  symbol: string;
  name: string;
  balance: string;
  usdValue: number;
  change24h: number;
  logo: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'payout';
  amount: string;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  txHash?: string;
  network: string;
}

export default function Web3WalletIntegration() {
  const [connectedWallet, setConnectedWallet] = useState<WalletConnection | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('ethereum');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if wallet is already connected
  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Fetch crypto balances
  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ['/api/crypto/balances'],
    enabled: !!connectedWallet,
    refetchInterval: 30000,
  });

  // Fetch transaction history
  const { data: transactions } = useQuery({
    queryKey: ['/api/crypto/transactions'],
    enabled: !!connectedWallet,
  });

  // Connect wallet mutation
  const connectWalletMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await fetch('/api/crypto/connect-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, network: selectedNetwork }),
      });
      if (!response.ok) throw new Error('Failed to connect wallet');
      return response.json();
    },
    onSuccess: (data) => {
      setConnectedWallet(data.wallet);
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${data.wallet.provider}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crypto/balances'] });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Deposit crypto mutation
  const depositMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/crypto/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to process deposit');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deposit Initiated",
        description: "Your crypto deposit is being processed",
      });
      setDepositAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/crypto/balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crypto/transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Withdraw crypto mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/crypto/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to process withdrawal');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Initiated",
        description: "Your crypto withdrawal is being processed",
      });
      setWithdrawAmount('');
      setWithdrawAddress('');
      queryClient.invalidateQueries({ queryKey: ['/api/crypto/balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crypto/transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const checkWalletConnection = async () => {
    try {
      // Check for existing wallet connection
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (accounts.length > 0) {
          setConnectedWallet({
            address: accounts[0],
            balance: '0',
            network: 'ethereum',
            connected: true,
            provider: 'metamask'
          });
        }
      }
    } catch (error) {
      console.log('No wallet detected');
    }
  };

  const connectWallet = async (provider: string) => {
    if (provider === 'metamask') {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: 'eth_requestAccounts'
          });
          
          connectWalletMutation.mutate(provider);
        } catch (error) {
          toast({
            title: "Connection Rejected",
            description: "Please approve the wallet connection",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to continue",
          variant: "destructive",
        });
      }
    } else {
      connectWalletMutation.mutate(provider);
    }
  };

  const disconnectWallet = () => {
    setConnectedWallet(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const copyAddress = () => {
    if (connectedWallet?.address) {
      navigator.clipboard.writeText(connectedWallet.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string, decimals: number = 4) => {
    return parseFloat(balance).toFixed(decimals);
  };

  // Mock data for balances
  const mockBalances: CryptoBalance[] = [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: '2.4567',
      usdValue: 5234.12,
      change24h: 3.45,
      logo: '🔷'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: '1250.00',
      usdValue: 1250.00,
      change24h: 0.01,
      logo: '💵'
    },
    {
      symbol: 'MATIC',
      name: 'Polygon',
      balance: '850.75',
      usdValue: 425.38,
      change24h: -2.15,
      logo: '🟣'
    }
  ];

  // Mock transactions
  const mockTransactions: Transaction[] = [
    {
      id: 'tx_001',
      type: 'deposit',
      amount: '0.5',
      currency: 'ETH',
      status: 'confirmed',
      timestamp: '2024-06-02T10:30:00Z',
      txHash: '0x1234...5678',
      network: 'ethereum'
    },
    {
      id: 'tx_002',
      type: 'bet',
      amount: '100',
      currency: 'USDC',
      status: 'confirmed',
      timestamp: '2024-06-02T09:15:00Z',
      network: 'polygon'
    }
  ];

  const cryptoBalances = balances || mockBalances;
  const cryptoTransactions = transactions || mockTransactions;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
          <Wallet className="h-8 w-8 text-purple-500" />
          <span>Web3 Wallet</span>
        </h1>
        <p className="text-gray-600">Manage your crypto assets and blockchain betting</p>
      </div>

      {!connectedWallet ? (
        /* Wallet Connection */
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
              <p className="text-gray-600">Choose your preferred wallet to get started</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Network</Label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                    <SelectItem value="solana">Solana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="p-6 h-auto"
                  onClick={() => connectWallet('metamask')}
                  disabled={connectWalletMutation.isPending}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🦊</div>
                    <div className="font-medium">MetaMask</div>
                    <div className="text-sm text-gray-600">Browser Extension</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="p-6 h-auto"
                  onClick={() => connectWallet('walletconnect')}
                  disabled={connectWalletMutation.isPending}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <div className="font-medium">WalletConnect</div>
                    <div className="text-sm text-gray-600">Mobile Wallets</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="p-6 h-auto"
                  onClick={() => connectWallet('coinbase')}
                  disabled={connectWalletMutation.isPending}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🟦</div>
                    <div className="font-medium">Coinbase</div>
                    <div className="text-sm text-gray-600">Coinbase Wallet</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="p-6 h-auto"
                  onClick={() => connectWallet('phantom')}
                  disabled={connectWalletMutation.isPending}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">👻</div>
                    <div className="font-medium">Phantom</div>
                    <div className="text-sm text-gray-600">Solana Wallet</div>
                  </div>
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600 mt-6">
                <Shield className="h-4 w-4 inline mr-1" />
                Your wallet connection is secure and encrypted
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Connected Wallet Dashboard */
        <div className="space-y-6">
          {/* Wallet Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{formatAddress(connectedWallet.address)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyAddress}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </CardTitle>
                    <p className="text-gray-600 capitalize">
                      {connectedWallet.provider} • {connectedWallet.network}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Crypto Balances */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Coins className="h-5 w-5" />
                    <span>Your Balances</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {balancesLoading ? (
                    <div className="text-center py-8">Loading balances...</div>
                  ) : (
                    <div className="space-y-4">
                      {cryptoBalances.map((balance) => (
                        <div key={balance.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{balance.logo}</div>
                            <div>
                              <div className="font-semibold">{balance.name}</div>
                              <div className="text-sm text-gray-600">{balance.symbol}</div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-bold">{formatBalance(balance.balance)} {balance.symbol}</div>
                            <div className="text-sm text-gray-600">${balance.usdValue.toFixed(2)}</div>
                            <div className={`text-xs flex items-center ${
                              balance.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {balance.change24h >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowDownLeft className="h-3 w-3 mr-1" />
                              )}
                              {Math.abs(balance.change24h).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cryptoTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === 'deposit' ? 'bg-green-100' :
                            tx.type === 'withdraw' ? 'bg-red-100' :
                            tx.type === 'bet' ? 'bg-blue-100' : 'bg-purple-100'
                          }`}>
                            {tx.type === 'deposit' ? (
                              <ArrowDownLeft className="h-4 w-4 text-green-600" />
                            ) : tx.type === 'withdraw' ? (
                              <ArrowUpRight className="h-4 w-4 text-red-600" />
                            ) : (
                              <Zap className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium capitalize">{tx.type}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold">
                            {tx.amount} {tx.currency}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={
                                tx.status === 'confirmed' ? 'default' :
                                tx.status === 'pending' ? 'secondary' : 'destructive'
                              }
                              className="text-xs"
                            >
                              {tx.status}
                            </Badge>
                            {tx.txHash && (
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Deposit/Withdraw */}
            <div className="space-y-6">
              <Tabs defaultValue="deposit">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                </TabsList>

                <TabsContent value="deposit">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <ArrowDownLeft className="h-5 w-5 text-green-600" />
                        <span>Deposit Crypto</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <Label>Currency</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eth">ETH</SelectItem>
                            <SelectItem value="usdc">USDC</SelectItem>
                            <SelectItem value="matic">MATIC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => depositMutation.mutate({
                          amount: depositAmount,
                          currency: 'ETH'
                        })}
                        disabled={!depositAmount || depositMutation.isPending}
                      >
                        {depositMutation.isPending ? 'Processing...' : 'Deposit'}
                      </Button>

                      <div className="text-center">
                        <Button variant="outline" size="sm">
                          <QrCode className="h-4 w-4 mr-2" />
                          Show QR Code
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="withdraw">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <ArrowUpRight className="h-5 w-5 text-red-600" />
                        <span>Withdraw Crypto</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <Label>Withdrawal Address</Label>
                        <Input
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                          placeholder="0x..."
                        />
                      </div>

                      <div>
                        <Label>Currency</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eth">ETH</SelectItem>
                            <SelectItem value="usdc">USDC</SelectItem>
                            <SelectItem value="matic">MATIC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => withdrawMutation.mutate({
                          amount: withdrawAmount,
                          address: withdrawAddress,
                          currency: 'ETH'
                        })}
                        disabled={!withdrawAmount || !withdrawAddress || withdrawMutation.isPending}
                      >
                        {withdrawMutation.isPending ? 'Processing...' : 'Withdraw'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Security Notice */}
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">Security Notice</p>
                      <p>Always verify withdrawal addresses. Crypto transactions are irreversible.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}