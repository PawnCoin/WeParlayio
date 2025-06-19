import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Star, Zap } from 'lucide-react';

export default function UpgradeTier() {
  const [selectedTier, setSelectedTier] = useState<string>('gold');

  const tiers = [
    {
      id: 'bronze',
      name: 'Bronze',
      price: 'Free',
      description: 'Basic betting features',
      features: [
        'Basic bet placement',
        'Standard odds viewing',
        'Community access (limited)',
        'Mobile app access'
      ],
      color: 'from-amber-600 to-amber-800',
      icon: Crown,
      current: true
    },
    {
      id: 'gold',
      name: 'Gold',
      price: '$9.99/month',
      description: 'Enhanced betting experience',
      features: [
        'All Bronze features',
        'Advanced analytics',
        'Priority customer support',
        'User directory access',
        'Friend messaging',
        'Exclusive tournaments',
        'Live score notifications'
      ],
      color: 'from-yellow-400 to-yellow-600',
      icon: Star,
      popular: true
    },
    {
      id: 'platinum',
      name: 'Platinum',
      price: '$19.99/month',
      description: 'Premium features for serious bettors',
      features: [
        'All Gold features',
        'VIP tournaments',
        'Personal betting advisor',
        'Advanced statistics',
        'Early access to new features',
        'Custom bet alerts',
        'Priority live chat',
        'Exclusive events'
      ],
      color: 'from-purple-500 to-purple-700',
      icon: Zap
    }
  ];

  const handleUpgrade = (tierId: string) => {
    // Redirect to payment processing
    window.location.href = `/payment?tier=${tierId}`;
  };

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
                    {tier.features.map((feature, index) => (
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