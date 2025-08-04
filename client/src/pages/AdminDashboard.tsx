import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  Settings, Users, DollarSign, BarChart3, Shield, Database,
  MessageSquare, Mail, Bell, Globe, Zap, Activity, TrendingUp,
  Server, FileText, Lock, Eye, RefreshCw, AlertTriangle, Trophy
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');

  // System Health Check
  const { data: systemHealth } = useQuery({
    queryKey: ['/api/system/system-health'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Financial Summary
  const { data: financialSummary } = useQuery({
    queryKey: ['/api/admin/financial-summary'],
    initialData: {}
  });

  // User Analytics
  const { data: userAnalytics } = useQuery({
    queryKey: ['/api/admin/analytics'],
    initialData: {}
  });

  // Platform Settings
  const { data: platformSettings } = useQuery({
    queryKey: ['/api/admin/platform-settings'],
    initialData: {}
  });

  const AdminCard = ({ title, description, icon: Icon, onClick, status, value }: {
    title: string;
    description: string;
    icon: any;
    onClick?: () => void;
    status?: string;
    value?: string | number;
  }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value || 'N/A'}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {status && (
          <Badge variant={status === 'healthy' ? 'default' : 'destructive'} className="mt-2">
            {status}
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">WeParlay Admin Dashboard</h1>
          <p className="text-slate-300">Complete platform management and oversight</p>
        </div>

        {/* System Status Alert */}
        {systemHealth && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Activity className="h-4 w-4" />
            <AlertDescription>
              System Status: <strong>Online</strong> • Last Updated: {(systemHealth as any)?.timestamp ? new Date((systemHealth as any).timestamp).toLocaleTimeString() : 'Unknown'}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdminCard
                title="Total Users"
                description="Active platform users"
                icon={Users}
                value={(userAnalytics as any)?.totalUsers || '0'}
                status="healthy"
                onClick={() => setActiveSection('users')}
              />
              <AdminCard
                title="Total Revenue"
                description="Platform earnings"
                icon={DollarSign}
                value={`$${(financialSummary as any)?.totalRevenue || '0'}`}
                status="healthy"
                onClick={() => setActiveSection('finances')}
              />
              <AdminCard
                title="Active Bets"
                description="Live betting activity"
                icon={TrendingUp}
                value={(userAnalytics as any)?.activeBets || '0'}
                status="healthy"
              />
              <AdminCard
                title="System Health"
                description="Server performance"
                icon={Server}
                value="99.9%"
                status={systemHealth ? 'healthy' : 'warning'}
                onClick={() => setActiveSection('system')}
              />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" onClick={() => setActiveSection('users')}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button variant="outline" onClick={() => setActiveSection('finances')}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    View Finances
                  </Button>
                  <Button variant="outline" onClick={() => setActiveSection('system')}>
                    <Server className="mr-2 h-4 w-4" />
                    System Status
                  </Button>
                  <Button variant="outline" onClick={() => setActiveSection('settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Platform Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users, permissions, and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex-col" onClick={() => window.open('/users', '_blank')}>
                    <Users className="h-6 w-6 mb-2" />
                    User Directory
                  </Button>
                  <Button className="h-20 flex-col" onClick={() => window.location.href = '/admin/user-analytics'}>
                    <BarChart3 className="h-6 w-6 mb-2" />
                    User Analytics
                  </Button>
                  <Button className="h-20 flex-col" onClick={() => window.open('/admin/support', '_blank')}>
                    <MessageSquare className="h-6 w-6 mb-2" />
                    Support Tickets
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Finances Tab */}
          <TabsContent value="finances" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Management</CardTitle>
                <CardDescription>Monitor revenue, transactions, and payouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex-col" onClick={() => window.open('/admin/financial-overview', '_blank')}>
                    <DollarSign className="h-6 w-6 mb-2" />
                    Financial Overview
                  </Button>
                  <Button className="h-20 flex-col" onClick={() => window.open('/admin/transactions', '_blank')}>
                    <FileText className="h-6 w-6 mb-2" />
                    Transaction History
                  </Button>
                  <Button className="h-20 flex-col" onClick={() => window.open('/admin/payouts', '_blank')}>
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Manage Payouts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Manage betting content, odds, and gaming integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex-col" onClick={() => window.open('/gaming', '_blank')}>
                    <Zap className="h-6 w-6 mb-2" />
                    Gaming Hub
                  </Button>
                  <Button className="h-20 flex-col" onClick={() => window.open('/gaming-integration', '_blank')}>
                    <Globe className="h-6 w-6 mb-2" />
                    Gaming Integration
                  </Button>
                  <Button className="h-20 flex-col" onClick={() => window.open('/fantasy', '_blank')}>
                    <Trophy className="h-6 w-6 mb-2" />
                    Fantasy Sports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Management</CardTitle>
                <CardDescription>Monitor system health, API status, and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex-col" onClick={() => window.open('/admin/system-health', '_blank')}>
                    <Activity className="h-6 w-6 mb-2" />
                    System Health
                  </Button>
                  <Button className="h-20 flex-col" onClick={() => window.open('/admin/api-status', '_blank')}>
                    <Database className="h-6 w-6 mb-2" />
                    API Status
                  </Button>
                  <Button className="h-20 flex-col" onClick={() => window.open('/api-test', '_blank')}>
                    <Server className="h-6 w-6 mb-2" />
                    RapidAPI Testing
                  </Button>
                  <Button className="h-20 flex-col" onClick={() => window.open('/admin/logs', '_blank')}>
                    <Eye className="h-6 w-6 mb-2" />
                    System Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Social Media Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline" 
                    onClick={() => window.open('/admin/social-media-dashboard', '_blank')}>
                    <Globe className="h-4 w-4 mr-2" />
                    Social Media Dashboard
                  </Button>
                  <Button className="w-full justify-start" variant="outline"
                    onClick={() => window.open('/social-bots', '_blank')}>
                    <Activity className="h-4 w-4 mr-2" />
                    Social Media Bots
                  </Button>
                  <Button className="w-full justify-start" variant="outline"
                    onClick={() => window.open('/email-monitoring', '_blank')}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Monitoring
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Community Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline"
                    onClick={() => window.open('/site-navigation', '_blank')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Site Navigation
                  </Button>
                  <Button className="w-full justify-start" variant="outline"
                    onClick={() => window.open('/page-status-checker', '_blank')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Page Status Checker
                  </Button>
                  <Button className="w-full justify-start" variant="outline"
                    onClick={() => window.open('/weparlay-cash', '_blank')}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    WeParlay Cash
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Authentication Testing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline"
                    onClick={() => window.open('/auth-test-demo', '_blank')}>
                    <Lock className="h-4 w-4 mr-2" />
                    Auth Test Demo
                  </Button>
                  <Button className="w-full justify-start" variant="outline"
                    onClick={() => window.open('/notifications-test', '_blank')}>
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications Test
                  </Button>
                  <Button className="w-full justify-start" variant="outline"
                    onClick={() => window.open('/payment-demo', '_blank')}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Payment Demo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Testing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline"
                    onClick={() => window.open('/security-info', '_blank')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Security Info
                  </Button>
                  <Button className="w-full justify-start" variant="outline"
                    onClick={() => window.open('/security-settings', '_blank')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Security Settings
                  </Button>
                  <div className="text-sm text-slate-600">
                    Test security features and monitor system integrity
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex-col" onClick={() => window.open('/admin/platform-settings', '_blank')}>
                    <Settings className="h-6 w-6 mb-2" />
                    Platform Config
                  </Button>
                  <Button className="h-20 flex-col" onClick={() => window.open('/admin/security', '_blank')}>
                    <Shield className="h-6 w-6 mb-2" />
                    Security Settings
                  </Button>
                  <Button className="h-20 flex-col" onClick={() => window.open('/admin/notifications', '_blank')}>
                    <Bell className="h-6 w-6 mb-2" />
                    Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-400">
          <p>WeParlay Admin Dashboard • {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}