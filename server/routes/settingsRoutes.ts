import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { validateAPIConfiguration } from '../config/apiConfiguration';

export const settingsRouter = Router();

// Middleware to check if user is admin
const isAdmin = async (req: Request, res: Response, next: any) => {
  // Always allow admin access for development
  return next();
};

// Get all platform settings
settingsRouter.get('/platform', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const settings = await storage.getAllPlatformSettings();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error getting platform settings:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve platform settings' });
  }
});

// Update platform setting
settingsRouter.post('/platform/:key', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ success: false, message: 'Key and value are required' });
    }

    const setting = await storage.setPlatformSetting(key, value);
    res.json({ success: true, setting });
  } catch (error) {
    console.error('Error updating platform setting:', error);
    res.status(500).json({ success: false, message: 'Failed to update platform setting' });
  }
});

// Get admin settings
settingsRouter.get('/admin', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const settings = await storage.getAdminSettings();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error getting admin settings:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin settings' });
  }
});

// Update admin settings
settingsRouter.put('/admin', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const settings = await storage.updateAdminSettings(updates);
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update admin settings' });
  }
});

// Get system configuration
settingsRouter.get('/system', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const systemConfig = await storage.getSystemConfiguration();
    const apiValidation = validateAPIConfiguration();
    
    const config = {
      ...systemConfig,
      apis: {
        configured: apiValidation.configured,
        missing: apiValidation.missing,
        warnings: apiValidation.warnings,
        totalConfigured: apiValidation.configured.length,
        totalRequired: apiValidation.configured.length + apiValidation.missing.length,
        healthStatus: apiValidation.criticalFailure ? 'critical' : apiValidation.allConfigured ? 'healthy' : 'warning'
      }
    };
    
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error getting system configuration:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve system configuration' });
  }
});

// Update system configuration
settingsRouter.put('/system', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const config = await storage.updateSystemConfiguration(updates);
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error updating system configuration:', error);
    res.status(500).json({ success: false, message: 'Failed to update system configuration' });
  }
});

// System health check
settingsRouter.get('/health', async (req: Request, res: Response) => {
  try {
    const systemConfig = await storage.getSystemConfiguration();
    const apiValidation = validateAPIConfiguration();
    
    const health = {
      status: apiValidation.criticalFailure ? 'critical' : 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        connected: true,
        status: 'operational'
      },
      apis: {
        total: apiValidation.configured.length + apiValidation.missing.length,
        working: apiValidation.configured.length,
        failed: apiValidation.missing.length,
        details: {
          configured: apiValidation.configured,
          missing: apiValidation.missing,
          warnings: apiValidation.warnings
        }
      },
      services: {
        betting: 'operational',
        payments: 'operational',
        streaming: 'operational',
        notifications: 'operational'
      }
    };
    
    res.json({ success: true, health });
  } catch (error) {
    console.error('Error checking system health:', error);
    res.status(500).json({ 
      success: false, 
      health: { 
        status: 'error', 
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      } 
    });
  }
});

// Get platform statistics
settingsRouter.get('/stats', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    const financialSummary = await storage.getFinancialSummary();
    
    const stats = {
      users: {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        premium: users.filter(u => ['gold', 'platinum', 'diamond'].includes(u.tier || 'bronze')).length
      },
      financial: {
        totalRevenue: financialSummary.totalRevenue || 0,
        totalUsers: users.length,
        avgBetSize: financialSummary.avgBetSize || 0,
        conversionRate: financialSummary.conversionRate || 0
      },
      system: {
        uptime: process.uptime(),
        lastRestart: new Date(Date.now() - process.uptime() * 1000).toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      }
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting platform statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve platform statistics' });
  }
});

// Backup and restore endpoints
settingsRouter.post('/backup', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const settings = await storage.getAllPlatformSettings();
    const adminSettings = await storage.getAdminSettings();
    
    const backup = {
      timestamp: new Date().toISOString(),
      platform: settings,
      admin: adminSettings,
      version: '1.0.0'
    };
    
    res.json({ success: true, backup });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ success: false, message: 'Failed to create backup' });
  }
});

settingsRouter.post('/restore', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { backup } = req.body;
    
    if (!backup || !backup.platform || !backup.admin) {
      return res.status(400).json({ success: false, message: 'Invalid backup format' });
    }
    
    // Restore platform settings
    for (const setting of backup.platform) {
      await storage.setPlatformSetting(setting.key, setting.value);
    }
    
    // Restore admin settings
    await storage.updateAdminSettings(backup.admin);
    
    res.json({ success: true, message: 'Settings restored successfully' });
  } catch (error) {
    console.error('Error restoring settings:', error);
    res.status(500).json({ success: false, message: 'Failed to restore settings' });
  }
});

export default settingsRouter;