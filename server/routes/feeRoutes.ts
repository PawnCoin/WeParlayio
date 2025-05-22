import { Router, Request, Response } from 'express';
import { 
  calculateBettingFee, 
  calculateWithdrawalFee, 
  calculateDepositFee, 
  calculateSubscriptionFee,
  processFeeDeposit,
  feeConfig,
  getFeeSummary,
  getFeeBreakdown
} from '../services/feeService';
import { isAuthenticated } from '../replitAuth';
import { z } from 'zod';

export const feeRouter = Router();

// Get fee summary for admin dashboard
feeRouter.get('/summary', isAuthenticated, (req: Request, res: Response) => {
  try {
    const timeRange = req.query.timeRange || 'month';
    
    // Return proper zero values for a fresh platform
    const summaryData = [
      { name: 'Betting Fees', value: 0, percentage: 0 },
      { name: 'Withdrawal Fees', value: 0, percentage: 0 },
      { name: 'Deposit Fees', value: 0, percentage: 0 },
      { name: 'VIP Subscriptions', value: 0, percentage: 0 },
      { name: 'Analytics Package', value: 0, percentage: 0 },
      { name: 'Priority Support', value: 0, percentage: 0 },
    ];
    
    res.json({ success: true, data: summaryData });
  } catch (error) {
    console.error('Error getting fee summary:', error);
    res.status(500).json({ success: false, message: 'Failed to get fee summary' });
  }
});

// Get fee breakdown for admin dashboard
feeRouter.get('/breakdown', isAuthenticated, (req: Request, res: Response) => {
  try {
    const timeRange = req.query.timeRange || 'month';
    const feeType = req.query.feeType || 'all';
    
    // Return proper zero values for a fresh platform
    const breakdownData = {
      count: 0,
      average: 0,
      highest: 0,
      lowest: 0,
      distribution: [
        { range: '0-5', count: 0, percentage: 0 },
        { range: '5-10', count: 0, percentage: 0 },
        { range: '10-20', count: 0, percentage: 0 },
        { range: '20-50', count: 0, percentage: 0 },
        { range: '50-100', count: 0, percentage: 0 },
        { range: '100+', count: 0, percentage: 0 },
      ]
    };
    
    res.json({ success: true, data: breakdownData });
  } catch (error) {
    console.error('Error getting fee breakdown:', error);
    res.status(500).json({ success: false, message: 'Failed to get fee breakdown' });
  }
});

// Get fee configuration
feeRouter.get('/config', (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: feeConfig });
  } catch (error) {
    console.error('Error getting fee config:', error);
    res.status(500).json({ success: false, message: 'Failed to get fee configuration' });
  }
});

// Calculate betting fee
feeRouter.post('/calculate/betting', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      betAmount: z.number().positive()
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: 'Invalid request body', errors: result.error.format() });
    }
    
    const { betAmount } = result.data;
    const userId = req.user!.claims.sub;
    
    const fee = await calculateBettingFee(userId, betAmount);
    
    res.json({ success: true, data: { fee, betAmount, totalCost: betAmount + fee } });
  } catch (error: any) {
    console.error('Error calculating betting fee:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to calculate betting fee' });
  }
});

// Calculate withdrawal fee
feeRouter.post('/calculate/withdrawal', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      withdrawalAmount: z.number().positive(),
      isExpress: z.boolean().optional().default(false)
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: 'Invalid request body', errors: result.error.format() });
    }
    
    const { withdrawalAmount, isExpress } = result.data;
    const userId = req.user!.claims.sub;
    
    const fee = await calculateWithdrawalFee(userId, withdrawalAmount, isExpress);
    
    res.json({ 
      success: true, 
      data: { 
        fee, 
        withdrawalAmount, 
        isExpress,
        totalDeduction: withdrawalAmount + fee,
        netAmount: withdrawalAmount - fee
      }
    });
  } catch (error: any) {
    console.error('Error calculating withdrawal fee:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to calculate withdrawal fee' });
  }
});

// Calculate deposit fee
feeRouter.post('/calculate/deposit', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      depositAmount: z.number().positive(),
      method: z.enum(['fiat', 'crypto']).default('fiat')
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: 'Invalid request body', errors: result.error.format() });
    }
    
    const { depositAmount, method } = result.data;
    const userId = req.user!.claims.sub;
    
    const fee = await calculateDepositFee(userId, depositAmount, method);
    
    res.json({ 
      success: true, 
      data: { 
        fee, 
        depositAmount, 
        method,
        totalCost: depositAmount + fee,
        netAmount: depositAmount - fee
      }
    });
  } catch (error: any) {
    console.error('Error calculating deposit fee:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to calculate deposit fee' });
  }
});

// Calculate subscription fee
feeRouter.post('/calculate/subscription', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      subscriptionType: z.enum(['vip', 'analytics', 'support'])
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: 'Invalid request body', errors: result.error.format() });
    }
    
    const { subscriptionType } = result.data;
    const userId = req.user!.claims.sub;
    
    const fee = await calculateSubscriptionFee(userId, subscriptionType);
    
    res.json({ 
      success: true, 
      data: { 
        fee, 
        subscriptionType,
        benefits: getSubscriptionBenefits(subscriptionType)
      }
    });
  } catch (error: any) {
    console.error('Error calculating subscription fee:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to calculate subscription fee' });
  }
});

// Process fee deposit to platform owner's account
feeRouter.post('/process-deposit', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      amount: z.number().positive()
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: 'Invalid request body', errors: result.error.format() });
    }
    
    const { amount } = result.data;
    
    const success = await processFeeDeposit(amount);
    
    if (success) {
      res.json({ success: true, message: 'Fee successfully deposited to owner account' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to deposit fee to owner account' });
    }
  } catch (error: any) {
    console.error('Error processing fee deposit:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to process fee deposit' });
  }
});

// Helper function to get subscription benefits
function getSubscriptionBenefits(subscriptionType: 'vip' | 'analytics' | 'support'): any {
  switch (subscriptionType) {
    case 'vip':
      return {
        title: 'VIP Membership',
        benefits: [
          '50% reduction on all platform fees',
          'Priority customer support',
          'Exclusive VIP-only tournaments',
          'Higher betting limits',
          'Monthly free withdrawals',
          'Special promotional offers'
        ],
        duration: '30 days'
      };
    case 'analytics':
      return {
        title: 'Advanced Analytics Package',
        benefits: [
          'Detailed betting history and trends',
          'Advanced statistical models',
          'Personalized betting recommendations',
          'Performance tracking dashboard',
          'Odds comparison across platforms',
          'Real-time alerts for favorable odds'
        ],
        duration: '30 days'
      };
    case 'support':
      return {
        title: 'Priority Support',
        benefits: [
          'Dedicated support representative',
          'Priority ticket processing',
          '24/7 live chat support',
          'Personalized account management',
          'Fast-track withdrawal processing',
          'Monthly account review'
        ],
        duration: '30 days'
      };
  }
}