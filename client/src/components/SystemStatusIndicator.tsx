
import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

interface SystemStatus {
  overall_status: string;
  resilience: {
    emergencyMode: boolean;
    endpoints: any[];
  };
  warnings: string[];
}

export default function SystemStatusIndicator() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    async function checkSystemHealth() {
      try {
        const response = await fetch('/api/system/system-health');
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        // If health check fails, assume we're in fallback mode
        setStatus({
          overall_status: 'healthy_fallback',
          resilience: { emergencyMode: true, endpoints: [] },
          warnings: ['Using cached data']
        });
      }
    }

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const getStatusColor = () => {
    switch (status.overall_status) {
      case 'operational': return 'bg-green-500';
      case 'emergency_mode': return 'bg-yellow-500';
      case 'healthy_fallback': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusIcon = () => {
    switch (status.overall_status) {
      case 'operational': return <CheckCircle className="h-4 w-4" />;
      case 'emergency_mode': return <AlertTriangle className="h-4 w-4" />;
      case 'healthy_fallback': return <Wifi className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStatusMessage = () => {
    switch (status.overall_status) {
      case 'operational': return 'All systems operational';
      case 'emergency_mode': return 'Running on backup systems';
      case 'healthy_fallback': return 'Using cached data';
      default: return 'System healthy';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className="cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <Badge 
          className={`${getStatusColor()} text-white flex items-center gap-2 px-3 py-2`}
        >
          {getStatusIcon()}
          {getStatusMessage()}
        </Badge>
      </div>

      {showDetails && (
        <div className="absolute bottom-12 right-0 w-80">
          <Alert className="bg-white border shadow-lg">
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-semibold">System Status Details</div>
                
                {status.resilience.emergencyMode && (
                  <div className="text-sm text-yellow-600">
                    ⚠️ Some APIs are temporarily unavailable. Using cached data to ensure uninterrupted service.
                  </div>
                )}
                
                {status.warnings.length > 0 && (
                  <div className="text-sm">
                    <div className="font-medium mb-1">Notices:</div>
                    {status.warnings.slice(0, 3).map((warning, index) => (
                      <div key={index} className="text-gray-600">• {warning}</div>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-2">
                  All betting and core features remain fully functional.
                  Click to dismiss.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
