import { storage } from '../storage';

export class SimpleBotService {
  async createBasicBotUsers(): Promise<void> {
    console.log('🤖 Creating basic bot users...');
    
    const botUsers = [
      {
        id: 'bot_user_1',
        username: 'SportsBetterPro',
        email: 'sportsbetter@weparlay.io',
        firstName: 'Alex',
        lastName: 'Thompson',
        role: 'user',
        subscriptionTier: 'premium',
        balance: 1250,
        wins: 23
      },
      {
        id: 'bot_user_2',
        username: 'FantasyKing',
        email: 'fantasy@weparlay.io',
        firstName: 'Jordan',
        lastName: 'Mitchell',
        role: 'user',
        subscriptionTier: 'vip',
        balance: 2100,
        wins: 45
      },
      {
        id: 'bot_user_3',
        username: 'CryptoGambler',
        email: 'crypto@weparlay.io',
        firstName: 'Sam',
        lastName: 'Rodriguez',
        role: 'user',
        subscriptionTier: 'premium',
        balance: 890,
        wins: 18
      }
    ];
    
    for (const botUser of botUsers) {
      try {
        await storage.upsertUser({
          id: botUser.id,
          username: botUser.username,
          email: botUser.email,
          firstName: botUser.firstName,
          lastName: botUser.lastName,
          role: botUser.role,
          subscriptionTier: botUser.subscriptionTier,
          balance: botUser.balance,
          wins: botUser.wins,
          status: 'active',
          emailVerified: true,
          profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${botUser.username}`,
          createdAt: new Date()
        });
        
        console.log(`✅ Created bot user: ${botUser.username}`);
      } catch (error) {
        console.error(`❌ Failed to create bot user ${botUser.username}:`, error);
      }
    }
    
    console.log('✅ Bot user creation completed!');
  }
}

export const simpleBotService = new SimpleBotService();