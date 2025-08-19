import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { getTierFeatures } from '../../shared/tierSystem';

/**
 * Middleware to check if users can communicate with each other
 * Rules:
 * 1. VIP users (Gold/Platinum) can communicate with anyone
 * 2. Non-VIP users can only communicate with users they share active bets/events with
 */
export const checkCommunicationPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUser = req.user as any;
    const { targetUserId } = req.body;

    if (!currentUser || !targetUserId) {
      return res.status(400).json({ 
        message: 'User authentication required',
        canCommunicate: false 
      });
    }

    const currentUserId = currentUser.claims?.sub;
    const user = await storage.getUser(currentUserId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        canCommunicate: false 
      });
    }

    // Check if current user is VIP (Gold/Platinum)
    if (user.subscriptionTier) {
      const tierFeatures = getTierFeatures(user.subscriptionTier);
      
      // VIP users can communicate with anyone
      if (tierFeatures.smsNotifications || user.subscriptionTier === 'gold' || user.subscriptionTier === 'platinum') {
        req.canCommunicate = true;
        return next();
      }
    }

    // For non-VIP users, check if they share bets or events
    const sharedConnection = await checkSharedConnection(currentUserId, targetUserId);
    
    if (sharedConnection) {
      req.canCommunicate = true;
      return next();
    }

    // Block communication for non-VIP users without shared connection
    return res.status(403).json({
      message: 'Communication restricted. Upgrade to VIP or participate in shared betting activities to communicate with this user.',
      canCommunicate: false,
      upgradeRequired: true
    });

  } catch (error) {
    console.error('Communication permission check error:', error);
    req.canCommunicate = false;
    return next(); // Allow request to continue but mark as restricted
  }
};

/**
 * Check if two users have shared betting activities
 */
async function checkSharedConnection(userId1: string, userId2: string): Promise<boolean> {
  try {
    // Check for shared head-to-head challenges
    const user1Challenges = await storage.getUserChallenges(userId1);
    const user2Challenges = await storage.getUserChallenges(userId2);

    const sharedChallenges = user1Challenges.filter(challenge1 =>
      user2Challenges.some(challenge2 => 
        challenge1.id === challenge2.id ||
        (challenge1.createdBy === userId2 && challenge1.acceptedBy === userId1) ||
        (challenge1.createdBy === userId1 && challenge1.acceptedBy === userId2)
      )
    );

    if (sharedChallenges.length > 0) {
      return true;
    }

    // Check for shared bets on same events (simplified check)
    const user1Bets = await storage.getUserBets(parseInt(userId1));
    const user2Bets = await storage.getUserBets(parseInt(userId2));

    const sharedEvents = user1Bets.filter(bet1 => 
      user2Bets.some(bet2 => bet1.eventId === bet2.eventId)
    );

    return sharedEvents.length > 0;
  } catch (error) {
    console.error('Error checking shared connection:', error);
    return false;
  }
}

/**
 * Enhanced permission check for messaging/challenges
 */
export const checkMessagingPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUser = req.user as any;
    
    if (!currentUser) {
      return res.status(401).json({ 
        message: 'Authentication required',
        canMessage: false 
      });
    }

    const currentUserId = currentUser.claims?.sub;
    const user = await storage.getUser(currentUserId);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        canMessage: false 
      });
    }

    // Check VIP status for enhanced messaging features
    let canSendSMS = false;
    const canSendEmail = true; // Email is always allowed

    if (user.subscriptionTier) {
      const tierFeatures = getTierFeatures(user.subscriptionTier);
      canSendSMS = tierFeatures.smsNotifications;
    }

    // Set permissions on request object
    req.messagingPermissions = {
      canSendEmail,
      canSendSMS,
      isVIP: user.subscriptionTier === 'gold' || user.subscriptionTier === 'platinum'
    };

    next();
  } catch (error) {
    console.error('Messaging permission check error:', error);
    req.messagingPermissions = {
      canSendEmail: true,
      canSendSMS: false,
      isVIP: false
    };
    next();
  }
};

// Type declaration for Express Request
declare global {
  namespace Express {
    interface Request {
      canCommunicate?: boolean;
      messagingPermissions?: {
        canSendEmail: boolean;
        canSendSMS: boolean;
        isVIP: boolean;
      };
    }
  }
}