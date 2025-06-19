// Tier system for WeParlay platform
export enum SubscriptionTier {
  BRONZE = 'Bronze',
  SILVER = 'Silver', 
  GOLD = 'Gold',
  PLATINUM = 'Platinum'
}

export type TierFeatures = {
  liveStreamingAccess: boolean;
  advancedAnalytics: boolean;
  premiumOdds: boolean;
  vipSupport: boolean;
  customBets: boolean;
  socialFeatures: boolean;
  gamingAccess: boolean;
  tournamentAccess: boolean;
}

const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  [SubscriptionTier.BRONZE]: {
    liveStreamingAccess: false,
    advancedAnalytics: false,
    premiumOdds: false,
    vipSupport: false,
    customBets: false,
    socialFeatures: true,
    gamingAccess: false,
    tournamentAccess: false
  },
  [SubscriptionTier.SILVER]: {
    liveStreamingAccess: true,
    advancedAnalytics: false,
    premiumOdds: true,
    vipSupport: false,
    customBets: false,
    socialFeatures: true,
    gamingAccess: true,
    tournamentAccess: true
  },
  [SubscriptionTier.GOLD]: {
    liveStreamingAccess: true,
    advancedAnalytics: true,
    premiumOdds: true,
    vipSupport: true,
    customBets: true,
    socialFeatures: true,
    gamingAccess: true,
    tournamentAccess: true
  },
  [SubscriptionTier.PLATINUM]: {
    liveStreamingAccess: true,
    advancedAnalytics: true,
    premiumOdds: true,
    vipSupport: true,
    customBets: true,
    socialFeatures: true,
    gamingAccess: true,
    tournamentAccess: true
  }
};

export function canUserAccess(userTier: SubscriptionTier, feature: keyof TierFeatures): boolean {
  return TIER_FEATURES[userTier][feature];
}

export function getTierFeatures(tier: SubscriptionTier): TierFeatures {
  return TIER_FEATURES[tier];
}

export function getRequiredTierForFeature(feature: keyof TierFeatures): SubscriptionTier {
  for (const [tier, features] of Object.entries(TIER_FEATURES)) {
    if (features[feature]) {
      return tier as SubscriptionTier;
    }
  }
  return SubscriptionTier.PLATINUM;
}