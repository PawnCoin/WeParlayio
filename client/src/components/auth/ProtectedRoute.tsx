import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { canUserAccess, SubscriptionTier, TierFeatures } from '@shared/tierSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Crown, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireTier?: SubscriptionTier;
  requireAdmin?: boolean;
  requiredFeature?: keyof TierFeatures;
  redirectTo?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireTier,
  requireAdmin = false,
  requiredFeature,
  redirectTo = '/upgrade-tier',
  fallback
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, isLoading, requireAuth, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card className="max-w-md w-full bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <User className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-white">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">You need to be logged in to access this page.</p>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check admin requirements
  if (requireAdmin && (!user?.isAdmin || user?.role !== 'admin')) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card className="max-w-md w-full bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-white">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">This page requires administrator privileges.</p>
            <Button 
              onClick={() => setLocation('/')}
              variant="outline"
              className="w-full"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check tier requirements
  if (requireTier && user) {
    const hasAccess = canUserAccess(user.tier as any, requiredFeature || 'basicAccess');
    const userTierLevel = Object.values(SubscriptionTier).indexOf(user.tier as SubscriptionTier);
    const requiredTierLevel = Object.values(SubscriptionTier).indexOf(requireTier);
    
    if (!hasAccess || userTierLevel < requiredTierLevel) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <Card className="max-w-md w-full bg-gray-900 border-gray-800">
            <CardHeader className="text-center">
              <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <CardTitle className="text-white">VIP Access Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-400">
                This feature requires {requireTier.charAt(0).toUpperCase() + requireTier.slice(1)} tier or higher.
              </p>
              <p className="text-sm text-gray-500">
                Your current tier: {user.tier || 'Bronze'}
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setLocation(redirectTo)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  Upgrade Now
                </Button>
                <Button 
                  onClick={() => setLocation('/')}
                  variant="outline"
                  className="flex-1"
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Check specific feature access
  if (requiredFeature && user && !canUserAccess(user.tier as any, requiredFeature)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card className="max-w-md w-full bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <Lock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <CardTitle className="text-white">Feature Locked</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">
              This feature is not available with your current subscription.
            </p>
            <Button 
              onClick={() => setLocation(redirectTo)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Upgrade to Access
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for easy wrapping
export function withProtection<P extends object>(
  Component: React.ComponentType<P>,
  protectionOptions: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...protectionOptions}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Specific protection components for common use cases
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireAuth requireAdmin>
      {children}
    </ProtectedRoute>
  );
}

export function VipRoute({ children, tier = SubscriptionTier.SILVER }: { 
  children: ReactNode; 
  tier?: SubscriptionTier;
}) {
  return (
    <ProtectedRoute requireAuth requireTier={tier}>
      {children}
    </ProtectedRoute>
  );
}

export function PremiumRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute 
      requireAuth 
      requireTier={SubscriptionTier.GOLD}
      requiredFeature="premiumFeatures"
    >
      {children}
    </ProtectedRoute>
  );
}

export function StreamingRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute 
      requireAuth 
      requireTier={SubscriptionTier.SILVER}
      requiredFeature="liveStreamingAccess"
    >
      {children}
    </ProtectedRoute>
  );
}