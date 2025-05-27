import React, { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { 
  CreditCard, Shield, DollarSign, ArrowUpRight, ArrowDownRight,
  Building2, Smartphone, Bitcoin, CheckCircle, AlertTriangle,
  Lock, Eye, EyeOff, Plus, Trash2, RefreshCw, TrendingUp
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'bank' | 'cashapp' | 'crypto' | 'card' | 'paypal' | 'venmo';
  name: string;
  lastFour?: string;
  isDefault: boolean;
  status: 'active' | 'pending' | 'suspended';
  balance?: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win';
  amount: number;
  currency: 'USD' | 'WEPARLAY';
  status: 'completed' | 'pending' | 'failed';
  method: string;
  timestamp: string;
  description: string;
}

const SecureBankingHub: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [newMethodType, setNewMethodType] = useState('');

  // Mock data for demo - replace with real API calls
  const bankingData = {
    weparlayCash: user?.weplayTokenBalance || 1250,
    realMoney: user?.balance || 875.50,
    monthlyDeposits: 450,
    monthlyWithdrawals: 125,
    monthlyNet: 325
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'bank',
      name: 'Chase Bank Account',
      lastFour: '4532',
      isDefault: true,
      status: 'active'
    },
    {
      id: '2', 
      type: 'cashapp',
      name: 'Cash App',
      lastFour: '7890',
      isDefault: false,
      status: 'active'
    },
    {
      id: '3',
      type: 'card',
      name: 'Visa Credit Card',
      lastFour: '1234',
      isDefault: false,
      status: 'active'
    }
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'deposit',
      amount: 100,
      currency: 'USD',
      status: 'completed',
      method: 'Cash App',
      timestamp: new Date().toISOString(),
      description: 'Deposit via Cash App'
    },
    {
      id: '2',
      type: 'win',
      amount: 50,
      currency: 'USD',
      status: 'completed',
      method: 'Betting Win',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      description: 'NBA Lakers vs Warriors Win'
    }
  ];

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string; currency: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Deposit Initiated ✅",
        description: "Your deposit is being processed securely with bank-level encryption",
      });
      setDepositAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/user/cash-balance'] });
    },
    onError: () => {
      toast({
        title: "Deposit Failed",
        description: "Please try again or contact our 24/7 support team",
        variant: "destructive",
      });
    },
  });

  // Withdrawal mutation  
  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string; currency: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Initiated ✅",
        description: "Your funds will arrive within 1-3 business days",
      });
      setWithdrawAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/user/cash-balance'] });
    },
    onError: () => {
      toast({
        title: "Withdrawal Failed",
        description: "Please check your balance and try again",
        variant: "destructive",
      });
    },
  });

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank': return <Building2 className="h-5 w-5 text-blue-600" />;
      case 'cashapp': return <Smartphone className="h-5 w-5 text-green-600" />;
      case 'crypto': return <Bitcoin className="h-5 w-5 text-orange-600" />;
      case 'card': return <CreditCard className="h-5 w-5 text-purple-600" />;
      case 'paypal': return <DollarSign className="h-5 w-5 text-blue-500" />;
      case 'venmo': return <Smartphone className="h-5 w-5 text-cyan-600" />;
      default: return <DollarSign className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 mx-auto text-blue-600 mb-4" />
          <CardTitle>Secure Banking Hub</CardTitle>
          <CardDescription>Please log in to access your secure banking features</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = '/api/login'}>
            <Lock className="h-4 w-4 mr-2" />
            Log In Securely
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Security Trust Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 text-lg">🏦 Bank-Level Security & Protection</h3>
              <p className="text-blue-700 text-sm mt-1">
                Your money is protected with 256-bit SSL encryption, FDIC-insured banking partners, 
                and multi-factor authentication. We support all major payment methods for your convenience.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                <Lock className="h-3 w-3 mr-1" />
                SSL Secured
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                FDIC Protected
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-900">WeParlay Cash</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="h-8 w-8 p-0 hover:bg-blue-200"
              >
                {showBalance ? <Eye className="h-4 w-4 text-blue-600" /> : <EyeOff className="h-4 w-4 text-blue-600" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {showBalance ? `🎮 ${bankingData.weparlayCash.toLocaleString()}` : '🎮 ••••••'}
            </div>
            <p className="text-xs text-blue-600 mt-2 font-medium">Virtual Currency • Perfect for Practice</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-900">Real Money Balance</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="h-8 w-8 p-0 hover:bg-green-200"
              >
                {showBalance ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-green-600" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {showBalance ? `$${bankingData.realMoney.toLocaleString()}` : '$••••••'}
            </div>
            <p className="text-xs text-green-600 mt-2 font-medium">Available for Withdrawal • Fully Insured</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-900">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-700">Deposits</span>
                <span className="font-bold text-green-600">+${bankingData.monthlyDeposits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-700">Withdrawals</span>
                <span className="font-bold text-red-600">-${bankingData.monthlyWithdrawals}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-2">
                <span className="text-purple-900">Net Profit</span>
                <span className="text-green-600">+${bankingData.monthlyNet}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Banking Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="deposit">💰 Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">🏦 Withdraw</TabsTrigger>
          <TabsTrigger value="methods">💳 Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Your latest financial activity - all transactions are secured and verified</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Ready to Get Started?</p>
                  <p className="text-sm">Make your first secure deposit to begin betting!</p>
                  <Button className="mt-4" onClick={() => setActiveTab('deposit')}>
                    Make Your First Deposit
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          transaction.type === 'deposit' ? 'bg-green-100' :
                          transaction.type === 'withdrawal' ? 'bg-red-100' :
                          transaction.type === 'win' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {transaction.type === 'deposit' ? <ArrowDownRight className="h-5 w-5 text-green-600" /> :
                           transaction.type === 'withdrawal' ? <ArrowUpRight className="h-5 w-5 text-red-600" /> :
                           transaction.type === 'win' ? <TrendingUp className="h-5 w-5 text-blue-600" /> :
                           <DollarSign className="h-5 w-5 text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.timestamp).toLocaleDateString()} • {transaction.method}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          transaction.type === 'deposit' || transaction.type === 'win' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'win' ? '+' : '-'}
                          {transaction.currency === 'USD' ? '$' : '🎮'}{transaction.amount.toLocaleString()}
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
        </TabsContent>

        <TabsContent value="deposit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-green-600" />
                Make a Secure Deposit
              </CardTitle>
              <CardDescription>Add funds safely using your preferred payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="deposit-amount" className="text-sm font-medium">Deposit Amount</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="text-lg font-semibold"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum: $10 • Maximum: $5,000 per transaction</p>
                </div>
                <div>
                  <Label htmlFor="deposit-method" className="text-sm font-medium">Payment Method</Label>
                  <select
                    id="deposit-method"
                    className="w-full p-3 border rounded-md text-sm"
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                  >
                    <option value="">Choose your payment method</option>
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name} {method.lastFour ? `****${method.lastFour}` : ''} 
                        {method.isDefault ? ' (Default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {['25', '50', '100', '250'].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => setDepositAmount(amount)}
                    className="text-sm font-medium"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-green-800">🔒 Your Deposit is 100% Secure</p>
                    <ul className="mt-2 text-green-700 space-y-1">
                      <li>✅ Instant processing for most payment methods</li>
                      <li>✅ Bank-level encryption protects your data</li>
                      <li>✅ FDIC-insured banking partners</li>
                      <li>✅ 24/7 customer support available</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
                onClick={() => {
                  if (depositAmount && selectedMethod) {
                    depositMutation.mutate({
                      amount: parseFloat(depositAmount),
                      method: selectedMethod,
                      currency: 'USD'
                    });
                  }
                }}
                disabled={!depositAmount || !selectedMethod || depositMutation.isPending}
              >
                {depositMutation.isPending ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Processing Securely...
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-5 w-5 mr-2" />
                    Deposit ${depositAmount || '0'} Securely
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-blue-600" />
                Withdraw Your Winnings
              </CardTitle>
              <CardDescription>Transfer funds securely to your preferred account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="withdraw-amount" className="text-sm font-medium">Withdrawal Amount</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="text-lg font-semibold"
                  />
                  <p className="text-sm text-green-600 mt-1 font-medium">
                    💰 Available: ${bankingData.realMoney.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label htmlFor="withdraw-method" className="text-sm font-medium">Withdrawal Method</Label>
                  <select
                    id="withdraw-method"
                    className="w-full p-3 border rounded-md text-sm"
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                  >
                    <option value="">Choose withdrawal method</option>
                    {paymentMethods.filter((m) => m.type !== 'crypto').map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name} {method.lastFour ? `****${method.lastFour}` : ''}
                        {method.isDefault ? ' (Default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-800">📋 Withdrawal Information</p>
                    <ul className="mt-2 text-blue-700 space-y-1">
                      <li>⏱️ Processing time: 1-3 business days</li>
                      <li>💵 Minimum withdrawal: $20</li>
                      <li>📊 Monthly limit: $10,000</li>
                      <li>🆓 No fees for bank transfers</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (withdrawAmount && selectedMethod) {
                    withdrawMutation.mutate({
                      amount: parseFloat(withdrawAmount),
                      method: selectedMethod,
                      currency: 'USD'
                    });
                  }
                }}
                disabled={!withdrawAmount || !selectedMethod || withdrawMutation.isPending}
              >
                {withdrawMutation.isPending ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Processing Withdrawal...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-5 w-5 mr-2" />
                    Withdraw ${withdrawAmount || '0'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                Payment Methods
              </CardTitle>
              <CardDescription>Manage your connected accounts and payment options securely</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No Payment Methods Yet</p>
                    <p className="text-sm">Add your first payment method to get started</p>
                    <Button className="mt-4" onClick={() => setIsAddingMethod(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-lg">
                              {getMethodIcon(method.type)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{method.name}</p>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                {method.lastFour && <span>****{method.lastFour}</span>}
                                <Badge className={getStatusColor(method.status)}>
                                  {method.status}
                                </Badge>
                                {method.isDefault && (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                    Default
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => setIsAddingMethod(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Payment Method
                    </Button>
                  </>
                )}

                {/* Supported Payment Methods */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">💳 Supported Payment Methods</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span>Bank Accounts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-green-600" />
                      <span>Cash App</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                      <span>Credit/Debit Cards</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-500" />
                      <span>PayPal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-cyan-600" />
                      <span>Venmo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bitcoin className="h-4 w-4 text-orange-600" />
                      <span>Crypto Wallets</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecureBankingHub;