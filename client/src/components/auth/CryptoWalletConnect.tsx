import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  connectWallet, 
  disconnectWallet, 
  WalletType, 
  ConnectionStatus,
  isMetaMaskAvailable,
  isPhantomAvailable,
  isCoinbaseWalletAvailable,
  isTrustWalletAvailable
} from "@/services/walletService";

// Supported wallet types with availability check
const WALLET_TYPES = [
  { 
    id: WalletType.METAMASK, 
    name: "MetaMask", 
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    isAvailable: isMetaMaskAvailable
  },
  { 
    id: WalletType.PHANTOM, 
    name: "Phantom", 
    icon: "https://www.phantom.app/img/logo.png",
    isAvailable: isPhantomAvailable
  },
  { 
    id: WalletType.COINBASE, 
    name: "Coinbase Wallet", 
    icon: "https://www.coinbase.com/assets/press/Coinbase_Wallet_Logo-4e6245acde71d691de3d44ed012a0a2f833a428bcea972b5cf1ef2954the84f58.png",
    isAvailable: isCoinbaseWalletAvailable
  },
  { 
    id: WalletType.TRUST, 
    name: "Trust Wallet", 
    icon: "https://trustwallet.com/assets/images/media/assets/TWT.png",
    isAvailable: isTrustWalletAvailable
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
  const [availableWallets, setAvailableWallets] = useState<(typeof WALLET_TYPES[0] & { isInstalled?: boolean })[]>(WALLET_TYPES);
  
  // Interface for wallet with installation status
  interface WalletWithStatus extends typeof WALLET_TYPES[0] {
    isInstalled: boolean;
  }
  
  // Check wallet availability
  useEffect(() => {
    const checkWalletAvailability = () => {
      const updatedWallets = WALLET_TYPES.map(wallet => {
        return {
          ...wallet,
          isInstalled: wallet.isAvailable()
        } as WalletWithStatus;
      });
      setAvailableWallets(updatedWallets);
    };
    
    checkWalletAvailability();
  }, []);
  
  // Real wallet connection
  const connectToWallet = async (walletType: string) => {
    setSelectedWallet(walletType);
    setIsConnecting(true);
    
    try {
      // Check if the wallet is installed first
      const walletInfo = WALLET_TYPES.find(w => w.id === walletType);
      if (walletInfo && !walletInfo.isAvailable()) {
        toast({
          title: "Wallet Not Found",
          description: `${walletInfo.name} is not installed. Please install it first.`,
          variant: "destructive"
        });
        setIsConnecting(false);
        return;
      }
      
      const result = await connectWallet(walletType as WalletType);
      
      if (result.status === ConnectionStatus.CONNECTED && result.address) {
        setWalletAddress(result.address);
        setWalletBalance(result.balance || null);
        setWalletNetwork(result.network || null);
        
        toast({
          title: "Wallet Connected",
          description: `Successfully connected to ${walletType} on ${result.network || 'network'}`,
        });
        
        if (onConnect) {
          onConnect(result.address, walletType);
        }
        
        setIsDialogOpen(false);
      } else {
        // Handle connection error
        toast({
          title: "Connection Failed",
          description: result.error || "Failed to connect to wallet. Please try again.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to wallet. Please try again.";
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
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
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.6 4h-8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm4.4 2v12c0 1.1-.9 2-2 2s-2-.9-2-2V6c0-1.1.9-2 2-2s2 .9 2 2z" fill="currentColor"/>
            </svg>
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
            {availableWallets.map(wallet => (
              <Card 
                key={wallet.id} 
                className={`cursor-pointer transition-all ${selectedWallet === wallet.id && isConnecting ? 'border-primary' : 'hover:border-primary'}`}
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
                  {!wallet.isInstalled && (
                    <p className="text-xs text-destructive mt-1">Not installed</p>
                  )}
                  {selectedWallet === wallet.id && isConnecting && (
                    <div className="mt-2 flex items-center justify-center w-full">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
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
                    <p className="text-xs text-muted-foreground">
                      Balance: {walletBalance}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={async () => {
                  try {
                    if (selectedWallet) {
                      await disconnectWallet(selectedWallet as WalletType);
                    }
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
                    toast({
                      title: "Disconnection Failed",
                      description: "Failed to disconnect your wallet. Please try again.",
                      variant: "destructive"
                    });
                  }
                }}
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