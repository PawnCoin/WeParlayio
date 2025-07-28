/**
 * Security Routes for WeParlay
 * Handles 2FA, security monitoring, and compliance endpoints
 */

import { Router } from 'express';
import { TwoFactorAuthService } from '../services/twoFactorAuthService';
import { logger } from '../services/enhancedLoggingService';
import { performanceMonitor } from '../services/performanceMonitoringService';
import { securityScanner } from '../services/dependencySecurityScanner';
import { WeParLaySecurity } from '../middleware/security';

const router = Router();

// Apply security middleware
router.use(WeParLaySecurity.createRateLimit());
router.use(WeParLaySecurity.validateInput());

/**
 * 2FA Setup Endpoint
 */
router.post('/2fa/setup', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Get user email from database (implement based on your user storage)
    const userEmail = `user${userId}@weparlay.io`; // Placeholder - replace with actual user lookup
    
    const setup = await TwoFactorAuthService.generateTwoFactorSetup(userId, userEmail);
    
    res.json({
      success: true,
      qrCode: setup.qrCode,
      secret: setup.secret,
      backupCodes: setup.backupCodes,
      manualEntryKey: setup.manualEntryKey,
    });
  } catch (error) {
    logger.error('2FA setup failed', error, { userId: req.body.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to generate 2FA setup',
    });
  }
});

/**
 * 2FA Verification Endpoint
 */
router.post('/2fa/verify', async (req, res) => {
  try {
    const { userId, token, secret, backupCodes, smsCode } = req.body;
    
    if (!userId || !token || !secret) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check rate limiting
    const rateCheck = TwoFactorAuthService.checkRateLimit(userId);
    
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.',
        lockUntil: rateCheck.lockUntil,
      });
    }

    const verification = await TwoFactorAuthService.verifyTwoFactorAttempt(
      userId,
      secret,
      token,
      backupCodes || [],
      smsCode
    );

    TwoFactorAuthService.recordAttempt(userId, verification.isValid);

    if (verification.isValid) {
      res.json({
        success: true,
        type: verification.type,
        usedBackupCode: verification.usedBackupCode,
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid verification code',
        remainingAttempts: rateCheck.remainingAttempts,
      });
    }
  } catch (error) {
    logger.error('2FA verification failed', error, { userId: req.body.userId });
    res.status(500).json({
      success: false,
      message: 'Verification failed',
    });
  }
});

/**
 * 2FA Setup Verification (during initial setup)
 */
router.post('/2fa/verify-setup', async (req, res) => {
  try {
    const { userId, token, secret } = req.body;
    
    if (!userId || !token || !secret) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const isValid = TwoFactorAuthService.verifyToken(secret, token);
    
    if (isValid) {
      // In production, save the 2FA settings to the database here
      logger.logAudit({
        action: '2fa_enabled',
        resource: 'user_security',
        userId,
        context: { timestamp: new Date().toISOString() },
      });

      res.json({
        success: true,
        message: '2FA setup verified successfully',
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid verification code',
      });
    }
  } catch (error) {
    logger.error('2FA setup verification failed', error, { userId: req.body.userId });
    res.status(500).json({
      success: false,
      message: 'Setup verification failed',
    });
  }
});

/**
 * Regenerate Backup Codes
 */
router.post('/2fa/regenerate-backup-codes', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const newCodes = TwoFactorAuthService.regenerateBackupCodes(userId);
    
    res.json({
      success: true,
      backupCodes: newCodes,
    });
  } catch (error) {
    logger.error('Backup code regeneration failed', error, { userId: req.body.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate backup codes',
    });
  }
});

/**
 * Security Status Dashboard
 */
router.get('/status', async (req, res) => {
  try {
    const securityStatus = await securityScanner.getSecurityStatus();
    const performanceReport = performanceMonitor.generatePerformanceReport();
    
    res.json({
      success: true,
      security: securityStatus,
      performance: performanceReport,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get security status', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve security status',
    });
  }
});

/**
 * Dependency Security Scan
 */
router.get('/dependency-scan', async (req, res) => {
  try {
    const scanResult = await securityScanner.performSecurityScan();
    
    res.json({
      success: true,
      scan: scanResult,
    });
  } catch (error) {
    logger.error('Dependency scan failed', error);
    res.status(500).json({
      success: false,
      message: 'Security scan failed',
    });
  }
});

/**
 * Performance Metrics
 */
router.get('/performance', async (req, res) => {
  try {
    const { timeWindow } = req.query;
    const windowMs = timeWindow ? parseInt(timeWindow as string) : 60 * 60 * 1000; // 1 hour default
    
    const apiSummary = performanceMonitor.getAPIPerformanceSummary(windowMs);
    const dbSummary = performanceMonitor.getDatabasePerformanceSummary(windowMs);
    
    res.json({
      success: true,
      api: apiSummary,
      database: dbSummary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get performance metrics', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve performance metrics',
    });
  }
});

/**
 * Compliance Report
 */
router.get('/compliance-report', async (req, res) => {
  try {
    const report = await securityScanner.generateComplianceReport();
    
    res.json({
      success: true,
      report,
    });
  } catch (error) {
    logger.error('Compliance report generation failed', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate compliance report',
    });
  }
});

/**
 * Security Event Logs (Admin only)
 */
router.get('/security-logs', async (req, res) => {
  try {
    // In production, implement proper admin authentication
    const isAdmin = (req as any).user?.role === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    // Return recent security events (implement based on your logging storage)
    res.json({
      success: true,
      message: 'Security logs available in server logs',
      logFiles: [
        'logs/security.log',
        'logs/audit.log',
        'logs/betting.log',
      ],
    });
  } catch (error) {
    logger.error('Failed to retrieve security logs', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve security logs',
    });
  }
});

/**
 * Test Security Alert (Admin only - for testing purposes)
 */
router.post('/test-alert', async (req, res) => {
  try {
    const isAdmin = (req as any).user?.role === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { alertType, severity } = req.body;
    
    logger.logSecurityEvent({
      type: alertType || 'suspicious_activity',
      severity: severity || 'medium',
      context: {
        userId: (req as any).user?.id,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      },
      details: {
        message: 'Test security alert triggered by admin',
        testAlert: true,
      },
    });

    res.json({
      success: true,
      message: 'Test security alert logged',
    });
  } catch (error) {
    logger.error('Failed to create test alert', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test alert',
    });
  }
});

export default router;