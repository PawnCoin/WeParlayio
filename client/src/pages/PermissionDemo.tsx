import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PermissionGate from '@/components/auth/PermissionGate';
import PermissionBadge from '@/components/auth/PermissionBadge';
import UpgradePrompt from '@/components/auth/UpgradePrompt';
import { usePermissions } from '@/hooks/usePermissions';
import { Shield, Crown, Star, Gem, Lock, Users, BarChart3, Settings } from 'lucide-react';

export default function PermissionDemo() {
  const permissions = usePermissions();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Dynamic User Permission System</h1>
        <p className="text-muted-foreground">
          Demonstrating role-based access control and tier-based feature visibility
        </p>
        <PermissionBadge className="justify-center" />
      </div>

      {/* Current User Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Current Permissions
          </CardTitle>
          <CardDescription>
            Based on your role: {permissions.role} | Tier: {permissions.tier} | Subscription: {permissions.subscription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(permissions).map(([key, value]) => {
              if (typeof value === 'boolean') {
                return (
                  <div key={key} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm font-medium">
                      {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Badge variant={value ? "default" : "secondary"}>
                      {value ? "✓" : "✗"}
                    </Badge>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Only Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Settings className="h-5 w-5" />
              Admin Only Features
            </CardTitle>
            <CardDescription>
              These features are only visible to administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PermissionGate 
              adminOnly 
              fallback={
                <UpgradePrompt 
                  featureName="Admin Features"
                  description="Only administrators can access system management tools."
                />
              }
            >
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </Button>
                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
                <Button className="w-full" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics Dashboard
                </Button>
              </div>
            </PermissionGate>
          </CardContent>
        </Card>

        {/* Silver Tier Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-500">
              <Star className="h-5 w-5" />
              Silver Tier Features
            </CardTitle>
            <CardDescription>
              Features available to Silver tier users and above
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PermissionGate 
              requiredTier="silver"
              fallback={
                <UpgradePrompt 
                  requiredTier="silver"
                  featureName="VIP Features"
                  description="Upgrade to Silver tier to unlock premium betting features and exclusive content."
                />
              }
            >
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Crown className="h-4 w-4 mr-2" />
                  VIP Betting Lines
                </Button>
                <Button className="w-full" variant="outline">
                  <Star className="h-4 w-4 mr-2" />
                  Exclusive Promotions
                </Button>
                <Button className="w-full" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Priority Support
                </Button>
              </div>
            </PermissionGate>
          </CardContent>
        </Card>

        {/* Gold Tier Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Crown className="h-5 w-5" />
              Gold Tier Features
            </CardTitle>
            <CardDescription>
              Premium features for Gold tier members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PermissionGate 
              requiredTier="gold"
              fallback={
                <UpgradePrompt 
                  requiredTier="gold"
                  featureName="Premium Analytics"
                  description="Access advanced betting analytics, AI predictions, and exclusive market insights."
                />
              }
            >
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Advanced Analytics
                </Button>
                <Button className="w-full" variant="outline">
                  <Crown className="h-4 w-4 mr-2" />
                  AI Predictions
                </Button>
                <Button className="w-full" variant="outline">
                  <Gem className="h-4 w-4 mr-2" />
                  Market Insights
                </Button>
              </div>
            </PermissionGate>
          </CardContent>
        </Card>

        {/* Platinum Tier Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <Gem className="h-5 w-5" />
              Platinum Tier Features
            </CardTitle>
            <CardDescription>
              Ultimate features for our most valued members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PermissionGate 
              requiredTier="platinum"
              fallback={
                <UpgradePrompt 
                  requiredTier="platinum"
                  featureName="Platinum Exclusive"
                  description="Join our elite tier for personal account managers, exclusive events, and maximum betting limits."
                />
              }
            >
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Personal Manager
                </Button>
                <Button className="w-full" variant="outline">
                  <Crown className="h-4 w-4 mr-2" />
                  Exclusive Events
                </Button>
                <Button className="w-full" variant="outline">
                  <Gem className="h-4 w-4 mr-2" />
                  Unlimited Betting
                </Button>
              </div>
            </PermissionGate>
          </CardContent>
        </Card>
      </div>

      {/* Authentication Required Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Members Only Section
          </CardTitle>
          <CardDescription>
            This content requires user authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionGate 
            requireAuth
            fallback={
              <div className="text-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
                <p className="text-muted-foreground mb-4">
                  Please log in to access member features and personalized content.
                </p>
                <Button>Sign In to Continue</Button>
              </div>
            }
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Welcome back, valued member!</h3>
              <p className="text-muted-foreground">
                You have access to personalized betting recommendations, bet history, 
                and exclusive member benefits.
              </p>
              <div className="flex gap-2">
                <Button variant="outline">View Bet History</Button>
                <Button variant="outline">My Rewards</Button>
                <Button variant="outline">Account Settings</Button>
              </div>
            </div>
          </PermissionGate>
        </CardContent>
      </Card>
    </div>
  );
}