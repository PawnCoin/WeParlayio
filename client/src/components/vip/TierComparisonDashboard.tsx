import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Lock, Unlock, Star, Facebook, Twitter, Instagram, LinkedinIcon, Youtube, Award, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import BetConfetti from '../betting/BetConfetti';

interface TierFeature {
  name: string;
  description: string;
  bronzeValue: string | boolean;
  silverValue: string | boolean;
  goldValue: string | boolean;
  platinumValue?: string | boolean;
  icon: React.ReactNode;
}

const TierComparisonDashboard: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const tiers = [
    {
      id: 'bronze',
      name: 'Bronze',
      price: '$9.99',
      period: 'per month',
      color: 'bg-amber-700',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-700',
      hoverColor: 'hover:bg-amber-700/10',
      icon: <Award className="h-5 w-5" />,
      description: 'Get started with enhanced betting features, basic odds boost, and limited voice betting commands (5/day). Includes basic social sharing for Twitter and Facebook.'
    },
    {
      id: 'silver',
      name: 'Silver',
      price: '$19.99',
      period: 'per month',
      color: 'bg-slate-400',
      textColor: 'text-slate-400',
      borderColor: 'border-slate-400',
      hoverColor: 'hover:bg-slate-400/10',
      icon: <Award className="h-5 w-5" />,
      description: 'Unlock premium features with enhanced odds boost, more voice betting commands (20/day), and basic fantasy team sync across platforms.'
    },
    {
      id: 'gold',
      name: 'Gold',
      price: '$49.99',
      period: 'per month',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      borderColor: 'border-yellow-500',
      hoverColor: 'hover:bg-yellow-500/10',
      icon: <Award className="h-5 w-5" />,
      description: 'Full access to premium features, VIP support, maximum odds boost, unlimited voice betting, full fantasy sync, and Yahoo Fantasy integration.'
    },
    {
      id: 'platinum',
      name: 'Platinum',
      price: '$99.99',
      period: 'per month',
      color: 'bg-green-600',
      textColor: 'text-green-600',
      borderColor: 'border-green-600',
      hoverColor: 'hover:bg-green-600/10',
      icon: <Award className="h-5 w-5" />,
      description: 'For serious bettors with exclusive features, dedicated agent support, maximum odds boost (7.5%), auto-betting via Yahoo Fantasy, and exclusive Facebook app integration.'
    }
  ];

  const features: TierFeature[] = [
    {
      name: 'Odds Boost',
      description: 'Get better odds on your bets',
      bronzeValue: '2.5%',
      silverValue: '3.5%',
      goldValue: '5%',
      platinumValue: '7.5%',
      icon: <Star className="h-4 w-4" />
    },
    {
      name: 'Premium Suggestions',
      description: 'AI-powered betting recommendations',
      bronzeValue: '10/month',
      silverValue: '30/month',
      goldValue: 'Unlimited',
      platinumValue: 'Unlimited + Exclusive',
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      name: 'Voice Betting',
      description: 'Place bets using voice commands',
      bronzeValue: '5/day',
      silverValue: '20/day',
      goldValue: 'Unlimited',
      platinumValue: 'Priority Processing',
      icon: <HelpCircle className="h-4 w-4" />
    },
    {
      name: 'Fantasy Team Sync',
      description: 'Sync your fantasy teams across platforms',
      bronzeValue: false,
      silverValue: 'Basic Sync',
      goldValue: 'Full Sync',
      platinumValue: 'Auto-Sync',
      icon: <Star className="h-4 w-4" />
    },
    {
      name: 'Yahoo Fantasy',
      description: 'Integration with Yahoo Fantasy Sports',
      bronzeValue: false,
      silverValue: false,
      goldValue: 'Full Integration',
      platinumValue: 'Auto-Bet',
      icon: <Star className="h-4 w-4" />
    },
    {
      name: 'Facebook Integration',
      description: 'Use and share on Facebook',
      bronzeValue: 'Basic Share',
      silverValue: 'Basic Share',
      goldValue: 'Full Integration',
      platinumValue: 'App Integration',
      icon: <Facebook className="h-4 w-4" />
    },
    {
      name: 'Twitter Integration',
      description: 'Share bets on Twitter',
      bronzeValue: 'Basic Share',
      silverValue: 'Full Integration',
      goldValue: 'Automated Posts',
      platinumValue: 'API Access',
      icon: <Twitter className="h-4 w-4" />
    },
    {
      name: 'Instagram Integration',
      description: 'Share bet slips as Instagram stories',
      bronzeValue: false,
      silverValue: 'Basic Share',
      goldValue: 'Story Templates',
      platinumValue: 'API Access',
      icon: <Instagram className="h-4 w-4" />
    },
    {
      name: 'LinkedIn Integration',
      description: 'For sports betting professionals',
      bronzeValue: false,
      silverValue: false,
      goldValue: 'Basic Share',
      platinumValue: 'Full Integration',
      icon: <LinkedinIcon className="h-4 w-4" />
    },
    {
      name: 'YouTube Integration',
      description: 'Share bet clips and highlights',
      bronzeValue: false,
      silverValue: false,
      goldValue: 'Video Sharing',
      platinumValue: 'Live Streaming',
      icon: <Youtube className="h-4 w-4" />
    },
    {
      name: 'Priority Support',
      description: 'Get help when you need it',
      bronzeValue: false,
      silverValue: 'Email',
      goldValue: 'Chat',
      platinumValue: 'Phone + Dedicated Agent',
      icon: <HelpCircle className="h-4 w-4" />
    }
  ];

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId);
    
    // Trigger confetti for a fun effect
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    
    // Show success toast
    toast({
      title: `${tierId.charAt(0).toUpperCase() + tierId.slice(1)} Tier Selected!`,
      description: "Upgrade to unlock premium betting features.",
    });
  };

  const renderFeatureValue = (value: string | boolean, tier: string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle className="h-5 w-5 text-green-500" />
      ) : (
        <Lock className="h-5 w-5 text-gray-400" />
      );
    }
    
    // Add a badge for the value with tier-specific styling
    const tierColorMap: {[key: string]: string} = {
      bronze: 'bg-amber-700/20 text-amber-700',
      silver: 'bg-slate-400/20 text-slate-400',
      gold: 'bg-yellow-500/20 text-yellow-500',
      platinum: 'bg-green-600/20 text-green-600'
    };
    
    return (
      <Badge variant="outline" className={`${tierColorMap[tier]} border-0`}>
        {value}
      </Badge>
    );
  };

  return (
    <div className="w-full">
      {showConfetti && <BetConfetti />}
      
      <h2 className="text-2xl font-bold mb-6 text-center">VIP Membership Tiers</h2>
      
      {/* Tier Selection Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {tiers.map((tier) => (
          <motion.div
            key={tier.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Button
              variant={selectedTier === tier.id ? "default" : "outline"}
              className={`h-auto min-w-[150px] py-4 px-6 ${
                selectedTier === tier.id 
                  ? tier.color 
                  : `${tier.hoverColor} ${tier.borderColor}`
              }`}
              onClick={() => handleSelectTier(tier.id)}
            >
              <div className="flex flex-col items-center">
                <div className={`text-xl font-bold ${selectedTier === tier.id ? 'text-white' : tier.textColor}`}>
                  {tier.name}
                </div>
                <div className={`text-2xl font-bold mt-1 ${selectedTier === tier.id ? 'text-white' : tier.textColor}`}>
                  {tier.price}
                </div>
                <div className={`text-xs ${selectedTier === tier.id ? 'text-white/80' : 'text-gray-500'}`}>
                  {tier.period}
                </div>
                
                {selectedTier === tier.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-xs text-white"
                  >
                    Selected
                  </motion.div>
                )}
              </div>
            </Button>
            
            {/* Animated stars around the selected tier */}
            {selectedTier === tier.id && (
              <>
                <motion.div
                  className="absolute -top-1 -right-1"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-1 -left-1"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </motion.div>
              </>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Feature Comparison Table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-4 text-left font-medium">Feature</th>
              {tiers.map((tier) => (
                <th key={tier.id} className={`p-4 text-center font-medium ${tier.textColor}`}>
                  {tier.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                <td className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="text-primary">{feature.icon}</div>
                    <div>
                      <div className="font-medium">{feature.name}</div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="text-xs text-muted-foreground underline decoration-dotted">
                              More info
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{feature.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </td>
                <td className="p-4 border-t text-center">
                  {renderFeatureValue(feature.bronzeValue, 'bronze')}
                </td>
                <td className="p-4 border-t text-center">
                  {renderFeatureValue(feature.silverValue, 'silver')}
                </td>
                <td className="p-4 border-t text-center">
                  {renderFeatureValue(feature.goldValue, 'gold')}
                </td>
                <td className="p-4 border-t text-center">
                  {renderFeatureValue(feature.platinumValue || false, 'platinum')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Call to Action */}
      <div className="mt-8 flex justify-center">
        <Button 
          size="lg" 
          className={`px-8 ${selectedTier 
            ? tiers.find(t => t.id === selectedTier)?.color 
            : 'bg-primary'}`}
          disabled={!selectedTier}
        >
          {selectedTier 
            ? `Upgrade to ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}` 
            : 'Select a Tier'}
        </Button>
      </div>
      
      {/* Animated Unlock Effect */}
      {selectedTier && (
        <motion.div 
          className="mt-6 p-4 border rounded-lg bg-muted/30"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <Unlock className="h-5 w-5 text-green-500" />
            <div>
              <h3 className="font-medium">Features Unlocked with {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}</h3>
              <p className="text-sm text-muted-foreground">
                {tiers.find(t => t.id === selectedTier)?.description}
              </p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {features
              .filter(feature => {
                const value = feature[`${selectedTier}Value` as keyof TierFeature];
                return value !== false;
              })
              .map((feature, index) => (
                <motion.div
                  key={index}
                  className="p-3 border rounded-md bg-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-primary">{feature.icon}</div>
                    <div className="font-medium">{feature.name}</div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {typeof feature[`${selectedTier}Value` as keyof TierFeature] === 'string' 
                      ? feature[`${selectedTier}Value` as keyof TierFeature] 
                      : 'Enabled'}
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TierComparisonDashboard;