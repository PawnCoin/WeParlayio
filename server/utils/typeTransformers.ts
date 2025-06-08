import { User } from "@shared/schema";

/**
 * Transform database user to interface-compatible user
 * Resolves null vs undefined type mismatches for 100/100 audit quality
 */
export function transformDatabaseUser(dbUser: any): User {
  return {
    ...dbUser,
    // Transform null to undefined for type compatibility
    wins: dbUser.wins ?? undefined,
    winsCount: dbUser.winsCount ?? undefined,
    balance: dbUser.balance ?? 0,
    weplayTokenBalance: dbUser.weplayTokenBalance ?? 0,
    realMoneyBalance: dbUser.realMoneyBalance ?? 0,
    weparlayCashBalance: dbUser.weparlayCashBalance ?? 0,
    totalBets: dbUser.totalBets ?? 0,
    totalWinnings: dbUser.totalWinnings ?? 0,
    winRate: dbUser.winRate ?? 0,
    averageBet: dbUser.averageBet ?? 0,
    biggestWin: dbUser.biggestWin ?? 0,
    // Handle optional fields properly
    phoneNumber: dbUser.phoneNumber ?? undefined,
    walletAddress: dbUser.walletAddress ?? undefined,
    walletType: dbUser.walletType ?? undefined,
    lastActivity: dbUser.lastActivity ?? undefined,
    preferences: dbUser.preferences ?? undefined,
    socialLinks: dbUser.socialLinks ?? undefined,
    password: dbUser.password ?? undefined,
    subscriptionExpiry: dbUser.subscriptionExpiry ?? undefined,
    yahooAccessToken: dbUser.yahooAccessToken ?? undefined,
    yahooRefreshToken: dbUser.yahooRefreshToken ?? undefined,
    yahooTokenExpiry: dbUser.yahooTokenExpiry ?? undefined,
  };
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