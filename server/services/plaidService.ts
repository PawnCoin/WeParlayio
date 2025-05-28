
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

const configuration = new Configuration({
  basePath: process.env.PLAID_ENV === 'production' 
    ? PlaidEnvironments.production 
    : PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

export class PlaidService {
  /**
   * Create a link token for Plaid Link initialization
   */
  async createLinkToken(userId: string, products: Products[] = [Products.Transactions, Products.Auth]) {
    try {
      const request = {
        user: {
          client_user_id: userId,
        },
        client_name: 'WeParlay',
        products: products,
        country_codes: [CountryCode.Us],
        language: 'en',
        webhook: `${process.env.SERVER_URL}/api/plaid/webhook`,
        account_filters: {
          depository: {
            account_subtypes: ['checking', 'savings'],
          },
        },
      };

      const response = await client.linkTokenCreate(request);
      return response.data;
    } catch (error) {
      console.error('Error creating link token:', error);
      throw error;
    }
  }

  /**
   * Exchange public token for access token
   */
  async exchangePublicToken(publicToken: string) {
    try {
      const response = await client.itemPublicTokenExchange({
        public_token: publicToken,
      });
      return response.data;
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw error;
    }
  }

  /**
   * Get account information
   */
  async getAccounts(accessToken: string) {
    try {
      const response = await client.accountsGet({
        access_token: accessToken,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  }

  /**
   * Get account balances
   */
  async getBalances(accessToken: string) {
    try {
      const response = await client.accountsBalanceGet({
        access_token: accessToken,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting balances:', error);
      throw error;
    }
  }

  /**
   * Get auth information for ACH transfers
   */
  async getAuthInfo(accessToken: string) {
    try {
      const response = await client.authGet({
        access_token: accessToken,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting auth info:', error);
      throw error;
    }
  }

  /**
   * Get transactions
   */
  async getTransactions(accessToken: string, startDate: string, endDate: string) {
    try {
      const response = await client.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  /**
   * Create a transfer for instant bank transfers
   */
  async createTransfer(accessToken: string, accountId: string, amount: number, type: 'debit' | 'credit') {
    try {
      const response = await client.transferCreate({
        access_token: accessToken,
        account_id: accountId,
        type: type,
        network: 'ach',
        amount: (amount * 100).toString(), // Convert to cents
        ach_class: 'web',
        user: {
          legal_name: 'WeParlay User',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }
  }

  /**
   * Identify Cash App accounts specifically
   */
  identifyCashAppAccount(accounts: any[]) {
    return accounts.find(account => 
      account.name?.toLowerCase().includes('cash') ||
      account.official_name?.toLowerCase().includes('cash app') ||
      account.subtype === 'checking' && account.name?.toLowerCase().includes('square')
    );
  }
}

export const plaidService = new PlaidService();
