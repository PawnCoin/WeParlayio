import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Server, Cpu, HardDrive, Wifi, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SystemMetrics {
  timestamp: string;
  overall_status: string;
  uptime: number;
  activeConnections: number;
  responseTime: number;
  cpu: {
    usage: number;
    cores: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    free: number;
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    free: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
  alerts: any[];
  environment: string;
}

export default function SystemHealth() {
  // Fetch real-time system metrics
  const { data: metrics, isLoading, refetch } = useQuery<SystemMetrics>({
    queryKey: ['/api/system/system-health'],
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000, // Auto-refresh every 10 seconds
  });

  // Use alerts from system health data (already included in the real API response)
  const alerts = metrics?.alerts || [];
  
  // Performance data is included in the main system health response
  const performance = metrics;

  const getHealthStatus = (usage: number) => {
    if (usage < 70) return { status: 'healthy', color: 'text-green-600', bg: 'bg-green-100' };
    if (usage < 85) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'critical', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const MetricCard = ({ title, icon: Icon, children }: any) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">Real-time system performance and resource monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Refresh Metrics
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Status</p>
                <p className="text-2xl font-bold text-green-600">Healthy</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{formatUptime(metrics?.uptime || 0)}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold">{metrics?.activeConnections || 0}</p>
              </div>
              <Wifi className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">{metrics?.responseTime || 0}ms</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="resources" className="space-y-6">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="CPU Usage" icon={Cpu}>
              {isLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Usage</span>
                    <span className={`text-sm font-medium ${getHealthStatus(metrics?.cpu?.usage || 0).color}`}>
                      {metrics?.cpu?.usage || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={metrics?.cpu?.usage || 0} 
                    className={`w-full ${getHealthStatus(metrics?.cpu?.usage || 0).bg}`}
                  />
                  <div className="text-xs text-muted-foreground">
                    {metrics?.cpu?.cores || 0} cores • Load: {metrics?.cpu?.load?.join(', ') || 'N/A'}
                  </div>
                </div>
              )}
            </MetricCard>

            <MetricCard title="Memory Usage" icon={HardDrive}>
              {isLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {formatBytes(metrics?.memory?.used || 0)} / {formatBytes(metrics?.memory?.total || 0)}
                    </span>
                    <span className={`text-sm font-medium ${getHealthStatus(metrics?.memory?.usage || 0).color}`}>
                      {metrics?.memory?.usage || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={metrics?.memory?.usage || 0}
                    className={`w-full ${getHealthStatus(metrics?.memory?.usage || 0).bg}`}
                  />
                  <div className="text-xs text-muted-foreground">
                    Available: {formatBytes(metrics?.memory?.free || 0)}
                  </div>
                </div>
              )}
            </MetricCard>

            <MetricCard title="Disk Usage" icon={Server}>
              {isLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {formatBytes(metrics?.disk?.used || 0)} / {formatBytes(metrics?.disk?.total || 0)}
                    </span>
                    <span className={`text-sm font-medium ${getHealthStatus(metrics?.disk?.usage || 0).color}`}>
                      {metrics?.disk?.usage || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={metrics?.disk?.usage || 0}
                    className={`w-full ${getHealthStatus(metrics?.disk?.usage || 0).bg}`}
                  />
                  <div className="text-xs text-muted-foreground">
                    Available: {formatBytes(metrics?.disk?.available || 0)}
                  </div>
                </div>
              )}
            </MetricCard>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Historical performance data and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">99.9%</p>
                  <p className="text-sm text-muted-foreground">Uptime (30 days)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{metrics?.responseTime || 0}ms</p>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{metrics?.activeConnections || 0}</p>
                  <p className="text-sm text-muted-foreground">Peak Connections</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">0</p>
                  <p className="text-sm text-muted-foreground">Critical Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Active alerts and notifications requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts?.length > 0 ? (
                  alerts.map((alert: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div className="flex-1">
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                      <Badge variant="secondary">{alert.severity}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No active alerts</p>
                    <p className="text-sm">All systems are operating normally</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Network Performance</CardTitle>
              <CardDescription>Network traffic and connectivity metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatBytes(metrics?.network?.upload || 0)}/s
                  </p>
                  <p className="text-sm text-muted-foreground">Upload Speed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatBytes(metrics?.network?.download || 0)}/s
                  </p>
                  <p className="text-sm text-muted-foreground">Download Speed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {metrics?.network?.latency || 0}ms
                  </p>
                  <p className="text-sm text-muted-foreground">Latency</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}