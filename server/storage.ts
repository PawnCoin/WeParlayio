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
  notifications, Notification, InsertNotification
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
}

export const storage = new MemStorage();