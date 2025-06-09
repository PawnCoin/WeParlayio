import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, Star, Zap, Shield, Gift, TrendingUp, 
  Check, X, ChevronRight, Sparkles, Diamond
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TierFeature {
  name: string;
  bronze: boolean | string;
  silver: boolean | string;
  gold: boolean | string;
  platinum: boolean | string;
}

const tierFeatures: TierFeature[] = [
  {
    name: 'Live Sports Streaming',
    bronze: false,
    silver: false,
    gold: 'Limited',
    platinum: 'Unlimited HD'
  },
  {
    name: 'Odds Boost',
    bronze: '2%',
    silver: '3.5%',
    gold: '5%',
    platinum: '7.5%'
  },
  {
    name: 'WeParlay Cash Rewards',
    bronze: '1%',
    silver: '2%',
    gold: '3%',
    platinum: '5%'
  },
  {
    name: 'Fantasy Team Sync',
    bronze: false,
    silver: 'Basic',
    gold: 'Advanced',
    platinum: 'Auto-Sync'
  },
  {
    name: 'Voice Betting',
    bronze: '5/day',
    silver: '20/day',
    gold: 'Unlimited',
    platinum: 'Priority Processing'
  },
  {
    name: 'Crypto Withdrawals',
    bronze: '24 hours',
    silver: '12 hours',
    gold: '6 hours',
    platinum: 'Instant'
  },
  {
    name: 'Customer Support',
    bronze: 'Email',
    silver: 'Chat',
    gold: 'Priority Chat',
    platinum: 'Dedicated Agent'
  },
  {
    name: 'Tournament Access',
    bronze: 'Public',
    silver: 'Weekly VIP',
    gold: 'Daily VIP',
    platinum: 'Exclusive Events'
  }
];

const tiers = [
  {
    id: 'bronze',
    name: 'Bronze',
    price: 'Free',
    icon: Shield,
    color: 'bg-amber-600',
    textColor: 'text-amber-600',
    description: 'Get started with basic betting features'
  },
  {
    id: 'silver',
    name: 'Silver',
    price: '$9.99/month',
    icon: Star,
    color: 'bg-gray-400',
    textColor: 'text-gray-600',
    description: 'Enhanced odds and better rewards'
  },
  {
    id: 'gold',
    name: 'Gold',
    price: '$19.99/month',
    icon: Crown,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    description: 'Premium features and priority support'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: '$39.99/month',
    icon: Diamond,
    color: 'bg-purple-600',
    textColor: 'text-purple-600',
    description: 'Ultimate experience with exclusive access',
    popular: true
  }
];

export default function TierComparison() {
  const [selectedTier, setSelectedTier] = useState<string | null>('platinum');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleUpgrade = async (tierName: string) => {
    if (tierName === 'bronze') {
      toast({
        title: "Already Active",
        description: "You're currently on the Bronze tier.",
      });
      return;
    }

    toast({
      title: "Processing Upgrade",
      description: `Upgrading to ${tierName}...`,
    });

    try {
      // Navigate to Stripe checkout for the selected tier
      setLocation(`/checkout?tier=${tierName}`);
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const renderFeatureValue = (value: boolean | string, tier: string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-gray-400 mx-auto" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            className="text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Choose Your <span className="text-yellow-400">WeParlay</span> Tier
          </motion.h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Unlock premium features, enhanced odds, and exclusive access to live streaming
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tiers.map((tier, index) => {
            const TierIcon = tier.icon;
            const isSelected = selectedTier === tier.id;
            
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${tier.popular ? 'transform scale-105' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-500 text-black font-bold px-4 py-1">
                      <Sparkles className="h-3 w-3 mr-1" />
                      POPULAR
                    </Badge>
                  </div>
                )}
                
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                    isSelected 
                      ? 'border-yellow-400 shadow-xl shadow-yellow-400/20' 
                      : 'border-gray-700 hover:border-gray-600'
                  } bg-gray-800/50 backdrop-blur-sm`}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  <CardHeader className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${tier.color} mb-4 mx-auto`}>
                      <TierIcon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">{tier.name}</CardTitle>
                    <div className="text-2xl font-bold text-yellow-400">{tier.price}</div>
                    <p className="text-gray-400 text-sm">{tier.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <Button 
                      className={`w-full ${isSelected ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpgrade(tier.id);
                      }}
                    >
                      {tier.id === 'bronze' ? 'Current Plan' : `Upgrade to ${tier.name}`}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center text-2xl">Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-white font-semibold">Features</th>
                    {tiers.map(tier => (
                      <th key={tier.id} className="text-center py-4 px-4">
                        <div className="flex flex-col items-center">
                          <span className="text-white font-semibold">{tier.name}</span>
                          <span className="text-sm text-gray-400">{tier.price}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tierFeatures.map((feature, index) => (
                    <tr key={index} className="border-b border-gray-700/50">
                      <td className="py-4 px-4 text-white font-medium">{feature.name}</td>
                      <td className="py-4 px-4 text-center">
                        {renderFeatureValue(feature.bronze, 'bronze')}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {renderFeatureValue(feature.silver, 'silver')}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {renderFeatureValue(feature.gold, 'gold')}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {renderFeatureValue(feature.platinum, 'platinum')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <Button 
            onClick={() => setLocation('/')}
            variant="outline"
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}