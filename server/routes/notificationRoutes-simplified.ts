import { Router } from 'express';
import { smsService } from '../services/smsService';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// SMS status endpoint
router.get('/sms/status', async (req, res) => {
  try {
    res.json({
      configured: smsService.isServiceConfigured(),
      message: smsService.isServiceConfigured() 
        ? 'SMS service is ready' 
        : 'SMS service requires Twilio configuration'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check SMS status' });
  }
});

// Send betting challenge SMS
router.post('/sms/betting-challenge', isAuthenticated, async (req, res) => {
  try {
    const { phoneNumber, challengerName, amount, event, odds } = req.body;
    
    if (!phoneNumber || !challengerName || !amount || !event) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const result = await smsService.sendBettingChallenge(phoneNumber, {
      challengerName,
      amount,
      event,
      odds: odds || 'Even'
    });
    
    res.json({
      success: result.success,
      message: result.success ? 'Challenge sent successfully' : result.error,
      messageId: result.messageId
    });
  } catch (error) {
    console.error('SMS challenge error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send SMS challenge' 
    });
  }
});

// Send bet alert SMS
router.post('/sms/bet-alert', isAuthenticated, async (req, res) => {
  try {
    const { phoneNumber, event, outcome, amount, won } = req.body;
    
    if (!phoneNumber || !event || !outcome || amount === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const result = await smsService.sendBetAlert(phoneNumber, {
      event,
      outcome,
      amount,
      won: won || false
    });
    
    res.json({
      success: result.success,
      message: result.success ? 'Alert sent successfully' : result.error,
      messageId: result.messageId
    });
  } catch (error) {
    console.error('SMS alert error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send SMS alert' 
    });
  }
});

export default router;