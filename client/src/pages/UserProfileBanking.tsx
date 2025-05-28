import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  CreditCard, 
  DollarSign, 
  History, 
  Settings, 
  Crown, 
  Lock, 
  Shield,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Wallet,
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react';
import PlaidLinkComponent from '@/components/banking/PlaidLinkComponent';
import EnhancedDepositWithdraw from '@/components/banking/EnhancedDepositWithdraw';

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

  const getTierBadgeColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      case 'admin': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      default: return 'bg-gradient-to-r from-amber-600 to-orange-700 text-white';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return <Crown className="h-4 w-4" />;
      case 'gold': return <Crown className="h-4 w-4" />;
      case 'silver': return <Shield className="h-4 w-4" />;
      case 'admin': return <Crown className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Lock className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Authentication Required</h3>
            <p className="text-gray-500">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary">
              <AvatarImage src={user?.profileImageUrl} alt={user?.username} />
              <AvatarFallback className="text-2xl font-bold">
                {user?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{user?.username || user?.email?.split('@')[0]}</h1>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                <Badge className={getTierBadgeColor(user?.tier || 'bronze')}>
                  {getTierIcon(user?.tier || 'bronze')}
                  <span className="ml-1">{user?.tier?.toUpperCase() || 'BRONZE'} MEMBER</span>
                </Badge>
                {user?.isAdmin && (
                  <Badge className="bg-gradient-to-r from-red-500 to-red-700 text-white">
                    <Crown className="h-4 w-4 mr-1" />
                    ADMIN
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {showBalance ? `$${user?.balance?.toFixed(2) || '0.00'}` : '****'}
                  </div>
                  <div className="text-sm text-muted-foreground">Balance</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {user?.weplayTokenBalance || 0} WPC
                  </div>
                  <div className="text-sm text-muted-foreground">WeParlay Cash</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">
                    {transactions?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Transactions</div>
                </div>
                <div>
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
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="banking">
            <CreditCard className="h-4 w-4 mr-2" />
            Banking
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <Wallet className="h-4 w-4 mr-2" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={user?.username || ''} disabled />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ''} disabled />
                </div>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={user?.firstName || ''} disabled />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={user?.lastName || ''} disabled />
                </div>
              </div>
              <Button className="w-full">
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banking" className="space-y-4">
          <EnhancedDepositWithdraw />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <PlaidLinkComponent />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View your recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{transaction.description || 'Transaction'}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'Recent'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount || 0).toFixed(2)}
                        </p>
                        <Badge variant="secondary">{transaction.status || 'completed'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive email updates</p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Secure your account</p>
                </div>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Setup
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Privacy Settings</h4>
                  <p className="text-sm text-muted-foreground">Control your privacy</p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfileBanking;