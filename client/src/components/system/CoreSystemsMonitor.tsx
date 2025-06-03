import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Database, 
  Wallet, 
  CreditCard, 
  Radio, 
  Users, 
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity
} from "lucide-react";

interface SystemStatus {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'unknown';
  responseTime?: number;
  lastCheck: string;
  icon: React.ReactNode;
  critical: boolean;
}

const CoreSystemsMonitor: React.FC = () => {
  const { data: systemHealth } = useQuery({
    queryKey: ['/api/system/system-health'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  const { data: walletStatus } = useQuery({
    queryKey: ['/api/wallet/status'],
    refetchInterval: 30000,
  });

  const coreSystemsStatus: SystemStatus[] = [
    {
      id: 'apis',
      name: 'Sports APIs',
      status: systemHealth?.sportsApiStatus || 'unknown',
      responseTime: systemHealth?.apiResponseTime,
      lastCheck: new Date().toISOString(),
      icon: <Database className="h-5 w-5" />,
      critical: true
    },
    {
      id: 'banking',
      name: 'Banking System',
      status: systemHealth?.bankingStatus || 'unknown',
      responseTime: systemHealth?.bankingResponseTime,
      lastCheck: new Date().toISOString(),
      icon: <CreditCard className="h-5 w-5" />,
      critical: true
    },
    {
      id: 'crypto',
      name: 'Crypto Wallet',
      status: walletStatus?.operational ? 'operational' : 'down',
      responseTime: walletStatus?.responseTime,
      lastCheck: new Date().toISOString(),
      icon: <Wallet className="h-5 w-5" />,
      critical: true
    },
    {
      id: 'streaming',
      name: 'Live Sports Streaming',
      status: systemHealth?.streamingStatus || 'unknown',
      responseTime: systemHealth?.streamingResponseTime,
      lastCheck: new Date().toISOString(),
      icon: <Radio className="h-5 w-5" />,
      critical: true
    },
    {
      id: 'social',
      name: 'Social Features',
      status: systemHealth?.socialStatus || 'unknown',
      responseTime: systemHealth?.socialResponseTime,
      lastCheck: new Date().toISOString(),
      icon: <Users className="h-5 w-5" />,
      critical: true
    },
    {
      id: 'sms',
      name: 'SMS Service',
      status: systemHealth?.smsStatus || 'unknown',
      responseTime: systemHealth?.smsResponseTime,
      lastCheck: new Date().toISOString(),
      icon: <MessageSquare className="h-5 w-5" />,
      critical: true
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Operational</Badge>;
      case 'degraded':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Degraded</Badge>;
      case 'down':
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const criticalSystemsDown = coreSystemsStatus.filter(
    system => system.critical && system.status === 'down'
  ).length;

  const allSystemsOperational = coreSystemsStatus.every(
    system => system.status === 'operational'
  );

  return (
    <div className="space-y-6">
      {/* Overall Status Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-6 w-6" />
            <span>WeParlay Core Systems Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {allSystemsOperational ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-lg font-semibold text-green-600">All Systems Operational</span>
                </div>
              ) : criticalSystemsDown > 0 ? (
                <div className="flex items-center space-x-2">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <span className="text-lg font-semibold text-red-600">
                    {criticalSystemsDown} Critical System{criticalSystemsDown > 1 ? 's' : ''} Down
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  <span className="text-lg font-semibold text-yellow-600">Some Issues Detected</span>
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coreSystemsStatus.map((system) => (
          <Card key={system.id} className={system.critical && system.status === 'down' ? 'border-red-500' : ''}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center space-x-2">
                  {system.icon}
                  <span>{system.name}</span>
                </div>
                {system.critical && (
                  <Badge variant="outline" className="text-xs">Critical</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(system.status)}
                    <span className="font-medium">Status</span>
                  </div>
                  {getStatusBadge(system.status)}
                </div>
                
                {system.responseTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Response Time</span>
                    <span className="text-sm font-mono">{system.responseTime}ms</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Check</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(system.lastCheck).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical Systems Alert */}
      {criticalSystemsDown > 0 && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Critical Systems Alert</h3>
                <p className="text-red-700">
                  {criticalSystemsDown} critical system{criticalSystemsDown > 1 ? 's are' : ' is'} currently down. 
                  These systems are essential for WeParlay to operate at professional betting site standards.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoreSystemsMonitor;