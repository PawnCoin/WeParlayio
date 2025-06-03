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

  // 1. Wallet Detection - Detect if user has web3 wallet extensions installed
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
      description: 'Solana wallet for Web3',
      installed: typeof (window as any).solana !== 'undefined',
      provider: (window as any).solana
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Coinbase Wallet extension',
      installed: !!(window as any).coinbaseWalletExtension,
      provider: (window as any).coinbaseWalletExtension
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: '🛡️',
      description: 'Multi-cryptocurrency wallet',
      installed: !!(window as any).trustwallet,
      provider: (window as any).trustwallet
    }
  ];

  // Network configurations for different chains
  const supportedNetworks = {
    '0x1': { name: 'Ethereum Mainnet', symbol: 'ETH' },
    '0x89': { name: 'Polygon', symbol: 'MATIC' },
    '0xa': { name: 'Optimism', symbol: 'ETH' },
    '0xa4b1': { name: 'Arbitrum', symbol: 'ETH' }
  };

  // 4. Account Handling - Subscribe to wallet events
  useEffect(() => {
    if (connectedWallet && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          handleDisconnect();
        } else if (accounts[0] !== connectedWallet.address) {
          // User switched account
          setConnectedWallet(prev => prev ? { ...prev, address: accounts[0] } : null);
          toast({
            title: "Account Changed",
            description: `Switched to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          });
        }
      };

      const handleChainChanged = (chainId: string) => {
        const networkInfo = supportedNetworks[chainId as keyof typeof supportedNetworks];
        if (networkInfo) {
          setCurrentNetwork({ chainId, ...networkInfo });
          setConnectedWallet(prev => prev ? { ...prev, chainId } : null);
          toast({
            title: "Network Changed",
            description: `Switched to ${networkInfo.name}`,
          });
        }
      };

      // Subscribe to events
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [connectedWallet, toast]);

  // 2. Connect Button Logic - Secure, user-triggered wallet connection
  const handleWalletConnect = async (walletType: string) => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      let walletAddress = '';
      let chainId = '';

      // 5. Security & Privacy - Only request permissions we need, never auto-connect
      if (walletType === 'metamask' && (window as any).ethereum) {
        try {
          // Request account access - user must approve
          const accounts = await (window as any).ethereum.request({
            method: 'eth_requestAccounts'
          });
          walletAddress = accounts[0];

          // 3. Network Detection & Switching - Get current network
          chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
          
          const networkInfo = supportedNetworks[chainId as keyof typeof supportedNetworks];
          if (networkInfo) {
            setCurrentNetwork({ chainId, ...networkInfo });
          } else {
            // Prompt to switch to supported network
            toast({
              title: "Unsupported Network",
              description: "Please switch to Ethereum, Polygon, Optimism, or Arbitrum",
              variant: "destructive",
            });
            return;
          }

        } catch (error: any) {
          // 6. UI Feedback - User-friendly error explanations
          if (error.code === 4001) {
            throw new Error('Please approve the connection in your MetaMask wallet');
          }
          throw new Error(`MetaMask connection failed: ${error.message}`);
        }
      } else if (walletType === 'phantom' && (window as any).solana) {
        try {
          const response = await (window as any).solana.connect();
          walletAddress = response.publicKey.toString();
          chainId = 'solana-mainnet';
        } catch (error: any) {
          if (error.code === 4001) {
            throw new Error('Please approve the connection in your Phantom wallet');
          }
          throw new Error(`Phantom connection failed: ${error.message}`);
        }
      } else if (!walletOptions.find(w => w.id === walletType)?.installed) {
        // Fallback - guide user to install wallet
        throw new Error(`${walletType} wallet not detected. Please install the ${walletType} extension first.`);
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
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been safely disconnected",
    });

    if (onDisconnect) {
      onDisconnect();
    }
  };

  if (connectedWallet) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* 6. UI Feedback - Clear connection status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium capitalize">{connectedWallet.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>

            {/* Network Information */}
            {currentNetwork && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{currentNetwork.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {currentNetwork.symbol}
                </Badge>
              </div>
            )}

            {/* 10. Compliance - Privacy and security notice */}
            <div className="text-xs text-muted-foreground border-t pt-2">
              <div className="flex items-start space-x-2">
                <Shield className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <p>
                  Your private keys never leave your wallet. WeParlay only requests permissions for 
                  necessary transactions and account information.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Wallet className="h-4 w-4" />
          <span>Connect Wallet</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
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

        <div className="grid gap-3">
          {walletOptions.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className="flex items-center justify-start space-x-3 p-4 h-auto"
              disabled={isConnecting || !wallet.installed}
              onClick={() => handleWalletConnect(wallet.id)}
            >
              {isConnecting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="text-xl">{wallet.icon}</span>
              )}
              <div className="text-left flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{wallet.name}</p>
                  {wallet.installed && (
                    <Badge variant="secondary" className="text-xs">Detected</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{wallet.description}</p>
                {!wallet.installed && (
                  <p className="text-xs text-red-500">Extension not detected</p>
                )}
              </div>
            </Button>
          ))}
        </div>

        {/* 7. Fallback Support - Guide users to install wallets */}
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Don't have a wallet? Install from official sources:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a 
              href="https://metamask.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              MetaMask →
            </a>
            <a 
              href="https://phantom.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Phantom →
            </a>
          </div>
        </div>

        {/* 10. Compliance - Security and privacy disclaimers */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Security Notice:</p>
              <p>
                • Your private keys remain secure in your wallet
              </p>
              <p>
                • WeParlay only requests necessary permissions
              </p>
              <p>
                • No sensitive data is stored on our servers
              </p>
              <p>
                • By connecting, you consent to transaction requests for betting activities
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectionOptimized;