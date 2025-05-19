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
  index
} from "drizzle-orm/pg-core";
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
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"),
  status: varchar("status").default("active"),
  balance: doublePrecision("balance").default(1000),
  betsCount: integer("bets_count").default(0),
  winsCount: integer("wins_count").default(0),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  yahooIntegrationToken: text("yahoo_integration_token"),
  yahooIntegrationRefreshToken: text("yahoo_integration_refresh_token"),
  yahooIntegrationExpiry: timestamp("yahoo_integration_expiry"),
  // New fields for fee structures and premium services
  weplayTokenBalance: doublePrecision("weplay_token_balance").default(0),
  vipUntil: timestamp("vip_until"),
  analyticsPackageUntil: timestamp("analytics_package_until"),
  prioritySupportUntil: timestamp("priority_support_until"),
  freeWithdrawalsThisMonth: integer("free_withdrawals_this_month").default(0),
  lastWithdrawalMonth: integer("last_withdrawal_month"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
  status: true
});

// Bank accounts for owner's deposits
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  accountName: text("account_name").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  routingNumber: text("routing_number").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).pick({
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
  status: text("status").default("pending"), // 'pending', 'completed', 'failed'
  transactionDate: timestamp("transaction_date").defaultNow(),
  details: jsonb("details"),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  status: true,
  details: true,
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
});

export const insertEventSchema = createInsertSchema(events).pick({
  sportId: true,
  homeTeamId: true,
  awayTeamId: true,
  startTime: true,
  status: true,
});

// Bets model
export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  eventId: integer("event_id").notNull(),
  betType: text("bet_type").notNull(),
  pick: text("pick").notNull(),
  odds: doublePrecision("odds").notNull(),
  amount: doublePrecision("amount").notNull(),
  potentialPayout: doublePrecision("potential_payout").notNull(),
  status: text("status").default("pending"),
  placedAt: timestamp("placed_at").defaultNow(),
  settledAt: timestamp("settled_at"),
});

export const insertBetSchema = createInsertSchema(bets).pick({
  userId: true,
  eventId: true,
  betType: true,
  pick: true,
  odds: true,
  amount: true,
  potentialPayout: true,
});

// Tournaments model
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sportId: integer("sport_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").default("upcoming"),
  bracketData: json("bracket_data"),
});

export const insertTournamentSchema = createInsertSchema(tournaments).pick({
  name: true,
  sportId: true,
  startDate: true,
  endDate: true,
  status: true,
});

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
});

export const insertFantasyTeamPlayerSchema = createInsertSchema(fantasyTeamPlayers).pick({
  fantasyTeamId: true,
  playerId: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
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

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;

export type FantasyTeam = typeof fantasyTeams.$inferSelect;
export type InsertFantasyTeam = z.infer<typeof insertFantasyTeamSchema>;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type FantasyTeamPlayer = typeof fantasyTeamPlayers.$inferSelect;
export type InsertFantasyTeamPlayer = z.infer<typeof insertFantasyTeamPlayerSchema>;