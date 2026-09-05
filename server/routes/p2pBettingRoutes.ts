import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../replitAuth';
import { restrictedAuthMiddleware } from '../middleware/restrictedAuth';
import { z } from 'zod';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { users } from '@shared/schema';
import { sendEmail } from '../services/emailService';
import { smsService } from '../services/smsService';
import { espnApiService } from '../services/espnApiService';
import {
  acceptFundedP2pChallenge,
  cancelAndRefundP2pChallenge,
  createFundedP2pChallenge,
  createP2pActivity,
  getAvailableP2pChallenges,
  getP2pActivity,
  getP2pChallenge,
  getP2pChallengeWithNames,
  getP2pDisputes,
  getP2pStats,
  getUserP2pChallenges,
  openP2pDispute,
  queueP2pFinalResult,
  resolveP2pDispute,
  settleP2pChallenge,
} from '../services/p2pEscrow';

const router = Router();

const clientError = (error: any) => /insufficient|expired|no longer|own challenge|opposing outcome|not for you|not allowed|positive|two decimal|only open|only the challenger|already in use/i.test(error?.message || '');

// Public, read-only invitation preview. The UUID in the shared link identifies
// the room; no contact details, balances, or private activity are returned.
router.get('/invitations/:challengeId', async (req: Request, res: Response) => {
  try {
    const challenge = await getP2pChallengeWithNames(req.params.challengeId);
    if (!challenge) return res.status(404).json({ success: false, message: 'Invitation not found' });
    const { challengerId: _challengerId, challengeeId: _challengeeId, allowedFriends: _allowedFriends, ...preview } = challenge as any;
    res.json({ success: true, challenge: preview });
  } catch (error) {
    console.error('Error fetching P2P invitation:', error);
    res.status(500).json({ success: false, message: 'Failed to load invitation' });
  }
});

// Send an invitation through a configured transactional provider. The browser
// share actions remain available, but this route records provider delivery
// attempts without storing a recipient's email address or phone number.
router.post('/challenges/:challengeId/invitations/send', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).claims?.sub;
    const { channel, recipient } = z.object({
      channel: z.enum(['email', 'sms']),
      recipient: z.string().trim().min(3).max(320),
    }).parse(req.body);
    const challenge = await getP2pChallengeWithNames(req.params.challengeId);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
    if (challenge.challengerId !== userId) return res.status(403).json({ success: false, message: 'Only the challenge creator can send invitations' });
    if (challenge.status !== 'open' || challenge.expiresAt <= new Date()) {
      return res.status(400).json({ success: false, message: 'Only an open challenge can be shared' });
    }

    const publicOrigin = process.env.PUBLIC_APP_URL?.replace(/\/$/, '') || `${req.protocol}://${req.get('host')}`;
    const invitationUrl = `${publicOrigin}/custom-bets?challenge=${challenge.id}`;
    const event = `${challenge.gameDetails.awayTeam} vs ${challenge.gameDetails.homeTeam}`;
    const copy = `${challenge.challengerUsername} invited you to a ${challenge.betAmount} WeParlay Cash challenge for ${event}. Review and accept or decline: ${invitationUrl}`;

    let deliveryId: string | undefined;
    if (channel === 'email') {
      if (!z.string().email().safeParse(recipient).success) {
        return res.status(400).json({ success: false, message: 'Enter a valid email address' });
      }
      const sent = await sendEmail({
        to: recipient,
        subject: 'WeParlay bet invitation',
        text: copy,
      });
      if (!sent) return res.status(503).json({ success: false, message: 'Email delivery is not configured or is temporarily unavailable' });
    } else {
      if (!/^\+[1-9]\d{7,14}$/.test(recipient)) {
        return res.status(400).json({ success: false, message: 'Use an E.164 phone number, for example +15551234567' });
      }
      const sent = await smsService.sendSMS(recipient, copy);
      if (!sent.success) return res.status(503).json({ success: false, message: sent.error || 'SMS delivery is not configured or is temporarily unavailable' });
      deliveryId = sent.messageId;
    }

    await createP2pActivity({
      challengeId: challenge.id,
      userId,
      activityType: 'challenge_invitation_sent',
      message: `Challenge invitation sent by ${channel}.`,
      metadata: { channel, deliveryId: deliveryId || null },
    });
    res.json({ success: true, channel, message: `Invitation sent by ${channel}` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error?.issues?.[0]?.message || error.message || 'Unable to send invitation' });
  }
});

// Create a new P2P betting challenge
router.post('/challenges/create', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;

    const createChallengeSchema = z.object({
      idempotencyKey: z.string().uuid(),
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
    const challenge = await createFundedP2pChallenge({
      challengerId: userId,
      challengeeId: validatedData.challengeeId || null,
      eventId: validatedData.eventId,
      gameDetails: validatedData.gameDetails,
      challengerPick: validatedData.challengerPick,
      betAmount: validatedData.betAmount,
      currency: validatedData.currency,
      expiresAt: expiryTime,
      isPublic: validatedData.challengeeId ? false : validatedData.isPublic,
      allowedFriends: validatedData.allowedFriends || null,
      challengeMessage: validatedData.challengeMessage || null,
    });

    // Log activity
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    await createP2pActivity({
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
    res.status(clientError(error) ? 400 : 500).json({
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
    const challenge = await getP2pChallenge(challengeId);
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

    // Fund escrow and accept in one locked database transaction.
    const updatedChallenge = await acceptFundedP2pChallenge(challengeId, userId, challengeePick);

    // Log activity
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    await createP2pActivity({
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
    res.status(clientError(error) ? 400 : 500).json({
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

    const challenges = await getAvailableP2pChallenges(userId);

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

    const challenges = await getUserP2pChallenges(userId);

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

    const challenge = await getP2pChallenge(challengeId);
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
    await cancelAndRefundP2pChallenge(challengeId, userId);

    // Log activity
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    await createP2pActivity({
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
    res.status(clientError(error) ? 400 : 500).json({
      success: false,
      message: error.message || 'Failed to cancel challenge'
    });
  }
});

// A specifically invited opponent may decline. Public-room visitors can dismiss
// the link locally without closing a room that remains available to everyone.
router.post('/challenges/:challengeId/decline', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;
    const challenge = await getP2pChallenge(req.params.challengeId);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
    if (challenge.status !== 'open') return res.status(400).json({ success: false, message: 'Challenge is no longer available' });
    if (challenge.isPublic || !challenge.challengeeId) return res.json({ success: true, dismissed: true, message: 'Invitation dismissed' });
    if (challenge.challengeeId !== userId) return res.status(403).json({ success: false, message: 'This invitation is not for you' });

    await cancelAndRefundP2pChallenge(challenge.id, undefined);
    await createP2pActivity({
      challengeId: challenge.id,
      userId,
      activityType: 'challenge_declined',
      message: 'The invited opponent declined. The challenger was refunded.',
      metadata: { reason: 'declined_by_invited_opponent' },
    });
    res.json({ success: true, dismissed: true, message: 'Challenge declined and challenger refunded' });
  } catch (error: any) {
    console.error('Error declining challenge:', error);
    res.status(clientError(error) ? 400 : 500).json({ success: false, message: error.message || 'Failed to decline challenge' });
  }
});

// Get challenge details and activity
router.get('/challenges/:challengeId', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;
    const { challengeId } = req.params;

    const challenge = await getP2pChallengeWithNames(challengeId);
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
    const [activity, disputes] = await Promise.all([
      getP2pActivity(challengeId),
      getP2pDisputes(challengeId),
    ]);

    res.json({
      success: true,
      challenge,
      activity,
      disputes,
    });
  } catch (error: any) {
    console.error('Error fetching challenge details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge details'
    });
  }
});

// A participant can dispute an accepted result. Opening a dispute freezes the
// challenge in pending settlement until an authorized decision is recorded.
router.post('/challenges/:challengeId/disputes', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).claims?.sub;
    const { reason, evidence } = z.object({
      reason: z.string().trim().min(10).max(1_000),
      evidence: z.string().trim().max(2_000).optional(),
    }).parse(req.body);
    const { challenge, dispute } = await openP2pDispute(req.params.challengeId, userId, reason, evidence);
    await createP2pActivity({
      challengeId: challenge.id,
      userId,
      activityType: 'result_disputed',
      message: 'A result dispute was opened. Payout is frozen pending review.',
      metadata: { disputeId: dispute.id },
    });
    res.status(201).json({ success: true, dispute });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error?.issues?.[0]?.message || error.message || 'Unable to open dispute' });
  }
});

// Authorized reviewers resolve a frozen dispute by either paying the verified
// winner or refunding both participants when the event is void/drawn.
router.post('/admin/challenges/:challengeId/disputes/:disputeId/resolve', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const adminId = (req.user as any).claims?.sub;
    const [admin] = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, adminId)).limit(1);
    if (!admin?.isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' });
    const { outcome, winnerUserId, resolution } = z.object({
      outcome: z.enum(['payout', 'refund']),
      winnerUserId: z.string().optional(),
      resolution: z.string().trim().min(10).max(2_000),
    }).parse(req.body);
    if (outcome === 'payout' && !winnerUserId) return res.status(400).json({ success: false, message: 'A verified winner is required for payout' });

    const { challenge, dispute } = await resolveP2pDispute({
      challengeId: req.params.challengeId,
      disputeId: req.params.disputeId,
      adminId,
      outcome,
      winnerUserId,
      resolution,
    });
    await createP2pActivity({
      challengeId: challenge.id,
      userId: adminId,
      activityType: 'dispute_resolved',
      message: outcome === 'payout' ? 'Dispute resolved with verified payout.' : 'Dispute resolved with a full refund.',
      metadata: { disputeId: dispute.id, outcome, winnerUserId: winnerUserId || null },
    });
    res.json({ success: true, challenge, disputeId: dispute.id, outcome });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error?.issues?.[0]?.message || error.message || 'Unable to resolve dispute' });
  }
});

// Pre-bet room chat. Messages are limited to open challenges and 200 characters.
router.post('/challenges/:challengeId/chat', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;
    const { challengeId } = req.params;
    const { message } = z.object({ message: z.string().trim().min(1).max(200) }).parse(req.body);
    const challenge = await getP2pChallenge(challengeId);

    if (!challenge || challenge.status !== 'open' || challenge.expiresAt <= new Date()) {
      return res.status(400).json({ success: false, message: 'This pre-bet chat is closed' });
    }
    const canChat = challenge.isPublic || challenge.challengerId === userId ||
      challenge.challengeeId === userId ||
      (Array.isArray(challenge.allowedFriends) && challenge.allowedFriends.includes(userId));
    if (!canChat) return res.status(403).json({ success: false, message: 'You cannot access this bet room' });

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const activity = await createP2pActivity({
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

    const adminId = currentUser.claims?.sub || currentUser.id;
    const [admin] = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, adminId)).limit(1);
    if (!admin?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const challenge = await getP2pChallenge(challengeId);
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
    await settleP2pChallenge(challengeId, winnerUserId, settlementReason || 'Manual admin settlement');

    // Log activity
    await createP2pActivity({
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

// Admin-only result intake from ESPN. It never pays automatically: a final is
// recorded as pending settlement so a second source or a dispute review can
// verify the outcome before escrow is released.
router.post('/admin/challenges/:challengeId/results/espn', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const adminId = (req.user as any).claims?.sub;
    const [admin] = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, adminId)).limit(1);
    if (!admin?.isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' });

    const challenge = await getP2pChallenge(req.params.challengeId);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });
    if (challenge.status !== 'accepted') return res.status(400).json({ success: false, message: 'Challenge is not awaiting a final result' });

    const event = await espnApiService.getFinalEventById(challenge.eventId);
    if (!event) return res.status(409).json({ success: false, message: 'ESPN does not yet report a completed score for this event' });
    const updated = await queueP2pFinalResult(challenge.id, {
      source: 'ESPN',
      homeTeam: event.homeTeam.name,
      awayTeam: event.awayTeam.name,
      homeScore: event.homeTeam.score,
      awayScore: event.awayTeam.score,
      statusDetail: event.statusDetail,
    });
    await createP2pActivity({
      challengeId: challenge.id,
      userId: adminId,
      activityType: 'official_result_received',
      message: `ESPN reported final: ${event.awayTeam.name} ${event.awayTeam.score} – ${event.homeTeam.name} ${event.homeTeam.score}. Payout remains pending verification.`,
      metadata: { source: 'ESPN', eventId: event.id, homeScore: event.homeTeam.score, awayScore: event.awayTeam.score },
    });
    res.json({ success: true, challenge: updated, result: event, message: 'Final score recorded; payout remains pending verification' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Unable to record ESPN result' });
  }
});

// Get P2P betting stats for a user
router.get('/stats', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;

    const stats = await getP2pStats(userId);

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
