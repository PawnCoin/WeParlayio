import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

// Icons
import { Wallet, ArrowRight } from 'lucide-react';
import { SiMetamask, SiCoinbase, SiPhantom, SiTrustwalleticon, SiBinance } from "react-icons/si";

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
    { id: 'metamask', name: 'MetaMask', icon: <SiMetamask className="h-5 w-5 text-orange-500" />, color: 'bg-orange-500' },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: <SiCoinbase className="h-5 w-5 text-blue-500" />, color: 'bg-blue-500' },
    { id: 'phantom', name: 'Phantom', icon: <SiPhantom className="h-5 w-5 text-purple-500" />, color: 'bg-purple-500' },
    { id: 'trustwallet', name: 'Trust Wallet', icon: <SiTrustwalleticon className="h-5 w-5 text-blue-400" />, color: 'bg-blue-400' },
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
              <Button 
                variant="outline" 
                className="w-full justify-between items-center h-14"
                onClick={() => {
                  setOpen(false);
                  toast({
                    title: "Redirecting to WordPress",
                    description: "You'll be redirected to weparlay.io for social login.",
                  });
                }}
              >
                <span>Continue with WordPress Login</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-xs text-center text-muted-foreground mt-4">
              You'll be redirected to the WordPress site at weparlay.io to complete your login.
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