import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, Database, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SecurityStatus {
  status: 'secure' | 'warning' | 'critical';
  summary: {
    total: number;
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
  lastScanTime: string;
  recommendations: string[];
}

interface PerformanceData {
  api: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    slowestEndpoints: Array<{ endpoint: string; averageTime: number }>;
  };
  database: {
    totalQueries: number;
    averageQueryTime: number;
    slowQueries: number;
    queryTypeBreakdown: Record<string, number>;
  };
}

export default function SecurityDashboard() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'vulnerabilities' | 'performance' | '2fa'>('overview');

  const { data: securityStatus, isLoading: securityLoading } = useQuery({
    queryKey: ['/api/security/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['/api/security/performance'],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: vulnerabilityData, isLoading: vulnLoading } = useQuery({
    queryKey: ['/api/security/dependency-scan'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Security Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Security Status</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            {securityStatus?.security && getStatusIcon(securityStatus.security.status)}
            <span className={`text-2xl font-bold ${securityStatus?.security && getStatusColor(securityStatus.security.status)}`}>
              {securityStatus?.security?.status?.toUpperCase() || 'LOADING'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Last scan: {securityStatus?.security?.lastScanTime 
              ? new Date(securityStatus.security.lastScanTime).toLocaleString()
              : 'Never'
            }
          </p>
        </CardContent>
      </Card>

      {/* Vulnerabilities Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Critical</span>
              <Badge variant="destructive">{securityStatus?.security?.summary?.critical || 0}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">High</span>
              <Badge variant="secondary">{securityStatus?.security?.summary?.high || 0}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total</span>
              <Badge>{securityStatus?.security?.summary?.total || 0}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Avg Response</span>
              <span className="text-sm font-mono">
                {performanceData?.api?.averageResponseTime?.toFixed(0)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Error Rate</span>
              <span className="text-sm font-mono">
                {performanceData?.api?.errorRate?.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Requests/hr</span>
              <span className="text-sm font-mono">
                {performanceData?.api?.totalRequests || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {securityStatus?.security?.recommendations?.map((rec: string, index: number) => (
              <Alert key={index}>
                <AlertDescription>{rec}</AlertDescription>
              </Alert>
            )) || (
              <Alert>
                <AlertDescription>Loading security recommendations...</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVulnerabilities = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dependency Vulnerabilities</CardTitle>
        </CardHeader>
        <CardContent>
          {vulnLoading ? (
            <div className="text-center py-8">Loading vulnerability data...</div>
          ) : vulnerabilityData?.scan?.vulnerabilities?.length > 0 ? (
            <div className="space-y-4">
              {vulnerabilityData.scan.vulnerabilities.map((vuln: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{vuln.title}</h4>
                    <Badge 
                      variant={vuln.severity === 'critical' ? 'destructive' : 
                               vuln.severity === 'high' ? 'secondary' : 'outline'}
                    >
                      {vuln.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{vuln.overview}</p>
                  <div className="text-xs text-muted-foreground">
                    Package: {vuln.package} ({vuln.version})
                  </div>
                  <div className="text-xs text-green-600 mt-2">
                    Recommendation: {vuln.recommendation}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>No vulnerabilities detected</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformance = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* API Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>API Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Response Time</span>
                <span>{performanceData?.api?.averageResponseTime?.toFixed(0)}ms</span>
              </div>
              <Progress 
                value={Math.min((performanceData?.api?.averageResponseTime || 0) / 10, 100)} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Error Rate</span>
                <span>{performanceData?.api?.errorRate?.toFixed(1)}%</span>
              </div>
              <Progress 
                value={performanceData?.api?.errorRate || 0} 
                className="h-2"
              />
            </div>
            <div className="text-sm">
              <strong>Total Requests:</strong> {performanceData?.api?.totalRequests || 0}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Database Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Query Time</span>
                <span>{performanceData?.database?.averageQueryTime?.toFixed(0)}ms</span>
              </div>
              <Progress 
                value={Math.min((performanceData?.database?.averageQueryTime || 0) / 5, 100)} 
                className="h-2"
              />
            </div>
            <div className="text-sm space-y-1">
              <div><strong>Total Queries:</strong> {performanceData?.database?.totalQueries || 0}</div>
              <div><strong>Slow Queries:</strong> {performanceData?.database?.slowQueries || 0}</div>
            </div>
            <div>
              <h5 className="font-semibold text-sm mb-2">Query Types</h5>
              <div className="space-y-1">
                {Object.entries(performanceData?.database?.queryTypeBreakdown || {}).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-xs">
                    <span>{type}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const render2FA = () => (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            2FA is available for high-security actions. Users can enable 2FA in their profile settings.
          </AlertDescription>
        </Alert>
        <div className="mt-4 space-y-2">
          <p className="text-sm"><strong>Supported Methods:</strong></p>
          <ul className="text-sm space-y-1 ml-4">
            <li>• TOTP (Google Authenticator, Authy)</li>
            <li>• Backup codes</li>
            <li>• SMS fallback</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: AlertTriangle },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: '2fa', label: '2FA Settings', icon: Shield },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Security Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor security status, vulnerabilities, and performance metrics
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={selectedTab === tab.id ? "default" : "ghost"}
            onClick={() => setSelectedTab(tab.id as any)}
            className="flex items-center space-x-2"
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && renderOverview()}
      {selectedTab === 'vulnerabilities' && renderVulnerabilities()}
      {selectedTab === 'performance' && renderPerformance()}
      {selectedTab === '2fa' && render2FA()}
    </div>
  );
}