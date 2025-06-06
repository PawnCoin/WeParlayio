import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, Activity } from 'lucide-react';

interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  data?: any;
  error?: string;
  responseTime?: number;
}

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<Record<string, ApiTestResult>>({});
  const [isRunning, setIsRunning] = useState(false);

  const endpoints = [
    { key: 'tennis', name: 'Tennis Matches', endpoint: '/api/rapidapi/tennis' },
    { key: 'golf', name: 'Golf Tournaments', endpoint: '/api/rapidapi/golf' },
    { key: 'basketball', name: 'Basketball Games', endpoint: '/api/rapidapi/basketball' },
    { key: 'football', name: 'Football Fixtures', endpoint: '/api/rapidapi/football' },
    { key: 'baseball', name: 'Baseball Games', endpoint: '/api/rapidapi/baseball' },
    { key: 'hockey', name: 'Hockey Games', endpoint: '/api/rapidapi/hockey' },
    { key: 'comprehensive', name: 'All Sports Data', endpoint: '/api/rapidapi/comprehensive' },
    { key: 'status', name: 'API Status', endpoint: '/api/rapidapi/status' }
  ];

  const testEndpoint = async (endpoint: { key: string; endpoint: string }) => {
    const startTime = Date.now();
    
    setTestResults(prev => ({
      ...prev,
      [endpoint.key]: { endpoint: endpoint.endpoint, status: 'loading' }
    }));

    try {
      const response = await fetch(endpoint.endpoint);
      const data = await response.json();
      const responseTime = Date.now() - startTime;

      setTestResults(prev => ({
        ...prev,
        [endpoint.key]: {
          endpoint: endpoint.endpoint,
          status: response.ok ? 'success' : 'error',
          data,
          responseTime,
          error: response.ok ? undefined : data.error || 'Unknown error'
        }
      }));
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setTestResults(prev => ({
        ...prev,
        [endpoint.key]: {
          endpoint: endpoint.endpoint,
          status: 'error',
          error: error instanceof Error ? error.message : 'Network error',
          responseTime
        }
      }));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});

    for (const endpoint of endpoints) {
      await testEndpoint(endpoint);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'loading':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RapidAPI Integration Testing</h1>
          <p className="text-muted-foreground mt-2">
            Test comprehensive sports data integration endpoints
          </p>
        </div>
        <Button onClick={runAllTests} disabled={isRunning} className="min-w-[120px]">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Run All Tests'
          )}
        </Button>
      </div>

      <div className="grid gap-4">
        {endpoints.map(endpoint => {
          const result = testResults[endpoint.key];
          return (
            <Card key={endpoint.key} className="border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result?.status || 'idle')}
                    <div>
                      <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                      <CardDescription className="font-mono text-sm">
                        {endpoint.endpoint}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result?.responseTime && (
                      <Badge variant="outline">
                        {result.responseTime}ms
                      </Badge>
                    )}
                    {result?.status && (
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testEndpoint(endpoint)}
                      disabled={result?.status === 'loading'}
                    >
                      {result?.status === 'loading' ? 'Testing...' : 'Test'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {result && (
                <CardContent>
                  {result.status === 'error' && result.error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                      <p className="text-red-800 text-sm font-medium">Error:</p>
                      <p className="text-red-700 text-sm">{result.error}</p>
                    </div>
                  )}
                  
                  {result.status === 'success' && result.data && (
                    <Tabs defaultValue="summary" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="raw">Raw Data</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="summary" className="mt-4">
                        <div className="space-y-2">
                          {result.data.success && (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-700">
                                API call successful
                              </span>
                            </div>
                          )}
                          
                          {result.data.count !== undefined && (
                            <div className="text-sm">
                              <strong>Count:</strong> {result.data.count} items
                            </div>
                          )}
                          
                          {result.data.sport && (
                            <div className="text-sm">
                              <strong>Sport:</strong> {result.data.sport}
                            </div>
                          )}
                          
                          {result.data.source && (
                            <div className="text-sm">
                              <strong>Source:</strong> {result.data.source}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="raw" className="mt-4">
                        <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-x-auto max-h-64">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>
            Current status of RapidAPI sports data integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Tennis API Integration</span>
              <Badge className="bg-blue-100 text-blue-800">
                Authentic Structure Ready
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Golf API Integration</span>
              <Badge className="bg-blue-100 text-blue-800">
                Authentic Structure Ready
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Basketball API Integration</span>
              <Badge className="bg-green-100 text-green-800">
                Available
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Football API Integration</span>
              <Badge className="bg-green-100 text-green-800">
                Available
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}