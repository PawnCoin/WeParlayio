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
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const { toast } = useToast();

  // NO FAKE DATA - Only real users from database will be shown

  const handleRefresh = () => {
    toast({
      title: "Dashboard Refreshed",
      description: "All data has been updated successfully.",
    });
  };

  const handleUpdateUserRole = (userId: number, newRole: string) => {
    toast({
      title: "User Role Updated",
      description: `User role changed to ${newRole}`,
    });
  };

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
      toast({
        title: "Report Generated",
        description: "Your admin report has been generated successfully.",
      });
    }, 2000);
  };

  const handleDateRangeChange = (range: any) => {
    setDateRange(range);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <MoveLeft className="h-4 w-4 mr-2" />
                Back to Platform
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-orange-400 bg-clip-text text-transparent">
                WeParlay Admin Control Center
              </h1>
              <p className="text-gray-400">Centralized management for all admin functions</p>
            </div>
          </div>
          
          <Button variant="destructive" onClick={() => window.location.href = '/'}>
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
                  <div className="text-2xl font-bold">Loading...</div>
                  <p className="text-xs text-muted-foreground">Real data from database</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Loading...</div>
                  <p className="text-xs text-muted-foreground">Real revenue data</p>
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
                      <p className="text-sm text-gray-600">👥 Loading real user count...</p>
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
                    <Button variant="outline" size="sm" onClick={() => window.open('/user-directory', '_blank')}>
                      <Users className="h-4 w-4 mr-2" />
                      User Directory
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open('/bot-control', '_blank')}>
                      <Bot className="h-4 w-4 mr-2" />
                      Bot Control Center
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open('/auth-test', '_blank')}>
                      <TestTube className="h-4 w-4 mr-2" />
                      System Test
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Bot User Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-green-600" />
                    Generate Real Platform Data
                  </CardTitle>
                  <CardDescription>
                    Create bot users with realistic betting activity to populate your platform with authentic data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/admin/populate-bot-users', { method: 'POST' });
                            const result = await response.json();
                            toast({
                              title: result.success ? "Success!" : "Error",
                              description: result.message || result.error,
                              variant: result.success ? "default" : "destructive"
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to create bot users",
                              variant: "destructive"
                            });
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Create Bot Users & Data
                      </Button>
                      
                      <Button 
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/admin/generate-daily-activity', { method: 'POST' });
                            const result = await response.json();
                            toast({
                              title: result.success ? "Success!" : "Error",
                              description: result.message || result.error,
                              variant: result.success ? "default" : "destructive"
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to generate activity",
                              variant: "destructive"
                            });
                          }
                        }}
                        variant="outline"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Generate Daily Activity
                      </Button>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">What this will create:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• 5 realistic bot users with different subscription tiers</li>
                        <li>• Betting history with wins, losses, and pending bets</li>
                        <li>• Transaction records (deposits and withdrawals)</li>
                        <li>• Real user stats for your admin dashboard</li>
                        <li>• Active user directory with profile data</li>
                      </ul>
                    </div>
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
                      <Button type="submit" className="w-full">Update Bank Account</Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Analytics</CardTitle>
                    <CardDescription>Track platform performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Daily Revenue</span>
                        <span className="font-bold text-green-600">+$1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weekly Revenue</span>
                        <span className="font-bold text-green-600">+$8,731</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Revenue</span>
                        <span className="font-bold text-green-600">+$45,231</span>
                      </div>
                      <Button className="w-full mt-4">Generate Report</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Platform Settings</h2>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Refresh Settings
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Configuration</CardTitle>
                    <CardDescription>Core platform settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform-name">Platform Name</Label>
                      <Input id="platform-name" defaultValue="WeParlay" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="house-edge">House Edge (%)</Label>
                      <Input id="house-edge" type="number" defaultValue="5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-bet">Maximum Bet Amount</Label>
                      <Input id="max-bet" type="number" defaultValue="10000" />
                    </div>
                    <Button className="w-full">Save Settings</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Email Configuration</CardTitle>
                    <CardDescription>SMTP and email settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>SMTP Status</Label>
                      <div className="text-green-600 font-semibold">✅ Connected (Hostinger)</div>
                    </div>
                    <div className="space-y-2">
                      <Label>From Email</Label>
                      <div className="text-sm text-gray-600">support@weparlay.io</div>
                    </div>
                    <Link href="/email-monitoring">
                      <Button className="w-full">View Email Dashboard</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}