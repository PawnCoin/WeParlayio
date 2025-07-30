// Demo Plaid service for testing without real API credentials
class PlaidDemoService {
  
  async createLinkToken(userId: string, userName: string = 'WeParlay User') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      link_token: `demo_link_token_${userId}_${Date.now()}`,
      expiration: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    };
  }

  async exchangePublicToken(publicToken: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      access_token: `demo_access_token_${Date.now()}`,
      item_id: `demo_item_${Date.now()}`,
      accounts: [
        {
          account_id: 'demo_checking_001',
          name: 'Demo Checking Account',
          type: 'depository',
          subtype: 'checking',
          mask: '0001',
          balances: {
            available: 2500.50,
            current: 2750.75,
            iso_currency_code: 'USD'
          }
        },
        {
          account_id: 'demo_savings_002',
          name: 'Demo Savings Account',
          type: 'depository',
          subtype: 'savings',
          mask: '0002',
          balances: {
            available: 5000.00,
            current: 5000.00,
            iso_currency_code: 'USD'
          }
        }
      ]
    };
  }

  async getAccountBalances(accessToken: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      accounts: [
        {
          account_id: 'demo_checking_001',
          name: 'Demo Checking Account',
          type: 'depository',
          subtype: 'checking',
          mask: '0001',
          balances: {
            available: 2500.50,
            current: 2750.75,
            iso_currency_code: 'USD'
          }
        },
        {
          account_id: 'demo_savings_002',
          name: 'Demo Savings Account',
          type: 'depository',
          subtype: 'savings',
          mask: '0002',
          balances: {
            available: 5000.00,
            current: 5000.00,
            iso_currency_code: 'USD'
          }
        }
      ]
    };
  }

  async createTransfer(accessToken: string, accountId: string, amount: number, description: string) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      transfer_id: `demo_transfer_${Date.now()}`,
      amount: amount,
      status: 'pending',
      description: description
    };
  }

  async removeItem(accessToken: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      message: 'Demo account removed'
    };
  }
}

export default new PlaidDemoService();