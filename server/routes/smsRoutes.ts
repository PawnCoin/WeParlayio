import express from 'express';
import { 
  checkSmsPermissions, 
  requireSmsPermission, 
  requireMmsPermission, 
  requireTemplatePermission,
  rateLimitByTier 
} from '../middleware/communicationRestrictions';
import { sendSMS, sendMMS, TwilioService } from '../services/smsService';

const router = express.Router();
const twilioService = new TwilioService();

// VIP SMS sending endpoint
router.post('/send-sms', checkSmsPermissions, requireSmsPermission, rateLimitByTier, async (req, res) => {
  try {
    const { phone, message, type } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ message: 'Phone number and message are required' });
    }

    const success = await sendSMS({ to: phone, message, type });
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'SMS sent successfully',
        tier: req.user?.subscriptionTier 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send SMS' 
      });
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Diamond MMS sending endpoint
router.post('/send-mms', checkSmsPermissions, requireMmsPermission, rateLimitByTier, async (req, res) => {
  try {
    const { phone, message, mediaUrl } = req.body;
    
    if (!phone || !message || !mediaUrl) {
      return res.status(400).json({ message: 'Phone number, message, and media URL are required' });
    }

    const success = await twilioService.sendMms(phone, message, mediaUrl);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'MMS sent successfully',
        tier: req.user?.subscriptionTier 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send MMS' 
      });
    }
  } catch (error) {
    console.error('MMS sending error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin template management endpoints
let smsTemplates = {
  welcome: 'Welcome to WeParlay! You\'ve been credited ${balance} WeParlay Cash. Start betting now!',
  bet_confirmation: 'Bet confirmed! ${event} - ${betType} for ${amount}. Track your bet in the app.',
  win_notification: 'WINNER! You won ${winAmount} on ${event}! Winnings added to your account.',
  security_alert: 'WeParlay Security Alert: ${action} detected at ${time}. Secure your account immediately.'
};

// Get SMS templates (Admin only)
router.get('/templates', checkSmsPermissions, requireTemplatePermission, (req, res) => {
  res.json({ 
    success: true, 
    templates: smsTemplates 
  });
});

// Save SMS template (Admin only)
router.post('/templates', checkSmsPermissions, requireTemplatePermission, async (req, res) => {
  try {
    const { templateType, template } = req.body;
    
    if (!templateType || !template) {
      return res.status(400).json({ message: 'Template type and content are required' });
    }

    if (!smsTemplates.hasOwnProperty(templateType)) {
      return res.status(400).json({ message: 'Invalid template type' });
    }

    smsTemplates[templateType as keyof typeof smsTemplates] = template;
    
    res.json({ 
      success: true, 
      message: 'Template saved successfully',
      templates: smsTemplates
    });
  } catch (error) {
    console.error('Template save error:', error);
    res.status(500).json({ message: 'Failed to save template' });
  }
});

// Get user messaging permissions
router.get('/permissions', checkSmsPermissions, (req, res) => {
  res.json({
    success: true,
    permissions: req.messagingPermissions,
    tier: req.user?.subscriptionTier,
    dailyLimit: req.rateLimit
  });
});

export default router;