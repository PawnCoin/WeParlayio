import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  LogOut,
  Copy,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

// Supported wallet types
const walletTypes = [
  { id: 'metamask', name: 'MetaMask', icon: '🦊' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '📱' },
  { id: 'walletconnect', name: 'WalletConnect', icon: '🔗' },
  { id: 'phantom', name: 'Phantom', icon: '👻' },
  { id: 'brave', name: 'Brave Wallet', icon: '🦁' },
  { id: 'trustwallet', name: 'Trust Wallet', icon: '🔐' },
];

interface WalletConnectProps {
  onConnect?: (wallet: { address: string; type: string }) => void;
  onDisconnect?: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ 
  onConnect, 
  onDisconnect 
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate connecting to a wallet
  const connectWallet = async (walletId: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      // Here we would normally call the actual wallet connection logic
      // For now, we'll simulate a successful connection after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a random address for demonstration
      const address = '0x' + Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      setWalletAddress(address);
      setWalletType(walletId);
      setIsDialogOpen(false);
      
      if (onConnect) {
        onConnect({ address, type: walletId });
      }
    } catch (err) {
      setError('Failed to connect to wallet. Please try again.');
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletAddress(null);
    setWalletType(null);
    
    if (onDisconnect) {
      onDisconnect();
    }
  };

  // Copy wallet address to clipboard
  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Get wallet name from ID
  const getWalletName = (id: string) => {
    return walletTypes.find(wallet => wallet.id === id)?.name || id;
  };

  return (
    <div>
      {walletAddress ? (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <Badge variant="outline" className="bg-white dark:bg-gray-800 mr-2">
                {walletTypes.find(w => w.id === walletType)?.icon || '💼'}
              </Badge>
              <div>
                <div className="text-sm font-medium">{getWalletName(walletType || '')}</div>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{formatAddress(walletAddress)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{walletAddress}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 ml-1" 
                    onClick={copyToClipboard}
                  >
                    {copySuccess ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={disconnectWallet}
              className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Disconnect
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs" 
            onClick={() => window.open(`https://etherscan.io/address/${walletAddress}`, '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View on Etherscan
          </Button>
        </div>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect your wallet</DialogTitle>
              <DialogDescription>
                Select a wallet to connect to WeParlay.io
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="flex items-center p-3 mb-3 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-md">
                <AlertCircle className="h-4 w-4 mr-2" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 py-4">
              {walletTypes.map((wallet) => (
                <Button
                  key={wallet.id}
                  variant="outline"
                  className="flex flex-col items-center justify-center h-20 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                  disabled={isConnecting}
                  onClick={() => connectWallet(wallet.id)}
                >
                  <span className="text-2xl mb-1">{wallet.icon}</span>
                  <span className="text-sm font-medium">{wallet.name}</span>
                </Button>
              ))}
            </div>

            <DialogFooter className="sm:justify-start">
              <Button 
                variant="secondary" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isConnecting}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default WalletConnect;