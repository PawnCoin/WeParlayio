import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Star, Zap, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

export default function UpgradeTier() {
  const [selectedTier, setSelectedTier] = useState<string>('silver');
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserTier, setCurrentUserTier] = useState<string>('bronze');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTierData = async () => {
      try {
        // Fetch tier pricing
        const pricingResponse = await apiRequest('GET', '/api/tier/pricing') as any;
        if (pricingResponse.success) {
          const tierData = pricingResponse.tiers.map((tier: any) => ({
            id: tier.id,
            name: tier.name,
            price: tier.price === 0 ? 'Free' : `$${tier.price}/month`,
            description: tier.description,
            features: [
              `${tier.features.liveStreamingAccess ? '✓' : '✗'} Live Streaming Access`,
              `${tier.features.advancedAnalytics ? '✓' : '✗'} Advanced Analytics`,
              `${tier.features.premiumOdds ? '✓' : '✗'} Premium Odds`,
              `${tier.features.vipSupport ? '✓' : '✗'} VIP Support`,
              `${tier.features.customBets ? '✓' : '✗'} Custom Bets`,
              `${tier.features.socialFeatures ? '✓' : '✗'} Social Features`,
              `${tier.features.gamingAccess ? '✓' : '✗'} Gaming Access`,
              `${tier.features.tournamentAccess ? '✓' : '✗'} Tournament Access`
            ],
            color: getColorForTier(tier.id),
            icon: getIconForTier(tier.id),
            popular: tier.popular,
            current: false
          }));
          setTiers(tierData);
        }
        
        // Fetch current user tier
        if (user) {
          const currentTierResponse = await apiRequest('GET', '/api/tier/current') as any;
          if (currentTierResponse.success) {
            setCurrentUserTier(currentTierResponse.tier);
            // Mark current tier in tiers array
            setTiers(prev => prev.map(tier => ({
              ...tier,
              current: tier.id === currentTierResponse.tier
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching tier data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tier information',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTierData();
  }, [user, toast]);

  const getColorForTier = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-600 to-amber-800';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-purple-500 to-purple-700';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getIconForTier = (tier: string) => {
    switch (tier) {
      case 'bronze': return Trophy;
      case 'silver': return Star;
      case 'gold': return Crown;
      case 'platinum': return Zap;
      default: return Trophy;
    }
  };

  const handleUpgrade = async (tierId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to upgrade your tier',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/tier/purchase', {
        tier: tierId,
        paymentMethod: 'simulated' // For demo purposes
      }) as any;

      if (response.success) {
        toast({
          title: 'Tier Upgraded!',
          description: response.message,
          variant: 'default'
        });
        
        // Refresh tier data
        window.location.reload();
      } else {
        toast({
          title: 'Upgrade Failed',
          description: response.message || 'Failed to upgrade tier',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error upgrading tier:', error);
      toast({
        title: 'Upgrade Error',
        description: error.message || 'Failed to process upgrade',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Upgrade Your WeParlay Experience
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock premium features, exclusive tournaments, and advanced analytics 
            to take your sports betting to the next level.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <Card
                key={tier.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                  tier.popular ? 'ring-2 ring-yellow-400 shadow-2xl' : ''
                } ${tier.current ? 'ring-2 ring-green-400' : ''}`}
              >
                {tier.popular && (
                  <Badge className="absolute top-4 right-4 bg-yellow-500 text-black">
                    Most Popular
                  </Badge>
                )}
                {tier.current && (
                  <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                    Current Plan
                  </Badge>
                )}
                
                <CardHeader className={`bg-gradient-to-r ${tier.color} text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <IconComponent className="h-6 w-6" />
                        {tier.name}
                      </CardTitle>
                      <CardDescription className="text-gray-100 mt-2">
                        {tier.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mt-4">{tier.price}</div>
                </CardHeader>

                <CardContent className="p-6">
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {tier.current ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={tier.popular ? "default" : "outline"}
                      onClick={() => handleUpgrade(tier.id)}
                    >
                      Upgrade to {tier.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              Need Help Choosing?
            </h3>
            <p className="text-gray-300 mb-4">
              Our support team is here to help you find the perfect tier for your betting needs.
            </p>
            <Button variant="outline">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}