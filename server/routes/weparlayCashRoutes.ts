import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { restrictedAuthMiddleware } from '../middleware/restrictedAuth';

const router = Router();

// WeParlay Cash transaction tracking
router.get('/transactions', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;

    // Get all WeParlay Cash transactions for the user
    const transactions = await storage.getWeparlayCashTransactions(userId);
    
    res.json({
      success: true,
      transactions,
      currentBalance: (await storage.getUser(userId))?.weparlayCashBalance || 0
    });
  } catch (error: any) {
    console.error('Error fetching WeParlay Cash transactions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

// Add WeParlay Cash (admin only or system rewards)
router.post('/add', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;
    const { amount, reason, adminUserId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid amount'
      });
    }

    // Record the transaction
    const transaction = await storage.createWeparlayCashTransaction({
      userId: userId,
      amount: amount,
      type: 'credit',
      reason: reason || 'Manual addition',
      adminUserId: adminUserId || null,
      balanceBefore: (await storage.getUser(userId))?.weparlayCashBalance || 0
    });

    // Update user balance
    const updatedUser = await storage.updateUserWeplayTokenBalance(userId, amount);

    res.json({
      success: true,
      message: 'WeParlay Cash added successfully',
      transaction,
      newBalance: updatedUser.weparlayCashBalance
    });
  } catch (error: any) {
    console.error('Error adding WeParlay Cash:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add WeParlay Cash'
    });
  }
});

// Deduct WeParlay Cash (for bets, purchases, etc.)
router.post('/deduct', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;
    const { amount, reason, betId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid amount'
      });
    }

    const user = await storage.getUser(userId);
    if (!user || user.weparlayCashBalance < amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient WeParlay Cash balance',
        currentBalance: user?.weparlayCashBalance || 0
      });
    }

    // Record the transaction
    const transaction = await storage.createWeparlayCashTransaction({
      userId: userId,
      amount: -amount,
      type: 'debit',
      reason: reason || 'Bet placement',
      betId: betId || null,
      balanceBefore: user.weparlayCashBalance
    });

    // Update user balance
    const updatedUser = await storage.updateUserWeplayTokenBalance(userId, -amount);

    res.json({
      success: true,
      message: 'WeParlay Cash deducted successfully',
      transaction,
      newBalance: updatedUser.weparlayCashBalance
    });
  } catch (error: any) {
    console.error('Error deducting WeParlay Cash:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to deduct WeParlay Cash'
    });
  }
});

// Get WeParlay Cash balance
router.get('/balance', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as any;
    const userId = currentUser.claims?.sub;

    const user = await storage.getUser(userId);
    
    res.json({
      success: true,
      balance: user?.weparlayCashBalance || 0,
      userId: userId
    });
  } catch (error: any) {
    console.error('Error fetching WeParlay Cash balance:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch balance'
    });
  }
});

// Admin: Get all WeParlay Cash activity (analytics)
router.get('/admin/analytics', isAuthenticated, restrictedAuthMiddleware, async (req: Request, res: Response) => {
  try {
    // Only allow admin access (you can add role-based auth here)
    const allTransactions = await storage.getAllWeparlayCashTransactions();
    
    const analytics = {
      totalCashIssued: 0,
      totalCashSpent: 0,
      totalCashInCirculation: 0,
      transactionCount: allTransactions.length,
      recentActivity: allTransactions.slice(-50) // Last 50 transactions
    };

    allTransactions.forEach(transaction => {
      if (transaction.amount > 0) {
        analytics.totalCashIssued += transaction.amount;
      } else {
        analytics.totalCashSpent += Math.abs(transaction.amount);
      }
    });

    analytics.totalCashInCirculation = analytics.totalCashIssued - analytics.totalCashSpent;

    res.json({
      success: true,
      analytics
    });
  } catch (error: any) {
    console.error('Error fetching WeParlay Cash analytics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

export default router;