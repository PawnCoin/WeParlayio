
import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Record user consent
router.post('/record-consent', async (req, res) => {
  try {
    const { 
      userId, 
      consentType, 
      consented, 
      source, 
      additionalData 
    } = req.body;

    const consentRecord = {
      id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      consentType, // 'terms', 'privacy', 'marketing', 'cookies', 'data-processing'
      consented, // true/false
      timestamp: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      source, // 'registration', 'settings', 'popup', 'login'
      additionalData: additionalData || {},
      createdAt: new Date()
    };

    // Store consent record
    await storage.recordConsent(consentRecord);

    res.json({
      success: true,
      message: 'Consent recorded successfully',
      consentId: consentRecord.id
    });

  } catch (error) {
    console.error('Consent recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record consent'
    });
  }
});

// Get user consent history
router.get('/user-consents/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const consents = await storage.getUserConsents(userId);
    
    res.json({
      success: true,
      consents: consents || []
    });

  } catch (error) {
    console.error('Get user consents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve consents'
    });
  }
});

// Update consent preferences
router.put('/update-consent/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { consents } = req.body;

    // Record each consent change
    for (const consent of consents) {
      const consentRecord = {
        id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId,
        consentType: consent.type,
        consented: consent.value,
        timestamp: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        source: 'settings-update',
        additionalData: { previousValue: consent.previousValue },
        createdAt: new Date()
      };

      await storage.recordConsent(consentRecord);
    }

    res.json({
      success: true,
      message: 'Consent preferences updated successfully'
    });

  } catch (error) {
    console.error('Update consent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update consent preferences'
    });
  }
});

// Get consent audit trail (admin only)
router.get('/audit-trail', async (req, res) => {
  try {
    const { startDate, endDate, consentType, userId } = req.query;
    
    const auditData = await storage.getConsentAuditTrail({
      startDate,
      endDate,
      consentType,
      userId
    });

    res.json({
      success: true,
      auditTrail: auditData
    });

  } catch (error) {
    console.error('Consent audit trail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit trail'
    });
  }
});

// Export user consent data (GDPR compliance)
router.get('/export/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userData = await storage.getUser(userId);
    const consents = await storage.getUserConsents(userId);

    const exportData = {
      user: {
        id: userData.id,
        email: userData.email,
        username: userData.username
      },
      consentHistory: consents,
      exportedAt: new Date(),
      exportedBy: 'user-request'
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=consent-data-${userId}.json`);
    res.json(exportData);

  } catch (error) {
    console.error('Consent export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export consent data'
    });
  }
});

export default router;
