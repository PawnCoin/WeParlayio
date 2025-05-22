import { storage } from '../storage';

// Fee configuration
export const feeConfig = {
  bettingFees: {
    percentage: 0.025,
    tiers: [
      { maxAmount: 100, percentage: 0.03 },
      { maxAmount: 500, percentage: 0.025 },
      { maxAmount: 1000, percentage: 0.02 },
      { maxAmount: 5000, percentage: 0.015 },
      { maxAmount: Infinity, percentage: 0.01 }
    ],
    minimumFee: 1.00
  },
  withdrawalFees: {
    standardPercentage: 0.015,
    minimumFee: 3.00
  },
  premiumFeatures: {
    vipMembership: { monthlyFee: 19.99 },
    analyticsPackage: { monthlyFee: 9.99 },
    prioritySupport: { monthlyFee: 4.99 }
  }
};

// Calculate betting fee based on amount and user tier
export async function calculateBettingFee(userId: string, betAmount: number): Promise<number> {
  const user = await storage.getUser(userId);
  
  // Check if user has VIP status for fee reduction
  const isVip = user?.vipExpiryDate && new Date(user.vipExpiryDate) > new Date();
  
  // Get appropriate tier for the amount
  const tier = feeConfig.bettingFees.tiers.find(tier => betAmount <= tier.maxAmount) || 
               feeConfig.bettingFees.tiers[feeConfig.bettingFees.tiers.length - 1];
  
  // Apply fee percentage
  let fee = betAmount * tier.percentage;
  
  // Apply VIP discount if applicable
  if (isVip) {
    fee = fee * 0.5; // 50% discount for VIP users
  }
  
  // Ensure minimum fee is applied
  fee = Math.max(fee, feeConfig.bettingFees.minimumFee);
  
  return parseFloat(fee.toFixed(2));
}

// Calculate withdrawal fee based on amount and withdrawal speed
export async function calculateWithdrawalFee(userId: string, withdrawalAmount: number, isExpress: boolean = false): Promise<number> {
  const user = await storage.getUser(userId);
  
  // Check if user has VIP status for fee reduction
  const isVip = user?.vipExpiryDate && new Date(user.vipExpiryDate) > new Date();
  
  // Base fee calculation
  let fee = withdrawalAmount * feeConfig.withdrawalFees.standardPercentage;
  
  // Express withdrawal has a higher fee
  if (isExpress) {
    fee = fee * 1.5;
  }
  
  // Apply VIP discount if applicable
  if (isVip) {
    fee = fee * 0.5; // 50% discount for VIP users
  }
  
  // Ensure minimum fee is applied
  fee = Math.max(fee, feeConfig.withdrawalFees.minimumFee);
  
  // Check for monthly free withdrawal quota for VIP users
  if (isVip) {
    const currentMonth = new Date().getMonth();
    const withdrawalsThisMonth = await storage.getUserWithdrawalsForMonth(userId, currentMonth);
    
    if (withdrawalsThisMonth === 0) {
      fee = 0; // First withdrawal each month is free for VIP users
    }
  }
  
  return parseFloat(fee.toFixed(2));
}

// Calculate deposit fee based on amount and deposit method
export async function calculateDepositFee(userId: string, depositAmount: number, method: 'fiat' | 'crypto'): Promise<number> {
  const user = await storage.getUser(userId);
  
  // Check if user has VIP status for fee reduction
  const isVip = user?.vipExpiryDate && new Date(user.vipExpiryDate) > new Date();
  
  // Different fee rates for different deposit methods
  const feeRate = method === 'fiat' ? 0.02 : 0.01;
  
  // Base fee calculation
  let fee = depositAmount * feeRate;
  
  // Apply VIP discount if applicable
  if (isVip) {
    fee = fee * 0.5; // 50% discount for VIP users
  }
  
  return parseFloat(fee.toFixed(2));
}

// Calculate subscription fee based on subscription type
export async function calculateSubscriptionFee(userId: string, subscriptionType: 'vip' | 'analytics' | 'support'): Promise<number> {
  // Get fee from configuration
  let fee = 0;
  
  switch (subscriptionType) {
    case 'vip':
      fee = feeConfig.premiumFeatures.vipMembership.monthlyFee;
      break;
    case 'analytics':
      fee = feeConfig.premiumFeatures.analyticsPackage.monthlyFee;
      break;
    case 'support':
      fee = feeConfig.premiumFeatures.prioritySupport.monthlyFee;
      break;
  }
  
  return fee;
}

// Process deposit of fees to platform owner's account
export async function processFeeDeposit(amount: number): Promise<boolean> {
  try {
    // Update platform revenue
    await storage.updatePlatformRevenue(amount, 'fee_deposit');
    
    // Create transaction record
    await storage.createTransaction({
      userId: 'system',
      type: 'platform_fee',
      amount,
      status: 'completed',
      details: { description: 'Platform fee deposit' }
    });
    
    return true;
  } catch (error) {
    console.error('Error processing fee deposit:', error);
    return false;
  }
}

// Fee summary for admin dashboard - returns all zeros for a fresh start
export const getFeeSummary = async (timeRange: string = 'month') => {
  // For a new platform, return zero values
  return {
    totalRevenue: 0,
    totalFees: 0,
    feesByType: [
      { name: 'Betting Fees', value: 0, percentage: 0 },
      { name: 'Withdrawal Fees', value: 0, percentage: 0 },
      { name: 'Deposit Fees', value: 0, percentage: 0 },
      { name: 'VIP Subscriptions', value: 0, percentage: 0 },
      { name: 'Analytics Package', value: 0, percentage: 0 },
      { name: 'Priority Support', value: 0, percentage: 0 },
    ],
    feesOverTime: [
      { date: new Date().toISOString().slice(0, 10), value: 0 }
    ]
  };
};

// Fee breakdown for admin dashboard - returns all zeros for a fresh start
export const getFeeBreakdown = async (timeRange: string = 'month', feeType: string = 'all') => {
  // For a new platform, return zero values
  return {
    count: 0,
    average: 0,
    highest: 0,
    lowest: 0,
    distribution: [
      { range: '0-5', count: 0, percentage: 0 },
      { range: '5-10', count: 0, percentage: 0 },
      { range: '10-20', count: 0, percentage: 0 },
      { range: '20-50', count: 0, percentage: 0 },
      { range: '50-100', count: 0, percentage: 0 },
      { range: '100+', count: 0, percentage: 0 },
    ]
  };
};