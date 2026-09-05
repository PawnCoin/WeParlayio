import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  CreditCard, Wallet, TrendingUp, Shield, AlertTriangle, CheckCircle,
  ArrowUpRight, ArrowDownLeft, Clock, DollarSign, Bitcoin, Euro,
  Eye, EyeOff, Smartphone, Globe, Lock, Zap, History, Settings,
  PlusCircle, MinusCircle, RotateCcw, Bell, FileText, Download
} from "lucide-react";

interface BankingData {
  usdBalance: number;
  weparlayCash: number;
  cryptoBalances: {
    btc: number;
    eth: number;
    usdc: number;
  };
  monthlyDeposits: number;
  monthlyWithdrawals: number;
  pendingTransactions: number;
  accountStatus: string;
  verificationLevel: string;
  totalProfit: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'bet' | 'win';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
  fee?: number;
}

interface PaymentMethod {
  id: string;
  type: 'bank' | 'card' | 'crypto' | 'digital_wallet';
  name: string;
  lastFour: string;
  isDefault: boolean;
  status: 'active' | 'pending' | 'disabled';
  limits: {
    daily: number;
    monthly: number;
  };
}

const BankingSystem: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');
  const [showBalances, setShowBalances] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');

  // Real-time banking data
  const { data: bankingData, isLoading: bankingLoading } = useQuery<BankingData>({
    queryKey: ['/api/banking/advanced-overview'],
    refetchInterval: 30000 // Real-time updates every 30 seconds
  });

  // Transaction history
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/banking/transactions-history']
  });

  // Payment methods
  const { data: paymentMethods = [], isLoading: methodsLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/banking/payment-methods-enhanced']
  });

  // Advanced deposit mutation with fraud detection
  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number; currency: string; methodId: string }) => {
      const response = await fetch('/api/banking/secure-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Deposit failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Deposit Successful",
        description: `$${data.amount} deposited instantly with zero fees`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banking/advanced-overview'] });
      setTransactionAmount('');
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Failed",
        description: error.message || "Please check your payment method",
        variant: "destructive",
      });
    }
  });

  // Instant withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; currency: string; methodId: string }) => {
      const response = await fetch('/api/banking/instant-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Withdrawal failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Withdrawal Processing",
        description: `$${data.amount} will arrive in 1-3 business days`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banking/advanced-overview'] });
      setTransactionAmount('');
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Please verify your withdrawal method",
        variant: "destructive",
      });
    }
  });

  const handleTransaction = () => {
    const amount = parseFloat(transactionAmount);
    if (!amount || amount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMethod) {
      toast({
        title: "Select Payment Method",
        description: "Please choose a payment method",
        variant: "destructive",
      });
      return;
    }

    const data = {
      amount,
      currency: selectedCurrency,
      methodId: selectedMethod
    };

    if (transactionType === 'deposit') {
      depositMutation.mutate(data);
    } else {
      withdrawMutation.mutate(data);
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'BTC': return '₿';
      case 'ETH': return 'Ξ';
      default: return '$';
    }
  };

  const formatBalance = (amount: number, currency: string) => {
    if (!showBalances) return '••••••';
    return `${getCurrencySymbol(currency)}${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Secure Banking Access</h2>
            <p className="text-muted-foreground">Please log in to access your banking dashboard</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Banking Hub</h1>
          <p className="text-muted-foreground">Professional-grade financial management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBalances(!showBalances)}
          >
            {showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified Account
          </Badge>
        </div>
      </div>

      {/* Balance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              USD Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {formatBalance(bankingData?.usdBalance || 0, 'USD')}
            </div>
            <p className="text-xs text-blue-600 mt-1">Primary Currency</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              WeParlay Cash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {formatBalance(bankingData?.weparlayCash || 0, 'USD')}
            </div>
            <p className="text-xs text-purple-600 mt-1">Rewards & Bonuses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-900 flex items-center gap-2">
              <Bitcoin className="h-4 w-4" />
              Crypto Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {formatBalance(bankingData?.cryptoBalances?.btc || 0, 'BTC')}
            </div>
            <p className="text-xs text-orange-600 mt-1">Bitcoin Balance</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatBalance(bankingData?.totalProfit || 0, 'USD')}
            </div>
            <p className="text-xs text-green-600 mt-1">All-Time Winnings</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="methods">Methods</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => setActiveTab('transfer')}
                  >
                    <ArrowDownLeft className="h-4 w-4" />
                    Quick Deposit
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setActiveTab('transfer')}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Withdraw
                  </Button>
                </div>
                <Button variant="secondary" className="w-full flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Transfer Between Accounts
                </Button>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verification Level</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Level 3 - Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Status</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Two-Factor Auth</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'deposit' ? 'bg-green-100 text-green-600' :
                          transaction.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {transaction.type === 'deposit' ? <ArrowDownLeft className="h-4 w-4" /> :
                           transaction.type === 'withdrawal' ? <ArrowUpRight className="h-4 w-4" /> :
                           <RotateCcw className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.timestamp}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          transaction.type === 'deposit' || transaction.type === 'win' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'win' ? '+' : '-'}
                          ${transaction.amount.toLocaleString()}
                        </div>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No recent transactions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Instant Deposit</CardTitle>
                <p className="text-sm text-muted-foreground">Add funds to your account with zero fees</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Amount</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder="100.00"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {paymentMethods.map((method) => (
                      <Button
                        key={method.id}
                        variant={selectedMethod === method.id ? "default" : "outline"}
                        onClick={() => setSelectedMethod(method.id)}
                        className="justify-start"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {method.name} ••••{method.lastFour}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => {
                    setTransactionType('deposit');
                    handleTransaction();
                  }}
                  disabled={depositMutation.isPending}
                >
                  {depositMutation.isPending ? 'Processing...' : 'Deposit Instantly'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Secure Withdrawal</CardTitle>
                <p className="text-sm text-muted-foreground">Fast and secure withdrawals to your accounts</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="50.00"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Withdrawal Method</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {paymentMethods.filter(m => m.type === 'bank').map((method) => (
                      <Button
                        key={method.id}
                        variant={selectedMethod === method.id ? "default" : "outline"}
                        onClick={() => setSelectedMethod(method.id)}
                        className="justify-start"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {method.name} ••••{method.lastFour}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setTransactionType('withdraw');
                    handleTransaction();
                  }}
                  disabled={withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending ? 'Processing...' : 'Request Withdrawal'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Payment Methods
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">••••{method.lastFour}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      <Badge variant="outline" className={method.status === 'active' ? 'text-green-600' : 'text-gray-600'}>
                        {method.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Transaction History
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'deposit' ? 'bg-green-100 text-green-600' :
                          transaction.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {transaction.type === 'deposit' ? <ArrowDownLeft className="h-5 w-5" /> :
                           transaction.type === 'withdrawal' ? <ArrowUpRight className="h-5 w-5" /> :
                           <RotateCcw className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">ID: {transaction.id}</p>
                          <p className="text-sm text-muted-foreground">{transaction.timestamp}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          transaction.type === 'deposit' || transaction.type === 'win' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'win' ? '+' : '-'}
                          ${transaction.amount.toLocaleString()}
                        </div>
                        {transaction.fee && (
                          <p className="text-sm text-muted-foreground">Fee: ${transaction.fee}</p>
                        )}
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Secure your account with 2FA</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Transaction Notifications</p>
                    <p className="text-sm text-muted-foreground">Get alerts for all transactions</p>
                  </div>
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Login Alerts</p>
                    <p className="text-sm text-muted-foreground">Email alerts for new logins</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Account Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Daily Deposit Limit</span>
                    <span className="font-medium">$10,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Daily Withdrawal Limit</span>
                    <span className="font-medium">$5,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Monthly Limit</span>
                    <span className="font-medium">$100,000</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Request Limit Increase
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BankingSystem;
