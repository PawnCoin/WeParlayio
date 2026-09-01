import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  json, 
  doublePrecision,
  varchar,
  jsonb,
  index,
  uuid,
  unique
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User model
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  username: varchar("username").unique(),
  gamertag: varchar("gamertag").unique(), // Premium feature for paid members
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"),
  status: varchar("status").default("active"),
  balance: doublePrecision("balance").default(1000), // Default WeParlay Cash amount for new users
  weparlayCashBalance: doublePrecision("weparlay_cash_balance").default(0), // WeParlay Cash system
  cashBalance: doublePrecision("cash_balance").default(0), // User cash balance
  subscriptionTier: varchar("subscription_tier").default("wood"), // Default to free Wood tier
  tier: varchar("tier").default("bronze"), // User tier system
  betsCount: integer("bets_count").default(0),
  wins: integer("wins").default(0),
  // User consent fields
  smsConsent: boolean("sms_consent").default(false),
  marketingConsent: boolean("marketing_consent").default(false),
  emailConsent: boolean("email_consent").default(false),
  lastConsentUpdate: timestamp("last_consent_update"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  yahooToken: text("yahoo_token"),
  // Preserve the legacy production column while Yahoo integrations migrate.
  yahooAccessToken: text("yahoo_access_token"),
  yahooRefreshToken: text("yahoo_refresh_token"),
  yahooTokenExpiry: timestamp("yahoo_token_expiry"),
  yahooIntegrationToken: text("yahoo_integration_token"),
  yahooIntegrationRefreshToken: text("yahoo_integration_refresh_token"),
  yahooIntegrationExpiry: timestamp("yahoo_integration_expiry"),
  // New fields for fee structures and premium services
  weplayTokenBalance: doublePrecision("weplay_token_balance").default(0),
  vipUntil: timestamp("vip_until"),
  vipExpiryDate: timestamp("vip_expiry_date"),
  analyticsExpiryDate: timestamp("analytics_expiry_date"),
  supportExpiryDate: timestamp("support_expiry_date"),
  // Wallet and authentication fields
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  referralCode: varchar("referral_code"),
  analyticsPackageUntil: timestamp("analytics_package_until"),
  prioritySupportUntil: timestamp("priority_support_until"),
  freeWithdrawalsThisMonth: integer("free_withdrawals_this_month").default(0),
  lastWithdrawalMonth: integer("last_withdrawal_month"),
  // Referral program fields
  inviteCode: varchar("invite_code").unique(),
  referredBy: varchar("referred_by"),
  inviteCount: integer("invite_count").default(0),
  // User preferences
  oddsFormat: varchar("odds_format").default("american"), // american, decimal, fractional
  useVirtualCurrency: boolean("use_virtual_currency").default(true), // Toggle between real money and WeParlay Cash
  withdrawalSpeed: varchar("withdrawal_speed").default("standard"), // standard, fast, instant
  mobileOptimizedView: boolean("mobile_optimized_view").default(true), // Toggle for mobile optimized views
  // Additional fields to fix TypeScript errors
  realMoneyBalance: doublePrecision("real_money_balance").default(0),
  claims: jsonb("claims"),
  winsCount: integer("wins_count").default(0),
  isAdmin: boolean("is_admin").default(false),
  totalBets: integer("total_bets").default(0),
  winRate: doublePrecision("win_rate").default(0),
  totalWinnings: doublePrecision("total_winnings").default(0),
  recentActivity: jsonb("recent_activity"),
  achievements: jsonb("achievements"),
  favoriteSport: varchar("favorite_sport"),
  averageBet: doublePrecision("average_bet").default(0),
  biggestWin: doublePrecision("biggest_win").default(0),
  emailVerified: boolean("email_verified").default(false),
});

export const weparlayCashLedger = pgTable("weparlay_cash_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  referenceId: varchar("reference_id", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 32 }).notNull(),
  amount: doublePrecision("amount").notNull(),
  balanceBefore: doublePrecision("balance_before").notNull(),
  balanceAfter: doublePrecision("balance_after").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("weparlay_cash_ledger_user_created_idx").on(table.userId, table.createdAt),
]);

export type WeparlayCashLedger = typeof weparlayCashLedger.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  username: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
  status: true,
  balance: true,
  weplayTokenBalance: true,
  subscriptionTier: true,
  inviteCode: true,
  referredBy: true,
  emailVerified: true,
  realMoneyBalance: true,
  tier: true,
  winsCount: true,
  isAdmin: true,
  totalBets: true,
  winRate: true,
  totalWinnings: true,
  recentActivity: true,
  achievements: true,
  favoriteSport: true,
  averageBet: true,
  biggestWin: true
}).extend({
  walletAddress: z.string().optional(),
  phoneNumber: z.string().optional(),
  walletType: z.string().optional(),
  lastActivity: z.date().optional(),
  preferences: z.any().optional(),
  socialLinks: z.any().optional(),
  wins: z.number().optional(),
  password: z.string().optional(),
  subscriptionExpiry: z.date().optional(),
  yahooAccessToken: z.string().optional(),
});

// Bank accounts for owner's deposits
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  accountName: text("account_name").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  routingNumber: text("routing_number").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).pick({
  userId: true,
  accountName: true,
  bankName: true,
  accountNumber: true,
  routingNumber: true,
  isDefault: true,
});

// Transactions model for deposits/withdrawals
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'bet', 'win'
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").default("USD"),
  description: text("description"),
  status: text("status").default("pending"), // 'pending', 'completed', 'failed'
  transactionDate: timestamp("transaction_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  details: jsonb("details"),
  plaidTransferId: text("plaid_transfer_id"),
  method: text("method"), // 'plaid_transfer', 'cash_app', 'stripe', etc.
});

// Plaid bank accounts table for secure bank integration
export const plaidBankAccounts = pgTable("plaid_bank_accounts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  plaidAccountId: varchar("plaid_account_id").notNull(),
  plaidAccessToken: varchar("plaid_access_token", { length: 512 }).notNull(),
  plaidItemId: varchar("plaid_item_id").notNull(),
  accountName: varchar("account_name"),
  accountType: varchar("account_type"), // 'depository', 'credit', etc.
  accountSubtype: varchar("account_subtype"), // 'checking', 'savings', etc.
  mask: varchar("mask", { length: 10 }), // Last 4 digits
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPlaidBankAccountSchema = createInsertSchema(plaidBankAccounts).pick({
  userId: true,
  plaidAccountId: true,
  plaidAccessToken: true,
  plaidItemId: true,
  accountName: true,
  accountType: true,
  accountSubtype: true,
  mask: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  currency: true,
  description: true,
  status: true,
  transactionDate: true,
  details: true,
  plaidTransferId: true,
  method: true,
});

// Transaction Types
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  BET = 'bet',
  WINNING = 'winning',
  REFUND = 'refund',
  FEE = 'fee',
  PLATFORM_REVENUE = 'platform_revenue',
  SUBSCRIPTION = 'subscription'
}

// Platform Revenue Tracking
export const platformRevenue = pgTable("platform_revenue", {
  id: serial("id").primaryKey(),
  amount: doublePrecision("amount").notNull(),
  feeType: text("fee_type").notNull(), // betting, withdrawal, deposit, subscription
  createdAt: timestamp("created_at").defaultNow(),
  depositedToOwner: boolean("deposited_to_owner").default(false),
  depositedAt: timestamp("deposited_at"),
});

export const insertPlatformRevenueSchema = createInsertSchema(platformRevenue).pick({
  amount: true,
  feeType: true,
});

// Platform settings
export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sports model
export const sports = pgTable("sports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  isActive: boolean("is_active").default(true),
  icon: text("icon"),
  eventCount: integer("event_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSportSchema = createInsertSchema(sports).pick({
  name: true,
  key: true,
  isActive: true,
  icon: true,
});

// Teams model
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  abbreviation: text("abbreviation"),
  logo: text("logo"),
  sportId: integer("sport_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  abbreviation: true,
  logo: true,
  sportId: true,
});

// Games/Events model
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  sportId: integer("sport_id").notNull(),
  homeTeamId: integer("home_team_id").notNull(),
  awayTeamId: integer("away_team_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  status: text("status").default("scheduled"),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  period: text("period"),
  timeRemaining: text("time_remaining"),
  odds: json("odds"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).pick({
  sportId: true,
  homeTeamId: true,
  awayTeamId: true,
  startTime: true,
  status: true,
});

// Bets model - Enhanced with full currency support
export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  eventId: varchar("event_id").notNull(), // String to handle external API IDs
  betType: text("bet_type").notNull(), // moneyline, spread, total, parlay
  pick: text("pick").notNull(),
  selection: text("selection").notNull(), // Team/outcome selected
  odds: doublePrecision("odds").notNull(),
  amount: doublePrecision("amount").notNull(),
  potentialPayout: doublePrecision("potential_payout").notNull(),
  currency: text("currency").notNull().default("weparlay_cash"), // weparlay_cash, real_money, crypto
  cryptocurrencyType: text("cryptocurrency_type"), // BTC, ETH, etc. (if crypto)
  walletAddress: text("wallet_address"), // crypto wallet address
  transactionHash: text("transaction_hash"), // blockchain transaction hash
  point: doublePrecision("point"), // spread/total point (if applicable)
  gameInfo: jsonb("game_info"), // store game details for reference
  status: text("status").default("pending"), // pending, won, lost, cancelled, processing
  placedAt: timestamp("placed_at").defaultNow(),
  settledAt: timestamp("settled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBetSchema = createInsertSchema(bets).pick({
  userId: true,
  eventId: true,
  betType: true,
  pick: true,
  selection: true,
  odds: true,
  amount: true,
  potentialPayout: true,
  currency: true,
  cryptocurrencyType: true,
  walletAddress: true,
  point: true,
  gameInfo: true,
  status: true,
});

// Bet slip item schema for frontend
export const betSlipItemSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  betType: z.string(),
  selection: z.string(),
  odds: z.number(),
  amount: z.number().default(0),
  potential: z.number().default(0),
  point: z.number().optional(),
  sport: z.string(),
  gameInfo: z.object({
    homeTeam: z.string(),
    awayTeam: z.string(),
    startTime: z.string().optional(),
  }).optional(),
});

export type BetSlipItem = z.infer<typeof betSlipItemSchema>;

// Place bet request schema
export const placeBetRequestSchema = z.object({
  bets: z.array(betSlipItemSchema),
  currency: z.enum(["weparlay_cash", "real_money", "crypto"]),
  cryptocurrencyType: z.string().optional(),
  walletAddress: z.string().optional(),
});

export type PlaceBetRequest = z.infer<typeof placeBetRequestSchema>;

// Tournaments model
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sportId: integer("sport_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").default("upcoming"),
  bracketData: json("bracket_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTournamentSchema = createInsertSchema(tournaments).pick({
  name: true,
  sportId: true,
  startDate: true,
  endDate: true,
  status: true,
});

// Daily pick tournaments are intentionally separate from the legacy sports
// tournament model above. The complete state is retained for settlement audits.
export const dailyTournamentStates = pgTable(
  "daily_tournament_states",
  {
    id: varchar("id").primaryKey().notNull(),
    day: varchar("day", { length: 10 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("open"),
    state: jsonb("state").notNull(),
    lockAt: timestamp("lock_at", { withTimezone: true }).notNull(),
    settleAfter: timestamp("settle_after", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index("daily_tournament_day_idx").on(table.day),
    index("daily_tournament_status_idx").on(table.status),
  ],
);

// Fantasy Teams model
export const fantasyTeams = pgTable("fantasy_teams", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  sportId: integer("sport_id").notNull(),
  salary: doublePrecision("salary").default(0),
  maxSalary: doublePrecision("max_salary").default(50000),
  createdAt: timestamp("created_at").defaultNow(),
  yahooTeamId: text("yahoo_team_id"),
});

export const insertFantasyTeamSchema = createInsertSchema(fantasyTeams).pick({
  userId: true,
  name: true,
  sportId: true,
  salary: true,
  maxSalary: true,
  yahooTeamId: true,
});

// Players model
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  teamId: integer("team_id").notNull(),
  salary: doublePrecision("salary"),
  projectedPoints: doublePrecision("projected_points"),
  yahooPlayerId: text("yahoo_player_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  position: true,
  teamId: true,
  salary: true,
  projectedPoints: true,
  yahooPlayerId: true,
});

// Fantasy Team Players (join table)
export const fantasyTeamPlayers = pgTable("fantasy_team_players", {
  id: serial("id").primaryKey(),
  fantasyTeamId: integer("fantasy_team_id").notNull(),
  playerId: integer("player_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFantasyTeamPlayerSchema = createInsertSchema(fantasyTeamPlayers).pick({
  fantasyTeamId: true,
  playerId: true,
});

// Type definitions with extended properties
export type User = typeof users.$inferSelect & {
  lastActivity?: Date;
  preferences?: any;
  socialLinks?: any;
  phoneNumber?: string;
  walletAddress?: string;
  walletType?: string;
  wins?: number;
  password?: string;
  subscriptionExpiry?: Date;
  yahooAccessToken?: string;
};
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = InsertUser;
// Admin dashboard types
export type AdminUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  status: string | null;
  balance: number | null;
  betsCount: number | null;
  winsCount: number | null;
  lastLogin: Date | null;
  createdAt: Date | null;
};

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Admin dashboard settings
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  platformFee: doublePrecision("platform_fee").default(0.05),
  maxWithdrawalLimit: doublePrecision("max_withdrawal_limit").default(10000),
  minWithdrawalAmount: doublePrecision("min_withdrawal_amount").default(20),
  maintenanceMode: boolean("maintenance_mode").default(false),
  registrationEnabled: boolean("registration_enabled").default(true),
  apiKeysValid: boolean("api_keys_valid").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Sport = typeof sports.$inferSelect;
export type InsertSport = z.infer<typeof insertSportSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type Event = typeof events.$inferSelect & {
  description?: string;
  venue?: string;
  weather?: any;
};
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Bet = typeof bets.$inferSelect & {
  metadata?: any;
  bonusApplied?: boolean;
  payout?: number;
  event?: any;
};
export type InsertBet = z.infer<typeof insertBetSchema>;

export type Tournament = typeof tournaments.$inferSelect & {
  rules?: any;
  prizePool?: number;
};
export type InsertTournament = z.infer<typeof insertTournamentSchema>;

export type FantasyTeam = typeof fantasyTeams.$inferSelect & {
  salaryCap?: number;
};
export type InsertFantasyTeam = z.infer<typeof insertFantasyTeamSchema>;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type FantasyTeamPlayer = typeof fantasyTeamPlayers.$inferSelect;
export type InsertFantasyTeamPlayer = z.infer<typeof insertFantasyTeamPlayerSchema>;

export type P2pChallenge = typeof p2pChallenges.$inferSelect;
export type InsertP2pChallenge = z.infer<typeof insertP2pChallengeSchema>;

export type P2pTransaction = typeof p2pTransactions.$inferSelect;
export type InsertP2pTransaction = z.infer<typeof insertP2pTransactionSchema>;

export type P2pActivity = typeof p2pActivity.$inferSelect;
export type InsertP2pActivity = z.infer<typeof insertP2pActivitySchema>;

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;

// Support ticket system for automated issue resolution
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  userId: varchar("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'technical', 'financial', 'account', 'other'
  priority: text("priority").default("medium"), // 'low', 'medium', 'high', 'critical'
  status: text("status").default("open"), // 'open', 'in_progress', 'resolved', 'closed', 'escalated'
  aiAssigned: boolean("ai_assigned").default(true),
  aiResolution: text("ai_resolution"),
  resolutionSteps: json("resolution_steps").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const supportTicketMessages = pgTable("support_ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => supportTickets.id),
  senderId: varchar("sender_id"), // Can be user_id or 'system' or 'ai'
  userId: varchar("user_id"), // Additional user reference for TypeScript compatibility
  message: text("message").notNull(),
  attachmentUrl: text("attachment_url"),
  isFromUser: boolean("is_from_user").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportTicketLogs = pgTable("support_ticket_logs", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => supportTickets.id),
  action: text("action").notNull(), // 'created', 'updated', 'status_changed', 'assigned', 'resolved', etc.
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knownIssues = pgTable("known_issues", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  symptoms: json("symptoms").$type<string[]>(),
  solution: text("solution").notNull(),
  autoFixScript: text("auto_fix_script"), // Optional script that can be executed to fix the issue
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  active: boolean("active").default(true),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).pick({
  userId: true,
  subject: true,
  description: true,
  category: true,
  priority: true,
  aiAssigned: true,
  resolutionSteps: true,
  aiResolution: true,
  status: true,
});

export const insertSupportTicketMessageSchema = createInsertSchema(supportTicketMessages).pick({
  ticketId: true,
  senderId: true,
  message: true,
  attachmentUrl: true,
  userId: true,
  isFromUser: true,
});

// Friends system for social betting
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  friendId: varchar("friend_id").notNull().references(() => users.id),
  status: text("status").default("pending"), // 'pending', 'accepted', 'blocked'
  requestedAt: timestamp("requested_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Peer-to-peer betting challenges
export const p2pChallenges = pgTable("p2p_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengerId: varchar("challenger_id").notNull().references(() => users.id),
  challengeeId: varchar("challengee_id").references(() => users.id), // null for open challenges
  eventId: varchar("event_id").notNull(),
  gameDetails: jsonb("game_details").notNull(), // store team names, start time, etc.
  challengerPick: text("challenger_pick").notNull(), // team or outcome picked by challenger
  challengeePick: text("challengee_pick"), // team picked by challengee (opposite side)
  betAmount: doublePrecision("bet_amount").notNull(),
  currency: text("currency").notNull().default("weparlay_cash"),
  totalPot: doublePrecision("total_pot").notNull(), // bet_amount * 2
  escrowHeld: doublePrecision("escrow_held").default(0), // amount currently in escrow
  status: text("status").default("open"), // 'open', 'accepted', 'pending_settlement', 'settled', 'cancelled', 'expired'
  expiresAt: timestamp("expires_at").notNull(), // challenges auto-expire before game starts
  winnerUserId: varchar("winner_user_id").references(() => users.id),
  settlementReason: text("settlement_reason"),
  isPublic: boolean("is_public").default(true), // public challenges vs friend-only
  allowedFriends: jsonb("allowed_friends"), // array of friend IDs if not public
  challengeMessage: text("challenge_message"), // optional message from challenger
  acceptedAt: timestamp("accepted_at"),
  settledAt: timestamp("settled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// P2P Challenge transactions for escrow management
export const p2pTransactions = pgTable("p2p_transactions", {
  id: serial("id").primaryKey(),
  challengeId: varchar("challenge_id").notNull().references(() => p2pChallenges.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  transactionType: text("transaction_type").notNull(), // 'escrow_deposit', 'escrow_release', 'refund'
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").default("weparlay_cash"),
  balanceBefore: doublePrecision("balance_before").notNull(),
  balanceAfter: doublePrecision("balance_after").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Challenge notifications and activity feed
export const p2pActivity = pgTable("p2p_activity", {
  id: serial("id").primaryKey(),
  challengeId: varchar("challenge_id").notNull().references(() => p2pChallenges.id),
  userId: varchar("user_id").notNull().references(() => users.id), // user who performed action
  activityType: text("activity_type").notNull(), // 'challenge_created', 'challenge_accepted', 'challenge_settled', 'challenge_cancelled'
  message: text("message").notNull(),
  metadata: jsonb("metadata"), // additional data for the activity
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFriendshipSchema = createInsertSchema(friendships).pick({
  userId: true,
  friendId: true,
  status: true,
});

export const insertP2pChallengeSchema = createInsertSchema(p2pChallenges).pick({
  challengerId: true,
  challengeeId: true,
  eventId: true,
  gameDetails: true,
  challengerPick: true,
  challengeePick: true,
  betAmount: true,
  currency: true,
  totalPot: true,
  expiresAt: true,
  isPublic: true,
  allowedFriends: true,
  challengeMessage: true,
});

export const insertP2pTransactionSchema = createInsertSchema(p2pTransactions).pick({
  challengeId: true,
  userId: true,
  transactionType: true,
  amount: true,
  currency: true,
  balanceBefore: true,
  balanceAfter: true,
  description: true,
});

export const insertP2pActivitySchema = createInsertSchema(p2pActivity).pick({
  challengeId: true,
  userId: true,
  activityType: true,
  message: true,
  metadata: true,
});

export const insertKnownIssueSchema = createInsertSchema(knownIssues).pick({
  title: true,
  description: true,
  category: true,
  symptoms: true,
  solution: true,
  autoFixScript: true,
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

export type SupportTicketMessage = typeof supportTicketMessages.$inferSelect;
export type InsertSupportTicketMessage = z.infer<typeof insertSupportTicketMessageSchema>;

export type SupportTicketLog = typeof supportTicketLogs.$inferSelect;

export type KnownIssue = typeof knownIssues.$inferSelect & {
  keywords?: string[];
  status?: string;
};
export type InsertKnownIssue = z.infer<typeof insertKnownIssueSchema>;

// Head-to-head betting challenges
export const bettingChallenges = pgTable("betting_challenges", {
  id: serial("id").primaryKey(),
  challengeUuid: uuid("challenge_uuid").defaultRandom().notNull().unique(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  acceptedBy: varchar("accepted_by").references(() => users.id),
  eventId: integer("event_id").references(() => events.id),
  eventName: text("event_name").notNull(),
  amount: doublePrecision("amount").notNull(),
  odds: doublePrecision("odds"),
  currency: text("currency").default("USD"),
  isVirtual: boolean("is_virtual").default(true), // Using WeParlay Cash (true) or real money (false)
  pick: text("pick").notNull(), // What the challenger is betting on
  oppositePick: text("opposite_pick"), // What the challenger is offering to the opponent
  status: text("status").default("pending"), // pending, accepted, declined, canceled, active, settled
  expiresAt: timestamp("expires_at"), // When the challenge expires if not accepted
  notificationSent: boolean("notification_sent").default(false), 
  notificationEmail: text("notification_email"), // Optional email to notify
  notificationPhone: text("notification_phone"), // Optional phone to notify
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  settledAt: timestamp("settled_at"),
  winnerId: varchar("winner_id").references(() => users.id),
  isDraw: boolean("is_draw").default(false),
  customMessage: text("custom_message"),
  metadata: json("metadata"), // Additional challenge metadata
});

export const insertBettingChallengeSchema = createInsertSchema(bettingChallenges)
  .omit({ 
    id: true, 
    challengeUuid: true, 
    createdAt: true, 
    updatedAt: true, 
    acceptedAt: true, 
    settledAt: true, 
    winnerId: true, 
    isDraw: true, 
    notificationSent: true 
  });

// User notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // challenge, bet, result, system, social
  message: text("message").notNull(),
  link: text("link"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  readAt: timestamp("read_at"),
  // Additional field to fix TypeScript errors
  title: text("title"),
});

export const insertNotificationSchema = createInsertSchema(notifications)
  .omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true, 
    readAt: true 
  });

export type BettingChallenge = typeof bettingChallenges.$inferSelect & {
  uuid?: string; // Alias for challengeUuid to maintain compatibility
};
export type InsertBettingChallenge = z.infer<typeof insertBettingChallengeSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;

// Error reporting system
export const errorReports = pgTable("error_reports", {
  id: varchar("id").primaryKey().notNull(),
  type: text("type").notNull(), // 'error', 'feedback', 'bug'
  message: text("message").notNull(),
  details: text("details").default(""),
  userAgent: text("user_agent").notNull(),
  url: text("url").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  status: text("status").default("submitted"), // 'pending', 'submitted', 'resolved'
  critical: boolean("critical").default(false),
  userId: varchar("user_id").references(() => users.id),
  userEmail: text("user_email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertErrorReportSchema = createInsertSchema(errorReports)
  .omit({ 
    createdAt: true, 
    updatedAt: true, 
    resolvedAt: true 
  });

export type ErrorReport = typeof errorReports.$inferSelect;
export type InsertErrorReport = z.infer<typeof insertErrorReportSchema>;

// Social Betting System
export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  sport: varchar("sport"), // NBA, NFL, Soccer, etc.
  betAmount: doublePrecision("bet_amount"),
  potentialPayout: doublePrecision("potential_payout"),
  odds: varchar("odds"), // +150, -110, etc.
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const socialLikes = pgTable("social_likes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id").notNull().references(() => socialPosts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("unique_user_post_like").on(table.userId, table.postId)
]);

export const socialComments = pgTable("social_comments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id").notNull().references(() => socialPosts.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const socialFollows = pgTable("social_follows", {
  id: serial("id").primaryKey(),
  followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("unique_follow_relationship").on(table.followerId, table.followingId)
]);

// User leaderboard stats (computed periodically)
export const socialLeaderboard = pgTable("social_leaderboard", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  totalProfit: doublePrecision("total_profit").default(0),
  winRate: doublePrecision("win_rate").default(0),
  currentStreak: integer("current_streak").default(0),
  totalPosts: integer("total_posts").default(0),
  totalFollowers: integer("total_followers").default(0),
  period: varchar("period").default("monthly"), // daily, weekly, monthly, all-time
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => [
  unique("unique_user_period").on(table.userId, table.period)
]);

// Insert schemas for social betting
export const insertSocialPostSchema = createInsertSchema(socialPosts)
  .omit({ id: true, createdAt: true, updatedAt: true, likes: true, comments: true, shares: true });

export const insertSocialLikeSchema = createInsertSchema(socialLikes)
  .omit({ id: true, createdAt: true });

export const insertSocialCommentSchema = createInsertSchema(socialComments)
  .omit({ id: true, createdAt: true });

export const insertSocialFollowSchema = createInsertSchema(socialFollows)
  .omit({ id: true, createdAt: true });

export const insertSocialLeaderboardSchema = createInsertSchema(socialLeaderboard)
  .omit({ id: true, lastUpdated: true });

// Types for social betting
export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type SocialLike = typeof socialLikes.$inferSelect;
export type InsertSocialLike = z.infer<typeof insertSocialLikeSchema>;
export type SocialComment = typeof socialComments.$inferSelect;
export type InsertSocialComment = z.infer<typeof insertSocialCommentSchema>;
export type SocialFollow = typeof socialFollows.$inferSelect;
export type InsertSocialFollow = z.infer<typeof insertSocialFollowSchema>;
export type SocialLeaderboard = typeof socialLeaderboard.$inferSelect;
export type InsertSocialLeaderboard = z.infer<typeof insertSocialLeaderboardSchema>;
