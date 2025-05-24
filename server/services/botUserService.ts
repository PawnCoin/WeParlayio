import { storage } from '../storage';
import { emailService } from './emailService';

interface BotUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  subscriptionTier: string;
  balance: number;
  realMoneyBalance: number;
  wins: number;
  losses: number;
  totalBets: number;
}

const BOT_USERS: BotUser[] = [
  {
    id: 'bot_user_1',
    username: 'SportsBetterPro',
    email: 'sportsbetter@weparlay.io',
    firstName: 'Alex',
    lastName: 'Thompson',
    role: 'premium_user',
    subscriptionTier: 'premium',
    balance: 1250.00,
    realMoneyBalance: 850.00,
    wins: 23,
    losses: 12,
    totalBets: 35
  },
  {
    id: 'bot_user_2',
    username: 'FantasyKing',
    email: 'fantasy@weparlay.io',
    firstName: 'Jordan',
    lastName: 'Mitchell',
    role: 'vip_user',
    subscriptionTier: 'vip',
    balance: 2100.00,
    realMoneyBalance: 1500.00,
    wins: 45,
    losses: 18,
    totalBets: 63
  },
  {
    id: 'bot_user_3',
    username: 'CryptoGambler',
    email: 'crypto@weparlay.io',
    firstName: 'Sam',
    lastName: 'Rodriguez',
    role: 'premium_user',
    subscriptionTier: 'premium',
    balance: 890.00,
    realMoneyBalance: 650.00,
    wins: 18,
    losses: 15,
    totalBets: 33
  },
  {
    id: 'bot_user_4',
    username: 'LiveBetMaster',
    email: 'live@weparlay.io',
    firstName: 'Casey',
    lastName: 'Johnson',
    role: 'user',
    subscriptionTier: 'basic',
    balance: 450.00,
    realMoneyBalance: 300.00,
    wins: 12,
    losses: 8,
    totalBets: 20
  },
  {
    id: 'bot_user_5',
    username: 'EsportsElite',
    email: 'esports@weparlay.io',
    firstName: 'Taylor',
    lastName: 'Lee',
    role: 'premium_user',
    subscriptionTier: 'premium',
    balance: 1850.00,
    realMoneyBalance: 1200.00,
    wins: 34,
    losses: 16,
    totalBets: 50
  }
];

export class BotUserService {
  async createBotUsers(): Promise<void> {
    console.log('🤖 Creating bot users to populate platform data...');
    
    for (const botUser of BOT_USERS) {
      try {
        // Create the bot user
        await storage.upsertUser({
          id: botUser.id,
          username: botUser.username,
          email: botUser.email,
          firstName: botUser.firstName,
          lastName: botUser.lastName,
          role: botUser.role,
          subscriptionTier: botUser.subscriptionTier,
          balance: botUser.balance,
          realMoneyBalance: botUser.realMoneyBalance,
          wins: botUser.wins,
          losses: botUser.losses,
          totalBets: botUser.totalBets,
          status: 'active',
          emailVerified: true,
          profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${botUser.username}`,
          joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });

        console.log(`✅ Created bot user: ${botUser.username}`);
      } catch (error) {
        console.error(`❌ Failed to create bot user ${botUser.username}:`, error);
      }
    }
  }

  async createBotBets(): Promise<void> {
    console.log('🎯 Creating realistic betting activity...');
    
    const sports = ['football_nfl', 'basketball_nba', 'baseball_mlb', 'soccer_epl'];
    const betTypes = ['moneyline', 'spread', 'over_under'];
    
    for (const botUser of BOT_USERS) {
      // Create random bets for each bot user
      const numBets = Math.floor(Math.random() * 5) + 3; // 3-7 bets per user
      
      for (let i = 0; i < numBets; i++) {
        try {
          const sport = sports[Math.floor(Math.random() * sports.length)];
          const betType = betTypes[Math.floor(Math.random() * betTypes.length)];
          const amount = Math.floor(Math.random() * 200) + 50; // $50-$250 bets
          const odds = Math.floor(Math.random() * 300) + 100; // +100 to +400 odds
          
          await storage.createBet({
            userId: botUser.id,
            eventId: `${sport}_${Date.now()}_${i}`,
            betType,
            amount,
            odds,
            status: Math.random() > 0.3 ? 'settled' : 'pending', // 70% settled, 30% pending
            potentialWin: amount * (odds / 100),
            placedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last week
          });
        } catch (error) {
          console.error(`❌ Failed to create bet for ${botUser.username}:`, error);
        }
      }
    }
  }

  async createBotTransactions(): Promise<void> {
    console.log('💰 Creating transaction history...');
    
    for (const botUser of BOT_USERS) {
      // Create deposit transactions
      const numDeposits = Math.floor(Math.random() * 3) + 2; // 2-4 deposits
      
      for (let i = 0; i < numDeposits; i++) {
        try {
          const amount = Math.floor(Math.random() * 500) + 100; // $100-$600 deposits
          
          await storage.createTransaction({
            userId: botUser.id,
            type: 'deposit',
            amount,
            status: 'completed',
            method: 'crypto_wallet',
            description: `Crypto deposit - ${['Bitcoin', 'Ethereum', 'Solana'][Math.floor(Math.random() * 3)]}`,
            createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000) // Within last 2 weeks
          });
        } catch (error) {
          console.error(`❌ Failed to create transaction for ${botUser.username}:`, error);
        }
      }

      // Create some withdrawal transactions
      if (Math.random() > 0.5) { // 50% chance of withdrawal
        try {
          const amount = Math.floor(Math.random() * 300) + 50; // $50-$350 withdrawals
          
          await storage.createTransaction({
            userId: botUser.id,
            type: 'withdrawal',
            amount,
            status: Math.random() > 0.2 ? 'completed' : 'pending', // 80% completed
            method: 'crypto_wallet',
            description: 'Crypto withdrawal to wallet',
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last week
          });
        } catch (error) {
          console.error(`❌ Failed to create withdrawal for ${botUser.username}:`, error);
        }
      }
    }
  }

  async populatePlatformData(): Promise<void> {
    console.log('🚀 Starting bot user population process...');
    
    try {
      await this.createBotUsers();
      await this.createBotBets();
      await this.createBotTransactions();
      
      console.log('✅ Bot user population completed successfully!');
      console.log('📊 Platform now has realistic user data for demonstrations');
    } catch (error) {
      console.error('❌ Error during bot user population:', error);
    }
  }

  async generateDailyActivity(): Promise<void> {
    console.log('🔄 Generating daily bot activity...');
    
    // This can be called periodically to simulate ongoing activity
    for (const botUser of BOT_USERS.slice(0, 2)) { // Just use 2 users for daily activity
      if (Math.random() > 0.3) { // 70% chance of activity
        try {
          const amount = Math.floor(Math.random() * 100) + 25; // $25-$125 bets
          const sport = ['football_nfl', 'basketball_nba'][Math.floor(Math.random() * 2)];
          
          await storage.createBet({
            userId: botUser.id,
            eventId: `${sport}_${Date.now()}`,
            betType: 'moneyline',
            amount,
            odds: Math.floor(Math.random() * 200) + 100,
            status: 'pending',
            potentialWin: amount * 1.8,
            placedAt: new Date()
          });
          
          console.log(`🎯 ${botUser.username} placed a $${amount} bet`);
        } catch (error) {
          console.error(`❌ Failed to create daily activity for ${botUser.username}:`, error);
        }
      }
    }
  }
}

export const botUserService = new BotUserService();