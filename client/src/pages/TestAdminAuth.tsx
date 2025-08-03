import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function TestAdminAuth() {
  const [token, setToken] = useState('');
  const [authStatus, setAuthStatus] = useState('');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const storedToken = localStorage.getItem('auth-token');
    setToken(storedToken || 'No token found');
  }, []);

  const adminLogin = async () => {
    try {
      setAuthStatus('Logging in...');
      
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
      
      if (data.success && data.token) {
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('weparlay-is-admin', 'true');
        setToken(data.token);
        setAuthStatus(`✅ Admin login successful! Token: ${data.token.substring(0, 50)}...`);
        
        // Reload page after 2 seconds to show profile dropdown
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setAuthStatus(`❌ Login failed: ${data.message}`);
      }
    } catch (error) {
      setAuthStatus(`❌ Error: ${error.message}`);
    }
  };

  const clearAuth = () => {
    localStorage.clear();
    setToken('Cleared');
    setAuthStatus('Authentication cleared');
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Admin Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><strong>Authentication Status:</strong> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
            <p><strong>User Email:</strong> {user?.email || 'None'}</p>
            <p><strong>Is Admin:</strong> {user?.isAdmin ? '✅ Yes' : '❌ No'}</p>
            <p><strong>User Role:</strong> {user?.role || 'None'}</p>
            <p><strong>Stored Token:</strong> {token.substring(0, 50)}{token.length > 50 ? '...' : ''}</p>
          </div>

          <div className="space-y-2">
            <Button onClick={adminLogin} className="w-full">
              Admin Login (support@weparlay.io)
            </Button>
            <Button onClick={clearAuth} variant="outline" className="w-full">
              Clear Authentication
            </Button>
          </div>

          {authStatus && (
            <div className="p-4 bg-muted rounded-lg">
              <p><strong>Status:</strong> {authStatus}</p>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>This page tests the admin authentication flow.</p>
            <p>After successful login, you should be redirected to the home page with the profile dropdown visible.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}