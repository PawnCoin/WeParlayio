import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Coins } from "lucide-react";

// Add global window type declaration for TypeScript
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isTrust?: boolean;
      request: (args: any) => Promise<any>;
    };
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
    };
  }
}

// Wallet types
enum WalletType {
  METAMASK = 'metamask',
  PHANTOM = 'phantom',
  COINBASE = 'coinbase',
  TRUST = 'trust'
}

// Supported wallets
const WALLET_TYPES = [
  { 
    id: WalletType.METAMASK, 
    name: "MetaMask", 
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
  },
  { 
    id: WalletType.PHANTOM, 
    name: "Phantom", 
    icon: "https://www.phantom.app/img/logo.png"
  },
  { 
    id: WalletType.COINBASE, 
    name: "Coinbase Wallet", 
    icon: "https://www.coinbase.com/assets/press/Coinbase_Wallet_Logo-4e6245acde71d691de3d44ed012a0a2f833a428bcea972b5cf1ef2954the84f58.png"
  },
  { 
    id: WalletType.TRUST, 
    name: "Trust Wallet", 
    icon: "https://trustwallet.com/assets/images/media/assets/TWT.png"
  }
];

interface CryptoWalletConnectProps {
  onConnect?: (walletAddress: string, walletType: string) => void;
}

const CryptoWalletConnect: React.FC<CryptoWalletConnectProps> = ({ onConnect }) => {
  const { toast } = useToast();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [walletNetwork, setWalletNetwork] = useState<string | null>(null);
  const [installedWallets, setInstalledWallets] = useState<Record<string, boolean>>({});
  
  // Check installed wallets on component mount
  useEffect(() => {
    checkInstalledWallets();
  }, []);
  
  // Check which wallets are installed
  const checkInstalledWallets = () => {
    const walletStatus = {
      [WalletType.METAMASK]: !!window.ethereum?.isMetaMask,
      [WalletType.PHANTOM]: !!window.solana?.isPhantom,
      [WalletType.COINBASE]: !!window.ethereum?.isCoinbaseWallet,
      [WalletType.TRUST]: !!window.ethereum?.isTrust
    };
    
    setInstalledWallets(walletStatus);
  };
  
  // Connect to Ethereum wallet (MetaMask, Coinbase, Trust)
  const connectEthereumWallet = async (walletType: WalletType) => {
    if (!window.ethereum) {
      throw new Error(`${walletType} is not installed`);
    }
    
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    const address = accounts[0];
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    // Get network name
    let network = 'Unknown Network';
    switch (chainId) {
      case '0x1': network = 'Ethereum Mainnet'; break;
      case '0x89': network = 'Polygon'; break;
      case '0x38': network = 'Binance Smart Chain'; break;
      default: network = `Chain ID: ${parseInt(chainId, 16)}`;
    }
    
    // Get balance
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    
    const balanceInEth = (parseInt(balance, 16) / 1e18).toFixed(4);
    
    return {
      address,
      network,
      balance: balanceInEth
    };
  };
  
  // Connect to Phantom (Solana)
  const connectPhantomWallet = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom wallet is not installed');
    }
    
    const resp = await window.solana.connect();
    const address = resp.publicKey.toString();
    
    return {
      address,
      network: 'Solana',
      balance: '0.00' // Would require RPC calls to get actual balance
    };
  };
  
  // Connect wallet based on type
  const connectToWallet = async (walletType: string) => {
    setSelectedWallet(walletType);
    setIsConnecting(true);
    
    try {
      let walletInfo;
      
      // Choose wallet connection method based on type
      if (walletType === WalletType.PHANTOM) {
        walletInfo = await connectPhantomWallet();
      } else {
        walletInfo = await connectEthereumWallet(walletType as WalletType);
      }
      
      setWalletAddress(walletInfo.address);
      setWalletBalance(walletInfo.balance);
      setWalletNetwork(walletInfo.network);
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${walletType} on ${walletInfo.network}`,
      });
      
      if (onConnect) {
        onConnect(walletInfo.address, walletType);
      }
      
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Wallet connection error:", err);
      const error = err as Error;
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to wallet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Function to disconnect wallet
  const handleDisconnectWallet = async () => {
    try {
      // For Phantom wallets, handle special disconnect
      if (selectedWallet === WalletType.PHANTOM && window.solana?.isPhantom) {
        await window.solana.disconnect();
      }
      
      // Reset states
      setWalletAddress("");
      setWalletBalance(null);
      setWalletNetwork(null);
      setSelectedWallet(null);
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
    } catch (err) {
      console.error("Failed to disconnect wallet:", err);
      const error = err as Error;
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect your wallet",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="default" 
            className="w-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center font-medium"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect Crypto Wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Select a wallet to connect to WeParlay. You'll be able to sign in, deposit, and withdraw using your crypto wallet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {WALLET_TYPES.map((wallet) => {
              const walletInstalled = isWalletInstalled(wallet.id);
              return (
                <Card 
                  key={wallet.id} 
                  className={`cursor-pointer transition-all ${selectedWallet === wallet.id && isConnecting ? 'border-primary' : 'hover:border-primary'} ${!walletInstalled ? 'opacity-50' : ''}`}
                  onClick={() => !isConnecting && connectToWallet(wallet.id)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <img 
                      src={wallet.icon} 
                      alt={wallet.name} 
                      className="w-12 h-12 mb-2" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src = 'https://placehold.co/200/png';
                      }}
                    />
                    <p className="text-sm font-medium text-foreground">{wallet.name}</p>
                    {!walletInstalled && (
                      <p className="text-xs text-destructive mt-1">Not installed</p>
                    )}
                    {selectedWallet === wallet.id && isConnecting && (
                      <div className="mt-2 flex items-center justify-center w-full">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground mb-4 sm:mb-0">
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
            </p>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isConnecting}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {walletAddress && (
        <Card className="mt-4 bg-card text-card-foreground">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-foreground">Connected Wallet</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src={WALLET_TYPES.find(w => w.id === selectedWallet)?.icon} 
                  alt={selectedWallet || ""} 
                  className="w-6 h-6 mr-2" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = 'https://placehold.co/200/png';
                  }}
                />
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {WALLET_TYPES.find(w => w.id === selectedWallet)?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 6)}
                  </p>
                  {walletNetwork && (
                    <p className="text-xs text-muted-foreground">
                      Network: {walletNetwork}
                    </p>
                  )}
                  {walletBalance && (
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Coins className="h-3 w-3 mr-1" />
                      Balance: {walletBalance}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDisconnectWallet}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default CryptoWalletConnect;