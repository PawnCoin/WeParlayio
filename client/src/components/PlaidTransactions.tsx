import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Banknote, 
  CreditCard, 
  Loader2, 
  RefreshCw,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlaidTransactionsProps {
  userId: string;
  currentBalance: number;
}

export default function PlaidTransactions({ userId, currentBalance }: PlaidTransactionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');

  // Fetch connected accounts
  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/plaid/accounts', userId],
    queryFn: async () => {
      const response = await fetch(`/api/plaid/accounts?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Create transfer mutation
  const transferMutation = useMutation({
    mutationFn: async ({ type, amount, accountId }: { type: 'deposit' | 'withdrawal', amount: number, accountId: string }) => {
      const response = await fetch('/api/plaid/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          accountId,
          amount,
          type,
          description: `WeParlay ${type} - $${amount}`
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to process ${type}`);
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: `${variables.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Initiated`,
        description: `$${variables.amount} ${variables.type} is being processed. Usually takes 1-2 business days.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/plaid/accounts'] });
      setAmount('');
    },
    onError: (error, variables) => {
      toast({
        title: `${variables.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Failed`,
        description: error instanceof Error ? error.message : 'Transaction failed',
        variant: "destructive",
      });
    }
  });

  const handleTransfer = async (type: 'deposit' | 'withdrawal') => {
    const transferAmount = parseFloat(amount);
    
    if (!transferAmount || transferAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than $0",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAccount) {
      toast({
        title: "No Account Selected",
        description: "Please select a bank account for the transaction",
        variant: "destructive",
      });
      return;
    }

    if (type === 'withdrawal' && transferAmount > currentBalance) {
      toast({
        title: "Insufficient Balance",
        description: `Cannot withdraw $${transferAmount}. Current balance: $${currentBalance}`,
        variant: "destructive",
      });
      return;
    }

    await transferMutation.mutateAsync({
      type,
      amount: transferAmount,
      accountId: selectedAccount
    });
  };

  const accounts = accountsData?.accounts || [];
  const hasAccounts = accounts.length > 0;

  if (accountsLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading bank accounts...</span>
        </CardContent>
      </Card>
    );
  }

  if (!hasAccounts) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Transfers
          </CardTitle>
          <CardDescription>
            Connect a bank account to enable deposits and withdrawals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Banknote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No bank accounts connected. Use the "Connect Bank Account" section above to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownLeft className="h-5 w-5" />
          Bank Transfers
        </CardTitle>
        <CardDescription>
          Deposit or withdraw funds from your connected bank accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Balance Display */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current WeParlay Balance</p>
              <p className="text-2xl font-bold text-green-600">${currentBalance.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">Connected Bank Accounts</Label>
          <div className="space-y-2">
            {accounts.map((account: any) => (
              <div
                key={account.account_id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAccount === account.account_id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => setSelectedAccount(account.account_id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.subtype} •••• {account.mask}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${account.balances?.available?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transfer Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdrawal" className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4">
            <div>
              <Label htmlFor="deposit-amount">Deposit Amount</Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              onClick={() => handleTransfer('deposit')}
              disabled={transferMutation.isPending || !selectedAccount || !amount}
              className="w-full"
              size="lg"
            >
              {transferMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Deposit...
                </>
              ) : (
                <>
                  <ArrowDownLeft className="h-4 w-4 mr-2" />
                  Deposit ${amount || '0.00'}
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="withdrawal" className="space-y-4">
            <div>
              <Label htmlFor="withdrawal-amount">Withdrawal Amount</Label>
              <Input
                id="withdrawal-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: ${currentBalance.toFixed(2)}
              </p>
            </div>
            <Button
              onClick={() => handleTransfer('withdrawal')}
              disabled={transferMutation.isPending || !selectedAccount || !amount}
              className="w-full"
              size="lg"
              variant="outline"
            >
              {transferMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Withdrawal...
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Withdraw ${amount || '0.00'}
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Processing Time Info */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Processing Times</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <div>• Deposits: 1-2 business days</div>
            <div>• Withdrawals: 2-3 business days</div>
            <div>• All transfers are processed securely through Plaid</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}