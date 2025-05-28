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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { 
  CreditCard, Shield, DollarSign, ArrowUpRight, ArrowDownRight,
  Building2, Smartphone, Bitcoin, CheckCircle, AlertTriangle,
  Lock, Eye, EyeOff, Plus, Trash2, RefreshCw, TrendingUp,
  User, Trophy, Calendar, Target, Wallet
} from 'lucide-react';

const UserProfileBanking: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showBalance, setShowBalance] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  // Fetch banking data
  const { data: bankingData, isLoading } = useQuery({
    queryKey: ['/api/banking/overview'],
    enabled: isAuthenticated,
  });

  // Fetch payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['/api/banking/payment-methods'],
    enabled: isAuthenticated,
  });

  // Fetch transaction history
  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/banking/transactions'],
    enabled: isAuthenticated,
  });

  // Real deposit mutation with Stripe integration
  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string; currency: string }) => {
      const response = await apiRequest('POST', '/api/banking/deposit', data);
      if (!response.ok) {
        throw new Error('Deposit failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deposit Successful! ✅",
        description: "Your funds have been added to your account",
      });
      setDepositAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/banking/overview'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/cash-balance'] });
    },
    onError: () => {
      toast({
        title: "Deposit Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    },
  });

  // Real withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string; currency: string }) => {
      const response = await apiRequest('POST', '/api/banking/withdraw', data);
      if (!response.ok) {
        throw new Error('Withdrawal failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Initiated ✅",
        description: "Your funds will arrive within 1-3 business days",
      });
      setWithdrawAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/banking/overview'] });
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

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-blue-600 mb-4" />
            <CardTitle>User Profile & Banking</CardTitle>
            <CardDescription>Please log in to access your profile and banking features</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = '/api/login'}>
              <Lock className="h-4 w-4 mr-2" />
              Log In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="text-lg font-bold bg-blue-100 text-blue-700">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user?.username || 'WeParlay User'}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={getTierColor(user?.tier)}>
                  <Crown className="h-3 w-3 mr-1" />
                  {user?.tier || 'Bronze'} Member
                </Badge>
                {user?.isAdmin && (
                  <Badge className="bg-red-100 text-red-800 border-red-300">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Bets</p>
              <p className="text-2xl font-bold text-blue-600">{user?.totalBets || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Overview */}
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
              {showBalance ? `🎮 ${(user?.weplayTokenBalance || 0).toLocaleString()}` : '🎮 ••••••'}
            </div>
            <p className="text-xs text-blue-600 mt-2 font-medium">Virtual Currency • Practice Mode</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-900">Real Money</CardTitle>
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
              {showBalance ? `$${(user?.balance || 0).toLocaleString()}` : '$••••••'}
            </div>
            <p className="text-xs text-green-600 mt-2 font-medium">Available for Withdrawal</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-900">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              {((user?.winRate || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-purple-600 mt-2 font-medium">
              {user?.wins || 0} wins out of {user?.totalBets || 0} bets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">👤 Profile</TabsTrigger>
          <TabsTrigger value="deposit">💰 Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">🏦 Withdraw</TabsTrigger>
          <TabsTrigger value="methods">💳 Payment Methods</TabsTrigger>
          <TabsTrigger value="history">📊 History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Betting Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bets</span>
                  <span className="font-semibold">{user?.totalBets || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wins</span>
                  <span className="font-semibold text-green-600">{user?.wins || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Win Rate</span>
                  <span className="font-semibold">{((user?.winRate || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Winnings</span>
                  <span className="font-semibold text-green-600">${(user?.totalWinnings || 0).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Favorite Sport</span>
                  <span className="font-semibold">{user?.favoriteSport || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Bet</span>
                  <span className="font-semibold">${user?.averageBet || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Biggest Win</span>
                  <span className="font-semibold text-green-600">${user?.biggestWin || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className={user?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {user?.status || 'Active'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
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
                    <option value="bank">Bank Account</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="cashapp">Cash App</option>
                    <option value="paypal">PayPal</option>
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
                    Processing Deposit...
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
                    💰 Available: ${(user?.balance || 0).toLocaleString()}
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
                    <option value="bank">Bank Account</option>
                    <option value="cashapp">Cash App</option>
                    <option value="paypal">PayPal</option>
                  </select>
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
              <CardDescription>Manage your connected accounts securely</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Add Your Payment Methods</p>
                  <p className="text-sm">Connect your bank account, cards, or digital wallets</p>
                  <Button className="mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>

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

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Transaction History
              </CardTitle>
              <CardDescription>Your complete financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No transactions yet</p>
                  <p className="text-sm">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'deposit' ? 'bg-green-100' :
                          transaction.type === 'withdrawal' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {transaction.type === 'deposit' ? 
                            <ArrowDownRight className="h-4 w-4 text-green-600" /> :
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{new Date(transaction.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                        </p>
                        <Badge className="text-xs">
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
      </Tabs>
    </div>
  );
};

export default UserProfileBanking;