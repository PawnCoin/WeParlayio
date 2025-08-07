import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Wallet, AlertCircle, CheckCircle, Loader2, Globe, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface WalletConnectionProps {
  onConnect?: (walletData: { address: string; type: string; chainId: string }) => void;
  onDisconnect?: () => void;
}

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  installed: boolean;
  provider?: any;
}

interface NetworkInfo {
  chainId: string;
  name: string;
  symbol: string;
}

const WalletConnectionOptimized: React.FC<WalletConnectionProps> = ({ onConnect, onDisconnect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<{ address: string; type: string; chainId: string } | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<NetworkInfo | null>(null);
  const { toast } = useToast();

  // Wallet Detection - Detect if user has web3 wallet extensions installed
  const walletOptions: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Most popular Ethereum wallet',
      installed: typeof (window as any).ethereum !== 'undefined',
      provider: (window as any).ethereum
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Popular Solana wallet',
      installed: typeof (window as any).solana !== 'undefined',
      provider: (window as any).solana
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🟦',
      description: 'User-friendly crypto wallet',
      installed: typeof (window as any).ethereum?.isCoinbaseWallet !== 'undefined',
      provider: (window as any).ethereum
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect any wallet',
      installed: true, // WalletConnect is always available
      provider: null
    }
  ];

  // Removed automatic connection check - MetaMask popup only shows when user clicks "Connect Wallet"

  const updateNetworkInfo = (chainId: string) => {
    const networks: { [key: string]: NetworkInfo } = {
      '0x1': { chainId: '0x1', name: 'Ethereum Mainnet', symbol: 'ETH' },
      '0x89': { chainId: '0x89', name: 'Polygon', symbol: 'MATIC' },
      '0xa86a': { chainId: '0xa86a', name: 'Avalanche', symbol: 'AVAX' },
      '0x38': { chainId: '0x38', name: 'BSC', symbol: 'BNB' }
    };
    setCurrentNetwork(networks[chainId] || { chainId, name: 'Unknown Network', symbol: 'ETH' });
  };

  const handleConnect = async (walletType: string) => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      let walletAddress = '';
      let chainId = '';

      if (walletType === 'metamask' || walletType === 'coinbase') {
        if (!window.ethereum) {
          throw new Error('MetaMask is not installed. Please install it to continue.');
        }

        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length === 0) {
          throw new Error('No accounts found. Please check your wallet.');
        }

        walletAddress = accounts[0];
        chainId = await window.ethereum.request({ method: 'eth_chainId' });
        updateNetworkInfo(chainId);

      } else if (walletType === 'phantom') {
        if (!(window as any).solana) {
          throw new Error('Phantom wallet is not installed. Please install it to continue.');
        }

        const response = await (window as any).solana.connect();
        walletAddress = response.publicKey.toString();
        chainId = 'solana-mainnet';
        setCurrentNetwork({ chainId: 'solana', name: 'Solana Mainnet', symbol: 'SOL' });

      } else {
        throw new Error(`${walletType} wallet connection not yet implemented`);
      }

      // Send connection data to server
      const connectionData = {
        walletAddress: walletAddress,
        walletType: walletType,
        chainId
      };

      console.log('Sending wallet connection data:', connectionData);
      const response = await apiRequest('POST', '/api/wallet/connect', connectionData);
      
      if (response.ok) {
        const result = await response.json();
        
        setConnectedWallet({ address: walletAddress, type: walletType, chainId });
        setIsOpen(false);
        
        toast({
          title: "Wallet Connected Successfully",
          description: `Connected ${walletType} wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        });

        if (onConnect) {
          onConnect({ address: walletAddress, type: walletType, chainId });
        }
      } else {
        throw new Error('Failed to connect wallet to server');
      }

    } catch (error: any) {
      setConnectionError(error.message);
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnectedWallet(null);
    setConnectionError(null);
    setCurrentNetwork(null);
    setIsOpen(false);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been safely disconnected",
    });

    if (onDisconnect) {
      onDisconnect();
    }
  };

  // If wallet is connected, show connected state
  if (connectedWallet) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-green-600/20 border-green-500/30 text-green-100 hover:bg-green-600/30 flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="hidden sm:inline capitalize">{connectedWallet.type}</span>
            <span className="text-xs font-mono">
              {connectedWallet.address.slice(0, 4)}...{connectedWallet.address.slice(-4)}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Wallet Connected</span>
            </DialogTitle>
            <DialogDescription>
              Your {connectedWallet.type} wallet is successfully connected
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium capitalize">{connectedWallet.type}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {connectedWallet.address}
                  </p>
                </div>
              </div>
              
              {currentNetwork && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium">Network</p>
                  <p className="text-sm text-muted-foreground">
                    {currentNetwork.name} ({currentNetwork.symbol})
                  </p>
                </div>
              )}
            </div>
            
            <Button 
              variant="destructive" 
              onClick={handleDisconnect} 
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If no wallet connected, show connection dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white hover:text-green-500 flex items-center"
        >
          <Wallet className="h-4 w-4 mr-1" />
          <span>Connect Wallet</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Connect Your Wallet</span>
          </DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to WeParlay. Make sure you have the wallet extension installed.
          </DialogDescription>
        </DialogHeader>

        {connectionError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {walletOptions.map((wallet) => (
            <Card 
              key={wallet.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                !wallet.installed ? 'opacity-50' : ''
              }`}
              onClick={() => wallet.installed && handleConnect(wallet.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div>
                      <p className="font-medium">{wallet.name}</p>
                      <p className="text-sm text-muted-foreground">{wallet.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {wallet.installed ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Installed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Not Installed
                      </Badge>
                    )}
                    {isConnecting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!walletOptions.some(w => w.installed) && (
          <Alert>
            <Globe className="h-4 w-4" />
            <AlertDescription>
              No supported wallets detected. Please install MetaMask, Phantom, or another supported wallet extension.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground text-center">
          <p>
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
            Your wallet will be used to interact with the Pawn Coin ($PC) token.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectionOptimized;