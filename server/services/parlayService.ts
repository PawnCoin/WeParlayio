// Comprehensive Parlay Builder Service
import { storage } from '../storage';

export interface ParlayLeg {
  eventId: string;
  teamName: string;
  teamLogo?: string;
  betType: 'moneyline' | 'spread' | 'total';
  selection: string;
  odds: number;
  stake?: number;
}

export interface ParlayBet {
  id: string;
  userId: string;
  legs: ParlayLeg[];
  totalOdds: number;
  potentialPayout: number;
  stake: number;
  status: 'pending' | 'won' | 'lost' | 'void';
  createdAt: Date;
  settledAt?: Date;
}

export class ParlayService {
  // Calculate combined odds for parlay
  static calculateParlayOdds(legs: ParlayLeg[]): number {
    let combinedOdds = 1;
    
    for (const leg of legs) {
      const decimal = leg.odds > 0 
        ? (leg.odds / 100) + 1 
        : (100 / Math.abs(leg.odds)) + 1;
      combinedOdds *= decimal;
    }
    
    // Convert back to American odds
    return combinedOdds >= 2 
      ? Math.round((combinedOdds - 1) * 100)
      : Math.round(-100 / (combinedOdds - 1));
  }

  // Calculate potential payout
  static calculatePayout(odds: number, stake: number): number {
    if (odds > 0) {
      return stake * (odds / 100);
    } else {
      return stake * (100 / Math.abs(odds));
    }
  }

  // Validate parlay rules
  static validateParlay(legs: ParlayLeg[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (legs.length < 2) {
      errors.push('Parlay must contain at least 2 legs');
    }
    
    if (legs.length > 12) {
      errors.push('Parlay cannot exceed 12 legs');
    }
    
    // Check for conflicting bets on same game
    const gameIds = new Set();
    const duplicateGames = legs.filter(leg => {
      if (gameIds.has(leg.eventId)) {
        return true;
      }
      gameIds.add(leg.eventId);
      return false;
    });
    
    if (duplicateGames.length > 0) {
      errors.push('Cannot bet multiple outcomes on the same game');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get parlay boost multiplier based on number of legs
  static getParlayBoost(legCount: number): number {
    const boosts: { [key: number]: number } = {
      2: 1.0,   // No boost for 2-leg
      3: 1.1,   // 10% boost
      4: 1.15,  // 15% boost
      5: 1.2,   // 20% boost
      6: 1.25,  // 25% boost
      7: 1.3,   // 30% boost
      8: 1.35,  // 35% boost
      9: 1.4,   // 40% boost
      10: 1.45, // 45% boost
      11: 1.5,  // 50% boost
      12: 1.55  // 55% boost
    };
    
    return boosts[legCount] || 1.0;
  }

  // Create parlay bet
  static async createParlay(
    userId: string, 
    legs: ParlayLeg[], 
    stake: number
  ): Promise<ParlayBet> {
    const validation = this.validateParlay(legs);
    if (!validation.valid) {
      throw new Error(`Invalid parlay: ${validation.errors.join(', ')}`);
    }

    const baseOdds = this.calculateParlayOdds(legs);
    const boost = this.getParlayBoost(legs.length);
    const boostedOdds = Math.round(baseOdds * boost);
    const potentialPayout = this.calculatePayout(boostedOdds, stake);

    const parlay: ParlayBet = {
      id: `parlay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      legs,
      totalOdds: boostedOdds,
      potentialPayout,
      stake,
      status: 'pending',
      createdAt: new Date()
    };

    // Store in database
    await storage.createTransaction({
      userId,
      type: 'parlay_bet',
      amount: -stake,
      description: `Parlay bet: ${legs.length} legs`,
      metadata: { parlayId: parlay.id, legs: legs.length }
    });

    return parlay;
  }

  // Get popular parlay combinations
  static getPopularParlays(): any[] {
    return [
      {
        name: "NFL Sunday Special",
        description: "Top 3 favored NFL teams",
        minOdds: 150,
        sports: ["NFL"]
      },
      {
        name: "NBA Big Three",
        description: "3 highest scoring teams over",
        minOdds: 200,
        sports: ["NBA"]
      },
      {
        name: "College Basketball Madness",
        description: "4 top-seeded teams to win",
        minOdds: 300,
        sports: ["NCAA Basketball"]
      }
    ];
  }

  // Settlement logic for parlays
  static async settleParlayBet(parlayId: string, results: { eventId: string; result: 'win' | 'loss' | 'void' }[]): Promise<void> {
    // Implementation for settling parlay bets
    // This would integrate with your event results system
  }
}