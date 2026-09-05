import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Wallet, Send, ArrowDownUp, Shield, Copy, Eye, EyeOff,
  TrendingUp, Bitcoin, DollarSign, Zap, Clock, CheckCircle,
  AlertTriangle, QrCode, Plus, Minus, RefreshCw, Settings,
  Lock, Unlock, Globe, Target, Crown, Star, Award, ExternalLink
} from "lucide-react";

interface WalletBalance {
  currency: string;
  symbol: string;
  balance: string;
  usdValue: number;
  change24h: number;
  address: string;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'bet' | 'win' | 'deposit' | 'withdrawal';
  currency: string;
  amount: string;
  usdValue: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  hash?: string;
  fromAddress?: string;
  toAddress?: string;
  gasUsed?: string;
  gasFee?: string;
}

interface WalletConnection {
  connected: boolean;
  address?: string;
  provider?: string;
  chainId?: number;
  balance?: string;
}

interface CustomToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  usdValue: number;
}

interface WalletAnalytics {
  totalValue: number;
  change24h: number;
  totalTransactions: number;
  successRate: number;
}

// Your verified ERC-20 token contract - Pawn Coin ($PC)
const CUSTOM_TOKEN_ADDRESS = "0x2Fe269292f74F0a98C5786088317B4f86313C211";

// ERC-20 Token ABI (standard functions)
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

const CryptoWallet: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');
  const [walletConnection, setWalletConnection] = useState<WalletConnection>({ connected: false });
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('ETH');
  const [customToken, setCustomToken] = useState<CustomToken | null>(null);
  const [web3Provider, setWeb3Provider] = useState<any>(null);

  // Detect MetaMask or other Web3 wallets and load custom token
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts.length > 0) {
            const chainId = await (window as any).ethereum.request({ 
              method: 'eth_chainId' 
            });
            
            setWalletConnection({
              connected: true,
              address: accounts[0],
              provider: 'MetaMask',
              chainId: parseInt(chainId, 16)
            });

            // Initialize Web3 provider for custom token interactions
            setWeb3Provider((window as any).ethereum);
            
            // Load custom token information
            await loadCustomTokenInfo(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkWalletConnection();
  }, []);

  // Load custom token information from contract
  const loadCustomTokenInfo = async (walletAddress: string) => {
    if (!web3Provider && !(window as any).ethereum) return;
    
    try {
      const provider = web3Provider || (window as any).ethereum;
      
      // Request token information from your contract
      const tokenName = await provider.request({
        method: 'eth_call',
        params: [{
          to: CUSTOM_TOKEN_ADDRESS,
          data: '0x06fdde03' // name() function selector
        }, 'latest']
      });

      const tokenSymbol = await provider.request({
        method: 'eth_call',
        params: [{
          to: CUSTOM_TOKEN_ADDRESS,
          data: '0x95d89b41' // symbol() function selector
        }, 'latest']
      });

      const tokenDecimals = await provider.request({
        method: 'eth_call',
        params: [{
          to: CUSTOM_TOKEN_ADDRESS,
          data: '0x313ce567' // decimals() function selector
        }, 'latest']
      });

      // Get token balance for connected wallet
      const balanceData = `0x70a08231${walletAddress.slice(2).padStart(64, '0')}`;
      const tokenBalance = await provider.request({
        method: 'eth_call',
        params: [{
          to: CUSTOM_TOKEN_ADDRESS,
          data: balanceData
        }, 'latest']
      });

      // Parse the results (simplified parsing)
      const decimals = parseInt(tokenDecimals, 16);
      const balance = parseInt(tokenBalance, 16) / Math.pow(10, decimals);

      setCustomToken({
        address: CUSTOM_TOKEN_ADDRESS,
        symbol: 'PC', // Pawn Coin symbol
        name: 'Pawn Coin', // Your custom token name
        decimals: decimals,
        balance: balance.toString(),
        usdValue: balance * 0.01 // Placeholder USD value
      });

    } catch (error) {
      console.error('Error loading custom token info:', error);
      // Set Pawn Coin info if contract call fails
      setCustomToken({
        address: CUSTOM_TOKEN_ADDRESS,
        symbol: 'PC',
        name: 'Pawn Coin',
        decimals: 18,
        balance: '0',
        usdValue: 0
      });
    }
  };

  // Fetch wallet balances
  const { data: balances = [], isLoading: balancesLoading } = useQuery<WalletBalance[]>({
    queryKey: ['/api/wallet/balances'],
    enabled: isAuthenticated
  });

  // Fetch transaction history
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/wallet/transactions'],
    enabled: isAuthenticated
  });

  // Fetch wallet analytics
  const { data: analytics } = useQuery<WalletAnalytics>({
    queryKey: ['/api/wallet/analytics'],
    enabled: isAuthenticated
  });

  // Connect wallet mutation with custom token detection
  const connectWalletMutation = useMutation({
    mutationFn: async () => {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts'
      });

      const chainId = await (window as any).ethereum.request({
        method: 'eth_chainId'
      });

      return {
        address: accounts[0],
        chainId: parseInt(chainId, 16)
      };
    },
    onSuccess: async (data) => {
      setWalletConnection({
        connected: true,
        address: data.address,
        provider: 'MetaMask',
        chainId: data.chainId
      });

      setWeb3Provider((window as any).ethereum);
      
      // Load your custom ERC-20 token information
      await loadCustomTokenInfo(data.address);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${data.address.slice(0, 6)}...${data.address.slice(-4)} - Custom token detected`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balances'] });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  });

  // Send custom token function using Web3
  const sendCustomToken = async (toAddress: string, amount: string) => {
    if (!web3Provider || !walletConnection.connected || !customToken) {
      throw new Error('Wallet not connected or custom token not loaded');
    }

    try {
      // Convert amount to Wei (accounting for token decimals)
      const amountWei = (parseFloat(amount) * Math.pow(10, customToken.decimals)).toString(16);
      
      // Prepare transfer transaction data
      const transferData = `0xa9059cbb${toAddress.slice(2).padStart(64, '0')}${amountWei.padStart(64, '0')}`;
      
      // Send transaction
      const txHash = await web3Provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletConnection.address,
          to: CUSTOM_TOKEN_ADDRESS,
          data: transferData,
          gas: '0x5208', // 21000 gas limit
        }],
      });

      return { hash: txHash, success: true };
    } catch (error: any) {
      throw new Error(`Transaction failed: ${error.message}`);
    }
  };

  // Send crypto mutation (enhanced for custom tokens)
  const sendCryptoMutation = useMutation({
    mutationFn: async (data: { 
      currency: string; 
      amount: string; 
      toAddress: string; 
    }) => {
      // Check if sending custom token
      if (data.currency === customToken?.symbol && customToken) {
        return await sendCustomToken(data.toAddress, data.amount);
      }
      
      // Regular API call for other currencies
      const response = await fetch('/api/wallet/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to send crypto');
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Transaction Sent",
        description: result.hash ? `Transaction hash: ${result.hash.slice(0, 10)}...` : "Your transaction has been submitted to the network",
      });
      setSendAmount('');
      setSendAddress('');
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      
      // Reload custom token balance
      if (walletConnection.address) {
        loadCustomTokenInfo(walletConnection.address);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send transaction",
        variant: "destructive",
      });
    }
  });

  const handleConnectWallet = () => {
    connectWalletMutation.mutate();
  };

  const handleSendCrypto = () => {
    if (!sendAmount || !sendAddress || !selectedCurrency) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    sendCryptoMutation.mutate({
      currency: selectedCurrency,
      amount: sendAmount,
      toAddress: sendAddress
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'failed': return <AlertTriangle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'BTC': return <Bitcoin className="h-4 w-4" />;
      case 'ETH': return <Zap className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to access your crypto wallet</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wallet className="h-8 w-8 text-primary" />
            Crypto Wallet
          </h1>
          <p className="text-muted-foreground">Manage your cryptocurrency assets</p>
        </div>
        
        <div className="flex items-center gap-3">
          {walletConnection.connected ? (
            <Badge variant="outline" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {formatAddress(walletConnection.address!)}
            </Badge>
          ) : (
            <Button onClick={handleConnectWallet} disabled={connectWalletMutation.isPending}>
              {connectWalletMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-1">
            <Send className="h-4 w-4" />
            Send
          </TabsTrigger>
          <TabsTrigger value="receive" className="flex items-center gap-1">
            <ArrowDownUp className="h-4 w-4" />
            Receive
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Portfolio Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Portfolio Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">
                      ${analytics?.totalValue || '0.00'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">24h Change</p>
                    <p className={`text-2xl font-bold ${
                      (analytics?.change24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {(analytics?.change24h || 0) >= 0 ? '+' : ''}
                      {analytics?.change24h || '0.00'}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Assets</p>
                    <p className="text-2xl font-bold">{balances.length}</p>
                  </div>
                </div>

                {/* Custom Token Display (Your Verified ERC-20) */}
                {customToken && (
                  <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary text-primary-foreground rounded-full">
                          <Star className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {customToken.name} ({customToken.symbol})
                            <Badge variant="default" className="text-xs">VERIFIED</Badge>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Contract: {formatAddress(customToken.address)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://etherscan.io/token/${customToken.address}`, '_blank')}
                              className="h-4 w-4 p-0 ml-2"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{customToken.balance} {customToken.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          ${customToken.usdValue.toFixed(4)}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          Your Token
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Regular Balance Cards */}
                <div className="space-y-3">
                  {balancesLoading ? (
                    <p className="text-center py-8 text-muted-foreground">Loading balances...</p>
                  ) : balances.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No crypto assets found</p>
                  ) : (
                    balances.map((balance) => (
                      <div key={balance.currency} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getCurrencyIcon(balance.currency)}
                          <div>
                            <p className="font-medium">{balance.currency}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatAddress(balance.address)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{balance.balance} {balance.symbol}</p>
                          <p className="text-sm text-muted-foreground">
                            ${balance.usdValue.toFixed(2)}
                          </p>
                          <Badge variant={balance.change24h >= 0 ? "default" : "destructive"} className="text-xs">
                            {balance.change24h >= 0 ? '+' : ''}{balance.change24h.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => setActiveTab('send')}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Crypto
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab('receive')}>
                  <ArrowDownUp className="h-4 w-4 mr-2" />
                  Receive Crypto
                </Button>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Buy Crypto
                </Button>
                <Button variant="outline" className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Place Crypto Bet
                </Button>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactionsLoading ? (
                    <p className="text-center py-8 text-muted-foreground">Loading transactions...</p>
                  ) : transactions.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No transactions yet</p>
                  ) : (
                    transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded-full text-white ${getStatusColor(tx.status)}`}>
                            {getStatusIcon(tx.status)}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{tx.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(tx.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.currency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${tx.usdValue.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Send Tab */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Cryptocurrency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  {balances.map((balance) => (
                    <option key={balance.currency} value={balance.currency}>
                      {balance.currency} - {balance.balance} available
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="send-address">Recipient Address</Label>
                <Input
                  id="send-address"
                  placeholder="0x..."
                  value={sendAddress}
                  onChange={(e) => setSendAddress(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="send-amount">Amount</Label>
                <Input
                  id="send-amount"
                  type="number"
                  step="0.000001"
                  placeholder="0.00"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSendCrypto}
                disabled={sendCryptoMutation.isPending || !walletConnection.connected}
                className="w-full"
              >
                {sendCryptoMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Transaction
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receive Tab */}
        <TabsContent value="receive">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownUp className="h-5 w-5" />
                Receive Cryptocurrency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {balances.map((balance) => (
                <div key={balance.currency} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCurrencyIcon(balance.currency)}
                      <span className="font-medium">{balance.currency}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(balance.address)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Your {balance.currency} address:</p>
                  <p className="font-mono text-sm bg-muted p-2 rounded break-all">
                    {balance.address}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactionsLoading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading transactions...</p>
                ) : transactions.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No transactions found</p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full text-white ${getStatusColor(tx.status)}`}>
                          {getStatusIcon(tx.status)}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{tx.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.timestamp).toLocaleString()}
                          </p>
                          {tx.hash && (
                            <p className="text-xs text-muted-foreground font-mono">
                              {formatAddress(tx.hash)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.currency}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${tx.usdValue.toFixed(2)}
                        </p>
                        <Badge variant="outline" className={`capitalize ${
                          tx.status === 'confirmed' ? 'border-green-500 text-green-500' :
                          tx.status === 'failed' ? 'border-red-500 text-red-500' :
                          'border-yellow-500 text-yellow-500'
                        }`}>
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add extra security to your wallet
                    </p>
                  </div>
                  <Switch id="two-factor" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="transaction-notifications">Transaction Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified of all transactions
                    </p>
                  </div>
                  <Switch id="transaction-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-logout">Auto Logout</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically logout after inactivity
                    </p>
                  </div>
                  <Switch id="auto-logout" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Wallet Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="default-currency">Default Currency</Label>
                  <select className="w-full p-2 border rounded-md mt-1">
                    <option value="USD">USD</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="gas-price">Default Gas Price</Label>
                  <select className="w-full p-2 border rounded-md mt-1">
                    <option value="slow">Slow (Low fee)</option>
                    <option value="standard">Standard</option>
                    <option value="fast">Fast (High fee)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="advanced-mode">Advanced Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Show advanced wallet features
                    </p>
                  </div>
                  <Switch id="advanced-mode" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CryptoWallet;
