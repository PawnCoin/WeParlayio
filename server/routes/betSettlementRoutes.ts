import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { betSettlementService } from '../services/betSettlementService';
import { storage } from '../storage';

const router = Router();

/**
 * Get all pending bets for settlement
 */
router.get('/pending', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userRole = req.user.claims.role || 'standard';
    
    // Only admins can view all pending bets
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const pendingBets = await storage.getUserBets(userId);
    const pending = pendingBets.filter(bet => bet.status === 'pending');

    res.json({
      success: true,
      data: pending,
      count: pending.length
    });
  } catch (error) {
    console.error('Error fetching pending bets:', error);
    res.status(500).json({ message: 'Failed to fetch pending bets' });
  }
});

/**
 * Trigger manual settlement for all pending bets
 */
router.post('/settle-all', isAuthenticated, async (req: any, res) => {
  try {
    const userRole = req.user.claims.role || 'standard';
    
    // Only admins can trigger settlement
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    console.log('🎯 Manual settlement triggered by admin');
    
    const results = await betSettlementService.settlePendingBets();
    
    const summary = {
      total: results.length,
      won: results.filter(r => r.status === 'won').length,
      lost: results.filter(r => r.status === 'lost').length,
      void: results.filter(r => r.status === 'void').length,
      totalPayout: results
        .filter(r => r.status === 'won')
        .reduce((sum, r) => sum + (r.winningAmount || 0), 0)
    };

    res.json({
      success: true,
      message: 'Settlement completed',
      summary,
      details: results
    });
  } catch (error) {
    console.error('Error in manual settlement:', error);
    res.status(500).json({ message: 'Settlement failed' });
  }
});

/**
 * Settle a specific bet manually
 */
router.post('/settle/:betId', isAuthenticated, async (req: any, res) => {
  try {
    const { betId } = req.params;
    const { outcome, reason } = req.body;
    const userRole = req.user.claims.role || 'standard';
    
    // Only admins can manually settle bets
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (!['won', 'lost', 'void'].includes(outcome)) {
      return res.status(400).json({ message: 'Invalid outcome. Must be won, lost, or void' });
    }

    const result = await betSettlementService.manualSettlement(
      parseInt(betId), 
      outcome, 
      reason || 'Manual admin settlement'
    );

    res.json({
      success: true,
      message: `Bet ${betId} settled as ${outcome}`,
      result
    });
  } catch (error) {
    console.error('Error in manual bet settlement:', error);
    res.status(500).json({ message: 'Failed to settle bet' });
  }
});

/**
 * Settle custom bet challenge
 */
router.post('/settle-challenge/:challengeId', isAuthenticated, async (req: any, res) => {
  try {
    const { challengeId } = req.params;
    const { winnerId, isDraw, evidence } = req.body;
    const userId = req.user.claims.sub;

    // Get challenge details
    const challenge = await storage.getBettingChallengeByUuid(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if user is authorized to settle (creator or acceptor)
    if (challenge.createdBy !== userId && challenge.acceptedBy !== userId) {
      return res.status(403).json({ message: 'Not authorized to settle this challenge' });
    }

    // Update challenge status
    await storage.settleBettingChallenge(challengeId, winnerId, isDraw);

    // Find and settle related bets
    const relatedBets = await storage.getUserBets(challenge.createdBy);
    const challengeBets = relatedBets.filter(bet => 
      bet.selection && bet.selection.includes(challengeId)
    );

    const settlementResults = [];
    for (const bet of challengeBets) {
      const result = await betSettlementService.settleBet(bet);
      settlementResults.push(result);
    }

    res.json({
      success: true,
      message: 'Challenge settled successfully',
      challenge: {
        id: challengeId,
        winnerId,
        isDraw,
        evidence
      },
      settlementResults
    });
  } catch (error) {
    console.error('Error settling challenge:', error);
    res.status(500).json({ message: 'Failed to settle challenge' });
  }
});

/**
 * Get settlement history
 */
router.get('/history', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { limit = 50, offset = 0 } = req.query;

    const userBets = await storage.getUserBets(parseInt(userId));
    const settledBets = userBets
      .filter(bet => ['won', 'lost', 'void'].includes(bet.status || ''))
      .sort((a, b) => new Date(b.settledAt || 0).getTime() - new Date(a.settledAt || 0).getTime())
      .slice(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string));

    const summary = {
      totalBets: settledBets.length,
      wonBets: settledBets.filter(bet => bet.status === 'won').length,
      lostBets: settledBets.filter(bet => bet.status === 'lost').length,
      voidBets: settledBets.filter(bet => bet.status === 'void').length,
      totalWinnings: settledBets
        .filter(bet => bet.status === 'won')
        .reduce((sum, bet) => sum + (bet.potentialPayout || 0), 0),
      totalLosses: settledBets
        .filter(bet => bet.status === 'lost')
        .reduce((sum, bet) => sum + bet.amount, 0)
    };

    res.json({
      success: true,
      data: settledBets,
      summary,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: userBets.filter(bet => ['won', 'lost', 'void'].includes(bet.status || '')).length
      }
    });
  } catch (error) {
    console.error('Error fetching settlement history:', error);
    res.status(500).json({ message: 'Failed to fetch settlement history' });
  }
});

/**
 * Get settlement statistics
 */
router.get('/stats', isAuthenticated, async (req: any, res) => {
  try {
    const userRole = req.user.claims.role || 'standard';
    
    // Only admins can view global stats
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // This would need to be implemented based on your storage interface
    // For now, return basic structure
    const stats = {
      dailySettlements: 0,
      weeklySettlements: 0,
      monthlySettlements: 0,
      averageSettlementTime: '5 minutes',
      successRate: 98.5,
      disputeRate: 1.5,
      totalPayouts: 0,
      pendingBets: 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching settlement stats:', error);
    res.status(500).json({ message: 'Failed to fetch settlement stats' });
  }
});

/**
 * Update event results for settlement
 */
router.post('/update-event/:eventId', isAuthenticated, async (req: any, res) => {
  try {
    const { eventId } = req.params;
    const { homeScore, awayScore, status, winner, additionalData } = req.body;
    const userRole = req.user.claims.role || 'standard';
    
    // Only admins can update event results
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Update event with final results
    await storage.updateEventStatus(parseInt(eventId), status, homeScore, awayScore);

    // Trigger settlement for bets on this event
    const allBets = await storage.getUserBets(0); // Get all bets (admin function)
    const eventBets = allBets.filter(bet => bet.eventId === parseInt(eventId));
    
    const settlementResults = [];
    for (const bet of eventBets) {
      try {
        const result = await betSettlementService.settleBet(bet);
        settlementResults.push(result);
      } catch (error) {
        console.error(`Error settling bet ${bet.id}:`, error);
      }
    }

    res.json({
      success: true,
      message: `Event ${eventId} updated and ${settlementResults.length} bets settled`,
      eventUpdate: {
        eventId,
        homeScore,
        awayScore,
        status,
        winner
      },
      settlementResults
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
});

/**
 * Dispute bet settlement
 */
router.post('/dispute/:betId', isAuthenticated, async (req: any, res) => {
  try {
    const { betId } = req.params;
    const { reason, evidence } = req.body;
    const userId = req.user.claims.sub;

    // Get bet details
    const bet = await storage.getBet(parseInt(betId));
    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }

    // Check if user owns the bet
    if (bet.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to dispute this bet' });
    }

    // Create dispute record (this would need to be added to your schema)
    const dispute = {
      betId: parseInt(betId),
      userId,
      reason,
      evidence,
      status: 'pending',
      createdAt: new Date()
    };

    // For now, create a support ticket for the dispute
    await storage.createSupportTicket({
      userId,
      subject: `Bet Settlement Dispute - Bet #${betId}`,
      message: `Dispute reason: ${reason}\nEvidence: ${evidence}`,
      priority: 'high',
      category: 'betting_dispute'
    });

    res.json({
      success: true,
      message: 'Dispute submitted successfully',
      dispute: {
        betId,
        status: 'pending',
        message: 'Your dispute has been submitted and will be reviewed by our team within 24 hours'
      }
    });
  } catch (error) {
    console.error('Error submitting dispute:', error);
    res.status(500).json({ message: 'Failed to submit dispute' });
  }
});

export default router;