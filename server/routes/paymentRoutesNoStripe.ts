import express from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../simpleStorage';
import { SubscriptionTier } from '../../shared/tierSystem';
import { z } from 'zod';

const router = express.Router();

// Tier prices in cents
const TIER_PRICES_CENTS = {
  [SubscriptionTier.BRONZE]: 0,
  [SubscriptionTier.SILVER]: 999,   // $9.99
  [SubscriptionTier.GOLD]: 1999,    // $19.99  
  [SubscriptionTier.PLATINUM]: 3999 // $39.99
};

// Payment method schema (no Stripe)
const createPaymentIntentSchema = z.object({
  tier: z.enum([SubscriptionTier.SILVER, SubscriptionTier.GOLD, SubscriptionTier.PLATINUM]),
  paymentMethod: z.enum(['paypal', 'crypto', 'cashapp']),
  currency: z.string().default('usd')
});

// Create payment intent for betting-friendly payment methods
router.post('/create-payment-intent', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const validatedData = createPaymentIntentSchema.parse(req.body);
    const { tier, paymentMethod, currency } = validatedData;

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const amount = TIER_PRICES_CENTS[tier];
    
    if (paymentMethod === 'paypal') {
      // Simulate PayPal order creation
      const simulatedPayPalOrder = {
        id: `PAY-${Date.now()}${Math.random().toString(36).substring(7)}`,
        status: 'CREATED',
        links: [
          {
            href: `https://sandbox.paypal.com/checkoutnow?token=PAY-${Date.now()}`,
            rel: 'approval_url',
            method: 'REDIRECT'
          }
        ],
        amount: {
          currency_code: currency.toUpperCase(),
          value: (amount / 100).toFixed(2)
        },
        metadata: {
          userId: userId,
          tier: tier
        }
      };

      res.json({
        success: true,
        paypalOrder: simulatedPayPalOrder
      });
    } else if (paymentMethod === 'crypto') {
      // Simulate cryptocurrency payment
      const simulatedCryptoPayment = {
        id: `crypto_${Date.now()}`,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Example Bitcoin address
        amount: (amount / 100).toFixed(2),
        currency: 'USD',
        cryptoCurrency: 'BTC',
        qrCode: `bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=${(amount / 100000000).toFixed(8)}`,
        metadata: {
          userId: userId,
          tier: tier
        }
      };

      res.json({
        success: true,
        cryptoPayment: simulatedCryptoPayment
      });
    } else if (paymentMethod === 'cashapp') {
      // Simulate CashApp payment
      const simulatedCashAppPayment = {
        id: `cashapp_${Date.now()}`,
        cashtag: '$WeParlay',
        amount: (amount / 100).toFixed(2),
        currency: currency,
        note: `WeParlay ${tier.charAt(0).toUpperCase() + tier.slice(1)} Subscription`,
        deepLink: `https://cash.app/$WeParlay/${(amount / 100).toFixed(2)}`,
        metadata: {
          userId: userId,
          tier: tier
        }
      };

      res.json({
        success: true,
        cashAppPayment: simulatedCashAppPayment
      });
    }
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data',
        errors: error.errors 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment intent' 
    });
  }
});

// Confirm PayPal payment and upgrade tier
router.post('/confirm-paypal-payment', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { orderID, tier } = req.body;
    
    if (!orderID || !tier) {
      return res.status(400).json({ 
        success: false, 
        message: 'PayPal order ID and tier are required' 
      });
    }

    // Simulate PayPal payment capture
    const simulatedCaptureStatus = 'COMPLETED';
    
    if (simulatedCaptureStatus === 'COMPLETED') {
      const updatedUser = await storage.updateUserTier(userId, tier);
      
      const vipExpiry = new Date();
      vipExpiry.setDate(vipExpiry.getDate() + 30);

      res.json({
        success: true,
        message: `Successfully upgraded to ${tier} tier via PayPal!`,
        user: updatedUser,
        subscription: {
          tier: tier,
          status: 'active',
          expiryDate: vipExpiry,
          paymentMethod: 'paypal',
          transactionId: orderID
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'PayPal payment failed or was not completed'
      });
    }
  } catch (error) {
    console.error('Error confirming PayPal payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to confirm PayPal payment' 
    });
  }
});

// Confirm cryptocurrency payment and upgrade tier
router.post('/confirm-crypto-payment', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { transactionHash, tier, cryptoCurrency } = req.body;
    
    if (!transactionHash || !tier) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction hash and tier are required' 
      });
    }

    // Simulate crypto payment verification
    const simulatedVerificationStatus = 'confirmed';
    
    if (simulatedVerificationStatus === 'confirmed') {
      const updatedUser = await storage.updateUserTier(userId, tier);
      
      const vipExpiry = new Date();
      vipExpiry.setDate(vipExpiry.getDate() + 30);

      res.json({
        success: true,
        message: `Successfully upgraded to ${tier} tier via ${cryptoCurrency}!`,
        user: updatedUser,
        subscription: {
          tier: tier,
          status: 'active',
          expiryDate: vipExpiry,
          paymentMethod: 'crypto',
          transactionId: transactionHash
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Cryptocurrency payment verification failed'
      });
    }
  } catch (error) {
    console.error('Error confirming crypto payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to confirm crypto payment' 
    });
  }
});

// Confirm CashApp payment and upgrade tier
router.post('/confirm-cashapp-payment', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { paymentId, tier } = req.body;
    
    if (!paymentId || !tier) {
      return res.status(400).json({ 
        success: false, 
        message: 'CashApp payment ID and tier are required' 
      });
    }

    // Simulate CashApp payment verification
    const simulatedVerificationStatus = 'completed';
    
    if (simulatedVerificationStatus === 'completed') {
      const updatedUser = await storage.updateUserTier(userId, tier);
      
      const vipExpiry = new Date();
      vipExpiry.setDate(vipExpiry.getDate() + 30);

      res.json({
        success: true,
        message: `Successfully upgraded to ${tier} tier via CashApp!`,
        user: updatedUser,
        subscription: {
          tier: tier,
          status: 'active',
          expiryDate: vipExpiry,
          paymentMethod: 'cashapp',
          transactionId: paymentId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'CashApp payment verification failed'
      });
    }
  } catch (error) {
    console.error('Error confirming CashApp payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to confirm CashApp payment' 
    });
  }
});

// Get betting-friendly payment methods
router.get('/payment-methods', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const paymentMethods = [
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        fees: 'No additional fees',
        available: true,
        logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg'
      },
      {
        id: 'crypto',
        name: 'Cryptocurrency',
        description: 'Pay with Bitcoin, Ethereum, or other cryptocurrencies',
        fees: 'Network fees apply',
        available: true,
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg'
      },
      {
        id: 'cashapp',
        name: 'CashApp',
        description: 'Pay with your CashApp account',
        fees: 'No additional fees',
        available: true,
        logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Square_Cash_app_logo.svg'
      }
    ];

    res.json({
      success: true,
      paymentMethods,
      currency: 'USD',
      supportedCurrencies: ['USD', 'EUR', 'GBP'],
      note: 'All payment methods support betting and gaming transactions'
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment methods' 
    });
  }
});

// Get user's payment history
router.get('/history', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    // In production, fetch actual payment history from database
    const simulatedPaymentHistory = [
      {
        id: 'txn_1',
        date: new Date().toISOString(),
        amount: 999,
        currency: 'USD',
        description: 'WeParlay Silver Tier Subscription',
        status: 'completed',
        paymentMethod: 'paypal'
      }
    ];

    res.json({
      success: true,
      payments: simulatedPaymentHistory,
      total: simulatedPaymentHistory.length
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment history' 
    });
  }
});

// Webhook endpoint for PayPal
router.post('/paypal-webhook', express.json(), async (req, res) => {
  try {
    const event = req.body;
    
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        console.log('✅ PayPal payment completed via webhook:', event.resource.id);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        console.log('❌ PayPal payment denied via webhook:', event.resource.id);
        break;
      default:
        console.log(`Unhandled PayPal webhook event: ${event.event_type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    res.status(400).json({ 
      success: false, 
      message: 'PayPal webhook processing failed' 
    });
  }
});

// Webhook endpoint for cryptocurrency payments
router.post('/crypto-webhook', express.json(), async (req, res) => {
  try {
    const event = req.body;
    
    switch (event.type) {
      case 'payment.confirmed':
        console.log('✅ Crypto payment confirmed via webhook:', event.transaction_hash);
        break;
      case 'payment.failed':
        console.log('❌ Crypto payment failed via webhook:', event.transaction_hash);
        break;
      default:
        console.log(`Unhandled crypto webhook event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing crypto webhook:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Crypto webhook processing failed' 
    });
  }
});

export default router;