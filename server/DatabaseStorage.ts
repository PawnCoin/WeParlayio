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
import { db } from "./db";
import { eq, and, gt, lt, desc, sql, or } from "drizzle-orm";
import { IStorage } from "./storage";

/**
 * Implementation of storage operations using PostgreSQL database
 */
export class DatabaseStorage implements IStorage {
  // ==================== User Operations ====================

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserBalance(userId: string, amount: number): Promise<User> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const newBalance = (user.balance || 0) + amount;
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        balance: newBalance,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async updateYahooIntegration(
    userId: string, 
    token: string, 
    refreshToken: string, 
    expiry: Date
  ): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        yahooToken: token,
        yahooRefreshToken: refreshToken,
        yahooTokenExpiry: expiry,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserStatus(userId: string, status: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        status: status,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async incrementUserWins(userId: string): Promise<User> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const currentWins = user.wins || 0;
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        wins: currentWins + 1,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async getUserWithdrawalsForMonth(userId: string, month: number): Promise<number> {
    const year = new Date().getFullYear();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const result = await db
      .select({
        total: sql`SUM(amount)`.as('total')
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'withdrawal'),
          gt(transactions.createdAt, startDate),
          lt(transactions.createdAt, endDate)
        )
      );
    
    return result[0]?.total || 0;
  }

  async updateUserWeplayTokenBalance(userId: string, amount: number): Promise<User> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const newTokenBalance = (user.weplayTokenBalance || 0) + amount;
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        weplayTokenBalance: newTokenBalance,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async updateUserSubscription(
    userId: string, 
    subscriptionType: 'vip' | 'analytics' | 'support', 
    expiryDate: Date
  ): Promise<User> {
    const updateData: Partial<User> = {
      updatedAt: new Date()
    };
    
    if (subscriptionType === 'vip') {
      updateData.vipExpiryDate = expiryDate;
    } else if (subscriptionType === 'analytics') {
      updateData.analyticsExpiryDate = expiryDate;
    } else if (subscriptionType === 'support') {
      updateData.supportExpiryDate = expiryDate;
    }
    
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }
  
  async updateUserPreferences(
    userId: string, 
    preferences: Partial<{ 
      oddsFormat: string, 
      useVirtualCurrency: boolean, 
      withdrawalSpeed: string, 
      mobileOptimizedView: boolean 
    }>
  ): Promise<User> {
    try {
      // Create an update object with only the fields that were provided
      const updateData: Partial<User> = {
        updatedAt: new Date()
      };
      
      if (preferences.oddsFormat !== undefined) {
        updateData.oddsFormat = preferences.oddsFormat;
      }
      
      if (preferences.useVirtualCurrency !== undefined) {
        updateData.useVirtualCurrency = preferences.useVirtualCurrency;
      }
      
      if (preferences.withdrawalSpeed !== undefined) {
        updateData.withdrawalSpeed = preferences.withdrawalSpeed;
      }
      
      if (preferences.mobileOptimizedView !== undefined) {
        updateData.mobileOptimizedView = preferences.mobileOptimizedView;
      }
      
      // Perform the update
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();
      
      if (!updatedUser) {
        throw new Error(`Failed to update preferences for user: ${userId}`);
      }
      
      return updatedUser;
    } catch (error) {
      console.error(`Error updating user preferences: ${error}`);
      throw new Error(`Failed to update user preferences: ${error}`);
    }
  }

  // ==================== Financial Operations ====================

  async getFinancialSummary(): Promise<any> {
    // Get total deposits
    const depositsResult = await db
      .select({
        total: sql`SUM(amount)`.as('total')
      })
      .from(transactions)
      .where(eq(transactions.type, 'deposit'));
    
    // Get total withdrawals
    const withdrawalsResult = await db
      .select({
        total: sql`SUM(amount)`.as('total')
      })
      .from(transactions)
      .where(eq(transactions.type, 'withdrawal'));
    
    // Get total fees
    const feesResult = await db
      .select({
        total: sql`SUM(amount)`.as('total')
      })
      .from(transactions)
      .where(eq(transactions.type, 'fee'));
    
    // Get user count
    const userCount = await db
      .select({
        count: sql`COUNT(*)`.as('count')
      })
      .from(users);
    
    // Get transaction count by type
    const transactionCounts = await db
      .select({
        type: transactions.type,
        count: sql`COUNT(*)`.as('count')
      })
      .from(transactions)
      .groupBy(transactions.type);
    
    return {
      totalDeposits: depositsResult[0]?.total || 0,
      totalWithdrawals: withdrawalsResult[0]?.total || 0,
      totalFees: feesResult[0]?.total || 0,
      userCount: userCount[0]?.count || 0,
      transactionCounts: transactionCounts.reduce((acc, item) => {
        acc[item.type] = item.count;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  async getTransactions(limit: number, offset: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    // Ensure proper transaction data with all required fields
    const transactionData = {
      ...transaction,
      currency: transaction.currency || 'USD',
      description: transaction.description || '',
      transactionDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [newTransaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    
    return newTransaction;
  }

  async updateBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount> {
    // Make sure bankAccount has userId
    if (!bankAccount.userId) {
      throw new Error("Bank account must have a userId");
    }
    
    const [existingBankAccount] = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.userId, bankAccount.userId));
    
    if (existingBankAccount) {
      // Update existing bank account
      const [updatedBankAccount] = await db
        .update(bankAccounts)
        .set({
          ...bankAccount,
          updatedAt: new Date()
        })
        .where(eq(bankAccounts.userId, bankAccount.userId))
        .returning();
      
      return updatedBankAccount;
    } else {
      // Create new bank account
      const [newBankAccount] = await db
        .insert(bankAccounts)
        .values({
          ...bankAccount,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return newBankAccount;
    }
  }

  async updatePlatformSettings(settings: any): Promise<any> {
    // In a real application, this would update platform-wide settings in a dedicated table
    // For now, we'll return a mock response
    return { ...settings, updated: true };
  }

  async updatePrivacySettings(settings: any): Promise<any> {
    // In a real application, this would update privacy settings in a dedicated table
    // For now, we'll return a mock response
    return { ...settings, updated: true };
  }

  async getOwnerBankAccount(): Promise<BankAccount | undefined> {
    // In a real application, this would retrieve a designated owner bank account
    // For demonstration, we'll get the first bank account
    const [ownerBankAccount] = await db
      .select()
      .from(bankAccounts)
      .limit(1);
    
    return ownerBankAccount;
  }

  async updatePlatformRevenue(amount: number, feeType: string): Promise<any> {
    // In a real application, this would update platform revenue records
    // For demonstration, we'll create a fee transaction
    const [feeTransaction] = await db
      .insert(transactions)
      .values({
        type: 'fee',
        amount: amount,
        currency: 'USD',
        description: `Platform fee: ${feeType}`,
        status: 'completed'
      })
      .returning();
    
    return { success: true, transaction: feeTransaction };
  }

  // ==================== Sports Operations ====================

  async getAllSports(): Promise<Sport[]> {
    return await db.select().from(sports);
  }

  async getSport(id: number): Promise<Sport | undefined> {
    const [sport] = await db
      .select()
      .from(sports)
      .where(eq(sports.id, id));
    
    return sport;
  }

  async getSportByKey(key: string): Promise<Sport | undefined> {
    const [sport] = await db
      .select()
      .from(sports)
      .where(eq(sports.key, key));
    
    return sport;
  }

  async createSport(sport: InsertSport): Promise<Sport> {
    const [newSport] = await db
      .insert(sports)
      .values(sport)
      .returning();
    
    return newSport;
  }

  async updateSportEventCount(sportId: number, count: number): Promise<Sport> {
    const [updatedSport] = await db
      .update(sports)
      .set({ 
        eventCount: count,
        updatedAt: new Date() 
      })
      .where(eq(sports.id, sportId))
      .returning();
    
    return updatedSport;
  }

  // ==================== Teams Operations ====================

  async getAllTeams(): Promise<Team[]> {
    return await db.select().from(teams);
  }

  async getTeamsBySport(sportId: number): Promise<Team[]> {
    return await db
      .select()
      .from(teams)
      .where(eq(teams.sportId, sportId));
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, id));
    
    return team;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db
      .insert(teams)
      .values(team)
      .returning();
    
    return newTeam;
  }

  // ==================== Events Operations ====================

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));
    
    return event;
  }

  async getEventsBySport(sportId: number): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.sportId, sportId));
  }

  async getUpcomingEvents(limit?: number): Promise<Event[]> {
    const now = new Date();
    const query = db
      .select()
      .from(events)
      .where(gt(events.startTime, now))
      .orderBy(events.startTime);
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query;
  }

  async getLiveEvents(): Promise<Event[]> {
    const now = new Date();
    return await db
      .select()
      .from(events)
      .where(
        and(
          lt(events.startTime, now),
          eq(events.status, 'in_progress')
        )
      );
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(event)
      .returning();
    
    return newEvent;
  }

  async updateEventStatus(
    eventId: number, 
    status: string, 
    homeScore?: number, 
    awayScore?: number, 
    period?: string, 
    timeRemaining?: string
  ): Promise<Event> {
    const updateData: any = { 
      status,
      updatedAt: new Date()
    };
    
    if (homeScore !== undefined) updateData.homeScore = homeScore;
    if (awayScore !== undefined) updateData.awayScore = awayScore;
    if (period !== undefined) updateData.period = period;
    if (timeRemaining !== undefined) updateData.timeRemaining = timeRemaining;
    
    const [updatedEvent] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, eventId))
      .returning();
    
    return updatedEvent;
  }

  async updateEventOdds(eventId: number, odds: any): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({ 
        odds,
        updatedAt: new Date() 
      })
      .where(eq(events.id, eventId))
      .returning();
    
    return updatedEvent;
  }

  // ==================== Bets Operations ====================

  async getUserBets(userId: number): Promise<Bet[]> {
    return await db
      .select()
      .from(bets)
      .where(eq(bets.userId, userId))
      .orderBy(desc(bets.createdAt));
  }

  async getBet(id: number): Promise<Bet | undefined> {
    const [bet] = await db
      .select()
      .from(bets)
      .where(eq(bets.id, id));
    
    return bet;
  }

  async createBet(bet: InsertBet): Promise<Bet> {
    const [newBet] = await db
      .insert(bets)
      .values(bet)
      .returning();
    
    return newBet;
  }

  async settleBet(betId: number, status: string): Promise<Bet> {
    const [updatedBet] = await db
      .update(bets)
      .set({ 
        status,
        settledAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(bets.id, betId))
      .returning();
    
    return updatedBet;
  }

  // ==================== Tournaments Operations ====================

  async getAllTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments);
  }

  async getTournament(id: number): Promise<Tournament | undefined> {
    const [tournament] = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, id));
    
    return tournament;
  }

  async getTournamentsBySport(sportId: number): Promise<Tournament[]> {
    return await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.sportId, sportId));
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const [newTournament] = await db
      .insert(tournaments)
      .values(tournament)
      .returning();
    
    return newTournament;
  }

  async updateTournamentBracket(tournamentId: number, bracketData: any): Promise<Tournament> {
    const [updatedTournament] = await db
      .update(tournaments)
      .set({ 
        bracket: bracketData,
        updatedAt: new Date() 
      })
      .where(eq(tournaments.id, tournamentId))
      .returning();
    
    return updatedTournament;
  }

  // ==================== Fantasy Teams Operations ====================

  async getUserFantasyTeams(userId: number): Promise<FantasyTeam[]> {
    return await db
      .select()
      .from(fantasyTeams)
      .where(eq(fantasyTeams.userId, userId));
  }

  async getFantasyTeam(id: number): Promise<FantasyTeam | undefined> {
    const [fantasyTeam] = await db
      .select()
      .from(fantasyTeams)
      .where(eq(fantasyTeams.id, id));
    
    return fantasyTeam;
  }

  async createFantasyTeam(fantasyTeam: InsertFantasyTeam): Promise<FantasyTeam> {
    const [newFantasyTeam] = await db
      .insert(fantasyTeams)
      .values(fantasyTeam)
      .returning();
    
    return newFantasyTeam;
  }

  async updateFantasyTeamSalary(fantasyTeamId: number, salary: number): Promise<FantasyTeam> {
    const [updatedFantasyTeam] = await db
      .update(fantasyTeams)
      .set({ 
        salaryCap: salary,
        updatedAt: new Date() 
      })
      .where(eq(fantasyTeams.id, fantasyTeamId))
      .returning();
    
    return updatedFantasyTeam;
  }

  // ==================== Players Operations ====================

  async getAllPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  async getPlayersByTeam(teamId: number): Promise<Player[]> {
    return await db
      .select()
      .from(players)
      .where(eq(players.teamId, teamId));
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db
      .select()
      .from(players)
      .where(eq(players.id, id));
    
    return player;
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const [newPlayer] = await db
      .insert(players)
      .values(player)
      .returning();
    
    return newPlayer;
  }

  // ==================== Fantasy Team Players Operations ====================

  async getFantasyTeamPlayers(fantasyTeamId: number): Promise<FantasyTeamPlayer[]> {
    return await db
      .select()
      .from(fantasyTeamPlayers)
      .where(eq(fantasyTeamPlayers.fantasyTeamId, fantasyTeamId));
  }

  async addPlayerToFantasyTeam(fantasyTeamPlayer: InsertFantasyTeamPlayer): Promise<FantasyTeamPlayer> {
    const [newFantasyTeamPlayer] = await db
      .insert(fantasyTeamPlayers)
      .values(fantasyTeamPlayer)
      .returning();
    
    return newFantasyTeamPlayer;
  }

  async removePlayerFromFantasyTeam(fantasyTeamId: number, playerId: number): Promise<void> {
    await db
      .delete(fantasyTeamPlayers)
      .where(
        and(
          eq(fantasyTeamPlayers.fantasyTeamId, fantasyTeamId),
          eq(fantasyTeamPlayers.playerId, playerId)
        )
      );
  }

  // ==================== Support Ticket Operations ====================

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    // Generate a unique ticket number
    const ticketNumber = `WP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Create complete ticket data with all required fields
    const ticketData = {
      ...ticket,
      ticketNumber,
      aiAssigned: ticket.aiAssigned ?? true,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [newTicket] = await db
      .insert(supportTickets)
      .values(ticketData)
      .returning();
    
    return newTicket;
  }

  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id));
    
    return ticket;
  }

  async getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.ticketNumber, ticketNumber));
    
    return ticket;
  }

  async getUserSupportTickets(userId: string): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.updatedAt));
  }

  async updateSupportTicketStatus(ticketId: number, status: string): Promise<SupportTicket> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({ 
        status,
        updatedAt: new Date() 
      })
      .where(eq(supportTickets.id, ticketId))
      .returning();
    
    return updatedTicket;
  }

  async addTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage> {
    const [newMessage] = await db
      .insert(supportTicketMessages)
      .values(message)
      .returning();
    
    // Update the ticket's updatedAt timestamp
    await db
      .update(supportTickets)
      .set({ updatedAt: new Date() })
      .where(eq(supportTickets.id, message.ticketId));
    
    return newMessage;
  }

  async getTicketMessages(ticketId: number): Promise<SupportTicketMessage[]> {
    return await db
      .select()
      .from(supportTicketMessages)
      .where(eq(supportTicketMessages.ticketId, ticketId))
      .orderBy(supportTicketMessages.createdAt);
  }

  async logTicketAction(ticketId: number, action: string, details?: any): Promise<SupportTicketLog> {
    const logEntry = {
      ticketId,
      action,
      details: details || {}
    };
    
    const [newLog] = await db
      .insert(supportTicketLogs)
      .values(logEntry)
      .returning();
    
    return newLog;
  }

  // ==================== Known Issues Operations ====================

  async createKnownIssue(issue: InsertKnownIssue): Promise<KnownIssue> {
    // Create complete issue data with all required fields
    const issueData = {
      ...issue,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true
    };
    
    const [newIssue] = await db
      .insert(knownIssues)
      .values(issueData)
      .returning();
    
    return newIssue;
  }

  async getKnownIssues(): Promise<KnownIssue[]> {
    return await db
      .select()
      .from(knownIssues);
  }

  async getActiveKnownIssues(): Promise<KnownIssue[]> {
    return await db
      .select()
      .from(knownIssues)
      .where(eq(knownIssues.status, 'active'));
  }

  async updateKnownIssue(id: number, updates: Partial<KnownIssue>): Promise<KnownIssue> {
    const [updatedIssue] = await db
      .update(knownIssues)
      .set({ 
        ...updates,
        updatedAt: new Date() 
      })
      .where(eq(knownIssues.id, id))
      .returning();
    
    return updatedIssue;
  }

  async matchIssueToKnownIssues(description: string): Promise<KnownIssue[]> {
    // In a real application, this would use text search or similar functionality
    // For demonstration, we'll do a simple match against keywords
    const lowerDesc = description.toLowerCase();
    
    const activeIssues = await this.getActiveKnownIssues();
    return activeIssues.filter(issue => {
      const keywords = issue.keywords || [];
      return keywords.some(keyword => lowerDesc.includes(keyword.toLowerCase()));
    });
  }
}