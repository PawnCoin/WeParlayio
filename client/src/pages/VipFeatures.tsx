import React, { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import BetConfetti from "@/components/betting/BetConfetti";
import TierComparisonDashboard from "@/components/vip/TierComparisonDashboard";
import ValueCalculator from "@/components/vip/ValueCalculator";
import { 
  Crown, Star, Gift, Clock, Zap, Users, DollarSign, Check, 
  ArrowRight, ChevronRight, Trophy, BadgePercent, 
  Bookmark, CalendarClock, Gauge, Lock, ArrowUpRight, Sparkles,
  Lightbulb, BarChart3, RotateCw, CircleDollarSign, Gem, UserCog, 
  Bolt
} from "lucide-react";

interface VipTier {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  minPoints: number;
  benefits: string[];
  isActive: boolean;
}

interface ExclusivePerk {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isUnlocked: boolean;
  requiredTier: string;
}

interface CustomBetOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isAvailable: boolean;
  requiredTier: string;
}

const VipFeatures: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Mock VIP data
  const [vipData, setVipData] = useState({
    points: 8500,
    totalPointsNeeded: 10000,
    currentTier: 'gold',
    nextTier: 'platinum',
    weeklyBonusUnlocked: true,
    referralCount: 7,
    earlyAccessEnabled: true,
    customOddsFormat: 'american',
    boostTokens: 5,
    lastReward: '2 days ago',
    streakDays: 12,
    vipSince: 'March 12, 2025',
  });
  
  const tiers: VipTier[] = [
    {
      id: 'bronze',
      name: 'Bronze',
      icon: <Trophy className="h-6 w-6" />,
      color: 'bg-amber-700',
      minPoints: 0,
      benefits: [
        '5% Boost on Parlay Bets',
        'Exclusive Weekly Promotions',
        'Birthday Bonus'
      ],
      isActive: vipData.currentTier === 'bronze',
    },
    {
      id: 'silver',
      name: 'Silver',
      icon: <Badge className="h-6 w-6" />,
      color: 'bg-gray-400',
      minPoints: 2500,
      benefits: [
        '10% Boost on Parlay Bets',
        'Early Access to New Features',
        'Reduced Minimum Bet Requirements',
        'Monthly Loyalty Reward'
      ],
      isActive: vipData.currentTier === 'silver',
    },
    {
      id: 'gold',
      name: 'Gold',
      icon: <Star className="h-6 w-6" />,
      color: 'bg-amber-500',
      minPoints: 5000,
      benefits: [
        '15% Boost on Parlay Bets',
        'Custom Betting Options',
        'Priority Customer Support',
        'Weekly Free Bet',
        'Exclusive Tournaments'
      ],
      isActive: vipData.currentTier === 'gold',
    },
    {
      id: 'platinum',
      name: 'Platinum',
      icon: <Sparkles className="h-6 w-6" />,
      color: 'bg-blue-400',
      minPoints: 10000,
      benefits: [
        '20% Boost on All Bets',
        'VIP Personal Account Manager',
        'Exclusive VIP Events',
        'Maximum Deposit Limit Increase',
        'Customized Betting Experience',
        'Profit Boost Tokens'
      ],
      isActive: vipData.currentTier === 'platinum',
    },
    {
      id: 'diamond',
      name: 'Diamond',
      icon: <Gem className="h-6 w-6" />,
      color: 'bg-purple-500',
      minPoints: 25000,
      benefits: [
        '25% Boost on All Bets',
        'Diamond-Exclusive Bets',
        'Bespoke Betting Service',
        'Concierge Service',
        'VIP Travel Benefits',
        'Custom Bet Building',
        'Exclusive Prediction Data'
      ],
      isActive: vipData.currentTier === 'diamond',
    }
  ];
  
  const exclusivePerks: ExclusivePerk[] = [
    {
      id: 'early-access',
      name: 'Early Access Betting',
      description: 'Access betting markets before they are available to the public',
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      isUnlocked: true,
      requiredTier: 'silver'
    },
    {
      id: 'custom-bets',
      name: 'Custom Bet Builder',
      description: 'Create your own personalized bets beyond the standard options',
      icon: <UserCog className="h-5 w-5 text-amber-500" />,
      isUnlocked: true,
      requiredTier: 'gold'
    },
    {
      id: 'profit-boost',
      name: 'Profit Boost Tokens',
      description: 'Apply profit boosts to any bet of your choice',
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      isUnlocked: true,
      requiredTier: 'gold'
    },
    {
      id: 'private-pools',
      name: 'Private Betting Pools',
      description: 'Create exclusive betting pools with invitation-only access',
      icon: <Users className="h-5 w-5 text-amber-500" />,
      isUnlocked: true,
      requiredTier: 'gold'
    },
    {
      id: 'vip-tournaments',
      name: 'VIP Tournaments',
      description: 'Access to high-stakes tournaments with exclusive prizes',
      icon: <Trophy className="h-5 w-5 text-blue-500" />,
      isUnlocked: false,
      requiredTier: 'platinum'
    },
    {
      id: 'odds-negotiation',
      name: 'Odds Negotiation',
      description: 'Ability to negotiate better odds for certain high-value bets',
      icon: <BadgePercent className="h-5 w-5 text-blue-500" />,
      isUnlocked: false,
      requiredTier: 'platinum'
    },
    {
      id: 'personalized-insights',
      name: 'AI Betting Insights',
      description: 'Personalized AI-powered betting insights and recommendations',
      icon: <Lightbulb className="h-5 w-5 text-blue-500" />,
      isUnlocked: false,
      requiredTier: 'platinum'
    },
    {
      id: 'enhanced-cashout',
      name: 'Enhanced Cashout Options',
      description: 'Better cashout values and more flexible cashout timing',
      icon: <CircleDollarSign className="h-5 w-5 text-purple-500" />,
      isUnlocked: false,
      requiredTier: 'diamond'
    },
    {
      id: 'pro-analytics',
      name: 'Professional Analytics Suite',
      description: 'Access to professional-grade betting analytics and data',
      icon: <BarChart3 className="h-5 w-5 text-purple-500" />,
      isUnlocked: false,
      requiredTier: 'diamond'
    }
  ];
  
  const customBetOptions: CustomBetOption[] = [
    {
      id: 'player-performance',
      name: 'Player Performance Package',
      description: 'Custom bets on detailed player stats and performances',
      icon: <Gauge className="h-5 w-5" />,
      isAvailable: true,
      requiredTier: 'gold'
    },
    {
      id: 'multi-sport',
      name: 'Multi-Sport Parlay Builder',
      description: 'Create parlays combining different sports and leagues',
      icon: <RotateCw className="h-5 w-5" />,
      isAvailable: true,
      requiredTier: 'gold'
    },
    {
      id: 'time-specific',
      name: 'Time-Specific Bets',
      description: 'Place bets on specific time periods during events',
      icon: <CalendarClock className="h-5 w-5" />,
      isAvailable: true,
      requiredTier: 'gold'
    },
    {
      id: 'special-events',
      name: 'Special Events Package',
      description: 'Bet on non-standard events like drafts, trades, and awards',
      icon: <Bookmark className="h-5 w-5" />,
      isAvailable: true,
      requiredTier: 'gold'
    },
    {
      id: 'custom-props',
      name: 'Custom Props Studio',
      description: 'Create completely custom proposition bets',
      icon: <Lightbulb className="h-5 w-5" />,
      isAvailable: false,
      requiredTier: 'platinum'
    },
    {
      id: 'scenario-builder',
      name: 'Scenario Builder',
      description: 'Create complex if-then scenario bets across multiple events',
      icon: <Bolt className="h-5 w-5" />,
      isAvailable: false,
      requiredTier: 'platinum'
    }
  ];
  
  const handleClaimReward = async () => {
    try {
      // Make actual API call to claim reward
      const response = await fetch('/api/vip/claim-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardType: 'weekly' })
      });
      
      if (response.ok) {
        setShowConfetti(true);
        
        toast({
          title: "Weekly VIP Reward Claimed!",
          description: "You've received a $50 free bet token and 500 VIP points.",
        });
        
        setVipData({
          ...vipData,
          points: vipData.points + 500
        });
        
        setTimeout(() => {
          setShowConfetti(false);
        }, 3000);
      } else {
        toast({
          title: "Claim Failed",
          description: "Unable to claim reward at this time. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Reward claim failed:', error);
      toast({
        title: "Error",
        description: "Network error. Please check your connection.",
        variant: "destructive"
      });
    }
  };
  
  const handleEnableEarlyAccess = (enabled: boolean) => {
    setVipData({
      ...vipData,
      earlyAccessEnabled: enabled
    });
    
    toast({
      title: enabled ? "Early Access Enabled" : "Early Access Disabled",
      description: enabled ? "You'll now see events before they're available to everyone." : "You'll no longer see early access events.",
    });
  };
  
  const handleOddsFormatChange = (format: string) => {
    setVipData({
      ...vipData,
      customOddsFormat: format
    });
    
    toast({
      title: "Odds Format Updated",
      description: `Your default odds format is now set to ${format}.`,
    });
  };
  
  const getCurrentTierIndex = () => {
    return tiers.findIndex(tier => tier.id === vipData.currentTier);
  };
  
  const getNextTierPoints = () => {
    const currentTierIndex = getCurrentTierIndex();
    if (currentTierIndex < tiers.length - 1) {
      return tiers[currentTierIndex + 1].minPoints;
    }
    return tiers[currentTierIndex].minPoints;
  };
  
  const getProgressToNextTier = () => {
    const currentTierIndex = getCurrentTierIndex();
    if (currentTierIndex < tiers.length - 1) {
      const currentPoints = vipData.points;
      const currentTierMinPoints = tiers[currentTierIndex].minPoints;
      const nextTierMinPoints = tiers[currentTierIndex + 1].minPoints;
      
      return Math.round(((currentPoints - currentTierMinPoints) / (nextTierMinPoints - currentTierMinPoints)) * 100);
    }
    return 100;
  };
  
  if (!isAuthenticated) {
    return (
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Crown className="h-8 w-8 mr-2 text-yellow-500" />
              VIP Features
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Exclusive benefits and features for our valued VIP members
            </p>
          </div>
          
          <Card className="border-amber-200 dark:border-amber-900 shadow-md">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-t-lg border-b border-amber-100 dark:border-amber-900">
              <Lock className="h-12 w-12 mx-auto mb-2 text-amber-500" />
              <CardTitle className="text-center text-amber-800 dark:text-amber-200">VIP Access Required</CardTitle>
              <CardDescription className="text-center text-amber-700 dark:text-amber-300">
                Please log in to access exclusive VIP features
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-4 flex flex-col items-center">
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Join our VIP program to unlock exclusive betting features, bonuses, and personalized services!
              </p>
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
                  Log in to Access VIP Features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.slice(0, 3).map((tier) => (
              <Card key={tier.id} className="overflow-hidden">
                <CardHeader className={`${tier.color} text-white`}>
                  <div className="flex justify-center">
                    {tier.icon}
                  </div>
                  <CardTitle className="text-center">{tier.name} Tier</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="font-medium mb-2">Benefits:</p>
                  <ul className="space-y-1">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-green-500" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      {showConfetti && <BetConfetti />}
      
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Crown className="h-8 w-8 mr-2 text-yellow-500" />
            VIP Features
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Exclusive benefits and features for our valued VIP members
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="col-span-2 shadow-md">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-b border-amber-100 dark:border-amber-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Your VIP Status
                </CardTitle>
                <CardDescription>
                  Current tier and progress
                </CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-500 text-white font-medium py-1">
                {tiers.find(t => t.id === vipData.currentTier)?.name} Member
              </Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    {tiers.find(t => t.id === vipData.currentTier)?.icon}
                    <span className="ml-2 font-medium">{tiers.find(t => t.id === vipData.currentTier)?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                    <div className="flex items-center">
                      {tiers.find(t => t.id === tiers[Math.min(getCurrentTierIndex() + 1, tiers.length - 1)].id)?.icon}
                      <span className="ml-2 font-medium">{tiers.find(t => t.id === tiers[Math.min(getCurrentTierIndex() + 1, tiers.length - 1)].id)?.name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-1">
                  <Progress value={getProgressToNextTier()} className="h-2" />
                </div>
                
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{vipData.points} points</span>
                  <span>{getNextTierPoints()} points needed for next tier</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">VIP Since</p>
                  <p className="font-medium">{vipData.vipSince}</p>
                </div>
                
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
                  <p className="font-medium">{vipData.streakDays} days</p>
                </div>
                
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Boost Tokens</p>
                  <p className="font-medium">{vipData.boostTokens} available</p>
                </div>
                
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Referrals</p>
                  <p className="font-medium">{vipData.referralCount} friends joined</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-b border-amber-100 dark:border-amber-800">
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2 text-yellow-500" />
                VIP Rewards
              </CardTitle>
              <CardDescription>
                Exclusive bonuses and gifts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 p-4 bg-amber-50 dark:bg-amber-950/20">
                  <h3 className="font-medium mb-1 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                    Weekly VIP Reward
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Your weekly reward is ready to claim!
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                    onClick={handleClaimReward}
                  >
                    Claim Now
                  </Button>
                </div>
                
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="font-medium mb-1">Upcoming Rewards</h3>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-sm">Monthly Cashback</span>
                      </div>
                      <span className="text-xs text-gray-500">In 5 days</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-purple-500" />
                        <span className="text-sm">Odds Boost Token</span>
                      </div>
                      <span className="text-xs text-gray-500">In 7 days</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm">VIP Tournament Entry</span>
                      </div>
                      <span className="text-xs text-gray-500">In 14 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="exclusive-perks" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="exclusive-perks" className="flex items-center justify-center">
              <Star className="h-4 w-4 mr-2" />
              Exclusive Perks
            </TabsTrigger>
            <TabsTrigger value="custom-bets" className="flex items-center justify-center">
              <Zap className="h-4 w-4 mr-2" />
              Custom Betting
            </TabsTrigger>
            <TabsTrigger value="vip-settings" className="flex items-center justify-center">
              <UserCog className="h-4 w-4 mr-2" />
              VIP Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="exclusive-perks">
            <Card>
              <CardHeader>
                <CardTitle>Exclusive VIP Perks</CardTitle>
                <CardDescription>
                  Special features and benefits unlocked with your VIP status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {exclusivePerks.map((perk) => {
                    const tierIndex = tiers.findIndex(t => t.id === perk.requiredTier);
                    const currentTierIndex = getCurrentTierIndex();
                    const isLocked = tierIndex > currentTierIndex;
                    
                    return (
                      <motion.div
                        key={perk.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`rounded-lg border p-4 ${
                          isLocked
                            ? 'border-gray-200 dark:border-gray-700'
                            : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className={isLocked ? 'text-gray-400' : ''}>
                              {perk.icon}
                            </div>
                            <h3 className={`ml-2 font-medium ${isLocked ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                              {perk.name}
                            </h3>
                          </div>
                          {isLocked && (
                            <Lock className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <p className={`text-sm mb-2 ${isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                          {perk.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            {tiers.find(t => t.id === perk.requiredTier)?.icon}
                            <span className={`ml-1 text-xs ${isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                              {tiers.find(t => t.id === perk.requiredTier)?.name} tier required
                            </span>
                          </div>
                          {!isLocked && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8"
                              onClick={() => {
                                toast({
                                  title: `${perk.name} Activated`,
                                  description: "You're now using this exclusive VIP feature.",
                                });
                              }}
                            >
                              Use Now
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="custom-bets">
            <Card>
              <CardHeader>
                <CardTitle>Custom Betting Options</CardTitle>
                <CardDescription>
                  Create personalized bets with VIP-only options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {customBetOptions.map((option) => {
                    const tierIndex = tiers.findIndex(t => t.id === option.requiredTier);
                    const currentTierIndex = getCurrentTierIndex();
                    const isLocked = tierIndex > currentTierIndex;
                    
                    return (
                      <div 
                        key={option.id}
                        className={`rounded-lg border p-4 ${
                          isLocked
                            ? 'border-gray-200 dark:border-gray-700'
                            : 'border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/10'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-md ${isLocked ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'}`}>
                              {option.icon}
                            </div>
                            <h3 className={`ml-2 font-medium ${isLocked ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                              {option.name}
                            </h3>
                          </div>
                          {isLocked && (
                            <Lock className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <p className={`text-sm mb-3 ${isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                          {option.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {tiers.find(t => t.id === option.requiredTier)?.icon}
                            <span className={`ml-1 text-xs ${isLocked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                              {tiers.find(t => t.id === option.requiredTier)?.name} tier
                            </span>
                          </div>
                          {!isLocked && (
                            <Button 
                              size="sm"
                              className={`h-8 ${
                                option.id === 'player-performance' 
                                  ? 'bg-blue-600 hover:bg-blue-700' 
                                  : ''
                              }`}
                              onClick={() => {
                                toast({
                                  title: `${option.name} Selected`,
                                  description: "Opening custom bet builder with this option.",
                                });
                              }}
                            >
                              Build Bet
                              <ArrowUpRight className="ml-1 h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-8 p-4 border border-amber-200 dark:border-amber-900 rounded-lg bg-amber-50 dark:bg-amber-950/10">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <Bolt className="h-5 w-5 mr-2 text-amber-500" />
                    Custom Request Bet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    As a VIP member, you can request a completely custom bet that's not available on our platform.
                    Our VIP betting specialists will review your request and create a custom market for you.
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-bet-desc">Describe your bet</Label>
                      <Input 
                        id="custom-bet-desc" 
                        placeholder="E.g., Total assists by Steph Curry and LeBron James combined in the 3rd quarter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom-bet-stake">Your preferred stake</Label>
                      <Input 
                        id="custom-bet-stake" 
                        placeholder="Amount to bet"
                        type="number"
                      />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
                      Submit Custom Bet Request
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="membership-tiers">
            <Card>
              <CardHeader>
                <CardTitle>VIP Membership Tiers</CardTitle>
                <CardDescription>
                  Compare membership options and unlock premium features
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <TierComparisonDashboard />
                
                <div className="mt-10">
                  <h3 className="text-xl font-bold mb-4">Calculate Your VIP Value</h3>
                  <p className="text-muted-foreground mb-6">
                    See how much value you'll get from your membership based on your betting habits.
                  </p>
                  <ValueCalculator />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vip-settings">
            <Card>
              <CardHeader>
                <CardTitle>VIP Settings</CardTitle>
                <CardDescription>
                  Customize your VIP experience preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Display Preferences</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="early-access">Early Access Events</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Show events before they're available to all users
                          </p>
                        </div>
                        <Switch 
                          id="early-access"
                          checked={vipData.earlyAccessEnabled}
                          onCheckedChange={handleEnableEarlyAccess}
                        />
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-3">
                        <Label htmlFor="odds-format">Default Odds Format</Label>
                        <RadioGroup 
                          id="odds-format" 
                          value={vipData.customOddsFormat}
                          onValueChange={handleOddsFormatChange}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="american" id="american" />
                            <Label htmlFor="american">American (+300)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="decimal" id="decimal" />
                            <Label htmlFor="decimal">Decimal (4.00)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fractional" id="fractional" />
                            <Label htmlFor="fractional">Fractional (3/1)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="probability" id="probability" />
                            <Label htmlFor="probability">Probability (25%)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notification Preferences</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="vip-promos">VIP Promotions</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Get notified about exclusive VIP offers
                          </p>
                        </div>
                        <Switch id="vip-promos" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="tier-up">Tier Progression</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Get notified when you're close to reaching the next tier
                          </p>
                        </div>
                        <Switch id="tier-up" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="reward-ready">Rewards Available</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Get notified when you have new rewards to claim
                          </p>
                        </div>
                        <Switch id="reward-ready" defaultChecked />
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">VIP Account Management</h3>
                      
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <h4 className="font-medium mb-2">Your VIP Account Manager</h4>
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 mr-4">
                            <img 
                              src="https://i.pravatar.cc/100?img=33" 
                              alt="Account Manager" 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">Michael Thompson</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Available Mon-Fri, 9am-5pm ET</p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <Button variant="outline" className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                              <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                            </svg>
                            Chat
                          </Button>
                          <Button variant="outline" className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                              <path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/>
                            </svg>
                            Call
                          </Button>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        Request VIP Concierge Support
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="grid md:grid-cols-5 gap-4">
          {tiers.map((tier) => (
            <motion.div
              key={tier.id}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`h-full ${
                  tier.isActive 
                    ? 'border-amber-300 dark:border-amber-800 shadow-lg' 
                    : ''
                }`}
              >
                <CardHeader className={`${tier.color} text-white`}>
                  <div className="flex justify-center">
                    {tier.icon}
                  </div>
                  <CardTitle className="text-center">{tier.name}</CardTitle>
                  <CardDescription className="text-center text-white text-opacity-80">
                    {tier.minPoints} points
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="font-medium mb-2">Benefits:</p>
                  <ul className="space-y-1">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-green-500" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {tier.isActive ? (
                    <Badge className="w-full justify-center text-center py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 hover:bg-amber-100 hover:text-amber-800">
                      Current Tier
                    </Badge>
                  ) : getCurrentTierIndex() > tiers.findIndex(t => t.id === tier.id) ? (
                    <Badge className="w-full justify-center text-center py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 hover:bg-green-100 hover:text-green-800">
                      Already Unlocked
                    </Badge>
                  ) : (
                    <Badge className="w-full justify-center text-center py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-100 hover:text-gray-800">
                      {tier.minPoints - vipData.points} points needed
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VipFeatures;