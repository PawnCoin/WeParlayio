import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, Star, Gem, Award } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionBadgeProps {
  showTier?: boolean;
  showSubscription?: boolean;
  showRole?: boolean;
  className?: string;
}

export function PermissionBadge({
  showTier = true,
  showSubscription = true,
  showRole = true,
  className = ''
}: PermissionBadgeProps) {
  const permissions = usePermissions();

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return <Award className="h-3 w-3" />;
      case 'silver': return <Star className="h-3 w-3" />;
      case 'gold': return <Crown className="h-3 w-3" />;
      case 'platinum': return <Gem className="h-3 w-3" />;
      case 'diamond': return <Gem className="h-3 w-3" />;
      default: return <Award className="h-3 w-3" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'bg-amber-600 text-white';
      case 'silver': return 'bg-gray-400 text-white';
      case 'gold': return 'bg-yellow-500 text-white';
      case 'platinum': return 'bg-purple-600 text-white';
      case 'diamond': return 'bg-blue-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-600 text-white';
      case 'moderator': return 'bg-orange-600 text-white';
      case 'vip': return 'bg-purple-600 text-white';
      case 'user': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription.toLowerCase()) {
      case 'wood': return 'bg-amber-700 text-white';
      case 'bronze': return 'bg-amber-600 text-white';
      case 'silver': return 'bg-gray-400 text-white';
      case 'gold': return 'bg-yellow-500 text-white';
      case 'platinum': return 'bg-purple-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showRole && (
        <Badge className={`${getRoleColor(permissions.role)} flex items-center gap-1 text-xs`}>
          <Shield className="h-3 w-3" />
          {permissions.role.charAt(0).toUpperCase() + permissions.role.slice(1)}
        </Badge>
      )}
      
      {showTier && (
        <Badge className={`${getTierColor(permissions.tier)} flex items-center gap-1 text-xs`}>
          {getTierIcon(permissions.tier)}
          {permissions.tier.charAt(0).toUpperCase() + permissions.tier.slice(1)}
        </Badge>
      )}
      
      {showSubscription && permissions.subscription !== 'wood' && (
        <Badge className={`${getSubscriptionColor(permissions.subscription)} flex items-center gap-1 text-xs`}>
          <Star className="h-3 w-3" />
          {permissions.subscription.charAt(0).toUpperCase() + permissions.subscription.slice(1)} Sub
        </Badge>
      )}
    </div>
  );
}

export default PermissionBadge;