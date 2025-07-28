import { useAuth } from './useAuth';

export interface UserPermissions {
  canAccessAdmin: boolean;
  canModerate: boolean;
  canAccessVipFeatures: boolean;
  canAccessPremiumContent: boolean;
  canPlaceBets: boolean;
  canAccessLiveStreaming: boolean;
  canAccessAdvancedAnalytics: boolean;
  canManageUsers: boolean;
  canViewSystemStatus: boolean;
  canPostToSocialMedia: boolean;
  tier: string;
  subscription: string;
  role: string;
}

export function usePermissions(): UserPermissions {
  const { user, isAuthenticated } = useAuth();

  // Default permissions for non-authenticated users
  if (!isAuthenticated || !user) {
    return {
      canAccessAdmin: false,
      canModerate: false,
      canAccessVipFeatures: false,
      canAccessPremiumContent: false,
      canPlaceBets: false,
      canAccessLiveStreaming: false,
      canAccessAdvancedAnalytics: false,
      canManageUsers: false,
      canViewSystemStatus: false,
      canPostToSocialMedia: false,
      tier: 'bronze',
      subscription: 'wood',
      role: 'guest'
    };
  }

  const userTier = (user as any).tier || 'bronze';
  const userSubscription = (user as any).subscriptionTier || 'wood';
  const userRole = (user as any).role || 'user';
  const isAdmin = (user as any).isAdmin || userRole === 'admin';

  // Tier-based permissions
  const tierPermissions = {
    bronze: {
      canAccessVipFeatures: false,
      canAccessPremiumContent: false,
      canAccessAdvancedAnalytics: false
    },
    silver: {
      canAccessVipFeatures: true,
      canAccessPremiumContent: false,
      canAccessAdvancedAnalytics: false
    },
    gold: {
      canAccessVipFeatures: true,
      canAccessPremiumContent: true,
      canAccessAdvancedAnalytics: true
    },
    platinum: {
      canAccessVipFeatures: true,
      canAccessPremiumContent: true,
      canAccessAdvancedAnalytics: true
    },
    diamond: {
      canAccessVipFeatures: true,
      canAccessPremiumContent: true,
      canAccessAdvancedAnalytics: true
    }
  };

  // Subscription-based permissions
  const subscriptionPermissions = {
    wood: {
      canAccessLiveStreaming: false
    },
    bronze: {
      canAccessLiveStreaming: true
    },
    silver: {
      canAccessLiveStreaming: true
    },
    gold: {
      canAccessLiveStreaming: true
    },
    platinum: {
      canAccessLiveStreaming: true
    }
  };

  const currentTierPerms = tierPermissions[userTier as keyof typeof tierPermissions] || tierPermissions.bronze;
  const currentSubPerms = subscriptionPermissions[userSubscription as keyof typeof subscriptionPermissions] || subscriptionPermissions.wood;

  return {
    canAccessAdmin: isAdmin,
    canModerate: isAdmin || userRole === 'moderator',
    canAccessVipFeatures: currentTierPerms.canAccessVipFeatures || isAdmin,
    canAccessPremiumContent: currentTierPerms.canAccessPremiumContent || isAdmin,
    canPlaceBets: isAuthenticated,
    canAccessLiveStreaming: currentSubPerms.canAccessLiveStreaming || isAdmin,
    canAccessAdvancedAnalytics: currentTierPerms.canAccessAdvancedAnalytics || isAdmin,
    canManageUsers: isAdmin,
    canViewSystemStatus: isAdmin,
    canPostToSocialMedia: isAdmin,
    tier: userTier,
    subscription: userSubscription,
    role: userRole
  };
}

export default usePermissions;