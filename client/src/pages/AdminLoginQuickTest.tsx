import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginQuickTest() {
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const testAdminLogin = async () => {
    setLoading(true);
    
    try {
      console.log('Starting admin login test...');
      
      // Step 1: Admin Login
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'support@weparlay.io', 
          password: 'Baysides3!' 
        })
      });

      const result = await response.json();
      console.log('Admin login response:', result);

      if (result.success && result.token) {
        // Store tokens
        localStorage.setItem('auth-token', result.token);
        localStorage.setItem('weparlay-admin-token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('weparlay-is-admin', 'true');
        localStorage.setItem('weparlay-logged-in', 'true');
        
        console.log('Tokens stored successfully');
        console.log('Token preview:', result.token.substring(0, 50) + '...');
        
        // Step 2: Test the user endpoint
        const userResponse = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${result.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const userData = await userResponse.json();
        console.log('User verification response:', userData);
        
        if (userResponse.ok) {
          toast({
            title: "Success!",
            description: "Admin login and verification complete"
          });
          
          // Navigate to admin dashboard
          window.location.href = '/admin-dashboard';
        } else {
          toast({
            title: "Token verification failed",
            description: userData.message || "Unknown error",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Login failed",
          description: result.message || "Unknown error",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: "Test failed",
        description: "Check console for details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle>Quick Admin Login Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testAdminLogin} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Testing...' : 'Test Admin Login Flow'}
            </Button>
            
            <div className="mt-4 p-4 bg-slate-700 rounded">
              <h3 className="font-semibold mb-2">This test will:</h3>
              <ul className="text-sm space-y-1">
                <li>1. Login as support@weparlay.io</li>
                <li>2. Store authentication tokens</li>
                <li>3. Verify token with /api/auth/user</li>
                <li>4. Navigate to admin dashboard</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}