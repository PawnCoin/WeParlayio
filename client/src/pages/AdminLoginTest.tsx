import React, { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, User, Lock } from "lucide-react";

export default function AdminLoginTest() {
  const [credentials, setCredentials] = useState({
    username: 'support@weparlay.io',
    password: 'Baysides3!'
  });
  
  const { login, isLoggingIn, user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(credentials);
      
      // Check localStorage after login
      const adminStatus = localStorage.getItem("weparlay-is-admin");
      const userData = localStorage.getItem("user");
      
      console.log('Post-login storage check:', {
        adminStatus,
        userData: userData ? JSON.parse(userData) : null,
        currentUser: user
      });
      
      toast({
        title: "Login Test Complete",
        description: `Admin status: ${adminStatus}, User: ${user?.email}`,
      });
      
    } catch (error) {
      console.error('Login test failed:', error);
    }
  };

  const checkCurrentStatus = () => {
    const adminStatus = localStorage.getItem("weparlay-is-admin");
    const userData = localStorage.getItem("user");
    const authToken = localStorage.getItem("auth-token");
    
    console.log('Current auth status:', {
      isAuthenticated,
      user,
      adminStatus,
      userData: userData ? JSON.parse(userData) : null,
      authToken: authToken ? 'Present' : 'Missing'
    });
    
    toast({
      title: "Current Status",
      description: `Authenticated: ${isAuthenticated}, Admin: ${adminStatus}, Token: ${authToken ? 'Present' : 'Missing'}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-400" />
              Admin Login Test
            </CardTitle>
            <CardDescription className="text-slate-300">
              Test admin authentication for support@weparlay.io
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Current Status Display */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Current Status
              </h3>
              <div className="text-sm space-y-1 text-slate-300">
                <p>Authenticated: <span className="text-green-400">{isAuthenticated ? 'Yes' : 'No'}</span></p>
                <p>User Email: <span className="text-blue-400">{user?.email || 'None'}</span></p>
                <p>Is Admin: <span className="text-purple-400">{user?.isAdmin ? 'Yes' : 'No'}</span></p>
                <p>Role: <span className="text-yellow-400">{user?.role || 'None'}</span></p>
                <p>Admin Storage: <span className="text-green-400">{localStorage.getItem("weparlay-is-admin") || 'Not Set'}</span></p>
              </div>
              <Button onClick={checkCurrentStatus} className="mt-3" size="sm">
                Refresh Status
              </Button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email/Username:</label>
                <Input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Password:</label>
                <Input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoggingIn}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoggingIn ? 'Testing Login...' : 'Test Admin Login'}
              </Button>
            </form>

            {/* Backend Test */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Backend Test
              </h3>
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/auth/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: 'support@weparlay.io',
                        password: 'Baysides3!'
                      })
                    });
                    const data = await response.json();
                    console.log('Direct backend test:', data);
                    toast({
                      title: "Backend Test",
                      description: `Response: ${data.success ? 'Success' : 'Failed'}, Admin: ${data.isAdmin}`,
                    });
                  } catch (error) {
                    console.error('Backend test failed:', error);
                  }
                }}
                size="sm"
              >
                Test Backend Directly
              </Button>
            </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}