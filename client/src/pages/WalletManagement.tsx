import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import CryptoWalletConnect from "@/components/auth/CryptoWalletConnect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bitcoin, Wallet, Coins, ArrowUpRight, ArrowDownLeft, CreditCard, History, RefreshCw } from "lucide-react";

// Connected wallet interface
interface ConnectedWallet {
  type: string;
  address: string;
  network: string;
  balance: string;
  transactions?: Transaction[];
}

// Transaction interface
interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win';
  amount: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  hash?: string;
}

// Initial sample transactions (can be replaced with actual API data)
const initialTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: '0.25',
    currency: 'ETH',
    status: 'completed',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    hash: '0x1234...5678'
  },
  {
    id: '2',
    type: 'bet',
    amount: '0.1',
    currency: 'ETH',
    status: 'completed',
    timestamp: new Date(Date.now() - 43200000), // 12 hours ago
  },
  {
    id: '3',
    type: 'win',
    amount: '0.2',
    currency: 'ETH',
    status: 'completed',
    timestamp: new Date(Date.now() - 21600000), // 6 hours ago
  }
];

const WalletManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<ConnectedWallet | null>(null);
  const [activeTab, setActiveTab] = useState('wallets');

  // Handler for wallet connection
  const handleWalletConnect = (walletAddress: string, walletType: string) => {
    // Determine wallet network and icon based on type
    let network = 'Unknown Network';
    let balance = '0.00';
    
    if (walletType === 'metamask' || walletType === 'coinbase' || walletType === 'trust') {
      network = 'Ethereum Mainnet';
      
      // For real implementation, we would fetch these from the blockchain
      // Using dummy values for demonstration
      balance = (Math.random() * 2).toFixed(4);
    } else if (walletType === 'phantom') {
      network = 'Solana';
      balance = (Math.random() * 10).toFixed(4);
    }
    
    // Add the connected wallet to the list
    const newWallet: ConnectedWallet = {
      type: walletType,
      address: walletAddress,
      network,
      balance,
      transactions: initialTransactions
    };
    
    setConnectedWallets([...connectedWallets, newWallet]);
    setIsWalletModalOpen(false);
    
    toast({
      title: "Wallet Connected",
      description: `Successfully connected to ${walletType} on ${network}`,
    });
  };
  
  // Handler for disconnecting wallet
  const handleDisconnectWallet = (walletAddress: string) => {
    setConnectedWallets(connectedWallets.filter(wallet => wallet.address !== walletAddress));
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected from your account",
    });
  };
  
  // Handler for deposit
  const handleDeposit = () => {
    if (!selectedWallet) {
      toast({
        title: "No Wallet Selected",
        description: "Please select a wallet for deposit",
        variant: "destructive"
      });
      return;
    }
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, this would interact with a blockchain wallet
    toast({
      title: "Deposit Initiated",
      description: `Your deposit of ${depositAmount} to WeParlay is being processed`,
    });
    
    // Close the deposit modal and reset form
    setIsDepositModalOpen(false);
    setDepositAmount('');
    setSelectedWallet(null);
  };
  
  // Handler for withdrawal
  const handleWithdraw = () => {
    if (!selectedWallet) {
      toast({
        title: "No Wallet Selected",
        description: "Please select a wallet for withdrawal",
        variant: "destructive"
      });
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, this would interact with a blockchain wallet
    toast({
      title: "Withdrawal Initiated",
      description: `Your withdrawal of ${withdrawAmount} is being processed`,
    });
    
    // Close the withdrawal modal and reset form
    setIsWithdrawModalOpen(false);
    setWithdrawAmount('');
    setSelectedWallet(null);
  };
  
  // Get transactions across all wallets
  const getAllTransactions = () => {
    const allTransactions: (Transaction & { wallet: string })[] = [];
    
    connectedWallets.forEach(wallet => {
      if (wallet.transactions) {
        wallet.transactions.forEach(transaction => {
          allTransactions.push({
            ...transaction,
            wallet: wallet.address
          });
        });
      }
    });
    
    // Sort by date, newest first
    return allTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Cryptocurrency Wallet Management</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="wallets">My Wallets</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="deposit-withdraw">Deposit & Withdraw</TabsTrigger>
        </TabsList>
        
        {/* Wallets Tab */}
        <TabsContent value="wallets">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedWallets.map((wallet, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-primary/5 pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Wallet className="h-5 w-5 mr-2" />
                      {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDisconnectWallet(wallet.address)}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                    >
                      Disconnect
                    </Button>
                  </CardTitle>
                  <CardDescription>{wallet.network}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-2">
                    <Label className="text-xs text-muted-foreground">Wallet Address</Label>
                    <p className="text-sm font-mono break-all">{wallet.address.substring(0, 8)}...{wallet.address.substring(wallet.address.length - 6)}</p>
                  </div>
                  <div className="mt-4">
                    <Label className="text-xs text-muted-foreground">Balance</Label>
                    <div className="flex items-center font-medium mt-1">
                      <Coins className="h-4 w-4 mr-2" />
                      {wallet.balance} {wallet.type === 'phantom' ? 'SOL' : 'ETH'}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-[48%]"
                    onClick={() => {
                      setSelectedWallet(wallet);
                      setIsDepositModalOpen(true);
                    }}
                  >
                    <ArrowDownLeft className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-[48%]"
                    onClick={() => {
                      setSelectedWallet(wallet);
                      setIsWithdrawModalOpen(true);
                    }}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {/* Add Wallet Card */}
            <Card className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:bg-primary/5 transition-colors">
              <div 
                className="text-center"
                onClick={() => setIsWalletModalOpen(true)}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Connect a Wallet</h3>
                <p className="text-sm text-muted-foreground">Add a cryptocurrency wallet to deposit, withdraw and bet</p>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Transaction History</span>
                <Button variant="outline" size="sm" className="h-8">
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
              <CardDescription>
                Your recent cryptocurrency transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getAllTransactions().length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-2 text-sm font-medium">Type</th>
                        <th className="pb-2 text-sm font-medium">Amount</th>
                        <th className="pb-2 text-sm font-medium">Date</th>
                        <th className="pb-2 text-sm font-medium">Status</th>
                        <th className="pb-2 text-sm font-medium">Wallet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAllTransactions().map((tx, i) => (
                        <tr key={i} className="border-b last:border-b-0">
                          <td className="py-3 text-sm">
                            <span className="flex items-center">
                              {tx.type === 'deposit' && <ArrowDownLeft className="h-4 w-4 mr-2 text-green-500" />}
                              {tx.type === 'withdrawal' && <ArrowUpRight className="h-4 w-4 mr-2 text-amber-500" />}
                              {tx.type === 'bet' && <CreditCard className="h-4 w-4 mr-2 text-blue-500" />}
                              {tx.type === 'win' && <Coins className="h-4 w-4 mr-2 text-purple-500" />}
                              {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 text-sm">
                            {tx.type === 'withdrawal' || tx.type === 'bet' ? '- ' : '+ '}
                            {tx.amount} {tx.currency}
                          </td>
                          <td className="py-3 text-sm">
                            {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="py-3 text-sm">
                            <span className={`
                              px-2 py-1 rounded-full text-xs
                              ${tx.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : ''}
                              ${tx.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' : ''}
                              ${tx.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' : ''}
                            `}>
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 text-sm font-mono">
                            {tx.wallet.substring(0, 6)}...{tx.wallet.substring(tx.wallet.length - 4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No Transactions Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Connect a wallet and start depositing or betting to see your transaction history here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Deposit & Withdraw Tab */}
        <TabsContent value="deposit-withdraw">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowDownLeft className="h-5 w-5 mr-2 text-green-500" />
                  Deposit Funds
                </CardTitle>
                <CardDescription>
                  Add cryptocurrency to your WeParlay account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm">
                  Choose a wallet and enter the amount you want to deposit into your WeParlay account.
                </p>
                
                {connectedWallets.length > 0 ? (
                  <Button 
                    className="w-full" 
                    onClick={() => setIsDepositModalOpen(true)}
                  >
                    <ArrowDownLeft className="h-4 w-4 mr-2" />
                    Make a Deposit
                  </Button>
                ) : (
                  <div className="text-center py-4 border rounded-lg border-dashed">
                    <Wallet className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground mb-4">No wallets connected</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsWalletModalOpen(true)}
                    >
                      Connect Wallet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowUpRight className="h-5 w-5 mr-2 text-amber-500" />
                  Withdraw Funds
                </CardTitle>
                <CardDescription>
                  Withdraw your funds to a cryptocurrency wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm">
                  Choose a wallet and enter the amount you want to withdraw from your WeParlay account.
                </p>
                
                {connectedWallets.length > 0 ? (
                  <Button 
                    className="w-full" 
                    onClick={() => setIsWithdrawModalOpen(true)}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Make a Withdrawal
                  </Button>
                ) : (
                  <div className="text-center py-4 border rounded-lg border-dashed">
                    <Wallet className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground mb-4">No wallets connected</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsWalletModalOpen(true)}
                    >
                      Connect Wallet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Connect Wallet Modal */}
      <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Cryptocurrency Wallet</DialogTitle>
            <DialogDescription>
              Connect a wallet to deposit, withdraw and place bets with cryptocurrency
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <CryptoWalletConnect onConnect={handleWalletConnect} />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Deposit Modal */}
      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Cryptocurrency</DialogTitle>
            <DialogDescription>
              Add funds to your WeParlay account from your wallet
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="wallet">Select Wallet</Label>
              <select 
                id="wallet"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(e) => {
                  const wallet = connectedWallets.find(w => w.address === e.target.value);
                  setSelectedWallet(wallet || null);
                }}
                value={selectedWallet?.address || ""}
              >
                <option value="" disabled>Select a wallet</option>
                {connectedWallets.map((wallet, index) => (
                  <option key={index} value={wallet.address}>
                    {wallet.type} - {wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="amount">Deposit Amount</Label>
              <div className="flex items-center">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2">
                  {selectedWallet?.type === 'phantom' ? 'SOL' : 'ETH'}
                </span>
              </div>
            </div>
            
            {selectedWallet && (
              <div className="bg-primary/5 p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
                <p className="font-medium">
                  {selectedWallet.balance} {selectedWallet.type === 'phantom' ? 'SOL' : 'ETH'}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDepositModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeposit}>Confirm Deposit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Withdraw Modal */}
      <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Cryptocurrency</DialogTitle>
            <DialogDescription>
              Withdraw funds from your WeParlay account to your wallet
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="withdraw-wallet">Select Wallet</Label>
              <select 
                id="withdraw-wallet"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(e) => {
                  const wallet = connectedWallets.find(w => w.address === e.target.value);
                  setSelectedWallet(wallet || null);
                }}
                value={selectedWallet?.address || ""}
              >
                <option value="" disabled>Select a wallet</option>
                {connectedWallets.map((wallet, index) => (
                  <option key={index} value={wallet.address}>
                    {wallet.type} - {wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="withdraw-amount">Withdraw Amount</Label>
              <div className="flex items-center">
                <Input
                  id="withdraw-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2">
                  {selectedWallet?.type === 'phantom' ? 'SOL' : 'ETH'}
                </span>
              </div>
            </div>
            
            <div className="bg-primary/5 p-3 rounded-md">
              <p className="text-xs text-muted-foreground mb-1">WeParlay Account Balance</p>
              <p className="font-medium">
                {user?.balance?.toFixed(2) || '0.00'} USD
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw}>Confirm Withdrawal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletManagement;