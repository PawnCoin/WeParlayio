import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { Request, Response } from 'express';

class PlaidService {
  private client: PlaidApi;

  constructor() {
    const configuration = new Configuration({
      basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
          'PLAID-SECRET': process.env.PLAID_SECRET!,
        },
      },
    });

    this.client = new PlaidApi(configuration);
  }

  // Create link token for user authentication
  async createLinkToken(userId: string, userName: string = 'WeParlay User') {
    try {
      const response = await this.client.linkTokenCreate({
        user: { 
          client_user_id: userId,
        },
        client_name: 'WeParlay',
        products: ['auth', 'transactions', 'identity'],
        country_codes: ['US'],
        language: 'en',
        webhook: process.env.PLAID_WEBHOOK_URL,
        account_filters: {
          depository: {
            account_type: ['checking', 'savings'],
            account_subtype: ['checking', 'savings']
          }
        }
      });

      return {
        success: true,
        link_token: response.data.link_token,
        expiration: response.data.expiration
      };
    } catch (error) {
      console.error('Plaid link token creation error:', error);
      return {
        success: false,
        error: 'Unable to create link token'
      };
    }
  }

  // Exchange public token for access token
  async exchangePublicToken(publicToken: string) {
    try {
      const tokenResponse = await this.client.itemPublicTokenExchange({
        public_token: publicToken
      });

      const accessToken = tokenResponse.data.access_token;
      const itemId = tokenResponse.data.item_id;

      // Get account information
      const accountsResponse = await this.client.accountsGet({
        access_token: accessToken
      });

      const accounts = accountsResponse.data.accounts;

      return {
        success: true,
        access_token: accessToken,
        item_id: itemId,
        accounts: accounts.map(account => ({
          account_id: account.account_id,
          name: account.name,
          official_name: account.official_name,
          type: account.type,
          subtype: account.subtype,
          mask: account.mask,
          balances: {
            available: account.balances.available,
            current: account.balances.current,
            limit: account.balances.limit,
            iso_currency_code: account.balances.iso_currency_code
          }
        }))
      };
    } catch (error) {
      console.error('Plaid token exchange error:', error);
      return {
        success: false,
        error: 'Token exchange failed'
      };
    }
  }

  // Get account balances
  async getAccountBalances(accessToken: string) {
    try {
      const response = await this.client.accountsGet({
        access_token: accessToken
      });

      return {
        success: true,
        accounts: response.data.accounts.map(account => ({
          account_id: account.account_id,
          name: account.name,
          type: account.type,
          subtype: account.subtype,
          mask: account.mask,
          balances: account.balances
        }))
      };
    } catch (error) {
      console.error('Plaid get balances error:', error);
      return {
        success: false,
        error: 'Unable to fetch account balances'
      };
    }
  }

  // Get account transactions
  async getTransactions(accessToken: string, startDate: string, endDate: string) {
    try {
      const response = await this.client.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        count: 100,
        offset: 0
      });

      return {
        success: true,
        transactions: response.data.transactions,
        total_transactions: response.data.total_transactions
      };
    } catch (error) {
      console.error('Plaid get transactions error:', error);
      return {
        success: false,
        error: 'Unable to fetch transactions'
      };
    }
  }

  // Create ACH transfer (for withdrawals)
  async createTransfer(accessToken: string, accountId: string, amount: number, description: string) {
    try {
      // First, create a processor token for the account
      const processorResponse = await this.client.processorTokenCreate({
        access_token: accessToken,
        account_id: accountId,
        processor: 'dwolla' // You can change this based on your payment processor
      });

      const processorToken = processorResponse.data.processor_token;

      // In a real implementation, you would use this processor token
      // with your payment processor (like Dwolla, Stripe, etc.)
      // to initiate the actual transfer

      return {
        success: true,
        processor_token: processorToken,
        transfer_id: `transfer_${Date.now()}`, // Mock transfer ID
        status: 'pending',
        amount,
        description
      };
    } catch (error) {
      console.error('Plaid create transfer error:', error);
      return {
        success: false,
        error: 'Unable to create transfer'
      };
    }
  }

  // Verify account ownership (for enhanced security)
  async verifyAccountOwnership(accessToken: string) {
    try {
      const response = await this.client.identityGet({
        access_token: accessToken
      });

      return {
        success: true,
        identity: response.data.accounts.map(account => ({
          account_id: account.account_id,
          owners: account.owners.map(owner => ({
            names: owner.names,
            emails: owner.emails,
            phone_numbers: owner.phone_numbers,
            addresses: owner.addresses
          }))
        }))
      };
    } catch (error) {
      console.error('Plaid identity verification error:', error);
      return {
        success: false,
        error: 'Unable to verify account ownership'
      };
    }
  }

  // Remove bank account (unlink)
  async removeItem(accessToken: string) {
    try {
      await this.client.itemRemove({
        access_token: accessToken
      });

      return {
        success: true,
        message: 'Bank account successfully unlinked'
      };
    } catch (error) {
      console.error('Plaid remove item error:', error);
      return {
        success: false,
        error: 'Unable to unlink bank account'
      };
    }
  }

  // Get item status (for troubleshooting)
  async getItemStatus(accessToken: string) {
    try {
      const response = await this.client.itemGet({
        access_token: accessToken
      });

      return {
        success: true,
        item: response.data.item,
        status: response.data.status
      };
    } catch (error) {
      console.error('Plaid get item status error:', error);
      return {
        success: false,
        error: 'Unable to get item status'
      };
    }
  }
}

export default new PlaidService();