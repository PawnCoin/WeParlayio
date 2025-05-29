import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKeyhole, Key, Shield } from "lucide-react";

/**
 * Temporary admin bypass page for development
 * This should be removed in production
 */
export default function AdminBypass() {
  const [adminKey, setAdminKey] = React.useState('');
  const [error, setError] = React.useState('');
  const [, navigate] = useLocation();

  // Admin credentials for WeParlay platform
  const ADMIN_EMAIL = 'support@weparlay.io';
  const ADMIN_PASSWORD = 'Baysides3!';
  const ADMIN_BYPASS_KEY = 'weparlay-admin-2025'; // Development bypass key

  const handleAdminAccess = () => {
    if (adminKey === ADMIN_BYPASS_KEY) {
      // In a real app this would set up proper authentication
      localStorage.setItem('weparlay-admin-access', 'true');
      localStorage.setItem('weparlay-admin-expiry', (Date.now() + 3600000).toString()); // 1 hour
      navigate('/admin');
    } else {
      setError('Invalid admin key');
    }
  };

  // Auto-fill and auto-login for development convenience
  useEffect(() => {
    // Check if already has admin access
    const hasAdminAccess = localStorage.getItem('weparlay-admin-access') === 'true';
    const adminExpiry = localStorage.getItem('weparlay-admin-expiry');
    
    if (hasAdminAccess && adminExpiry && parseInt(adminExpiry) > Date.now()) {
      // Has valid admin session, redirect to admin dashboard
      navigate('/admin');
      return;
    }
    
    // Just auto-fill the key
    setAdminKey(ADMIN_BYPASS_KEY);
    
    // Optional: Auto-login after 1 second for development
    const timer = setTimeout(() => {
      handleAdminAccess();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center">
            <Shield className="h-6 w-6 mr-2 text-primary" />
            Admin Access
          </CardTitle>
          <CardDescription>
            Enter your owner access key to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-key">Owner Access Key</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-key"
                  placeholder="Enter your admin access key"
                  className="pl-10"
                  value={adminKey}
                  onChange={(e) => {
                    setAdminKey(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminAccess()}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <Button 
              className="w-full" 
              onClick={handleAdminAccess}
            >
              <Key className="h-4 w-4 mr-2" />
              Access Admin Dashboard
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              This bypass is for development only and would be removed in production.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}