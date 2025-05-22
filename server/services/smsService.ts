import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export interface SMSOptions {
  to: string;
  message?: string;
  template?: 'bet_confirmation' | 'win_notification' | 'security_alert' | 'withdrawal_ready';
  templateData?: any;
}

// SMS templates
const getSMSTemplate = (template: string, data: any): string => {
  const templates = {
    bet_confirmation: `🎯 WeParlay: Bet confirmed! ${data.event || 'Event'} - ${data.betType || 'Bet'} for ${data.amount || '$0'}. Good luck! Track at weparlay.io`,
    
    win_notification: `🏆 WeParlay: WINNER! You won ${data.winAmount || '$0'} on ${data.event || 'your bet'}! Funds added to your account. Place another bet at weparlay.io`,
    
    security_alert: `🔒 WeParlay Security: ${data.action || 'Account activity'} detected at ${data.time || 'unknown time'}. If this wasn't you, secure your account at weparlay.io/security`,
    
    withdrawal_ready: `💰 WeParlay: Your withdrawal of ${data.amount || '$0'} is ready! Funds will arrive in your account within ${data.timeframe || '1-3 business days'}.`
  };
  
  return templates[template as keyof typeof templates] || data.message || 'WeParlay notification';
};

export const sendSMS = async (options: SMSOptions): Promise<boolean> => {
  try {
    // Check if Twilio credentials are available
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.error('❌ Twilio credentials not configured');
      return false;
    }
    
    let messageBody = options.message || 'WeParlay notification';
    
    // Use template if specified
    if (options.template && options.templateData) {
      messageBody = getSMSTemplate(options.template, options.templateData);
    }
    
    console.log('📱 Attempting to send SMS to:', options.to);
    const message = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: options.to
    });
    
    console.log('✅ SMS sent successfully:', message.sid);
    return true;
  } catch (error: any) {
    console.error('❌ SMS sending failed:', error.message);
    return false;
  }
};

// Convenience functions for common SMS notifications
export const sendBetConfirmationSMS = (to: string, betData: any) => {
  return sendSMS({
    to,
    template: 'bet_confirmation',
    templateData: betData
  });
};

export const sendWinNotificationSMS = (to: string, winData: any) => {
  return sendSMS({
    to,
    template: 'win_notification',
    templateData: winData
  });
};

export const sendSecurityAlertSMS = (to: string, alertData: any) => {
  return sendSMS({
    to,
    template: 'security_alert',
    templateData: alertData
  });
};

export const sendWithdrawalReadySMS = (to: string, withdrawalData: any) => {
  return sendSMS({
    to,
    template: 'withdrawal_ready',
    templateData: withdrawalData
  });
};