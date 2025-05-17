import { storage } from "../storage";
import { TransactionType } from "@shared/schema";

// Fee structure configuration
export const feeConfig = {
  // Betting fees
  bettingFees: {
    percentage: 0.025, // 2.5% standard fee
    // Tiered fee structure based on bet size
    tiers: [
      { maxAmount: 100, percentage: 0.03 },     // 3% for bets up to $100
      { maxAmount: 500, percentage: 0.025 },    // 2.5% for bets $101-$500
      { maxAmount: 1000, percentage: 0.02 },    // 2% for bets $501-$1000
      { maxAmount: 5000, percentage: 0.015 },   // 1.5% for bets $1001-$5000
      { maxAmount: Infinity, percentage: 0.01 } // 1% for bets above $5000
    ],
    minimumFee: 1.00, // Minimum $1 fee regardless of bet size
  },
  
  // Withdrawal fees
  withdrawalFees: {
    standardPercentage: 0.015, // 1.5% standard withdrawal fee
    // Tiered withdrawal fees based on amount
    tiers: [
      { maxAmount: 100, percentage: 0.025 },    // 2.5% for withdrawals up to $100
      { maxAmount: 500, percentage: 0.02 },     // 2% for withdrawals $101-$500
      { maxAmount: 1000, percentage: 0.015 },   // 1.5% for withdrawals $501-$1000
      { maxAmount: 5000, percentage: 0.01 },    // 1% for withdrawals $1001-$5000
      { maxAmount: Infinity, percentage: 0.005 } // 0.5% for withdrawals above $5000
    ],
    minimumFee: 3.00, // Minimum $3 fee regardless of withdrawal size
    expressOption: {
      additionalFee: 0.01, // Additional 1% for express withdrawals
      minimumExpressFee: 5.00 // Minimum $5 fee for express withdrawals
    },
    // First free withdrawal per month
    freeWithdrawalConfig: {
      enabled: true,
      freeWithdrawalsPerMonth: 1
    }
  },
  
  // Deposit fees
  depositFees: {
    standardPercentage: 0.01, // 1% standard deposit fee
    minimumFee: 1.00, // Minimum $1 fee regardless of deposit size
    cryptoSpecific: {
      gasFeeMarkup: 0.005, // 0.5% gas fee markup for crypto transactions
    }
  },
  
  // Premium features
  premiumFeatures: {
    vipMembership: {
      monthlyFee: 19.99,
      benefitMultiplier: 0.5 // VIP members pay only 50% of standard fees
    },
    analyticsPackage: {
      monthlyFee: 9.99
    },
    prioritySupport: {
      monthlyFee: 4.99
    }
  },
  
  // Platform token benefits
  platformToken: {
    // Using WePlay Token gives discount
    feeDiscount: 0.3, // 30% discount on fees when using platform token
    minimumTokenBalance: 100 // Must hold at least 100 tokens to get discount
  }
};

/**
 * Calculate betting fee based on bet amount and user's status
 */
export async function calculateBettingFee(userId: string, betAmount: number): Promise<number> {
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Determine if user has VIP status
  const isVip = user.role === 'vip';
  
  // Determine if user qualifies for platform token discount
  const hasTokenDiscount = (user.weplayTokenBalance || 0) >= feeConfig.platformToken.minimumTokenBalance;
  
  // Find applicable tier based on bet amount
  const applicableTier = feeConfig.bettingFees.tiers.find(tier => betAmount <= tier.maxAmount);
  const feePercentage = applicableTier ? applicableTier.percentage : feeConfig.bettingFees.percentage;
  
  // Calculate base fee
  let fee = betAmount * feePercentage;
  
  // Apply VIP discount if applicable
  if (isVip) {
    fee *= feeConfig.premiumFeatures.vipMembership.benefitMultiplier;
  }
  
  // Apply token discount if applicable
  if (hasTokenDiscount) {
    fee *= (1 - feeConfig.platformToken.feeDiscount);
  }
  
  // Ensure minimum fee is applied
  fee = Math.max(fee, feeConfig.bettingFees.minimumFee);
  
  // Record fee in database for tracking
  await recordFeeTransaction(userId, fee, 'betting', betAmount);
  
  return parseFloat(fee.toFixed(2));
}

/**
 * Calculate withdrawal fee based on withdrawal amount and user's status
 */
export async function calculateWithdrawalFee(
  userId: string, 
  withdrawalAmount: number, 
  isExpress: boolean = false
): Promise<number> {
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Check if user is eligible for free withdrawal
  const currentMonth = new Date().getMonth();
  const withdrawalsThisMonth = await storage.getUserWithdrawalsForMonth(userId, currentMonth);
  const eligibleForFreeWithdrawal = feeConfig.withdrawalFees.freeWithdrawalConfig.enabled && 
                                   withdrawalsThisMonth < feeConfig.withdrawalFees.freeWithdrawalConfig.freeWithdrawalsPerMonth;
  
  if (eligibleForFreeWithdrawal && !isExpress) {
    return 0;
  }
  
  // Determine if user has VIP status
  const isVip = user.role === 'vip';
  
  // Determine if user qualifies for platform token discount
  const hasTokenDiscount = (user.weplayTokenBalance || 0) >= feeConfig.platformToken.minimumTokenBalance;
  
  // Find applicable tier based on withdrawal amount
  const applicableTier = feeConfig.withdrawalFees.tiers.find(tier => withdrawalAmount <= tier.maxAmount);
  const feePercentage = applicableTier ? applicableTier.percentage : feeConfig.withdrawalFees.standardPercentage;
  
  // Calculate base fee
  let fee = withdrawalAmount * feePercentage;
  
  // Add express fee if applicable
  if (isExpress) {
    const expressFee = withdrawalAmount * feeConfig.withdrawalFees.expressOption.additionalFee;
    const minimumExpressFee = feeConfig.withdrawalFees.expressOption.minimumExpressFee;
    fee += Math.max(expressFee, minimumExpressFee);
  }
  
  // Apply VIP discount if applicable
  if (isVip) {
    fee *= feeConfig.premiumFeatures.vipMembership.benefitMultiplier;
  }
  
  // Apply token discount if applicable
  if (hasTokenDiscount) {
    fee *= (1 - feeConfig.platformToken.feeDiscount);
  }
  
  // Ensure minimum fee is applied
  const minimumFee = isExpress 
    ? feeConfig.withdrawalFees.minimumFee + feeConfig.withdrawalFees.expressOption.minimumExpressFee
    : feeConfig.withdrawalFees.minimumFee;
  
  fee = Math.max(fee, minimumFee);
  
  // Record fee in database for tracking
  await recordFeeTransaction(userId, fee, 'withdrawal', withdrawalAmount);
  
  return parseFloat(fee.toFixed(2));
}

/**
 * Calculate deposit fee based on deposit amount and method
 */
export async function calculateDepositFee(
  userId: string, 
  depositAmount: number, 
  method: 'fiat' | 'crypto' = 'fiat'
): Promise<number> {
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Determine if user has VIP status
  const isVip = user.role === 'vip';
  
  // Determine if user qualifies for platform token discount
  const hasTokenDiscount = (user.weplayTokenBalance || 0) >= feeConfig.platformToken.minimumTokenBalance;
  
  // Calculate base fee
  let feePercentage = feeConfig.depositFees.standardPercentage;
  
  // Add gas fee markup for crypto deposits
  if (method === 'crypto') {
    feePercentage += feeConfig.depositFees.cryptoSpecific.gasFeeMarkup;
  }
  
  let fee = depositAmount * feePercentage;
  
  // Apply VIP discount if applicable
  if (isVip) {
    fee *= feeConfig.premiumFeatures.vipMembership.benefitMultiplier;
  }
  
  // Apply token discount if applicable
  if (hasTokenDiscount) {
    fee *= (1 - feeConfig.platformToken.feeDiscount);
  }
  
  // Ensure minimum fee is applied
  fee = Math.max(fee, feeConfig.depositFees.minimumFee);
  
  // Record fee in database for tracking
  await recordFeeTransaction(userId, fee, 'deposit', depositAmount);
  
  return parseFloat(fee.toFixed(2));
}

/**
 * Record fee transaction in the database
 */
async function recordFeeTransaction(
  userId: string, 
  feeAmount: number, 
  feeType: 'betting' | 'withdrawal' | 'deposit' | 'premium', 
  transactionAmount?: number
): Promise<void> {
  try {
    // Create transaction record
    await storage.createTransaction({
      userId,
      amount: feeAmount,
      type: TransactionType.FEE,
      description: `${feeType.charAt(0).toUpperCase() + feeType.slice(1)} fee`,
      status: 'completed',
      relatedAmount: transactionAmount,
      createdAt: new Date()
    });
    
    // Update platform revenue metrics
    await storage.updatePlatformRevenue(feeAmount, feeType);
  } catch (error) {
    console.error('Error recording fee transaction:', error);
    throw new Error('Failed to record fee transaction');
  }
}

/**
 * Calculate subscription fee for premium features
 */
export async function calculateSubscriptionFee(
  userId: string, 
  subscriptionType: 'vip' | 'analytics' | 'support'
): Promise<number> {
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new Error("User not found");
  }
  
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
    default:
      throw new Error('Invalid subscription type');
  }
  
  // Determine if user qualifies for platform token discount
  const hasTokenDiscount = (user.weplayTokenBalance || 0) >= feeConfig.platformToken.minimumTokenBalance;
  
  // Apply token discount if applicable
  if (hasTokenDiscount) {
    fee *= (1 - feeConfig.platformToken.feeDiscount);
  }
  
  // Record fee in database for tracking
  await recordFeeTransaction(userId, fee, 'premium');
  
  return parseFloat(fee.toFixed(2));
}

/**
 * Process fee collection and direct deposit to platform owner's bank account
 */
export async function processFeeDeposit(feeAmount: number): Promise<boolean> {
  try {
    // Get platform owner's bank account information
    const bankAccount = await storage.getOwnerBankAccount();
    
    if (!bankAccount) {
      throw new Error('Platform owner bank account not configured');
    }
    
    // In a real implementation, this would connect to a payment processor
    // to transfer the fee amount to the owner's bank account
    
    // For now, we'll just record the deposit in our database
    await storage.createTransaction({
      userId: 'platform-owner',
      amount: feeAmount,
      type: TransactionType.PLATFORM_REVENUE,
      description: 'Platform fee revenue',
      status: 'completed',
      createdAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error processing fee deposit:', error);
    return false;
  }
}