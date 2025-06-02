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
  private notifications = new Map<number, Notification>();
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

  async updateUserBalance(userId: string, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, balance: (user.balance || 0) + amount };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getUserWithdrawalsForMonth(userId: string, month: number): Promise<number> {
    return 0;
  }

  async getFinancialSummary(): Promise<any> {
    return {
      totalRevenue: 50000,
      totalUsers: this.users.size,
      activeUsers: this.users.size,
      totalBets: 0,
      platformBalance: 25000
    };
  }

  async createBettingChallenge(challenge: InsertBettingChallenge): Promise<BettingChallenge> {
    const uuid = challenge.uuid || require('crypto').randomUUID();
    const newChallenge: BettingChallenge = {
      ...challenge,
      id: this.nextId++,
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

  // Missing methods that routes require
  async getLiveEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.status === 'live');
  }

  async getTournament(id: number): Promise<Tournament | undefined> {
    return undefined; // No tournaments in simplified storage
  }

  async getUpcomingEvents(limit?: number): Promise<Event[]> {
    const now = new Date();
    const upcoming = Array.from(this.events.values())
      .filter(event => new Date(event.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    return limit ? upcoming.slice(0, limit) : upcoming;
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

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.nextId++;
    const newTicket: SupportTicket = { 
      ...ticket, 
      id,
      ticketNumber: `TICKET-${id.toString().padStart(6, '0')}`,
      status: 'open',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    } as SupportTicket;
    return newTicket;
  }

  async getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined> {
    return undefined; // Simplified implementation
  }

  async getTicketMessages(ticketId: number): Promise<SupportTicketMessage[]> {
    return []; // Simplified implementation
  }

  async addTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage> {
    const id = this.nextId++;
    const newMessage: SupportTicketMessage = { 
      ...message, 
      id,
      createdAt: new Date()
    } as SupportTicketMessage;
    return newMessage;
  }

  // Missing betting challenge methods
  async getUserChallenges(userId: string, status?: string): Promise<BettingChallenge[]> {
    return Array.from(this.challenges.values()).filter(challenge => 
      (challenge.createdBy === userId || challenge.acceptedBy === userId) &&
      (!status || challenge.status === status)
    );
  }

  async acceptBettingChallenge(uuid: string, acceptedBy: string): Promise<BettingChallenge> {
    const challenge = this.challenges.get(uuid);
    if (!challenge) throw new Error('Challenge not found');
    
    const updatedChallenge = { 
      ...challenge, 
      acceptedBy, 
      status: 'accepted',
      updatedAt: new Date()
    };
    this.challenges.set(uuid, updatedChallenge);
    return updatedChallenge;
  }

  async updateBettingChallengeStatus(uuid: string, status: string): Promise<BettingChallenge> {
    const challenge = this.challenges.get(uuid);
    if (!challenge) throw new Error('Challenge not found');
    
    const updatedChallenge = { 
      ...challenge, 
      status,
      updatedAt: new Date()
    };
    this.challenges.set(uuid, updatedChallenge);
    return updatedChallenge;
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(notification => 
      notification.userId === userId && (!unreadOnly || !notification.isRead)
    );
  }

  async markNotificationAsRead(id: number, userId: string): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found');
    }
    
    const updatedNotification = { ...notification, isRead: true, readAt: new Date() };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
}

export const storage = new MemStorage();