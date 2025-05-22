import { Router } from 'express';
import { sendEmail, sendWelcomeEmail, sendBetConfirmation, sendWinNotification, sendSecurityAlert, sendAdminAlert } from '../services/emailService';
import { sendSMS, sendBetConfirmationSMS, sendWinNotificationSMS, sendSecurityAlertSMS } from '../services/smsService';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Test email endpoint
router.post('/test-email', isAuthenticated, async (req, res) => {
  try {
    const { type = 'welcome' } = req.body;
    const user = req.user as any;
    
    let success = false;
    
    switch (type) {
      case 'welcome':
        success = await sendWelcomeEmail('test@example.com', { name: 'Test User' });
        break;
      case 'bet':
        success = await sendBetConfirmation('test@example.com', {
          event: 'Lakers vs Warriors',
          betType: 'Lakers +5.5',
          amount: '$50',
          potentialWin: '$95',
          odds: '+190'
        });
        break;
      case 'win':
        success = await sendWinNotification('test@example.com', {
          winAmount: '$95',
          event: 'Lakers vs Warriors',
          betType: 'Lakers +5.5',
          odds: '+190'
        });
        break;
      case 'security':
        success = await sendSecurityAlert('test@example.com', {
          action: 'Login from new device',
          time: new Date().toLocaleString(),
          ipAddress: '192.168.1.1',
          location: 'Los Angeles, CA'
        });
        break;
      default:
        success = await sendEmail({
          to: 'test@example.com',
          subject: 'WeParlay Test Email',
          html: '<h1>Test email from WeParlay!</h1><p>Email system is working correctly.</p>'
        });
    }
    
    res.json({ success, message: success ? 'Email sent successfully' : 'Email sending failed' });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ success: false, message: 'Email test failed' });
  }
});

// Test SMS endpoint
router.post('/test-sms', isAuthenticated, async (req, res) => {
  try {
    const { phone, type = 'bet' } = req.body;
    
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number required' });
    }
    
    let success = false;
    
    switch (type) {
      case 'bet':
        success = await sendBetConfirmationSMS(phone, {
          event: 'Lakers vs Warriors',
          betType: 'Lakers +5.5',
          amount: '$50'
        });
        break;
      case 'win':
        success = await sendWinNotificationSMS(phone, {
          winAmount: '$95',
          event: 'Lakers vs Warriors'
        });
        break;
      case 'security':
        success = await sendSecurityAlertSMS(phone, {
          action: 'Login from new device',
          time: new Date().toLocaleString()
        });
        break;
      default:
        success = await sendSMS({
          to: phone,
          message: '🎯 WeParlay Test: SMS system is working! Welcome to WeParlay.io'
        });
    }
    
    res.json({ success, message: success ? 'SMS sent successfully' : 'SMS sending failed' });
  } catch (error) {
    console.error('SMS test error:', error);
    res.status(500).json({ success: false, message: 'SMS test failed' });
  }
});

// Send welcome email (used during user registration)
router.post('/welcome-email', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }
    
    const success = await sendWelcomeEmail(email, { name });
    res.json({ success, message: success ? 'Welcome email sent' : 'Failed to send welcome email' });
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({ success: false, message: 'Welcome email failed' });
  }
});

// Send bet confirmation notifications
router.post('/bet-confirmation', async (req, res) => {
  try {
    const { email, phone, betData } = req.body;
    
    const results = { email: false, sms: false };
    
    if (email) {
      results.email = await sendBetConfirmation(email, betData);
    }
    
    if (phone) {
      results.sms = await sendBetConfirmationSMS(phone, betData);
    }
    
    res.json({ 
      success: results.email || results.sms, 
      results,
      message: 'Bet confirmation notifications sent'
    });
  } catch (error) {
    console.error('Bet confirmation error:', error);
    res.status(500).json({ success: false, message: 'Bet confirmation failed' });
  }
});

// Send win notifications
router.post('/win-notification', async (req, res) => {
  try {
    const { email, phone, winData } = req.body;
    
    const results = { email: false, sms: false };
    
    if (email) {
      results.email = await sendWinNotification(email, winData);
    }
    
    if (phone) {
      results.sms = await sendWinNotificationSMS(phone, winData);
    }
    
    res.json({ 
      success: results.email || results.sms, 
      results,
      message: 'Win notifications sent'
    });
  } catch (error) {
    console.error('Win notification error:', error);
    res.status(500).json({ success: false, message: 'Win notification failed' });
  }
});

// Send security alerts
router.post('/security-alert', async (req, res) => {
  try {
    const { email, phone, alertData } = req.body;
    
    const results = { email: false, sms: false };
    
    if (email) {
      results.email = await sendSecurityAlert(email, alertData);
    }
    
    if (phone) {
      results.sms = await sendSecurityAlertSMS(phone, alertData);
    }
    
    res.json({ 
      success: results.email || results.sms, 
      results,
      message: 'Security alerts sent'
    });
  } catch (error) {
    console.error('Security alert error:', error);
    res.status(500).json({ success: false, message: 'Security alert failed' });
  }
});

// Send admin alerts
router.post('/admin-alert', isAuthenticated, async (req, res) => {
  try {
    const { alertData } = req.body;
    
    const success = await sendAdminAlert(alertData);
    res.json({ success, message: success ? 'Admin alert sent' : 'Admin alert failed' });
  } catch (error) {
    console.error('Admin alert error:', error);
    res.status(500).json({ success: false, message: 'Admin alert failed' });
  }
});

export default router;