import { db } from '../db';
import { storage } from '../storage';
import { bets, transactions } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Service to handle all payout-related functionality
 */
export class PayoutService {
  /**
   * Processes a winning bet payout
   * @param betId The ID of the bet to process
   * @returns The updated bet and transaction information
   */
  async processWinningPayout(betId: number) {
    try {
      // Get bet details
      const bet = await storage.getBet(betId);
      
      if (!bet) {
        throw new Error(`Bet with ID ${betId} not found`);
      }
      
      if (bet.status !== 'pending') {
        throw new Error(`Bet with ID ${betId} is not in pending status`);
      }
      
      // Calculate payout amount (this should match the potentialPayout field)
      const payoutAmount = bet.potentialPayout;
      
      // Start a transaction to ensure atomicity
      return await db.transaction(async (tx) => {
        // 1. Update bet status to 'won'
        const [updatedBet] = await tx
          .update(bets)
          .set({ 
            status: 'won',
            settledAt: new Date()
          })
          .where(eq(bets.id, betId))
          .returning();
        
        if (!updatedBet) {
          throw new Error('Failed to update bet');
        }
        
        // 2. Add payout transaction
        const [payoutTransaction] = await tx
          .insert(transactions)
          .values({
            userId: updatedBet.userId,
            type: 'win',
            amount: payoutAmount,
            status: 'completed',
            details: {
              betId: updatedBet.id,
              eventId: updatedBet.eventId,
              odds: updatedBet.odds
            }
          })
          .returning();
        
        // 3. Update user balance
        const user = await storage.getUser(updatedBet.userId);
        if (!user) {
          throw new Error(`User with ID ${updatedBet.userId} not found`);
        }
        
        const updatedUser = await storage.updateUserBalance(
          updatedBet.userId, 
          user.balance + payoutAmount
        );
        
        // 4. Update user stats
        await storage.incrementUserWins(updatedBet.userId);
        
        return {
          bet: updatedBet,
          transaction: payoutTransaction,
          user: updatedUser
        };
      });
    } catch (error) {
      console.error('Error processing winning payout:', error);
      throw error;
    }
  }
  
  /**
   * Processes a losing bet
   * @param betId The ID of the bet to process
   * @returns The updated bet
   */
  async processLosingBet(betId: number) {
    try {
      // Get bet details
      const bet = await storage.getBet(betId);
      
      if (!bet) {
        throw new Error(`Bet with ID ${betId} not found`);
      }
      
      if (bet.status !== 'pending') {
        throw new Error(`Bet with ID ${betId} is not in pending status`);
      }
      
      // Update bet status to 'lost'
      const [updatedBet] = await db
        .update(bets)
        .set({ 
          status: 'lost',
          settledAt: new Date()
        })
        .where(eq(bets.id, betId))
        .returning();
      
      return updatedBet;
    } catch (error) {
      console.error('Error processing losing bet:', error);
      throw error;
    }
  }
  
  /**
   * Processes a refund for a bet
   * @param betId The ID of the bet to refund
   * @param reason The reason for the refund
   * @returns The updated bet and transaction information
   */
  async processBetRefund(betId: number, reason: string) {
    try {
      // Get bet details
      const bet = await storage.getBet(betId);
      
      if (!bet) {
        throw new Error(`Bet with ID ${betId} not found`);
      }
      
      if (bet.status !== 'pending') {
        throw new Error(`Bet with ID ${betId} is not in pending status`);
      }
      
      // Start a transaction to ensure atomicity
      return await db.transaction(async (tx) => {
        // 1. Update bet status to 'refunded'
        const [updatedBet] = await tx
          .update(bets)
          .set({ 
            status: 'refunded',
            settledAt: new Date()
          })
          .where(eq(bets.id, betId))
          .returning();
        
        if (!updatedBet) {
          throw new Error('Failed to update bet');
        }
        
        // 2. Add refund transaction
        const [refundTransaction] = await tx
          .insert(transactions)
          .values({
            userId: updatedBet.userId,
            type: 'refund',
            amount: updatedBet.amount,
            status: 'completed',
            details: {
              betId: updatedBet.id,
              eventId: updatedBet.eventId,
              reason: reason
            }
          })
          .returning();
        
        // 3. Update user balance
        const user = await storage.getUser(updatedBet.userId);
        if (!user) {
          throw new Error(`User with ID ${updatedBet.userId} not found`);
        }
        
        const updatedUser = await storage.updateUserBalance(
          updatedBet.userId, 
          user.balance + updatedBet.amount
        );
        
        return {
          bet: updatedBet,
          transaction: refundTransaction,
          user: updatedUser
        };
      });
    } catch (error) {
      console.error('Error processing bet refund:', error);
      throw error;
    }
  }
  
  /**
   * Calculates platform earnings for a date range
   * @param startDate The start date
   * @param endDate The end date
   * @returns Platform earnings summary
   */
  async calculatePlatformEarnings(startDate: Date, endDate: Date) {
    try {
      // Summary structure
      const earningsSummary = {
        totalBets: 0,
        totalBetAmount: 0,
        totalPayouts: 0,
        grossRevenue: 0,
        platformFee: 0, // Platform's commission
        netRevenue: 0,
        betsWon: 0,
        betsLost: 0,
        betsRefunded: 0,
        pendingBets: 0,
        pendingAmount: 0,
        sportBreakdown: [] as any[],
        dailyBreakdown: [] as any[]
      };
      
      // Calculate total bets and amount
      const betSummary = await db.execute(
        `SELECT 
          COUNT(*) as total_bets,
          SUM(amount) as total_amount,
          SUM(CASE WHEN status = 'won' THEN potential_payout ELSE 0 END) as total_payouts,
          COUNT(CASE WHEN status = 'won' THEN 1 END) as bets_won,
          COUNT(CASE WHEN status = 'lost' THEN 1 END) as bets_lost,
          COUNT(CASE WHEN status = 'refunded' THEN 1 END) as bets_refunded,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bets,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount
        FROM bets
        WHERE placed_at BETWEEN $1 AND $2`,
        [startDate, endDate]
      );
      
      if (betSummary.rowCount && betSummary.rowCount > 0) {
        const row = betSummary.rows[0];
        earningsSummary.totalBets = parseInt(row.total_bets);
        earningsSummary.totalBetAmount = parseFloat(row.total_amount) || 0;
        earningsSummary.totalPayouts = parseFloat(row.total_payouts) || 0;
        earningsSummary.betsWon = parseInt(row.bets_won);
        earningsSummary.betsLost = parseInt(row.bets_lost);
        earningsSummary.betsRefunded = parseInt(row.bets_refunded);
        earningsSummary.pendingBets = parseInt(row.pending_bets);
        earningsSummary.pendingAmount = parseFloat(row.pending_amount) || 0;
        
        // Calculate gross revenue (bets - payouts)
        earningsSummary.grossRevenue = earningsSummary.totalBetAmount - earningsSummary.totalPayouts;
        
        // Assuming 5% platform fee from gross revenue
        earningsSummary.platformFee = earningsSummary.grossRevenue * 0.05;
        earningsSummary.netRevenue = earningsSummary.grossRevenue - earningsSummary.platformFee;
      }
      
      // Get breakdown by sport
      const sportBreakdown = await db.execute(
        `SELECT 
          s.name as sport_name,
          COUNT(b.*) as bets_count,
          SUM(b.amount) as total_amount,
          SUM(CASE WHEN b.status = 'won' THEN b.potential_payout ELSE 0 END) as total_payouts
        FROM bets b
        JOIN events e ON b.event_id = e.id
        JOIN sports s ON e.sport_id = s.id
        WHERE b.placed_at BETWEEN $1 AND $2
        GROUP BY s.name`,
        [startDate, endDate]
      );
      
      if (sportBreakdown.rowCount && sportBreakdown.rowCount > 0) {
        earningsSummary.sportBreakdown = sportBreakdown.rows.map(row => ({
          sportName: row.sport_name,
          betsCount: parseInt(row.bets_count),
          totalAmount: parseFloat(row.total_amount) || 0,
          totalPayouts: parseFloat(row.total_payouts) || 0,
          grossRevenue: (parseFloat(row.total_amount) || 0) - (parseFloat(row.total_payouts) || 0)
        }));
      }
      
      // Get daily breakdown
      const dailyBreakdown = await db.execute(
        `SELECT 
          DATE_TRUNC('day', placed_at) as bet_date,
          COUNT(*) as bets_count,
          SUM(amount) as total_amount,
          SUM(CASE WHEN status = 'won' THEN potential_payout ELSE 0 END) as total_payouts
        FROM bets
        WHERE placed_at BETWEEN $1 AND $2
        GROUP BY DATE_TRUNC('day', placed_at)
        ORDER BY bet_date`,
        [startDate, endDate]
      );
      
      if (dailyBreakdown.rowCount && dailyBreakdown.rowCount > 0) {
        earningsSummary.dailyBreakdown = dailyBreakdown.rows.map(row => ({
          date: row.bet_date,
          betsCount: parseInt(row.bets_count),
          totalAmount: parseFloat(row.total_amount) || 0,
          totalPayouts: parseFloat(row.total_payouts) || 0,
          grossRevenue: (parseFloat(row.total_amount) || 0) - (parseFloat(row.total_payouts) || 0)
        }));
      }
      
      return earningsSummary;
    } catch (error) {
      console.error('Error calculating platform earnings:', error);
      throw error;
    }
  }
  
  /**
   * Generate one-click activity report for specified period
   * @param period 'day' | 'week' | 'month' | 'year'
   * @returns Report data
   */
  async generateActivityReport(period: 'day' | 'week' | 'month' | 'year') {
    try {
      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      
      // Get platform earnings for the period
      const earnings = await this.calculatePlatformEarnings(startDate, endDate);
      
      // Get user activity
      const userActivity = await db.execute(
        `SELECT 
          COUNT(DISTINCT u.id) as active_users,
          COUNT(b.*) as total_bets,
          COUNT(DISTINCT CASE WHEN b.placed_at BETWEEN $1 AND $2 THEN b.user_id END) as betting_users
        FROM users u
        LEFT JOIN bets b ON u.id = b.user_id
        WHERE u.last_login BETWEEN $1 AND $2`,
        [startDate, endDate]
      );
      
      // Get new user registrations
      const newUsers = await db.execute(
        `SELECT COUNT(*) as new_users
        FROM users
        WHERE created_at BETWEEN $1 AND $2`,
        [startDate, endDate]
      );
      
      // Get transaction summary
      const transactions = await db.execute(
        `SELECT 
          type,
          COUNT(*) as count,
          SUM(amount) as total_amount
        FROM transactions
        WHERE transaction_date BETWEEN $1 AND $2
        GROUP BY type`,
        [startDate, endDate]
      );
      
      // Compile report
      const report = {
        period,
        timeframe: {
          startDate,
          endDate
        },
        userActivity: {
          activeUsers: parseInt(userActivity.rows[0]?.active_users || '0'),
          bettingUsers: parseInt(userActivity.rows[0]?.betting_users || '0'),
          newUsers: parseInt(newUsers.rows[0]?.new_users || '0')
        },
        bettingActivity: {
          totalBets: earnings.totalBets,
          totalAmount: earnings.totalBetAmount,
          averageBetSize: earnings.totalBets > 0 ? earnings.totalBetAmount / earnings.totalBets : 0,
          winRate: earnings.totalBets > 0 ? (earnings.betsWon / earnings.totalBets) * 100 : 0
        },
        financialSummary: {
          grossRevenue: earnings.grossRevenue,
          platformFee: earnings.platformFee,
          netRevenue: earnings.netRevenue
        },
        transactionBreakdown: transactions.rows.map(row => ({
          type: row.type,
          count: parseInt(row.count),
          totalAmount: parseFloat(row.total_amount) || 0
        })),
        sportBreakdown: earnings.sportBreakdown,
        dailyActivity: earnings.dailyBreakdown
      };
      
      return report;
    } catch (error) {
      console.error('Error generating activity report:', error);
      throw error;
    }
  }
}