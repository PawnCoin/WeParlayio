import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CrashMetrics {
  totalCrashes: number;
  lastCrashTime: string | null;
  recoveryAttempts: number;
  uptime: number;
}

interface HealthStatus {
  database: boolean;
  sports_api: boolean;
  memory: boolean;
  error_rate: boolean;
}

interface CrashRecoveryStatus {
  success: boolean;
  metrics: CrashMetrics;
  healthStatus: HealthStatus;
  timestamp: string;
}

export default function CrashRecoveryMonitor() {
  const [status, setStatus] = useState<CrashRecoveryStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/system/crash-recovery/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch crash recovery status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch crash recovery status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const restartSystem = async () => {
    setRestarting(true);
    try {
      const response = await fetch('/api/system/crash-recovery/restart', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Crash recovery system restarted successfully",
        });
        await fetchStatus();
      }
    } catch (error) {
      console.error('Failed to restart crash recovery:', error);
      toast({
        title: "Error",
        description: "Failed to restart crash recovery system",
        variant: "destructive",
      });
    } finally {
      setRestarting(false);
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getHealthBadge = (healthy: boolean, label: string) => (
    <Badge 
      variant={healthy ? "secondary" : "destructive"}
      className={`flex items-center gap-1 ${healthy ? 'bg-green-100 text-green-800' : ''}`}
    >
      {healthy ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {label}
    </Badge>
  );

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Crash Recovery System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Crash Recovery System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600">
            Failed to load crash recovery status
          </div>
        </CardContent>
      </Card>
    );
  }

  const allHealthy = Object.values(status.healthStatus).every(Boolean);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Crash Recovery System
          </div>
          <Badge variant={allHealthy ? "secondary" : "destructive"} className={allHealthy ? 'bg-green-100 text-green-800' : ''}>
            {allHealthy ? 'Healthy' : 'Issues Detected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{status.metrics.totalCrashes}</div>
            <div className="text-sm text-gray-600">Total Crashes</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{status.metrics.recoveryAttempts}</div>
            <div className="text-sm text-gray-600">Recovery Attempts</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
              <Clock className="w-5 h-5" />
              {formatUptime(status.metrics.uptime)}
            </div>
            <div className="text-sm text-gray-600">System Uptime</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Last Crash</div>
            <div className="text-sm font-medium">
              {status.metrics.lastCrashTime 
                ? new Date(status.metrics.lastCrashTime).toLocaleString()
                : 'Never'
              }
            </div>
          </div>
        </div>

        {/* Health Status */}
        <div>
          <h3 className="text-lg font-medium mb-3">Component Health Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {getHealthBadge(status.healthStatus.database, 'Database')}
            {getHealthBadge(status.healthStatus.sports_api, 'Sports API')}
            {getHealthBadge(status.healthStatus.memory, 'Memory')}
            {getHealthBadge(status.healthStatus.error_rate, 'Error Rate')}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button 
            onClick={fetchStatus} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
          <Button 
            onClick={restartSystem} 
            variant="outline" 
            size="sm"
            disabled={restarting}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${restarting ? 'animate-spin' : ''}`} />
            Restart System
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          Last updated: {new Date(status.timestamp).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}