import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ExternalLink } from 'lucide-react';

const ESPNFantasyDisplay: React.FC = () => {
  // Check ESPN Fantasy connection status
  const { data: espnStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/espn/fantasy/status'],
    retry: false,
  });

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
            ESPN
          </div>
          <div>
            <h1 className="text-2xl font-bold">ESPN Fantasy Football</h1>
            <p className="text-gray-600">
              {espnStatus?.connected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>
        <Badge variant={espnStatus?.connected ? "default" : "secondary"}>
          {espnStatus?.connected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>

      {/* Connection Status */}
      {!espnStatus?.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              ESPN Fantasy Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {espnStatus?.error || 'ESPN Fantasy API not available'}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                ESPN Fantasy integration requires a working API endpoint. The current configuration shows:
              </p>
              
              <ul className="text-sm space-y-2 pl-4">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>ESPN Fantasy API: {espnStatus?.apiUrl ? '✓ Available' : '✗ Not responding'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>API Endpoint: {espnStatus?.apiUrl || 'Not configured'}</span>
                </li>
              </ul>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">To enable ESPN Fantasy:</h4>
                <ol className="text-sm text-blue-800 space-y-1 pl-4">
                  <li>1. Verify RapidAPI subscription includes ESPN Fantasy data</li>
                  <li>2. Check if alternative ESPN Fantasy API endpoints are available</li>
                  <li>3. Consider using ESPN's public API if available</li>
                </ol>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => window.open('https://rapidapi.com/search/espn%20fantasy', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Browse ESPN Fantasy APIs on RapidAPI
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected State (when working) */}
      {espnStatus?.connected && (
        <Card>
          <CardHeader>
            <CardTitle>ESPN Fantasy Leagues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              ESPN Fantasy data would appear here when API is properly configured
            </p>
          </CardContent>
        </Card>
      )}

      {/* Alternative Options */}
      <Card>
        <CardHeader>
          <CardTitle>Alternative Fantasy Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            While ESPN Fantasy setup is being configured, you can use:
          </p>
          
          <div className="grid gap-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Yahoo Fantasy Football</h4>
                  <p className="text-sm text-gray-600">Full OAuth integration available</p>
                </div>
                <Badge variant="default" className="bg-purple-600">
                  Available
                </Badge>
              </div>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Manual Team Import</h4>
                  <p className="text-sm text-gray-600">Import your ESPN team manually</p>
                </div>
                <Badge variant="secondary">
                  Coming Soon
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ESPNFantasyDisplay;