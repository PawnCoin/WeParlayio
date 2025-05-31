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
    this.createSport({ name: "Football", key: "americanfootball_nfl", active: true, eventCount: 0 });
    this.createSport({ name: "Basketball", key: "basketball_nba", active: true, eventCount: 0 });
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
}

export const storage = new MemStorage();