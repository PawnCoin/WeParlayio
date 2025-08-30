import {
  users, User, InsertUser, UpsertUser,
  sports, Sport, InsertSport,
  teams, Team, InsertTeam,
  events, Event, InsertEvent,
  bets, Bet, InsertBet,
  tournaments, Tournament, InsertTournament,
  fantasyTeams, FantasyTeam, InsertFantasyTeam,
  players, Player, InsertPlayer,
  fantasyTeamPlayers, FantasyTeamPlayer, InsertFantasyTeamPlayer,
  bankAccounts, BankAccount, InsertBankAccount,
  transactions, Transaction, InsertTransaction,
  supportTickets, SupportTicket, InsertSupportTicket, 
  supportTicketMessages, SupportTicketMessage, InsertSupportTicketMessage, 
  supportTicketLogs, SupportTicketLog,
  knownIssues, KnownIssue, InsertKnownIssue,
  bettingChallenges, BettingChallenge, InsertBettingChallenge,
  notifications, Notification, InsertNotification,
  p2pChallenges, P2pChallenge, InsertP2pChallenge,
  p2pTransactions, P2pTransaction, InsertP2pTransaction,
  p2pActivity, P2pActivity, InsertP2pActivity,
  friendships, Friendship, InsertFriendship,
  socialPosts, SocialPost, InsertSocialPost,
  socialLikes, SocialLike, InsertSocialLike,
  socialFollows, SocialFollow, InsertSocialFollow,
  socialLeaderboard, SocialLeaderboard, InsertSocialLeaderboard
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // Basic user operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(userData: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Sports operations  
  getAllSports(): Promise<Sport[]>;
  createSport(sport: InsertSport): Promise<Sport>;

  // Events operations
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;

  // Basic required methods for platform functionality
  updateUserBalance(userId: string, amount: number): Promise<User>;
  getUserWithdrawalsForMonth(userId: string, month: number): Promise<number>;
  getFinancialSummary(): Promise<any>;
  createBettingChallenge(challenge: InsertBettingChallenge): Promise<BettingChallenge>;
  getBettingChallengeByUuid(uuid: string): Promise<BettingChallenge | undefined>;
  
  // Critical missing methods that routes require
  getLiveEvents(): Promise<Event[]>;
  getTournament(id: number): Promise<Tournament | undefined>;
  getUpcomingEvents(limit?: number): Promise<Event[]>;
  updateUserPreferences(userId: string, preferences: any): Promise<User>;
  updateUserGamertag(userId: string, gamertag: string): Promise<User>;
  getUserChallenges(userId: string, status?: string): Promise<BettingChallenge[]>;
  acceptBettingChallenge(uuid: string, acceptedBy: string): Promise<BettingChallenge>;
  updateBettingChallengeStatus(uuid: string, status: string): Promise<BettingChallenge>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  
  // Enhanced betting operations with currency support
  placeBet(bet: InsertBet): Promise<Bet>;
  getUserBets(userId: string, status?: string): Promise<Bet[]>;
  updateBetStatus(betId: number, status: string, result?: string): Promise<Bet>;
  processBetPayout(betId: number, payout: number): Promise<Bet>;
  getUserBalance(userId: string, currency: string): Promise<number>;
  updateUserCurrencyBalance(userId: string, currency: string, amount: number): Promise<User>;
  validateUserBalance(userId: string, currency: string, amount: number): Promise<boolean>;
  markNotificationAsRead(id: number, userId: string): Promise<Notification>;
  getTransactions(limit: number, offset: number): Promise<Transaction[]>;
  incrementUserWins(userId: string): Promise<User>;
  updatePlatformRevenue(amount: number, feeType: string): Promise<any>;
  updateBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined>;
  getTicketMessages(ticketId: number): Promise<SupportTicketMessage[]>;
  addTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage>;

  getFantasyTeam(id: number): Promise<FantasyTeam | undefined>;
  addPlayerToFantasyTeam(fantasyTeamPlayer: InsertFantasyTeamPlayer): Promise<FantasyTeamPlayer>;
  getUserByGamertag(gamertag: string): Promise<User | undefined>;
  settleBettingChallenge(uuid: string, winnerId?: string, isDraw?: boolean): Promise<BettingChallenge>;
  getUserBets(userId: number): Promise<Bet[]>;
  
  // WeParlay Cash system methods
  updateUserTier(userId: string, tier: string): Promise<User>;
  createWeparlayCashTransaction(transactionData: {
    userId: string;
    amount: number;
    type: string;
    description: string;
    metadata?: any;
  }): Promise<any>;
  getWeparlayCashTransactions(userId: string): Promise<any[]>;
  
  // User consent and profile methods
  updateUserConsent(userId: string, consents: any): Promise<User>;
  updateUserStripeCustomerId(userId: string, customerId: string): Promise<User>;
  getSport(id: number): Promise<Sport | undefined>;
  getSportByKey(key: string): Promise<Sport | undefined>;
  getAllTeams(): Promise<Team[]>;
  getTeamsBySport(sportId: number): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  getEvent(id: number): Promise<Event | undefined>;
  createBet(bet: InsertBet): Promise<Bet>;
  settleBet(betId: number, status: string): Promise<Bet>;
  updateUserWeplayTokenBalance(userId: string, amount: number): Promise<User>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserChallenges(userId: string, status?: string): Promise<BettingChallenge[]>;
  acceptBettingChallenge(uuid: string, acceptedBy: string): Promise<BettingChallenge>;
  updateBettingChallengeStatus(uuid: string, status: string): Promise<BettingChallenge>;
  settleBettingChallenge(uuid: string, winnerId?: string, isDraw?: boolean): Promise<BettingChallenge>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationAsRead(id: number, userId: string): Promise<Notification>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactions(limit: number, offset: number): Promise<Transaction[]>;
  incrementUserWins(userId: string): Promise<User>;

  getFantasyTeam(id: number): Promise<FantasyTeam | undefined>;
  addPlayerToFantasyTeam(fantasyTeamPlayer: InsertFantasyTeamPlayer): Promise<FantasyTeamPlayer>;
  updatePlatformRevenue(amount: number, feeType: string): Promise<any>;
  updateBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount>;
  updateUserStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User>;
  getUserByGamertag(gamertag: string): Promise<User | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined>;
  getTicketMessages(ticketId: number): Promise<SupportTicketMessage[]>;
  addTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage>;
  
  // Friends system methods
  sendFriendRequest(userId: string, friendId: string): Promise<any>;
  acceptFriendRequest(userId: string, friendId: string): Promise<any>;
  removeFriend(userId: string, friendId: string): Promise<boolean>;
  getUserFriends(userId: string): Promise<any[]>;
  getPendingFriendRequests(userId: string): Promise<any[]>;
  searchUsers(query: string, currentUserId: string): Promise<any[]>;
  
  // Platform settings and configuration management
  getPlatformSetting(key: string): Promise<any>;
  setPlatformSetting(key: string, value: any): Promise<any>;
  getAllPlatformSettings(): Promise<any[]>;
  getAdminSettings(): Promise<any>;
  updateAdminSettings(settings: any): Promise<any>;
  getSystemConfiguration(): Promise<any>;
  updateSystemConfiguration(config: any): Promise<any>;
  getOwnerBankAccount(): Promise<any>;
  updateUserStatus(userId: string, status: string): Promise<User | null>;
  getUserGrowthMetrics(range: string): Promise<any[]>;
  
  // P2P Betting system methods
  createP2pChallenge(challenge: InsertP2pChallenge): Promise<P2pChallenge>;
  getP2pChallenge(challengeId: string): Promise<P2pChallenge | undefined>;
  getP2pChallengeWithDetails(challengeId: string): Promise<P2pChallenge | undefined>;
  getAvailableP2pChallenges(userId: string): Promise<P2pChallenge[]>;
  getUserP2pChallenges(userId: string): Promise<P2pChallenge[]>;
  acceptP2pChallenge(challengeId: string, challengeeId: string, challengeePick: string): Promise<P2pChallenge>;
  cancelP2pChallenge(challengeId: string, reason: string): Promise<P2pChallenge>;
  settleP2pChallenge(challengeId: string, winnerUserId: string, settlementReason: string): Promise<P2pChallenge>;
  
  // P2P Escrow system
  depositToP2pEscrow(params: {
    challengeId: string;
    userId: string;
    amount: number;
    currency: string;
  }): Promise<P2pTransaction>;
  releaseFromP2pEscrow(challengeId: string, winnerUserId: string, amount: number): Promise<P2pTransaction>;
  refundP2pEscrow(challengeId: string): Promise<P2pTransaction[]>;
  
  // P2P Activity and stats
  createP2pActivity(activity: InsertP2pActivity): Promise<P2pActivity>;
  getP2pChallengeActivity(challengeId: string): Promise<P2pActivity[]>;
  getUserP2pStats(userId: string): Promise<{
    totalChallenges: number;
    wonChallenges: number;
    totalWinnings: number;
    winRate: number;
  }>;
  
  // Social Betting operations
  getSocialFeed(userId?: string): Promise<any[]>;
  getSocialLeaderboard(period: string): Promise<any[]>;
  createSocialPost(post: InsertSocialPost): Promise<SocialPost>;
  toggleSocialLike(userId: string, postId: number): Promise<{ liked: boolean; likeCount: number }>;
  toggleSocialFollow(followerId: string, followingId: string): Promise<{ following: boolean; followerCount: number }>;
}

// Simple memory storage implementation
export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private sports = new Map<number, Sport>();
  private events = new Map<number, Event>();
  private challenges = new Map<string, BettingChallenge>();
  private nextId = 1;

  constructor() {
    // Initialize with basic sports data
    this.createSport({ name: "Football", key: "americanfootball_nfl", isActive: true });
    this.createSport({ name: "Basketball", key: "basketball_nba", isActive: true });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = insertUser.id || String(this.nextId++);
    const user: User = { 
      ...insertUser, 
      id, 
      balance: 1000,
      gamertag: null,
      weparlayCashBalance: 0,
      cashBalance: 0,
      betsCount: 0,
      winsCount: 0,
      totalBets: 0,
      totalWinnings: 0,
      winRate: 0,
      averageBet: 0,
      biggestWin: 0,
      role: "user",
      tier: "bronze",
      phoneNumber: undefined,
      walletAddress: undefined,
      walletType: undefined,
      lastActivity: undefined,
      preferences: null,
      socialLinks: null,
      password: undefined,
      subscriptionExpiry: undefined,

      stripeCustomerId: null,
      stripeSubscriptionId: null,
      plaidAccessToken: null,
      plaidItemId: null,
      consentGiven: false,
      consentTimestamp: null,
      privacySettings: null,
      twoFactorEnabled: false,
      emailVerified: false,
      createdAt: null,
      updatedAt: null
    };
    this.users.set(id, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUser(userData.id);
    if (existingUser) {
      const updatedUser = { ...existingUser, ...userData };
      this.users.set(userData.id, updatedUser);
      return updatedUser;
    } else {
      return this.createUser(userData);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllSports(): Promise<Sport[]> {
    return Array.from(this.sports.values());
  }

  async createSport(insertSport: InsertSport): Promise<Sport> {
    const id = this.nextId++;
    const sport: Sport = { ...insertSport, id };
    this.sports.set(id, sport);
    return sport;
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.nextId++;
    const event: Event = { 
      ...insertEvent, 
      id,
      status: insertEvent.status || 'upcoming',
      homeScore: insertEvent.homeScore || 0,
      awayScore: insertEvent.awayScore || 0
    };
    this.events.set(id, event);
    return event;
  }

  // Missing methods implementation for TypeScript compliance
  async getSport(id: number): Promise<Sport | undefined> {
    return this.sports.get(id);
  }

  async getSportByKey(key: string): Promise<Sport | undefined> {
    return Array.from(this.sports.values()).find(sport => sport.key === key);
  }

  async getAllTeams(): Promise<Team[]> {
    return []; // Teams not implemented in memory storage
  }

  async getTeamsBySport(sportId: number): Promise<Team[]> {
    return []; // Teams not implemented in memory storage
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return undefined; // Teams not implemented in memory storage
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getLiveEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.status === 'live');
  }

  async getUpcomingEvents(limit?: number): Promise<Event[]> {
    const upcoming = Array.from(this.events.values()).filter(event => event.status === 'upcoming');
    return limit ? upcoming.slice(0, limit) : upcoming;
  }

  async getTournament(id: number): Promise<Tournament | undefined> {
    return undefined; // Tournaments not implemented in memory storage
  }

  async createBet(bet: InsertBet): Promise<Bet> {
    const id = this.nextId++;
    const newBet: Bet = { ...bet, id, status: bet.status || 'pending' };
    return newBet;
  }

  async settleBet(betId: number, status: string): Promise<Bet> {
    const bet: Bet = { id: betId, userId: 'system', eventId: 1, amount: 0, odds: 0, potentialPayout: 0, status };
    return bet;
  }

  async updateUserWeplayTokenBalance(userId: string, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser = { ...user, weplayTokens: (user.weplayTokenBalance || 0) + amount };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    throw new Error('User not found');
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.nextId++;
    const newNotification: Notification = { ...notification, id, read: false, updatedAt: new Date(), resolvedAt: null, updatedAt: new Date() };
    return notification;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.nextId++;
    const newTransaction: Transaction = { ...transaction, id, createdAt: new Date(), updatedAt: new Date(),
      updatedAt: new Date()
    };
    this.challenges.set(uuid, newChallenge);
    return newChallenge;
  }

  async getBettingChallengeByUuid(uuid: string): Promise<BettingChallenge | undefined> {
    return this.challenges.get(uuid);
  }

  // Platform settings and configuration management
  private platformSettings = new Map<string, any>();
  private adminSettings: any = {
    platformFee: 0.05,
    maxWithdrawalLimit: 10000,
    minWithdrawalAmount: 20,
    maintenanceMode: false,
    registrationEnabled: true,
    apiKeysValid: true
  };
  
  async getPlatformSetting(key: string): Promise<any> {
    return this.platformSettings.get(key) || null;
  }
  
  async setPlatformSetting(key: string, value: any): Promise<any> {
    const setting = { key, value, updatedAt: new Date() };
    this.platformSettings.set(key, setting);
    return setting;
  }
  
  async getAllPlatformSettings(): Promise<any[]> {
    return Array.from(this.platformSettings.values());
  }
  
  async getAdminSettings(): Promise<any> {
    return { ...this.adminSettings, updatedAt: new Date() };
  }
  
  async updateAdminSettings(settings: any): Promise<any> {
    this.adminSettings = { ...this.adminSettings, ...settings, updatedAt: new Date() };
    return this.adminSettings;
  }
  
  async getSystemConfiguration(): Promise<any> {
    return {
      environment: process.env.NODE_ENV || 'development',
      databaseConnected: true,
      apiKeysConfigured: {
        rapidapi: !!process.env.RAPIDAPI_KEY,
        theOddsApi: !!process.env.THE_ODDS_API_KEY,
        gridApi: !!process.env.GRID_API_KEY
      },
      systemHealth: 'operational',
      uptime: process.uptime(),
      lastUpdated: new Date()
    };
  }
  
  async updateSystemConfiguration(config: any): Promise<any> {
    // In real implementation, this would update system config
    return { ...config, updated: true, timestamp: new Date() };
  }
  
  async getOwnerBankAccount(): Promise<any> {
    // Return mock bank account for demo
    return {
      id: 1,
      userId: 'admin-owner',
      accountName: 'WeParlay Business Account',
      bankName: 'Example Bank',
      accountNumber: '****1234',
      routingNumber: '****5678',
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  async updateUserStatus(userId: string, status: string): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) return null;
    
    const updatedUser = { ...user, status, updatedAt: new Date() };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async getUserGrowthMetrics(range: string): Promise<any[]> {
    // Generate mock growth data based on range
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        newUsers: Math.floor(Math.random() * 10) + 1,
        totalUsers: 150 + (days - i) * 2,
        activeUsers: Math.floor(Math.random() * 30) + 20
      });
    }
    return data;
  }

  // WeParlay Cash system implementations
  async updateUserTier(userId: string, tier: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, tier };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createWeparlayCashTransaction(transactionData: {
    userId: string;
    amount: number;
    type: string;
    description: string;
    metadata?: any;
  }): Promise<any> {
    const transaction = {
      id: this.nextId++,
      ...transactionData,
      timestamp: new Date(),
      status: 'completed'
    };
    
    // Update user balance if this is a credit/debit
    const user = this.users.get(transactionData.userId);
    if (user) {
      const balanceChange = transactionData.type === 'credit' ? transactionData.amount : -transactionData.amount;
      const updatedUser = { ...user, weparlayCashBalance: (user.weparlayCashBalance || 0) + balanceChange };
      this.users.set(transactionData.userId, updatedUser);
    }
    
    return transaction;
  }

  async getWeparlayCashTransactions(userId: string): Promise<any[]> {
    // Mock implementation - in real app would query transaction history
    return [
      {
        id: 1,
        userId,
        amount: 100,
        type: 'credit',
        description: 'Tier upgrade bonus',
        timestamp: new Date(),
        status: 'completed'
      }
    ];
  }

  async updateUserConsent(userId: string, consentData: {
    smsConsent?: boolean;
    marketingConsent?: boolean;
    emailConsent?: boolean;
    lastConsentUpdate?: Date;
  }): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { 
      ...user, 
      smsConsent: consentData.smsConsent ?? user.smsConsent,
      marketingConsent: consentData.marketingConsent ?? user.marketingConsent,
      emailConsent: consentData.emailConsent ?? user.emailConsent,
      lastConsentUpdate: consentData.lastConsentUpdate ?? new Date()
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Friends system methods
  async sendFriendRequest(userId: string, friendId: string): Promise<any> {
    const friendship = {
      id: Date.now(),
      userId,
      friendId,
      status: 'pending',
      requestedAt: new Date(),
      createdAt: new Date(), updatedAt: new Date(),
      updatedAt: new Date()
    };
    return friendship;
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    return true;
  }

  async getUserFriends(userId: string): Promise<any[]> {
    // Return sample friends for demo purposes
    return [
      {
        id: 'friend-1',
        username: 'sportsfan2024',
        firstName: 'Alex',
        lastName: 'Johnson',
        profileImageUrl: null,
        tier: 'silver',
        wins: 42,
        status: 'accepted'
      },
      {
        id: 'friend-2',
        username: 'betmaster99',
        firstName: 'Sarah',
        lastName: 'Williams',
        profileImageUrl: null,
        tier: 'gold',
        wins: 67,
        status: 'accepted'
      }
    ];
  }

  async getPendingFriendRequests(userId: string): Promise<any[]> {
    // Return sample pending requests for demo purposes
    return [
      {
        id: 'pending-1',
        username: 'newplayer123',
        firstName: 'Mike',
        lastName: 'Davis',
        profileImageUrl: null,
        tier: 'bronze',
        requestedAt: new Date(Date.now() - 86400000) // 1 day ago
      }
    ];
  }

  async searchUsers(query: string, currentUserId: string): Promise<any[]> {
    // Return sample search results for demo purposes
    return [
      {
        id: 'search-1',
        username: 'sportsexpert',
        firstName: 'Jordan',
        lastName: 'Smith',
        profileImageUrl: null,
        tier: 'platinum'
      },
      {
        id: 'search-2',
        username: 'oddsmaster',
        firstName: 'Taylor',
        lastName: 'Brown',
        profileImageUrl: null,
        tier: 'diamond'
      }
    ].filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.firstName.toLowerCase().includes(query.toLowerCase()) ||
      user.lastName.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Enhanced betting operations implementation
  private bets = new Map<number, Bet>();

  async placeBet(bet: InsertBet): Promise<Bet> {
    const id = this.nextId++;
    const newBet: Bet = {
      ...bet,
      id,
      placedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      settledAt: null
    };
    this.bets.set(id, newBet);
    
    // Update user balance based on currency
    const user = await this.getUser(bet.userId);
    if (user) {
      await this.deductUserBalance(bet.userId, bet.currency, bet.amount);
    }
    
    return newBet;
  }

  async getUserBets(userId: string, status?: string): Promise<Bet[]> {
    const userBets = Array.from(this.bets.values()).filter(bet => bet.userId === userId);
    if (status) {
      return userBets.filter(bet => bet.status === status);
    }
    return userBets;
  }

  async updateBetStatus(betId: number, status: string, result?: string): Promise<Bet> {
    const bet = this.bets.get(betId);
    if (!bet) throw new Error('Bet not found');
    
    const updatedBet = {
      ...bet,
      status,
      result,
      settledAt: status !== 'pending' ? new Date() : null,
      updatedAt: new Date()
    };
    
    // Handle winnings and refunds based on status
    if (status === 'won' && bet.potentialPayout) {
      // Credit full payout (original bet + winnings) to user's balance
      await this.creditUserBalance(bet.userId, bet.currency || 'default', bet.potentialPayout);
      console.log(`✅ Bet ${betId} WON: Credited $${bet.potentialPayout} to user ${bet.userId} (${bet.currency || 'default'})`);
    } else if (status === 'push' || status === 'cancelled') {
      // Refund original bet amount
      await this.creditUserBalance(bet.userId, bet.currency || 'default', bet.amount);
      console.log(`↩️ Bet ${betId} ${status.toUpperCase()}: Refunded $${bet.amount} to user ${bet.userId} (${bet.currency || 'default'})`);
    } else if (status === 'lost') {
      console.log(`❌ Bet ${betId} LOST: No payout for user ${bet.userId}`);
      // No payout for lost bets - money was already deducted when bet was placed
    }
    
    this.bets.set(betId, updatedBet);
    return updatedBet;
  }

  // Credit user balance (for winnings and refunds)
  async creditUserBalance(userId: string, currency: string, amount: number): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      console.error(`User ${userId} not found for balance credit`);
      return;
    }
    
    console.log(`💰 Crediting $${amount} to user ${userId} (${currency})`);
    
    switch (currency) {
      case 'weparlay_cash':
        user.weparlayCashBalance = (user.weparlayCashBalance || 0) + amount;
        break;
      case 'real_money':
        user.balance = (user.balance || 0) + amount;
        break;
      case 'crypto':
        user.cryptoBalance = (user.cryptoBalance || 0) + amount;
        break;
      default:
        user.balance = (user.balance || 0) + amount;
        break;
    }
    
    // Update user statistics for winnings (not refunds)
    if (amount > 0) {
      user.totalWinnings = (user.totalWinnings || 0) + amount;
      user.biggestWin = Math.max(user.biggestWin || 0, amount);
      user.winsCount = (user.winsCount || 0) + 1;
      
      // Recalculate win rate
      const totalBets = user.betsCount || 0;
      user.winRate = totalBets > 0 ? (user.winsCount / totalBets * 100) : 0;
    }
    
    console.log(`✅ Balance updated: User ${userId} now has $${this.getUserBalance(userId, currency)} in ${currency}`);
  }

  // Settle bets automatically (for admin or automatic settlement)
  async settleBet(betId: number, result: 'won' | 'lost' | 'push' | 'cancelled'): Promise<{ success: boolean; message: string; bet?: Bet }> {
    try {
      const bet = await this.updateBetStatus(betId, result, result);
      return { 
        success: true, 
        message: `Bet settled as ${result}${result === 'won' ? ` - $${bet.potentialPayout} credited` : result === 'push' || result === 'cancelled' ? ` - $${bet.amount} refunded` : ''}`, 
        bet 
      };
    } catch (error) {
      console.error('Error settling bet:', error);
      return { success: false, message: 'Settlement failed' };
    }
  }

  async processBetPayout(betId: number, payout: number): Promise<Bet> {
    const bet = this.bets.get(betId);
    if (!bet) throw new Error('Bet not found');
    
    // Credit user account
    await this.creditUserBalance(bet.userId, bet.currency, payout);
    
    return this.updateBetStatus(betId, 'won');
  }

  async getUserBalance(userId: string, currency: string): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) return 0;
    
    switch (currency) {
      case 'weparlay_cash':
        return user.weparlayCashBalance || 0;
      case 'real_money':
        return user.cashBalance || 0;
      case 'crypto':
        return user.weplayTokenBalance || 0;
      default:
        return user.balance || 0;
    }
  }

  async validateUserBalance(userId: string, currency: string, amount: number): Promise<boolean> {
    const balance = await this.getUserBalance(userId, currency);
    return balance >= amount;
  }

  async updateUserCurrencyBalance(userId: string, currency: string, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    const updates: Partial<User> = {};
    switch (currency) {
      case 'weparlay_cash':
        updates.weparlayCashBalance = (user.weparlayCashBalance || 0) + amount;
        break;
      case 'real_money':
        updates.cashBalance = (user.cashBalance || 0) + amount;
        break;
      case 'crypto':
        updates.weplayTokenBalance = (user.weplayTokenBalance || 0) + amount;
        break;
      default:
        updates.balance = (user.balance || 0) + amount;
    }

    return this.upsertUser({ ...user, ...updates });
  }

  private async deductUserBalance(userId: string, currency: string, amount: number): Promise<User> {
    return this.updateUserCurrencyBalance(userId, currency, -amount);
  }

  private async creditUserBalance(userId: string, currency: string, amount: number): Promise<User> {
    return this.updateUserCurrencyBalance(userId, currency, amount);
  }
  async getFinancialSummary(): Promise<any> {
    const totalUsers = this.users.size;
    const totalRevenue = totalUsers * 50;
    const totalPayouts = totalUsers * 25;
    
    return {
      totalRevenue,
      totalPayouts,
      netProfit: totalRevenue - totalPayouts,
      activeUsers: totalUsers,
      totalTransactions: totalUsers * 5,
      avgBetSize: 25.50,
      monthlyGrowth: 15.3,
      platformBalance: totalRevenue - totalPayouts
    };
  }

  async getTransactions(limit: number, offset: number): Promise<Transaction[]> {
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      id: i + 1,
      userId: 'user-' + (i + 1),
      amount: 25 + (i * 5),
      type: i % 2 === 0 ? 'deposit' : 'withdrawal',
      status: 'completed',
      description: `Transaction ${i + 1}`,
      createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
      updatedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
      metadata: null,
      feeAmount: 0
    }));
  }

  async updatePlatformRevenue(amount: number, feeType: string): Promise<any> {
    return { success: true, amount, feeType, timestamp: new Date() };
  }

  async updateBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount> {
    const id = this.nextId++;
    return { ...bankAccount, id };
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.nextId++;
    return { ...ticket, id, createdAt: new Date(), updatedAt: new Date() };
  }

  async getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined> {
    return undefined;
  }

  async getTicketMessages(ticketId: number): Promise<SupportTicketMessage[]> {
    return [];
  }

  async addTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage> {
    const id = this.nextId++;
    return { ...message, id, createdAt: new Date() };
  }

  async getUserByGamertag(gamertag: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.gamertag === gamertag);
  }

  async updateUserStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, stripeCustomerId: customerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // P2P Betting system implementation
  private p2pChallenges = new Map<string, P2pChallenge>();
  private p2pTransactions = new Map<number, P2pTransaction>();
  private p2pActivity = new Map<number, P2pActivity>();

  async createP2pChallenge(challenge: InsertP2pChallenge): Promise<P2pChallenge> {
    const id = Math.random().toString(36).substring(2, 15);
    const newChallenge: P2pChallenge = {
      ...challenge,
      id,
      escrowHeld: 0,
      status: 'open',
      winnerUserId: null,
      settlementReason: null,
      acceptedAt: null,
      settledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.p2pChallenges.set(id, newChallenge);
    return newChallenge;
  }

  async getP2pChallenge(challengeId: string): Promise<P2pChallenge | undefined> {
    return this.p2pChallenges.get(challengeId);
  }

  async getP2pChallengeWithDetails(challengeId: string): Promise<P2pChallenge | undefined> {
    const challenge = this.p2pChallenges.get(challengeId);
    if (!challenge) return undefined;

    // Add challenger/challengee usernames
    const challenger = await this.getUser(challenge.challengerId);
    const challengee = challenge.challengeeId ? await this.getUser(challenge.challengeeId) : null;

    return {
      ...challenge,
      challengerUsername: challenger?.username || challenger?.firstName || 'Unknown',
      challengeeUsername: challengee?.username || challengee?.firstName || 'Unknown',
    } as P2pChallenge;
  }

  async getAvailableP2pChallenges(userId: string): Promise<P2pChallenge[]> {
    const challenges = Array.from(this.p2pChallenges.values())
      .filter(challenge => 
        challenge.status === 'open' && 
        challenge.challengerId !== userId &&
        challenge.expiresAt > new Date() &&
        (challenge.isPublic || 
         challenge.challengeeId === userId ||
         (challenge.allowedFriends && challenge.allowedFriends.includes(userId)))
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Add usernames
    const challengesWithUsernames = await Promise.all(
      challenges.map(async (challenge) => {
        const challenger = await this.getUser(challenge.challengerId);
        return {
          ...challenge,
          challengerUsername: challenger?.username || challenger?.firstName || 'Unknown',
        };
      })
    );

    return challengesWithUsernames;
  }

  async getUserP2pChallenges(userId: string): Promise<P2pChallenge[]> {
    const challenges = Array.from(this.p2pChallenges.values())
      .filter(challenge => 
        challenge.challengerId === userId || challenge.challengeeId === userId
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Add usernames
    const challengesWithUsernames = await Promise.all(
      challenges.map(async (challenge) => {
        const challenger = await this.getUser(challenge.challengerId);
        const challengee = challenge.challengeeId ? await this.getUser(challenge.challengeeId) : null;
        return {
          ...challenge,
          challengerUsername: challenger?.username || challenger?.firstName || 'Unknown',
          challengeeUsername: challengee?.username || challengee?.firstName || 'Unknown',
        };
      })
    );

    return challengesWithUsernames;
  }

  async acceptP2pChallenge(challengeId: string, challengeeId: string, challengeePick: string): Promise<P2pChallenge> {
    const challenge = this.p2pChallenges.get(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const updatedChallenge: P2pChallenge = {
      ...challenge,
      challengeeId,
      challengeePick,
      status: 'accepted',
      acceptedAt: new Date(),
      updatedAt: new Date(),
    };

    this.p2pChallenges.set(challengeId, updatedChallenge);
    return updatedChallenge;
  }

  async cancelP2pChallenge(challengeId: string, reason: string): Promise<P2pChallenge> {
    const challenge = this.p2pChallenges.get(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const updatedChallenge: P2pChallenge = {
      ...challenge,
      status: 'cancelled',
      settlementReason: reason,
      settledAt: new Date(),
      updatedAt: new Date(),
    };

    this.p2pChallenges.set(challengeId, updatedChallenge);

    // Refund the challenger's escrow
    await this.refundP2pEscrow(challengeId);

    return updatedChallenge;
  }

  async settleP2pChallenge(challengeId: string, winnerUserId: string, settlementReason: string): Promise<P2pChallenge> {
    const challenge = this.p2pChallenges.get(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const updatedChallenge: P2pChallenge = {
      ...challenge,
      status: 'settled',
      winnerUserId,
      settlementReason,
      settledAt: new Date(),
      updatedAt: new Date(),
    };

    this.p2pChallenges.set(challengeId, updatedChallenge);

    // Release funds to winner
    await this.releaseFromP2pEscrow(challengeId, winnerUserId, challenge.totalPot);

    return updatedChallenge;
  }

  async depositToP2pEscrow(params: {
    challengeId: string;
    userId: string;
    amount: number;
    currency: string;
  }): Promise<P2pTransaction> {
    const { challengeId, userId, amount, currency } = params;
    
    // Deduct from user balance
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    const balanceBefore = user.weparlayCashBalance || 0;
    if (balanceBefore < amount) {
      throw new Error('Insufficient balance');
    }

    await this.deductUserBalance(userId, currency, amount);
    const balanceAfter = balanceBefore - amount;

    // Update challenge escrow
    const challenge = this.p2pChallenges.get(challengeId);
    if (challenge) {
      challenge.escrowHeld = (challenge.escrowHeld || 0) + amount;
      this.p2pChallenges.set(challengeId, challenge);
    }

    // Create transaction record
    const transactionId = this.nextId++;
    const transaction: P2pTransaction = {
      id: transactionId,
      challengeId,
      userId,
      transactionType: 'escrow_deposit',
      amount: -amount,
      currency,
      balanceBefore,
      balanceAfter,
      description: `Deposited $${amount} to escrow for P2P challenge`,
      createdAt: new Date(),
    };

    this.p2pTransactions.set(transactionId, transaction);
    return transaction;
  }

  async releaseFromP2pEscrow(challengeId: string, winnerUserId: string, amount: number): Promise<P2pTransaction> {
    // Credit winner's balance
    const user = await this.getUser(winnerUserId);
    if (!user) throw new Error('Winner user not found');

    const balanceBefore = user.weparlayCashBalance || 0;
    await this.creditUserBalance(winnerUserId, 'weparlay_cash', amount);
    const balanceAfter = balanceBefore + amount;

    // Update challenge escrow
    const challenge = this.p2pChallenges.get(challengeId);
    if (challenge) {
      challenge.escrowHeld = 0;
      this.p2pChallenges.set(challengeId, challenge);
    }

    // Create transaction record
    const transactionId = this.nextId++;
    const transaction: P2pTransaction = {
      id: transactionId,
      challengeId,
      userId: winnerUserId,
      transactionType: 'escrow_release',
      amount,
      currency: 'weparlay_cash',
      balanceBefore,
      balanceAfter,
      description: `Won $${amount} from P2P challenge`,
      createdAt: new Date(),
    };

    this.p2pTransactions.set(transactionId, transaction);
    return transaction;
  }

  async refundP2pEscrow(challengeId: string): Promise<P2pTransaction[]> {
    const challenge = this.p2pChallenges.get(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const refunds: P2pTransaction[] = [];

    // Refund challenger
    if (challenge.challengerId && challenge.betAmount > 0) {
      const challengerUser = await this.getUser(challenge.challengerId);
      if (challengerUser) {
        const balanceBefore = challengerUser.weparlayCashBalance || 0;
        await this.creditUserBalance(challenge.challengerId, 'weparlay_cash', challenge.betAmount);
        
        const transactionId = this.nextId++;
        const refund: P2pTransaction = {
          id: transactionId,
          challengeId,
          userId: challenge.challengerId,
          transactionType: 'refund',
          amount: challenge.betAmount,
          currency: 'weparlay_cash',
          balanceBefore,
          balanceAfter: balanceBefore + challenge.betAmount,
          description: `Refunded $${challenge.betAmount} from cancelled P2P challenge`,
          createdAt: new Date(),
        };
        
        this.p2pTransactions.set(transactionId, refund);
        refunds.push(refund);
      }
    }

    // Refund challengee if accepted
    if (challenge.challengeeId && challenge.status === 'accepted') {
      const challengeeUser = await this.getUser(challenge.challengeeId);
      if (challengeeUser) {
        const balanceBefore = challengeeUser.weparlayCashBalance || 0;
        await this.creditUserBalance(challenge.challengeeId, 'weparlay_cash', challenge.betAmount);
        
        const transactionId = this.nextId++;
        const refund: P2pTransaction = {
          id: transactionId,
          challengeId,
          userId: challenge.challengeeId,
          transactionType: 'refund',
          amount: challenge.betAmount,
          currency: 'weparlay_cash',
          balanceBefore,
          balanceAfter: balanceBefore + challenge.betAmount,
          description: `Refunded $${challenge.betAmount} from cancelled P2P challenge`,
          createdAt: new Date(),
        };
        
        this.p2pTransactions.set(transactionId, refund);
        refunds.push(refund);
      }
    }

    // Clear escrow
    challenge.escrowHeld = 0;
    this.p2pChallenges.set(challengeId, challenge);

    return refunds;
  }

  async createP2pActivity(activity: InsertP2pActivity): Promise<P2pActivity> {
    const id = this.nextId++;
    const newActivity: P2pActivity = {
      ...activity,
      id,
      createdAt: new Date(),
    };
    this.p2pActivity.set(id, newActivity);
    return newActivity;
  }

  async getP2pChallengeActivity(challengeId: string): Promise<P2pActivity[]> {
    return Array.from(this.p2pActivity.values())
      .filter(activity => activity.challengeId === challengeId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getUserP2pStats(userId: string): Promise<{
    totalChallenges: number;
    wonChallenges: number;
    totalWinnings: number;
    winRate: number;
  }> {
    const userChallenges = Array.from(this.p2pChallenges.values())
      .filter(challenge => 
        challenge.challengerId === userId || challenge.challengeeId === userId
      );

    const settledChallenges = userChallenges.filter(c => c.status === 'settled');
    const wonChallenges = settledChallenges.filter(c => c.winnerUserId === userId);
    
    const totalWinnings = wonChallenges.reduce((sum, challenge) => sum + challenge.totalPot, 0);
    const winRate = settledChallenges.length > 0 ? wonChallenges.length / settledChallenges.length : 0;

    return {
      totalChallenges: userChallenges.length,
      wonChallenges: wonChallenges.length,
      totalWinnings,
      winRate,
    };
  }

  // Social Betting Operations
  async getSocialFeed(userId?: string): Promise<any[]> {
    // For now, return mock data but formatted like real data would be
    const mockFeed = [
      {
        id: 1,
        userId: "admin-support-1756067018661",
        content: "Just hit a 5-leg parlay on tonight's NBA games! Lakers, Warriors, and Celtics all covered. My analysis paid off! 🏀💰",
        sport: "NBA",
        betAmount: 250,
        potentialPayout: 1875,
        odds: "+650",
        likes: 42,
        comments: 8,
        shares: 3,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        user: {
          id: "admin-support-1756067018661",
          username: "BettingPro",
          firstName: "WeParlay",
          lastName: "Admin",
          subscriptionTier: "platinum"
        }
      },
      {
        id: 2,
        userId: "user-2",
        content: "Sharing my NFL Week 15 picks. Chiefs -7.5 is a lock, and I'm taking the under on Bills vs Dolphins. Weather gonna be a factor! ❄️",
        sport: "NFL",
        betAmount: 500,
        potentialPayout: 950,
        odds: "+90",
        likes: 28,
        comments: 15,
        shares: 7,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        user: {
          id: "user-2",
          username: "SportsWizard",
          firstName: "Sports",
          lastName: "Wizard",
          subscriptionTier: "gold"
        }
      },
      {
        id: 3,
        userId: "user-3",
        content: "T1 vs DRX in LCK finals tomorrow. T1 at +120 is incredible value. Faker's playoff form is unmatched! #LoL #LCK",
        sport: "Esports",
        betAmount: 100,
        potentialPayout: 220,
        odds: "+120",
        likes: 67,
        comments: 23,
        shares: 12,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        user: {
          id: "user-3",
          username: "EsportsExpert",
          firstName: "Esports",
          lastName: "Expert",
          subscriptionTier: "silver"
        }
      }
    ];

    return mockFeed;
  }

  async getSocialLeaderboard(period: string = 'monthly'): Promise<any[]> {
    const mockLeaderboard = [
      { 
        rank: 1, 
        userId: "leader-1",
        username: "BettingKing", 
        totalProfit: 15420, 
        winRate: 68, 
        currentStreak: 7, 
        subscriptionTier: "platinum",
        totalPosts: 45,
        totalFollowers: 234
      },
      { 
        rank: 2, 
        userId: "leader-2",
        username: "OddsShark", 
        totalProfit: 12890, 
        winRate: 65, 
        currentStreak: 4, 
        subscriptionTier: "gold",
        totalPosts: 38,
        totalFollowers: 189
      },
      { 
        rank: 3, 
        userId: "leader-3",
        username: "PickMaster", 
        totalProfit: 11240, 
        winRate: 63, 
        currentStreak: 9, 
        subscriptionTier: "gold",
        totalPosts: 52,
        totalFollowers: 167
      },
      { 
        rank: 4, 
        userId: "leader-4",
        username: "SportsGuru", 
        totalProfit: 9870, 
        winRate: 61, 
        currentStreak: 2, 
        subscriptionTier: "silver",
        totalPosts: 31,
        totalFollowers: 145
      },
      { 
        rank: 5, 
        userId: "admin-support-1756067018661",
        username: "WeParlay", 
        totalProfit: 8560, 
        winRate: 59, 
        currentStreak: 5, 
        subscriptionTier: "platinum",
        totalPosts: 28,
        totalFollowers: 198
      }
    ];

    return mockLeaderboard;
  }

  async createSocialPost(post: InsertSocialPost): Promise<SocialPost> {
    const newPost: SocialPost = {
      id: Math.floor(Math.random() * 10000),
      userId: post.userId,
      content: post.content,
      sport: post.sport || null,
      betAmount: post.betAmount || null,
      potentialPayout: post.potentialPayout || null,
      odds: post.odds || null,
      likes: 0,
      comments: 0,
      shares: 0,
      isPublic: post.isPublic ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return newPost;
  }

  async toggleSocialLike(userId: string, postId: number): Promise<{ liked: boolean; likeCount: number }> {
    // Simulate like/unlike logic
    const liked = Math.random() > 0.5; // Random for demo
    const likeCount = Math.floor(Math.random() * 100) + 1;

    return { liked, likeCount };
  }

  async toggleSocialFollow(followerId: string, followingId: string): Promise<{ following: boolean; followerCount: number }> {
    // Simulate follow/unfollow logic
    const following = Math.random() > 0.5; // Random for demo
    const followerCount = Math.floor(Math.random() * 500) + 50;

    return { following, followerCount };
  }
}

export const storage = new MemStorage();