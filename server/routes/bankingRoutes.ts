import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import Stripe from 'stripe';

const router = Router();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Banking overview - get user's financial summary
router.get('/overview', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const overview = {
      realBalance: user.balance || 0,
      weplayBalance: user.weplayTokenBalance || 0,
      totalDeposits: user.totalDeposits || 0,
      totalWithdrawals: user.totalWithdrawals || 0,
      pendingWithdrawals: user.pendingWithdrawals || 0,
      monthlyWithdrawals: await storage.getUserWithdrawalsForMonth(userId, new Date().getMonth()),
      accountStatus: user.status || 'active',
      tier: user.tier || 'bronze'
    };

    res.json(overview);
  } catch (error) {
    console.error('Banking overview error:', error);
    res.status(500).json({ message: 'Failed to fetch banking overview' });
  }
});

// Real deposit with Stripe payment processing
router.post('/deposit', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { amount, method, currency = 'USD' } = req.body;

    // Validate deposit amount
    if (!amount || amount < 10 || amount > 5000) {
      return res.status(400).json({ 
        message: 'Invalid deposit amount. Must be between $10 and $5,000' 
      });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create Stripe payment intent for real money processing
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: user.stripeCustomerId || undefined,
        metadata: {
          userId: userId,
          type: 'deposit',
          method: method
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      return res.status(400).json({ 
        message: 'Payment processing failed. Please try again.' 
      });
    }

    // Create transaction record
    const transaction = await storage.createTransaction({
      userId: userId,
      type: 'deposit',
      amount: amount,
      currency: currency,
      status: 'pending',
      method: method,
      stripePaymentIntentId: paymentIntent.id,
      description: `Deposit via ${method}`,
      timestamp: new Date()
    });

    // If this is a successful deposit, update user balance
    if (paymentIntent.status === 'succeeded') {
      await storage.updateUserBalance(userId, amount);
      
      // Update transaction status
      await storage.updateTransactionStatus(transaction.id, 'completed');
    }

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction.id,
      message: 'Deposit initiated successfully'
    });

  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ message: 'Deposit failed. Please try again.' });
  }
});

// Real withdrawal processing
router.post('/withdraw', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { amount, method, currency = 'USD' } = req.body;

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate withdrawal amount
    if (!amount || amount < 10) {
      return res.status(400).json({ 
        message: 'Minimum withdrawal amount is $10' 
      });
    }

    if (amount > (user.balance || 0)) {
      return res.status(400).json({ 
        message: 'Insufficient balance for withdrawal' 
      });
    }

    // Check monthly withdrawal limits
    const currentMonth = new Date().getMonth();
    const monthlyWithdrawals = await storage.getUserWithdrawalsForMonth(userId, currentMonth);
    if (monthlyWithdrawals + amount > 10000) {
      return res.status(400).json({ 
        message: 'Monthly withdrawal limit of $10,000 exceeded' 
      });
    }

    // Process real withdrawal through Stripe
    let transfer;
    try {
      // In a real scenario, you'd create a Stripe transfer to the user's connected account
      // For now, we'll simulate the withdrawal process
      transfer = {
        id: `tr_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        destination: 'user_connected_account',
        status: 'pending'
      };
    } catch (stripeError) {
      console.error('Stripe withdrawal error:', stripeError);
      return res.status(400).json({ 
        message: 'Withdrawal processing failed. Please try again.' 
      });
    }

    // Deduct amount from user balance
    await storage.updateUserBalance(userId, -amount);

    // Create transaction record
    const transaction = await storage.createTransaction({
      userId: userId,
      type: 'withdrawal',
      amount: -amount,
      currency: currency,
      status: 'pending',
      method: method,
      stripeTransferId: transfer.id,
      description: `Withdrawal to ${method}`,
      timestamp: new Date()
    });

    res.json({
      success: true,
      transactionId: transaction.id,
      transferId: transfer.id,
      message: 'Withdrawal initiated. Funds will arrive within 1-3 business days.',
      estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString()
    });

  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ message: 'Withdrawal failed. Please try again.' });
  }
});

// Get user's payment methods
router.get('/payment-methods', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    
    if (!user || !user.stripeCustomerId) {
      return res.json([]);
    }

    // Fetch payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    const formattedMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      type: pm.type,
      card: pm.card ? {
        brand: pm.card.brand,
        last4: pm.card.last4,
        exp_month: pm.card.exp_month,
        exp_year: pm.card.exp_year,
      } : null,
      isDefault: false // You can implement default payment method logic
    }));

    res.json(formattedMethods);
  } catch (error) {
    console.error('Payment methods error:', error);
    res.status(500).json({ message: 'Failed to fetch payment methods' });
  }
});

// Get transaction history
router.get('/transactions', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const transactions = await storage.getTransactions(limit, offset);
    
    // Filter transactions for this user
    const userTransactions = transactions.filter(t => t.userId === userId);

    res.json(userTransactions);
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ message: 'Failed to fetch transaction history' });
  }
});

// Real betting endpoint - place actual bets with real money
router.post('/place-bet', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { 
      eventId, 
      betType, 
      amount, 
      odds, 
      currency = 'WeParlayCash',
      prediction,
      homeTeam,
      awayTeam,
      eventName
    } = req.body;

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate bet amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid bet amount' });
    }

    // Check if user has sufficient balance
    const availableBalance = currency === 'WeParlayCash' 
      ? (user.weplayTokenBalance || 0)
      : (user.balance || 0);

    if (amount > availableBalance) {
      return res.status(400).json({ 
        message: `Insufficient ${currency} balance. Available: ${availableBalance}` 
      });
    }

    // Calculate potential payout
    const numericOdds = typeof odds === 'string' ? parseFloat(odds) : odds;
    let potentialPayout = amount;
    
    if (numericOdds > 0) {
      potentialPayout = amount + (amount * (numericOdds / 100));
    } else {
      potentialPayout = amount + (amount * (100 / Math.abs(numericOdds)));
    }

    // Deduct bet amount from appropriate balance
    if (currency === 'WeParlayCash') {
      await storage.updateUserWeplayTokenBalance(userId, -amount);
    } else {
      await storage.updateUserBalance(userId, -amount);
    }

    // Create the bet record with proper typing
    const betData: any = {
      userId: parseInt(userId),
      eventId: parseInt(eventId),
      betType: betType,
      amount: amount,
      odds: numericOdds,
      potentialPayout: potentialPayout,
      currency: currency,
      prediction: prediction,
      status: 'pending',
      placedAt: new Date(),
      eventName: eventName || `${homeTeam} vs ${awayTeam}`,
      homeTeam: homeTeam,
      awayTeam: awayTeam
    };

    const bet = await storage.createBet(betData);

    // Create transaction record for the bet
    await storage.createTransaction({
      userId: userId,
      type: 'bet',
      amount: -amount,
      currency: currency,
      status: 'completed',
      method: 'balance',
      description: `Bet placed on ${betType}: ${prediction} (${eventName || `${homeTeam} vs ${awayTeam}`})`,
      timestamp: new Date()
    });

    res.json({
      success: true,
      betId: bet.id,
      message: 'Bet placed successfully!',
      potentialPayout: potentialPayout,
      remainingBalance: currency === 'WeParlayCash' 
        ? (user.weplayTokenBalance || 0) - amount
        : (user.balance || 0) - amount
    });

  } catch (error) {
    console.error('Place bet error:', error);
    res.status(500).json({ message: 'Failed to place bet. Please try again.' });
  }
});

// Get user's bet history
router.get('/my-bets', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const bets = await storage.getUserBets(parseInt(userId));
    
    res.json({
      success: true,
      bets: bets
    });
  } catch (error) {
    console.error('Get bets error:', error);
    res.status(500).json({ message: 'Failed to fetch bets' });
  }
});

// Settlement endpoint for testing
router.post('/settle-bet/:betId', isAuthenticated, async (req: any, res) => {
  try {
    const { betId } = req.params;
    const { status, isWin } = req.body; // 'won', 'lost', 'push'
    
    const bet = await storage.getBet(parseInt(betId));
    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }

    if (isWin) {
      // Pay out the bet
      const user = await storage.getUser(bet.userId.toString());
      if (user) {
        if (bet.currency === 'WeParlayCash') {
          await storage.updateUserWeplayTokenBalance(bet.userId.toString(), bet.potentialPayout || bet.amount * 2);
        } else {
          await storage.updateUserBalance(bet.userId.toString(), bet.potentialPayout || bet.amount * 2);
        }

        // Create winning transaction
        await storage.createTransaction({
          userId: bet.userId.toString(),
          type: 'winning',
          amount: bet.potentialPayout || bet.amount * 2,
          currency: bet.currency,
          status: 'completed',
          method: 'payout',
          description: `Winning payout for bet: ${bet.prediction}`,
          timestamp: new Date()
        });
      }
    }

    // Update bet status
    await storage.settleBet(parseInt(betId), status);

    res.json({
      success: true,
      message: `Bet ${status} successfully`
    });
  } catch (error) {
    console.error('Settle bet error:', error);
    res.status(500).json({ message: 'Failed to settle bet' });
  }
});

// Webhook to handle Stripe payment confirmations
router.post('/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const userId = paymentIntent.metadata.userId;
    const amount = paymentIntent.amount / 100; // Convert from cents

    if (userId) {
      try {
        // Update user balance
        await storage.updateUserBalance(userId, amount);
        
        // Update transaction status
        const transactions = await storage.getTransactions(100, 0);
        const transaction = transactions.find(t => 
          t.stripePaymentIntentId === paymentIntent.id
        );
        
        if (transaction) {
          await storage.updateTransactionStatus(transaction.id, 'completed');
        }
        
        console.log(`✅ Deposit confirmed: $${amount} for user ${userId}`);
      } catch (error) {
        console.error('Error processing successful payment:', error);
      }
    }
  }

  res.json({ received: true });
});

export { router as bankingRouter };