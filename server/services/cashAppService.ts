import axios from 'axios';

interface CashAppPaymentRequest {
  amount: number;
  currency: string;
  userId: string;
  description: string;
}

interface CashAppWithdrawalRequest {
  amount: number;
  cashTag: string; // User's $CashTag
  userId: string;
}

export class CashAppService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.CASH_APP_API_URL || 'https://api.cash.app/v1';
    this.apiKey = process.env.CASH_APP_API_KEY || '';
  }

  // Process direct payment from Cash App account
  async processPayment(request: CashAppPaymentRequest) {
    try {
      const response = await axios.post(`${this.baseUrl}/payments`, {
        amount: {
          value: request.amount * 100, // Convert to cents
          currency: request.currency
        },
        source: 'cash_app_balance',
        description: request.description,
        external_id: `weparlay_${request.userId}_${Date.now()}`
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        paymentId: response.data.id,
        status: response.data.status,
        message: 'Payment processed successfully via Cash App'
      };
    } catch (error: any) {
      console.error('Cash App payment error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Cash App payment failed'
      };
    }
  }

  // Direct withdrawal to Cash App account
  async processWithdrawal(request: CashAppWithdrawalRequest) {
    try {
      const response = await axios.post(`${this.baseUrl}/transfers`, {
        amount: {
          value: request.amount * 100, // Convert to cents
          currency: 'USD'
        },
        destination: {
          type: 'cash_tag',
          value: request.cashTag
        },
        external_id: `weparlay_withdrawal_${request.userId}_${Date.now()}`
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        transferId: response.data.id,
        status: response.data.status,
        message: `Withdrawal of $${request.amount} sent to ${request.cashTag}`
      };
    } catch (error: any) {
      console.error('Cash App withdrawal error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Cash App withdrawal failed'
      };
    }
  }

  // Verify Cash App account
  async verifyCashTag(cashTag: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${cashTag}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        valid: true,
        displayName: response.data.display_name,
        cashTag: response.data.cash_tag
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid Cash App tag'
      };
    }
  }
}

export const cashAppService = new CashAppService();