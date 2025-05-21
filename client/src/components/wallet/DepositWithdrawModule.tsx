import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowUpRight, ArrowDownLeft, Wallet, CreditCard, QrCode } from "lucide-react";
import CryptoWalletConnect from "@/components/auth/CryptoWalletConnect";
import QRCode from "qrcode.react";

// Wallet interface
interface ConnectedWallet {
  type: string;
  address: string;
  network: string;
  balance: string;
}

const DepositWithdrawModule: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("deposit");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<ConnectedWallet | null>(null);
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [showDepositAddress, setShowDepositAddress] = useState(false);
  const [depositCurrency, setDepositCurrency] = useState("ETH");
  const [withdrawCurrency, setWithdrawCurrency] = useState("ETH");
  const [withdrawAddress, setWithdrawAddress] = useState("");

  // Generated deposit address
  const depositAddress = "0xC9d6Ae3d9C2efa0791A0b6e98CE5f292600573db";
  
  // Handler for wallet connection
  const handleWalletConnect = (walletAddress: string, walletType: string) => {
    // Determine network and balance based on wallet type
    let network = walletType === 'phantom' ? 'Solana' : 'Ethereum';
    let balance = '0.00';
    
    if (window.ethereum) {
      // For real implementation, we would fetch from blockchain
      // Using placeholder for demonstration
      balance = (Math.random() * 2).toFixed(4);
    }
    
    // Add connected wallet
    const newWallet: ConnectedWallet = {
      type: walletType,
      address: walletAddress,
      network,
      balance
    };
    
    setConnectedWallets([...connectedWallets, newWallet]);
    setSelectedWallet(newWallet);
    setWithdrawAddress(walletAddress);
    setIsWalletModalOpen(false);
    
    toast({
      title: "Wallet Connected",
      description: `Successfully connected to ${walletType}`,
    });
  };
  
  // Handler for deposit initiation
  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive"
      });
      return;
    }
    
    // Show QR code and deposit address
    setShowDepositAddress(true);
  };
  
  // Handler for withdrawal
  const handleWithdraw = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a withdrawal",
        variant: "destructive"
      });
      return;
    }
    
    if (!withdrawAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect or enter a wallet address",
        variant: "destructive"
      });
      return;
    }
    
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive"
      });
      return;
    }
    
    // Process withdrawal - in a real implementation this would interact with blockchain
    toast({
      title: "Withdrawal Initiated",
      description: `Your withdrawal of ${withdrawAmount} ${withdrawCurrency} is being processed`,
    });
    
    setWithdrawAmount("");
  };

  return (
    <>
      {/* Wallet Connection Modal */}
      <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Cryptocurrency Wallet</DialogTitle>
            <DialogDescription>
              Connect a wallet to deposit or withdraw cryptocurrency
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <CryptoWalletConnect onConnect={handleWalletConnect} />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Deposit Address Dialog */}
      <Dialog open={showDepositAddress} onOpenChange={setShowDepositAddress}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit {depositCurrency}</DialogTitle>
            <DialogDescription>
              Send exactly {depositAmount} {depositCurrency} to the address below
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 flex flex-col items-center">
            <div className="p-2 bg-white mb-4">
              <QRCode value={depositAddress} size={200} />
            </div>
            
            <div className="w-full">
              <Label className="text-xs text-muted-foreground">Deposit Address</Label>
              <div className="flex items-center mt-1">
                <Input
                  value={depositAddress}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2 h-10"
                  onClick={() => {
                    navigator.clipboard.writeText(depositAddress);
                    toast({
                      title: "Address Copied",
                      description: "Deposit address copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            
            <div className="w-full mt-4 bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
              <p className="text-sm font-medium mb-1">Important</p>
              <ul className="text-xs list-disc pl-4 space-y-1">
                <li>Send only {depositCurrency} to this address</li>
                <li>Minimum deposit amount: 0.01 {depositCurrency}</li>
                <li>Deposits typically confirm within 10-30 minutes</li>
                <li>This address is valid for 24 hours</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowDepositAddress(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Cryptocurrency Transactions</CardTitle>
          <CardDescription>
            Deposit or withdraw cryptocurrency to your WeParlay account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="deposit">
                <ArrowDownLeft className="h-4 w-4 mr-2" />
                Deposit
              </TabsTrigger>
              <TabsTrigger value="withdraw">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Withdraw
              </TabsTrigger>
            </TabsList>
            
            {/* Deposit Tab */}
            <TabsContent value="deposit">
              <div className="space-y-4">
                <div>
                  <Label>Select Cryptocurrency</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={depositCurrency}
                    onChange={(e) => setDepositCurrency(e.target.value)}
                  >
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="SOL">Solana (SOL)</option>
                    <option value="USDT">Tether (USDT)</option>
                    <option value="USDC">USD Coin (USDC)</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="depositAmount">Amount to Deposit</Label>
                  <div className="flex">
                    <Input
                      id="depositAmount"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="flex-1"
                    />
                    <div className="flex items-center border border-l-0 rounded-r-md px-3 bg-muted">
                      {depositCurrency}
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary/5 p-3 rounded-md">
                  <div className="flex items-center">
                    <QrCode className="h-5 w-5 mr-2 text-primary" />
                    <p className="text-sm font-medium">Deposit Instructions</p>
                  </div>
                  <p className="text-sm mt-2">
                    After entering the amount, click 'Generate Deposit Address' to receive a unique deposit address for your transaction.
                  </p>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                >
                  <ArrowDownLeft className="h-4 w-4 mr-2" />
                  Generate Deposit Address
                </Button>
              </div>
            </TabsContent>
            
            {/* Withdraw Tab */}
            <TabsContent value="withdraw">
              <div className="space-y-4">
                <div>
                  <Label>Select Cryptocurrency</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={withdrawCurrency}
                    onChange={(e) => setWithdrawCurrency(e.target.value)}
                  >
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="SOL">Solana (SOL)</option>
                    <option value="USDT">Tether (USDT)</option>
                    <option value="USDC">USD Coin (USDC)</option>
                  </select>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="withdrawAddress">Withdraw To</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs px-2"
                      onClick={() => setIsWalletModalOpen(true)}
                    >
                      Connect Wallet
                    </Button>
                  </div>
                  <Input
                    id="withdrawAddress"
                    placeholder="Enter wallet address"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="font-mono text-sm"
                  />
                  {selectedWallet && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Connected: {selectedWallet.type} on {selectedWallet.network}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="withdrawAmount">Amount to Withdraw</Label>
                  <div className="flex">
                    <Input
                      id="withdrawAmount"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="flex-1"
                    />
                    <div className="flex items-center border border-l-0 rounded-r-md px-3 bg-muted">
                      {withdrawCurrency}
                    </div>
                  </div>
                </div>
                
                {isAuthenticated && (
                  <div className="bg-primary/5 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
                    <p className="font-medium">
                      {user?.balance?.toFixed(2) || '0.00'} USD
                    </p>
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  onClick={handleWithdraw}
                  disabled={!isAuthenticated || !withdrawAddress || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Withdraw Funds
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex-col items-start border-t pt-4">
          <p className="text-xs text-muted-foreground mb-2">Important Information</p>
          <ul className="text-xs list-disc pl-4 space-y-1 text-muted-foreground">
            <li>Minimum deposit: 0.01 {depositCurrency}</li>
            <li>Minimum withdrawal: 0.01 {withdrawCurrency}</li>
            <li>Withdrawal fee: 0.001 {withdrawCurrency}</li>
            <li>Withdrawals are processed within 24 hours</li>
          </ul>
        </CardFooter>
      </Card>
    </>
  );
};

export default DepositWithdrawModule;