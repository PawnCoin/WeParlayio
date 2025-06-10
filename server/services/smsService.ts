import twilio from 'twilio';

interface SMSServiceConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export class SMSService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string;
  private isConfigured: boolean = false;

  constructor() {
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    this.initialize();
  }

  private initialize(): void {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && phoneNumber) {
      this.client = twilio(accountSid, authToken);
      this.fromNumber = phoneNumber;
      this.isConfigured = true;
      console.log('✅ SMS Service initialized with Twilio');
    } else {
      console.log('⚠️ SMS Service not configured - Twilio credentials missing');
      this.isConfigured = false;
    }
  }

  async sendBettingChallenge(toNumber: string, challengeDetails: {
    challengerName: string;
    amount: number;
    event: string;
    odds: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured || !this.client) {
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    const message = `🎯 WeParlay Betting Challenge!
${challengeDetails.challengerName} challenges you:
Event: ${challengeDetails.event}
Odds: ${challengeDetails.odds}
Amount: $${challengeDetails.amount}

Accept at weparlay.io`;

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: toNumber
      });

      return {
        success: true,
        messageId: result.sid
      };
    } catch (error: any) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  async sendBetAlert(toNumber: string, alertDetails: {
    event: string;
    outcome: string;
    amount: number;
    won: boolean;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured || !this.client) {
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    const message = alertDetails.won 
      ? `🎉 WeParlay Win! You won $${alertDetails.amount} on ${alertDetails.event}. Outcome: ${alertDetails.outcome}`
      : `😔 WeParlay Update: Your $${alertDetails.amount} bet on ${alertDetails.event} didn't win. Outcome: ${alertDetails.outcome}`;

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: toNumber
      });

      return {
        success: true,
        messageId: result.sid
      };
    } catch (error: any) {
      console.error('SMS alert failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS alert'
      };
    }
  }

  async sendVerificationCode(toNumber: string, code: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured || !this.client) {
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    const message = `Your WeParlay verification code is: ${code}. Valid for 10 minutes.`;

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: toNumber
      });

      return {
        success: true,
        messageId: result.sid
      };
    } catch (error: any) {
      console.error('Verification SMS failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send verification SMS'
      };
    }
  }

  async sendSMS(toNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured || !this.client) {
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: toNumber
      });

      return {
        success: true,
        messageId: result.sid
      };
    } catch (error: any) {
      console.error('SMS send failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  isServiceConfigured(): boolean {
    return this.isConfigured;
  }
}

export const smsService = new SMSService();