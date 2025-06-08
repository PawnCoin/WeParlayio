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
  updateYahooIntegration(userId: string, accessToken: string, refreshToken: string, expiry: Date): Promise<User>;
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
      yahooAccessToken: undefined,
      yahooRefreshToken: null,
      yahooTokenExpiry: null,
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
}

export const storage = new MemStorage();