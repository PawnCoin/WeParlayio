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
  createUser(user: InsertUser): Promise<User>;
  upsertUser(userData: InsertUser): Promise<User>;
  updateUserBalance(userId: string, amount: number): Promise<User>;
  updateYahooIntegration(userId: string, token: string, refreshToken: string, expiry: Date): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserStatus(userId: string, status: string): Promise<User>;
  incrementUserWins(userId: string): Promise<User>;
  getUserWithdrawalsForMonth(userId: string, month: number): Promise<number>;
  updateUserWeplayTokenBalance(userId: string, amount: number): Promise<User>;
  updateUserSubscription(userId: string, subscriptionType: 'vip' | 'analytics' | 'support', expiryDate: Date): Promise<User>;
  updateUserPreferences(userId: string, preferences: Partial<{ oddsFormat: string, useVirtualCurrency: boolean, withdrawalSpeed: string, mobileOptimizedView: boolean }>): Promise<User>;
  
  // Financial operations
  getFinancialSummary(): Promise<any>;
  getTransactions(limit: number, offset: number): Promise<Transaction[]>; 
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount>;
  updatePlatformSettings(settings: any): Promise<any>;
  updatePrivacySettings(settings: any): Promise<any>;
  getOwnerBankAccount(): Promise<BankAccount | undefined>;
  updatePlatformRevenue(amount: number, feeType: string): Promise<any>;
  
  // Betting challenge operations
  createBettingChallenge(challenge: InsertBettingChallenge): Promise<BettingChallenge>;
  getBettingChallenge(id: number): Promise<BettingChallenge | undefined>;
  getBettingChallengeByUuid(uuid: string): Promise<BettingChallenge | undefined>;
  getUserChallenges(userId: string, status?: string): Promise<BettingChallenge[]>;
  acceptBettingChallenge(uuid: string, userId: string): Promise<BettingChallenge>;
  updateBettingChallengeStatus(uuid: string, status: string): Promise<BettingChallenge>;
  settleBettingChallenge(uuid: string, winnerId?: string, isDraw?: boolean): Promise<BettingChallenge>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationAsRead(id: number, userId: string): Promise<Notification>;
  
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
  
  // Required method implementations for IStorage
  async updateUserStatus(userId: string, status: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User not found: ${userId}`);
    
    const updatedUser = { ...user, status };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async incrementUserWins(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User not found: ${userId}`);
    
    const winsCount = (user.winsCount || 0) + 1;
    const updatedUser = { ...user, winsCount };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async getUserWithdrawalsForMonth(userId: string, month: number): Promise<number> {
    return 0; // Placeholder implementation
  }
  
  async updateUserWeplayTokenBalance(userId: string, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User not found: ${userId}`);
    
    const weplayTokenBalance = (user.weplayTokenBalance || 0) + amount;
    const updatedUser = { ...user, weplayTokenBalance };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserSubscription(userId: string, subscriptionType: 'vip' | 'analytics' | 'support', expiryDate: Date): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User not found: ${userId}`);
    
    let updatedUser: User;
    if (subscriptionType === 'vip') {
      updatedUser = { ...user, vipExpiryDate: expiryDate };
    } else if (subscriptionType === 'analytics') {
      updatedUser = { ...user, analyticsExpiryDate: expiryDate };
    } else {
      updatedUser = { ...user, supportExpiryDate: expiryDate };
    }
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserPreferences(userId: string, preferences: Partial<{ oddsFormat: string, useVirtualCurrency: boolean, withdrawalSpeed: string, mobileOptimizedView: boolean }>): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User not found: ${userId}`);
    
    const updatedUser = { 
      ...user,
      ...preferences,
      updatedAt: new Date()
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async getFinancialSummary(): Promise<any> {
    return {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalBets: 0,
      totalWinnings: 0,
      revenue: 0,
      userCount: this.users.size,
      activeUserCount: Array.from(this.users.values()).filter(u => u.status === 'active').length
    };
  }
  
  async getTransactions(limit: number, offset: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactions.size + 1;
    const newTransaction: Transaction = { 
      ...transaction, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }
  
  async updateBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount> {
    const existingAccount = await this.getOwnerBankAccount();
    const id = existingAccount ? existingAccount.id : 1;
    
    const newBankAccount: BankAccount = { 
      ...bankAccount, 
      id, 
      createdAt: existingAccount ? existingAccount.createdAt : new Date(),
      updatedAt: new Date()
    };
    
    this.bankAccounts.set(id, newBankAccount);
    return newBankAccount;
  }
  
  async updatePlatformSettings(settings: any): Promise<any> {
    for (const [key, value] of Object.entries(settings)) {
      this.platformSettings.set(key, value);
    }
    return Object.fromEntries(this.platformSettings);
  }
  
  async updatePrivacySettings(settings: any): Promise<any> {
    for (const [key, value] of Object.entries(settings)) {
      this.privacySettings.set(key, Boolean(value));
    }
    return Object.fromEntries(this.privacySettings);
  }
  
  async getOwnerBankAccount(): Promise<BankAccount | undefined> {
    return this.bankAccounts.get(1);
  }
  
  async updatePlatformRevenue(amount: number, feeType: string): Promise<any> {
    // Placeholder implementation
    return { amount, feeType };
  }
  
  private nextUserId: number;
  private nextSportId: number;
  private nextTeamId: number;
  private nextEventId: number;
  private nextBetId: number;
  private nextTournamentId: number;
  private nextFantasyTeamId: number;
  private nextPlayerId: number;
  private nextFantasyTeamPlayerId: number;
  
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
    
    this.nextUserId = 1;
    this.nextSportId = 1;
    this.nextTeamId = 1;
    this.nextEventId = 1;
    this.nextBetId = 1;
    this.nextTournamentId = 1;
    this.nextFantasyTeamId = 1;
    this.nextPlayerId = 1;
    this.nextFantasyTeamPlayerId = 1;
    
    // Initialize some sports
    this.initializeDefaultData();
  }
  
  private initializeDefaultData() {
    // Add default sports
    const sports: InsertSport[] = [
      { name: "Basketball", key: "basketball", isActive: true, icon: "basketball-ball" },
      { name: "Football", key: "football", isActive: true, icon: "football-ball" },
      { name: "Baseball", key: "baseball", isActive: true, icon: "baseball-ball" },
      { name: "Hockey", key: "hockey", isActive: true, icon: "hockey-puck" },
      { name: "Soccer", key: "soccer", isActive: true, icon: "futbol" },
      { name: "Golf", key: "golf", isActive: true, icon: "golf-ball" }
    ];
    
    sports.forEach(sport => this.createSport(sport));
    
    // Add some NBA teams for basketball
    const basketballId = 1;
    const nbaTeams: InsertTeam[] = [
      { name: "Boston Celtics", abbreviation: "BOS", logo: "", sportId: basketballId },
      { name: "LA Lakers", abbreviation: "LAL", logo: "", sportId: basketballId },
      { name: "Milwaukee Bucks", abbreviation: "MIL", logo: "", sportId: basketballId },
      { name: "Miami Heat", abbreviation: "MIA", logo: "", sportId: basketballId },
      { name: "Chicago Bulls", abbreviation: "CHI", logo: "", sportId: basketballId },
      { name: "Detroit Pistons", abbreviation: "DET", logo: "", sportId: basketballId }
    ];
    
    nbaTeams.forEach(team => this.createTeam(team));
    
    // Add a sample event
    const celtics = 1;
    const lakers = 2;
    const sampleEvent: InsertEvent = {
      sportId: basketballId,
      homeTeamId: celtics,
      awayTeamId: lakers,
      startTime: new Date(),
      status: "live"
    };
    
    this.createEvent(sampleEvent);
    
    // Add more upcoming events
    const bucks = 3;
    const heat = 4;
    const bulls = 5;
    const pistons = 6;
    
    const upcomingEvents: InsertEvent[] = [
      {
        sportId: basketballId,
        homeTeamId: bucks,
        awayTeamId: heat,
        startTime: new Date(Date.now() + 86400000), // Tomorrow
        status: "scheduled"
      },
      {
        sportId: basketballId,
        homeTeamId: bulls,
        awayTeamId: pistons,
        startTime: new Date(Date.now() + 172800000), // Day after tomorrow
        status: "scheduled"
      }
    ];
    
    upcomingEvents.forEach(event => this.createEvent(event));
    
    // Add sample tournament
    const tournament: InsertTournament = {
      name: "NBA Playoffs 2023",
      sportId: basketballId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 2592000000), // 30 days later
      status: "active"
    };
    
    this.createTournament(tournament);
  }
  
  // User operations
  async getUser(id: string | number): Promise<User | undefined> {
    const userId = id.toString();
    return this.users.get(userId);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const user: User = { ...insertUser, id, balance: 1000 };
    this.users.set(id.toString(), user);
    return user;
  }
  
  async upsertUser(userData: any): Promise<User> {
    const id = userData.id;
    let user = await this.getUser(id);
    
    if (!user) {
      // Create a new user
      user = { 
        ...userData, 
        balance: userData.balance || 1000,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      // Update existing user
      user = { 
        ...user, 
        ...userData,
        updatedAt: new Date()
      };
    }
    
    this.users.set(id.toString(), user);
    return user;
  }
  
  async updateUserBalance(userId: string | number, amount: number): Promise<User> {
    const userIdStr = userId.toString();
    const user = await this.getUser(userIdStr);
    if (!user) {
      throw new Error("User not found");
    }
    
    user.balance = amount;
    this.users.set(userIdStr, user);
    return user;
  }
  
  async updateYahooIntegration(userId: string | number, token: string, refreshToken: string, expiry: Date): Promise<User> {
    const userIdStr = userId.toString();
    const user = await this.getUser(userIdStr);
    if (!user) {
      throw new Error("User not found");
    }
    
    user.yahooIntegrationToken = token;
    user.yahooIntegrationRefreshToken = refreshToken;
    user.yahooIntegrationExpiry = expiry;
    
    this.users.set(userIdStr, user);
    return user;
  }
  
  // Sports operations
  async getAllSports(): Promise<Sport[]> {
    return Array.from(this.sports.values());
  }
  
  async getSport(id: number): Promise<Sport | undefined> {
    return this.sports.get(id);
  }
  
  async getSportByKey(key: string): Promise<Sport | undefined> {
    return Array.from(this.sports.values()).find(
      (sport) => sport.key === key
    );
  }
  
  async createSport(insertSport: InsertSport): Promise<Sport> {
    const id = this.nextSportId++;
    const sport: Sport = { ...insertSport, id, eventCount: 0 };
    this.sports.set(id, sport);
    return sport;
  }
  
  async updateSportEventCount(sportId: number, count: number): Promise<Sport> {
    const sport = await this.getSport(sportId);
    if (!sport) {
      throw new Error("Sport not found");
    }
    
    sport.eventCount = count;
    this.sports.set(sportId, sport);
    return sport;
  }
  
  // Teams operations
  async getAllTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }
  
  async getTeamsBySport(sportId: number): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(
      (team) => team.sportId === sportId
    );
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
    return Array.from(this.events.values()).filter(
      (event) => event.sportId === sportId
    );
  }
  
  async getUpcomingEvents(limit?: number): Promise<Event[]> {
    const events = Array.from(this.events.values())
      .filter((event) => event.status === "scheduled")
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    return limit ? events.slice(0, limit) : events;
  }
  
  async getLiveEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.status === "live"
    );
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.nextEventId++;
    const event: Event = { 
      ...insertEvent, 
      id, 
      homeScore: 0, 
      awayScore: 0, 
      period: "", 
      timeRemaining: "",
      odds: {}
    };
    
    this.events.set(id, event);
    
    // Update sport event count
    const sport = await this.getSport(event.sportId);
    if (sport) {
      await this.updateSportEventCount(sport.id, sport.eventCount + 1);
    }
    
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
    if (!event) {
      throw new Error("Event not found");
    }
    
    event.status = status;
    if (homeScore !== undefined) event.homeScore = homeScore;
    if (awayScore !== undefined) event.awayScore = awayScore;
    if (period !== undefined) event.period = period;
    if (timeRemaining !== undefined) event.timeRemaining = timeRemaining;
    
    this.events.set(eventId, event);
    return event;
  }
  
  async updateEventOdds(eventId: number, odds: any): Promise<Event> {
    const event = await this.getEvent(eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    event.odds = odds;
    this.events.set(eventId, event);
    return event;
  }
  
  // Bets operations
  async getUserBets(userId: number): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(
      (bet) => bet.userId === userId
    );
  }
  
  async getBet(id: number): Promise<Bet | undefined> {
    return this.bets.get(id);
  }
  
  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = this.nextBetId++;
    const bet: Bet = { 
      ...insertBet, 
      id, 
      status: "pending", 
      placedAt: new Date(),
      settledAt: undefined
    };
    
    this.bets.set(id, bet);
    
    // Update user balance
    const user = await this.getUser(bet.userId);
    if (user) {
      await this.updateUserBalance(user.id, user.balance - bet.amount);
    }
    
    return bet;
  }
  
  async settleBet(betId: number, status: string): Promise<Bet> {
    const bet = await this.getBet(betId);
    if (!bet) {
      throw new Error("Bet not found");
    }
    
    bet.status = status;
    bet.settledAt = new Date();
    this.bets.set(betId, bet);
    
    // If bet won, update user balance
    if (status === "won") {
      const user = await this.getUser(bet.userId);
      if (user) {
        await this.updateUserBalance(user.id, user.balance + bet.potentialPayout);
      }
    }
    
    return bet;
  }
  
  // Tournaments operations
  async getAllTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values());
  }
  
  async getTournament(id: number): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }
  
  async getTournamentsBySport(sportId: number): Promise<Tournament[]> {
    return Array.from(this.tournaments.values()).filter(
      (tournament) => tournament.sportId === sportId
    );
  }
  
  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const id = this.nextTournamentId++;
    const tournament: Tournament = { 
      ...insertTournament, 
      id, 
      bracketData: {} 
    };
    
    this.tournaments.set(id, tournament);
    return tournament;
  }
  
  async updateTournamentBracket(tournamentId: number, bracketData: any): Promise<Tournament> {
    const tournament = await this.getTournament(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }
    
    tournament.bracketData = bracketData;
    this.tournaments.set(tournamentId, tournament);
    return tournament;
  }
  
  // Fantasy teams operations
  async getUserFantasyTeams(userId: number): Promise<FantasyTeam[]> {
    return Array.from(this.fantasyTeams.values()).filter(
      (team) => team.userId === userId
    );
  }
  
  async getFantasyTeam(id: number): Promise<FantasyTeam | undefined> {
    return this.fantasyTeams.get(id);
  }
  
  async createFantasyTeam(insertFantasyTeam: InsertFantasyTeam): Promise<FantasyTeam> {
    const id = this.nextFantasyTeamId++;
    const fantasyTeam: FantasyTeam = { 
      ...insertFantasyTeam, 
      id, 
      salary: 0, 
      maxSalary: 50000, 
      createdAt: new Date() 
    };
    
    this.fantasyTeams.set(id, fantasyTeam);
    return fantasyTeam;
  }
  
  async updateFantasyTeamSalary(fantasyTeamId: number, salary: number): Promise<FantasyTeam> {
    const fantasyTeam = await this.getFantasyTeam(fantasyTeamId);
    if (!fantasyTeam) {
      throw new Error("Fantasy team not found");
    }
    
    fantasyTeam.salary = salary;
    this.fantasyTeams.set(fantasyTeamId, fantasyTeam);
    return fantasyTeam;
  }
  
  // Players operations
  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }
  
  async getPlayersByTeam(teamId: number): Promise<Player[]> {
    return Array.from(this.players.values()).filter(
      (player) => player.teamId === teamId
    );
  }
  
  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }
  
  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.nextPlayerId++;
    const player: Player = { ...insertPlayer, id };
    this.players.set(id, player);
    return player;
  }
  
  // Fantasy team players operations
  async getFantasyTeamPlayers(fantasyTeamId: number): Promise<FantasyTeamPlayer[]> {
    return Array.from(this.fantasyTeamPlayers.values()).filter(
      (ftp) => ftp.fantasyTeamId === fantasyTeamId
    );
  }
  
  async addPlayerToFantasyTeam(insertFantasyTeamPlayer: InsertFantasyTeamPlayer): Promise<FantasyTeamPlayer> {
    const id = this.nextFantasyTeamPlayerId++;
    const fantasyTeamPlayer: FantasyTeamPlayer = { ...insertFantasyTeamPlayer, id };
    this.fantasyTeamPlayers.set(id, fantasyTeamPlayer);
    
    // Update fantasy team salary
    const player = await this.getPlayer(fantasyTeamPlayer.playerId);
    const fantasyTeam = await this.getFantasyTeam(fantasyTeamPlayer.fantasyTeamId);
    
    if (player && fantasyTeam && player.salary) {
      await this.updateFantasyTeamSalary(fantasyTeam.id, fantasyTeam.salary + player.salary);
    }
    
    return fantasyTeamPlayer;
  }
  
  async removePlayerFromFantasyTeam(fantasyTeamId: number, playerId: number): Promise<void> {
    const ftp = Array.from(this.fantasyTeamPlayers.values()).find(
      (ftp) => ftp.fantasyTeamId === fantasyTeamId && ftp.playerId === playerId
    );
    
    if (ftp) {
      this.fantasyTeamPlayers.delete(ftp.id);
      
      // Update fantasy team salary
      const player = await this.getPlayer(playerId);
      const fantasyTeam = await this.getFantasyTeam(fantasyTeamId);
      
      if (player && fantasyTeam && player.salary) {
        await this.updateFantasyTeamSalary(fantasyTeam.id, fantasyTeam.salary - player.salary);
      }
    }
  }
}

// Import DatabaseStorage implementation
import { DatabaseStorage } from "./DatabaseStorage";

// Switch from memory storage to database storage for persistent data
export const storage = new DatabaseStorage();
