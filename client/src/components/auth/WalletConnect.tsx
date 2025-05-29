import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { 
  connectWallet, 
  disconnectWallet, 
  isMetaMaskAvailable, 
  isPhantomAvailable, 
  isCoinbaseWalletAvailable, 
  isTrustWalletAvailable,
  WalletType, 
  ConnectionStatus 
} from "@/services/walletService";

// Icons
import { Wallet, ArrowRight } from 'lucide-react';
import { SiMetabase, SiCoinbase, SiFantom, SiTrustpilot, SiBinance } from "react-icons/si";

interface WalletConnectProps {
  onConnect?: (address: string, type: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [open, setOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  // List of supported wallets
  const wallets = [
    { id: 'metamask', name: 'MetaMask', icon: <SiMetabase className="h-5 w-5 text-orange-500" />, color: 'bg-orange-500' },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: <SiCoinbase className="h-5 w-5 text-blue-500" />, color: 'bg-blue-500' },
    { id: 'phantom', name: 'Phantom', icon: <SiFantom className="h-5 w-5 text-purple-500" />, color: 'bg-purple-500' },
    { id: 'trustwallet', name: 'Trust Wallet', icon: <SiTrustpilot className="h-5 w-5 text-blue-400" />, color: 'bg-blue-400' },
    { id: 'binance', name: 'Binance Wallet', icon: <SiBinance className="h-5 w-5 text-yellow-500" />, color: 'bg-yellow-500' },
  ];

  // Simulated wallet connection
  const connectWallet = async (walletId: string) => {
    setSelectedWallet(walletId);
    setConnecting(true);

    // Simulate connection delay
    setTimeout(() => {
      setConnecting(false);
      setOpen(false);

      // Generate mock wallet address
      const mockAddress = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      // Notify parent component
      if (onConnect) {
        onConnect(mockAddress, walletId);
      }

      // Show success toast
      toast({
        title: "Wallet Connected",
        description: `Your ${walletId} wallet is now connected to WeParlay.`,
      });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Connect your preferred wallet to login and bet with crypto.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="wallets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wallets">Crypto Wallets</TabsTrigger>
            <TabsTrigger value="social">Social Login</TabsTrigger>
          </TabsList>

          <TabsContent value="wallets" className="space-y-4 py-4">
            <div className="space-y-2">
              {wallets.map((wallet) => (
                <Button 
                  key={wallet.id}
                  variant="outline" 
                  className="w-full justify-between items-center h-14"
                  disabled={connecting}
                  onClick={() => connectWallet(wallet.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${wallet.color} bg-opacity-10`}>
                      {wallet.icon}
                    </div>
                    <span>{wallet.name}</span>
                  </div>

                  {selectedWallet === wallet.id && connecting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              ))}
            </div>

            <div className="text-xs text-center text-muted-foreground mt-4">
              By connecting your wallet, you agree to the <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4 py-4">
            <div className="space-y-2">
              {/* WordPress login removed - app is not WordPress-based */}

              <Button 
                variant="outline" 
                className="w-full justify-between items-center h-14"
                onClick={() => {
                  setOpen(false);
                  toast({
                    title: "Social Login",
                    description: "You'll be redirected to weparlay.io for social login.",
                  });
                  window.location.href = "https://weparlay.io/login";
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-blue-400 bg-opacity-10">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#1DA1F2" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </div>
                  <span>Connect with Twitter</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-between items-center h-14"
                onClick={() => {
                  setOpen(false);
                  toast({
                    title: "Social Login",
                    description: "You'll be redirected to weparlay.io for social login.",
                  });
                  window.location.href = "https://weparlay.io/login";
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-red-500 bg-opacity-10">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="#DB4437" 
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </div>
                  <span>Connect with Google</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-xs text-center text-muted-foreground mt-4">
              You'll be redirected to weparlay.io to complete your login through your preferred social platform.
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-start">
          <Button 
            variant="secondary" 
            onClick={() => setOpen(false)}
            disabled={connecting}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnect;