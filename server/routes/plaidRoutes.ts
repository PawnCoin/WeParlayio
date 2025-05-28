
import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { plaidService } from '../services/plaidService';
import { storage } from '../storage';

const router = Router();

// Create link token for Plaid Link
router.post('/create-link-token', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { products } = req.body;
    
    const linkToken = await plaidService.createLinkToken(userId, products);
    
    res.json(linkToken);
  } catch (error) {
    console.error('Link token creation error:', error);
    res.status(500).json({ message: 'Failed to create link token' });
  }
});

// Exchange public token for access token and store account info
router.post('/exchange-token', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { public_token, metadata } = req.body;
    
    // Exchange the public token
    const exchangeData = await plaidService.exchangePublicToken(public_token);
    const accessToken = exchangeData.access_token;
    const itemId = exchangeData.item_id;
    
    // Get account information
    const accountsData = await plaidService.getAccounts(accessToken);
    const authData = await plaidService.getAuthInfo(accessToken);
    
    // Identify Cash App account if present
    const cashAppAccount = plaidService.identifyCashAppAccount(accountsData.accounts);
    
    // Store the linked account in our database
    const linkedAccount = {
      userId: userId,
      plaidItemId: itemId,
      plaidAccessToken: accessToken,
      institutionId: metadata.institution.institution_id,
      institutionName: metadata.institution.name,
      accountType: cashAppAccount ? 'cash_app' : 'bank',
      accounts: accountsData.accounts.map(account => ({
        accountId: account.account_id,
        name: account.name,
        officialName: account.official_name,
        type: account.type,
        subtype: account.subtype,
        mask: account.mask,
        isCashApp: account.account_id === cashAppAccount?.account_id
      })),
      authInfo: authData.accounts.map(account => ({
        accountId: account.account_id,
        routingNumber: account.routing_number,
        accountNumber: account.account_number
      })),
      isActive: true,
      linkedAt: new Date()
    };
    
    // Save to database
    await storage.createLinkedAccount(linkedAccount);
    
    res.json({
      success: true,
      message: `Successfully linked ${linkedAccount.institutionName}`,
      accountType: linkedAccount.accountType,
      accounts: linkedAccount.accounts.length,
      hasCashApp: !!cashAppAccount
    });
    
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ message: 'Failed to link account' });
  }
});

// Get linked accounts for user
router.get('/linked-accounts', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const linkedAccounts = await storage.getLinkedAccounts(userId);
    
    // Get current balances for active accounts
    const accountsWithBalances = await Promise.all(
      linkedAccounts.map(async (account) => {
        try {
          const balances = await plaidService.getBalances(account.plaidAccessToken);
          return {
            ...account,
            balances: balances.accounts.map(acc => ({
              accountId: acc.account_id,
              available: acc.balances.available,
              current: acc.balances.current,
              limit: acc.balances.limit
            }))
          };
        } catch (error) {
          return { ...account, balances: [] };
        }
      })
    );
    
    res.json(accountsWithBalances);
  } catch (error) {
    console.error('Get linked accounts error:', error);
    res.status(500).json({ message: 'Failed to get linked accounts' });
  }
});

// Initiate deposit from linked account
router.post('/deposit', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { accountId, amount, currency = 'USD' } = req.body;
    
    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Minimum deposit is $1' });
    }
    
    if (amount > 5000) {
      return res.status(400).json({ message: 'Maximum deposit is $5,000' });
    }
    
    // Get the linked account
    const linkedAccount = await storage.getLinkedAccountByPlaidAccountId(userId, accountId);
    if (!linkedAccount) {
      return res.status(404).json({ message: 'Linked account not found' });
    }
    
    // Create transfer via Plaid
    const transfer = await plaidService.createTransfer(
      linkedAccount.plaidAccessToken,
      accountId,
      amount,
      'debit'
    );
    
    // Create transaction record
    const transaction = await storage.createTransaction({
      userId: userId,
      type: 'deposit',
      amount: amount,
      currency: currency,
      status: 'pending',
      method: linkedAccount.accountType === 'cash_app' ? 'cash_app' : 'bank_transfer',
      plaidTransferId: transfer.transfer.id,
      description: `Deposit from ${linkedAccount.institutionName}`,
      timestamp: new Date()
    });
    
    // If transfer is successful, update user balance
    if (transfer.transfer.status === 'posted') {
      await storage.updateUserBalance(userId, amount);
      await storage.updateTransactionStatus(transaction.id, 'completed');
    }
    
    res.json({
      success: true,
      transactionId: transaction.id,
      transferId: transfer.transfer.id,
      status: transfer.transfer.status,
      message: 'Deposit initiated successfully',
      estimatedArrival: transfer.transfer.status === 'posted' ? 'Immediate' : '1-3 business days'
    });
    
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ message: 'Deposit failed. Please try again.' });
  }
});

// Initiate withdrawal to linked account
router.post('/withdraw', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { accountId, amount, currency = 'USD' } = req.body;
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Minimum withdrawal is $1' });
    }
    
    if (amount > (user.balance || 0)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Get the linked account
    const linkedAccount = await storage.getLinkedAccountByPlaidAccountId(userId, accountId);
    if (!linkedAccount) {
      return res.status(404).json({ message: 'Linked account not found' });
    }
    
    // Create transfer via Plaid
    const transfer = await plaidService.createTransfer(
      linkedAccount.plaidAccessToken,
      accountId,
      amount,
      'credit'
    );
    
    // Deduct from user balance immediately
    await storage.updateUserBalance(userId, -amount);
    
    // Create transaction record
    const transaction = await storage.createTransaction({
      userId: userId,
      type: 'withdrawal',
      amount: -amount,
      currency: currency,
      status: 'pending',
      method: linkedAccount.accountType === 'cash_app' ? 'cash_app' : 'bank_transfer',
      plaidTransferId: transfer.transfer.id,
      description: `Withdrawal to ${linkedAccount.institutionName}`,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      transactionId: transaction.id,
      transferId: transfer.transfer.id,
      status: transfer.transfer.status,
      message: 'Withdrawal initiated successfully',
      estimatedArrival: '1-3 business days'
    });
    
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ message: 'Withdrawal failed. Please try again.' });
  }
});

// Plaid webhook for transfer updates
router.post('/webhook', async (req, res) => {
  const { webhook_type, webhook_code, item_id, transfer_id } = req.body;
  
  try {
    if (webhook_type === 'TRANSFER') {
      // Update transaction status based on webhook
      const transaction = await storage.getTransactionByPlaidTransferId(transfer_id);
      if (transaction) {
        let status = 'pending';
        if (webhook_code === 'TRANSFER_EVENTS_UPDATE') {
          status = 'completed';
        } else if (webhook_code === 'TRANSFER_EVENTS_UPDATE') {
          status = 'failed';
        }
        
        await storage.updateTransactionStatus(transaction.id, status);
      }
    }
    
    res.json({ acknowledged: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Remove linked account
router.delete('/linked-accounts/:itemId', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { itemId } = req.params;
    
    await storage.removeLinkedAccount(userId, itemId);
    
    res.json({
      success: true,
      message: 'Account unlinked successfully'
    });
  } catch (error) {
    console.error('Unlink account error:', error);
    res.status(500).json({ message: 'Failed to unlink account' });
  }
});

export { router as plaidRouter };
