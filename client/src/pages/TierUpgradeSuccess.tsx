import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, Star, Home, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function TierUpgradeSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [upgradeDetails, setUpgradeDetails] = useState<any>(null);

  useEffect(() => {
    // Get upgrade details from URL parameters or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const tier = urlParams.get('tier') || localStorage.getItem('upgradeCompletedTier');
    const paymentMethod = urlParams.get('payment_method') || localStorage.getItem('upgradePaymentMethod');
    
    if (tier) {
      setUpgradeDetails({
        tierName: tier,
        paymentMethod: paymentMethod || 'stripe',
        completedAt: new Date().toLocaleString(),
      });
      
      // Clear localStorage
      localStorage.removeItem('upgradeCompletedTier');
      localStorage.removeItem('upgradePaymentMethod');
      
      // Show success toast
      toast({
        title: "Upgrade Complete!",
        description: `Welcome to ${tier} tier! Your new features are now active.`,
      });
    } else {
      // If no upgrade details, redirect to upgrade page
      setTimeout(() => {
        setLocation('/upgrade-tier');
      }, 2000);
    }
  }, [setLocation, toast]);

  const getTierIcon = (tierName: string) => {
    switch (tierName?.toLowerCase()) {
      case 'bronze': return Star;
      case 'silver': return Star;
      case 'gold': return Crown;
      case 'platinum': return Crown;
      case 'diamond': return Crown;
      default: return Star;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName?.toLowerCase()) {
      case 'bronze': return 'from-orange-400 to-orange-600';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-purple-400 to-purple-600';
      case 'diamond': return 'from-blue-400 to-blue-600';
      default: return 'from-green-400 to-green-600';
    }
  };

  const getTierFeatures = (tierName: string) => {
    switch (tierName?.toLowerCase()) {
      case 'bronze':
        return [
          'Basic betting functionality',
          'Standard odds access',
          'Email support',
          'Basic analytics',
          'Mobile app access'
        ];
      case 'silver':
        return [
          'Live streaming access',
          'Advanced analytics',
          'Priority support',
          'Multi-currency betting',
          'Parlay betting'
        ];
      case 'gold':
        return [
          'Exclusive tournaments',
          'VIP chat support',
          'Advanced betting tools',
          'Custom alerts',
          'API access'
        ];
      case 'platinum':
        return [
          'Personal account manager',
          'Custom betting limits',
          'Premium insights',
          'White-label options',
          'Early feature access'
        ];
      case 'diamond':
        return [
          'White-glove service',
          'Unlimited access',
          'Beta features',
          'Platform settings access',
          'System management tools'
        ];
      default:
        return ['Enhanced features activated'];
    }
  };

  if (!upgradeDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading upgrade details...</p>
        </div>
      </div>
    );
  }

  const IconComponent = getTierIcon(upgradeDetails.tierName);
  const tierColor = getTierColor(upgradeDetails.tierName);
  const features = getTierFeatures(upgradeDetails.tierName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className={`w-24 h-24 bg-gradient-to-br ${tierColor} rounded-full flex items-center justify-center shadow-lg`}>
                <IconComponent className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <CheckCircle className="w-8 h-8 text-green-500 bg-white rounded-full" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Upgrade Successful!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Welcome to your new <span className="font-semibold text-gray-900">{upgradeDetails.tierName}</span> tier
          </p>
          <p className="text-sm text-gray-500">
            Completed on {upgradeDetails.completedAt}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Upgrade Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Upgrade Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">New Tier:</span>
                  <Badge className={`bg-gradient-to-r ${tierColor} text-white`}>
                    {upgradeDetails.tierName}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">
                    {upgradeDetails.paymentMethod === 'crypto' ? 'Pawn Coin ($PC)' : 'Credit Card'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Your New Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {features.length > 4 && (
                  <li className="text-sm text-gray-500 ml-6">
                    +{features.length - 4} more features
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-2">Explore Features</h3>
                <p className="text-sm text-gray-600">
                  Check out your new tier features and enhanced capabilities
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">VIP Access</h3>
                <p className="text-sm text-gray-600">
                  Access exclusive content and priority support features
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium mb-2">Bonus Features</h3>
                <p className="text-sm text-gray-600">
                  Unlock additional tools and advanced betting options
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="space-x-4">
            <Button 
              onClick={() => setLocation('/')}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Platform
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setLocation('/settings')}
            >
              Manage Subscription
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            Need help? Contact our support team for assistance with your new tier features.
          </p>
        </div>
      </div>
    </div>
  );
}