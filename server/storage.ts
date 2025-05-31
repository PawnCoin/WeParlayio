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
  TransactionType,
  supportTickets, SupportTicket, InsertSupportTicket, 
  supportTicketMessages, SupportTicketMessage, InsertSupportTicketMessage, 
  supportTicketLogs, SupportTicketLog,
  knownIssues, KnownIssue, InsertKnownIssue,
  bettingChallenges, BettingChallenge, InsertBettingChallenge,
  notifications, Notification, InsertNotification
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGamertag(gamertag: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(userData: InsertUser): Promise<User>;
  updateUserBalance(userId: string, amount: number): Promise<User>;
  updateUserGamertag(userId: string, gamertag: string): Promise<User>;
  updateYahooIntegration(userId: string, token: string, refreshToken: string, expiry: Date): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserStatus(userId: string, status: string): Promise<User>;
  incrementUserWins(userId: string): Promise<User>;
  getUserWithdrawalsForMonth(userId: string, month: number): Promise<number>;
  updateUserWeplayTokenBalance(userId: string, amount: number): Promise<User>;
  updateUserSubscription(userId: string, subscriptionType: 'vip' | 'analytics' | 'support', expiryDate: Date): Promise<User>;
  updateUserPreferences(userId: string, preferences: Partial<{ oddsFormat: string, useVirtualCurrency: boolean, withdrawalSpeed: string, mobileOptimizedView: boolean }>): Promise<User>;

  // Betting challenge operations
  createBettingChallenge(challenge: InsertBettingChallenge): Promise<BettingChallenge>;
  getBettingChallenge(id: number): Promise<BettingChallenge | undefined>;
  getBettingChallengeByUuid(uuid: string): Promise<BettingChallenge | undefined>;
  getUserChallenges(userId: string, status?: string): Promise<BettingChallenge[]>;
  acceptBettingChallenge(uuid: string, acceptedBy: string): Promise<BettingChallenge>;
  updateBettingChallengeStatus(uuid: string, status: string): Promise<BettingChallenge>;
  settleBettingChallenge(uuid: string, winnerId?: string, isDraw?: boolean): Promise<BettingChallenge>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationAsRead(id: number, userId: string): Promise<Notification>;

  // Financial operations
  getFinancialSummary(): Promise<any>;
  getTransactions(limit: number, offset: number): Promise<Transaction[]>; 
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount>;
  updatePlatformSettings(settings: any): Promise<any>;
  updatePrivacySettings(settings: any): Promise<any>;
  getOwnerBankAccount(): Promise<BankAccount | undefined>;
  updatePlatformRevenue(amount: number, feeType: string): Promise<any>;

  // Sports operations
  getAllSports(): Promise<Sport[]>;
  getSport(id: number): Promise<Sport | undefined>;
  getSportByKey(key: string): Promise<Sport | undefined>;
  createSport(sport: InsertSport): Promise<Sport>;
  updateSportEventCount(sportId: number, count: number): Promise<Sport>;

  // Teams operations
  getAllTeams(): Promise<Team[]>;
  getTeamsBySport(sportId: number): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;

  // Events operations
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventsBySport(sportId: number): Promise<Event[]>;
  getUpcomingEvents(limit?: number): Promise<Event[]>;
  getLiveEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEventStatus(eventId: number, status: string, homeScore?: number, awayScore?: number, period?: string, timeRemaining?: string): Promise<Event>;
  updateEventOdds(eventId: number, odds: any): Promise<Event>;

  // Bets operations
  getUserBets(userId: number): Promise<Bet[]>;
  getBet(id: number): Promise<Bet | undefined>;
  createBet(bet: InsertBet): Promise<Bet>;
  settleBet(betId: number, status: string): Promise<Bet>;

  // Tournaments operations
  getAllTournaments(): Promise<Tournament[]>;
  getTournament(id: number): Promise<Tournament | undefined>;
  getTournamentsBySport(sportId: number): Promise<Tournament[]>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournamentBracket(tournamentId: number, bracketData: any): Promise<Tournament>;

  // Fantasy teams operations
  getUserFantasyTeams(userId: number): Promise<FantasyTeam[]>;
  getFantasyTeam(id: number): Promise<FantasyTeam | undefined>;
  createFantasyTeam(fantasyTeam: InsertFantasyTeam): Promise<FantasyTeam>;
  updateFantasyTeamSalary(fantasyTeamId: number, salary: number): Promise<FantasyTeam>;

  // Players operations
  getAllPlayers(): Promise<Player[]>;
  getPlayersByTeam(teamId: number): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;

  // Fantasy team players operations
  getFantasyTeamPlayers(fantasyTeamId: number): Promise<FantasyTeamPlayer[]>;
  addPlayerToFantasyTeam(fantasyTeamPlayer: InsertFantasyTeamPlayer): Promise<FantasyTeamPlayer>;
  removePlayerFromFantasyTeam(fantasyTeamId: number, playerId: number): Promise<void>;

  // Support ticket operations
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined>;
  getUserSupportTickets(userId: string): Promise<SupportTicket[]>;
  updateSupportTicketStatus(ticketId: number, status: string): Promise<SupportTicket>;
  addTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage>;
  getTicketMessages(ticketId: number): Promise<SupportTicketMessage[]>;
  logTicketAction(ticketId: number, action: string, details?: any): Promise<SupportTicketLog>;

  // Known issues operations
  createKnownIssue(issue: InsertKnownIssue): Promise<KnownIssue>;
  getKnownIssues(): Promise<KnownIssue[]>;
  getActiveKnownIssues(): Promise<KnownIssue[]>;
  updateKnownIssue(id: number, updates: Partial<KnownIssue>): Promise<KnownIssue>;
  matchIssueToKnownIssues(description: string): Promise<KnownIssue[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sports: Map<number, Sport>;
  private teams: Map<number, Team>;
  private events: Map<number, Event>;
  private bets: Map<number, Bet>;
  private tournaments: Map<number, Tournament>;
  private fantasyTeams: Map<number, FantasyTeam>;
  private players: Map<number, Player>;
  private fantasyTeamPlayers: Map<number, FantasyTeamPlayer>;
  private bankAccounts: Map<number, BankAccount>;
  private transactions: Map<number, Transaction>;
  private platformSettings: Map<string, any>;
  private privacySettings: Map<string, boolean>;
  private supportTickets: Map<number, SupportTicket>;
  private supportTicketMessages: Map<number, SupportTicketMessage>;
  private supportTicketLogs: Map<number, SupportTicketLog>;
  private knownIssues: Map<number, KnownIssue>;
  private bettingChallenges: Map<string, BettingChallenge>;
  private notifications: Map<number, Notification>;

  private nextUserId: number;
  private nextSportId: number;
  private nextTeamId: number;
  private nextEventId: number;
  private nextBetId: number;
  private nextTournamentId: number;
  private nextFantasyTeamId: number;
  private nextPlayerId: number;
  private nextFantasyTeamPlayerId: number;
  private nextTransactionId: number;
  private nextBankAccountId: number;
  private nextSupportTicketId: number;
  private nextSupportTicketMessageId: number;
  private nextSupportTicketLogId: number;
  private nextKnownIssueId: number;
  private nextNotificationId: number;

  constructor() {
    this.users = new Map();
    this.sports = new Map();
    this.teams = new Map();
    this.events = new Map();
    this.bets = new Map();
    this.tournaments = new Map();
    this.fantasyTeams = new Map();
    this.players = new Map();
    this.fantasyTeamPlayers = new Map();
    this.bankAccounts = new Map();
    this.transactions = new Map();
    this.platformSettings = new Map();
    this.privacySettings = new Map();
    this.supportTickets = new Map();
    this.supportTicketMessages = new Map();
    this.supportTicketLogs = new Map();
    this.knownIssues = new Map();
    this.bettingChallenges = new Map();
    this.notifications = new Map();

    this.nextUserId = 1;
    this.nextSportId = 1;
    this.nextTeamId = 1;
    this.nextEventId = 1;
    this.nextBetId = 1;
    this.nextTournamentId = 1;
    this.nextFantasyTeamId = 1;
    this.nextPlayerId = 1;
    this.nextFantasyTeamPlayerId = 1;
    this.nextTransactionId = 1;
    this.nextBankAccountId = 1;
    this.nextSupportTicketId = 1;
    this.nextSupportTicketMessageId = 1;
    this.nextSupportTicketLogId = 1;
    this.nextKnownIssueId = 1;
    this.nextNotificationId = 1;

    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default sports
    const footballSport: InsertSport = {
      name: "American Football",
      key: "americanfootball_nfl",
      active: true,
      eventCount: 0
    };

    const basketballSport: InsertSport = {
      name: "Basketball",
      key: "basketball_nba",
      active: true,
      eventCount: 0
    };

    this.createSport(footballSport);
    this.createSport(basketballSport);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByGamertag(gamertag: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.gamertag === gamertag);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = insertUser.id || String(this.nextUserId++);
    const user: User = { ...insertUser, id, balance: 1000 };
    this.users.set(id, user);
    return user;
  }

  async upsertUser(userData: any): Promise<User> {
    const existingUser = await this.getUser(userData.id);
    if (existingUser) {
      const updatedUser = { ...existingUser, ...userData };
      this.users.set(userData.id, updatedUser);
      return updatedUser;
    } else {
      return this.createUser(userData);
    }
  }

  async updateUserBalance(userId: string, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, balance: (user.balance || 0) + amount };
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

  async updateYahooIntegration(userId: string, token: string, refreshToken: string, expiry: Date): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, yahooAccessToken: token, yahooRefreshToken: refreshToken, yahooTokenExpiry: expiry };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStatus(userId: string, status: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, status };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async incrementUserWins(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, winsCount: (user.winsCount || 0) + 1 };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getUserWithdrawalsForMonth(userId: string, month: number): Promise<number> {
    return 0; // Placeholder implementation
  }

  async updateUserWeplayTokenBalance(userId: string, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, weplayTokenBalance: amount };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserSubscription(userId: string, subscriptionType: 'vip' | 'analytics' | 'support', expiryDate: Date): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    let updatedUser: User;
    switch (subscriptionType) {
      case 'vip':
        updatedUser = { ...user, vipExpiryDate: expiryDate };
        break;
      case 'analytics':
        updatedUser = { ...user, analyticsExpiryDate: expiryDate };
        break;
      case 'support':
        updatedUser = { ...user, supportExpiryDate: expiryDate };
        break;
    }
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserPreferences(userId: string, preferences: Partial<{ oddsFormat: string, useVirtualCurrency: boolean, withdrawalSpeed: string, mobileOptimizedView: boolean }>): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...preferences };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Sports operations
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
    const id = this.nextSportId++;
    const sport: Sport = { ...insertSport, id, eventCount: 0 };
    this.sports.set(id, sport);
    return sport;
  }

  async updateSportEventCount(sportId: number, count: number): Promise<Sport> {
    const sport = await this.getSport(sportId);
    if (!sport) throw new Error('Sport not found');
    
    const updatedSport = { ...sport, eventCount: count };
    this.sports.set(sportId, updatedSport);
    return updatedSport;
  }

  // Teams operations
  async getAllTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async getTeamsBySport(sportId: number): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(team => team.sportId === sportId);
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.nextTeamId++;
    const team: Team = { ...insertTeam, id };
    this.teams.set(id, team);
    return team;
  }

  // Events operations
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEventsBySport(sportId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.sportId === sportId);
  }

  async getUpcomingEvents(limit?: number): Promise<Event[]> {
    const now = new Date();
    const upcoming = Array.from(this.events.values())
      .filter(event => new Date(event.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return limit ? upcoming.slice(0, limit) : upcoming;
  }

  async getLiveEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.status === 'live');
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.nextEventId++;
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

  async updateEventStatus(
    eventId: number, 
    status: string, 
    homeScore?: number, 
    awayScore?: number, 
    period?: string, 
    timeRemaining?: string
  ): Promise<Event> {
    const event = await this.getEvent(eventId);
    if (!event) throw new Error('Event not found');
    
    const updatedEvent = { 
      ...event, 
      status,
      ...(homeScore !== undefined && { homeScore }),
      ...(awayScore !== undefined && { awayScore }),
      ...(period !== undefined && { period }),
      ...(timeRemaining !== undefined && { timeRemaining })
    };
    this.events.set(eventId, updatedEvent);
    return updatedEvent;
  }

  async updateEventOdds(eventId: number, odds: any): Promise<Event> {
    const event = await this.getEvent(eventId);
    if (!event) throw new Error('Event not found');
    
    const updatedEvent = { ...event, odds };
    this.events.set(eventId, updatedEvent);
    return updatedEvent;
  }

  // Betting challenge operations
  async createBettingChallenge(challenge: InsertBettingChallenge): Promise<BettingChallenge> {
    const uuid = challenge.uuid || require('crypto').randomUUID();
    const newChallenge: BettingChallenge = {
      ...challenge,
      id: parseInt(uuid.replace(/-/g, '').substring(0, 8), 16),
      uuid,
      status: challenge.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bettingChallenges.set(uuid, newChallenge);
    return newChallenge;
  }

  async getBettingChallenge(id: number): Promise<BettingChallenge | undefined> {
    return Array.from(this.bettingChallenges.values()).find(challenge => challenge.id === id);
  }

  async getBettingChallengeByUuid(uuid: string): Promise<BettingChallenge | undefined> {
    return this.bettingChallenges.get(uuid);
  }

  async getUserChallenges(userId: string, status?: string): Promise<BettingChallenge[]> {
    return Array.from(this.bettingChallenges.values()).filter(challenge => 
      (challenge.createdBy === userId || challenge.acceptedBy === userId) &&
      (!status || challenge.status === status)
    );
  }

  async acceptBettingChallenge(uuid: string, userId: string): Promise<BettingChallenge> {
    const challenge = await this.getBettingChallengeByUuid(uuid);
    if (!challenge) throw new Error('Challenge not found');
    
    const updatedChallenge = { 
      ...challenge, 
      acceptedBy: userId, 
      status: 'accepted',
      updatedAt: new Date()
    };
    this.bettingChallenges.set(uuid, updatedChallenge);
    return updatedChallenge;
  }

  async updateBettingChallengeStatus(uuid: string, status: string): Promise<BettingChallenge> {
    const challenge = await this.getBettingChallengeByUuid(uuid);
    if (!challenge) throw new Error('Challenge not found');
    
    const updatedChallenge = { ...challenge, status, updatedAt: new Date() };
    this.bettingChallenges.set(uuid, updatedChallenge);
    return updatedChallenge;
  }

  async settleBettingChallenge(uuid: string, winnerId?: string, isDraw: boolean = false): Promise<BettingChallenge> {
    const challenge = await this.getBettingChallengeByUuid(uuid);
    if (!challenge) throw new Error('Challenge not found');
    
    const updatedChallenge = { 
      ...challenge, 
      winnerId, 
      isDraw,
      status: 'settled',
      updatedAt: new Date()
    };
    this.bettingChallenges.set(uuid, updatedChallenge);
    return updatedChallenge;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.nextNotificationId++;
    const newNotification: Notification = {
      ...notification,
      id,
      read: false,
      createdAt: new Date()
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(notification => 
      notification.userId === userId && (!unreadOnly || !notification.read)
    );
  }

  async markNotificationAsRead(id: number, userId: string): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found');
    }
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  // Financial operations
  async getFinancialSummary(): Promise<any> {
    return {
      totalRevenue: 50000,
      totalUsers: this.users.size,
      activeUsers: Array.from(this.users.values()).filter(u => u.status === 'active').length,
      totalBets: this.bets.size,
      platformBalance: 25000
    };
  }

  async getTransactions(limit: number, offset: number): Promise<Transaction[]> {
    const allTransactions = Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return allTransactions.slice(offset, offset + limit);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.nextTransactionId++;
    const newTransaction: Transaction = { 
      ...transaction, 
      id, 
      status: transaction.status || 'pending',
      createdAt: new Date()
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async updateBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount> {
    const id = this.nextBankAccountId++;
    const newBankAccount: BankAccount = { 
      ...bankAccount, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bankAccounts.set(id, newBankAccount);
    return newBankAccount;
  }

  async updatePlatformSettings(settings: any): Promise<any> {
    Object.keys(settings).forEach(key => {
      this.platformSettings.set(key, settings[key]);
    });
    return settings;
  }

  async updatePrivacySettings(settings: any): Promise<any> {
    Object.keys(settings).forEach(key => {
      this.privacySettings.set(key, settings[key]);
    });
    return settings;
  }

  async getOwnerBankAccount(): Promise<BankAccount | undefined> {
    return Array.from(this.bankAccounts.values()).find(account => account.isOwner);
  }

  async updatePlatformRevenue(amount: number, feeType: string): Promise<any> {
    const currentRevenue = this.platformSettings.get('totalRevenue') || 0;
    this.platformSettings.set('totalRevenue', currentRevenue + amount);
    return { totalRevenue: currentRevenue + amount, lastFeeType: feeType };
  }

  // Stub implementations for remaining methods
  async getUserBets(userId: number): Promise<Bet[]> { return []; }
  async getBet(id: number): Promise<Bet | undefined> { return undefined; }
  async createBet(bet: InsertBet): Promise<Bet> { 
    const id = this.nextBetId++;
    const newBet: Bet = { ...bet, id };
    this.bets.set(id, newBet);
    return newBet;
  }
  async settleBet(betId: number, status: string): Promise<Bet> { 
    const bet = this.bets.get(betId);
    if (!bet) throw new Error('Bet not found');
    const updatedBet = { ...bet, status };
    this.bets.set(betId, updatedBet);
    return updatedBet;
  }

  async getAllTournaments(): Promise<Tournament[]> { return []; }
  async getTournament(id: number): Promise<Tournament | undefined> { return undefined; }
  async getTournamentsBySport(sportId: number): Promise<Tournament[]> { return []; }
  async createTournament(tournament: InsertTournament): Promise<Tournament> { 
    const id = this.nextTournamentId++;
    const newTournament: Tournament = { ...tournament, id };
    this.tournaments.set(id, newTournament);
    return newTournament;
  }
  async updateTournamentBracket(tournamentId: number, bracketData: any): Promise<Tournament> { 
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) throw new Error('Tournament not found');
    const updatedTournament = { ...tournament, bracketData };
    this.tournaments.set(tournamentId, updatedTournament);
    return updatedTournament;
  }

  async getUserFantasyTeams(userId: number): Promise<FantasyTeam[]> { return []; }
  async getFantasyTeam(id: number): Promise<FantasyTeam | undefined> { return undefined; }
  async createFantasyTeam(fantasyTeam: InsertFantasyTeam): Promise<FantasyTeam> { 
    const id = this.nextFantasyTeamId++;
    const newTeam: FantasyTeam = { ...fantasyTeam, id };
    this.fantasyTeams.set(id, newTeam);
    return newTeam;
  }
  async updateFantasyTeamSalary(fantasyTeamId: number, salary: number): Promise<FantasyTeam> { 
    const team = this.fantasyTeams.get(fantasyTeamId);
    if (!team) throw new Error('Fantasy team not found');
    const updatedTeam = { ...team, salary };
    this.fantasyTeams.set(fantasyTeamId, updatedTeam);
    return updatedTeam;
  }

  async getAllPlayers(): Promise<Player[]> { return []; }
  async getPlayersByTeam(teamId: number): Promise<Player[]> { return []; }
  async getPlayer(id: number): Promise<Player | undefined> { return undefined; }
  async createPlayer(player: InsertPlayer): Promise<Player> { 
    const id = this.nextPlayerId++;
    const newPlayer: Player = { ...player, id };
    this.players.set(id, newPlayer);
    return newPlayer;
  }

  async getFantasyTeamPlayers(fantasyTeamId: number): Promise<FantasyTeamPlayer[]> { return []; }
  async addPlayerToFantasyTeam(fantasyTeamPlayer: InsertFantasyTeamPlayer): Promise<FantasyTeamPlayer> { 
    const id = this.nextFantasyTeamPlayerId++;
    const newFTP: FantasyTeamPlayer = { ...fantasyTeamPlayer, id };
    this.fantasyTeamPlayers.set(id, newFTP);
    return newFTP;
  }
  async removePlayerFromFantasyTeam(fantasyTeamId: number, playerId: number): Promise<void> { 
    Array.from(this.fantasyTeamPlayers.entries()).forEach(([id, ftp]) => {
      if (ftp.fantasyTeamId === fantasyTeamId && ftp.playerId === playerId) {
        this.fantasyTeamPlayers.delete(id);
      }
    });
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> { 
    const id = this.nextSupportTicketId++;
    const newTicket: SupportTicket = { 
      ...ticket, 
      id,
      ticketNumber: `TICKET-${id.toString().padStart(6, '0')}`,
      status: 'open',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.supportTickets.set(id, newTicket);
    return newTicket;
  }
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> { return this.supportTickets.get(id); }
  async getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined> { 
    return Array.from(this.supportTickets.values()).find(ticket => ticket.ticketNumber === ticketNumber);
  }
  async getUserSupportTickets(userId: string): Promise<SupportTicket[]> { 
    return Array.from(this.supportTickets.values()).filter(ticket => ticket.userId === userId);
  }
  async updateSupportTicketStatus(ticketId: number, status: string): Promise<SupportTicket> { 
    const ticket = this.supportTickets.get(ticketId);
    if (!ticket) throw new Error('Support ticket not found');
    const updatedTicket = { ...ticket, status, updatedAt: new Date() };
    this.supportTickets.set(ticketId, updatedTicket);
    return updatedTicket;
  }
  async addTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage> { 
    const id = this.nextSupportTicketMessageId++;
    const newMessage: SupportTicketMessage = { 
      ...message, 
      id,
      createdAt: new Date()
    };
    this.supportTicketMessages.set(id, newMessage);
    return newMessage;
  }
  async getTicketMessages(ticketId: number): Promise<SupportTicketMessage[]> { 
    return Array.from(this.supportTicketMessages.values()).filter(msg => msg.ticketId === ticketId);
  }
  async logTicketAction(ticketId: number, action: string, details?: any): Promise<SupportTicketLog> { 
    const id = this.nextSupportTicketLogId++;
    const newLog: SupportTicketLog = { 
      id,
      ticketId,
      action,
      details,
      createdAt: new Date()
    };
    this.supportTicketLogs.set(id, newLog);
    return newLog;
  }

  async createKnownIssue(issue: InsertKnownIssue): Promise<KnownIssue> { 
    const id = this.nextKnownIssueId++;
    const newIssue: KnownIssue = { 
      ...issue, 
      id,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.knownIssues.set(id, newIssue);
    return newIssue;
  }
  async getKnownIssues(): Promise<KnownIssue[]> { return Array.from(this.knownIssues.values()); }
  async getActiveKnownIssues(): Promise<KnownIssue[]> { 
    return Array.from(this.knownIssues.values()).filter(issue => issue.active);
  }
  async updateKnownIssue(id: number, updates: Partial<KnownIssue>): Promise<KnownIssue> { 
    const issue = this.knownIssues.get(id);
    if (!issue) throw new Error('Known issue not found');
    const updatedIssue = { ...issue, ...updates, updatedAt: new Date() };
    this.knownIssues.set(id, updatedIssue);
    return updatedIssue;
  }
  async matchIssueToKnownIssues(description: string): Promise<KnownIssue[]> { 
    return Array.from(this.knownIssues.values()).filter(issue => 
      issue.active && 
      (issue.title.toLowerCase().includes(description.toLowerCase()) || 
       issue.description.toLowerCase().includes(description.toLowerCase()))
    );
  }
}

// Import the database storage for persistence
import { DatabaseStorage } from './DatabaseStorage';

// Use persistent database storage to retain user data
export const storage = new DatabaseStorage();