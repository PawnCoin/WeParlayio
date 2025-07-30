import { Router, Request, Response } from 'express';
import plaidService from '../services/plaidService';
import { db } from '../db';
import { plaidBankAccounts, users, transactions } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Create link token for Plaid Link
router.post('/create-link-token', async (req: Request, res: Response) => {
  try {
    const { userId, userName } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const result = await plaidService.createLinkToken(userId, userName);
    res.json(result);
  } catch (error) {
    console.error('Create link token error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Exchange public token for access token and save to database
router.post('/exchange-public-token', async (req: Request, res: Response) => {
  try {
    const { publicToken, userId } = req.body;

    if (!publicToken || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Public token and user ID are required'
      });
    }

    const result = await plaidService.exchangePublicToken(publicToken);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Save bank account information to database
    for (const account of result.accounts) {
      await db.insert(plaidBankAccounts).values({
        userId: userId,
        plaidAccountId: account.account_id,
        plaidAccessToken: result.access_token,
        plaidItemId: result.item_id,
        accountName: account.name,
        accountType: account.type,
        accountSubtype: account.subtype,
        mask: account.mask,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).onConflictDoUpdate({
        target: [plaidBankAccounts.userId, plaidBankAccounts.plaidAccountId],
        set: {
          accountName: account.name,
          accountType: account.type,
          accountSubtype: account.subtype,
          mask: account.mask,
          updatedAt: new Date()
        }
      });
    }

    res.json({
      success: true,
      message: 'Bank account linked successfully',
      accounts: result.accounts
    });
  } catch (error) {
    console.error('Exchange public token error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user's linked bank accounts
router.get('/accounts/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userAccounts = await db
      .select()
      .from(plaidBankAccounts)
      .where(and(
        eq(plaidBankAccounts.userId, userId),
        eq(plaidBankAccounts.isActive, true)
      ));

    // Get fresh balance data for each account
    const accountsWithBalances = [];
    
    for (const account of userAccounts) {
      const balanceResult = await plaidService.getAccountBalances(account.plaidAccessToken);
      
      if (balanceResult.success) {
        const plaidAccount = balanceResult.accounts.find(
          acc => acc.account_id === account.plaidAccountId
        );
        
        if (plaidAccount) {
          accountsWithBalances.push({
            id: account.id,
            accountName: account.accountName,
            accountType: account.accountType,
            accountSubtype: account.accountSubtype,
            mask: account.mask,
            balances: plaidAccount.balances,
            isActive: account.isActive,
            createdAt: account.createdAt
          });
        }
      }
    }

    res.json({
      success: true,
      accounts: accountsWithBalances
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Initiate withdrawal to bank account
router.post('/withdraw', async (req: Request, res: Response) => {
  try {
    const { userId, accountId, amount, description } = req.body;

    if (!userId || !accountId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'User ID, account ID, and amount are required'
      });
    }

    // Validate amount
    if (amount <= 0 || amount > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Invalid withdrawal amount. Must be between $1 and $50,000'
      });
    }

    // Get user's bank account
    const bankAccount = await db
      .select()
      .from(plaidBankAccounts)
      .where(and(
        eq(plaidBankAccounts.id, parseInt(accountId)),
        eq(plaidBankAccounts.userId, userId),
        eq(plaidBankAccounts.isActive, true)
      ))
      .limit(1);

    if (bankAccount.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bank account not found'
      });
    }

    // Check user's WeParlay balance
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userBalance = user[0].balance || 0;
    
    if (userBalance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    // Create transfer using Plaid
    const transferResult = await plaidService.createTransfer(
      bankAccount[0].plaidAccessToken,
      bankAccount[0].plaidAccountId,
      amount,
      description || 'WeParlay withdrawal'
    );

    if (!transferResult.success) {
      return res.status(400).json(transferResult);
    }

    // Record transaction in database
    await db.insert(transactions).values({
      userId: userId,
      type: 'withdrawal',
      amount: amount,
      status: 'pending',
      description: description || 'Bank withdrawal',
      plaidTransferId: transferResult.transfer_id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update user balance (deduct withdrawal amount)
    await db
      .update(users)
      .set({
        balance: userBalance - amount,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      message: 'Withdrawal initiated successfully',
      transferId: transferResult.transfer_id,
      amount: amount,
      status: 'pending'
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Initiate deposit from bank account
router.post('/deposit', async (req: Request, res: Response) => {
  try {
    const { userId, accountId, amount, description } = req.body;

    if (!userId || !accountId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'User ID, account ID, and amount are required'
      });
    }

    // Validate amount
    if (amount <= 0 || amount > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Invalid deposit amount. Must be between $1 and $50,000'
      });
    }

    // Get user's bank account
    const bankAccount = await db
      .select()
      .from(plaidBankAccounts)
      .where(and(
        eq(plaidBankAccounts.id, parseInt(accountId)),
        eq(plaidBankAccounts.userId, userId),
        eq(plaidBankAccounts.isActive, true)
      ))
      .limit(1);

    if (bankAccount.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bank account not found'
      });
    }

    // Create transfer using Plaid (in reverse direction for deposit)
    const transferResult = await plaidService.createTransfer(
      bankAccount[0].plaidAccessToken,
      bankAccount[0].plaidAccountId,
      amount,
      description || 'WeParlay deposit'
    );

    if (!transferResult.success) {
      return res.status(400).json(transferResult);
    }

    // Record transaction in database
    await db.insert(transactions).values({
      userId: userId,
      type: 'deposit',
      amount: amount,
      status: 'pending',
      description: description || 'Bank deposit',
      plaidTransferId: transferResult.transfer_id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Deposit initiated successfully',
      transferId: transferResult.transfer_id,
      amount: amount,
      status: 'pending'
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get transaction history
router.get('/transactions/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json({
      success: true,
      transactions: userTransactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Remove/unlink bank account
router.delete('/accounts/:userId/:accountId', async (req: Request, res: Response) => {
  try {
    const { userId, accountId } = req.params;

    // Get bank account
    const bankAccount = await db
      .select()
      .from(plaidBankAccounts)
      .where(and(
        eq(plaidBankAccounts.id, parseInt(accountId)),
        eq(plaidBankAccounts.userId, userId)
      ))
      .limit(1);

    if (bankAccount.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bank account not found'
      });
    }

    // Remove from Plaid
    const removeResult = await plaidService.removeItem(bankAccount[0].plaidAccessToken);

    // Mark as inactive in database regardless of Plaid result
    await db
      .update(plaidBankAccounts)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(plaidBankAccounts.id, parseInt(accountId)));

    res.json({
      success: true,
      message: 'Bank account unlinked successfully'
    });
  } catch (error) {
    console.error('Remove account error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Webhook endpoint for Plaid notifications
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { webhook_type, webhook_code, item_id, error } = req.body;

    console.log('Plaid webhook received:', {
      webhook_type,
      webhook_code,
      item_id,
      error
    });

    // Handle different webhook types
    switch (webhook_type) {
      case 'TRANSACTIONS':
        // Handle transaction updates
        if (webhook_code === 'TRANSACTIONS_REMOVED') {
          // Handle removed transactions
        }
        break;
      
      case 'ITEM':
        if (webhook_code === 'ERROR') {
          // Handle item errors - might need to prompt user to re-link
          console.error('Plaid item error:', error);
        }
        break;
      
      case 'AUTH':
        // Handle auth updates
        break;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
});

export default router;