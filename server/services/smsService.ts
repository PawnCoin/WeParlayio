import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export interface SMSOptions {
  to: string;
  message: string;
  type?: 'welcome' | 'bet_confirmation' | 'win_notification' | 'security_alert';
}

// SMS message templates
const getSMSTemplate = (type: string, data: any = {}) => {
  const templates = {
    welcome: `🎉 Welcome to WeParlay! You've been credited $${data.balance || '1000'} WeParlay Cash. Start betting now at weparlay.io`,
    bet_confirmation: `✅ Bet confirmed! ${data.event || 'Your bet'} - ${data.betType || ''} for $${data.amount || '0'}. Track at weparlay.io`,
    win_notification: `🏆 WINNER! You won $${data.winAmount || '0'} on ${data.event || 'your bet'}! Winnings added to your account. Play again at weparlay.io`,
    security_alert: `🔒 WeParlay Security Alert: ${data.action || 'Account activity detected'} at ${data.time || 'recent'}. Secure your account at weparlay.io/security`
  };
  
  return templates[type as keyof typeof templates] || data.message || 'WeParlay notification';
};

export const sendSMS = async (options: SMSOptions): Promise<boolean> => {
  try {
    // Check if Twilio credentials are available
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.error('❌ Twilio credentials not configured');
      return false;
    }

    let message = options.message;
    
    // Use template if type specified
    if (options.type) {
      message = getSMSTemplate(options.type, { message: options.message });
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: options.to
    });

    console.log('✅ SMS sent successfully:', result.sid);
    return true;
  } catch (error: any) {
    console.error('❌ SMS sending failed:', error.message);
    return false;
  }
};

// Convenience functions for common SMS notifications
export const sendWelcomeSMS = (to: string, userData: any) => {
  return sendSMS({
    to,
    type: 'welcome',
    message: userData.balance ? `Welcome to WeParlay! $${userData.balance} credited.` : 'Welcome to WeParlay!'
  });
};

export const sendBetConfirmationSMS = (to: string, betData: any) => {
  return sendSMS({
    to,
    type: 'bet_confirmation',
    message: `Bet confirmed: ${betData.event} - ${betData.betType} for $${betData.amount}`
  });
};

export const sendWinNotificationSMS = (to: string, winData: any) => {
  return sendSMS({
    to,
    type: 'win_notification',
    message: `Congratulations! You won $${winData.amount} on ${winData.event}`
  });
};

export const sendSecurityAlertSMS = (to: string, alertData: any) => {
  return sendSMS({
    to,
    type: 'security_alert',
    message: `Security Alert: ${alertData.action} detected on your WeParlay account`
  });
};

export const smsService = {
  sendSMS,
  sendWelcomeSMS,
  sendBetConfirmationSMS,
  sendWinNotificationSMS,
  sendSecurityAlertSMS
};