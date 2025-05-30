import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import WalletSecurityWrapper from './WalletSecurityWrapper';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { connectEthereumWallet, connectPhantomWallet, WalletInfo } from "@/lib/walletConnectors";
import { Wallet, Coins } from "lucide-react";

// Wallet types definition
export enum WalletType {
  METAMASK = 'metamask',
  PHANTOM = 'phantom',
  COINBASE = 'coinbase',
  TRUST = 'trust'
}

// Supported wallet definition
interface SupportedWallet {
  id: WalletType;
  name: string;
  icon: string;
  isInstalled: boolean;
  networkType: 'ethereum' | 'solana';
}

// Props definition
interface WalletConnectProps {
  onConnect?: (walletInfo: WalletInfo, walletType: WalletType) => void;
  onDisconnect?: () => void;
}

// Wallet icons
const WALLET_ICONS = {
  [WalletType.METAMASK]: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  [WalletType.PHANTOM]: "https://www.phantom.app/img/logo.png",
  [WalletType.COINBASE]: "https://www.coinbase.com/assets/press/Coinbase_Wallet_Logo-4e6245acde71d691de3d44ed012a0a2f833a428bcea972b5cf1ef2954the84f58.png", 
  [WalletType.TRUST]: "https://trustwallet.com/assets/images/media/assets/TWT.png"
};

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, onDisconnect }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [supportedWallets, setSupportedWallets] = useState<SupportedWallet[]>([]);

  // Check supported wallets on component mount
  useEffect(() => {
    checkWalletAvailability();
  }, []);

  // Check which wallets are installed
  const checkWalletAvailability = () => {
    const wallets: SupportedWallet[] = [
      {
        id: WalletType.METAMASK,
        name: "MetaMask",
        icon: WALLET_ICONS[WalletType.METAMASK],
        isInstalled: !!window.ethereum?.isMetaMask,
        networkType: 'ethereum'
      },
      {
        id: WalletType.PHANTOM,
        name: "Phantom",
        icon: WALLET_ICONS[WalletType.PHANTOM],
        isInstalled: !!window.solana?.isPhantom,
        networkType: 'solana'
      },
      {
        id: WalletType.COINBASE,
        name: "Coinbase Wallet",
        icon: WALLET_ICONS[WalletType.COINBASE],
        isInstalled: !!window.ethereum?.isCoinbaseWallet,
        networkType: 'ethereum'
      },
      {
        id: WalletType.TRUST,
        name: "Trust Wallet",
        icon: WALLET_ICONS[WalletType.TRUST],
        isInstalled: !!window.ethereum?.isTrust,
        networkType: 'ethereum'
      }
    ];

    setSupportedWallets(wallets);
  };

  // Handle wallet connection
  const handleConnectWallet = async (wallet: SupportedWallet) => {
    if (!wallet.isInstalled) {
      toast({
        title: `${wallet.name} Not Installed`,
        description: `Please install ${wallet.name} extension to connect.`,
        variant: "destructive"
      });
      return;
    }

    setSelectedWallet(wallet.id);
    setIsConnecting(true);

    try {
      let info: WalletInfo;

      if (wallet.networkType === 'ethereum') {
        info = await connectEthereumWallet();
      } else if (wallet.networkType === 'solana') {
        info = await connectPhantomWallet();
      } else {
        throw new Error(`Unsupported network type: ${wallet.networkType}`);
      }

      setWalletInfo(info);
      setIsDialogOpen(false);

      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${wallet.name} on ${info.networkName}`,
      });

      if (onConnect) {
        onConnect(info, wallet.id);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = async () => {
    try {
      // For Phantom wallet, we need to call disconnect
      if (selectedWallet === WalletType.PHANTOM && window.solana) {
        await window.solana.disconnect();
      }

      // Reset states
      setWalletInfo(null);
      setSelectedWallet(null);

      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });

      if (onDisconnect) {
        onDisconnect();
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast({
        title: "Disconnection Failed",
        description: "There was an error disconnecting your wallet.",
        variant: "destructive"
      });
    }
  };

  return (
    <WalletSecurityWrapper>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="default" 
            className="w-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center font-medium"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Select a wallet to connect to WeParlay. You'll be able to deposit, place bets, and withdraw using your crypto wallet.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {supportedWallets.map(wallet => (
              <Card 
                key={wallet.id} 
                className={`cursor-pointer transition-all hover:border-primary ${selectedWallet === wallet.id && isConnecting ? 'border-primary' : ''} ${!wallet.isInstalled ? 'opacity-50' : ''}`}
                onClick={() => !isConnecting && handleConnectWallet(wallet)}
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

      {walletInfo && (
        <Card className="mt-4 bg-card text-card-foreground">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-foreground">Connected Wallet</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src={selectedWallet ? WALLET_ICONS[selectedWallet] : ''}
                  alt={selectedWallet || ""} 
                  className="w-6 h-6 mr-2" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = 'https://placehold.co/200/png';
                  }}
                />
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {supportedWallets.find(w => w.id === selectedWallet)?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {walletInfo.address.substring(0, 8)}...{walletInfo.address.substring(walletInfo.address.length - 6)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Network: {walletInfo.networkName}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Coins className="h-3 w-3 mr-1" />
                    Balance: {walletInfo.balance}
                  </div>
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
    </WalletSecurityWrapper>
  );
};

export default WalletConnect;