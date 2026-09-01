import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { restrictedAuthMiddleware } from '../middleware/restrictedAuth';
import { z } from 'zod';

const router = Router();

// Create a new P2P betting challenge
router.post('/challenges/create', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;

    const createChallengeSchema = z.object({
      eventId: z.string(),
      gameDetails: z.object({
        homeTeam: z.string(),
        awayTeam: z.string(),
        startTime: z.string(),
        sport: z.string(),
      }),
      challengerPick: z.string(),
      betAmount: z.number().positive(),
      currency: z.enum(['weparlay_cash']).default('weparlay_cash'),
      isPublic: z.boolean().default(true),
      allowedFriends: z.array(z.string()).optional(),
      challengeMessage: z.string().trim().max(200).optional(),
      challengeeId: z.string().optional(), // for direct challenges
    });

    const validatedData = createChallengeSchema.parse(req.body);

    // Check user balance
    const user = await storage.getUser(userId);
    if (!user || (user.weparlayCashBalance || 0) < validatedData.betAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient WeParlay Cash balance',
        currentBalance: user?.weparlayCashBalance || 0,
        required: validatedData.betAmount
      });
    }

    // Calculate expiry time (30 minutes before game starts or 24 hours max)
    const gameStartTime = new Date(validatedData.gameDetails.startTime);
    const expiryTime = new Date(Math.min(
      gameStartTime.getTime() - (30 * 60 * 1000), // 30 minutes before game
      Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
    ));

    if (expiryTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Game starts too soon to create a challenge'
      });
    }

    // Create the challenge
    const challenge = await storage.createP2pChallenge({
      challengerId: userId,
      challengeeId: validatedData.challengeeId || null,
      eventId: validatedData.eventId,
      gameDetails: validatedData.gameDetails,
      challengerPick: validatedData.challengerPick,
      betAmount: validatedData.betAmount,
      currency: validatedData.currency,
      totalPot: validatedData.betAmount * 2,
      expiresAt: expiryTime,
      isPublic: validatedData.isPublic,
      allowedFriends: validatedData.allowedFriends || null,
      challengeMessage: validatedData.challengeMessage || null,
    });

    // Deposit challenger's money into escrow
    await storage.depositToP2pEscrow({
      challengeId: challenge.id,
      userId: userId,
      amount: validatedData.betAmount,
      currency: validatedData.currency,
    });

    // Log activity
    await storage.createP2pActivity({
      challengeId: challenge.id,
      userId: userId,
      activityType: 'challenge_created',
      message: `${user.username || 'User'} created a $${validatedData.betAmount} challenge on ${validatedData.gameDetails.homeTeam} vs ${validatedData.gameDetails.awayTeam}`,
      metadata: { betAmount: validatedData.betAmount, pick: validatedData.challengerPick }
    });

    res.json({
      success: true,
      challenge,
      message: 'Challenge created successfully! Your WeParlay Cash has been deposited to escrow.'
    });
  } catch (error: any) {
    console.error('Error creating P2P challenge:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create challenge'
    });
  }
});

// Accept a P2P betting challenge
router.post('/challenges/:challengeId/accept', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;
    const { challengeId } = req.params;
    const { challengeePick } = req.body;

    if (!challengeePick) {
      return res.status(400).json({
        success: false,
        message: 'Must specify your pick to accept the challenge'
      });
    }

    // Get the challenge
    const challenge = await storage.getP2pChallenge(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Validate challenge can be accepted
    if (challenge.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Challenge is no longer available'
      });
    }

    if (challenge.challengerId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept your own challenge'
      });
    }

    if (challenge.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Challenge has expired'
      });
    }

    // Check if user is allowed to accept (for private challenges)
    if (!challenge.isPublic) {
      if (challenge.challengeeId && challenge.challengeeId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'This challenge is not for you'
        });
      }
      
      if (Array.isArray(challenge.allowedFriends) && !challenge.allowedFriends.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: 'You are not allowed to accept this private challenge'
        });
      }
    }

    // Check user balance
    const user = await storage.getUser(userId);
    if (!user || (user.weparlayCashBalance || 0) < challenge.betAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient WeParlay Cash balance',
        currentBalance: user?.weparlayCashBalance || 0,
        required: challenge.betAmount
      });
    }

    // Accept the challenge
    const updatedChallenge = await storage.acceptP2pChallenge(challengeId, userId, challengeePick);

    // Deposit challengee's money into escrow
    await storage.depositToP2pEscrow({
      challengeId: challengeId,
      userId: userId,
      amount: challenge.betAmount,
      currency: challenge.currency,
    });

    // Log activity
    await storage.createP2pActivity({
      challengeId: challengeId,
      userId: userId,
      activityType: 'challenge_accepted',
      message: `${user.username || 'User'} accepted the challenge, picking ${challengeePick}`,
      metadata: { pick: challengeePick }
    });

    res.json({
      success: true,
      challenge: updatedChallenge,
      message: 'Challenge accepted! Your WeParlay Cash has been deposited to escrow. The bet is now active.'
    });
  } catch (error: any) {
    console.error('Error accepting P2P challenge:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to accept challenge'
    });
  }
});

// Get all available challenges (public + friend challenges for current user)
router.get('/challenges/available', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;

    const challenges = await storage.getAvailableP2pChallenges(userId);

    res.json({
      success: true,
      challenges,
      totalAvailable: challenges.length
    });
  } catch (error: any) {
    console.error('Error fetching available challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges'
    });
  }
});

// Get user's active challenges (created by user or accepted by user)
router.get('/challenges/mine', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;

    const challenges = await storage.getUserP2pChallenges(userId);

    res.json({
      success: true,
      challenges,
      totalChallenges: challenges.length
    });
  } catch (error: any) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your challenges'
    });
  }
});

// Cancel a challenge (only if not yet accepted)
router.post('/challenges/:challengeId/cancel', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;
    const { challengeId } = req.params;

    const challenge = await storage.getP2pChallenge(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (challenge.challengerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the challenger can cancel this challenge'
      });
    }

    if (challenge.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel open challenges'
      });
    }

    // Cancel and refund
    await storage.cancelP2pChallenge(challengeId, 'Cancelled by challenger');

    // Log activity
    const user = await storage.getUser(userId);
    await storage.createP2pActivity({
      challengeId: challengeId,
      userId: userId,
      activityType: 'challenge_cancelled',
      message: `${user?.username || 'User'} cancelled the challenge. Funds refunded.`,
      metadata: { reason: 'cancelled_by_challenger' }
    });

    res.json({
      success: true,
      message: 'Challenge cancelled and funds refunded'
    });
  } catch (error: any) {
    console.error('Error cancelling challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel challenge'
    });
  }
});

// Get challenge details and activity
router.get('/challenges/:challengeId', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;
    const { challengeId } = req.params;

    const challenge = await storage.getP2pChallengeWithDetails(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if user has access to view this challenge
    const hasAccess = 
      challenge.isPublic || 
      challenge.challengerId === userId ||
      challenge.challengeeId === userId ||
      (Array.isArray(challenge.allowedFriends) && challenge.allowedFriends.includes(userId));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to view this challenge'
      });
    }

    // Get activity feed
    const activity = await storage.getP2pChallengeActivity(challengeId);

    res.json({
      success: true,
      challenge,
      activity
    });
  } catch (error: any) {
    console.error('Error fetching challenge details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge details'
    });
  }
});

// Pre-bet room chat. Messages are limited to open challenges and 200 characters.
router.post('/challenges/:challengeId/chat', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;
    const { challengeId } = req.params;
    const { message } = z.object({ message: z.string().trim().min(1).max(200) }).parse(req.body);
    const challenge = await storage.getP2pChallenge(challengeId);

    if (!challenge || challenge.status !== 'open' || challenge.expiresAt <= new Date()) {
      return res.status(400).json({ success: false, message: 'This pre-bet chat is closed' });
    }
    const canChat = challenge.isPublic || challenge.challengerId === userId ||
      challenge.challengeeId === userId ||
      (Array.isArray(challenge.allowedFriends) && challenge.allowedFriends.includes(userId));
    if (!canChat) return res.status(403).json({ success: false, message: 'You cannot access this bet room' });

    const user = await storage.getUser(userId);
    const activity = await storage.createP2pActivity({
      challengeId,
      userId,
      activityType: 'pre_bet_chat',
      message,
      metadata: { username: user?.username || user?.firstName || 'User' },
    });
    res.json({ success: true, activity });
  } catch (error: any) {
    const validationMessage = error?.issues?.[0]?.message;
    res.status(400).json({ success: false, message: validationMessage || 'Unable to send message' });
  }
});

// Admin: Settle challenges manually (for testing or edge cases)
router.post('/admin/challenges/:challengeId/settle', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const { challengeId } = req.params;
    const { winnerUserId, settlementReason } = req.body;

    // TODO: Add admin role check here
    if (!currentUser.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const challenge = await storage.getP2pChallenge(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (challenge.status !== 'accepted' && challenge.status !== 'pending_settlement') {
      return res.status(400).json({
        success: false,
        message: 'Challenge is not in a settleable state'
      });
    }

    // Settle the challenge
    await storage.settleP2pChallenge(challengeId, winnerUserId, settlementReason || 'Manual admin settlement');

    // Log activity
    await storage.createP2pActivity({
      challengeId: challengeId,
      userId: currentUser.claims?.sub,
      activityType: 'challenge_settled',
      message: `Challenge settled by admin. Winner: ${winnerUserId}`,
      metadata: { winner: winnerUserId, reason: settlementReason, settledBy: 'admin' }
    });

    res.json({
      success: true,
      message: 'Challenge settled successfully'
    });
  } catch (error: any) {
    console.error('Error settling challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to settle challenge'
    });
  }
});

// Get P2P betting stats for a user
router.get('/stats', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;

    const stats = await storage.getUserP2pStats(userId);

    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    console.error('Error fetching P2P stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch P2P betting stats'
    });
  }
});

export default router;
