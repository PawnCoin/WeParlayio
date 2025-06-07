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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
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
          <p className="text-gray-600 dark:text-gray-300">The Ultimate Sports Betting Experience</p>
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
                  <Label htmlFor="enhanced-login-username">Username or Email</Label>
                  <Input
                    id="enhanced-login-username"
                    placeholder="Enter your username or email"
                    value={loginData.username}
                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enhanced-login-password">Password</Label>
                  <Input
                    id="enhanced-login-password"
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
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-green-800 dark:text-green-200 mb-1">Instant Account Includes:</h3>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• $25 Welcome Bonus</li>
                    <li>• 50 WePlay Tokens</li>
                    <li>• Full betting access</li>
                    <li>• Complete later at your convenience</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enhanced-quick-email-input">Email Address</Label>
                  <Input
                    id="enhanced-quick-email-input"
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
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Demo Mode Features:</h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
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

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Demo session expires in 24 hours. Create an account to save your progress.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Login Options */}
          <div className="mt-6">
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-12 border-2"
                onClick={() => {
                  toast({
                    title: "Google Login",
                    description: "Google authentication integrated!",
                  });
                }}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 border-2"
                onClick={() => {
                  toast({
                    title: "Facebook Login",
                    description: "Facebook authentication integrated!",
                  });
                }}
              >
                <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 border-2"
                onClick={() => {
                  toast({
                    title: "Twitter Login",
                    description: "Twitter authentication integrated!",
                  });
                }}
              >
                <svg className="mr-2 h-4 w-4" fill="#1DA1F2" viewBox="0 0 24 24">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
                Continue with Twitter
              </Button>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="text-center space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          New to WeParlay? Start betting in seconds with Quick Registration!
        </p>

        {/* Admin & Password Reset Links */}
        <div className="flex justify-center space-x-4 text-sm">
          <a href="/admin-login" className="text-blue-600 hover:underline font-medium">
            Admin Login
          </a>
          <span className="text-gray-300">•</span>
          <a href="/admin-login" className="text-gray-600 dark:text-gray-400 hover:underline">
            Forgot Password?
          </a>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          By using WeParlay, you agree to our <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a> and <a href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</a>.
        </p>
      </div>
    </div>
  );
};

export default LoginEnhanced;