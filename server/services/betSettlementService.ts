import { storage } from '../storage';
import { db } from '../db';
import { bets, events, users, transactions } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

export interface BetSettlementResult {
  betId: number;
  status: 'won' | 'lost' | 'void' | 'partial';
  winningAmount?: number;
  reason: string;
  settledAt: Date;
}

export interface CustomBetSettlement {
  challengeId: string;
  winnerId?: string;
  isDraw: boolean;
  settlement: 'auto' | 'manual' | 'disputed';
  evidence?: string;
}

/**
 * Comprehensive Bet Settlement Service
 * Handles automated winner determination for all bet types
 */
export class BetSettlementService {
  
  /**
   * Main settlement function - processes all pending bets
   */
  async settlePendingBets(): Promise<BetSettlementResult[]> {
    console.log('🎯 Starting automated bet settlement process...');
    
    try {
      // Get all pending bets
      const pendingBets = await this.getPendingBets();
      console.log(`📊 Found ${pendingBets.length} pending bets to process`);
      
      const results: BetSettlementResult[] = [];
      
      for (const bet of pendingBets) {
        try {
          const result = await this.settleBet(bet);
          results.push(result);
        } catch (error) {
          console.error(`❌ Error settling bet ${bet.id}:`, error);
        }
      }
      
      console.log(`✅ Settlement complete: ${results.length} bets processed`);
      return results;
    } catch (error) {
      console.error('❌ Error in settlement process:', error);
      throw error;
    }
  }

  /**
   * Settle individual bet based on its type
   */
  async settleBet(bet: any): Promise<BetSettlementResult> {
    // Determine bet type and route to appropriate settlement logic
    if (bet.betType === 'custom') {
      return await this.settleCustomBet(bet);
    } else if (bet.betType === 'gaming') {
      return await this.settleGamingBet(bet);
    } else if (bet.betType === 'esports') {
      return await this.settleEsportsBet(bet);
    } else {
      return await this.settleSportsBet(bet);
    }
  }

  /**
   * Settle sports bets using official game results
   */
  async settleSportsBet(bet: any): Promise<BetSettlementResult> {
    try {
      // Get event data
      const event = await storage.getEvent(bet.eventId);
      if (!event) {
        throw new Error(`Event ${bet.eventId} not found`);
      }

      // Check if event is finished
      if (event.status !== 'finished' && event.status !== 'completed') {
        throw new Error(`Event ${bet.eventId} not yet finished`);
      }

      let isWinning = false;
      let reason = '';

      // Determine winner based on bet type
      switch (bet.betType) {
        case 'moneyline':
          isWinning = this.checkMoneylineWin(bet, event);
          reason = `Moneyline bet on ${bet.pick}`;
          break;
          
        case 'spread':
          isWinning = this.checkSpreadWin(bet, event);
          reason = `Spread bet: ${bet.pick} ${bet.line}`;
          break;
          
        case 'total':
          isWinning = this.checkTotalWin(bet, event);
          reason = `Total bet: ${bet.pick} ${bet.line}`;
          break;
          
        case 'prop':
          isWinning = this.checkPropWin(bet, event);
          reason = `Prop bet: ${bet.selection}`;
          break;
          
        default:
          throw new Error(`Unknown bet type: ${bet.betType}`);
      }

      const status = isWinning ? 'won' : 'lost';
      const winningAmount = isWinning ? bet.potentialPayout : 0;

      // Update bet status and process payout
      await this.processBetOutcome(bet.id, status, winningAmount);

      return {
        betId: bet.id,
        status,
        winningAmount,
        reason,
        settledAt: new Date()
      };

    } catch (error) {
      console.error(`Error settling sports bet ${bet.id}:`, error);
      throw error;
    }
  }

  /**
   * Settle custom bets between users
   */
  async settleCustomBet(bet: any): Promise<BetSettlementResult> {
    try {
      // Get custom bet challenge data
      const challenge = await storage.getBettingChallengeByUuid(bet.challengeId);
      if (!challenge) {
        throw new Error(`Challenge ${bet.challengeId} not found`);
      }

      // Check if challenge is settled
      if (challenge.status !== 'settled') {
        throw new Error(`Challenge ${bet.challengeId} not yet settled`);
      }

      let status: 'won' | 'lost' | 'void' = 'lost';
      let winningAmount = 0;

      if (challenge.isDraw) {
        status = 'void';
        winningAmount = bet.amount; // Return original stake
      } else if (challenge.winnerId === bet.userId) {
        status = 'won';
        winningAmount = bet.potentialPayout;
      }

      // Process the outcome
      await this.processBetOutcome(bet.id, status, winningAmount);

      return {
        betId: bet.id,
        status,
        winningAmount,
        reason: `Custom bet challenge: ${challenge.description}`,
        settledAt: new Date()
      };

    } catch (error) {
      console.error(`Error settling custom bet ${bet.id}:`, error);
      throw error;
    }
  }

  /**
   * Settle gaming bets (e.g., crypto price predictions, game outcomes)
   */
  async settleGamingBet(bet: any): Promise<BetSettlementResult> {
    try {
      let isWinning = false;
      let reason = '';

      // Parse bet details
      const betDetails = JSON.parse(bet.selection || '{}');
      
      switch (betDetails.gameType) {
        case 'crypto_price':
          isWinning = await this.checkCryptoPriceWin(bet, betDetails);
          reason = `Crypto price prediction: ${betDetails.symbol}`;
          break;
          
        case 'market_prediction':
          isWinning = await this.checkMarketPredictionWin(bet, betDetails);
          reason = `Market prediction: ${betDetails.market}`;
          break;
          
        case 'skill_game':
          isWinning = await this.checkSkillGameWin(bet, betDetails);
          reason = `Skill game: ${betDetails.gameId}`;
          break;
          
        default:
          throw new Error(`Unknown gaming bet type: ${betDetails.gameType}`);
      }

      const status = isWinning ? 'won' : 'lost';
      const winningAmount = isWinning ? bet.potentialPayout : 0;

      await this.processBetOutcome(bet.id, status, winningAmount);

      return {
        betId: bet.id,
        status,
        winningAmount,
        reason,
        settledAt: new Date()
      };

    } catch (error) {
      console.error(`Error settling gaming bet ${bet.id}:`, error);
      throw error;
    }
  }

  /**
   * Settle esports bets using tournament/match data
   */
  async settleEsportsBet(bet: any): Promise<BetSettlementResult> {
    try {
      // Get tournament/match data from external API or database
      const matchData = await this.getEsportsMatchResult(bet.eventId);
      
      if (!matchData || matchData.status !== 'finished') {
        throw new Error(`Esports match ${bet.eventId} not finished`);
      }

      let isWinning = false;
      const betDetails = JSON.parse(bet.selection || '{}');

      switch (bet.betType) {
        case 'match_winner':
          isWinning = matchData.winner === betDetails.team;
          break;
          
        case 'map_winner':
          isWinning = matchData.mapResults[betDetails.mapNumber]?.winner === betDetails.team;
          break;
          
        case 'total_maps':
          const totalMaps = matchData.mapResults.length;
          isWinning = (betDetails.over && totalMaps > betDetails.line) || 
                     (!betDetails.over && totalMaps < betDetails.line);
          break;
          
        case 'first_blood':
          isWinning = matchData.firstBlood === betDetails.team;
          break;
      }

      const status = isWinning ? 'won' : 'lost';
      const winningAmount = isWinning ? bet.potentialPayout : 0;

      await this.processBetOutcome(bet.id, status, winningAmount);

      return {
        betId: bet.id,
        status,
        winningAmount,
        reason: `Esports bet: ${bet.betType} on ${betDetails.team || betDetails.selection}`,
        settledAt: new Date()
      };

    } catch (error) {
      console.error(`Error settling esports bet ${bet.id}:`, error);
      throw error;
    }
  }

  /**
   * Process bet outcome - update status and handle payouts
   */
  private async processBetOutcome(betId: number, status: string, winningAmount: number): Promise<void> {
    try {
      // Update bet status
      const updatedBet = await storage.settleBet(betId, status);
      
      if (status === 'won' && winningAmount > 0) {
        // Process winning payout
        await this.processWinningPayout(updatedBet, winningAmount);
      } else if (status === 'void') {
        // Return original stake for voided bets
        await this.processVoidRefund(updatedBet);
      }
      
      // Log settlement for audit trail
      console.log(`✅ Bet ${betId} settled: ${status} - Amount: ${winningAmount}`);
      
    } catch (error) {
      console.error(`Error processing bet outcome for bet ${betId}:`, error);
      throw error;
    }
  }

  /**
   * Process winning payout
   */
  private async processWinningPayout(bet: any, winningAmount: number): Promise<void> {
    try {
      // Update user balance
      await storage.updateUserBalance(bet.userId, winningAmount);
      
      // Create winning transaction record
      await storage.createTransaction({
        userId: bet.userId,
        type: 'winning',
        amount: winningAmount,
        currency: bet.currency || 'USD',
        status: 'completed',
        method: 'automatic_payout',
        description: `Winning payout for bet #${bet.id}`,
        details: {
          betId: bet.id,
          originalStake: bet.amount,
          odds: bet.odds,
          payout: winningAmount
        }
      });
      
      // Update user stats
      await storage.incrementUserWins(bet.userId);
      
    } catch (error) {
      console.error(`Error processing winning payout:`, error);
      throw error;
    }
  }

  /**
   * Process void bet refund
   */
  private async processVoidRefund(bet: any): Promise<void> {
    try {
      // Return original stake
      await storage.updateUserBalance(bet.userId, bet.amount);
      
      // Create refund transaction record
      await storage.createTransaction({
        userId: bet.userId,
        type: 'refund',
        amount: bet.amount,
        currency: bet.currency || 'USD',
        status: 'completed',
        method: 'automatic_refund',
        description: `Refund for voided bet #${bet.id}`,
        details: {
          betId: bet.id,
          reason: 'bet_voided'
        }
      });
      
    } catch (error) {
      console.error(`Error processing void refund:`, error);
      throw error;
    }
  }

  // Specific win checking methods
  private checkMoneylineWin(bet: any, event: any): boolean {
    const homeWin = (event.homeScore || 0) > (event.awayScore || 0);
    const awayWin = (event.awayScore || 0) > (event.homeScore || 0);
    
    if (bet.pick.includes('home') || bet.pick.includes(event.homeTeam)) {
      return homeWin;
    } else if (bet.pick.includes('away') || bet.pick.includes(event.awayTeam)) {
      return awayWin;
    }
    return false;
  }

  private checkSpreadWin(bet: any, event: any): boolean {
    const homeScore = event.homeScore || 0;
    const awayScore = event.awayScore || 0;
    const spread = parseFloat(bet.line) || 0;
    
    if (bet.pick.includes('home')) {
      return (homeScore + spread) > awayScore;
    } else {
      return (awayScore + spread) > homeScore;
    }
  }

  private checkTotalWin(bet: any, event: any): boolean {
    const totalScore = (event.homeScore || 0) + (event.awayScore || 0);
    const line = parseFloat(bet.line) || 0;
    
    if (bet.pick.toLowerCase().includes('over')) {
      return totalScore > line;
    } else {
      return totalScore < line;
    }
  }

  private checkPropWin(bet: any, event: any): boolean {
    // This would need to be expanded based on specific prop bet types
    // For now, return a basic implementation
    const betDetails = JSON.parse(bet.selection || '{}');
    
    // Example prop bet logic
    if (betDetails.type === 'first_score') {
      return betDetails.team === event.firstScorer;
    }
    
    return false;
  }

  // Gaming bet checking methods
  private async checkCryptoPriceWin(bet: any, betDetails: any): Promise<boolean> {
    try {
      // Get current crypto price from API
      const currentPrice = await this.getCurrentCryptoPrice(betDetails.symbol);
      const targetPrice = betDetails.targetPrice;
      const direction = betDetails.direction; // 'up' or 'down'
      
      if (direction === 'up') {
        return currentPrice >= targetPrice;
      } else {
        return currentPrice <= targetPrice;
      }
    } catch (error) {
      console.error('Error checking crypto price:', error);
      return false;
    }
  }

  private async checkMarketPredictionWin(bet: any, betDetails: any): Promise<boolean> {
    // Implementation for market predictions
    return false; // Placeholder
  }

  private async checkSkillGameWin(bet: any, betDetails: any): Promise<boolean> {
    // Implementation for skill-based games
    return false; // Placeholder
  }

  // Helper methods
  private async getPendingBets(): Promise<any[]> {
    try {
      // Get all bets with 'pending' status
      return await db.select()
        .from(bets)
        .where(eq(bets.status, 'pending'));
    } catch (error) {
      console.error('Error getting pending bets:', error);
      return [];
    }
  }

  private async getCurrentCryptoPrice(symbol: string): Promise<number> {
    try {
      // Use CoinGecko API for crypto prices
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`
      );
      const data = await response.json();
      return data[symbol]?.usd || 0;
    } catch (error) {
      console.error('Error fetching crypto price:', error);
      throw error;
    }
  }

  private async getEsportsMatchResult(eventId: string): Promise<any> {
    try {
      // This would integrate with esports data providers
      // For now, return mock structure
      return {
        status: 'finished',
        winner: 'team1',
        mapResults: [
          { mapNumber: 1, winner: 'team1' },
          { mapNumber: 2, winner: 'team2' },
          { mapNumber: 3, winner: 'team1' }
        ],
        firstBlood: 'team1'
      };
    } catch (error) {
      console.error('Error getting esports match result:', error);
      return null;
    }
  }

  /**
   * Manual settlement for disputed or complex bets
   */
  async manualSettlement(betId: number, outcome: 'won' | 'lost' | 'void', reason: string): Promise<BetSettlementResult> {
    try {
      const bet = await storage.getBet(betId);
      if (!bet) {
        throw new Error(`Bet ${betId} not found`);
      }

      const winningAmount = outcome === 'won' ? bet.potentialPayout : 
                           outcome === 'void' ? bet.amount : 0;

      await this.processBetOutcome(betId, outcome, winningAmount);

      return {
        betId,
        status: outcome,
        winningAmount,
        reason: `Manual settlement: ${reason}`,
        settledAt: new Date()
      };

    } catch (error) {
      console.error(`Error in manual settlement for bet ${betId}:`, error);
      throw error;
    }
  }

  /**
   * Schedule automatic settlement checks
   */
  startAutomaticSettlement(): void {
    // Run settlement check every 5 minutes
    setInterval(async () => {
      try {
        await this.settlePendingBets();
      } catch (error) {
        console.error('Error in automatic settlement:', error);
      }
    }, 5 * 60 * 1000);

    console.log('🤖 Automatic bet settlement scheduler started');
  }
}

export const betSettlementService = new BetSettlementService();