import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LogIn, UserPlus, Zap, Play } from "lucide-react";

const LoginEnhanced: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const [quickEmail, setQuickEmail] = useState('');

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('weparlay-user', JSON.stringify(data.user));
      localStorage.setItem('weparlay-token', data.token);
      
      toast({
        title: "Welcome back!",
        description: `Good to see you again, ${data.user.username}!`,
      });
      
      navigate('/');
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: "Please check your username and password",
        variant: "destructive",
      });
    },
  });

  // Quick registration mutation
  const quickRegisterMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest('POST', '/api/auth/quick-register', { email });
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('weparlay-user', JSON.stringify(data.user));
      localStorage.setItem('weparlay-token', data.token);
      
      toast({
        title: "Account Created!",
        description: `Welcome ${data.user.username}! You got $25 to start betting!`,
      });
      
      navigate('/');
    },
    onError: (error: any) => {
      toast({
        title: "Quick Registration Failed",
        description: "Please try again or use full registration",
        variant: "destructive",
      });
    },
  });

  // Demo mode mutation
  const demoMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/demo', {});
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('weparlay-user', JSON.stringify(data.user));
      localStorage.setItem('weparlay-token', data.token);
      
      toast({
        title: "Demo Mode Activated!",
        description: "You have $1000 demo money to explore WeParlay!",
      });
      
      navigate('/');
    },
  });

  const handleLogin = () => {
    if (!loginData.username || !loginData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginData);
  };

  const handleQuickRegister = () => {
    if (!quickEmail || !quickEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    quickRegisterMutation.mutate(quickEmail);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
              <LogIn className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
              WeParlay
            </h1>
          </div>
          <p className="text-gray-600">The Ultimate Sports Betting Experience</p>
        </div>

        <Tabs defaultValue="login" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="quick">Quick Start</TabsTrigger>
            <TabsTrigger value="demo">Try Demo</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Sign in to your WeParlay account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username or Email</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username or email"
                    value={loginData.username}
                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <Button 
                  onClick={handleLogin}
                  disabled={loginMutation.isPending}
                  className="w-full"
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                
                <div className="text-center">
                  <button
                    onClick={() => navigate('/signup')}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Don't have an account? Create one
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quick">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Quick Start
                </CardTitle>
                <CardDescription>Get betting in seconds with just your email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-1">Instant Account Includes:</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• $25 Welcome Bonus</li>
                    <li>• 50 WePlay Tokens</li>
                    <li>• Full betting access</li>
                    <li>• Complete later at your convenience</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quickEmail">Email Address</Label>
                  <Input
                    id="quickEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuickRegister()}
                  />
                </div>
                
                <Button 
                  onClick={handleQuickRegister}
                  disabled={quickRegisterMutation.isPending}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  {quickRegisterMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Start Betting Now
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-blue-500" />
                  Try Demo Mode
                </CardTitle>
                <CardDescription>Explore WeParlay with demo money - no signup required</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-1">Demo Mode Features:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• $1000 Demo Money</li>
                    <li>• 500 WePlay Tokens</li>
                    <li>• Full platform access</li>
                    <li>• Real odds and events</li>
                    <li>• No registration required</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={() => demoMutation.mutate()}
                  disabled={demoMutation.isPending}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {demoMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Loading Demo...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Try Demo Mode
                    </div>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Demo session expires in 24 hours. Create an account to save your progress.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginEnhanced;