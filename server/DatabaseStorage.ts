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
  notifications, Notification, InsertNotification,
  friendships, Friendship, InsertFriendship
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, lt, desc, sql, or, ne, ilike, inArray } from "drizzle-orm";
import { IStorage } from "./storage";
import { transformDatabaseUser, transformTransactionForInsert, safeNumber } from "./utils/typeTransformers";

/**
 * Implementation of storage operations using PostgreSQL database
 */
export class DatabaseStorage implements IStorage {
  private linkedAccounts: any[] = [];
  
  // ==================== User Operations ====================

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ? transformDatabaseUser(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user ? transformDatabaseUser(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user ? transformDatabaseUser(user) : undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return transformDatabaseUser(user);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          // updatedAt removed for schema compliance,
        },
      })
      .returning();
    return transformDatabaseUser(user);
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
        // updatedAt removed for schema compliance 
      })
      .where(eq(users.id, userId))
      .returning();
    
    return transformDatabaseUser(updatedUser);
  }



  async getAllUsers(): Promise<User[]> {
    const dbUsers = await db.select().from(users);
    return dbUsers.map(user => ({
      ...user,
      wins: user.winsCount ?? undefined
    })) as User[];
  }

  async updateUserStatus(userId: string, status: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        status: status,
        // updatedAt removed for schema compliance 
      })
      .where(eq(users.id, userId))
      .returning();
    
    return transformDatabaseUser(updatedUser);
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
        // updatedAt removed for schema compliance 
      })
      .where(eq(users.id, userId))
      .returning();
    
    return transformDatabaseUser(updatedUser);
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
    
    return Number(result[0]?.total ?? 0);
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
        // updatedAt removed for schema compliance 
      })
      .where(eq(users.id, userId))
      .returning();
    
    return transformDatabaseUser(updatedUser);
  }

  async updateUserSubscription(
    userId: string, 
    subscriptionType: 'vip' | 'analytics' | 'support', 
    expiryDate: Date
  ): Promise<User> {
    const updateData: Partial<User> = {
      // updatedAt removed for schema compliance
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
    
    return transformDatabaseUser(updatedUser);
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
        // updatedAt removed for schema compliance
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
      
      return transformDatabaseUser(updatedUser);
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
        acc[item.type] = Number(item.count);
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
      // updatedAt removed for schema compliance
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
          // updatedAt removed for schema compliance
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
          // updatedAt removed for schema compliance
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

  async createLinkedAccount(linkedAccount: any): Promise<any> {
    // Store linked account information
    // In a real application, this would use a proper table schema
    const accountData = {
      id: Date.now().toString(),
      ...linkedAccount,
      createdAt: new Date(),
      // updatedAt removed for schema compliance
    };
    
    // Store in a mock linked accounts collection
    if (!this.linkedAccounts) {
      this.linkedAccounts = [];
    }
    this.linkedAccounts.push(accountData);
    
    return accountData;
  }

  async getLinkedAccounts(userId: string): Promise<any[]> {
    if (!this.linkedAccounts) {
      return [];
    }
    
    return this.linkedAccounts.filter(account => 
      account.userId === userId && account.isActive
    );
  }

  async getLinkedAccountByPlaidAccountId(userId: string, accountId: string): Promise<any> {
    if (!this.linkedAccounts) {
      return null;
    }
    
    return this.linkedAccounts.find(account => 
      account.userId === userId && 
      account.isActive &&
      account.accounts.some((acc: any) => acc.accountId === accountId)
    );
  }

  async removeLinkedAccount(userId: string, itemId: string): Promise<boolean> {
    if (!this.linkedAccounts) {
      return false;
    }
    
    const accountIndex = this.linkedAccounts.findIndex(account => 
      account.userId === userId && account.plaidItemId === itemId
    );
    
    if (accountIndex !== -1) {
      this.linkedAccounts[accountIndex].isActive = false;
      this.linkedAccounts[accountIndex].updatedAt = new Date();
      return true;
    }
    
    return false;
  }

  async getTransactionByPlaidTransferId(transferId: string): Promise<any> {
    const transactions = await this.getTransactions(1000, 0);
    return transactions.find(transaction => transaction.plaidTransferId === transferId);
  }

  async updateTransactionStatus(transactionId: number, status: string): Promise<Transaction> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({ 
        status,
        // updatedAt removed for schema compliance 
      })
      .where(eq(transactions.id, transactionId))
      .returning();
    
    return updatedTransaction;
  }

  // WeParlay Cash specific methods
  async transferWeParlayCash(fromUserId: string, toUserId: string, amount: number, reason: string = 'Transfer'): Promise<any> {
    const fromUser = await this.getUser(fromUserId);
    const toUser = await this.getUser(toUserId);
    
    if (!fromUser || !toUser) {
      throw new Error('User not found');
    }
    
    if (((fromUser.weplayTokenBalance ?? 0) || 0) < amount) {
      throw new Error('Insufficient WeParlay Cash balance');
    }
    
    // Update balances
    await this.updateUserWeplayTokenBalance(fromUserId, -amount);
    await this.updateUserWeplayTokenBalance(toUserId, amount);
    
    // Create transaction records
    const transferId = `wpc_transfer_${Date.now()}`;
    
    await this.createTransaction({
      userId: fromUserId,
      type: 'weparlay_transfer_out',
      amount: -amount,
      currency: 'WeParlayCash',
      status: 'completed',
      // method: 'internal_transfer',
      description: `WeParlay Cash transfer to user ${toUserId}: ${reason}`,
      // timestamp: - removed for schema compliance new Date(),
      });
    
    await this.createTransaction({
      userId: toUserId,
      type: 'weparlay_transfer_in',
      amount: amount,
      currency: 'WeParlayCash',
      status: 'completed',
      // method: 'internal_transfer',
      description: `WeParlay Cash received from user ${fromUserId}: ${reason}`,
      // timestamp: - removed for schema compliance new Date(),
      });
    
    return {
      transferId,
      success: true,
      fromBalance: (fromUser.weplayTokenBalance ?? 0) - amount,
      toBalance: (toUser.weplayTokenBalance || 0) + amount
    };
  }

  // WeParlay Cash conversion methods have been removed
  // WeParlay Cash is now purely virtual currency for practice betting

  async redeemWeParlayCashRewards(userId: string, amount: number, reason: string = 'Reward redemption'): Promise<any> {
    await this.updateUserWeplayTokenBalance(userId, amount);
    
    await this.createTransaction({
      userId: userId,
      type: 'weparlay_reward',
      amount: amount,
      currency: 'WeParlayCash',
      status: 'completed',
      // method: 'reward_system',
      description: reason,
      // timestamp: - removed for schema compliance new Date()
    });
    
    return {
      success: true,
      amount: amount,
      reason: reason
    };
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
    // Create a platform revenue transaction
    const transactionData = {
      userId: 'system',
      type: 'platform_revenue',
      amount: amount,
      currency: 'USD',
      description: `Platform fee: ${feeType}`,
      status: 'completed',
      details: { feeType },
      method: 'internal'
    };
    
    const [feeTransaction] = await db
      .insert(transactions)
      .values(transactionData)
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
        // updatedAt removed for schema compliance 
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
      // updatedAt removed for schema compliance
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
        // updatedAt removed for schema compliance 
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
      .where(eq(bets.userId, String(userId)))
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
        // updatedAt removed for schema compliance 
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
        bracketData: bracketData,
        // updatedAt removed for schema compliance 
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
      .where(eq(fantasyTeams.userId, String(userId)));
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
        salary: salary,
        // updatedAt removed for schema compliance 
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
      // updatedAt removed for schema compliance
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
        // updatedAt removed for schema compliance 
      })
      .where(eq(supportTickets.id, Number(ticketId)))
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
      .where(eq(supportTickets.id, message.ticketId as any));
    
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

  // ==================== Betting Challenge Operations ====================
  
  async createBettingChallenge(challenge: InsertBettingChallenge): Promise<BettingChallenge> {
    const [newChallenge] = await db
      .insert(bettingChallenges)
      .values({
        ...challenge,
        createdAt: new Date(),
        // updatedAt removed for schema compliance
      })
      .returning();
    
    return newChallenge;
  }
  
  async getBettingChallenge(id: number): Promise<BettingChallenge | undefined> {
    const [challenge] = await db
      .select()
      .from(bettingChallenges)
      .where(eq(bettingChallenges.id, id));
    
    return challenge;
  }
  
  async getBettingChallengeByUuid(uuid: string): Promise<BettingChallenge | undefined> {
    const [challenge] = await db
      .select()
      .from(bettingChallenges)
      .where(eq(bettingChallenges.challengeUuid, uuid));
    
    return challenge;
  }
  
  async getUserChallenges(userId: string, status?: string): Promise<BettingChallenge[]> {
    const conditions = [
      or(
        eq(bettingChallenges.createdBy, userId),
        eq(bettingChallenges.acceptedBy, userId)
      )
    ];
    
    if (status) {
      conditions.push(eq(bettingChallenges.status, status));
    }
    
    return await db
      .select()
      .from(bettingChallenges)
      .where(and(...conditions))
      .orderBy(desc(bettingChallenges.createdAt));
  }
  
  async acceptBettingChallenge(uuid: string, acceptedBy: string): Promise<BettingChallenge> {
    const [challenge] = await db
      .update(bettingChallenges)
      .set({
        acceptedBy,
        status: 'accepted',
        acceptedAt: new Date(),
        // updatedAt removed for schema compliance
      })
      .where(eq(bettingChallenges.challengeUuid, uuid))
      .returning();
    
    return challenge;
  }
  
  async updateBettingChallengeStatus(uuid: string, status: string): Promise<BettingChallenge> {
    const updateData: any = {
      status,
      // updatedAt removed for schema compliance
    };
    
    // If the challenge is being settled, add settled timestamp
    if (status === 'settled') {
      updateData.settledAt = new Date();
    }
    
    const [challenge] = await db
      .update(bettingChallenges)
      .set(updateData)
      .where(eq(bettingChallenges.challengeUuid, uuid))
      .returning();
    
    return challenge;
  }
  
  async settleBettingChallenge(uuid: string, winnerId?: string, isDraw: boolean = false): Promise<BettingChallenge> {
    // Get the current challenge
    const challenge = await this.getBettingChallengeByUuid(uuid);
    if (!challenge) {
      throw new Error(`Challenge with UUID ${uuid} not found`);
    }
    
    // Verify challenge can be settled
    if (challenge.status !== 'accepted') {
      throw new Error(`Challenge with UUID ${uuid} cannot be settled (status: ${challenge.status})`);
    }
    
    if (!challenge.acceptedBy) {
      throw new Error(`Challenge with UUID ${uuid} has not been accepted yet`);
    }
    
    let newStatus = 'settled';
    let winnerUserId = winnerId;
    
    // Handle draw case
    if (isDraw) {
      newStatus = 'draw';
      winnerUserId = undefined;
      
      // Refund both users
      if (challenge.createdBy) {
        await this.updateUserBalance(challenge.createdBy, challenge.amount);
        
        // Create refund transaction record
        await this.createTransaction({
          userId: challenge.createdBy,
          type: TransactionType.REFUND,
          amount: challenge.amount,
          currency: challenge.isVirtual ? 'WeParlayCache' : 'USD',
          description: `Refund for draw on bet ${challenge.challengeUuid} (${challenge.eventName})`,
          status: 'completed'
        });
      }
      
      if (challenge.acceptedBy) {
        await this.updateUserBalance(challenge.acceptedBy, challenge.amount);
        
        // Create refund transaction record
        await this.createTransaction({
          userId: challenge.acceptedBy,
          type: TransactionType.REFUND,
          amount: challenge.amount,
          currency: challenge.isVirtual ? 'WeParlayCache' : 'USD',
          description: `Refund for draw on bet ${challenge.challengeUuid} (${challenge.eventName})`,
          status: 'completed'
        });
      }
    } 
    // Handle winner case
    else if (winnerUserId) {
      // Calculate payout amount (original bet x2)
      const payoutAmount = challenge.amount * 2;
      
      // Add winnings to winner's balance
      await this.updateUserBalance(winnerUserId, payoutAmount);
      
      // Create winning transaction record
      await this.createTransaction({
        userId: winnerUserId,
        type: TransactionType.WINNING,
        amount: payoutAmount,
        currency: challenge.isVirtual ? 'WeParlayCache' : 'USD',
        description: `Winnings from bet ${challenge.challengeUuid} (${challenge.eventName})`,
        status: 'completed'
      });
      
      // Increment winner's win count
      await this.incrementUserWins(winnerUserId);
    }
    
    // Update challenge status and winner
    const [updatedChallenge] = await db
      .update(bettingChallenges)
      .set({
        status: newStatus,
        winnerId: winnerUserId,
        settledAt: new Date(),
        // updatedAt removed for schema compliance
      })
      .where(eq(bettingChallenges.challengeUuid, uuid))
      .returning();
    
    return updatedChallenge;
  }
  
  // ==================== Notification Operations ====================
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values({
        ...notification,
        createdAt: new Date(),
        // updatedAt removed for schema compliance
      })
      .returning();
    
    return newNotification;
  }
  
  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    const conditions = [eq(notifications.userId, userId)];
    
    if (unreadOnly) {
      conditions.push(eq(notifications.read, false));
    }
    
    return await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));
  }
  
  async markNotificationAsRead(id: number, userId: string): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({
        read: true,
        readAt: new Date(),
        // updatedAt removed for schema compliance
      })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, userId)
        )
      )
      .returning();
    
    return notification;
  }

  // ==================== Known Issues Operations ====================

  async createKnownIssue(issue: InsertKnownIssue): Promise<KnownIssue> {
    // Create complete issue data with all required fields
    const issueData = {
      ...issue,
      createdAt: new Date(),
      // updatedAt removed for schema compliance,
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
      .where(eq(knownIssues.active, true));
  }

  async updateKnownIssue(id: number, updates: Partial<KnownIssue>): Promise<KnownIssue> {
    const [updatedIssue] = await db
      .update(knownIssues)
      .set({ 
        ...updates,
        // updatedAt removed for schema compliance 
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

  // ==================== WeParlay Cash Transaction Operations ====================

  async createWeparlayCashTransaction(transactionData: {
    userId: string;
    amount: number;
    type: string;
    description: string;
    metadata?: any;
  }): Promise<any> {
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId: transactionData.userId,
        type: transactionData.type,
        amount: transactionData.amount,
        currency: 'WeParlay Cash',
        description: transactionData.description,
        status: 'completed',
        details: transactionData.metadata || {}
      })
      .returning();
    
    // Update user WeParlay Cash balance
    const balanceChange = transactionData.type === 'credit' ? transactionData.amount : -transactionData.amount;
    await db
      .update(users)
      .set({ 
        weparlayCashBalance: sql`${users.weparlayCashBalance} + ${balanceChange}`,
        // updatedAt removed for schema compliance
      })
      .where(eq(users.id, transactionData.userId));
    
    return transaction;
  }

  

  async getWeparlayCashTransactions(userId: string): Promise<any[]> {
    const userTransactions = await db
      .select()
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.currency, 'WeParlay Cash')
      ))
      .orderBy(desc(transactions.createdAt));
    
    return userTransactions;
  }

  // Additional methods needed for TypeScript completion
  async getUserByGamertag(gamertag: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.gamertag, gamertag));
    return transformDatabaseUser(user);
  }

  async updateUserGamertag(userId: string, gamertag: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        gamertag,
        // updatedAt removed for schema compliance 
      })
      .where(eq(users.id, userId))
      .returning();
    
    return transformDatabaseUser(updatedUser);
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    // This would need a wallet column in the users table
    const [user] = await db.select().from(users).where(eq(users.id, walletAddress));
    return transformDatabaseUser(user);
  }

  async updateUserTier(userId: string, tier: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        tier,
        // updatedAt removed for schema compliance 
      })
      .where(eq(users.id, userId))
      .returning();
    
    return transformDatabaseUser(updatedUser);
  }

  async createCustomBet(betData: any): Promise<Bet> {
    const [newBet] = await db
      .insert(bets)
      .values(betData)
      .returning();
    
    return newBet;
  }

  // ==================== Friends System Operations ====================

  async sendFriendRequest(userId: string, friendId: string): Promise<Friendship> {
    const [friendship] = await db
      .insert(friendships)
      .values({
        userId,
        friendId,
        status: 'pending'
      })
      .returning();
    
    // Create notification for the friend request
    await this.createNotification({
      userId: friendId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `You have received a new friend request`,
      link: '/friends'
    });
    
    return friendship;
  }

  async acceptFriendRequest(userId: string, friendId: string): Promise<Friendship> {
    const [friendship] = await db
      .update(friendships)
      .set({ 
        status: 'accepted',
        acceptedAt: new Date(),
        // updatedAt removed for schema compliance
      })
      .where(
        and(
          eq(friendships.userId, friendId),
          eq(friendships.friendId, userId),
          eq(friendships.status, 'pending')
        )
      )
      .returning();
    
    // Create reciprocal friendship
    await db
      .insert(friendships)
      .values({
        userId,
        friendId,
        status: 'accepted',
        acceptedAt: new Date()
      });
    
    // Notify the original requester
    await this.createNotification({
      userId: friendId,
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      message: `Your friend request has been accepted`,
      link: '/friends'
    });
    
    return friendship;
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    await db
      .delete(friendships)
      .where(
        or(
          and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
          and(eq(friendships.userId, friendId), eq(friendships.friendId, userId))
        )
      );
    
    return true;
  }

  async getUserFriends(userId: string): Promise<any[]> {
    const friendRelations = await db
      .select()
      .from(friendships)
      .where(
        and(
          or(eq(friendships.userId, userId), eq(friendships.friendId, userId)),
          eq(friendships.status, 'accepted')
        )
      );
    
    const friendIds = friendRelations.map(f => 
      f.userId === userId ? f.friendId : f.userId
    );
    
    if (friendIds.length === 0) return [];
    
    const friends = await db
      .select()
      .from(users)
      .where(
        or(...friendIds.map(id => eq(users.id, id)))
      );
    
    return friends.map(friend => ({
      id: friend.id,
      username: friend.username,
      firstName: friend.firstName,
      lastName: friend.lastName,
      profileImageUrl: friend.profileImageUrl,
      tier: friend.tier,
      wins: friend.wins,
      status: 'accepted'
    }));
  }

  async getPendingFriendRequests(userId: string): Promise<any[]> {
    const pendingRequests = await db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.friendId, userId),
          eq(friendships.status, 'pending')
        )
      );
    
    if (pendingRequests.length === 0) return [];
    
    const requesterIds = pendingRequests.map(f => f.userId);
    const requesters = await db
      .select()
      .from(users)
      .where(
        or(...requesterIds.map(id => eq(users.id, id)))
      );
    
    return requesters.map(requester => ({
      id: requester.id,
      username: requester.username,
      firstName: requester.firstName,
      lastName: requester.lastName,
      profileImageUrl: requester.profileImageUrl,
      tier: requester.tier,
      requestedAt: pendingRequests.find(p => p.userId === requester.id)?.requestedAt
    }));
  }

  async searchUsers(query: string, currentUserId: string): Promise<any[]> {
    const searchResults = await db
      .select()
      .from(users)
      .where(
        and(
          or(
            sql`${users.username} ILIKE ${`%${query}%`}`,
            sql`${users.firstName} ILIKE ${`%${query}%`}`,
            sql`${users.lastName} ILIKE ${`%${query}%`}`
          ),
          sql`${users.id} != ${currentUserId}`
        )
      )
      .limit(10);
    
    return searchResults.map(user => ({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      tier: user.tier
    }));
  }

  async updateUserConsent(userId: string, consents: any): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        smsConsent: consents.sms,
        marketingConsent: consents.marketing,
        emailConsent: consents.email,
        lastConsentUpdate: new Date(),
        // updatedAt removed for schema compliance
      })
      .where(eq(users.id, userId))
      .returning();
    return transformDatabaseUser(updatedUser);
  }

  async updateUserStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId,
        // updatedAt removed for schema compliance
      })
      .where(eq(users.id, userId))
      .returning();
    return transformDatabaseUser(updatedUser);
  }
}