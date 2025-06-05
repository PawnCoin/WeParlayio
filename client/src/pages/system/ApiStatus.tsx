import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Clock, Wifi, Server, Database, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ApiService {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  responseTime: number;
  lastChecked: string;
  uptime: number;
  description: string;
  type: 'internal' | 'external' | 'database' | 'payment';
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
  const { data: apiData, isLoading, refetch } = useQuery<{
    services: any[];
    overallStatus: string;
    operationalServices: number;
    totalServices: number;
    avgResponseTime: number;
    systemUptime: number;
  }>({
    queryKey: ['/api/system/api-status'],
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });

  // Fetch overall system health from the same endpoint
  const systemHealth = apiData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'offline': return 'destructive';
      case 'degraded': return 'secondary';
      case 'maintenance': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return CheckCircle;
      case 'offline': return XCircle;
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
            status === 'online' ? 'text-green-500' : 
            status === 'offline' ? 'text-red-500' : 
            'text-yellow-500'
          }`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Status</h1>
          <p className="text-muted-foreground">Monitor API endpoints and service health</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Refresh Status
          </Button>
        </div>
      </div>

      {/* Overall System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Overall Status"
          value={apiData?.overallStatus || 'Unknown'}
          icon={getStatusIcon(apiData?.overallStatus)}
          status={apiData?.overallStatus === 'operational' ? 'online' : 'offline'}
        />
        <StatCard
          title="Services Online"
          value={`${apiServices?.operationalServices || 0}/${apiServices?.totalServices || 0}`}
          icon={CheckCircle}
          status="online"
        />
        <StatCard
          title="Avg Response Time"
          value={`${services?.avgResponseTime || 0}ms`}
          icon={Clock}
          status="online"
        />
        <StatCard
          title="Total Services"
          value={services?.services?.length || 0}
          icon={Server}
          status="online"
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

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All API Services</CardTitle>
              <CardDescription>Complete overview of all system services and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">Loading service status...</div>
                ) : services?.services?.length > 0 ? (
                  apiServices?.apiServices?.map((service: any) => {
                    const mappedStatus = apiServices?.status === 'healthy' ? 'online' : apiServices?.status === 'degraded' ? 'degraded' : 'offline';
                    const StatusIcon = getStatusIcon(mappedStatus);
                    const serviceType = 'external'; // Map all services as external for now
                    return (
                      <div key={apiServices?.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`h-5 w-5 ${
                              mappedStatus === 'online' ? 'text-green-500' :
                              mappedStatus === 'offline' ? 'text-red-500' :
                              'text-yellow-500'
                            }`} />
                            <Globe className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{apiServices?.name}</h3>
                              <Badge variant={getStatusColor(mappedStatus) as any}>
                                {mappedStatus}
                              </Badge>
                              <Badge variant="outline">external</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Response time: {apiServices?.responseTime}ms</p>
                            <p className="text-xs text-muted-foreground">Uptime: {apiServices?.uptime}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className={`text-sm font-medium ${getResponseTimeColor(apiServices?.responseTime)}`}>
                                {apiServices?.responseTime}ms
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {apiServices?.uptime}% uptime
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Last checked
                              </p>
                              <p className="text-xs">
                                {new Date(apiServices?.lastChecked).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No services configured
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="external" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>External API Services</CardTitle>
              <CardDescription>Third-party APIs and external service integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services?.services?.map((service: any) => {
                  const mappedStatus = apiServices?.status === 'healthy' ? 'online' : apiServices?.status === 'degraded' ? 'degraded' : 'offline';
                  const StatusIcon = getStatusIcon(mappedStatus);
                  return (
                    <div key={apiServices?.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <StatusIcon className={`h-6 w-6 ${
                          mappedStatus === 'online' ? 'text-green-500' : 'text-red-500'
                        }`} />
                        <div>
                          <h3 className="font-medium">{apiServices?.name}</h3>
                          <p className="text-sm text-muted-foreground">Response: {apiServices?.responseTime}ms | Uptime: {apiServices?.uptime}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(mappedStatus) as any}>
                          {mappedStatus}
                        </Badge>
                        <span className={`text-sm ${getResponseTimeColor(apiServices?.responseTime)}`}>
                          {apiServices?.responseTime}ms
                        </span>
                      </div>
                    </div>
                  );
                }) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No external services configured
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="internal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Internal Services</CardTitle>
              <CardDescription>WeParlay internal microservices and APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services?.services?.map((service: any) => {
                  const StatusIcon = getStatusIcon(apiServices?.status);
                  return (
                    <div key={apiServices?.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <StatusIcon className={`h-6 w-6 ${
                          apiServices?.status === 'online' ? 'text-green-500' : 'text-red-500'
                        }`} />
                        <div>
                          <h3 className="font-medium">{apiServices?.name}</h3>
                          <p className="text-sm text-muted-foreground">{apiServices?.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(apiServices?.status) as any}>
                          {apiServices?.status}
                        </Badge>
                        <span className={`text-sm ${getResponseTimeColor(apiServices?.responseTime)}`}>
                          {apiServices?.responseTime}ms
                        </span>
                      </div>
                    </div>
                  );
                }) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No internal services configured
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Services</CardTitle>
              <CardDescription>Database connections and storage services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services?.services?.map((service: any) => {
                  const StatusIcon = getStatusIcon(apiServices?.status);
                  return (
                    <div key={apiServices?.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <StatusIcon className={`h-6 w-6 ${
                          apiServices?.status === 'online' ? 'text-green-500' : 'text-red-500'
                        }`} />
                        <div>
                          <h3 className="font-medium">{apiServices?.name}</h3>
                          <p className="text-sm text-muted-foreground">{apiServices?.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(apiServices?.status) as any}>
                          {apiServices?.status}
                        </Badge>
                        <span className={`text-sm ${getResponseTimeColor(apiServices?.responseTime)}`}>
                          {apiServices?.responseTime}ms
                        </span>
                      </div>
                    </div>
                  );
                }) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No database services configured
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Services</CardTitle>
              <CardDescription>Payment processors and financial service integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services?.services?.map((service: any) => {
                  const StatusIcon = getStatusIcon(apiServices?.status);
                  return (
                    <div key={apiServices?.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <StatusIcon className={`h-6 w-6 ${
                          apiServices?.status === 'online' ? 'text-green-500' : 'text-red-500'
                        }`} />
                        <div>
                          <h3 className="font-medium">{apiServices?.name}</h3>
                          <p className="text-sm text-muted-foreground">{apiServices?.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(apiServices?.status) as any}>
                          {apiServices?.status}
                        </Badge>
                        <span className={`text-sm ${getResponseTimeColor(apiServices?.responseTime)}`}>
                          {apiServices?.responseTime}ms
                        </span>
                      </div>
                    </div>
                  );
                }) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No payment services configured
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}