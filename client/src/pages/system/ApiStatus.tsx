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
  url: string;
  status: 'healthy' | 'unhealthy' | 'degraded' | 'maintenance';
  responseTime: number;
  lastChecked: string;
  uptime: number;
  description: string;
  type: 'internal' | 'external' | 'database' | 'payment';
  healthy: boolean;
}

interface ApiStatusResponse {
  totalEndpoints: number;
  healthyEndpoints: number;
  overallStatus: string;
  apiData: ApiService[];
  avgResponseTime: number;
  systemUptime: number;
  lastUpdated: string;
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
      case 'healthy': return 'default';
      case 'unhealthy': return 'destructive';
      case 'degraded': return 'secondary';
      case 'maintenance': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'unhealthy': return XCircle;
      case 'degraded': return AlertTriangle;
      case 'maintenance': return Clock;
      default: return AlertTriangle;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'internal': return Server;
      case 'external': return Globe;
      case 'database': return Database;
      case 'payment': return Wifi;
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

  // Mock services for development - in production this would come from backend
  const mockServices: ApiService[] = [
    {
      name: 'ESPN Sports API',
      url: '/api/sports/espn',
      status: 'healthy',
      responseTime: 120,
      lastChecked: new Date().toISOString(),
      uptime: 99.9,
      description: 'Primary sports data provider',
      type: 'external',
      healthy: true
    },
    {
      name: 'The Odds API',
      url: '/api/odds',
      status: 'degraded',
      responseTime: 450,
      lastChecked: new Date().toISOString(),
      uptime: 95.2,
      description: 'Live betting odds provider',
      type: 'external',
      healthy: false
    },
    {
      name: 'Database Connection',
      url: '/api/db/health',
      status: 'healthy',
      responseTime: 25,
      lastChecked: new Date().toISOString(),
      uptime: 99.99,
      description: 'PostgreSQL database connection',
      type: 'database',
      healthy: true
    },
    {
      name: 'User Authentication',
      url: '/api/auth',
      status: 'healthy',
      responseTime: 85,
      lastChecked: new Date().toISOString(),
      uptime: 99.8,
      description: 'Replit authentication service',
      type: 'internal',
      healthy: true
    }
  ];

  // Use real data if available, fallback to mock for development
  const services = apiData?.apiData || mockServices;
  const totalServices = apiData?.totalEndpoints || services.length;
  const healthyServices = apiData?.healthyEndpoints || services.filter(s => s.healthy).length;
  const overallStatus = apiData?.overallStatus || (healthyServices === totalServices ? 'operational' : 'degraded');
  const avgResponseTime = apiData?.avgResponseTime || Math.round(services.reduce((sum, s) => sum + s.responseTime, 0) / services.length);

  const filterServicesByType = (type: string) => {
    if (type === 'all') return services;
    return services.filter(service => service.type === type);
  };

  const ServiceCard = ({ service }: { service: ApiService }) => {
    const mappedStatus = service.healthy ? 'healthy' : 'unhealthy';
    const StatusIcon = getStatusIcon(mappedStatus);
    const TypeIcon = getTypeIcon(service.type);

    return (
      <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${
              mappedStatus === 'healthy' ? 'text-green-500' :
              mappedStatus === 'unhealthy' ? 'text-red-500' :
              'text-yellow-500'
            }`} />
            <TypeIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{service.name}</h3>
              <Badge variant={getStatusColor(mappedStatus) as any}>
                {mappedStatus}
              </Badge>
              <Badge variant="outline">{service.type}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{service.description}</p>
            <p className="text-xs text-muted-foreground">Uptime: {service.uptime}%</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-4">
            <div>
              <p className={`text-sm font-medium ${getResponseTimeColor(service.responseTime)}`}>
                {service.responseTime}ms
              </p>
              <p className="text-xs text-muted-foreground">
                {service.uptime}% uptime
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Last checked
              </p>
              <p className="text-xs">
                {new Date(service.lastChecked).toLocaleTimeString()}
              </p>
            </div>
          </div>
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
          value={`${healthyServices}/${totalServices}`}
          icon={CheckCircle}
          status="healthy"
        />
        <StatCard
          title="Avg Response Time"
          value={`${avgResponseTime}ms`}
          icon={Clock}
          status={avgResponseTime < 300 ? 'healthy' : 'degraded'}
        />
        <StatCard
          title="System Uptime"
          value="99.9%"
          icon={Server}
          status="healthy"
        />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="external">External APIs</TabsTrigger>
          <TabsTrigger value="internal">Internal Services</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="payment">Payment Services</TabsTrigger>
        </TabsList>

        {['all', 'external', 'internal', 'database', 'payment'].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {tabValue === 'all' ? 'All API Services' : 
                   tabValue === 'external' ? 'External API Services' :
                   tabValue === 'internal' ? 'Internal Services' :
                   tabValue === 'database' ? 'Database Services' :
                   'Payment Services'}
                </CardTitle>
                <CardDescription>
                  {tabValue === 'all' ? 'Complete overview of all system services and their current status' :
                   tabValue === 'external' ? 'Third-party APIs and external service integrations' :
                   tabValue === 'internal' ? 'WeParlay internal microservices and APIs' :
                   tabValue === 'database' ? 'Database connections and storage services' :
                   'Payment processors and financial service integrations'}
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

      {/* Last Updated Timestamp */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleString()}
        {apiData?.lastUpdated && ` • Data from: ${new Date(apiData.lastUpdated).toLocaleString()}`}
      </div>
    </div>
  );
}