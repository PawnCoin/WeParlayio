import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function AdminLoginTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Test admin login flow
  const testAdminLogin = async () => {
    setIsLoading(true);
    try {
      console.log('🔐 Testing admin login...');
      
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'support@weparlay.io',
          password: 'Baysides3!'
        })
      });

      const data = await response.json();
      console.log('Admin login response:', data);

      if (data.success && data.token) {
        // Store the token in localStorage
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('weparlay-is-admin', 'true');
        
        toast({
          title: "Admin Login Successful",
          description: "Admin token stored successfully",
        });

        // Force page reload to refresh auth state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Unknown error",
          variant: "destructive"
        });
      }

      setDebugInfo(data);
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Network Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check current auth state
  useEffect(() => {
    const checkAuthState = () => {
      const hasToken = !!localStorage.getItem('auth-token');
      const isAdminStored = localStorage.getItem('weparlay-is-admin') === 'true';
      
      setDebugInfo(prev => ({
        ...prev,
        authState: {
          isAuthenticated,
          hasStoredToken: hasToken,
          isAdminStored,
          user: user,
          userEmail: user?.email,
          userIsAdmin: user?.isAdmin
        }
      }));
    };

    checkAuthState();
  }, [isAuthenticated, user]);

  const clearAuth = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast({
      title: "Auth Cleared",
      description: "All authentication data cleared",
    });
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Admin Login Test Dashboard</CardTitle>
          <CardDescription>
            Test admin authentication and profile dropdown functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={testAdminLogin} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Logging in...' : 'Test Admin Login'}
            </Button>
            
            <Button 
              onClick={clearAuth}
              variant="outline"
              className="w-full"
            >
              Clear All Auth Data
            </Button>
          </div>

          {/* Current Auth State Display */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Authentication State</h3>
            
            <div className="bg-muted p-4 rounded-lg">
              <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User Email:</strong> {user?.email || 'None'}</p>
              <p><strong>Is Admin:</strong> {user?.isAdmin ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User Role:</strong> {user?.role || 'None'}</p>
              <p><strong>Stored Admin Flag:</strong> {localStorage.getItem('weparlay-is-admin') === 'true' ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Has Token:</strong> {localStorage.getItem('auth-token') ? '✅ Yes' : '❌ No'}</p>
            </div>

            {debugInfo.authState && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Debug Information</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Test Credentials:</strong></p>
            <p>Email: support@weparlay.io</p>
            <p>Password: Baysides3!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}