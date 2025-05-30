
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  RefreshCw, 
  Copy, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Shield,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  balanceUSD: string;
  price: string;
  change24h: number;
  logo?: string;
  contractAddress?: string;
}

interface Transaction {
  hash: string;
  type: 'send' | 'receive' | 'swap' | 'bet';
  amount: string;
  token: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasFee?: string;
  blockNumber?: number;
}

interface WalletDetails {
  address: string;
  type: 'MetaMask' | 'Phantom' | 'Coinbase' | 'Trust' | 'WalletConnect';
  network: string;
  chainId: string;
  nativeBalance: string;
  nativeBalanceUSD: string;
  totalPortfolioUSD: string;
  tokens: TokenBalance[];
  transactions: Transaction[];
  lastUpdated: string;
  isConnected: boolean;
  gasBalance: string;
}

const CryptoWalletDetails: React.FC = () => {
  const { toast } = useToast();
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    tokens: true,
    transactions: false,
    technical: false
  });

  // Mock wallet data - in production, this would come from actual wallet connections
  const mockWalletData: WalletDetails = {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    type: 'MetaMask',
    network: 'Ethereum Mainnet',
    chainId: '1',
    nativeBalance: '2.4567',
    nativeBalanceUSD: '4,923.45',
    totalPortfolioUSD: '8,456.78',
    gasBalance: '0.05',
    tokens: [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: '2.4567',
        balanceUSD: '4,923.45',
        price: '2,003.21',
        change24h: 2.34,
        logo: '🔷'
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        balance: '1,250.00',
        balanceUSD: '1,250.00',
        price: '1.00',
        change24h: 0.01,
        logo: '💰',
        contractAddress: '0xA0b86a33E6441c22ac8F0dd9ED8AB7a4E6e53f3f'
      },
      {
        symbol: 'USDT',
        name: 'Tether USD',
        balance: '2,283.33',
        balanceUSD: '2,283.33',
        price: '1.00',
        change24h: -0.02,
        logo: '🟢',
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      }
    ],
    transactions: [
      {
        hash: '0xabc123...def456',
        type: 'bet',
        amount: '50.00',
        token: 'USDC',
        timestamp: '2024-01-20T10:30:00Z',
        status: 'confirmed',
        gasFee: '0.002',
        blockNumber: 19123456
      },
      {
        hash: '0x789xyz...123abc',
        type: 'receive',
        amount: '100.00',
        token: 'USDT',
        timestamp: '2024-01-19T15:45:00Z',
        status: 'confirmed',
        gasFee: '0.001',
        blockNumber: 19123455
      },
      {
        hash: '0xdef456...789xyz',
        type: 'send',
        amount: '0.5',
        token: 'ETH',
        timestamp: '2024-01-18T09:15:00Z',
        status: 'pending',
        gasFee: '0.003'
      }
    ],
    lastUpdated: new Date().toISOString(),
    isConnected: true
  };

  useEffect(() => {
    loadWalletDetails();
  }, []);

  const loadWalletDetails = async () => {
    setLoading(true);
    try {
      // In production, this would fetch real wallet data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWalletDetails(mockWalletData);
    } catch (error) {
      toast({
        title: "Error loading wallet",
        description: "Failed to load wallet details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshWalletData = async () => {
    setLoading(true);
    try {
      // Simulate API call to refresh wallet data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the last updated timestamp
      if (walletDetails) {
        setWalletDetails({
          ...walletDetails,
          lastUpdated: new Date().toISOString()
        });
      }
      
      toast({
        title: "Wallet refreshed",
        description: "Your wallet data has been updated with the latest information.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh wallet data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Address copied successfully",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send': return '↗️';
      case 'receive': return '↙️';
      case 'swap': return '🔄';
      case 'bet': return '🎯';
      default: return '📝';
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading && !walletDetails) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading wallet details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!walletDetails) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Wallet Connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect a crypto wallet to view your balance and transaction history.
            </p>
            <Button onClick={() => window.location.href = '/wallet-management-enhanced'}>
              Connect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wallet className="h-6 w-6 mr-2" />
              <div>
                <CardTitle>Crypto Wallet Overview</CardTitle>
                <CardDescription>
                  {walletDetails.type} • {walletDetails.network}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
              >
                {showSensitiveInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshWalletData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Portfolio Value */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg">
              <div className="text-sm opacity-90">Total Portfolio Value</div>
              <div className="text-2xl font-bold">
                {showSensitiveInfo ? `$${walletDetails.totalPortfolioUSD}` : '••••••'}
              </div>
              <div className="text-xs opacity-75 mt-1">
                Last updated: {formatTime(walletDetails.lastUpdated)}
              </div>
            </div>

            {/* Native Balance */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-lg">
              <div className="text-sm opacity-90">Native Balance</div>
              <div className="text-xl font-bold">
                {showSensitiveInfo ? `${walletDetails.nativeBalance} ETH` : '••••••'}
              </div>
              <div className="text-sm opacity-75">
                {showSensitiveInfo ? `≈ $${walletDetails.nativeBalanceUSD}` : '••••••'}
              </div>
            </div>

            {/* Gas Balance */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-lg">
              <div className="text-sm opacity-90">Gas Balance</div>
              <div className="text-xl font-bold">
                {showSensitiveInfo ? `${walletDetails.gasBalance} ETH` : '••••••'}
              </div>
              <div className="text-xs opacity-75 mt-1">
                Available for transactions
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <div className="text-sm font-medium">Wallet Address</div>
              <div className="text-xs text-muted-foreground font-mono">
                {showSensitiveInfo ? walletDetails.address : formatAddress(walletDetails.address)}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(walletDetails.address)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://etherscan.io/address/${walletDetails.address}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tokens">Token Balances</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="technical">Technical Details</TabsTrigger>
        </TabsList>

        {/* Token Balances Tab */}
        <TabsContent value="tokens">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Token Balances</CardTitle>
                <Badge variant="outline">{walletDetails.tokens.length} tokens</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {walletDetails.tokens.map((token, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{token.logo}</div>
                      <div>
                        <div className="font-medium">{token.name}</div>
                        <div className="text-sm text-muted-foreground">{token.symbol}</div>
                        {token.contractAddress && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {formatAddress(token.contractAddress)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {showSensitiveInfo ? token.balance : '••••••'} {token.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {showSensitiveInfo ? `≈ $${token.balanceUSD}` : '••••••'}
                      </div>
                      <div className="flex items-center text-xs">
                        {token.change24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {token.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <CardDescription>
                Your latest wallet activity for betting and transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {walletDetails.transactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{getTransactionIcon(tx.type)}</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium capitalize">{tx.type}</span>
                          <Badge 
                            variant={tx.status === 'confirmed' ? 'default' : 
                                   tx.status === 'pending' ? 'secondary' : 'destructive'}
                          >
                            {tx.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatTime(tx.timestamp)}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {formatAddress(tx.hash)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.token}
                      </div>
                      {tx.gasFee && (
                        <div className="text-xs text-muted-foreground">
                          Gas: {tx.gasFee} ETH
                        </div>
                      )}
                      {tx.blockNumber && (
                        <div className="text-xs text-muted-foreground">
                          Block: {tx.blockNumber}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Details Tab */}
        <TabsContent value="technical">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Information</CardTitle>
              <CardDescription>
                Network details and security information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Network Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium mb-1">Network</div>
                    <div className="text-sm text-muted-foreground">{walletDetails.network}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm font-medium mb-1">Chain ID</div>
                    <div className="text-sm text-muted-foreground">{walletDetails.chainId}</div>
                  </div>
                </div>

                {/* Security Alerts */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security Notice:</strong> Your wallet is connected securely. 
                    WeParlay never stores your private keys or seed phrases.
                  </AlertDescription>
                </Alert>

                {/* Connection Status */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${walletDetails.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium">Connection Status</span>
                  </div>
                  <Badge variant={walletDetails.isConnected ? 'default' : 'destructive'}>
                    {walletDetails.isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>

                {/* Gas Fee Estimation */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Gas Fees:</strong> Current network fees are moderate. 
                    Consider batching transactions to save on gas costs.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CryptoWalletDetails;
