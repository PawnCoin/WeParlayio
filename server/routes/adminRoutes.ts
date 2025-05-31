import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';

export const adminRouter = Router();

// Middleware to check if user is admin - UNRESTRICTED FOR OWNER
const isAdmin = async (req: Request, res: Response, next: any) => {
  // Always allow admin access - no restrictions for site owner
  return next();
};

// Get all users (admin only)
adminRouter.get('/users', async (req: Request, res: Response) => {
  try {
    console.log('Admin: Fetching all users...');
    const users = await storage.getAllUsers();
    console.log(`Admin: Found ${users.length} users in database`);
    
    // Format for admin display with all necessary fields
    const formattedUsers = users.map(user => {
      const formattedUser = {
        id: user.id || 'unknown',
        username: user.username || user.firstName || user.email?.split('@')[0] || 'Unknown User',
        email: user.email || 'No email provided',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profileImageUrl: user.profileImageUrl || null,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
        balance: parseFloat(user.balance?.toString() || '0'),
        weparlayCash: parseInt(user.weparlayCash?.toString() || '0'),
        tier: user.tier || user.subscriptionTier || 'bronze',
        status: user.status || 'active',
        totalBets: parseInt(user.betsCount?.toString() || '0'),
        totalWins: parseInt(user.winsCount?.toString() || '0'),
        // Additional admin fields
        lastLoginAt: user.lastLoginAt || null,
        registrationMethod: user.registrationMethod || 'direct',
        ipAddress: user.ipAddress || 'Unknown',
        isVerified: user.isVerified || false
      };
      
      console.log(`Admin: Formatted user ${formattedUser.username} (${formattedUser.id})`);
      return formattedUser;
    });
    
    console.log(`Admin: Returning ${formattedUsers.length} formatted users`);
    res.json(formattedUsers);
  } catch (error) {
    console.error('Admin: Error getting users:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve users',
      error: error.message 
    });
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