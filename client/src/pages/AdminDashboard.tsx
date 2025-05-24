import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
// Temporarily removing missing component imports to fix server crash
import { 
  Users, 
  DollarSign, 
  Settings, 
  Calendar, 
  TrendingUp, 
  Shield, 
  Library,
  UserPlus,
  LogOut,
  PieChart,
  MoveLeft,
  Mail,
  MessageSquare,
  Bot,
  TestTube,
  Database,
  Activity,
  Eye,
  Zap,
  Bell
} from "lucide-react";

// Admin Dashboard component
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30d");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if admin access is enabled
  useEffect(() => {
    const adminAccess = localStorage.getItem('weparlay-admin-access');
    const adminExpiry = localStorage.getItem('weparlay-admin-expiry');
    
    if (!adminAccess || !adminExpiry || Date.now() > parseInt(adminExpiry)) {
      localStorage.removeItem('weparlay-admin-access');
      localStorage.removeItem('weparlay-admin-expiry');
      navigate('/admin-bypass');
    }
  }, [navigate]);

  // Fetch users for the User Management tab
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: activeTab === 'users',
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/users');
        return await response.json();
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error fetching users",
          description: "Could not load user data. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Fetch financial summary for the Overview tab
  const { data: financialSummary = {}, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ['/api/admin/financial-summary'],
    enabled: activeTab === 'overview',
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/financial-summary');
        return await response.json();
      } catch (error) {
        console.error('Error fetching financial summary:', error);
        toast({
          title: "Error fetching financial data",
          description: "Could not load financial summary. Please try again.",
          variant: "destructive",
        });
        return {};
      }
    }
  });

  // Mutation for updating user roles
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
      const response = await apiRequest(
        'PATCH', 
        `/api/admin/users/${userId}/status`, 
        { status: role }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User role updated",
        description: "The user's role has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating user role:', error);
      toast({
        title: "Error updating user role",
        description: "Failed to update the user's role. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for generating reports
  const generateReportMutation = useMutation({
    mutationFn: async (period: 'day' | 'week' | 'month' | 'year') => {
      const response = await apiRequest(
        'GET', 
        `/api/admin/reports/${period}`
      );
      return response.json();
    },
    onSuccess: (data) => {
      // In a real implementation, this would trigger a download
      console.log('Report data:', data);
      toast({
        title: "Report generated",
        description: "Your report has been generated successfully.",
      });
      setIsGeneratingReport(false);
    },
    onError: (error) => {
      console.error('Error generating report:', error);
      toast({
        title: "Error generating report",
        description: "Failed to generate the report. Please try again.",
        variant: "destructive",
      });
      setIsGeneratingReport(false);
    }
  });

  // Handle updating user role
  const handleUpdateUserRole = (userId: string, newRole: string) => {
    updateUserRoleMutation.mutate({ userId, role: newRole });
  };

  // Handle generating a report
  const handleGenerateReport = (period: 'day' | 'week' | 'month' | 'year') => {
    setIsGeneratingReport(true);
    generateReportMutation.mutate(period);
  };

  // Handle date range change
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    // Here you would fetch data for the new date range
    // This is simplified for the example
  };

  // Handle refresh
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/financial-summary'] });
    toast({
      title: "Data refreshed",
      description: "The dashboard data has been refreshed.",
    });
  };

  // Handle logging out from admin
  const handleAdminLogout = () => {
    localStorage.removeItem('weparlay-admin-access');
    localStorage.removeItem('weparlay-admin-expiry');
    navigate('/');
  };

  // Sample chart data for demonstration
  // In a real implementation, this would come from the API
  const revenueData = [
    { month: 'Jan', totalBets: 45000, revenue: 12500, payouts: 32500 },
    { month: 'Feb', totalBets: 52000, revenue: 15000, payouts: 37000 },
    { month: 'Mar', totalBets: 49000, revenue: 13800, payouts: 35200 },
    { month: 'Apr', totalBets: 63000, revenue: 18000, payouts: 45000 },
    { month: 'May', totalBets: 59000, revenue: 16500, payouts: 42500 },
    { month: 'Jun', totalBets: 75000, revenue: 21000, payouts: 54000 },
  ];

  const userActivityData = [
    { date: '01/01', activeUsers: 2400, betsPlaced: 240 },
    { date: '02/01', activeUsers: 1398, betsPlaced: 139 },
    { date: '03/01', activeUsers: 9800, betsPlaced: 980 },
    { date: '04/01', activeUsers: 3908, betsPlaced: 390 },
    { date: '05/01', activeUsers: 4800, betsPlaced: 480 },
    { date: '06/01', activeUsers: 3800, betsPlaced: 380 },
  ];

  const sportsData = [
    { name: 'NBA', value: 4000 },
    { name: 'NFL', value: 3000 },
    { name: 'NHL', value: 2000 },
    { name: 'MLB', value: 2780 },
    { name: 'UFC', value: 1890 },
    { name: 'Soccer', value: 2390 },
  ];

  const winRateData = [
    { category: '0-10%', winRate: 25 },
    { category: '11-20%', winRate: 30 },
    { category: '21-30%', winRate: 20 },
    { category: '31-40%', winRate: 15 },
    { category: '41-50%', winRate: 7 },
    { category: '51%+', winRate: 3 },
  ];

  const dailyEarningsData = [
    { date: '01/01', grossRevenue: 3400, netRevenue: 2400 },
    { date: '02/01', grossRevenue: 2210, netRevenue: 1398 },
    { date: '03/01', grossRevenue: 5000, netRevenue: 3800 },
    { date: '04/01', grossRevenue: 4780, netRevenue: 3908 },
    { date: '05/01', grossRevenue: 5890, netRevenue: 4800 },
    { date: '06/01', grossRevenue: 4390, netRevenue: 3800 },
  ];

  const transactionVolumeData = [
    { date: '01/01', deposits: 5000, withdrawals: 3000, bets: 7000 },
    { date: '02/01', deposits: 4500, withdrawals: 2500, bets: 6800 },
    { date: '03/01', deposits: 6000, withdrawals: 4000, bets: 8500 },
    { date: '04/01', deposits: 5500, withdrawals: 3200, bets: 7600 },
    { date: '05/01', deposits: 7000, withdrawals: 4600, bets: 9800 },
    { date: '06/01', deposits: 6300, withdrawals: 3900, bets: 8900 },
  ];

  // Sample user data for demonstration
  const sampleUsers = users.length > 0 ? users : [
    { id: '1', username: 'admin_user', email: 'admin@weparlay.io', role: 'admin', status: 'active', lastLogin: '2025-05-17T12:30:45' },
    { id: '2', username: 'moderator1', email: 'mod1@weparlay.io', role: 'moderator', status: 'active', lastLogin: '2025-05-16T10:15:22' },
    { id: '3', username: 'staff_support', email: 'support@weparlay.io', role: 'staff', status: 'active', lastLogin: '2025-05-17T09:45:11' },
    { id: '4', username: 'user123', email: 'user123@example.com', role: 'user', status: 'active', lastLogin: '2025-05-15T18:22:03' },
    { id: '5', username: 'newuser456', email: 'newuser@example.com', role: 'user', status: 'inactive', lastLogin: '2025-05-10T14:05:37' },
  ];

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <MoveLeft className="h-4 w-4 mr-2" />
              Back to Site
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">WeParlay Admin Dashboard</h1>
        </div>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleAdminLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Exit Admin
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <PieChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            Communications
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Admin Tools
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <Button onClick={handleRefresh} variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Platform Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sampleUsers.length}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231</div>
                <p className="text-xs text-muted-foreground">+20% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Bets</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">+7% from yesterday</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email System</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">✅ Active</div>
                <p className="text-xs text-muted-foreground">Hostinger SMTP connected</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">User Management</h2>
            <div className="flex gap-2">
              <Link href="/community">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  User Directory
                </Button>
              </Link>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New User
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">User management tools will be available here.</p>
                <div className="mt-4">
                  <Link href="/community">
                    <Button>View All Users</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Communications Management</h2>
              <div className="flex gap-2">
                <Link href="/email-monitoring">
                  <Button>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Email System
                  </CardTitle>
                  <CardDescription>Monitor and manage email communications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">✅ Welcome emails</p>
                    <p className="text-sm text-gray-600">✅ Bet confirmations</p>
                    <p className="text-sm text-gray-600">✅ Win notifications</p>
                    <p className="text-sm text-gray-600">✅ Security alerts</p>
                  </div>
                  <Link href="/email-monitoring">
                    <Button className="w-full mt-4" size="sm">
                      View Email Logs
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    SMS Notifications
                  </CardTitle>
                  <CardDescription>SMS alerts and notifications via Twilio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">📱 Welcome SMS</p>
                    <p className="text-sm text-gray-600">📱 Bet confirmations</p>
                    <p className="text-sm text-gray-600">📱 Win alerts</p>
                    <p className="text-sm text-gray-600">📱 Security notifications</p>
                  </div>
                  <Button className="w-full mt-4" size="sm" variant="outline">
                    Configure SMS
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-600" />
                    Social Media Bots
                  </CardTitle>
                  <CardDescription>Automated social media marketing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">🐦 Twitter automation</p>
                    <p className="text-sm text-gray-600">📘 Facebook posts</p>
                    <p className="text-sm text-gray-600">📊 Marketing campaigns</p>
                    <p className="text-sm text-gray-600">🎯 Engagement tracking</p>
                  </div>
                  <Link href="/social-bots">
                    <Button className="w-full mt-4" size="sm">
                      Manage Bots
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Admin Tools Tab */}
        <TabsContent value="tools">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Admin Tools & Testing</h2>
              <Button onClick={handleRefresh} variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Refresh All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5 text-blue-600" />
                    System Testing
                  </CardTitle>
                  <CardDescription>Test all platform functionality</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/auth-test">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Authentication Test
                      </Button>
                    </Link>
                    <Link href="/notification-test">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Bell className="h-4 w-4 mr-2" />
                        Notification Test
                      </Button>
                    </Link>
                    <Link href="/payment-demo">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Payment Test
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-600" />
                    Database Management
                  </CardTitle>
                  <CardDescription>Monitor and manage data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">👥 {sampleUsers.length} Total Users</p>
                    <p className="text-sm text-gray-600">🎯 Active Bets</p>
                    <p className="text-sm text-gray-600">💰 Financial Records</p>
                    <p className="text-sm text-gray-600">📊 Analytics Data</p>
                  </div>
                  <Button className="w-full mt-4" size="sm" variant="outline">
                    Database Status
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Security & Access
                  </CardTitle>
                  <CardDescription>Security monitoring and controls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/admin-bypass">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Access
                      </Button>
                    </Link>
                    <Link href="/security-settings">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Security Settings
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Activity Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Admin Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" size="sm" onClick={() => window.open('/email-monitoring', '_blank')}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Logs
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open('/community', '_blank')}>
                    <Users className="h-4 w-4 mr-2" />
                    User Directory
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open('/social-bots', '_blank')}>
                    <Bot className="h-4 w-4 mr-2" />
                    Social Bots
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open('/auth-test', '_blank')}>
                    <TestTube className="h-4 w-4 mr-2" />
                    System Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="finance">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Financial Management</h2>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
            
            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">$45,231</div>
                  <p className="text-sm text-gray-600">Platform earnings</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>House Edge</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">5%</div>
                  <p className="text-sm text-gray-600">On all bets</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Payouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">$12,847</div>
                  <p className="text-sm text-gray-600">Pending withdrawals</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Bank Account Information</CardTitle>
                  <CardDescription>Update your bank account for payouts</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="account-name">Account Holder Name</Label>
                      <Input id="account-name" placeholder="Enter account holder name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-number">Account Number</Label>
                      <Input id="account-number" placeholder="Enter account number" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routing-number">Routing Number</Label>
                      <Input id="routing-number" placeholder="Enter routing number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank-name">Bank Name</Label>
                      <Input id="bank-name" placeholder="Enter bank name" />
                    </div>
                    <Button className="w-full">Update Bank Account</Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Platform Fees</CardTitle>
                  <CardDescription>Configure your platform fee structure</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bet-fee">Bet Fee Percentage</Label>
                      <div className="flex items-center">
                        <Input id="bet-fee" placeholder="5" type="number" min="0" max="100" />
                        <span className="ml-2">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="withdrawal-fee">Withdrawal Fee</Label>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4" />
                        <Input id="withdrawal-fee" placeholder="2.50" type="number" min="0" step="0.01" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minimum-bet">Minimum Bet Amount</Label>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4" />
                        <Input id="minimum-bet" placeholder="5.00" type="number" min="0" step="0.01" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maximum-bet">Maximum Bet Amount</Label>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4" />
                        <Input id="maximum-bet" placeholder="10000.00" type="number" min="0" step="0.01" />
                      </div>
                    </div>
                    <Button className="w-full">Update Fee Structure</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View and filter recent platform transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">May 17, 2025</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">user123</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">Deposit</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 dark:text-green-400">+$500.00</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Completed</span></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">May 16, 2025</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">johndoe</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">Withdrawal</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 dark:text-red-400">-$250.00</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Completed</span></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">May 16, 2025</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">bettingpro</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">Withdrawal</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 dark:text-red-400">-$1,000.00</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">Pending</span></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">May 15, 2025</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">alice2025</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">Deposit</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 dark:text-green-400">+$350.00</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Completed</span></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">May 14, 2025</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">sportsfan42</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">Payout</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 dark:text-red-400">-$750.00</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Completed</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Management Tab */}
        <TabsContent value="content">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Content Management</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Sports and Leagues Management</CardTitle>
                <CardDescription>Enable or disable sports and leagues available on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sample sports toggle controls */}
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="font-medium">NBA (Basketball)</div>
                    <Button variant="outline">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="font-medium">NFL (Football)</div>
                    <Button variant="outline">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="font-medium">MLB (Baseball)</div>
                    <Button variant="outline">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="font-medium">NHL (Hockey)</div>
                    <Button variant="outline">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="font-medium">UFC (Mixed Martial Arts)</div>
                    <Button variant="outline">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between pb-2">
                    <div className="font-medium">Tennis</div>
                    <Button variant="outline">Enabled</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Betting Markets</CardTitle>
                <CardDescription>Customize available betting markets for each sport</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="font-medium mb-2">NBA Markets</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="nba-spread" className="rounded" checked readOnly />
                      <label htmlFor="nba-spread">Point Spread</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="nba-moneyline" className="rounded" checked readOnly />
                      <label htmlFor="nba-moneyline">Moneyline</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="nba-total" className="rounded" checked readOnly />
                      <label htmlFor="nba-total">Total Points</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="nba-quarters" className="rounded" checked readOnly />
                      <label htmlFor="nba-quarters">Quarter Lines</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="nba-player-props" className="rounded" checked readOnly />
                      <label htmlFor="nba-player-props">Player Props</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="nba-futures" className="rounded" checked readOnly />
                      <label htmlFor="nba-futures">Futures</label>
                    </div>
                  </div>
                  
                  <div className="font-medium mb-2 mt-4">NFL Markets</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="nfl-spread" className="rounded" checked readOnly />
                      <label htmlFor="nfl-spread">Point Spread</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="nfl-moneyline" className="rounded" checked readOnly />
                      <label htmlFor="nfl-moneyline">Moneyline</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="nfl-total" className="rounded" checked readOnly />
                      <label htmlFor="nfl-total">Total Points</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="nfl-quarters" className="rounded" checked readOnly />
                      <label htmlFor="nfl-quarters">Quarter Lines</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="nfl-player-props" className="rounded" checked readOnly />
                      <label htmlFor="nfl-player-props">Player Props</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="nfl-futures" className="rounded" checked readOnly />
                      <label htmlFor="nfl-futures">Futures</label>
                    </div>
                  </div>
                  
                  <Button className="mt-4">Save Market Settings</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Platform Settings</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure basic platform settings</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input id="platform-name" placeholder="WeParlay.io" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Support Email</Label>
                    <Input id="contact-email" placeholder="support@weparlay.io" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <select id="timezone" className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700">
                      <option>Eastern Time (ET)</option>
                      <option>Central Time (CT)</option>
                      <option>Mountain Time (MT)</option>
                      <option>Pacific Time (PT)</option>
                      <option>Greenwich Mean Time (GMT)</option>
                    </select>
                  </div>
                  <Button>Save General Settings</Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Configure user privacy and data sharing settings</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="public-profiles">Public User Profiles</Label>
                    <input type="checkbox" id="public-profiles" className="toggle" checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-earnings">Show User Earnings</Label>
                    <input type="checkbox" id="show-earnings" className="toggle" checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-bet-history">Public Bet History</Label>
                    <input type="checkbox" id="show-bet-history" className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="social-sharing">Social Media Sharing</Label>
                    <input type="checkbox" id="social-sharing" className="toggle" checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="anonymous-mode">Anonymous Mode Option</Label>
                    <input type="checkbox" id="anonymous-mode" className="toggle" checked />
                  </div>
                  <Button>Save Privacy Settings</Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure platform security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="two-factor">Require Two-Factor Authentication</Label>
                    <input type="checkbox" id="two-factor" className="toggle" checked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input id="session-timeout" className="w-24" type="number" min="5" value="60" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                    <Input id="password-expiry" className="w-24" type="number" min="0" value="90" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-attempts">Max Failed Login Attempts</Label>
                    <Input id="login-attempts" className="w-24" type="number" min="1" value="5" />
                  </div>
                  <Button>Save Security Settings</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}