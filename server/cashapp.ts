import { Request, Response } from "express";

// Cash App API configuration
const CASH_APP_CLIENT_ID = process.env.CASH_APP_CLIENT_ID;
const CASH_APP_CLIENT_SECRET = process.env.CASH_APP_CLIENT_SECRET;
const CASH_APP_ENVIRONMENT = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';

if (!CASH_APP_CLIENT_ID || !CASH_APP_CLIENT_SECRET) {
  console.warn('Cash App credentials not configured. Cash App payments will be disabled.');
}

interface CashAppPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  recipient?: string;
}

interface CashAppPaymentResponse {
  payment_id: string;
  status: 'pending' | 'completed' | 'failed';
  payment_url?: string;
  qr_code_url?: string;
}

export async function createCashAppPayment(req: Request, res: Response) {
  try {
    const { amount, currency = 'USD', description, recipient } = req.body as CashAppPaymentRequest;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount. Amount must be a positive number.'
      });
    }

    if (!description) {
      return res.status(400).json({
        error: 'Description is required for Cash App payments.'
      });
    }

    // For sandbox/demo mode, return mock response
    if (!CASH_APP_CLIENT_ID || CASH_APP_ENVIRONMENT === 'sandbox') {
      const mockPayment: CashAppPaymentResponse = {
        payment_id: `ca_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        payment_url: `https://cash.app/pay/demo?amount=${amount}&note=${encodeURIComponent(description)}`,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://cash.app/pay/demo?amount=${amount}`)}`
      };

      return res.json({
        success: true,
        payment: mockPayment,
        message: 'Demo mode: Use Cash App mobile to complete payment'
      });
    }

    // Real Cash App API integration would go here
    // Note: Cash App doesn't have a public API for merchant payments yet
    // This would need to be implemented when Cash App releases their merchant API
    
    res.status(501).json({
      error: 'Cash App merchant API not yet available. Please use PayPal or WeParlay Cash.'
    });

  } catch (error) {
    console.error('Cash App payment error:', error);
    res.status(500).json({
      error: 'Failed to create Cash App payment'
    });
  }
}

export async function getCashAppPaymentStatus(req: Request, res: Response) {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        error: 'Payment ID is required'
      });
    }

    // For demo mode, simulate payment status
    if (!CASH_APP_CLIENT_ID || CASH_APP_ENVIRONMENT === 'sandbox') {
      const mockStatus = {
        payment_id: paymentId,
        status: Math.random() > 0.5 ? 'completed' : 'pending',
        amount: 25.00,
        currency: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return res.json({
        success: true,
        payment: mockStatus
      });
    }

    // Real status check would go here
    res.status(501).json({
      error: 'Cash App status check not yet available'
    });

  } catch (error) {
    console.error('Cash App status check error:', error);
    res.status(500).json({
      error: 'Failed to check payment status'
    });
  }
}

export async function initiateCashAppPayout(req: Request, res: Response) {
  try {
    const { amount, currency = 'USD', recipient, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount for payout'
      });
    }

    if (!recipient) {
      return res.status(400).json({
        error: 'Recipient Cash App handle ($cashtag) is required'
      });
    }

    // For demo mode, return mock payout response
    if (!CASH_APP_CLIENT_ID || CASH_APP_ENVIRONMENT === 'sandbox') {
      const mockPayout = {
        payout_id: `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'processing',
        amount: amount,
        currency: currency,
        recipient: recipient,
        description: description || 'WeParlay payout',
        estimated_completion: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
      };

      return res.json({
        success: true,
        payout: mockPayout,
        message: 'Demo mode: Payout initiated successfully'
      });
    }

    // Real payout API would go here
    res.status(501).json({
      error: 'Cash App payout API not yet available'
    });

  } catch (error) {
    console.error('Cash App payout error:', error);
    res.status(500).json({
      error: 'Failed to initiate Cash App payout'
    });
  }
}

export function getCashAppConfig() {
  return {
    enabled: !!CASH_APP_CLIENT_ID,
    environment: CASH_APP_ENVIRONMENT,
    supports_payouts: true,
    supports_payments: true,
    minimum_amount: 1.00,
    maximum_amount: 2500.00,
    supported_currencies: ['USD'],
    demo_mode: !CASH_APP_CLIENT_ID || CASH_APP_ENVIRONMENT === 'sandbox'
  };
}