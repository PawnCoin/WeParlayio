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
  socialPosts, SocialPost, InsertSocialPost,
  socialLikes, SocialLike, InsertSocialLike,
  socialFollows, SocialFollow, InsertSocialFollow,
  socialLeaderboard, SocialLeaderboard, InsertSocialLeaderboard
} from "@shared/schema";

export interface IStorage {
  // Basic user operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(userData: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserBalance(userId: string, amount: number): Promise<User>;
  updateUserPreferences(userId: string, preferences: any): Promise<User>;
  updateUserGamertag(userId: string, gamertag: string): Promise<User>;
  getUserByGamertag(gamertag: string): Promise<User | undefined>;
  incrementUserWins(userId: string): Promise<User>;
  getUserWithdrawalsForMonth(userId: string, month: number): Promise<number>;
  updateUserTier(userId: string, tier: string): Promise<User>;
  updateUserWeplayTokenBalance(userId: string, amount: number): Promise<User>;
  updateUserConsent(userId: string, consents: any): Promise<User>;
  updateUserStripeCustomerId(userId: string, customerId: string): Promise<User>;
  
  // Sports operations  
  getAllSports(): Promise<Sport[]>;
  getSport(id: number): Promise<Sport | undefined>;
  getSportByKey(key: string): Promise<Sport | undefined>;
  createSport(sport: InsertSport): Promise<Sport>;

  // Teams operations
  getAllTeams(): Promise<Team[]>;
  getTeamsBySport(sportId: number): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;

  // Events operations
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  getLiveEvents(): Promise<Event[]>;
  getUpcomingEvents(limit?: number): Promise<Event[]>;
  
  // Tournament operations
  getTournament(id: number): Promise<Tournament | undefined>;
  
  // Betting operations
  createBet(bet: InsertBet): Promise<Bet>;
  settleBet(betId: number, status: string): Promise<Bet>;
  getUserBets(userId: number): Promise<Bet[]>;
  
  // Challenge operations
  createBettingChallenge(challenge: InsertBettingChallenge): Promise<BettingChallenge>;
  getBettingChallengeByUuid(uuid: string): Promise<BettingChallenge | undefined>;
  getUserChallenges(userId: string, status?: string): Promise<BettingChallenge[]>;
  acceptBettingChallenge(uuid: string, acceptedBy: string): Promise<BettingChallenge>;
  updateBettingChallengeStatus(uuid: string, status: string): Promise<BettingChallenge>;
  settleBettingChallenge(uuid: string, winnerId?: string, isDraw?: boolean): Promise<BettingChallenge>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  
  // Social Betting operations
  getSocialFeed(userId?: string): Promise<any[]>;
  getSocialLeaderboard(period: string): Promise<any[]>;
  createSocialPost(post: InsertSocialPost): Promise<SocialPost>;
  toggleSocialLike(userId: string, postId: number): Promise<{ liked: boolean; likeCount: number }>;
  toggleSocialFollow(followerId: string, followingId: string): Promise<{ following: boolean; followerCount: number }>;
  markNotificationAsRead(id: number, userId: string): Promise<Notification>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactions(limit: number, offset: number): Promise<Transaction[]>;
  
  // Financial operations
  getFinancialSummary(): Promise<any>;
  updatePlatformRevenue(amount: number, feeType: string): Promise<any>;
  updateBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount>;
  
  // Support operations
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined>;
  getTicketMessages(ticketId: number): Promise<SupportTicketMessage[]>;
  addTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage>;
  

  
  // Fantasy operations
  getFantasyTeam(id: number): Promise<FantasyTeam | undefined>;
  addPlayerToFantasyTeam(fantasyTeamPlayer: InsertFantasyTeamPlayer): Promise<FantasyTeamPlayer>;
  
  // WeParlay Cash operations
  createWeparlayCashTransaction(transactionData: {
    userId: string;
    amount: number;
    type: string;
    description: string;
    metadata?: any;
  }): Promise<any>;
  getWeparlayCashTransactions(userId: string): Promise<any[]>;
  
  // Enhanced betting operations
  validateUserBalance(userId: string, currency: string, amount: number): Promise<boolean>;
  getUserBalance(userId: string, currency: string): Promise<number>;
  placeBet(bet: any): Promise<Bet>;
  updateUserCurrencyBalance(userId: string, currency: string, amount: number): Promise<User>;
  
  // Social operations
  sendFriendRequest(userId: string, friendId: string): Promise<any>;
  acceptFriendRequest(userId: string, friendId: string): Promise<any>;
  removeFriend(userId: string, friendId: string): Promise<boolean>;
  getUserFriends(userId: string): Promise<any[]>;
  getPendingFriendRequests(userId: string): Promise<any[]>;
  searchUsers(query: string, currentUserId: string): Promise<any[]>;
}

export class SimpleStorage implements IStorage {
  private users = new Map<string, User>();
  private sports = new Map<number, Sport>();
  private events = new Map<number, Event>();
  private challenges = new Map<string, BettingChallenge>();
  private nextId = 1;

  constructor() {
    // Initialize with basic data
    this.initializeBasicData();
  }

  private async initializeBasicData() {
    await this.createSport({ name: "Football", key: "americanfootball_nfl", isActive: true });
    await this.createSport({ name: "Basketball", key: "basketball_nba", isActive: true });
    
    // Create default user for testing betting functionality
    await this.createUser({
      id: "dev-user-001",
      email: "user@weparlay.io",
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      balance: 1000
    });
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
      weparlayCashBalance: 10000,
      weplayTokenBalance: 0,
      tier: 'bronze',
      winsCount: 0,
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

  async updateUserBalance(userId: string, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, weparlayCashBalance: (user.weparlayCashBalance || 0) + amount };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, preferences };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserGamertag(userId: string, gamertag: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, gamertag };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getUserByGamertag(gamertag: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.gamertag === gamertag);
  }

  async incrementUserWins(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, winsCount: (user.winsCount || 0) + 1 };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getUserWithdrawalsForMonth(userId: string, month: number): Promise<number> {
    return 0; // Simplified implementation
  }

  async updateUserTier(userId: string, tier: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, tier };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserWeplayTokenBalance(userId: string, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, weplayTokenBalance: (user.weplayTokenBalance || 0) + amount };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserConsent(userId: string, consents: any): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, consents };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, stripeCustomerId: customerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getAllSports(): Promise<Sport[]> {
    return Array.from(this.sports.values());
  }

  async getSport(id: number): Promise<Sport | undefined> {
    return this.sports.get(id);
  }

  async getSportByKey(key: string): Promise<Sport | undefined> {
    return Array.from(this.sports.values()).find(sport => sport.key === key);
  }

  async createSport(insertSport: InsertSport): Promise<Sport> {
    const id = this.nextId++;
    const sport: Sport = { 
      ...insertSport, 
      id,
      createdAt: null,
      updatedAt: null,
      eventCount: null,
      icon: insertSport.icon ?? null
    };
    this.sports.set(id, sport);
    return sport;
  }

  async getAllTeams(): Promise<Team[]> { return []; }
  async getTeamsBySport(sportId: number): Promise<Team[]> { return []; }
  async getTeam(id: number): Promise<Team | undefined> { return undefined; }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.nextId++;
    const event: Event = { 
      ...insertEvent, 
      id,
      status: insertEvent.status || 'upcoming',
      createdAt: null,
      updatedAt: null,
      odds: null,
      period: null,
      timeRemaining: null
    };
    this.events.set(id, event);
    return event;
  }

  async getLiveEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.status === 'live');
  }

  async getUpcomingEvents(limit?: number): Promise<Event[]> {
    const upcoming = Array.from(this.events.values()).filter(event => event.status === 'upcoming');
    return limit ? upcoming.slice(0, limit) : upcoming;
  }

  async getTournament(id: number): Promise<Tournament | undefined> { return undefined; }

  async createBet(bet: InsertBet): Promise<Bet> {
    const id = this.nextId++;
    return { 
      ...bet, 
      id, 
      status: bet.status || 'pending',
      placedAt: null,
      settledAt: null,
      createdAt: null,
      updatedAt: null,
      transactionHash: null,
      gameInfo: null
    };
  }

  async settleBet(betId: number, status: string): Promise<Bet> {
    return { 
      id: betId, 
      userId: 'system', 
      eventId: '1',
      betType: 'moneyline',
      pick: 'win',
      amount: 0, 
      odds: 0, 
      potentialPayout: 0, 
      status,
      placedAt: null,
      settledAt: null,
      createdAt: null,
      updatedAt: null,
      selection: 'team1',
      currency: null,
      cryptocurrencyType: null,
      walletAddress: null,
      transactionHash: null,
      point: null,
      gameInfo: null
    };
  }

  async getUserBets(userId: number): Promise<Bet[]> { return []; }

  async createBettingChallenge(challenge: InsertBettingChallenge): Promise<BettingChallenge> {
    const id = this.nextId++;
    const uuid = challenge.uuid || `challenge-${id}`;
    const newChallenge: BettingChallenge = { 
      id, 
      challengeUuid: uuid,
      ...challenge,
      settledAt: null,
      notificationSent: null,
      acceptedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.challenges.set(uuid, newChallenge);
    return newChallenge;
  }

  async getBettingChallengeByUuid(uuid: string): Promise<BettingChallenge | undefined> {
    return this.challenges.get(uuid);
  }

  async getUserChallenges(userId: string, status?: string): Promise<BettingChallenge[]> {
    return Array.from(this.challenges.values()).filter(challenge => 
      (challenge.createdBy === userId || challenge.acceptedBy === userId) &&
      (!status || challenge.status === status)
    );
  }

  async acceptBettingChallenge(uuid: string, acceptedBy: string): Promise<BettingChallenge> {
    const challenge = this.challenges.get(uuid);
    if (!challenge) throw new Error('Challenge not found');
    const updatedChallenge = { ...challenge, acceptedBy, status: 'accepted', updatedAt: new Date() };
    this.challenges.set(uuid, updatedChallenge);
    return updatedChallenge;
  }

  async updateBettingChallengeStatus(uuid: string, status: string): Promise<BettingChallenge> {
    const challenge = this.challenges.get(uuid);
    if (!challenge) throw new Error('Challenge not found');
    const updatedChallenge = { ...challenge, status, updatedAt: new Date() };
    this.challenges.set(uuid, updatedChallenge);
    return updatedChallenge;
  }

  async settleBettingChallenge(uuid: string, winnerId?: string, isDraw: boolean = false): Promise<BettingChallenge> {
    const challenge = this.challenges.get(uuid);
    if (!challenge) throw new Error('Challenge not found');
    const updatedChallenge = { 
      ...challenge, 
      winnerId: winnerId || null, 
      isDraw, 
      status: 'settled', 
      updatedAt: new Date() 
    };
    this.challenges.set(uuid, updatedChallenge);
    return updatedChallenge;
  }

  // Simplified implementations for remaining methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.nextId++;
    return { 
      ...notification, 
      id, 
      createdAt: new Date(),
      updatedAt: null,
      readAt: null,
      link: notification.link ?? null,
      title: notification.title ?? null
    };
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> { return []; }
  async markNotificationAsRead(id: number, userId: string): Promise<Notification> { 
    return { 
      id, 
      userId, 
      type: 'info', 
      title: 'Test', 
      message: 'Test', 
      read: true, 
      createdAt: new Date(),
      updatedAt: null,
      readAt: null,
      link: null
    };
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.nextId++;
    return { 
      ...transaction, 
      id,
      createdAt: null,
      updatedAt: null,
      details: null
    };
  }

  async getTransactions(limit: number, offset: number): Promise<Transaction[]> { return []; }

  async getFinancialSummary(): Promise<any> {
    return { totalRevenue: 0, totalPayouts: 0, activeBets: 0, totalUsers: this.users.size };
  }

  async updatePlatformRevenue(amount: number, feeType: string): Promise<any> {
    return { success: true, amount, feeType };
  }

  async updateBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount> {
    const id = this.nextId++;
    return { ...bankAccount, id };
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.nextId++;
    return { ...ticket, id, createdAt: new Date(), updatedAt: new Date() };
  }

  async getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined> { return undefined; }
  async getTicketMessages(ticketId: number): Promise<SupportTicketMessage[]> { return []; }
  async addTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage> {
    const id = this.nextId++;
    return { ...message, id, createdAt: new Date() };
  }



  async getFantasyTeam(id: number): Promise<FantasyTeam | undefined> { return undefined; }
  async addPlayerToFantasyTeam(fantasyTeamPlayer: InsertFantasyTeamPlayer): Promise<FantasyTeamPlayer> {
    const id = this.nextId++;
    return { ...fantasyTeamPlayer, id };
  }

  async createWeparlayCashTransaction(transactionData: {
    userId: string;
    amount: number;
    type: string;
    description: string;
    metadata?: any;
  }): Promise<any> {
    return { success: true, ...transactionData };
  }

  async getWeparlayCashTransactions(userId: string): Promise<any[]> { return []; }

  async sendFriendRequest(userId: string, friendId: string): Promise<any> { 
    return { success: true, userId, friendId }; 
  }
  async acceptFriendRequest(userId: string, friendId: string): Promise<any> { 
    return { success: true, userId, friendId }; 
  }
  async removeFriend(userId: string, friendId: string): Promise<boolean> { return true; }
  async getUserFriends(userId: string): Promise<any[]> { return []; }
  async getPendingFriendRequests(userId: string): Promise<any[]> { return []; }
  async searchUsers(query: string, currentUserId: string): Promise<any[]> {
    return Array.from(this.users.values())
      .filter(user => 
        user.id !== currentUserId && 
        (user.username?.toLowerCase().includes(query.toLowerCase()) || 
         user.email?.toLowerCase().includes(query.toLowerCase()))
      );
  }
  
  // Enhanced betting operations implementation
  async validateUserBalance(userId: string, currency: string, amount: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    const balance = currency === 'weparlay_cash' ? 
      (user.weparlayCashBalance || 0) : 
      (user.balance || 0);
    
    return balance >= amount;
  }
  
  async getUserBalance(userId: string, currency: string): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) return 0;
    
    return currency === 'weparlay_cash' ? 
      (user.weparlayCashBalance || 0) : 
      (user.balance || 0);
  }
  
  async placeBet(bet: any): Promise<Bet> {
    const id = this.nextId++;
    const placedBet: Bet = {
      id,
      userId: bet.userId,
      eventId: bet.eventId,
      amount: bet.amount,
      odds: bet.odds,
      potentialPayout: bet.potentialPayout,
      status: 'pending',
      betType: bet.betType,
      selection: bet.selection
    };
    
    // Deduct balance from user
    const user = await this.getUser(bet.userId);
    if (user) {
      const currency = bet.currency || 'weparlay_cash';
      if (currency === 'weparlay_cash') {
        user.weparlayCashBalance = (user.weparlayCashBalance || 0) - bet.amount;
      } else {
        user.balance = (user.balance || 0) - bet.amount;
      }
      this.users.set(bet.userId, user);
    }
    
    return placedBet;
  }
  
  async updateUserCurrencyBalance(userId: string, currency: string, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    if (currency === 'weparlay_cash') {
      user.weparlayCashBalance = (user.weparlayCashBalance || 0) + amount;
    } else {
      user.balance = (user.balance || 0) + amount;
    }
    
    this.users.set(userId, user);
    return user;
  }
  
  // Social Betting operations implementation
  async getSocialFeed(userId?: string): Promise<any[]> {
    // Return empty array for now - this would be populated with actual social posts
    return [];
  }
  
  async getSocialLeaderboard(period: string): Promise<any[]> {
    // Return empty array for now - this would be populated with leaderboard data
    return [];
  }
  
  async createSocialPost(post: InsertSocialPost): Promise<SocialPost> {
    const id = this.nextId++;
    const socialPost: SocialPost = {
      id,
      userId: post.userId,
      content: post.content,
      sport: post.sport,
      betAmount: post.betAmount,
      potentialPayout: post.potentialPayout,
      odds: post.odds,
      likeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return socialPost;
  }
  
  async toggleSocialLike(userId: string, postId: number): Promise<{ liked: boolean; likeCount: number }> {
    // For now, return mock data - this would interact with actual social likes storage
    return { liked: true, likeCount: Math.floor(Math.random() * 10) + 1 };
  }
  
  async toggleSocialFollow(followerId: string, followingId: string): Promise<{ following: boolean; followerCount: number }> {
    // For now, return mock data - this would interact with actual follows storage
    return { following: true, followerCount: Math.floor(Math.random() * 100) + 1 };
  }
}

export const storage = new SimpleStorage();