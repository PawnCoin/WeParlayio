import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    phantom?: any;
  }
}

interface WalletInfo {
  address: string;
  balance: number;
  network: string;
  type: 'metamask' | 'phantom' | 'coinbase' | 'walletconnect';
}

const SUPPORTED_WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    networks: ['Ethereum', 'Polygon', 'Arbitrum'],
    description: 'Most popular Ethereum wallet'
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    networks: ['Solana'],
    description: 'Leading Solana wallet'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    networks: ['Ethereum', 'Polygon'],
    description: 'Secure and user-friendly'
  }
];

export default function WalletConnector() {
  const [connectedWallet, setConnectedWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for existing connection on mount
  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = useCallback(async () => {
    try {
      // Check MetaMask
      if (window.ethereum && window.ethereum.selectedAddress) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectMetaMask(false);
        }
      }
      
      // Check Phantom
      if (window.solana && window.solana.isConnected) {
        await connectPhantom(false);
      }
    } catch (error) {
      console.log('No existing wallet connection found');
    }
  }, []);

  const connectMetaMask = useCallback(async (showToast = true) => {
    if (!window.ethereum) {
      setError('MetaMask not installed. Please install MetaMask browser extension.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      });

      const networkId = await window.ethereum.request({
        method: 'net_version',
      });

      const networkName = getNetworkName(networkId);
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);

      setConnectedWallet({
        address: accounts[0],
        balance: balanceInEth,
        network: networkName,
        type: 'metamask'
      });

      if (showToast) {
        toast({
          title: "Wallet Connected",
          description: `Connected to MetaMask on ${networkName}`,
        });
      }

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setConnectedWallet(null);
          toast({
            title: "Wallet Disconnected",
            description: "MetaMask has been disconnected",
            variant: "destructive"
          });
        } else {
          connectMetaMask(false);
        }
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', () => {
        connectMetaMask(false);
      });

    } catch (error: any) {
      setError(`Failed to connect MetaMask: ${error.message}`);
      if (showToast) {
        toast({
          title: "Connection Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const connectPhantom = useCallback(async (showToast = true) => {
    if (!window.solana || !window.solana.isPhantom) {
      setError('Phantom wallet not installed. Please install Phantom browser extension.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const response = await window.solana.connect();
      const publicKey = response.publicKey.toString();

      // Get SOL balance
      const connection = new (window as any).solanaWeb3.Connection(
        'https://api.mainnet-beta.solana.com'
      );
      const balance = await connection.getBalance(response.publicKey);
      const balanceInSol = balance / Math.pow(10, 9);

      setConnectedWallet({
        address: publicKey,
        balance: balanceInSol,
        network: 'Solana',
        type: 'phantom'
      });

      if (showToast) {
        toast({
          title: "Wallet Connected",
          description: "Connected to Phantom wallet on Solana",
        });
      }

      // Listen for disconnect
      window.solana.on('disconnect', () => {
        setConnectedWallet(null);
        toast({
          title: "Wallet Disconnected",
          description: "Phantom wallet has been disconnected",
          variant: "destructive"
        });
      });

    } catch (error: any) {
      setError(`Failed to connect Phantom: ${error.message}`);
      if (showToast) {
        toast({
          title: "Connection Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const getNetworkName = (networkId: string): string => {
    const networks: { [key: string]: string } = {
      '1': 'Ethereum',
      '137': 'Polygon',
      '42161': 'Arbitrum',
      '56': 'BSC',
      '43114': 'Avalanche'
    };
    return networks[networkId] || 'Unknown Network';
  };

  const disconnectWallet = useCallback(async () => {
    if (connectedWallet) {
      try {
        if (connectedWallet.type === 'phantom' && window.solana) {
          await window.solana.disconnect();
        }
        
        setConnectedWallet(null);
        toast({
          title: "Wallet Disconnected",
          description: "Successfully disconnected wallet",
        });
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
      }
    }
  }, [connectedWallet, toast]);

  const copyAddress = useCallback(() => {
    if (connectedWallet) {
      navigator.clipboard.writeText(connectedWallet.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  }, [connectedWallet, toast]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: number, currency: string) => {
    return `${balance.toFixed(4)} ${currency}`;
  };

  if (connectedWallet) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-400" />
              <span>Wallet Connected</span>
            </div>
            <Badge variant="secondary" className="bg-green-900 text-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div>
              <p className="text-sm text-slate-400">Wallet Type</p>
              <p className="text-white font-semibold">
                {SUPPORTED_WALLETS.find(w => w.id === connectedWallet.type)?.name}
              </p>
            </div>
            <div className="text-2xl">
              {SUPPORTED_WALLETS.find(w => w.id === connectedWallet.type)?.icon}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div>
              <p className="text-sm text-slate-400">Network</p>
              <p className="text-white font-semibold">{connectedWallet.network}</p>
            </div>
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              Connected
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div>
              <p className="text-sm text-slate-400">Address</p>
              <p className="text-white font-mono text-sm">
                {formatAddress(connectedWallet.address)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="text-slate-400 hover:text-white"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div>
              <p className="text-sm text-slate-400">Balance</p>
              <p className="text-white font-semibold">
                {showBalance 
                  ? formatBalance(
                      connectedWallet.balance, 
                      connectedWallet.network === 'Solana' ? 'SOL' : 'ETH'
                    )
                  : '••••••••'
                }
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="text-slate-400 hover:text-white"
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-slate-600 hover:bg-slate-800"
              onClick={() => window.open(`https://etherscan.io/address/${connectedWallet.address}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </Button>
            <Button
              variant="destructive"
              onClick={disconnectWallet}
              className="bg-red-900 hover:bg-red-800"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Wallet className="h-5 w-5 mr-2 text-blue-400" />
          Connect Crypto Wallet
        </CardTitle>
        <p className="text-slate-400 text-sm">
          Connect your wallet to start crypto betting on WeParlay
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {SUPPORTED_WALLETS.map((wallet) => (
            <div
              key={wallet.id}
              className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{wallet.icon}</div>
                <div>
                  <h3 className="text-white font-semibold">{wallet.name}</h3>
                  <p className="text-slate-400 text-sm">{wallet.description}</p>
                  <div className="flex gap-1 mt-1">
                    {wallet.networks.map((network) => (
                      <Badge
                        key={network}
                        variant="outline"
                        className="text-xs border-slate-600 text-slate-300"
                      >
                        {network}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => {
                  if (wallet.id === 'metamask') connectMetaMask();
                  else if (wallet.id === 'phantom') connectPhantom();
                  else toast({
                    title: "Coming Soon",
                    description: `${wallet.name} integration coming soon!`,
                  });
                }}
                disabled={isConnecting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Connect
              </Button>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-700">
          <p className="text-slate-400 text-xs text-center">
            Secure, non-custodial wallet connection. WeParlay never stores your private keys.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}