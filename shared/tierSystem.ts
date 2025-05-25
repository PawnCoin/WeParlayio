// Subscription tier definitions for WeParlay
export enum SubscriptionTier {
  WOOD = 'wood',
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum'
}

export interface TierFeatures {
  name: string;
  isDefault: boolean;
  isFree: boolean;
  featureSet: {
    // Betting features
    headToHeadRealMoney: boolean;
    headToHeadVirtual: boolean;
    parlayCash: boolean;
    parlayVirtual: boolean;
    tournamentParticipation: boolean;
    maxBetAmount: number;
    
    // Content access features
    liveOddsAccess: boolean;
    statsAccess: boolean;
    advancedStatsAccess: boolean;
    predictionEngineAccess: boolean;
    
    // Social features 
    createGroups: boolean;
    joinGroups: boolean;
    customGamertag: boolean; // Premium feature for Bronze+
    customBets: boolean; // Create custom betting challenges
    maxInvites: number;
    smsNotifications: boolean;
    
    // Platform features
    supportPriority: 'standard' | 'priority' | 'vip';
    withdrawalFeeDiscount: number; // percentage
    weeklyBonus: number; // WeParlay cash amount
    
    // Other
    customizationOptions: boolean;
    betProtection: boolean;
    maxOpenBets: number;
  }
}

export const tierFeatures: Record<SubscriptionTier, TierFeatures> = {
  [SubscriptionTier.WOOD]: {
    name: 'Wood Tier',
    isDefault: true,
    isFree: true,
    featureSet: {
      // Betting features - limited for free tier
      headToHeadRealMoney: true,
      headToHeadVirtual: true,
      parlayCash: false,
      parlayVirtual: true,
      tournamentParticipation: false,
      maxBetAmount: 50, // Real money max bet
      
      // Content access features - basic access only
      liveOddsAccess: true,
      statsAccess: true,
      advancedStatsAccess: false,
      predictionEngineAccess: false,
      
      // Social features - minimal
      createGroups: false,
      joinGroups: true,
      customGamertag: false, // Premium feature for paid members only
      customBets: false, // Premium feature for paid members only
      maxInvites: 5,
      smsNotifications: false,
      
      // Platform features - standard
      supportPriority: 'standard',
      withdrawalFeeDiscount: 0,
      weeklyBonus: 100, // Small weekly bonus in WeParlay cash
      
      // Other - minimal
      customizationOptions: false,
      betProtection: false,
      maxOpenBets: 3
    }
  },
  [SubscriptionTier.BRONZE]: {
    name: 'Bronze Tier',
    isDefault: false,
    isFree: false,
    featureSet: {
      // Betting features
      headToHeadRealMoney: true,
      headToHeadVirtual: true,
      parlayCash: true,
      parlayVirtual: true,
      tournamentParticipation: true,
      maxBetAmount: 200,
      
      // Content access features
      liveOddsAccess: true,
      statsAccess: true,
      advancedStatsAccess: false,
      predictionEngineAccess: false,
      
      // Social features
      createGroups: true,
      joinGroups: true,
      customGamertag: true, // Available for Bronze+ paid members
      customBets: true, // Create custom betting challenges for Bronze+
      maxInvites: 10,
      smsNotifications: false,
      
      // Platform features
      supportPriority: 'standard',
      withdrawalFeeDiscount: 5, // 5% discount on withdrawal fees
      weeklyBonus: 250,
      
      // Other
      customizationOptions: true,
      betProtection: false,
      maxOpenBets: 5
    }
  },
  [SubscriptionTier.SILVER]: {
    name: 'Silver Tier',
    isDefault: false,
    isFree: false,
    featureSet: {
      // Betting features
      headToHeadRealMoney: true,
      headToHeadVirtual: true,
      parlayCash: true,
      parlayVirtual: true,
      tournamentParticipation: true,
      maxBetAmount: 500,
      
      // Content access features
      liveOddsAccess: true,
      statsAccess: true,
      advancedStatsAccess: true,
      predictionEngineAccess: false,
      
      // Social features
      createGroups: true,
      joinGroups: true,
      customGamertag: true, // Available for Silver+ members
      customBets: true, // Create custom betting challenges
      maxInvites: 20,
      smsNotifications: true,
      
      // Platform features
      supportPriority: 'priority',
      withdrawalFeeDiscount: 10, // 10% discount on withdrawal fees
      weeklyBonus: 500,
      
      // Other
      customizationOptions: true,
      betProtection: false,
      maxOpenBets: 10
    }
  },
  [SubscriptionTier.GOLD]: {
    name: 'Gold Tier',
    isDefault: false,
    isFree: false,
    featureSet: {
      // Betting features
      headToHeadRealMoney: true,
      headToHeadVirtual: true,
      parlayCash: true,
      parlayVirtual: true,
      tournamentParticipation: true,
      maxBetAmount: 1000,
      
      // Content access features
      liveOddsAccess: true,
      statsAccess: true,
      advancedStatsAccess: true,
      predictionEngineAccess: true,
      
      // Social features
      createGroups: true,
      joinGroups: true,
      customGamertag: true, // Available for Gold+ members
      customBets: true, // Create custom betting challenges
      maxInvites: 50,
      smsNotifications: true,
      
      // Platform features
      supportPriority: 'priority',
      withdrawalFeeDiscount: 20, // 20% discount on withdrawal fees
      weeklyBonus: 1000,
      
      // Other
      customizationOptions: true,
      betProtection: true,
      maxOpenBets: 15
    }
  },
  [SubscriptionTier.PLATINUM]: {
    name: 'Platinum Tier',
    isDefault: false,
    isFree: false,
    featureSet: {
      // Betting features
      headToHeadRealMoney: true,
      headToHeadVirtual: true,
      parlayCash: true,
      parlayVirtual: true,
      tournamentParticipation: true,
      maxBetAmount: 2500,
      
      // Content access features
      liveOddsAccess: true,
      statsAccess: true,
      advancedStatsAccess: true,
      predictionEngineAccess: true,
      
      // Social features
      createGroups: true,
      joinGroups: true,
      customGamertag: true, // Available for Platinum members
      customBets: true, // Create custom betting challenges
      maxInvites: 100,
      smsNotifications: true,
      
      // Platform features
      supportPriority: 'vip',
      withdrawalFeeDiscount: 50, // 50% discount on withdrawal fees
      weeklyBonus: 2500,
      
      // Other
      customizationOptions: true,
      betProtection: true,
      maxOpenBets: 30
    }
  }
};

// Helper function to get features for a specific tier
export function getTierFeatures(tier: SubscriptionTier): TierFeatures {
  return tierFeatures[tier];
}

// Helper function to get default tier
export function getDefaultTier(): SubscriptionTier {
  for (const [key, value] of Object.entries(tierFeatures)) {
    if (value.isDefault) {
      return key as SubscriptionTier;
    }
  }
  // Fallback to WOOD if no default is set
  return SubscriptionTier.WOOD;
}

// Function to check if a user can access a specific feature
export function canUserAccess(
  userTier: SubscriptionTier, 
  feature: keyof TierFeatures['featureSet']
): boolean {
  return tierFeatures[userTier].featureSet[feature] as boolean;
}

// Function to check max value for a user (like maxBetAmount, maxInvites)
export function getUserMaxValue(
  userTier: SubscriptionTier,
  maxType: 'maxBetAmount' | 'maxInvites' | 'maxOpenBets'
): number {
  return tierFeatures[userTier].featureSet[maxType];
}

// Invite bonus amounts in WeParlay cash
export const inviteBonus = {
  referrer: 200, // Amount given to person who invited a new user
  referee: 100,  // Amount given to new user who used a referral code
};