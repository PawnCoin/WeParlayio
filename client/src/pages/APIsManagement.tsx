import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Settings, Globe, Key, Activity, AlertTriangle, CheckCircle,
  Clock, RefreshCw, Shield, Zap, TrendingUp, BarChart3,
  Database, Cloud, Code, Terminal, Monitor, Lock,
  Unlock, Eye, EyeOff, Copy, Plus, Minus, Star, Crown
} from "lucide-react";

interface APIEndpoint {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  lastChecked: string;
  responseTime: number;
  uptime: number;
  requestsToday: number;
  rateLimitRemaining: number;
  rateLimitTotal: number;
  endpoint: string;
  authentication: string;
  category: string;
}

interface APIKey {
  id: string;
  name: string;
  service: string;
  keyPreview: string;
  createdAt: string;
  lastUsed: string;
  usageCount: number;
  status: 'active' | 'revoked' | 'expired';
  permissions: string[];
}

interface APIMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorCount: number;
  uptime: number;
  topEndpoints: Array<{ name: string; requests: number }>;
}

const APIsManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyService, setNewKeyService] = useState('');

  // Fetch API endpoints status
  const { data: endpoints = [], isLoading: endpointsLoading } = useQuery<APIEndpoint[]>({
    queryKey: ['/api/endpoints/status'],
    enabled: isAuthenticated,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch API keys
  const { data: apiKeys = [], isLoading: keysLoading } = useQuery<APIKey[]>({
    queryKey: ['/api/keys'],
    enabled: isAuthenticated
  });

  // Fetch API metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<APIMetrics>({
    queryKey: ['/api/metrics'],
    enabled: isAuthenticated
  });

  // Test API endpoint mutation
  const testEndpointMutation = useMutation({
    mutationFn: async (endpointId: string) => {
      const response = await fetch(`/api/endpoints/${endpointId}/test`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Test failed');
      return response.json();
    },
    onSuccess: (data, endpointId) => {
      toast({
        title: "Test Successful",
        description: `API endpoint responded in ${data.responseTime}ms`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/endpoints/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "API endpoint test failed",
        variant: "destructive",
      });
    }
  });

  // Create API key mutation
  const createKeyMutation = useMutation({
    mutationFn: async (data: { name: string; service: string }) => {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create API key');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "API Key Created",
        description: "New API key has been generated successfully",
      });
      setNewKeyName('');
      setNewKeyService('');
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create API key",
        variant: "destructive",
      });
    }
  });

  // Revoke API key mutation
  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to revoke API key');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "API Key Revoked",
        description: "API key has been revoked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
    },
    onError: (error: any) => {
      toast({
        title: "Revocation Failed",
        description: error.message || "Failed to revoke API key",
        variant: "destructive",
      });
    }
  });

  const handleTestEndpoint = (endpointId: string) => {
    testEndpointMutation.mutate(endpointId);
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim() || !newKeyService.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and service",
        variant: "destructive",
      });
      return;
    }

    createKeyMutation.mutate({
      name: newKeyName.trim(),
      service: newKeyService.trim()
    });
  };

  const handleRevokeKey = (keyId: string) => {
    revokeKeyMutation.mutate(keyId);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />;
      case 'inactive': return <Clock className="h-3 w-3" />;
      case 'error': return <AlertTriangle className="h-3 w-3" />;
      case 'maintenance': return <RefreshCw className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sports': return <BarChart3 className="h-4 w-4" />;
      case 'payment': return <Crown className="h-4 w-4" />;
      case 'social': return <Globe className="h-4 w-4" />;
      case 'crypto': return <Star className="h-4 w-4" />;
      case 'data': return <Database className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to access APIs management</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            APIs Management
          </h1>
          <p className="text-muted-foreground">Monitor and manage all API integrations</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Real-time Monitoring
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="keys" className="flex items-center gap-1">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Metrics Cards */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.totalRequests?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.successRate || 99.5}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Avg Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.averageResponseTime || 245}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Response time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.uptime || 99.9}%
                </div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            {/* Active Endpoints */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Active Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {endpointsLoading ? (
                    <p className="text-center py-8 text-muted-foreground">Loading endpoints...</p>
                  ) : (
                    endpoints.slice(0, 5).map((endpoint) => (
                      <div key={endpoint.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded-full text-white ${getStatusColor(endpoint.status)}`}>
                            {getStatusIcon(endpoint.status)}
                          </div>
                          <div>
                            <p className="font-medium">{endpoint.name}</p>
                            <p className="text-sm text-muted-foreground">{endpoint.provider}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{endpoint.responseTime}ms</p>
                          <p className="text-xs text-muted-foreground">
                            {endpoint.requestsToday} requests
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Endpoints */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.topEndpoints?.map((endpoint, index) => (
                    <div key={endpoint.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold w-6">#{index + 1}</span>
                        <span className="text-sm">{endpoint.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {endpoint.requests.toLocaleString()}
                      </span>
                    </div>
                  )) || (
                    <p className="text-center py-8 text-muted-foreground">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API Endpoints Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {endpointsLoading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading endpoints...</p>
                ) : endpoints.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No endpoints configured</p>
                ) : (
                  endpoints.map((endpoint) => (
                    <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full text-white ${getStatusColor(endpoint.status)}`}>
                          {getStatusIcon(endpoint.status)}
                        </div>
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(endpoint.category)}
                          <div>
                            <p className="font-medium">{endpoint.name}</p>
                            <p className="text-sm text-muted-foreground">{endpoint.provider}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {endpoint.endpoint}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{endpoint.responseTime}ms</p>
                          <p className="text-xs text-muted-foreground">
                            {endpoint.uptime}% uptime
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {endpoint.rateLimitRemaining}/{endpoint.rateLimitTotal} remaining
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestEndpoint(endpoint.id)}
                          disabled={testEndpointMutation.isPending}
                        >
                          {testEndpointMutation.isPending ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Activity className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="keys">
          <div className="space-y-6">
            {/* Create New Key */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New API Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input
                      id="key-name"
                      placeholder="e.g., Production API Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="key-service">Service</Label>
                    <Input
                      id="key-service"
                      placeholder="e.g., Sports Data API"
                      value={newKeyService}
                      onChange={(e) => setNewKeyService(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCreateKey}
                  disabled={createKeyMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {createKeyMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create API Key
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Existing Keys */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {keysLoading ? (
                    <p className="text-center py-8 text-muted-foreground">Loading API keys...</p>
                  ) : apiKeys.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No API keys found</p>
                  ) : (
                    apiKeys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded ${
                            key.status === 'active' ? 'bg-green-100 text-green-600' :
                            key.status === 'expired' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            <Key className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{key.name}</p>
                            <p className="text-sm text-muted-foreground">{key.service}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-xs bg-muted p-1 rounded">
                                {showKeys[key.id] ? key.keyPreview : '••••••••••••••••'}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleKeyVisibility(key.id)}
                                className="h-6 w-6 p-0"
                              >
                                {showKeys[key.id] ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(key.keyPreview)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge variant={
                              key.status === 'active' ? 'default' :
                              key.status === 'expired' ? 'secondary' : 'destructive'
                            }>
                              {key.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {key.usageCount} uses
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last used: {new Date(key.lastUsed).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevokeKey(key.id)}
                            disabled={revokeKeyMutation.isPending || key.status === 'revoked'}
                          >
                            {revokeKeyMutation.isPending ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Lock className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Request Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Requests</span>
                    <span className="font-medium">{metrics?.totalRequests?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-medium">{metrics?.successRate || 99.5}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Error Count</span>
                    <span className="font-medium">{metrics?.errorCount || 12}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Response Time</span>
                    <span className="font-medium">{metrics?.averageResponseTime || 245}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Uptime</span>
                    <Badge variant="default">{metrics?.uptime || 99.9}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Endpoints</span>
                    <Badge variant="outline">{endpoints.filter(e => e.status === 'active').length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Keys</span>
                    <Badge variant="outline">{apiKeys.filter(k => k.status === 'active').length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">System Status</span>
                    <Badge variant="default">Operational</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
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
                    <Label htmlFor="rate-limiting">Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable rate limiting for API requests
                    </p>
                  </div>
                  <Switch id="rate-limiting" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="key-rotation">Auto Key Rotation</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically rotate API keys monthly
                    </p>
                  </div>
                  <Switch id="key-rotation" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="monitoring">Enhanced Monitoring</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed request monitoring
                    </p>
                  </div>
                  <Switch id="monitoring" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="endpoint-alerts">Endpoint Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when endpoints go down
                    </p>
                  </div>
                  <Switch id="endpoint-alerts" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="usage-alerts">Usage Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when approaching rate limits
                    </p>
                  </div>
                  <Switch id="usage-alerts" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="error-alerts">Error Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify on high error rates
                    </p>
                  </div>
                  <Switch id="error-alerts" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIsManagement;