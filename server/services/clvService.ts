
export class CLVService {
  private betHistory: Map<string, any> = new Map();
  private closingLines: Map<string, any> = new Map();

  // Track a bet for CLV calculation
  trackBet(bet: any) {
    const betKey = `${bet.userId}_${bet.eventId}_${Date.now()}`;
    
    this.betHistory.set(betKey, {
      ...bet,
      placedAt: Date.now(),
      originalLine: bet.odds,
      originalPrice: bet.price,
      betKey
    });
  }

  // Record closing line for an event
  recordClosingLine(eventId: string, closingOdds: any) {
    this.closingLines.set(eventId, {
      ...closingOdds,
      closedAt: Date.now()
    });

    // Calculate CLV for all bets on this event
    this.calculateCLVForEvent(eventId);
  }

  private calculateCLVForEvent(eventId: string) {
    const closingLine = this.closingLines.get(eventId);
    if (!closingLine) return;

    Array.from(this.betHistory.values())
      .filter((bet: any) => bet.eventId === eventId)
      .forEach((bet: any) => {
        const clv = this.calculateCLV(bet, closingLine);
        bet.clv = clv;
        bet.clvCalculatedAt = Date.now();
      });
  }

  private calculateCLV(bet: any, closingLine: any): number {
    const originalImplied = this.oddsToImpliedProbability(bet.originalPrice);
    const closingImplied = this.oddsToImpliedProbability(closingLine.price);
    
    // CLV as percentage difference
    return ((originalImplied - closingImplied) / closingImplied) * 100;
  }

  private oddsToImpliedProbability(americanOdds: number): number {
    if (americanOdds > 0) {
      return 100 / (americanOdds + 100);
    } else {
      return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100);
    }
  }

  // Get CLV stats for a user
  getUserCLVStats(userId: string): any {
    const userBets = Array.from(this.betHistory.values())
      .filter((bet: any) => bet.userId === userId && bet.clv !== undefined);

    if (userBets.length === 0) {
      return {
        totalBets: 0,
        averageCLV: 0,
        positiveCLVRate: 0,
        lastThirtyDays: {
          averageCLV: 0,
          totalBets: 0
        }
      };
    }

    const totalCLV = userBets.reduce((sum, bet) => sum + bet.clv, 0);
    const averageCLV = totalCLV / userBets.length;
    const positiveCLVBets = userBets.filter(bet => bet.clv > 0).length;
    const positiveCLVRate = (positiveCLVBets / userBets.length) * 100;

    // Last 30 days stats
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentBets = userBets.filter(bet => bet.placedAt > thirtyDaysAgo);
    
    const recentCLV = recentBets.length > 0 
      ? recentBets.reduce((sum, bet) => sum + bet.clv, 0) / recentBets.length 
      : 0;

    return {
      totalBets: userBets.length,
      averageCLV: Number(averageCLV.toFixed(2)),
      positiveCLVRate: Number(positiveCLVRate.toFixed(1)),
      lastThirtyDays: {
        averageCLV: Number(recentCLV.toFixed(2)),
        totalBets: recentBets.length
      },
      topCLVBets: userBets
        .sort((a, b) => b.clv - a.clv)
        .slice(0, 5)
        .map(bet => ({
          event: bet.eventName,
          clv: Number(bet.clv.toFixed(2)),
          placedAt: bet.placedAt
        }))
    };
  }

  // Get CLV leaderboard
  getCLVLeaderboard(limit: number = 10): any[] {
    const userStats = new Map();

    Array.from(this.betHistory.values())
      .filter((bet: any) => bet.clv !== undefined)
      .forEach((bet: any) => {
        if (!userStats.has(bet.userId)) {
          userStats.set(bet.userId, {
            userId: bet.userId,
            username: bet.username || `User${bet.userId}`,
            clvSum: 0,
            betCount: 0
          });
        }
        
        const stats = userStats.get(bet.userId);
        stats.clvSum += bet.clv;
        stats.betCount += 1;
      });

    return Array.from(userStats.values())
      .map((stats: any) => ({
        ...stats,
        averageCLV: Number((stats.clvSum / stats.betCount).toFixed(2))
      }))
      .filter(stats => stats.betCount >= 10) // Minimum 10 bets
      .sort((a, b) => b.averageCLV - a.averageCLV)
      .slice(0, limit);
  }
}

export const clvService = new CLVService();
