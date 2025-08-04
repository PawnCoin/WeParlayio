import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Zap } from 'lucide-react';
import { Link } from 'wouter';
// AdminBypass logic is now integrated directly into TierGuard

interface TierGuardProps {
  children: React.ReactNode;
  requiredTier: 'standard' | 'vip' | 'professional';
  feature: string;
  description?: string;
}

const TierGuard: React.FC<TierGuardProps> = ({ 
  children, 
  requiredTier, 
  feature, 
  description 
}) => {
  const { user } = useAuth();
  
  // Check if user is admin FIRST - if so, bypass ALL restrictions
  const isAdmin = user?.email === 'support@weparlay.io' || 
                  user?.email === 'admin@weparlay.io' ||
                  user?.email === 'weparlay@admin.com' ||
                  user?.role === 'admin' || 
                  user?.isAdmin === true;

  // Admin users bypass ALL restrictions
  if (isAdmin) {
    return <>{children}</>;
  }

  // For non-admin users, check tier requirements
  return (
    <TierGuardContent 
      user={user}
      requiredTier={requiredTier}
      feature={feature}
      description={description}
    >
      {children}
    </TierGuardContent>
  );
};

// Separate component for the actual tier checking logic
const TierGuardContent: React.FC<{
  children: React.ReactNode;
  user: any;
  requiredTier: 'standard' | 'vip' | 'professional';
  feature: string;
  description?: string;
}> = ({ children, user, requiredTier, feature, description }) => {
  // Mock tier checking - in production this would check user.tier
  const userTier = user?.tier || 'standard';
  
  const tierLevels: Record<string, number> = {
    'standard': 1,
    'vip': 2,
    'professional': 3
  };
  
  const hasAccess = tierLevels[userTier] >= tierLevels[requiredTier];
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'vip':
        return <Crown className="h-8 w-8 text-amber-500" />;
      case 'professional':
        return <Zap className="h-8 w-8 text-purple-500" />;
      default:
        return <Lock className="h-8 w-8 text-gray-500" />;
    }
  };
  
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'vip':
        return 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30';
      case 'professional':
        return 'from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30';
      default:
        return 'from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30';
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[500px] p-4">
      <Card className={`max-w-md w-full bg-gradient-to-br ${getTierColor(requiredTier)} border-2`}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {getTierIcon(requiredTier)}
          </div>
          <CardTitle className="text-xl font-bold">
            {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Feature
          </CardTitle>
          <CardDescription className="text-sm">
            {feature} requires {requiredTier.toUpperCase()}+ access
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {description || `Unlock ${feature} and other premium features by upgrading to ${requiredTier.toUpperCase()}+ tier.`}
          </p>
          
          <div className="space-y-2">
            <Link href="/tier-comparison">
              <Button className="w-full" variant="default">
                <Crown className="h-4 w-4 mr-2" />
                View Tier Benefits
              </Button>
            </Link>
            
            <Link href="/vip">
              <Button className="w-full" variant="outline">
                Upgrade Now
              </Button>
            </Link>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Current tier: <span className="font-semibold capitalize">{userTier}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TierGuard;