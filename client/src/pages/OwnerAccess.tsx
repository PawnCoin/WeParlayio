import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Shield } from "lucide-react";

export default function OwnerAccess() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Immediately grant owner access
    localStorage.setItem('weparlay-admin-access', 'true');
    localStorage.setItem('weparlay-admin-token', 'owner-direct-access');
    localStorage.setItem('weparlay-admin-role', 'owner');
    localStorage.setItem('weparlay-admin-expiry', (Date.now() + 24 * 3600000).toString()); // 24 hours
    
    // Auto-redirect to admin dashboard after 1 second
    setTimeout(() => {
      navigate('/admin');
    }, 1000);
  }, [navigate]);

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center justify-center">
            <Crown className="h-6 w-6 mr-2 text-yellow-500" />
            Owner Access
          </CardTitle>
          <CardDescription>
            Granting immediate access to your platform
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <Shield className="h-12 w-12 mx-auto text-green-500" />
            <p className="text-sm text-muted-foreground">
              Redirecting to admin dashboard...
            </p>
            <Button 
              className="w-full" 
              onClick={() => navigate('/admin')}
            >
              Go to Admin Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}