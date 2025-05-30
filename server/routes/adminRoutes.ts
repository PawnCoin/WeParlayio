import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';

export const adminRouter = Router();

// Middleware to check if user is admin
const isAdmin = async (req: Request, res: Response, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userId = req.user?.claims?.sub;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const user = await storage.getUser(userId);
    
    // Check if user has admin role
    if (user && user.role === 'admin') {
      return next();
    } else {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all users (admin only)
adminRouter.get('/users', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    
    // Filter out sensitive information
    const filteredUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      balance: user.balance || 0,
      status: user.status || 'active',
      betsCount: user.betsCount || 0,
      winsCount: user.winsCount || 0,
    }));
    
    res.json(filteredUsers);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
});

// Get user by ID (admin only)
adminRouter.get('/users/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const user = await storage.getUser(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Failed to retrieve user' });
  }
});

// Update user status (admin only)
adminRouter.patch('/users/:id/status', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'suspended', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const user = await storage.updateUserStatus(req.params.id, status);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Financial summary (admin only)
adminRouter.get('/financial-summary', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const summary = await storage.getFinancialSummary();
    
    // Ensure we return proper zero values for a new platform
    const formattedSummary = {
      totalRevenue: (summary.totalRevenue || 0).toString(),
      revenueToday: (summary.revenueToday || 0).toString(),
      totalUsers: (summary.userCount || 0).toString(),
      activeUsers: (summary.activeUserCount || 0).toString(),
      newUsersToday: (summary.newUsersToday || 0).toString(),
      totalBets: (summary.totalBets || 0).toString(),
      avgBetSize: (summary.avgBetSize || 0).toString(),
      conversionRate: (summary.conversionRate || 0).toString(),
      profitMargin: (summary.profitMargin || 0).toString(),
      platformFees: (summary.platformFees || 0).toString(),
      pendingPayouts: (summary.pendingPayouts || 0).toString(),
      processingFees: (summary.processingFees || 0).toString(),
      monthlyGrowth: (summary.monthlyGrowth || 0).toString(),
      yearlyProjection: (summary.yearlyProjection || 0).toString(),
      revenueByCategory: summary.revenueByCategory || {
        "NBA": "0",
        "NFL": "0",
        "NHL": "0",
        "Other": "0"
      }
    };
    
    res.json(formattedSummary);
  } catch (error) {
    console.error('Error getting financial summary:', error);
    res.status(500).json({ message: 'Failed to retrieve financial summary' });
  }
});

// Recent transactions (admin only)
adminRouter.get('/transactions', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const transactions = await storage.getTransactions(
      Number(limit), 
      Number(offset)
    );
    
    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ message: 'Failed to retrieve transactions' });
  }
});

// Update bank account information (admin only)
adminRouter.post('/bank-account', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { accountName, bankName, accountNumber, routingNumber } = req.body;
    
    // Validate input
    if (!accountName || !bankName || !accountNumber || !routingNumber) {
      return res.status(400).json({ message: 'All bank account fields are required' });
    }
    
    // Get user ID from authenticated request
    const userId = (req.user as any).claims?.sub || 'admin-owner';
    
    const bankAccount = await storage.updateBankAccount({
      userId,
      accountName,
      bankName,
      accountNumber,
      routingNumber,
      isDefault: true
    });
    
    res.json(bankAccount);
  } catch (error) {
    console.error('Error updating bank account:', error);
    res.status(500).json({ message: 'Failed to update bank account information' });
  }
});

// Get bank account information (admin only)
adminRouter.get('/bank-account', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const bankAccount = await storage.getOwnerBankAccount();
    
    // If no bank account exists yet, return an empty object with proper structure
    if (!bankAccount) {
      return res.json({
        id: 0,
        userId: (req.user as any).claims?.sub || 'admin-owner',
        accountName: '',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Mask sensitive data for security
    const maskedAccount = {
      ...bankAccount,
      accountNumber: bankAccount.accountNumber ? 
        '*'.repeat(bankAccount.accountNumber.length - 4) + bankAccount.accountNumber.slice(-4) : '',
      routingNumber: bankAccount.routingNumber ? 
        '*'.repeat(bankAccount.routingNumber.length - 4) + bankAccount.routingNumber.slice(-4) : ''
    };
    
    res.json(maskedAccount);
  } catch (error) {
    console.error('Error fetching bank account:', error);
    res.status(500).json({ message: 'Failed to fetch bank account details' });
  }
});

// Update platform settings (admin only)
adminRouter.post('/platform-settings', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { registrationStatus, verificationLevel, commission, minBet, maxWithdrawal } = req.body;
    
    // Validate input
    if (!registrationStatus || !verificationLevel || !commission || !minBet || !maxWithdrawal) {
      return res.status(400).json({ message: 'All platform settings fields are required' });
    }
    
    const settings = await storage.updatePlatformSettings({
      registrationStatus,
      verificationLevel,
      commission,
      minBet,
      maxWithdrawal
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating platform settings:', error);
    res.status(500).json({ message: 'Failed to update platform settings' });
  }
});

// Update user privacy settings (admin only)
adminRouter.post('/privacy-settings', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { publicProfiles, bettingHistory, winStatistics, leagueRankings } = req.body;
    
    // Validate input
    if (publicProfiles === undefined || bettingHistory === undefined || 
        winStatistics === undefined || leagueRankings === undefined) {
      return res.status(400).json({ message: 'All privacy settings fields are required' });
    }
    
    const settings = await storage.updatePrivacySettings({
      publicProfiles,
      bettingHistory,
      winStatistics,
      leagueRankings
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({ message: 'Failed to update privacy settings' });
  }
});