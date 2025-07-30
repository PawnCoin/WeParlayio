import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowDownRight, ArrowUpRight, DollarSign, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PlaidTransactionsProps {
  userId: string;
  userBalance?: number;
}

interface BankAccount {
  id: number;
  accountName: string;
  accountType: string;
  accountSubtype: string;
  mask: string;
  balances: {
    available: number | null;
    current: number | null;
    iso_currency_code: string;
  };
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
  plaidTransferId?: string;
}

export default function PlaidTransactions({ userId, userBalance = 0 }: PlaidTransactionsProps) {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedDepositAccount, setSelectedDepositAccount] = useState('');
  const [selectedWithdrawAccount, setSelectedWithdrawAccount] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's bank accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/plaid/accounts', userId],
    queryFn: () => apiRequest(`/api/plaid/accounts/${userId}`),
    enabled: !!userId
  });

  // Get transaction history
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/plaid/transactions', userId],
    queryFn: () => apiRequest(`/api/plaid/transactions/${userId}`),
    enabled: !!userId
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: (data: { accountId: string; amount: number; description?: string }) =>
      apiRequest('/api/plaid/deposit', {
        method: 'POST',
        body: JSON.stringify({ ...data, userId })
      }),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Deposit Initiated",
          description: `$${depositAmount} deposit is being processed`,
          variant: "default"
        });
        setDepositAmount('');
        setSelectedDepositAccount('');
        queryClient.invalidateQueries({ queryKey: ['/api/plaid/transactions', userId] });
      } else {
        toast({
          title: "Deposit Failed",
          description: data.error || "Failed to initiate deposit",
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process deposit",
        variant: "destructive"
      });
    }
  });

  // Withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: (data: { accountId: string; amount: number; description?: string }) =>
      apiRequest('/api/plaid/withdraw', {
        method: 'POST',
        body: JSON.stringify({ ...data, userId })
      }),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Withdrawal Initiated",
          description: `$${withdrawAmount} withdrawal is being processed`,
          variant: "default"
        });
        setWithdrawAmount('');
        setSelectedWithdrawAccount('');
        queryClient.invalidateQueries({ queryKey: ['/api/plaid/transactions', userId] });
      } else {
        toast({
          title: "Withdrawal Failed",
          description: data.error || "Failed to initiate withdrawal",
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process withdrawal",
        variant: "destructive"
      });
    }
  });

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive"
      });
      return;
    }

    if (!selectedDepositAccount) {
      toast({
        title: "Select Account",
        description: "Please select a bank account for the deposit",
        variant: "destructive"
      });
      return;
    }

    if (amount < 1 || amount > 50000) {
      toast({
        title: "Invalid Amount",
        description: "Deposit amount must be between $1 and $50,000",
        variant: "destructive"
      });
      return;
    }

    depositMutation.mutate({
      accountId: selectedDepositAccount,
      amount,
      description: `WeParlay deposit - $${amount}`
    });
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive"
      });
      return;
    }

    if (!selectedWithdrawAccount) {
      toast({
        title: "Select Account",
        description: "Please select a bank account for the withdrawal",
        variant: "destructive"
      });
      return;
    }

    if (amount < 1 || amount > 50000) {
      toast({
        title: "Invalid Amount",
        description: "Withdrawal amount must be between $1 and $50,000",
        variant: "destructive"
      });
      return;
    }

    if (amount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have $${userBalance.toFixed(2)} available`,
        variant: "destructive"
      });
      return;
    }

    withdrawMutation.mutate({
      accountId: selectedWithdrawAccount,
      amount,
      description: `WeParlay withdrawal - $${amount}`
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === 'deposit' ? (
      <ArrowDownRight className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowUpRight className="h-4 w-4 text-red-600" />
    );
  };

  if (accountsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading...
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Please connect a bank account first</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            WeParlay Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(userBalance)}</div>
          <p className="text-muted-foreground">Available for withdrawal</p>
        </CardContent>
      </Card>

      {/* Deposit/Withdraw Tabs */}
      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        {/* Deposit Tab */}
        <TabsContent value="deposit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-green-600" />
                Deposit Funds
              </CardTitle>
              <CardDescription>
                Transfer money from your bank account to WeParlay
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Bank Account</label>
                <Select value={selectedDepositAccount} onValueChange={setSelectedDepositAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account: BankAccount) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.accountName} •••• {account.mask} 
                        ({formatCurrency(account.balances.available || 0)} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1"
                  max="50000"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum: $1.00 • Maximum: $50,000.00
                </p>
              </div>

              <Button
                onClick={handleDeposit}
                disabled={depositMutation.isPending}
                className="w-full"
              >
                {depositMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Deposit...
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="mr-2 h-4 w-4" />
                    Deposit {depositAmount ? formatCurrency(parseFloat(depositAmount)) : 'Funds'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-red-600" />
                Withdraw Funds
              </CardTitle>
              <CardDescription>
                Transfer money from WeParlay to your bank account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Bank Account</label>
                <Select value={selectedWithdrawAccount} onValueChange={setSelectedWithdrawAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account: BankAccount) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.accountName} •••• {account.mask}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="1"
                  max={userBalance.toString()}
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {formatCurrency(userBalance)} • Minimum: $1.00
                </p>
              </div>

              <Button
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending}
                className="w-full"
                variant="outline"
              >
                {withdrawMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Withdrawal...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Withdraw {withdrawAmount ? formatCurrency(parseFloat(withdrawAmount)) : 'Funds'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent deposits and withdrawals</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions yet</p>
              <p className="text-sm">Your deposits and withdrawals will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction: Transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium capitalize">{transaction.type}</p>
                      <p className="text-sm text-muted-foreground">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}