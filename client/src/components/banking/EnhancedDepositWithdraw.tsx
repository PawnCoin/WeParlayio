
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { 
  Smartphone, 
  Building2, 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface LinkedAccount {
  id: string;
  institutionName: string;
  accountType: 'bank' | 'cash_app';
  accounts: Array<{
    accountId: string;
    name: string;
    type: string;
    subtype: string;
    mask: string;
    isCashApp: boolean;
  }>;
  balances?: Array<{
    accountId: string;
    available: number;
    current: number;
  }>;
}

const EnhancedDepositWithdraw: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedDepositAccount, setSelectedDepositAccount] = useState('');
  const [selectedWithdrawAccount, setSelectedWithdrawAccount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch linked accounts
  const { data: linkedAccounts = [] } = useQuery<LinkedAccount[]>({
    queryKey: ['/api/plaid/linked-accounts'],
    enabled: !!user,
  });

  const popularAmounts = [25, 50, 100, 250, 500, 1000];

  const handleDeposit = async () => {
    if (!selectedDepositAccount || !depositAmount) {
      toast({
        title: "Missing Information",
        description: "Please select an account and enter an amount.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Minimum deposit amount is $1.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/plaid/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: selectedDepositAccount,
          amount: amount,
          currency: 'USD',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Deposit Initiated!",
          description: `$${amount} deposit is being processed. ${data.estimatedArrival}`,
          duration: 5000,
        });
        
        setDepositAmount('');
        setSelectedDepositAccount('');
      } else {
        throw new Error(data.message || 'Deposit failed');
      }
    } catch (error: any) {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to process deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!selectedWithdrawAccount || !withdrawAmount) {
      toast({
        title: "Missing Information",
        description: "Please select an account and enter an amount.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is $1.",
        variant: "destructive",
      });
      return;
    }

    if (amount > (user?.balance || 0)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds for this withdrawal.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/plaid/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: selectedWithdrawAccount,
          amount: amount,
          currency: 'USD',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Withdrawal Initiated!",
          description: `$${amount} withdrawal is being processed. ${data.estimatedArrival}`,
          duration: 5000,
        });
        
        setWithdrawAmount('');
        setSelectedWithdrawAccount('');
      } else {
        throw new Error(data.message || 'Withdrawal failed');
      }
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getAccountIcon = (isCashApp: boolean) => {
    return isCashApp ? (
      <Smartphone className="h-4 w-4 text-green-600" />
    ) : (
      <Building2 className="h-4 w-4 text-blue-600" />
    );
  };

  const getTransferSpeed = (isCashApp: boolean) => {
    return isCashApp ? 'Instant' : '1-3 business days';
  };

  if (linkedAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Linked Accounts</h3>
          <p className="text-gray-500 mb-4">
            Link your bank account or Cash App to start making deposits and withdrawals.
          </p>
          <Button>Link Account</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit" className="flex items-center gap-2">
            <ArrowDownCircle className="h-4 w-4" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4" />
            Withdraw
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Deposit Funds
              </CardTitle>
              <CardDescription>
                Add money to your WeParlay account from your linked accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Account Selection */}
              <div>
                <Label htmlFor="deposit-account">Select Account</Label>
                <div className="grid gap-2 mt-2">
                  {linkedAccounts.flatMap(linkedAccount =>
                    linkedAccount.accounts.map(account => (
                      <div
                        key={account.accountId}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedDepositAccount === account.accountId
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedDepositAccount(account.accountId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getAccountIcon(account.isCashApp)}
                            <div>
                              <p className="font-medium">
                                {account.isCashApp ? 'Cash App' : linkedAccount.institutionName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {account.name} {account.mask && `•••• ${account.mask}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={account.isCashApp ? "default" : "secondary"}>
                              {getTransferSpeed(account.isCashApp)}
                            </Badge>
                            {linkedAccount.balances?.find(b => b.accountId === account.accountId) && (
                              <p className="text-sm text-muted-foreground mt-1">
                                ${linkedAccount.balances.find(b => b.accountId === account.accountId)?.available?.toFixed(2)} available
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <Label htmlFor="deposit-amount">Amount</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1"
                  max="5000"
                />
              </div>

              {/* Popular Amounts */}
              <div>
                <Label>Popular Amounts</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {popularAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setDepositAmount(amount.toString())}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleDeposit}
                disabled={isProcessing || !selectedDepositAccount || !depositAmount}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <ArrowDownCircle className="h-4 w-4 mr-2" />
                    Deposit ${depositAmount || '0.00'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Withdraw Funds
              </CardTitle>
              <CardDescription>
                Transfer your winnings to your linked accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Balance */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Available Balance</p>
                    <p className="text-2xl font-bold text-blue-900">
                      ${user?.balance?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              {/* Account Selection */}
              <div>
                <Label htmlFor="withdraw-account">Select Account</Label>
                <div className="grid gap-2 mt-2">
                  {linkedAccounts.flatMap(linkedAccount =>
                    linkedAccount.accounts.map(account => (
                      <div
                        key={account.accountId}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedWithdrawAccount === account.accountId
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedWithdrawAccount(account.accountId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getAccountIcon(account.isCashApp)}
                            <div>
                              <p className="font-medium">
                                {account.isCashApp ? 'Cash App' : linkedAccount.institutionName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {account.name} {account.mask && `•••• ${account.mask}`}
                              </p>
                            </div>
                          </div>
                          <Badge variant={account.isCashApp ? "default" : "secondary"}>
                            {getTransferSpeed(account.isCashApp)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <Label htmlFor="withdraw-amount">Amount</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="1"
                  max={user?.balance || 0}
                />
              </div>

              <Button 
                onClick={handleWithdrawal}
                disabled={isProcessing || !selectedWithdrawAccount || !withdrawAmount}
                className="w-full"
                size="lg"
                variant="outline"
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Withdraw ${withdrawAmount || '0.00'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDepositWithdraw;
