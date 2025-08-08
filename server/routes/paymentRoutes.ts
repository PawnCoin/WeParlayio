import express from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../simpleStorage';
import { SubscriptionTier } from '../../shared/tierSystem';
import { z } from 'zod';

const router = express.Router();

// Tier prices in cents for Stripe
const TIER_PRICES_CENTS = {
  [SubscriptionTier.BRONZE]: 0,
  [SubscriptionTier.SILVER]: 999,   // $9.99
  [SubscriptionTier.GOLD]: 1999,    // $19.99  
  [SubscriptionTier.PLATINUM]: 3999 // $39.99
};

// Payment method schema
const createPaymentIntentSchema = z.object({
  tier: z.enum([SubscriptionTier.SILVER, SubscriptionTier.GOLD, SubscriptionTier.PLATINUM]),
  paymentMethod: z.enum(['stripe', 'paypal']),
  currency: z.string().default('usd')
});

// Create Stripe payment intent
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
    
    if (paymentMethod === 'stripe') {
      // Simulate Stripe payment intent creation
      // In production, use: const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const simulatedPaymentIntent = {
        id: `pi_sim_${Date.now()}`,
        client_secret: `pi_sim_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
        amount: amount,
        currency: currency,
        status: 'requires_payment_method',
        metadata: {
          userId: userId,
          tier: tier,
          description: `WeParlay ${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier Subscription`
        }
      };

      res.json({
        success: true,
        paymentIntent: simulatedPaymentIntent,
        publishableKey: process.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_demo'
      });
    } else if (paymentMethod === 'paypal') {
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

// Confirm Stripe payment and upgrade tier
router.post('/confirm-stripe-payment', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { paymentIntentId, tier } = req.body;
    
    if (!paymentIntentId || !tier) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment intent ID and tier are required' 
      });
    }

    // Simulate Stripe payment confirmation
    // In production: const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const simulatedPaymentStatus = 'succeeded'; // or 'failed'
    
    if (simulatedPaymentStatus === 'succeeded') {
      // Upgrade user tier
      const updatedUser = await storage.updateUserTier(userId, tier);
      
      // Calculate VIP expiry (30 days from now)
      const vipExpiry = new Date();
      vipExpiry.setDate(vipExpiry.getDate() + 30);

      res.json({
        success: true,
        message: `Successfully upgraded to ${tier} tier!`,
        user: updatedUser,
        subscription: {
          tier: tier,
          status: 'active',
          expiryDate: vipExpiry,
          paymentMethod: 'stripe',
          transactionId: paymentIntentId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment failed or was not completed'
      });
    }
  } catch (error) {
    console.error('Error confirming Stripe payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to confirm payment' 
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
    // In production: capture the PayPal order using PayPal SDK
    const simulatedCaptureStatus = 'COMPLETED'; // or 'FAILED'
    
    if (simulatedCaptureStatus === 'COMPLETED') {
      // Upgrade user tier
      const updatedUser = await storage.updateUserTier(userId, tier);
      
      // Calculate VIP expiry (30 days from now)
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

// Get payment methods available for user
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
        id: 'stripe',
        name: 'Credit Card',
        description: 'Pay with Visa, Mastercard, or American Express',
        fees: 'Processing fees apply',
        available: true,
        logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        fees: 'No additional fees',
        available: true,
        logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg'
      }
    ];

    res.json({
      success: true,
      paymentMethods,
      currency: 'USD',
      supportedCurrencies: ['USD', 'EUR', 'GBP']
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
        paymentMethod: 'stripe'
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

// Webhook endpoint for Stripe
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    
    // In production: verify webhook signature using Stripe
    // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    // Simulate webhook processing
    const event = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          metadata: {
            userId: 'user_123',
            tier: 'silver'
          }
        }
      }
    };

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('✅ Payment succeeded via webhook:', event.data.object.id);
        // Process successful payment
        break;
      case 'payment_intent.payment_failed':
        console.log('❌ Payment failed via webhook:', event.data.object.id);
        // Handle failed payment
        break;
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Webhook processing failed' 
    });
  }
});

// Webhook endpoint for PayPal
router.post('/paypal-webhook', express.json(), async (req, res) => {
  try {
    const event = req.body;
    
    // In production: verify webhook signature using PayPal SDK
    
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        console.log('✅ PayPal payment completed via webhook:', event.resource.id);
        // Process successful PayPal payment
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        console.log('❌ PayPal payment denied via webhook:', event.resource.id);
        // Handle denied PayPal payment
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

export default router;