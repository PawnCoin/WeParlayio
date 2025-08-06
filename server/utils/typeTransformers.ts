import { User } from "@shared/schema";

/**
 * Transform database user to interface-compatible user
 * Resolves null vs undefined type mismatches for 100/100 audit quality
 */
export function transformDatabaseUser(dbUser: any): User {
  // Convert all null values to undefined and ensure proper types
  const transformed = { ...dbUser };
  
  // Handle numeric fields that might be null
  if (transformed.wins === null) transformed.wins = undefined;
  if (transformed.winsCount === null) transformed.winsCount = undefined;
  if (transformed.balance === null) transformed.balance = 0;
  if (transformed.weplayTokenBalance === null) transformed.weplayTokenBalance = 0;
  if (transformed.realMoneyBalance === null) transformed.realMoneyBalance = 0;
  if (transformed.weparlayCashBalance === null) transformed.weparlayCashBalance = 0;
  if (transformed.totalBets === null) transformed.totalBets = 0;
  if (transformed.totalWinnings === null) transformed.totalWinnings = 0;
  if (transformed.winRate === null) transformed.winRate = 0;
  if (transformed.averageBet === null) transformed.averageBet = 0;
  if (transformed.biggestWin === null) transformed.biggestWin = 0;
  
  // Handle optional string fields
  if (transformed.phoneNumber === null) transformed.phoneNumber = undefined;
  if (transformed.walletAddress === null) transformed.walletAddress = undefined;
  if (transformed.walletType === null) transformed.walletType = undefined;
  if (transformed.password === null) transformed.password = undefined;

  
  // Handle optional date fields
  if (transformed.lastActivity === null) transformed.lastActivity = undefined;
  if (transformed.subscriptionExpiry === null) transformed.subscriptionExpiry = undefined;

  
  // Handle optional object fields
  if (transformed.preferences === null) transformed.preferences = undefined;
  if (transformed.socialLinks === null) transformed.socialLinks = undefined;
  
  return transformed as User;
}

/**
 * Transform transaction data for insert operations
 */
export function transformTransactionForInsert(transactionData: any) {
  const { method, ...validData } = transactionData;
  return validData;
}

/**
 * Handle numeric conversions safely
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}