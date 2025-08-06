import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Crown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface FantasyTestResult {
  service: string;
  status: 'success' | 'error';
  data?: any;
  error?: string;
  responseTime?: number;
}

export default function FantasyLeagueTest() {
  const [testResults, setTestResults] = useState<FantasyTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Test Yahoo Fantasy connection
  const testYahooConnection = async (): Promise<FantasyTestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/yahoo/test-connection');
      const data = await response.json();
      return {
        service: 'Yahoo Fantasy',
        status: response.ok ? 'success' : 'error',
        data: data,
        responseTime: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        service: 'Yahoo Fantasy',
        status: 'error',
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  };

  // Test ESPN Fantasy connection
  const testESPNConnection = async (): Promise<FantasyTestResult> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/espn-fantasy/league/test');
      const data = await response.json();
      return {
        service: 'ESPN Fantasy',
        status: response.ok && data.success ? 'success' : 'error',
        data: data,
        responseTime: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        service: 'ESPN Fantasy',
        status: 'error',
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  };

  // Run comprehensive tests
  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests = [
      testYahooConnection(),
      testESPNConnection()
    ];

    const results = await Promise.allSettled(tests);
    
    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          service: ['Yahoo Fantasy', 'ESPN Fantasy'][index],
          status: 'error' as const,
          error: result.reason?.message || 'Unknown error'
        };
      }
    });

    setTestResults(processedResults);
    setIsRunning(false);
  };

  // Run tests on component mount
  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            <Trophy className="inline-block mr-2 h-8 w-8 text-yellow-500" />
            Fantasy League Connection Test
          </h1>
          <p className="text-gray-300">Testing Yahoo and ESPN fantasy sports integrations</p>
        </div>

        {/* Controls */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex justify-center">
              <Button 
                onClick={runTests} 
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Run Connection Tests
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testResults.map((result, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    {result.service === 'Yahoo Fantasy' ? (
                      <Crown className="w-5 h-5 mr-2 text-purple-500" />
                    ) : (
                      <Users className="w-5 h-5 mr-2 text-red-500" />
                    )}
                    {result.service}
                  </span>
                  {getStatusIcon(result.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status:</span>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.toUpperCase()}
                  </Badge>
                </div>

                {result.responseTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Response Time:</span>
                    <Badge variant="outline">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {result.responseTime}ms
                    </Badge>
                  </div>
                )}

                {result.status === 'success' && result.data && (
                  <div className="space-y-2">
                    <span className="text-gray-300 font-medium">Connection Details:</span>
                    <div className="bg-gray-900/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-400">
                        {result.data.message && (
                          <p className="mb-2">{result.data.message}</p>
                        )}
                        {result.data.data && result.data.data.league && (
                          <div className="space-y-1">
                            <p><strong>League:</strong> {result.data.data.league.name}</p>
                            <p><strong>Teams:</strong> {result.data.data.league.size || result.data.data.league.teams?.length}</p>
                            <p><strong>Type:</strong> {result.data.data.league.scoringType || 'Standard'}</p>
                          </div>
                        )}
                        {result.data.data && result.data.data.name && (
                          <div className="space-y-1">
                            <p><strong>League:</strong> {result.data.data.name}</p>
                            <p><strong>Teams:</strong> {result.data.data.size}</p>
                            <p><strong>Type:</strong> {result.data.data.scoringType}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {result.status === 'error' && (
                  <div className="space-y-2">
                    <span className="text-gray-300 font-medium">Error Details:</span>
                    <div className="bg-red-900/20 p-3 rounded-lg border border-red-800">
                      <p className="text-red-300 text-sm">
                        {result.error || 'Unknown error occurred'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        {testResults.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-500">
                    {testResults.filter(r => r.status === 'success').length}
                  </p>
                  <p className="text-gray-300 text-sm">Successful</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">
                    {testResults.filter(r => r.status === 'error').length}
                  </p>
                  <p className="text-gray-300 text-sm">Failed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">
                    {testResults.length}
                  </p>
                  <p className="text-gray-300 text-sm">Total Tests</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-500">
                    {testResults.reduce((avg, r) => avg + (r.responseTime || 0), 0) / testResults.length || 0}ms
                  </p>
                  <p className="text-gray-300 text-sm">Avg Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Fantasy league integrations use authentic data structures for accurate testing
          </p>
        </div>
      </div>
    </div>
  );
}