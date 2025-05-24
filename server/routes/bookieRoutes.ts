import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { bookieRevenueManager } from '../services/bookieRevenueService';
import { storage } from '../storage';

const router = Router();

// Admin/Owner authentication middleware
const isOwner = async (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const user = await storage.getUser(req.user.claims.sub);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Owner/Admin access required' });
  }
  
  next();
};

// Get revenue dashboard
router.get('/revenue/dashboard', isOwner, async (req, res) => {
  try {
    const dailyRevenue = await bookieRevenueManager.getRevenueReport('daily');
    const weeklyRevenue = await bookieRevenueManager.getRevenueReport('weekly');
    const monthlyRevenue = await bookieRevenueManager.getRevenueReport('monthly');
    const allTimeRevenue = await bookieRevenueManager.getRevenueReport('all');
    
    res.json({
      daily: dailyRevenue,
      weekly: weeklyRevenue,
      monthly: monthlyRevenue,
      allTime: allTimeRevenue,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get revenue settings
router.get('/settings', isOwner, async (req, res) => {
  try {
    const settings = await bookieRevenueManager.getRevenueSettings();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update revenue settings
router.patch('/settings', isOwner, async (req, res) => {
  try {
    const updatedSettings = await bookieRevenueManager.updateRevenueSettings(req.body);
    res.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Process owner withdrawal
router.post('/withdraw', isOwner, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount required' });
    }
    
    const result = await bookieRevenueManager.processOwnerWithdrawal(amount);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get financial summary
router.get('/financial-summary', isOwner, async (req, res) => {
  try {
    const summary = await storage.getFinancialSummary();
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update owner bank account
router.post('/bank-account', isOwner, async (req, res) => {
  try {
    const {
      bankName,
      accountNumber,
      routingNumber,
      accountType,
      accountHolderName
    } = req.body;
    
    const bankAccount = await storage.updateBankAccount({
      userId: 'owner',
      bankName,
      accountNumber,
      routingNumber,
      accountType,
      accountHolderName,
      isVerified: false // Manual verification required
    });
    
    res.json({
      message: 'Bank account updated successfully',
      bankAccount: {
        ...bankAccount,
        accountNumber: `****${accountNumber.slice(-4)}` // Hide full account number
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Calculate potential revenue for a bet amount
router.post('/calculate-revenue', isOwner, async (req, res) => {
  try {
    const { betAmount, paymentMethod } = req.body;
    
    if (!betAmount || !paymentMethod) {
      return res.status(400).json({ message: 'Bet amount and payment method required' });
    }
    
    const calculation = await bookieRevenueManager.calculateBetRevenue(betAmount, paymentMethod);
    res.json(calculation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;