import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok) {
        // Store admin-specific tokens
        localStorage.setItem('weparlay-admin-token', result.token);
        localStorage.setItem('weparlay-admin-user', JSON.stringify(result.user));
        localStorage.setItem('weparlay-admin-expiry', (Date.now() + 24 * 60 * 60 * 1000).toString()); // 24 hours
        
        // Also store in main auth system for compatibility
        localStorage.setItem('auth-token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('weparlay-logged-in', 'true');
        localStorage.setItem('weparlay-is-admin', 'true');
        localStorage.setItem('weparlay-user-email', result.user.email);
        localStorage.setItem('weparlay-admin-email', result.user.email);
        
        toast({
          title: "Welcome back!",
          description: "Admin login successful"
        });
        
        // Force a page reload to ensure the authentication state is updated
        setTimeout(() => {
          window.location.href = '/admin-dashboard';
        }, 500);
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Connection failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/admin-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const result = await response.json();

      if (response.ok) {
        setResetSent(true);
        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions"
        });
      } else {
        toast({
          title: "Reset Failed",
          description: result.message || "Failed to send reset email",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Connection failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center justify-center">
            <Shield className="h-6 w-6 mr-2 text-blue-500" />
            WeParlay Admin
          </CardTitle>
          <CardDescription>
            {showReset ? 'Reset your admin password' : 'Sign in to access the admin dashboard'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!showReset ? (
            // Login Form
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="support@weparlay.io"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Signing in...' : 'Sign In to Admin'}
              </Button>

              <Button 
                variant="ghost" 
                className="w-full text-sm" 
                onClick={() => setShowReset(true)}
              >
                Forgot your password?
              </Button>
            </div>
          ) : (
            // Password Reset Form
            <div className="space-y-4">
              {!resetSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="support@weparlay.io"
                        className="pl-10"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePasswordReset()}
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    onClick={handlePasswordReset}
                    disabled={loading}
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Sending...' : 'Send Reset Email'}
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <h3 className="text-lg font-semibold">Reset Email Sent!</h3>
                  <p className="text-sm text-muted-foreground">
                    Check your email for password reset instructions. 
                    If you don't see it, check your spam folder.
                  </p>
                </div>
              )}

              <Button 
                variant="ghost" 
                className="w-full text-sm" 
                onClick={() => {
                  setShowReset(false);
                  setResetSent(false);
                  setResetEmail('');
                }}
              >
                ← Back to Login
              </Button>
            </div>
          )}

          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">Admin Access</p>
                <p>Use your official WeParlay admin credentials to access the control center.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}