import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Settings, 
  Database, 
  Server, 
  Shield, 
  DollarSign, 
  Users, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Save,
  Cpu,
  MemoryStick,
  Globe,
  Key
} from 'lucide-react';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('admin');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch admin settings
  const { data: adminSettings, isLoading: adminLoading } = useQuery({
    queryKey: ['/api/settings/admin'],
    refetchInterval: 30000
  });

  // Fetch system configuration
  const { data: systemConfig, isLoading: systemLoading } = useQuery({
    queryKey: ['/api/settings/system'],
    refetchInterval: 30000
  });

  // Fetch system health
  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/settings/health'],
    refetchInterval: 10000
  });

  // Fetch platform statistics
  const { data: platformStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/settings/stats'],
    refetchInterval: 30000
  });
  
  // Type-safe data access with fallbacks
  const adminData = (adminSettings as any)?.settings || {};
  const systemData = (systemConfig as any)?.config || {};
  const healthData = (systemHealth as any)?.health || {};
  const statsData = (platformStats as any)?.stats || {};

  // Update admin settings mutation
  const updateAdminMutation = useMutation({
    mutationFn: async (updates: any) => {
      return await apiRequest('PUT', '/api/settings/admin', updates);
    },
    onSuccess: () => {
      toast({ title: 'Admin settings updated successfully', variant: 'default' });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/admin'] });
    },
    onError: () => {
      toast({ title: 'Failed to update admin settings', variant: 'destructive' });
    }
  });

  // Backup settings mutation
  const backupMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/settings/backup');
    },
    onSuccess: (data: any) => {
      const backup = data.backup;
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weparlay-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Settings backup downloaded', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'Failed to create backup', variant: 'destructive' });
    }
  });

  const handleAdminSettingsUpdate = (key: string, value: any) => {
    const currentSettings = adminData || {};
    updateAdminMutation.mutate({ ...currentSettings, [key]: value });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 text-white"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>;
      case 'critical':
      case 'error':
        return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (adminLoading || systemLoading || healthLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin mr-2" />
        <span>Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Settings className="w-8 h-8 mr-3 text-blue-600" />
            System Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage platform configuration and monitor system health</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => backupMutation.mutate()}
            disabled={backupMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Backup Settings
          </Button>
          <Button 
            onClick={() => queryClient.invalidateQueries()}
            disabled={false}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="admin" className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Admin Settings
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <Server className="w-4 h-4 mr-2" />
            System Status
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Health Monitor
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center">
            <Database className="w-4 h-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Platform Administration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Fees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platformFee" className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Platform Fee (%)
                  </Label>
                  <Input
                    id="platformFee"
                    type="number"
                    step="0.01"
                    value={adminData?.platformFee * 100 || 5}
                    onChange={(e) => handleAdminSettingsUpdate('platformFee', parseFloat(e.target.value) / 100)}
                    placeholder="5.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxWithdrawal" className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Max Withdrawal Limit
                  </Label>
                  <Input
                    id="maxWithdrawal"
                    type="number"
                    value={adminData?.maxWithdrawalLimit || 10000}
                    onChange={(e) => handleAdminSettingsUpdate('maxWithdrawalLimit', parseFloat(e.target.value))}
                    placeholder="10000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minWithdrawal" className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Min Withdrawal Amount
                  </Label>
                  <Input
                    id="minWithdrawal"
                    type="number"
                    value={adminData?.minWithdrawalAmount || 20}
                    onChange={(e) => handleAdminSettingsUpdate('minWithdrawalAmount', parseFloat(e.target.value))}
                    placeholder="20"
                  />
                </div>
              </div>

              <Separator />

              {/* Platform Controls */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Platform Controls</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">Temporarily disable platform access for maintenance</p>
                  </div>
                  <Switch
                    checked={adminData?.maintenanceMode || false}
                    onCheckedChange={(checked) => handleAdminSettingsUpdate('maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">User Registration</Label>
                    <p className="text-sm text-gray-600">Allow new users to register accounts</p>
                  </div>
                  <Switch
                    checked={adminData?.registrationEnabled ?? true}
                    onCheckedChange={(checked) => handleAdminSettingsUpdate('registrationEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">API Keys Valid</Label>
                    <p className="text-sm text-gray-600">Mark all API keys as valid/invalid</p>
                  </div>
                  <Switch
                    checked={adminData?.apiKeysValid ?? true}
                    onCheckedChange={(checked) => handleAdminSettingsUpdate('apiKeysValid', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-5 h-5 mr-2 text-green-600" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="flex items-center"><Globe className="w-4 h-4 mr-2" />Environment:</span>
                  <Badge variant="outline">{systemData?.environment || 'development'}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center"><Cpu className="w-4 h-4 mr-2" />Uptime:</span>
                  <span>{Math.floor((systemData?.uptime || 0) / 3600)}h {Math.floor(((systemData?.uptime || 0) % 3600) / 60)}m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center"><Database className="w-4 h-4 mr-2" />Database:</span>
                  {getStatusBadge(systemData?.databaseConnected ? 'healthy' : 'critical')}
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center"><Activity className="w-4 h-4 mr-2" />System Health:</span>
                  {getStatusBadge(systemData?.systemHealth || 'operational')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2 text-purple-600" />
                  API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Configured APIs:</span>
                  <Badge className="bg-blue-500 text-white">
                    {systemData?.apis?.totalConfigured || 0} / {systemData?.apis?.totalRequired || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Health Status:</span>
                  {getStatusBadge(systemData?.apis?.healthStatus || 'warning')}
                </div>
                
                {systemData?.apis?.configured?.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Working APIs:</Label>
                    <div className="flex flex-wrap gap-1">
                      {systemData.apis.configured.map((api: string) => (
                        <Badge key={api} className="bg-green-500 text-white text-xs">{api}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {systemData?.apis?.missing?.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Missing APIs:</Label>
                    <div className="flex flex-wrap gap-1">
                      {systemData.apis.missing.map((api: string) => (
                        <Badge key={api} className="bg-red-500 text-white text-xs">{api}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-600" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {getStatusBadge(healthData?.status || 'unknown')}
                <div className="text-sm text-gray-600">
                  Last check: {new Date(healthData?.timestamp || Date.now()).toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2 text-blue-600" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {getStatusBadge(healthData?.database?.status || 'operational')}
                <div className="text-sm text-gray-600">
                  {healthData?.database?.connected ? 'Connected' : 'Disconnected'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-purple-600" />
                  APIs
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-2xl font-bold">
                  {healthData?.apis?.working || 0} / {healthData?.apis?.total || 0}
                </div>
                <div className="text-sm text-gray-600">
                  Working APIs
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services Status */}
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(healthData?.services || {}).map(([service, status]) => (
                  <div key={service} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="capitalize font-medium">{service}</span>
                    {getStatusBadge(status as string)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  User Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Users:</span>
                  <span className="font-bold">{statsData?.users?.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Users:</span>
                  <span className="font-bold text-green-600">{statsData?.users?.active || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Premium Users:</span>
                  <span className="font-bold text-purple-600">{statsData?.users?.premium || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-bold">${(statsData?.financial?.totalRevenue || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Bet Size:</span>
                  <span className="font-bold">${(statsData?.financial?.avgBetSize || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conversion Rate:</span>
                  <span className="font-bold">{(statsData?.financial?.conversionRate || 0).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-5 h-5 mr-2 text-purple-600" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-bold">{Math.floor((statsData?.system?.uptime || 0) / 3600)}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-bold">{statsData?.system?.version || '1.0.0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Restart:</span>
                  <span className="text-sm">{new Date(statsData?.system?.lastRestart || Date.now()).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}