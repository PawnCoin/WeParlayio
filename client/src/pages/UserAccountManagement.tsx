import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Shield,
  Bell,
  Settings,
  Eye,
  EyeOff,
  Download
} from 'lucide-react';

export default function UserAccountManagement() {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Fetch balance and transaction data
  const { data: balanceData } = useQuery({
    queryKey: ['/api/user/cash-balance'],
    refetchInterval: 30000,
  });

  // Fetch transaction history
  const { data: transactionsData } = useQuery({
    queryKey: ['/api/user/transactions', selectedPeriod],
  });

  // Mock data for demonstration (would come from real APIs)
  const accountStats = {
    totalDeposited: 2500,
    totalWithdrawn: 1800,
    totalWagered: 8400,
    totalWinnings: 3200,
    currentStreak: 3,
    longestStreak: 8,
    winRate: 62.5,
    averageBet: 45,
    favoritesSport: 'NFL',
    totalBets: 186
  };

  const recentTransactions = transactionsData || [
    {
      id: 'txn_001',
      type: 'deposit',
      amount: 250,
      status: 'completed',
      method: 'Credit Card',
      timestamp: '2024-06-01T14:30:00Z',
      description: 'Account deposit'
    },
    {
      id: 'txn_002',
      type: 'bet',
      amount: -50,
      status: 'settled',
      method: 'Account Balance',
      timestamp: '2024-06-01T16:45:00Z',
      description: 'Lakers vs Warriors - Moneyline'
    },
    {
      id: 'txn_003',
      type: 'win',
      amount: 95,
      status: 'completed',
      method: 'Account Balance',
      timestamp: '2024-06-01T18:20:00Z',
      description: 'Lakers vs Warriors - Win'
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'withdrawal': return <TrendingDown className="h-4 w-4 text-blue-500" />;
      case 'bet': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'win': return <TrendingUp className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'settled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Management</h1>
        <p className="text-gray-600">Manage your profile, balance, and betting history</p>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <div className="flex items-center space-x-2">
                  {showBalance ? (
                    <p className="text-2xl font-bold">
                      {formatCurrency(balanceData?.balance || 0)}
                    </p>
                  ) : (
                    <p className="text-2xl font-bold">••••</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                  >
                    {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Winnings</p>
                <p className="text-2xl font-bold">{formatCurrency(accountStats.totalWinnings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold">{accountStats.winRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Account Tier</p>
                <p className="text-2xl font-bold">{userData?.tier || 'Bronze'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userData?.profileImageUrl} />
                    <AvatarFallback>
                      {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {userData?.firstName} {userData?.lastName}
                    </h3>
                    <p className="text-gray-600">{userData?.email}</p>
                    <Badge className={userData?.tier === 'Diamond' ? 'bg-purple-500' : 'bg-gray-500'}>
                      {userData?.tier || 'Bronze'} Member
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={userData?.username || ''} disabled />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={userData?.email || ''} disabled />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="Add phone number" />
                  </div>
                </div>

                <Button className="w-full">Update Profile</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Secure your account with 2FA</p>
                  </div>
                  <Badge variant="outline">Disabled</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">KYC Verification</h4>
                    <p className="text-sm text-gray-600">Identity verification status</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Login Alerts</h4>
                    <p className="text-sm text-gray-600">Get notified of new logins</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Enabled</Badge>
                </div>

                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transaction History</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <h4 className="font-medium">{transaction.description}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{transaction.method}</span>
                          <span>•</span>
                          <span>{new Date(transaction.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </p>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Betting Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Bets Placed</span>
                    <span className="font-bold">{accountStats.totalBets}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Bet Size</span>
                    <span className="font-bold">{formatCurrency(accountStats.averageBet)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Current Win Streak</span>
                    <span className="font-bold text-green-600">{accountStats.currentStreak}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Longest Win Streak</span>
                    <span className="font-bold">{accountStats.longestStreak}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Favorite Sport</span>
                    <span className="font-bold">{accountStats.favoritesSport}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Deposited</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(accountStats.totalDeposited)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Withdrawn</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(accountStats.totalWithdrawn)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Wagered</span>
                    <span className="font-bold">
                      {formatCurrency(accountStats.totalWagered)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Net P&L</span>
                    <span className={`font-bold ${
                      (accountStats.totalWinnings - accountStats.totalWagered) > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {formatCurrency(accountStats.totalWinnings - accountStats.totalWagered)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive betting updates via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Alerts</h4>
                    <p className="text-sm text-gray-600">Get alerts via SMS</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing Communications</h4>
                    <p className="text-sm text-gray-600">Promotional offers and news</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Account Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      <SelectItem value="cst">Central Time (CST)</SelectItem>
                      <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                      <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">Preferred Currency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="USD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD - US Dollar</SelectItem>
                      <SelectItem value="eur">EUR - Euro</SelectItem>
                      <SelectItem value="gbp">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="oddsFormat">Odds Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="American" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="american">American (-110)</SelectItem>
                      <SelectItem value="decimal">Decimal (1.91)</SelectItem>
                      <SelectItem value="fractional">Fractional (10/11)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}