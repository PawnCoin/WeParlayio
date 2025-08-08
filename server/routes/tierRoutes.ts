import express from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../simpleStorage';
import { SubscriptionTier, canUserAccess, getTierFeatures } from '../../shared/tierSystem';
import { z } from 'zod';

const router = express.Router();

// Tier prices in USD
const TIER_PRICES = {
  [SubscriptionTier.BRONZE]: 0,      // Free tier
  [SubscriptionTier.SILVER]: 9.99,   // $9.99/month
  [SubscriptionTier.GOLD]: 19.99,    // $19.99/month  
  [SubscriptionTier.PLATINUM]: 39.99 // $39.99/month
};

// Purchase tier schema
const purchaseTierSchema = z.object({
  tier: z.enum([SubscriptionTier.BRONZE, SubscriptionTier.SILVER, SubscriptionTier.GOLD, SubscriptionTier.PLATINUM]),
  paymentMethod: z.string().optional(),
  stripePaymentIntentId: z.string().optional()
});

// Get available tiers and pricing
router.get('/pricing', async (req, res) => {
  try {
    const tiers = [
      {
        id: SubscriptionTier.BRONZE,
        name: 'Bronze',
        price: TIER_PRICES[SubscriptionTier.BRONZE],
        description: 'Essential betting features for casual users',
        features: getTierFeatures(SubscriptionTier.BRONZE),
        popular: false
      },
      {
        id: SubscriptionTier.SILVER,
        name: 'Silver',
        price: TIER_PRICES[SubscriptionTier.SILVER],
        description: 'Enhanced features with live streaming access',
        features: getTierFeatures(SubscriptionTier.SILVER),
        popular: true
      },
      {
        id: SubscriptionTier.GOLD,
        name: 'Gold',
        price: TIER_PRICES[SubscriptionTier.GOLD],
        description: 'Advanced analytics and premium support',
        features: getTierFeatures(SubscriptionTier.GOLD),
        popular: false
      },
      {
        id: SubscriptionTier.PLATINUM,
        name: 'Platinum',
        price: TIER_PRICES[SubscriptionTier.PLATINUM],
        description: 'Ultimate VIP experience with all features',
        features: getTierFeatures(SubscriptionTier.PLATINUM),
        popular: false
      }
    ];

    res.json({ success: true, tiers });
  } catch (error) {
    console.error('Error fetching tier pricing:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tier pricing' });
  }
});

// Get current user tier and features
router.get('/current', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentTier = user.tier as SubscriptionTier || SubscriptionTier.BRONZE;
    const tierFeatures = getTierFeatures(currentTier);

    res.json({
      success: true,
      tier: currentTier,
      features: tierFeatures,
      pricing: TIER_PRICES[currentTier]
    });
  } catch (error) {
    console.error('Error fetching current tier:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch current tier' });
  }
});

// Purchase/upgrade tier
router.post('/purchase', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const validatedData = purchaseTierSchema.parse(req.body);
    const { tier, paymentMethod, stripePaymentIntentId } = validatedData;

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if this is a downgrade (not allowed in this simple implementation)
    const tierHierarchy = {
      [SubscriptionTier.BRONZE]: 0,
      [SubscriptionTier.SILVER]: 1,
      [SubscriptionTier.GOLD]: 2,
      [SubscriptionTier.PLATINUM]: 3
    };

    const currentTierLevel = tierHierarchy[user.tier as SubscriptionTier] || 0;
    const newTierLevel = tierHierarchy[tier];

    if (newTierLevel < currentTierLevel) {
      return res.status(400).json({ 
        success: false, 
        message: 'Downgrades not supported. Please contact support.' 
      });
    }

    // For Bronze tier (free), allow immediate upgrade
    if (tier === SubscriptionTier.BRONZE) {
      const updatedUser = await storage.updateUserTier(userId, tier);
      
      return res.json({
        success: true,
        message: 'Successfully downgraded to Bronze tier',
        user: updatedUser
      });
    }

    // For paid tiers, simulate payment processing
    // In production, integrate with Stripe/PayPal here
    const price = TIER_PRICES[tier];
    
    // Simulate successful payment
    if (price > 0) {
      // Calculate VIP expiry (30 days from now)
      const vipExpiry = new Date();
      vipExpiry.setDate(vipExpiry.getDate() + 30);

      const updatedUser = await storage.updateUserTier(userId, tier);
      // Note: Additional fields like vipUntil, vipExpiryDate would need additional storage methods
      // For now, tier upgrade is simulated with basic tier update

      res.json({
        success: true,
        message: `Successfully upgraded to ${tier} tier!`,
        user: updatedUser,
        expiryDate: vipExpiry
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid tier price' 
      });
    }

  } catch (error: any) {
    console.error('Error processing tier purchase:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data',
        errors: error.errors 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to process tier purchase' 
    });
  }
});

// Check tier access for specific feature
router.post('/check-access', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { feature } = req.body;
    if (!feature) {
      return res.status(400).json({ success: false, message: 'Feature parameter required' });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userTier = user.tier as SubscriptionTier || SubscriptionTier.BRONZE;
    const hasAccess = canUserAccess(userTier, feature);

    res.json({
      success: true,
      hasAccess,
      currentTier: userTier,
      feature
    });
  } catch (error) {
    console.error('Error checking tier access:', error);
    res.status(500).json({ success: false, message: 'Failed to check tier access' });
  }
});

// Cancel subscription (downgrade to Bronze)
router.post('/cancel', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Downgrade to Bronze tier
    const updatedUser = await storage.updateUserTier(userId, SubscriptionTier.BRONZE);
    // Note: Additional fields like vipUntil, vipExpiryDate would need additional storage methods

    res.json({
      success: true,
      message: 'Subscription cancelled. You have been downgraded to Bronze tier.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel subscription' });
  }
});

export default router;