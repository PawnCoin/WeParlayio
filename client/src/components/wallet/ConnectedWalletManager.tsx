import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Wallet, 
  CheckCircle2, 
  Shield, 
  AlertTriangle, 
  Copy, 
  RefreshCw, 
  Plus, 
  ExternalLink, 
  Trash2, 
  PencilLine
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ConnectedWallet {
  id: string;
  name: string;
  address: string;
  type: 'MetaMask' | 'WalletConnect' | 'Coinbase' | 'Trust' | 'Other';
  chain: 'Ethereum' | 'Polygon' | 'Binance' | 'Bitcoin' | 'Other';
  chainId: string;
  lastUsed: string;
  isDefault: boolean;
}

const chainColors: Record<string, string> = {
  Ethereum: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Polygon: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  Binance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Bitcoin: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  Other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
};

const ConnectedWalletManager: React.FC = () => {
  const { toast } = useToast();
  const [wallets, setWallets] = useState<ConnectedWallet[]>([
    {
      id: '1',
      name: 'My Main Wallet',
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      type: 'MetaMask',
      chain: 'Ethereum',
      chainId: '1',
      lastUsed: '2023-05-16T14:30:00Z',
      isDefault: true
    },
    {
      id: '2',
      name: 'Polygon Wallet',
      address: '0x22e9F35Cc9932C0532925a3b844Bc454e4438f5Be',
      type: 'WalletConnect',
      chain: 'Polygon',
      chainId: '137',
      lastUsed: '2023-05-15T10:15:00Z',
      isDefault: false
    }
  ]);
  
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<ConnectedWallet | null>(null);
  const [currentBalance, setCurrentBalance] = useState({
    eth: '1.45',
    usd: '4,235.67'
  });
  
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
    });
  };
  
  const connectWallet = () => {
    // In a real implementation, this would use Web3 libraries to connect to the wallet
    toast({
      title: "Wallet connected",
      description: "Your crypto wallet has been successfully connected",
    });
    setShowConnectDialog(false);
  };
  
  const disconnectWallet = (walletId: string) => {
    if (confirm('Are you sure you want to disconnect this wallet?')) {
      setWallets(wallets.filter(wallet => wallet.id !== walletId));
      toast({
        title: "Wallet disconnected",
        description: "The wallet has been removed from your account",
      });
    }
  };
  
  const setDefaultWallet = (walletId: string) => {
    setWallets(wallets.map(wallet => ({
      ...wallet,
      isDefault: wallet.id === walletId
    })));
    toast({
      title: "Default wallet updated",
      description: "Your default wallet has been updated",
    });
  };
  
  const editWallet = (wallet: ConnectedWallet) => {
    setSelectedWallet(wallet);
    setShowEditDialog(true);
  };
  
  const saveWalletChanges = () => {
    if (!selectedWallet) return;
    
    setWallets(wallets.map(wallet => 
      wallet.id === selectedWallet.id ? selectedWallet : wallet
    ));
    
    setShowEditDialog(false);
    toast({
      title: "Wallet updated",
      description: "Your wallet details have been updated",
    });
  };
  
  const refreshBalances = () => {
    // In a real implementation, this would fetch the latest balances from the blockchain
    setCurrentBalance({
      eth: (parseFloat(currentBalance.eth) + Math.random() * 0.01).toFixed(2),
      usd: (parseFloat(currentBalance.usd.replace(',', '')) + Math.random() * 10).toFixed(2)
    });
    
    toast({
      title: "Balances refreshed",
      description: "Your wallet balances have been updated",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center">
                <Wallet className="mr-2 h-5 w-5" />
                Connected Wallets
              </CardTitle>
              <CardDescription>
                Manage your cryptocurrency wallets for betting and withdrawals
              </CardDescription>
            </div>
            <Button onClick={() => setShowConnectDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Connect Wallet
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {wallets.length === 0 ? (
            <div className="text-center p-6 bg-muted/20 rounded-lg">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg mb-1">No wallets connected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect a cryptocurrency wallet to place bets using crypto and receive instant withdrawals.
              </p>
              <Button onClick={() => setShowConnectDialog(true)}>
                Connect Your First Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Balance Card */}
              <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-blue-100">Current Balance</p>
                      <h3 className="text-2xl font-bold">{currentBalance.eth} ETH</h3>
                      <p className="text-lg text-blue-100">${currentBalance.usd} USD</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="text-white hover:bg-white/10" 
                      size="sm"
                      onClick={refreshBalances}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                    </Button>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
                    <div className="text-sm text-blue-100">
                      <span className="inline-flex items-center mr-4">
                        <Shield className="h-4 w-4 mr-1" /> Secured
                      </span>
                      <span className="inline-flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Verified
                      </span>
                    </div>
                    
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      <ExternalLink className="h-3 w-3 mr-1" /> View on Etherscan
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Connected Wallets Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Network</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallets.map((wallet) => (
                      <TableRow key={wallet.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                              <Wallet className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center">
                                {wallet.name}
                                {wallet.isDefault && (
                                  <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">{wallet.type}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-mono">{formatAddress(wallet.address)}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 ml-1"
                              onClick={() => copyAddress(wallet.address)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${chainColors[wallet.chain]} font-normal`}>
                            {wallet.chain}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(wallet.lastUsed).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => editWallet(wallet)}
                            >
                              <PencilLine className="h-4 w-4" />
                            </Button>
                            {!wallet.isDefault && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => setDefaultWallet(wallet.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => disconnectWallet(wallet.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Security Alert */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Security Notice</AlertTitle>
                <AlertDescription>
                  Never share your private keys or seed phrases. WeParlay will never ask for this information.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Connect Wallet Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect a Wallet</DialogTitle>
            <DialogDescription>
              Choose a wallet provider to connect with WeParlay
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={connectWallet} variant="outline" className="flex-col h-24 space-y-2">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="font-medium">MetaMask</span>
              </Button>
              <Button onClick={connectWallet} variant="outline" className="flex-col h-24 space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-medium">WalletConnect</span>
              </Button>
              <Button onClick={connectWallet} variant="outline" className="flex-col h-24 space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-medium">Coinbase</span>
              </Button>
              <Button onClick={connectWallet} variant="outline" className="flex-col h-24 space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-medium">Trust Wallet</span>
              </Button>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
            <div className="text-xs text-muted-foreground mb-4 sm:mb-0">
              By connecting, you agree to WeParlay's Terms of Service
            </div>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Wallet Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Wallet</DialogTitle>
            <DialogDescription>
              Update your wallet details
            </DialogDescription>
          </DialogHeader>
          
          {selectedWallet && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="wallet-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="wallet-name"
                  value={selectedWallet.name}
                  onChange={(e) => setSelectedWallet({...selectedWallet, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Address
                </Label>
                <div className="col-span-3 flex items-center">
                  <Input
                    value={formatAddress(selectedWallet.address)}
                    readOnly
                    className="bg-muted font-mono text-muted-foreground"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-2"
                    onClick={() => copyAddress(selectedWallet.address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Network
                </Label>
                <div className="col-span-3">
                  <Badge className={`${chainColors[selectedWallet.chain]} font-normal`}>
                    {selectedWallet.chain} (Chain ID: {selectedWallet.chainId})
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveWalletChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConnectedWalletManager;