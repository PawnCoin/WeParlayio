
export class ArbitrageService {
  private opportunities: Map<string, any> = new Map();
  private threshold = 0.5; // Minimum 0.5% profit margin

  // Main arbitrage detection function
  detectArbitrage(oddsData: any[]): any[] {
    const opportunities: any[] = [];
    
    // Group odds by event
    const eventGroups = this.groupOddsByEvent(oddsData);
    
    eventGroups.forEach((odds, eventId) => {
      const arbs = this.findArbitrageOpportunities(eventId, odds);
      opportunities.push(...arbs);
    });

    return opportunities.filter(opp => opp.profit > this.threshold);
  }

  private groupOddsByEvent(oddsData: any[]): Map<string, any[]> {
    const groups = new Map();
    
    oddsData.forEach(odds => {
      const eventKey = `${odds.away_team}_vs_${odds.home_team}`;
      if (!groups.has(eventKey)) {
        groups.set(eventKey, []);
      }
      groups.get(eventKey).push(odds);
    });
    
    return groups;
  }

  private findArbitrageOpportunities(eventId: string, oddsArray: any[]): any[] {
    const opportunities: any[] = [];
    
    // Check moneyline arbitrage
    const moneylineArb = this.findMoneylineArbitrage(eventId, oddsArray);
    if (moneylineArb) opportunities.push(moneylineArb);
    
    // Check spread arbitrage
    const spreadArb = this.findSpreadArbitrage(eventId, oddsArray);
    if (spreadArb) opportunities.push(spreadArb);
    
    // Check total arbitrage
    const totalArb = this.findTotalArbitrage(eventId, oddsArray);
    if (totalArb) opportunities.push(totalArb);
    
    return opportunities;
  }

  private findMoneylineArbitrage(eventId: string, oddsArray: any[]): any | null {
    let bestAway = { odds: -Infinity, book: '', team: '' };
    let bestHome = { odds: -Infinity, book: '', team: '' };
    
    oddsArray.forEach(bookOdds => {
      bookOdds.bookmakers?.forEach((book: any) => {
        const moneyline = book.markets?.find((m: any) => m.key === 'h2h');
        if (moneyline?.outcomes) {
          moneyline.outcomes.forEach((outcome: any, index: number) => {
            if (index === 0 && outcome.price > bestAway.odds) {
              bestAway = { odds: outcome.price, book: book.title, team: outcome.name };
            }
            if (index === 1 && outcome.price > bestHome.odds) {
              bestHome = { odds: outcome.price, book: book.title, team: outcome.name };
            }
          });
        }
      });
    });

    const profit = this.calculateArbitrageProfit(bestAway.odds, bestHome.odds);
    
    if (profit > this.threshold) {
      return {
        type: 'moneyline',
        event: eventId,
        profit: profit,
        legs: [
          { team: bestAway.team, odds: bestAway.odds, book: bestAway.book },
          { team: bestHome.team, odds: bestHome.odds, book: bestHome.book }
        ],
        stakes: this.calculateOptimalStakes(bestAway.odds, bestHome.odds, 1000),
        timestamp: Date.now()
      };
    }
    
    return null;
  }

  private findSpreadArbitrage(eventId: string, oddsArray: any[]): any | null {
    const spreads: any[] = [];
    
    oddsArray.forEach(bookOdds => {
      bookOdds.bookmakers?.forEach((book: any) => {
        const spreadMarket = book.markets?.find((m: any) => m.key === 'spreads');
        if (spreadMarket?.outcomes) {
          spreads.push({
            book: book.title,
            outcomes: spreadMarket.outcomes
          });
        }
      });
    });

    // Find opposing spreads that create arbitrage
    for (let i = 0; i < spreads.length; i++) {
      for (let j = i + 1; j < spreads.length; j++) {
        const arb = this.checkSpreadArbitrage(eventId, spreads[i], spreads[j]);
        if (arb && arb.profit > this.threshold) {
          return arb;
        }
      }
    }
    
    return null;
  }

  private findTotalArbitrage(eventId: string, oddsArray: any[]): any | null {
    const totals: any[] = [];
    
    oddsArray.forEach(bookOdds => {
      bookOdds.bookmakers?.forEach((book: any) => {
        const totalMarket = book.markets?.find((m: any) => m.key === 'totals');
        if (totalMarket?.outcomes) {
          totals.push({
            book: book.title,
            outcomes: totalMarket.outcomes
          });
        }
      });
    });

    // Find over/under arbitrage opportunities
    for (let i = 0; i < totals.length; i++) {
      for (let j = i + 1; j < totals.length; j++) {
        const arb = this.checkTotalArbitrage(eventId, totals[i], totals[j]);
        if (arb && arb.profit > this.threshold) {
          return arb;
        }
      }
    }
    
    return null;
  }

  private checkSpreadArbitrage(eventId: string, spread1: any, spread2: any): any | null {
    // Implementation for spread arbitrage detection
    return null; // Simplified for now
  }

  private checkTotalArbitrage(eventId: string, total1: any, total2: any): any | null {
    // Implementation for total arbitrage detection
    return null; // Simplified for now
  }

  private calculateArbitrageProfit(odds1: number, odds2: number): number {
    const implied1 = this.oddsToImpliedProbability(odds1);
    const implied2 = this.oddsToImpliedProbability(odds2);
    
    const totalImplied = implied1 + implied2;
    
    if (totalImplied < 1) {
      return ((1 / totalImplied) - 1) * 100; // Return as percentage
    }
    
    return 0;
  }

  private oddsToImpliedProbability(americanOdds: number): number {
    if (americanOdds > 0) {
      return 100 / (americanOdds + 100);
    } else {
      return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100);
    }
  }

  private calculateOptimalStakes(odds1: number, odds2: number, totalStake: number): any {
    const prob1 = this.oddsToImpliedProbability(odds1);
    const prob2 = this.oddsToImpliedProbability(odds2);
    
    const stake1 = totalStake * prob2 / (prob1 + prob2);
    const stake2 = totalStake * prob1 / (prob1 + prob2);
    
    return { stake1, stake2 };
  }

  // Get current arbitrage opportunities
  getCurrentOpportunities(): any[] {
    return Array.from(this.opportunities.values())
      .filter(opp => Date.now() - opp.timestamp < 300000) // 5 minutes
      .sort((a, b) => b.profit - a.profit);
  }
}

export const arbitrageService = new ArbitrageService();
