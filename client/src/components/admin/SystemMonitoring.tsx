import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Server, Database, Shield, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  database: {
    connected: boolean;
    responseTime: number;
  };
  apis: {
    healthy: number;
    total: number;
    failing: string[];
  };
}

export default function SystemMonitoring() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const { data: systemHealth, isLoading, refetch } = useQuery({
    queryKey: ['/api/system/health'],
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10 seconds if auto-refresh is on
  });

  const { data: securityStatus } = useQuery({
    queryKey: ['/api/security/status'],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastRefresh(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    refetch();
    setLastRefresh(Date.now());
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading system status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time system health and performance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {Math.floor((Date.now() - lastRefresh) / 1000)}s ago
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleManualRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Overall Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {systemHealth && getStatusIcon(systemHealth.status)}
              <span className={`text-2xl font-bold ${systemHealth && getStatusColor(systemHealth.status)}`}>
                {systemHealth?.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Uptime: {systemHealth?.uptime ? formatUptime(systemHealth.uptime) : 'Unknown'}
            </p>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.memory?.percentage?.toFixed(1) || 0}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${systemHealth?.memory?.percentage || 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {systemHealth?.memory ? formatBytes(systemHealth.memory.used) : '0 MB'} / {systemHealth?.memory ? formatBytes(systemHealth.memory.total) : '0 MB'}
            </p>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {systemHealth?.database?.connected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <span className="text-2xl font-bold">
                {systemHealth?.database?.connected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Response: {systemHealth?.database?.responseTime || 0}ms
            </p>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {securityStatus?.security && getStatusIcon(securityStatus.security.status)}
              <span className={`text-2xl font-bold ${securityStatus?.security && getStatusColor(securityStatus.security.status)}`}>
                {securityStatus?.security?.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {securityStatus?.security?.summary?.total || 0} vulnerabilities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>API Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Healthy APIs</span>
                <Badge variant="outline">
                  {systemHealth?.apis?.healthy || 0} / {systemHealth?.apis?.total || 0}
                </Badge>
              </div>
              
              {systemHealth?.apis?.failing && systemHealth.apis.failing.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Failing APIs:</h4>
                  <div className="space-y-1">
                    {systemHealth.apis.failing.map((api, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{api}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {(!systemHealth?.apis?.failing || systemHealth.apis.failing.length === 0) && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>All APIs are operational</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>System Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemHealth?.memory?.percentage && systemHealth.memory.percentage > 80 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>High memory usage detected ({systemHealth.memory.percentage.toFixed(1)}%)</AlertDescription>
                </Alert>
              )}

              {systemHealth?.cpu?.usage && systemHealth.cpu.usage > 80 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>High CPU usage detected ({systemHealth.cpu.usage.toFixed(1)}%)</AlertDescription>
                </Alert>
              )}

              {!systemHealth?.database?.connected && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Database connection lost</AlertDescription>
                </Alert>
              )}

              {systemHealth?.database?.responseTime && systemHealth.database.responseTime > 1000 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Slow database response time ({systemHealth.database.responseTime}ms)</AlertDescription>
                </Alert>
              )}

              {securityStatus?.security?.summary?.critical && securityStatus.security.summary.critical > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Critical security vulnerabilities detected</AlertDescription>
                </Alert>
              )}

              {/* No alerts case */}
              {(!systemHealth?.memory?.percentage || systemHealth.memory.percentage <= 80) &&
               (!systemHealth?.cpu?.usage || systemHealth.cpu.usage <= 80) &&
               systemHealth?.database?.connected &&
               (!systemHealth?.database?.responseTime || systemHealth.database.responseTime <= 1000) &&
               (!securityStatus?.security?.summary?.critical || securityStatus.security.summary.critical === 0) && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>No system alerts - all systems operating normally</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}