import { storage } from '../storage';

export interface BookieRevenue {
  totalRevenue: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  totalBetsHandled: number;
  houseEdgePercentage: number;
  paymentGatewayFees: number;
  netProfit: number;
}

export interface RevenueSettings {
  houseEdgePercentage: number; // Default 5% house edge
  paypalFeePercentage: number; // PayPal charges 2.9% + $0.30
  stripeFeePercentage: number; // Stripe charges 2.9% + $0.30
  cashAppFeePercentage: number; // Cash App charges 0% for debit, 3% for credit
  cryptoFeePercentage: number; // Crypto network fees (usually $1-5 per transaction)
  weeklyWithdrawalLimit: number; // Your weekly withdrawal limit
  minimumWithdrawal: number; // Minimum amount to withdraw profits
}

export class BookieRevenueManager {
  private defaultSettings: RevenueSettings = {
    houseEdgePercentage: 5.0, // 5% house edge on all bets
    paypalFeePercentage: 2.9,
    stripeFeePercentage: 2.9,
    cashAppFeePercentage: 1.5, // Average between 0% and 3%
    cryptoFeePercentage: 0.1, // Very low crypto fees
    weeklyWithdrawalLimit: 50000, // $50k weekly withdrawal limit
    minimumWithdrawal: 100 // $100 minimum withdrawal
  };

  async getRevenueSettings(): Promise<RevenueSettings> {
    try {
      const settings = await storage.getPlatformSettings();
      return {
        ...this.defaultSettings,
        ...settings.revenueSettings
      };
    } catch (error) {
      return this.defaultSettings;
    }
  }

  async updateRevenueSettings(newSettings: Partial<RevenueSettings>): Promise<RevenueSettings> {
    const currentSettings = await this.getRevenueSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    
    await storage.updatePlatformSettings({
      revenueSettings: updatedSettings
    });
    
    return updatedSettings;
  }

  async calculateBetRevenue(
    betAmount: number, 
    paymentMethod: 'paypal' | 'stripe' | 'crypto' | 'weparlay_cash'
  ): Promise<{
    grossRevenue: number;
    houseEdge: number;
    paymentFees: number;
    netRevenue: number;
  }> {
    const settings = await this.getRevenueSettings();
    
    // Calculate house edge (what you keep from losing bets)
    const houseEdge = betAmount * (settings.houseEdgePercentage / 100);
    
    // Calculate payment gateway fees
    let paymentFees = 0;
    switch (paymentMethod) {
      case 'paypal':
        paymentFees = betAmount * (settings.paypalFeePercentage / 100) + 0.30;
        break;
      case 'stripe':
        paymentFees = betAmount * (settings.stripeFeePercentage / 100) + 0.30;
        break;
      case 'crypto':
        paymentFees = betAmount * (settings.cryptoFeePercentage / 100);
        break;
      case 'weparlay_cash':
        paymentFees = 0; // No fees for virtual currency
        break;
    }
    
    const grossRevenue = houseEdge;
    const netRevenue = grossRevenue - paymentFees;
    
    return {
      grossRevenue,
      houseEdge,
      paymentFees,
      netRevenue
    };
  }

  async recordBetRevenue(
    betAmount: number,
    paymentMethod: 'paypal' | 'stripe' | 'crypto' | 'weparlay_cash',
    betResult: 'win' | 'loss' | 'push',
    userId: string
  ): Promise<void> {
    const revenueCalculation = await this.calculateBetRevenue(betAmount, paymentMethod);
    
    let actualRevenue = 0;
    
    if (betResult === 'loss') {
      // User lost, house wins the full amount minus fees
      actualRevenue = revenueCalculation.netRevenue;
    } else if (betResult === 'win') {
      // User won, house loses the payout but keeps the house edge
      actualRevenue = -betAmount + revenueCalculation.houseEdge - revenueCalculation.paymentFees;
    } else {
      // Push/tie, house keeps processing fees only
      actualRevenue = -revenueCalculation.paymentFees;
    }
    
    // Record the revenue transaction
    await storage.updatePlatformRevenue(actualRevenue, paymentMethod);
    
    // Track transaction details
    await storage.createTransaction({
      userId,
      amount: betAmount,
      type: 'bet',
      status: 'completed',
      description: `Bet ${betResult} - Revenue: $${actualRevenue.toFixed(2)}`,
      metadata: {
        betResult,
        paymentMethod,
        houseRevenue: actualRevenue,
        paymentFees: revenueCalculation.paymentFees
      }
    });
  }

  async getRevenueReport(period: 'daily' | 'weekly' | 'monthly' | 'all'): Promise<BookieRevenue> {
    const financialSummary = await storage.getFinancialSummary();
    const settings = await this.getRevenueSettings();
    
    // Get transactions for the specified period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(2024, 0, 1); // Start of business
    }
    
    const transactions = await storage.getTransactions(1000, 0);
    const betTransactions = transactions.filter(t => 
      t.type === 'bet' && 
      new Date(t.createdAt!) >= startDate
    );
    
    const totalRevenue = betTransactions.reduce((sum, t) => {
      const metadata = t.metadata as any;
      return sum + (metadata?.houseRevenue || 0);
    }, 0);
    
    const paymentGatewayFees = betTransactions.reduce((sum, t) => {
      const metadata = t.metadata as any;
      return sum + (metadata?.paymentFees || 0);
    }, 0);
    
    return {
      totalRevenue,
      dailyRevenue: period === 'daily' ? totalRevenue : 0,
      weeklyRevenue: period === 'weekly' ? totalRevenue : 0,
      monthlyRevenue: period === 'monthly' ? totalRevenue : 0,
      totalBetsHandled: betTransactions.length,
      houseEdgePercentage: settings.houseEdgePercentage,
      paymentGatewayFees,
      netProfit: totalRevenue - paymentGatewayFees
    };
  }

  async processOwnerWithdrawal(amount: number): Promise<{
    success: boolean;
    message: string;
    transactionId?: string;
  }> {
    const settings = await this.getRevenueSettings();
    const revenue = await this.getRevenueReport('all');
    
    // Validate withdrawal
    if (amount < settings.minimumWithdrawal) {
      return {
        success: false,
        message: `Minimum withdrawal is $${settings.minimumWithdrawal}`
      };
    }
    
    if (amount > revenue.netProfit) {
      return {
        success: false,
        message: `Insufficient funds. Available: $${revenue.netProfit.toFixed(2)}`
      };
    }
    
    // Check weekly limit
    const weeklyRevenue = await this.getRevenueReport('weekly');
    if (amount > settings.weeklyWithdrawalLimit) {
      return {
        success: false,
        message: `Weekly withdrawal limit exceeded. Limit: $${settings.weeklyWithdrawalLimit}`
      };
    }
    
    // Process withdrawal (integrate with your bank account)
    const ownerBankAccount = await storage.getOwnerBankAccount();
    
    if (!ownerBankAccount) {
      return {
        success: false,
        message: 'Owner bank account not configured'
      };
    }
    
    // Record withdrawal
    await storage.createTransaction({
      userId: 'owner',
      amount: -amount,
      type: 'withdrawal',
      status: 'completed',
      description: `Owner withdrawal to ${ownerBankAccount.accountNumber?.slice(-4)}`,
      metadata: {
        bankAccount: ownerBankAccount.id,
        withdrawalType: 'owner_profit'
      }
    });
    
    return {
      success: true,
      message: `Withdrawal of $${amount} processed successfully`,
      transactionId: `WD${Date.now()}`
    };
  }
}

export const bookieRevenueManager = new BookieRevenueManager();