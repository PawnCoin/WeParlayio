import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Clock, Wifi, Server, Database, Globe, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ApiService {
  name: string;
  status: 'operational' | 'degraded' | 'offline' | 'maintenance';
  responseTime: number;
  description: string;
  type: 'external' | 'gaming' | 'social' | 'streaming' | 'fantasy' | 'communication' | 'database' | 'internal';
  configured: boolean;
  issue: string | null;
  priority: number;
}

interface ApiStatusResponse {
  totalServices: number;
  operationalServices: number;
  degradedServices: number;
  offlineServices: number;
  configuredServices: number;
  overallStatus: string;
  services: ApiService[];
  healthPercentage: number;
  avgResponseTime: number;
  systemUptime: number;
  lastRefresh: string;
  timestamp: string;
  categories: {
    sports: number;
    gaming: number;
    social: number;
    streaming: number;
    fantasy: number;
    communication: number;
    infrastructure: number;
  };
}

export default function ApiStatus() {
  const { user } = useAuth();
  
  // Restrict access to admin users only
  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch API statuses
  const { data: apiData, isLoading, refetch, isRefetching } = useQuery<ApiStatusResponse>({
    queryKey: ['/api/system/api-status'],
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'default';
      case 'offline': return 'destructive';
      case 'degraded': return 'secondary';
      case 'maintenance': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return CheckCircle;
      case 'offline': return XCircle;
      case 'degraded': return AlertTriangle;
      case 'maintenance': return Clock;
      default: return AlertTriangle;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'external': return Globe;
      case 'gaming': return Server;
      case 'social': return Wifi;
      case 'streaming': return Globe;
      case 'fantasy': return Server;
      case 'communication': return Wifi;
      case 'database': return Database;
      case 'internal': return Server;
      default: return Server;
    }
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime < 200) return 'text-green-600';
    if (responseTime < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const StatCard = ({ title, value, icon: Icon, status }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${
            status === 'healthy' || status === 'operational' ? 'text-green-500' : 
            status === 'unhealthy' || status === 'degraded' ? 'text-red-500' : 
            'text-yellow-500'
          }`} />
        </div>
      </CardContent>
    </Card>
  );

  // Use real API data only - no mock data
  const services = apiData?.services || [];
  const totalServices = apiData?.totalServices || 0;
  const operationalServices = apiData?.operationalServices || 0;
  const degradedServices = apiData?.degradedServices || 0;
  const offlineServices = apiData?.offlineServices || 0;
  const overallStatus = apiData?.overallStatus || 'offline';
  const avgResponseTime = apiData?.avgResponseTime || 0;
  const healthPercentage = apiData?.healthPercentage || 0;
  const categories = apiData?.categories || {};

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  const filterServicesByType = (type: string) => {
    if (type === 'all') return services;
    return services.filter(service => service.type === type);
  };

  const ServiceCard = ({ service }: { service: ApiService }) => {
    const StatusIcon = getStatusIcon(service.status);
    const TypeIcon = getTypeIcon(service.type);

    return (
      <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${
              service.status === 'operational' ? 'text-green-500' :
              service.status === 'offline' ? 'text-red-500' :
              'text-yellow-500'
            }`} />
            <TypeIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium">{service.name}</h3>
              <Badge variant={getStatusColor(service.status) as any}>
                {service.status}
              </Badge>
              <Badge variant="outline">{service.type}</Badge>
              {service.priority === 1 && (
                <Badge variant="default" className="text-xs">Priority 1</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{service.description}</p>
            {service.issue && (
              <p className="text-xs text-red-500 mt-1">Issue: {service.issue}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Configured: {service.configured ? '✓ Yes' : '✗ No'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium ${getResponseTimeColor(service.responseTime)}`}>
            {service.responseTime}ms
          </p>
          <p className="text-xs text-muted-foreground">
            Response Time
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Status Dashboard</h1>
          <p className="text-muted-foreground">Monitor API endpoints and service health in real-time</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        </div>
      </div>

      {/* Overall System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Overall Status"
          value={overallStatus === 'operational' ? 'Operational' : 'Degraded'}
          icon={getStatusIcon(overallStatus === 'operational' ? 'healthy' : 'degraded')}
          status={overallStatus}
        />
        <StatCard
          title="Services Online"
          value={`${operationalServices}/${totalServices}`}
          icon={CheckCircle}
          status="operational"
        />
        <StatCard
          title="Avg Response Time"
          value={`${avgResponseTime}ms`}
          icon={Clock}
          status={avgResponseTime < 300 ? 'operational' : 'degraded'}
        />
        <StatCard
          title="Health Score"
          value={`${healthPercentage}%`}
          icon={Server}
          status={healthPercentage > 70 ? 'operational' : 'degraded'}
        />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="all">All ({totalServices})</TabsTrigger>
          <TabsTrigger value="external">Sports ({categories.sports || 0})</TabsTrigger>
          <TabsTrigger value="gaming">Gaming ({categories.gaming || 0})</TabsTrigger>
          <TabsTrigger value="social">Social ({categories.social || 0})</TabsTrigger>
          <TabsTrigger value="streaming">Streaming ({categories.streaming || 0})</TabsTrigger>
          <TabsTrigger value="fantasy">Fantasy ({categories.fantasy || 0})</TabsTrigger>
          <TabsTrigger value="communication">SMS/Email ({categories.communication || 0})</TabsTrigger>
          <TabsTrigger value="database">Infrastructure ({categories.infrastructure || 0})</TabsTrigger>
        </TabsList>

        {['all', 'external', 'gaming', 'social', 'streaming', 'fantasy', 'communication', 'database'].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {tabValue === 'all' ? 'All API Services' : 
                   tabValue === 'external' ? 'Sports Betting APIs' :
                   tabValue === 'gaming' ? 'Gaming Platform APIs' :
                   tabValue === 'social' ? 'Social Media APIs' :
                   tabValue === 'streaming' ? 'Live Streaming APIs' :
                   tabValue === 'fantasy' ? 'Fantasy Sports APIs' :
                   tabValue === 'communication' ? 'Communication Services' :
                   'Infrastructure Services'}
                </CardTitle>
                <CardDescription>
                  {tabValue === 'all' ? 'Complete overview of all 18+ integrated platform services and their current status' :
                   tabValue === 'external' ? 'Pinnacle Odds, ESPN, The Odds API, GRID, RapidAPI Sports for betting data' :
                   tabValue === 'gaming' ? 'Riot Games, Xbox, Epic Games, Steam APIs for gaming statistics' :
                   tabValue === 'social' ? 'Twitter, Facebook marketing automation and user authentication' :
                   tabValue === 'streaming' ? 'YouTube, Twitch integration for live sports and gaming content' :
                   tabValue === 'fantasy' ? 'ESPN Fantasy and Yahoo Fantasy Sports leagues integration' :
                   tabValue === 'communication' ? 'Twilio SMS and SMTP email notification services' :
                   'Database connections, WebSocket services, and core infrastructure'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">Loading service status...</div>
                  ) : (
                    <>
                      {filterServicesByType(tabValue).length > 0 ? (
                        filterServicesByType(tabValue).map((service) => (
                          <ServiceCard key={service.name} service={service} />
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No {tabValue === 'all' ? 'services' : `${tabValue} services`} configured
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Comprehensive Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Real-time status of all WeParlay platform integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{operationalServices}</p>
              <p className="text-sm text-muted-foreground">Operational</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{degradedServices}</p>
              <p className="text-sm text-muted-foreground">Degraded</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{offlineServices}</p>
              <p className="text-sm text-muted-foreground">Offline</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{apiData?.configuredServices || 0}</p>
              <p className="text-sm text-muted-foreground">Configured</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated Timestamp */}
      <div className="text-center text-sm text-muted-foreground">
        Last refreshed: {apiData?.lastRefresh ? new Date(apiData.lastRefresh).toLocaleString() : 'Never'}
        {apiData?.timestamp && ` • Data timestamp: ${new Date(apiData.timestamp).toLocaleString()}`}
      </div>
    </div>
  );
}