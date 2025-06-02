import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface APITestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  data?: any;
  error?: string;
  count?: number;
}

export default function RapidAPITest() {
  const [tests, setTests] = useState<APITestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const rapidApiEndpoints = [
    { endpoint: '/api/rapidapi/test-subscriptions', label: 'All RapidAPI Subscriptions' },
    { endpoint: '/api/rapidapi/basketball', label: 'API-Basketball (NBA)' },
    { endpoint: '/api/rapidapi/espn/basketball/nba', label: 'ESPN Basketball via RapidAPI' },
    { endpoint: '/api/rapidapi/espn/esports/lol', label: 'League of Legends Esports' },
    { endpoint: '/api/rapidapi/espn/esports/valorant', label: 'Valorant Esports' },
    { endpoint: '/api/rapidapi/unified-feed', label: 'Unified RapidAPI Feed' },
  ];

  const testEndpoint = async (endpoint: string): Promise<APITestResult> => {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok) {
        return {
          endpoint,
          status: 'success',
          data,
          count: Array.isArray(data.data) ? data.data.length : (Array.isArray(data) ? data.length : undefined)
        };
      } else {
        return {
          endpoint,
          status: 'error',
          error: data.message || `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        endpoint,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);

    for (const { endpoint } of rapidApiEndpoints) {
      setTests(prev => [...prev, { endpoint, status: 'pending' }]);
      
      const result = await testEndpoint(endpoint);
      
      setTests(prev => 
        prev.map(test => 
          test.endpoint === endpoint ? result : test
        )
      );
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Testing...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">RapidAPI Integration Test</h1>
          <p className="text-gray-600">
            Test all your RapidAPI subscriptions and ESPN integrations to verify they're working properly.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              RapidAPI Subscription Tests
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Run All Tests'
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rapidApiEndpoints.map(({ endpoint, label }) => {
                const test = tests.find(t => t.endpoint === endpoint);
                
                return (
                  <div key={endpoint} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test?.status || 'ready')}
                        <div>
                          <h3 className="font-medium">{label}</h3>
                          <code className="text-sm text-gray-500">{endpoint}</code>
                        </div>
                      </div>
                      {getStatusBadge(test?.status || 'ready')}
                    </div>
                    
                    {test?.status === 'success' && test.data && (
                      <div className="mt-3 p-3 bg-green-50 rounded border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-800 font-medium">
                            ✓ API Connection Successful
                          </span>
                          {test.count !== undefined && (
                            <span className="text-green-600">
                              {test.count} items retrieved
                            </span>
                          )}
                        </div>
                        {test.data.success !== undefined && (
                          <div className="mt-2 text-xs text-green-700">
                            Status: {test.data.success ? 'Success' : 'Failed'}
                            {test.data.sources && (
                              <span className="ml-2">
                                Sources: {test.data.sources.join(', ')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {test?.status === 'error' && (
                      <div className="mt-3 p-3 bg-red-50 rounded border">
                        <div className="text-sm text-red-800 font-medium">
                          ✗ Connection Failed
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                          {test.error}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {tests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {tests.filter(t => t.status === 'success').length}
                  </div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {tests.filter(t => t.status === 'error').length}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {tests.filter(t => t.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}