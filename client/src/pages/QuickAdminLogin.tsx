import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuickAdminLogin() {
  const [status, setStatus] = useState('Ready to login');

  const doAdminLogin = async () => {
    try {
      setStatus('🔐 Logging in as admin...');
      
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
        // Store the token
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('weparlay-is-admin', 'true');
        
        setStatus('✅ Admin login successful! Redirecting to homepage...');
        
        // Redirect to homepage after 1 second
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setStatus(`❌ Login failed: ${data.message}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  const clearAuth = () => {
    localStorage.clear();
    setStatus('🗑️ Authentication cleared');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Click below to login as admin and see the profile dropdown
            </p>
            
            <Button 
              onClick={doAdminLogin} 
              className="w-full mb-2"
              size="lg"
            >
              Login as Admin
            </Button>
            
            <Button 
              onClick={clearAuth} 
              variant="outline" 
              className="w-full"
            >
              Clear Authentication
            </Button>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-sm">{status}</p>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            <p><strong>Credentials:</strong></p>
            <p>Email: support@weparlay.io</p>
            <p>Password: Baysides3!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}