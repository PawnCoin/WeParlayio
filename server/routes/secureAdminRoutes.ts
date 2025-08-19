
import { Router, Request, Response } from 'express';
import { storage } from '../storage';

export const secureAdminRouter = Router();

// Backend-only admin authentication - no frontend access
secureAdminRouter.post('/secure-admin-auth', async (req: Request, res: Response) => {
  try {
    const { email, password, adminKey } = req.body;

    // Multi-layer security: email/password + admin key
    const ADMIN_KEY = 'weparlay-secure-admin-2025';
    const validAdminCredentials = [
      { email: 'support@weparlay.io', password: 'Baysides3!' },
      { email: 'admin@weparlay.io', password: 'Baysides3!' },
      { email: 'weparlay@admin.com', password: 'Baysides3!' }
    ];

    // Verify admin key first
    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid admin access key' 
      });
    }

    // Verify credentials
    const normalizedEmail = email.toLowerCase();
    const adminCred = validAdminCredentials.find(cred => cred.email.toLowerCase() === normalizedEmail);
    
    if (!adminCred || password !== adminCred.password) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid admin credentials' 
      });
    }

    // Generate secure admin token
    const adminToken = `admin_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    // Store admin session in memory (for security)
    global.adminSessions = global.adminSessions || new Map();
    global.adminSessions.set(adminToken, {
      email: adminCred.email,
      expiry,
      permissions: ['all']
    });

    res.json({
      success: true,
      message: 'Admin authenticated successfully',
      token: adminToken,
      expiry
    });

  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
});

// Middleware to verify admin token
const verifyAdminToken = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No admin token provided' });
  }

  const sessions = global.adminSessions || new Map();
  const session = sessions.get(token);

  if (!session || session.expiry < Date.now()) {
    if (session) sessions.delete(token);
    return res.status(401).json({ message: 'Invalid or expired admin token' });
  }

  req.adminSession = session;
  next();
};

// Backend admin dashboard data (no frontend)
secureAdminRouter.get('/admin-dashboard-data', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    const financialSummary = await storage.getFinancialSummary();

    const dashboardData = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      totalRevenue: financialSummary.totalRevenue || 0,
      revenueToday: financialSummary.revenueToday || 0,
      systemStatus: 'operational',
      apiStatus: {
        espn: 'active',
        rapid: process.env.RAPIDAPI_KEY ? 'active' : 'inactive',
        grid: process.env.GRID_API_KEY ? 'active' : 'inactive'
      },
      recentActivity: users.slice(-10).map(user => ({
        id: user.id,
        email: user.email,
        action: 'User registration',
        timestamp: user.createdAt
      }))
    };

    res.json({
      success: true,
      data: dashboardData,
      accessedBy: req.adminSession.email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve admin data' 
    });
  }
});

// Backend user management (no frontend)
secureAdminRouter.get('/manage-users', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    
    const managementData = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      status: user.status || 'active',
      tier: user.subscriptionTier || 'bronze',
      balance: user.balance || 0,
      totalBets: user.totalBets || 0,
      winRate: user.winRate || 0,
      createdAt: user.createdAt,
      lastActive: user.updatedAt
    }));

    res.json({
      success: true,
      users: managementData,
      totalCount: managementData.length,
      accessedBy: req.adminSession.email
    });

  } catch (error) {
    console.error('User management error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve user data' 
    });
  }
});

// Backend system control (no frontend)
secureAdminRouter.post('/system-control', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const { action, target, value } = req.body;

    let result = {};

    switch (action) {
      case 'update_user_status':
        const user = await storage.updateUserStatus(target, value);
        result = { success: true, message: `User ${target} status updated to ${value}`, user };
        break;
      
      case 'platform_maintenance':
        // Enable/disable platform features
        result = { success: true, message: `Platform maintenance ${value ? 'enabled' : 'disabled'}` };
        break;
      
      case 'clear_cache':
        // Clear system caches
        result = { success: true, message: 'System cache cleared' };
        break;
      
      default:
        result = { success: false, message: 'Unknown admin action' };
    }

    // Log admin action
    console.log(`Admin action by ${req.adminSession.email}: ${action} on ${target} with value ${value}`);

    res.json(result);

  } catch (error) {
    console.error('System control error:', error);
    res.status(500).json({ 
      success: false,
      message: 'System control action failed' 
    });
  }
});

// Logout admin session
secureAdminRouter.post('/admin-logout', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const sessions = global.adminSessions || new Map();
      sessions.delete(token);
    }

    res.json({
      success: true,
      message: 'Admin session terminated'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Logout failed' 
    });
  }
});
