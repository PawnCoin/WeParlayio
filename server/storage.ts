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
    this.createSport({ name: "Football", key: "americanfootball_nfl", isActive: true, eventCount: 0 });
    this.createSport({ name: "Basketball", key: "basketball_nba", isActive: true, eventCount: 0 });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = insertUser.id || String(this.nextId++);
    const user: User = { ...insertUser, id, balance: 1000 };
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
    const bet: Bet = { id: betId, userId: 'system', eventId: 1, amount: 0, odds: 0, potential: 0, status };
    return bet;
  }

  async updateUserWeplayTokenBalance(userId: string, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser = { ...user, weplayTokens: (user.weplayTokens || 0) + amount };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    throw new Error('User not found');
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.nextId++;
    const newNotification: Notification = { ...notification, id, isRead: false, createdAt: new Date() };
    return newNotification;
  }

  async getUserChallenges(userId: string, status?: string): Promise<BettingChallenge[]> {
    return Array.from(this.challenges.values()).filter(challenge => 
      (challenge.createdBy === userId || challenge.acceptedBy === userId) &&
      (!status || challenge.status === status)
    );
  }

  async acceptBettingChallenge(uuid: string, acceptedBy: string): Promise<BettingChallenge> {
    const challenge = this.challenges.get(uuid);
    if (challenge) {
      const updatedChallenge = { ...challenge, acceptedBy, status: 'accepted' };
      this.challenges.set(uuid, updatedChallenge);
      return updatedChallenge;
    }
    throw new Error('Challenge not found');
  }

  async updateBettingChallengeStatus(uuid: string, status: string): Promise<BettingChallenge> {
    const challenge = this.challenges.get(uuid);
    if (challenge) {
      const updatedChallenge = { ...challenge, status };
      this.challenges.set(uuid, updatedChallenge);
      return updatedChallenge;
    }
    throw new Error('Challenge not found');
  }

  async settleBettingChallenge(uuid: string, winnerId?: string, isDraw: boolean = false): Promise<BettingChallenge> {
    const challenge = this.challenges.get(uuid);
    if (challenge) {
      const updatedChallenge = { ...challenge, status: 'settled', winnerId };
      this.challenges.set(uuid, updatedChallenge);
      return updatedChallenge;
    }
    throw new Error('Challenge not found');
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    return []; // Notifications not implemented in memory storage
  }

  async markNotificationAsRead(id: number, userId: string): Promise<Notification> {
    const notification: Notification = { id, userId, title: 'Mock', content: 'Mock', isRead: true, createdAt: new Date() };
    return notification;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.nextId++;
    const newTransaction: Transaction = { ...transaction, id, createdAt: new Date() };
    return newTransaction;
  }

  async getTransactions(limit: number, offset: number): Promise<Transaction[]> {
    return []; // Transactions not implemented in memory storage
  }

  async incrementUserWins(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser = { ...user, wins: (user.wins || 0) + 1 };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    throw new Error('User not found');
  }

  async updateYahooIntegration(userId: string, accessToken: string, refreshToken: string, expiry: Date): Promise<User> {
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser = { ...user, yahooAccessToken: accessToken, yahooRefreshToken: refreshToken };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    throw new Error('User not found');
  }

  async getFantasyTeam(id: number): Promise<FantasyTeam | undefined> {
    return undefined; // Fantasy teams not implemented in memory storage
  }

  async addPlayerToFantasyTeam(fantasyTeamPlayer: InsertFantasyTeamPlayer): Promise<FantasyTeamPlayer> {
    const id = this.nextId++;
    return { ...fantasyTeamPlayer, id };
  }

  async updatePlatformRevenue(amount: number, feeType: string): Promise<any> {
    return { success: true, amount, feeType };
  }

  async updateBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount> {
    const id = this.nextId++;
    return { ...bankAccount, id };
  }

  // Additional required methods
  async updateUserBalance(userId: string, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser = { ...user, balance: (user.balance || 0) + amount };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    throw new Error('User not found');
  }

  async getUserWithdrawalsForMonth(userId: string, month: number): Promise<number> {
    return 0; // Mock implementation
  }

  async getFinancialSummary(): Promise<any> {
    return { totalRevenue: 0, totalUsers: this.users.size };
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<User> {
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser = { ...user, preferences };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    throw new Error('User not found');
  }

  async updateUserGamertag(userId: string, gamertag: string): Promise<User> {
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser = { ...user, gamertag };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    throw new Error('User not found');
  }

  async updateUserStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser = { ...user, stripeCustomerId };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    throw new Error('User not found');
  }

  async getUserByGamertag(gamertag: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.gamertag === gamertag);
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.nextId++;
    return { ...ticket, id, ticketNumber: `TICKET-${id}`, status: 'open', createdAt: new Date() };
  }

  async getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined> {
    return undefined; // Mock implementation
  }

  async addTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage> {
    const id = this.nextId++;
    return { ...message, id, createdAt: new Date() };
  }

  async getTicketMessages(ticketId: number): Promise<SupportTicketMessage[]> {
    return []; // Mock implementation
  }

  async createBettingChallenge(challenge: InsertBettingChallenge): Promise<BettingChallenge> {
    const uuid = `challenge-${this.nextId++}`;
    const newChallenge: BettingChallenge = {
      ...challenge,
      uuid,
      status: challenge.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.challenges.set(uuid, newChallenge);
    return newChallenge;
  }

  async getBettingChallengeByUuid(uuid: string): Promise<BettingChallenge | undefined> {
    return this.challenges.get(uuid);
  }
}

export const storage = new MemStorage();