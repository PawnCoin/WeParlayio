import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle, XCircle, AlertCircle, TestTube } from 'lucide-react';

interface ButtonTest {
  name: string;
  description: string;
  testFunction: () => Promise<boolean>;
  status: 'pending' | 'passed' | 'failed' | 'testing';
  error?: string;
}

export default function ButtonFunctionalityTest() {
  const [tests, setTests] = useState<ButtonTest[]>([
    {
      name: 'Sports Data API',
      description: 'Test if sports data endpoints work',
      testFunction: async () => {
        try {
          const response = await apiRequest('GET', '/api/sports');
          return response.ok;
        } catch {
          return false;
        }
      },
      status: 'pending'
    },
    {
      name: 'Live Events API',
      description: 'Test if live events load properly',
      testFunction: async () => {
        try {
          const response = await apiRequest('GET', '/api/events/live');
          return response.ok;
        } catch {
          return false;
        }
      },
      status: 'pending'
    },
    {
      name: 'Odds Ticker API',
      description: 'Test if odds ticker provides data',
      testFunction: async () => {
        try {
          const response = await apiRequest('GET', '/api/odds-ticker/live-ticker');
          const data = await response.json();
          return data.success && Array.isArray(data.odds);
        } catch {
          return false;
        }
      },
      status: 'pending'
    },
    {
      name: 'User Balance API',
      description: 'Test user balance endpoint (expects 401 when not logged in)',
      testFunction: async () => {
        try {
          const response = await apiRequest('GET', '/api/user/cash-balance');
          // Expecting 401 when not authenticated is correct behavior
          return response.status === 401;
        } catch {
          return false;
        }
      },
      status: 'pending'
    },
    {
      name: 'System Health Check',
      description: 'Test system health endpoint',
      testFunction: async () => {
        try {
          const response = await apiRequest('GET', '/api/system/system-health');
          const data = await response.json();
          return response.ok && data.timestamp;
        } catch {
          return false;
        }
      },
      status: 'pending'
    }
  ]);

  const runTest = async (index: number) => {
    const newTests = [...tests];
    newTests[index].status = 'testing';
    setTests(newTests);

    try {
      const result = await newTests[index].testFunction();
      newTests[index].status = result ? 'passed' : 'failed';
      if (!result) {
        newTests[index].error = 'API call failed or returned unexpected data';
      }
    } catch (error) {
      newTests[index].status = 'failed';
      newTests[index].error = error instanceof Error ? error.message : 'Unknown error';
    }

    setTests(newTests);
  };

  const runAllTests = async () => {
    for (let i = 0; i < tests.length; i++) {
      await runTest(i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'testing': return <AlertCircle className="h-5 w-5 text-yellow-500 animate-spin" />;
      default: return <TestTube className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed': return <Badge className="bg-green-100 text-green-800">Working</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'testing': return <Badge className="bg-yellow-100 text-yellow-800">Testing...</Badge>;
      default: return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Button & API Functionality Test</h1>
        <p className="text-gray-600">
          This page tests actual functionality of core platform features to verify what's working vs. broken.
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={runAllTests} className="mr-4">
          Run All Tests
        </Button>
        <span className="text-sm text-gray-500">
          Tests: {tests.filter(t => t.status === 'passed').length} passed, {tests.filter(t => t.status === 'failed').length} failed
        </span>
      </div>

      <div className="grid gap-4">
        {tests.map((test, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  {getStatusBadge(test.status)}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => runTest(index)}
                  disabled={test.status === 'testing'}
                >
                  Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{test.description}</p>
              {test.error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  Error: {test.error}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Truth About Platform Status:</h3>
        <ul className="text-sm space-y-1">
          <li>• This test shows actual API functionality, not assumptions</li>
          <li>• Failed tests indicate real issues that need fixing</li>
          <li>• Passed tests confirm those features are genuinely working</li>
          <li>• Some features may work in UI but fail at API level</li>
        </ul>
      </div>
    </div>
  );
}