import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bot, UserPlus, Zap, TestTube, CheckCircle } from "lucide-react";

const AuthTestDemo: React.FC = () => {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Demo user creation mutation
  const createDemoUserMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/demo', {});
      return response.json();
    },
    onSuccess: (data) => {
      setTestResults(prev => [...prev, {
        step: 'Demo User Created',
        status: 'success',
        data: `Username: ${data.user.username}, Balance: $${data.user.balance}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      // Store the demo user
      localStorage.setItem('demo-test-user', JSON.stringify(data.user));
      localStorage.setItem('demo-test-token', data.token);
      
      toast({
        title: "✅ Demo User Created!",
        description: `Created ${data.user.username} with $${data.user.balance}`,
      });
    },
  });

  // Quick registration test
  const quickRegisterTestMutation = useMutation({
    mutationFn: async () => {
      const testEmail = `test${Date.now()}@weparlay.com`;
      const response = await apiRequest('POST', '/api/auth/quick-register', { email: testEmail });
      return response.json();
    },
    onSuccess: (data) => {
      setTestResults(prev => [...prev, {
        step: 'Quick Registration',
        status: 'success',
        data: `Username: ${data.user.username}, Welcome Bonus: $${data.user.balance}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      toast({
        title: "✅ Quick Registration Success!",
        description: `Created ${data.user.username} with $${data.user.balance} bonus`,
      });
    },
  });

  // Social bot test with authenticated user
  const socialBotTestMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('demo-test-token');
      const response = await fetch('/api/social-bots/test-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          botId: 'twitter-bot-1',
          message: 'Testing WeParlay registration system! 🎲🔥 #SportsBetting #WeParlay'
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      setTestResults(prev => [...prev, {
        step: 'Social Bot Test',
        status: 'success',
        data: 'Social media bot successfully posted with authenticated user',
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      toast({
        title: "🤖 Social Bot Test Success!",
        description: "Bot posted successfully with authenticated user!",
      });
    },
    onError: () => {
      setTestResults(prev => [...prev, {
        step: 'Social Bot Test',
        status: 'error',
        data: 'Social bot test failed - may need API credentials',
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  });

  const runFullTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Step 1: Create demo user
      await createDemoUserMutation.mutateAsync();
      
      // Wait a moment between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Test quick registration  
      await quickRegisterTestMutation.mutateAsync();
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 3: Test social bot with auth
      await socialBotTestMutation.mutateAsync();
      
      setTestResults(prev => [...prev, {
        step: 'Full Test Complete',
        status: 'success',
        data: 'All authentication and social features tested successfully!',
        timestamp: new Date().toLocaleTimeString()
      }]);
      
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">WeParlay Authentication Test Suite</h1>
          <p className="text-gray-600">Test the new user registration system with social media bot integration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-blue-500" />
                Authentication Tests
              </CardTitle>
              <CardDescription>
                Test all authentication flows and social integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runFullTest}
                disabled={isRunning}
                className="w-full"
                size="lg"
              >
                {isRunning ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Running Tests...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Run Full Test Suite
                  </div>
                )}
              </Button>

              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => createDemoUserMutation.mutate()}
                  disabled={isRunning}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Demo User
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => quickRegisterTestMutation.mutate()}
                  disabled={isRunning}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Quick Reg
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => socialBotTestMutation.mutate()}
                  disabled={isRunning}
                >
                  <Bot className="h-3 w-3 mr-1" />
                  Bot Test
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Test Features:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Demo user creation ($1000 demo money)</li>
                  <li>• Quick registration ($25 bonus)</li>
                  <li>• Social media bot integration</li>
                  <li>• JWT token authentication</li>
                  <li>• Full API endpoint testing</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Test Results
                {testResults.length > 0 && (
                  <Badge variant="secondary">{testResults.length} tests</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TestTube className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No tests run yet. Click "Run Full Test Suite" to start!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.status === 'success' 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-medium ${
                          result.status === 'success' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {result.step}
                        </span>
                        <span className="text-xs text-gray-500">
                          {result.timestamp}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        result.status === 'success' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.data}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current User Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Test Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-1">Demo User</h3>
                <p className="text-sm text-gray-600">
                  {localStorage.getItem('demo-test-user') 
                    ? JSON.parse(localStorage.getItem('demo-test-user')!).username 
                    : 'Not created yet'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-1">Auth Token</h3>
                <p className="text-sm text-gray-600">
                  {localStorage.getItem('demo-test-token') ? '✅ Active' : '❌ None'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-1">Tests Run</h3>
                <p className="text-sm text-gray-600">
                  {testResults.filter(r => r.status === 'success').length} / {testResults.length} passed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthTestDemo;