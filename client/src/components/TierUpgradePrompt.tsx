import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { Crown, Star, Zap, Trophy, Diamond, Lock, ArrowRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TierUpgradePromptProps {
  requiredTier: 'silver' | 'gold' | 'platinum' | 'diamond';
  feature: string;
  description: string;
  className?: string;
  compact?: boolean;
}

const tierConfig = {
  silver: {
    name: 'Silver',
    icon: Star,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    requirement: '$500 wagered or 30 days active',
    benefits: ['Player props betting', 'Live score updates', '1% cashback', 'Basic analytics']
  },
  gold: {
    name: 'Gold',
    icon: Crown,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    requirement: '$2,500 wagered or verified account',
    benefits: ['HD live streaming', 'Parlay builder', 'Advanced analytics', '2% cashback']
  },
  platinum: {
    name: 'Platinum',
    icon: Zap,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    requirement: '$10,000 wagered and verified premium',
    benefits: ['Unlimited parlays', 'System management', 'Personal manager', '3% cashback']
  },
  diamond: {
    name: 'Diamond',
    icon: Diamond,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    requirement: '$50,000 wagered and invitation only',
    benefits: ['No bet limits', '4K streaming', 'Custom API access', '5% cashback']
  }
};

export default function TierUpgradePrompt({
  requiredTier,
  feature,
  description,
  className,
  compact = false
}: TierUpgradePromptProps) {
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  
  const tierInfo = tierConfig[requiredTier];
  const TierIcon = tierInfo.icon;
  
  // Mock user progress data - replace with actual user data
  const userProgress = {
    currentTier: 'bronze',
    totalWagered: 245,
    daysActive: 12,
    progressToNext: 49 // percentage
  };

  if (compact) {
    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm cursor-pointer transition-all hover:scale-105",
            tierInfo.bgColor,
            tierInfo.borderColor,
            "border",
            className
          )}>
            <Lock className="h-3 w-3" />
            <span className="font-medium">Requires {tierInfo.name}</span>
            <TierIcon className={cn("h-3 w-3", tierInfo.color)} />
          </div>
        </DialogTrigger>
        <UpgradeDialog 
          tierInfo={tierInfo}
          requiredTier={requiredTier}
          feature={feature}
          description={description}
          userProgress={userProgress}
        />
      </Dialog>
    );
  }

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-lg",
      tierInfo.borderColor,
      "border-2",
      className
    )}>
      <div className={cn("absolute inset-x-0 top-0 h-1", tierInfo.bgColor.replace('bg-', 'bg-gradient-to-r from-'))} />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Unlock {feature}</CardTitle>
          </div>
          <Badge variant="outline" className={cn(tierInfo.color, "font-semibold")}>
            <TierIcon className="h-3 w-3 mr-1" />
            {tierInfo.name} Required
          </Badge>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span>Your Progress to {tierInfo.name}</span>
          <span className="font-medium">{userProgress.progressToNext}%</span>
        </div>
        <Progress value={userProgress.progressToNext} className="h-2" />
        
        <div className="flex gap-2">
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                Learn More
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogTrigger>
            <UpgradeDialog 
              tierInfo={tierInfo}
              requiredTier={requiredTier}
              feature={feature}
              description={description}
              userProgress={userProgress}
            />
          </Dialog>
          
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Track Progress
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UpgradeDialog({ 
  tierInfo, 
  requiredTier, 
  feature, 
  description, 
  userProgress 
}: {
  tierInfo: any;
  requiredTier: string;
  feature: string;
  description: string;
  userProgress: any;
}) {
  const TierIcon = tierInfo.icon;

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <div className="flex items-center gap-2 mb-2">
          <TierIcon className={cn("h-6 w-6", tierInfo.color)} />
          <DialogTitle>Upgrade to {tierInfo.name}</DialogTitle>
        </div>
        <DialogDescription>
          Unlock {feature} and many more premium features
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className={cn("p-4 rounded-lg", tierInfo.bgColor)}>
          <h4 className="font-semibold mb-2">Requirement</h4>
          <p className="text-sm">{tierInfo.requirement}</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">What You'll Get</h4>
          <ul className="space-y-1">
            {tierInfo.benefits.map((benefit: string, index: number) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Your Progress</span>
            <span className="font-medium">{userProgress.progressToNext}% complete</span>
          </div>
          <Progress value={userProgress.progressToNext} className="h-2 mb-2" />
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <span className="block">Total Wagered</span>
              <span className="font-medium">${userProgress.totalWagered}</span>
            </div>
            <div>
              <span className="block">Days Active</span>
              <span className="font-medium">{userProgress.daysActive} days</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1">
            Start Betting to Upgrade
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="outline">
            Learn More
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}