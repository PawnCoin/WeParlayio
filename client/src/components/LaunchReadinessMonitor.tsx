import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Clock, Activity } from 'lucide-react';

interface SystemHealth {
  overall: string;
  services: {
    api: { status: string; uptime: string };
    database: { status: string; responseTime: string };
    payments: { status: string; successRate: string };
    sportsData: { status: string; lastUpdate: Date };
  };
}

const LaunchReadinessMonitor: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [satisfactionScore, setSatisfactionScore] = useState(4.7);
  const [criticalIssues, setCriticalIssues] = useState(0);

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const response = await fetch('/api/system-status');
        if (response.ok) {
          const health = await response.json();
          setSystemHealth(health);
        }
      } catch (error) {
        console.warn('Unable to fetch system status');
      }
    };

    const checkSatisfactionMetrics = async () => {
      try {
        const response = await fetch('/api/satisfaction-metrics');
        if (response.ok) {
          const metrics = await response.json();
          setSatisfactionScore(metrics.averageRating);
          setCriticalIssues(metrics.urgencyDistribution?.high || 0);
        }
      } catch (error) {
        console.warn('Unable to fetch satisfaction metrics');
      }
    };

    // Initial check
    checkSystemHealth();
    checkSatisfactionMetrics();

    // Check every 30 seconds
    const interval = setInterval(() => {
      checkSystemHealth();
      checkSatisfactionMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const isLaunchReady = () => {
    return systemHealth?.overall === 'operational' && 
           satisfactionScore >= 4.5 && 
           criticalIssues === 0;
  };

  if (!systemHealth) return null;

  return (
    <div className="fixed top-4 left-4 z-40 w-72">
      <Card className="shadow-lg border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4" />
            Launch Readiness Monitor
            {isLaunchReady() ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3 text-xs">
          {/* Overall Status */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Platform Status:</span>
            <Badge className={`${getStatusColor(systemHealth.overall)} text-white`}>
              {systemHealth.overall.toUpperCase()}
            </Badge>
          </div>

          {/* Satisfaction Score */}
          <div className="flex items-center justify-between">
            <span className="font-medium">User Satisfaction:</span>
            <Badge variant={satisfactionScore >= 4.5 ? 'default' : 'destructive'}>
              {satisfactionScore.toFixed(1)}/5.0
            </Badge>
          </div>

          {/* Critical Issues */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Critical Issues:</span>
            <Badge variant={criticalIssues === 0 ? 'default' : 'destructive'}>
              {criticalIssues}
            </Badge>
          </div>

          {/* Service Status */}
          <div className="space-y-1">
            <div className="font-medium">Services:</div>
            {Object.entries(systemHealth.services).map(([service, data]) => (
              <div key={service} className="flex items-center justify-between pl-2">
                <span className="capitalize">{service}:</span>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(data.status)}`} />
              </div>
            ))}
          </div>

          {/* Launch Readiness Indicator */}
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2">
              {isLaunchReady() ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 font-medium">Ready for Launch</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-600 font-medium">Pre-Launch Checks</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LaunchReadinessMonitor;