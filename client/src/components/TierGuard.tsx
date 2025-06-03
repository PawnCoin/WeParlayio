import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Diamond, Star, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface TierGuardProps {
  children: React.ReactNode;
  requiredTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  userTier?: string;
  feature?: string;
}

const tierHierarchy = {
  'none': 0,
  'bronze': 1,
  'silver': 2,
  'gold': 3,
  'platinum': 4,
  'diamond': 5
};

const tierIcons = {
  'bronze': Star,
  'silver': Zap,
  'gold': Crown,
  'platinum': Crown,
  'diamond': Diamond
};

const tierPrices = {
  'bronze': '$9.99/month',
  'silver': '$19.99/month',
  'gold': '$39.99/month',
  'platinum': '$79.99/month',
  'diamond': '$149.99/month'
};

const tierFeatures = {
  'bronze': ['Basic betting', 'Standard odds', 'Email support'],
  'silver': ['Everything in Bronze', 'Live streaming', 'Advanced analytics', 'Priority support'],
  'gold': ['Everything in Silver', 'Exclusive tournaments', 'VIP chat support', 'Advanced tools'],
  'platinum': ['Everything in Gold', 'Personal account manager', 'Custom betting limits', 'Premium insights'],
  'diamond': ['Everything in Platinum', 'White-glove service', 'Unlimited access', 'Beta features']
};

export default function TierGuard({ children, requiredTier, userTier = 'none', feature }: TierGuardProps) {
  const [, setLocation] = useLocation();
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const userTierLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0;
  const requiredTierLevel = tierHierarchy[requiredTier];

  // Bypass tier check if user is admin
  if (isAdmin) {
    return <>{children}</>;
  }

  if (userTierLevel >= requiredTierLevel) {
    return <>{children}</>;
  }

  const TierIcon = tierIcons[requiredTier];

  const upgradeMutation = useMutation({
    mutationFn: async (tierId: string) => {
      const response = await apiRequest('POST', '/api/stripe/create-tier-subscription', { tierId });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Upgrade Initiated",
        description: `Starting upgrade to ${data.tierName} tier. Redirecting to payment...`,
      });
      
      // Redirect to Stripe Checkout or handle payment flow
      window.location.href = `/payment-checkout?subscription=${data.subscriptionId}&client_secret=${data.clientSecret}`;
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to initiate tier upgrade. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = () => {
    upgradeMutation.mutate(requiredTier);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center">
            <TierIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">
            {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Tier Required
          </CardTitle>
          <CardDescription>
            {feature ? `${feature} requires` : 'This feature requires'} {requiredTier} tier or higher
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">{requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Features:</h4>
            <ul className="text-sm space-y-1">
              {tierFeatures[requiredTier].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-1 h-1 bg-green-500 rounded-full mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {tierPrices[requiredTier]}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Upgrade now to access this feature and more
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleUpgrade} 
              disabled={upgradeMutation.isPending}
              className="w-full"
            >
              {upgradeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Upgrade to ${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}`
              )}
            </Button>
            <Button variant="outline" onClick={() => setLocation('/')} className="w-full">
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}