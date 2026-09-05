/**
 * SMS is deliberately disabled until WeParlay has a messaging provider that has
 * approved this exact, licensed and age-gated gambling use case in writing.
 *
 * Do not replace this with a generic SMS vendor integration: carrier rules are
 * jurisdiction-specific and a provider account can be suspended if its approval
 * and opt-in requirements are not in place.
 */
export class SMSService {
  private readonly unavailableMessage =
    'SMS delivery is unavailable until an approved, gambling-compliant provider is configured.';

  private unavailable(): { success: false; error: string } {
    return { success: false, error: this.unavailableMessage };
  }

  async sendBettingChallenge(toNumber: string, challengeDetails: {
    challengerName: string;
    amount: number;
    event: string;
    odds: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    void toNumber;
    void challengeDetails;
    return this.unavailable();
  }

  async sendBetAlert(toNumber: string, alertDetails: {
    event: string;
    outcome: string;
    amount: number;
    won: boolean;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    void toNumber;
    void alertDetails;
    return this.unavailable();
  }

  async sendVerificationCode(toNumber: string, code: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    void toNumber;
    void code;
    return this.unavailable();
  }

  async sendSMS(toNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    void toNumber;
    void message;
    return this.unavailable();
  }

  isServiceConfigured(): boolean {
    return false;
  }
}

export const smsService = new SMSService();
