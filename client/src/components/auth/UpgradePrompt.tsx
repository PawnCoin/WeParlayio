import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Star, Gem, ArrowRight } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface UpgradePromptProps {
  requiredTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requiredSubscription?: 'wood' | 'bronze' | 'silver' | 'gold' | 'platinum';
  featureName: string;
  description?: string;
  className?: string;
}

export function UpgradePrompt({
  requiredTier,
  requiredSubscription,
  featureName,
  description,
  className = ''
}: UpgradePromptProps) {
  const permissions = usePermissions();

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'silver': return <Star className="h-4 w-4" />;
      case 'gold': return <Crown className="h-4 w-4" />;
      case 'platinum': return <Gem className="h-4 w-4" />;
      case 'diamond': return <Gem className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'silver': return 'border-gray-400 bg-gray-50';
      case 'gold': return 'border-yellow-500 bg-yellow-50';
      case 'platinum': return 'border-purple-600 bg-purple-50';
      case 'diamond': return 'border-blue-600 bg-blue-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const handleUpgrade = () => {
    // Navigate to upgrade page
    window.location.href = '/upgrade';
  };

  const upgradeTarget = requiredTier || requiredSubscription || 'premium';

  return (
    <Card className={`${getTierColor(upgradeTarget)} ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-full bg-white shadow-sm">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          {getTierIcon(upgradeTarget)}
          Premium Feature Locked
        </CardTitle>
        <CardDescription>
          Upgrade to access {featureName}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {description && (
          <p className="text-sm text-muted-foreground text-center">
            {description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Current Plan:</p>
            <Badge variant="outline">
              {permissions.tier.charAt(0).toUpperCase() + permissions.tier.slice(1)}
            </Badge>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Required Plan:</p>
            <Badge className={getTierColor(upgradeTarget).includes('yellow') ? 'bg-yellow-500 text-white' : 
                             getTierColor(upgradeTarget).includes('purple') ? 'bg-purple-600 text-white' :
                             getTierColor(upgradeTarget).includes('blue') ? 'bg-blue-600 text-white' :
                             'bg-gray-400 text-white'}>
              {upgradeTarget.charAt(0).toUpperCase() + upgradeTarget.slice(1)}
            </Badge>
          </div>
        </div>
        
        <Button 
          onClick={handleUpgrade}
          className="w-full"
          size="sm"
        >
          {getTierIcon(upgradeTarget)}
          Upgrade to {upgradeTarget.charAt(0).toUpperCase() + upgradeTarget.slice(1)}
        </Button>
      </CardContent>
    </Card>
  );
}

export default UpgradePrompt;