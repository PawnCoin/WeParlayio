import { Request, Response } from 'express';

/**
 * Fantasy Social & Competitive Features Engine
 * Handles league betting pools, social feeds, tournaments, and competitive features
 */

interface FantasyBettingPool {
  poolId: string;
  leagueId: string;
  platform: 'espn';
  poolType: 'weekly' | 'monthly' | 'season';
  entryFee: number;
  currency: 'usd' | 'weparlay_cash' | 'pawn_coin';
  totalPot: number;
  participants: Array<{
    userId: string;
    username: string;
    entryTime: Date;
    teamName: string;
    currentRank: number;
  }>;
  payoutStructure: Array<{
    rank: number;
    percentage: number;
    amount: number;
  }>;
  status: 'open' | 'active' | 'completed';
  startTime: Date;
  endTime: Date;
}

interface FantasyTournament {
  tournamentId: string;
  name: string;
  description: string;
  format: 'single_elimination' | 'round_robin' | 'points_based';
  entryFee: number;
  currency: 'usd' | 'weparlay_cash' | 'pawn_coin';
  maxParticipants: number;
  currentParticipants: number;
  prizePool: number;
  bracket: any;
  rules: string[];
  startDate: Date;
  endDate: Date;
  status: 'registration' | 'active' | 'completed';
  sponsors: string[];
}

interface SocialFeed {
  postId: string;
  userId: string;
  username: string;
  avatar: string;
  postType: 'trade_analysis' | 'lineup_share' | 'trash_talk' | 'injury_update' | 'sleeper_pick';
  content: string;
  media?: string[];
  likes: number;
  comments: number;
  shares: number;
  timestamp: Date;
  leagueId?: string;
  tags: string[];
  mentions: string[];
}

interface TradeAnalyzer {
  tradeId: string;
  fromUserId: string;
  toUserId: string;
  fromAssets: Array<{
    playerId: string;
    playerName: string;
    position: string;
    team: string;
    currentValue: number;
    projectedValue: number;
  }>;
  toAssets: Array<{
    playerId: string;
    playerName: string;
    position: string;
    team: string;
    currentValue: number;
    projectedValue: number;
  }>;
  fairnessScore: number;
  winnerProjection: 'team_a' | 'team_b' | 'fair';
  analysis: {
    positionalNeeds: string[];
    valueDiscrepancy: number;
    riskAssessment: string;
    recommendation: 'accept' | 'decline' | 'counter';
  };
}

interface ExpertPicks {
  expertId: string;
  expertName: string;
  credibility: number;
  weeklyPicks: Array<{
    playerId: string;
    playerName: string;
    position: string;
    recommendation: 'start' | 'sit' | 'flex' | 'avoid';
    confidence: number;
    reasoning: string;
    projectedPoints: number;
  }>;
  accuracy: {
    season: number;
    lastFourWeeks: number;
    trending: 'up' | 'down' | 'stable';
  };
}

class FantasySocialEngine {
  private bettingPools: Map<string, FantasyBettingPool> = new Map();
  private tournaments: Map<string, FantasyTournament> = new Map();
  private socialFeeds: Map<string, SocialFeed[]> = new Map();
  private expertPicks: Map<string, ExpertPicks> = new Map();

  /**
   * Create fantasy league betting pool
   */
  async createBettingPool(leagueId: string, platform: 'espn', poolConfig: {
    poolType: 'weekly' | 'monthly' | 'season';
    entryFee: number;
    currency: 'usd' | 'weparlay_cash' | 'pawn_coin';
    payoutStructure: Array<{ rank: number; percentage: number }>;
  }): Promise<FantasyBettingPool> {
    const poolId = `pool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const pool: FantasyBettingPool = {
      poolId,
      leagueId,
      platform,
      poolType: poolConfig.poolType,
      entryFee: poolConfig.entryFee,
      currency: poolConfig.currency,
      totalPot: 0,
      participants: [],
      payoutStructure: poolConfig.payoutStructure.map(p => ({
        ...p,
        amount: 0 // Will be calculated when pool fills
      })),
      status: 'open',
      startTime: this.calculateStartTime(poolConfig.poolType),
      endTime: this.calculateEndTime(poolConfig.poolType)
    };

    this.bettingPools.set(poolId, pool);
    return pool;
  }

  /**
   * Join betting pool
   */
  async joinBettingPool(poolId: string, userId: string, userDetails: {
    username: string;
    teamName: string;
  }): Promise<{ success: boolean; message: string }> {
    const pool = this.bettingPools.get(poolId);
    if (!pool) {
      return { success: false, message: 'Pool not found' };
    }

    if (pool.status !== 'open') {
      return { success: false, message: 'Pool is no longer accepting entries' };
    }

    // Check if user already joined
    if (pool.participants.some(p => p.userId === userId)) {
      return { success: false, message: 'Already joined this pool' };
    }

    // Process entry fee (integrate with WeParlay payment system)
    const paymentResult = await this.processPoolEntry(userId, pool.entryFee, pool.currency);
    if (!paymentResult.success) {
      return { success: false, message: 'Payment failed' };
    }

    pool.participants.push({
      userId,
      username: userDetails.username,
      entryTime: new Date(),
      teamName: userDetails.teamName,
      currentRank: pool.participants.length + 1
    });

    pool.totalPot += pool.entryFee;
    this.updatePayoutAmounts(pool);

    return { success: true, message: 'Successfully joined pool' };
  }

  /**
   * Create fantasy tournament
   */
  async createTournament(tournamentConfig: {
    name: string;
    description: string;
    format: 'single_elimination' | 'round_robin' | 'points_based';
    entryFee: number;
    currency: 'usd' | 'weparlay_cash' | 'pawn_coin';
    maxParticipants: number;
    startDate: Date;
    endDate: Date;
    rules: string[];
  }): Promise<FantasyTournament> {
    const tournamentId = `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const tournament: FantasyTournament = {
      tournamentId,
      name: tournamentConfig.name,
      description: tournamentConfig.description,
      format: tournamentConfig.format,
      entryFee: tournamentConfig.entryFee,
      currency: tournamentConfig.currency,
      maxParticipants: tournamentConfig.maxParticipants,
      currentParticipants: 0,
      prizePool: 0,
      bracket: this.initializeBracket(tournamentConfig.format, tournamentConfig.maxParticipants),
      rules: tournamentConfig.rules,
      startDate: tournamentConfig.startDate,
      endDate: tournamentConfig.endDate,
      status: 'registration',
      sponsors: []
    };

    this.tournaments.set(tournamentId, tournament);
    return tournament;
  }

  /**
   * Generate social feed for league
   */
  async generateSocialFeed(leagueId: string, limit: number = 20): Promise<SocialFeed[]> {
    const feed = this.socialFeeds.get(leagueId) || [];
    
    // Add automated posts for significant events
    await this.addAutomatedPosts(leagueId);
    
    return feed
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Create social post
   */
  async createSocialPost(userId: string, postData: {
    leagueId?: string;
    postType: 'trade_analysis' | 'lineup_share' | 'trash_talk' | 'injury_update' | 'sleeper_pick';
    content: string;
    media?: string[];
    tags?: string[];
    mentions?: string[];
  }): Promise<SocialFeed> {
    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userDetails = await this.getUserDetails(userId);

    const post: SocialFeed = {
      postId,
      userId,
      username: userDetails.username,
      avatar: userDetails.avatar,
      postType: postData.postType,
      content: postData.content,
      media: postData.media || [],
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: new Date(),
      leagueId: postData.leagueId,
      tags: postData.tags || [],
      mentions: postData.mentions || []
    };

    if (postData.leagueId) {
      const feed = this.socialFeeds.get(postData.leagueId) || [];
      feed.push(post);
      this.socialFeeds.set(postData.leagueId, feed);
    }

    return post;
  }

  /**
   * Analyze trade proposal
   */
  async analyzeTrade(tradeData: {
    fromUserId: string;
    toUserId: string;
    fromAssets: string[];
    toAssets: string[];
  }): Promise<TradeAnalyzer> {
    const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fromAssetsAnalysis = await Promise.all(
      tradeData.fromAssets.map(playerId => this.getPlayerTradeValue(playerId))
    );
    
    const toAssetsAnalysis = await Promise.all(
      tradeData.toAssets.map(playerId => this.getPlayerTradeValue(playerId))
    );

    const fromValue = fromAssetsAnalysis.reduce((sum, player) => sum + player.currentValue, 0);
    const toValue = toAssetsAnalysis.reduce((sum, player) => sum + player.currentValue, 0);
    const valueDiscrepancy = Math.abs(fromValue - toValue);
    const fairnessScore = Math.max(0, 100 - (valueDiscrepancy / Math.max(fromValue, toValue)) * 100);

    return {
      tradeId,
      fromUserId: tradeData.fromUserId,
      toUserId: tradeData.toUserId,
      fromAssets: fromAssetsAnalysis,
      toAssets: toAssetsAnalysis,
      fairnessScore,
      winnerProjection: fromValue > toValue ? 'team_a' : toValue > fromValue ? 'team_b' : 'fair',
      analysis: {
        positionalNeeds: await this.analyzePositionalNeeds(tradeData.fromUserId, tradeData.toUserId),
        valueDiscrepancy,
        riskAssessment: this.assessTradeRisk(fromAssetsAnalysis, toAssetsAnalysis),
        recommendation: fairnessScore > 80 ? 'accept' : fairnessScore > 60 ? 'counter' : 'decline'
      }
    };
  }

  /**
   * Get expert picks and analysis
   */
  async getExpertPicks(): Promise<ExpertPicks[]> {
    const experts = Array.from(this.expertPicks.values());
    return experts.sort((a, b) => b.credibility - a.credibility);
  }

  /**
   * Process head-to-head fantasy matchup betting
   */
  async createHeadToHeadBet(betData: {
    leagueId: string;
    week: number;
    team1UserId: string;
    team2UserId: string;
    betAmount: number;
    currency: 'usd' | 'weparlay_cash' | 'pawn_coin';
    betType: 'spread' | 'total' | 'moneyline';
    line?: number;
  }): Promise<{ success: boolean; betId?: string; message: string }> {
    // Integrate with existing WeParlay betting system
    const betId = `h2h_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get team projections
    const team1Projection = await this.getTeamProjection(betData.team1UserId, betData.week);
    const team2Projection = await this.getTeamProjection(betData.team2UserId, betData.week);
    
    // Calculate odds based on projections
    const odds = this.calculateHeadToHeadOdds(team1Projection, team2Projection, betData.betType, betData.line);
    
    return {
      success: true,
      betId,
      message: 'Head-to-head bet created successfully'
    };
  }

  // Private helper methods
  private calculateStartTime(poolType: string): Date {
    const now = new Date();
    switch (poolType) {
      case 'weekly':
        // Start on Thursday (NFL week starts)
        const daysUntilThursday = (4 - now.getDay() + 7) % 7;
        return new Date(now.getTime() + daysUntilThursday * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
      case 'season':
        return new Date(now.getFullYear(), 8, 1); // September 1st
      default:
        return now;
    }
  }

  private calculateEndTime(poolType: string): Date {
    const startTime = this.calculateStartTime(poolType);
    switch (poolType) {
      case 'weekly':
        return new Date(startTime.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 days
      case 'monthly':
        return new Date(startTime.getFullYear(), startTime.getMonth() + 1, 0);
      case 'season':
        return new Date(startTime.getFullYear() + 1, 0, 31); // January 31st
      default:
        return new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  private async processPoolEntry(userId: string, amount: number, currency: string): Promise<{ success: boolean }> {
    // Integrate with WeParlay payment processing
    return { success: true };
  }

  private updatePayoutAmounts(pool: FantasyBettingPool): void {
    pool.payoutStructure.forEach(payout => {
      payout.amount = (pool.totalPot * payout.percentage) / 100;
    });
  }

  private initializeBracket(format: string, maxParticipants: number): any {
    return {
      format,
      rounds: [],
      currentRound: 0,
      participants: []
    };
  }

  private async addAutomatedPosts(leagueId: string): Promise<void> {
    // Add posts for major events like injuries, trades, etc.
  }

  private async getUserDetails(userId: string): Promise<{ username: string; avatar: string }> {
    return {
      username: 'User',
      avatar: '/default-avatar.png'
    };
  }

  private async getPlayerTradeValue(playerId: string): Promise<any> {
    return {
      playerId,
      playerName: 'Player Name',
      position: 'RB',
      team: 'NFL',
      currentValue: 85,
      projectedValue: 88
    };
  }

  private async analyzePositionalNeeds(userId1: string, userId2: string): Promise<string[]> {
    return ['RB depth', 'WR1'];
  }

  private assessTradeRisk(fromAssets: any[], toAssets: any[]): string {
    return 'Medium risk due to injury concerns';
  }

  private async getTeamProjection(userId: string, week: number): Promise<number> {
    return 125.5;
  }

  private calculateHeadToHeadOdds(team1Proj: number, team2Proj: number, betType: string, line?: number): any {
    return {
      team1Odds: -110,
      team2Odds: -110,
      projectedSpread: team1Proj - team2Proj
    };
  }
}

export const fantasySocialEngine = new FantasySocialEngine();

// API Routes
export async function createBettingPool(req: Request, res: Response) {
  try {
    const { leagueId, platform, poolConfig } = req.body;
    const pool = await fantasySocialEngine.createBettingPool(leagueId, platform, poolConfig);
    res.json({ success: true, data: pool });
  } catch (error) {
    console.error('Betting pool creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create betting pool' });
  }
}

export async function joinBettingPool(req: Request, res: Response) {
  try {
    const { poolId } = req.params;
    const { userId, userDetails } = req.body;
    const result = await fantasySocialEngine.joinBettingPool(poolId, userId, userDetails);
    res.json(result);
  } catch (error) {
    console.error('Join betting pool error:', error);
    res.status(500).json({ success: false, error: 'Failed to join betting pool' });
  }
}

export async function createTournament(req: Request, res: Response) {
  try {
    const tournament = await fantasySocialEngine.createTournament(req.body);
    res.json({ success: true, data: tournament });
  } catch (error) {
    console.error('Tournament creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create tournament' });
  }
}

export async function getSocialFeed(req: Request, res: Response) {
  try {
    const { leagueId } = req.params;
    const { limit } = req.query;
    const feed = await fantasySocialEngine.generateSocialFeed(leagueId, Number(limit) || 20);
    res.json({ success: true, data: feed });
  } catch (error) {
    console.error('Social feed error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate social feed' });
  }
}

export async function createSocialPost(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const post = await fantasySocialEngine.createSocialPost(userId, req.body);
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Social post creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create social post' });
  }
}

export async function analyzeTrade(req: Request, res: Response) {
  try {
    const analysis = await fantasySocialEngine.analyzeTrade(req.body);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Trade analysis error:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze trade' });
  }
}

export async function getExpertPicks(req: Request, res: Response) {
  try {
    const picks = await fantasySocialEngine.getExpertPicks();
    res.json({ success: true, data: picks });
  } catch (error) {
    console.error('Expert picks error:', error);
    res.status(500).json({ success: false, error: 'Failed to get expert picks' });
  }
}

export async function createHeadToHeadBet(req: Request, res: Response) {
  try {
    const result = await fantasySocialEngine.createHeadToHeadBet(req.body);
    res.json(result);
  } catch (error) {
    console.error('Head-to-head bet error:', error);
    res.status(500).json({ success: false, error: 'Failed to create head-to-head bet' });
  }
}