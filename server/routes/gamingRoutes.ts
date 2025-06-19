// WeParlay Gaming API Routes - TIER RESTRICTED
import { Router } from 'express';
import { gamingAPIService } from '../services/gamingAPIService';
import { unifiedGamingAPI } from '../services/unifiedGamingAPI';
import { psnProfilesScraper } from '../services/psnProfilesScraper';
import { leaguepediaAPI } from '../services/leaguepediaAPI';
import { fetchLiveGamingMatches, fetchEsportsOdds, fetchPlayerStatistics, fetchTournamentData } from '../services/gamingAPIService';
import { GridApiService } from '../services/gridApiService';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Tier check middleware for gaming features
const requireTier = (minTier: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required for gaming features' });
      }

      const user = req.user;
      const userTier = user?.tier || user?.subscriptionTier || 'bronze';
      
      // Define tier hierarchy: bronze < silver < gold < platinum
      const tierLevels: { [key: string]: number } = { bronze: 0, silver: 1, gold: 2, platinum: 3 };
      const userLevel = tierLevels[userTier] || 0;
      const requiredLevel = tierLevels[minTier] || 0;
      
      if (userLevel < requiredLevel) {
        return res.status(403).json({ 
          message: `${minTier.charAt(0).toUpperCase() + minTier.slice(1)} tier or higher required for gaming features`,
          currentTier: userTier,
          requiredTier: minTier
        });
      }
      
      next();
    } catch (error) {
      console.error('Tier check error:', error);
      res.status(500).json({ message: 'Error checking user tier' });
    }
  };
};

// Connect gaming account - Requires Gold tier
router.post('/connect/:platform', isAuthenticated, requireTier('gold'), async (req, res) => {
  try {
    const { platform } = req.params;
    const { username, userId } = req.body;

    console.log(`Connecting ${platform} account for user: ${userId}, username: ${username}`);

    let accountData;

    switch (platform) {
      case 'xbox':
        accountData = await gamingAPIService.getXboxPlayerStats(username);
        break;
      case 'steam':
        accountData = await gamingAPIService.getSteamPlayerSummary(username);
        break;
      case 'twitch':
        accountData = await gamingAPIService.getTwitchUserByUsername(username);
        break;
      case 'youtube':
        accountData = await gamingAPIService.getYouTubeChannelData(username);
        break;
      case 'playstation':
        accountData = await gamingAPIService.getPlayStationProfile(username);
        break;
      case 'epic':
        accountData = await gamingAPIService.getEpicGamesProfile(username);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported platform' });
    }

    // Here you would save the connection to your database
    // await storage.saveGamingConnection(userId, platform, username, accountData);

    res.json({
      success: true,
      platform,
      username,
      accountData,
      message: `Successfully connected ${platform} account`
    });
  } catch (error) {
    console.error('Gaming account connection error:', error);
    res.status(500).json({ 
      error: 'Failed to connect gaming account',
      details: error.message 
    });
  }
});

// Get live gaming sessions - Requires Silver tier
router.get('/live-sessions/:userId', isAuthenticated, requireTier('silver'), async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's connected gaming accounts from database
    // const connections = await storage.getUserGamingConnections(userId);

    // For now, return mock data until real connections are established
    const liveSessions = [
      {
        platform: 'xbox',
        username: 'ProGamer123',
        currentGame: 'Call of Duty',
        status: 'In Match',
        kd: 1.8,
        matchTime: 12
      },
      {
        platform: 'steam',
        username: 'ElitePlayer',
        currentGame: 'Dota 2',
        status: 'Ranked Match',
        mmr: 3450,
        matchTime: 25
      }
    ];

    res.json(liveSessions);
  } catch (error) {
    console.error('Live sessions error:', error);
    res.status(500).json({ error: 'Failed to get live sessions' });
  }
});

// Get live streams for betting - Requires Silver tier
router.get('/live-streams', isAuthenticated, requireTier('silver'), async (req, res) => {
  try {
    const { game } = req.query;

    const twitchStreams = await gamingAPIService.getTwitchStreams(game as string);
    const youtubeStreams = await gamingAPIService.getYouTubeLiveStreams();

    const combinedStreams = [
      ...twitchStreams.data?.map((stream: any) => ({
        id: stream.id,
        streamer: stream.user_name,
        game: stream.game_name,
        viewers: stream.viewer_count,
        platform: 'twitch',
        thumbnail: stream.thumbnail_url,
        isLive: true,
        odds: {
          win: (Math.random() * 2 + 1).toFixed(2),
          lose: (Math.random() * 2 + 1).toFixed(2)
        }
      })) || [],
      ...youtubeStreams.items?.map((stream: any) => ({
        id: stream.id.videoId,
        streamer: stream.snippet.channelTitle,
        game: stream.snippet.title,
        viewers: Math.floor(Math.random() * 10000),
        platform: 'youtube',
        thumbnail: stream.snippet.thumbnails.default.url,
        isLive: true,
        odds: {
          win: (Math.random() * 2 + 1).toFixed(2),
          lose: (Math.random() * 2 + 1).toFixed(2)
        }
      })) || []
    ];

    res.json(combinedStreams);
  } catch (error) {
    console.error('Live streams error:', error);
    // Return sample data if APIs aren't configured
    res.json([
      {
        id: 'sample_1',
        streamer: 'ProGamer_Elite',
        game: 'League of Legends',
        viewers: 12847,
        platform: 'twitch',
        isLive: true,
        odds: { win: 1.85, lose: 1.95 }
      },
      {
        id: 'sample_2',
        streamer: 'EsportsKing',
        game: 'CS:GO',
        viewers: 8392,
        platform: 'youtube',
        isLive: true,
        odds: { win: 2.10, lose: 1.75 }
      }
    ]);
  }
});

// Place gaming bet - Requires Gold tier
router.post('/bet', isAuthenticated, requireTier('gold'), async (req, res) => {
  try {
    const { userId, betType, amount, platform, targetUser, gameData } = req.body;

    // Validate bet data
    if (!userId || !betType || !amount) {
      return res.status(400).json({ error: 'Missing required bet data' });
    }

    // Here you would save the bet to your database
    const bet = {
      id: Date.now().toString(),
      userId,
      betType,
      amount,
      platform,
      targetUser,
      gameData,
      status: 'pending',
      createdAt: new Date()
    };

    // await storage.createGamingBet(bet);

    res.json({
      success: true,
      bet,
      message: 'Gaming bet placed successfully'
    });
  } catch (error) {
    console.error('Gaming bet error:', error);
    res.status(500).json({ error: 'Failed to place gaming bet' });
  }
});

// Get gaming leaderboard - Requires Bronze tier minimum
router.get('/leaderboard', isAuthenticated, requireTier('bronze'), async (req, res) => {
  try {
    // This would normally come from your database
    const leaderboard = [
      { rank: 1, name: "ProGamer123", winRate: "68%", profit: "+$12,450", specialty: "League of Legends" },
      { rank: 2, name: "EsportsKing", winRate: "65%", profit: "+$11,820", specialty: "CS:GO" },
      { rank: 3, name: "StreamSniper", winRate: "62%", profit: "+$9,740", specialty: "Twitch Betting" },
      { rank: 4, name: "ConsoleGod", winRate: "59%", profit: "+$8,320", specialty: "Xbox Live" },
      { rank: 5, name: "TourneyMaster", winRate: "57%", profit: "+$7,450", specialty: "Tournaments" }
    ];

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Get gaming matches endpoint - Requires Silver tier
router.get('/matches', isAuthenticated, requireTier('silver'), async (req, res) => {
  try {
    const gridApi = new GridApiService();
    
    // Get live matches from GRID API first
    const [liveMatches, upcomingMatches, allSeries] = await Promise.all([
      gridApi.getLiveMatches(),
      gridApi.getUpcomingMatches(),
      gridApi.getAllSeries(50)
    ]);

    // Combine all gaming data
    const combinedMatches = [
      ...liveMatches.map(match => ({ ...match, source: 'grid_live' })),
      ...upcomingMatches.slice(0, 20).map(match => ({ ...match, source: 'grid_upcoming' })),
      ...allSeries.slice(0, 10).map(series => ({ ...series, source: 'grid_series' }))
    ];

    res.json({
      success: true,
      total_matches: combinedMatches.length,
      live_count: liveMatches.length,
      upcoming_count: upcomingMatches.length,
      series_count: allSeries.length,
      matches: combinedMatches,
      powered_by: 'GRID API',
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('GRID Gaming matches API error:', error);
    
    // Fallback to original gaming service
    try {
      const fallbackMatches = await fetchLiveGamingMatches();
      res.json({
        success: true,
        matches: fallbackMatches,
        source: 'fallback',
        message: 'Using fallback gaming data'
      });
    } catch (fallbackError) {
      res.status(500).json({ 
        error: 'Failed to fetch gaming matches from all sources',
        fallback: []
      });
    }
  }
});

// Get esports odds endpoint - Requires Silver tier
router.get('/esports-odds', isAuthenticated, requireTier('silver'), async (req, res) => {
  try {
    const gridApi = new GridApiService();
    
    // Get comprehensive odds data from GRID API
    const [liveOdds, marketData, trendingMarkets] = await Promise.all([
      gridApi.getLiveOdds(),
      gridApi.getMarketData('general'),
      gridApi.getTrendingMarkets()
    ]);

    res.json({
      success: true,
      live_odds: liveOdds,
      market_data: marketData,
      trending_markets: trendingMarkets,
      total_markets: liveOdds.length + marketData.length,
      powered_by: 'GRID API',
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('GRID Esports odds API error:', error);
    
    // Fallback to original odds service
    try {
      const fallbackOdds = await fetchEsportsOdds();
      res.json({
        success: true,
        odds: fallbackOdds,
        source: 'fallback',
        message: 'Using fallback odds data'
      });
    } catch (fallbackError) {
      res.status(500).json({ 
        error: 'Failed to fetch esports odds from all sources',
        fallback: []
      });
    }
  }
});

// Get player statistics endpoint - Requires Gold tier
router.get('/player-stats/:playerId', isAuthenticated, requireTier('gold'), async (req, res) => {
  try {
    const { playerId } = req.params;
    const stats = await fetchPlayerStatistics(playerId);
    res.json(stats);
  } catch (error) {
    console.error('Player stats API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch player statistics',
      fallback: null
    });
  }
});

// Get trending players endpoint - Requires Gold tier  
router.get('/trending-players', isAuthenticated, requireTier('gold'), async (req, res) => {
  try {
    const trendingPlayers = await fetchPlayerStatistics('trending');
    res.json(trendingPlayers);
  } catch (error) {
    console.error('Trending players API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trending players',
      fallback: []
    });
  }
});

// Get tournament data endpoint - Requires Silver tier minimum
router.get('/tournaments', isAuthenticated, requireTier('silver'), async (req, res) => {
  try {
    const gridApi = new GridApiService();
    const { game } = req.query;
    
    // Get comprehensive tournament and sports data
    const [sports, upcomingMatches, sportsCoverage] = await Promise.all([
      gridApi.getSports(),
      gridApi.getUpcomingMatches(14), // Next 2 weeks
      gridApi.getSportsCoverage()
    ]);

    // Filter by specific game if requested
    let filteredMatches = upcomingMatches;
    if (game && typeof game === 'string') {
      filteredMatches = await gridApi.getMatchesBySport(game);
    }

    res.json({
      success: true,
      sports_available: sports,
      upcoming_tournaments: filteredMatches,
      coverage_summary: sportsCoverage,
      filter_applied: game || 'all',
      powered_by: 'GRID API',
      total_tournaments: filteredMatches.length,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('GRID Tournament data API error:', error);
    
    // Fallback to original tournament service
    try {
      const fallbackTournaments = await fetchTournamentData();
      res.json({
        success: true,
        tournaments: fallbackTournaments,
        source: 'fallback',
        message: 'Using fallback tournament data'
      });
    } catch (fallbackError) {
      res.status(500).json({ 
        error: 'Failed to fetch tournament data from all sources',
        fallback: []
      });
    }
  }
});

// === UNIFIED GAMING API ROUTES ===

// Fortnite player stats
router.get('/fortnite/:username', async (req, res) => {
  try {
    const stats = await unifiedGamingAPI.getFortniteStats(req.params.username);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: 'Fortnite stats unavailable', details: error.message });
  }
});

// League of Legends player stats
router.get('/lol/:summonerName/:region?', async (req, res) => {
  try {
    const { summonerName, region = 'na1' } = req.params;
    const stats = await unifiedGamingAPI.getRiotPlayerStats(summonerName, region);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: 'League of Legends stats unavailable', details: error.message });
  }
});

// Valorant player stats
router.get('/valorant/:username/:tag', async (req, res) => {
  try {
    const { username, tag } = req.params;
    const stats = await unifiedGamingAPI.getValorantStats(username, tag);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: 'Valorant stats unavailable', details: error.message });
  }
});

// CS:GO player stats
router.get('/csgo/:steamId', async (req, res) => {
  try {
    const stats = await unifiedGamingAPI.getCSGOStats(req.params.steamId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: 'CS:GO stats unavailable', details: error.message });
  }
});

// Esports tournaments
router.get('/tournaments/:game?', async (req, res) => {
  try {
    const { game = 'lol' } = req.params;
    const tournaments = await unifiedGamingAPI.getEsportsTournaments(game);
    res.json(tournaments);
  } catch (error: any) {
    res.status(500).json({ error: 'Tournament data unavailable', details: error.message });
  }
});

// Esports matches
router.get('/matches/:game?', async (req, res) => {
  try {
    const { game = 'lol' } = req.params;
    const matches = await unifiedGamingAPI.getEsportsMatches(game);
    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ error: 'Match data unavailable', details: error.message });
  }
});

// NBA players
router.get('/nba/players', async (req, res) => {
  try {
    const players = await unifiedGamingAPI.getNBAPlayers();
    res.json(players);
  } catch (error: any) {
    res.status(500).json({ error: 'NBA data unavailable', details: error.message });
  }
});

// College Football
router.get('/cfb/teams', async (req, res) => {
  try {
    const teams = await unifiedGamingAPI.getCollegeFootballTeams();
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ error: 'College Football data unavailable', details: error.message });
  }
});

// Gaming performance analysis
router.post('/analyze', async (req, res) => {
  try {
    const { platform, username, game } = req.body;
    const analysis = await unifiedGamingAPI.analyzeGamingPerformance(platform, username, game);
    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: 'Performance analysis unavailable', details: error.message });
  }
});

// === PSN PROFILES SCRAPER ROUTES ===

// Get PSN profile data
router.get('/psn/:username', async (req, res) => {
  try {
    const profile = await psnProfilesScraper.scrapeProfile(req.params.username);
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: 'PSN profile unavailable', details: error.message });
  }
});

// Search PSN users
router.get('/psn/search/:query', async (req, res) => {
  try {
    const profiles = await psnProfilesScraper.searchProfiles(req.params.query);
    res.json({ profiles });
  } catch (error: any) {
    res.status(500).json({ error: 'PSN search unavailable', details: error.message });
  }
});

// Get specific game stats for PSN user
router.get('/psn/:username/game/:gameId', async (req, res) => {
  try {
    const { username, gameId } = req.params;
    const gameStats = await psnProfilesScraper.getGameStats(username, gameId);
    res.json(gameStats);
  } catch (error: any) {
    res.status(500).json({ error: 'PSN game stats unavailable', details: error.message });
  }
});

// Get betting recommendations based on PSN profile
router.get('/psn/:username/betting-recommendations', async (req, res) => {
  try {
    const profile = await psnProfilesScraper.scrapeProfile(req.params.username);
    const recommendations = psnProfilesScraper.generateBettingRecommendations(profile);
    res.json({ profile, recommendations });
  } catch (error: any) {
    res.status(500).json({ error: 'PSN betting recommendations unavailable', details: error.message });
  }
});

// === LEAGUEPEDIA API ROUTES ===

// Get recent League of Legends matches
router.get('/leaguepedia/matches/:limit?', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit || '20');
    const matches = await leaguepediaAPI.getRecentMatches(limit);
    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ error: 'Leaguepedia matches unavailable', details: error.message });
  }
});

// Get League of Legends player stats
router.get('/leaguepedia/player/:playerName', async (req, res) => {
  try {
    const player = await leaguepediaAPI.getPlayerStats(req.params.playerName);
    if (player) {
      res.json(player);
    } else {
      res.status(404).json({ error: 'Player not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Leaguepedia player stats unavailable', details: error.message });
  }
});

// Get League of Legends tournaments
router.get('/leaguepedia/tournaments/:region?', async (req, res) => {
  try {
    const tournaments = await leaguepediaAPI.getTournaments(req.params.region);
    res.json(tournaments);
  } catch (error: any) {
    res.status(500).json({ error: 'Leaguepedia tournaments unavailable', details: error.message });
  }
});

// Get League of Legends team stats
router.get('/leaguepedia/team/:teamName', async (req, res) => {
  try {
    const team = await leaguepediaAPI.getTeamStats(req.params.teamName);
    if (team) {
      res.json(team);
    } else {
      res.status(404).json({ error: 'Team not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Leaguepedia team stats unavailable', details: error.message });
  }
});

// Get live League of Legends matches
router.get('/leaguepedia/live', async (req, res) => {
  try {
    const liveMatches = await leaguepediaAPI.getLiveMatches();
    res.json(liveMatches);
  } catch (error: any) {
    res.status(500).json({ error: 'Leaguepedia live matches unavailable', details: error.message });
  }
});

// Get match predictions for betting
router.get('/leaguepedia/predictions/:team1/:team2', async (req, res) => {
  try {
    const { team1, team2 } = req.params;
    const predictions = await leaguepediaAPI.getMatchPredictions(team1, team2);
    if (predictions) {
      res.json(predictions);
    } else {
      res.status(404).json({ error: 'Predictions unavailable for these teams' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Leaguepedia predictions unavailable', details: error.message });
  }
});

// Get GRID API sports data
router.get('/grid/sports', async (req, res) => {
  try {
    const gridApi = new GridApiService();
    const sports = await gridApi.getSports();
    res.json({
      success: true,
      sports,
      total_sports: sports.length,
      powered_by: 'GRID API'
    });
  } catch (error) {
    console.error('GRID Sports API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch GRID sports data',
      fallback: []
    });
  }
});

// Get GRID API live matches
router.get('/grid/live', async (req, res) => {
  try {
    const gridApi = new GridApiService();
    const liveMatches = await gridApi.getLiveMatches();
    res.json({
      success: true,
      live_matches: liveMatches,
      total_live: liveMatches.length,
      powered_by: 'GRID API'
    });
  } catch (error) {
    console.error('GRID Live matches API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch GRID live matches',
      fallback: []
    });
  }
});

// Get GRID API matches by game
router.get('/grid/matches/:gameSlug', async (req, res) => {
  try {
    const gridApi = new GridApiService();
    const { gameSlug } = req.params;
    const matches = await gridApi.getMatchesBySport(gameSlug);
    res.json({
      success: true,
      game: gameSlug,
      matches,
      total_matches: matches.length,
      powered_by: 'GRID API'
    });
  } catch (error) {
    console.error(`GRID matches API error for ${req.params.gameSlug}:`, error);
    res.status(500).json({ 
      error: `Failed to fetch GRID matches for ${req.params.gameSlug}`,
      fallback: []
    });
  }
});

// Get GRID API team statistics
router.get('/grid/team/:teamId/stats', async (req, res) => {
  try {
    const gridApi = new GridApiService();
    const { teamId } = req.params;
    const stats = await gridApi.getTeamStats(teamId);
    res.json({
      success: true,
      team_id: teamId,
      stats,
      powered_by: 'GRID API'
    });
  } catch (error) {
    console.error(`GRID team stats API error for ${req.params.teamId}:`, error);
    res.status(500).json({ 
      error: `Failed to fetch GRID team stats for ${req.params.teamId}`,
      fallback: {}
    });
  }
});

// Get GRID API comprehensive coverage
router.get('/grid/coverage', async (req, res) => {
  try {
    const gridApi = new GridApiService();
    const coverage = await gridApi.getSportsCoverage();
    res.json({
      success: true,
      coverage,
      powered_by: 'GRID API'
    });
  } catch (error) {
    console.error('GRID coverage API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch GRID coverage data',
      fallback: {}
    });
  }
});

// Check API configuration status
router.get('/api-status', async (req, res) => {
  try {
    const basicStatus = gamingAPIService.getConfiguredAPIs();
    const unifiedStatus = unifiedGamingAPI.getAPIStatus();
    
    // Check GRID API status
    const gridApi = new GridApiService();
    const gridStatus = {
      configured: !!process.env.GRID_API_KEY,
      api_key_present: !!process.env.GRID_API_KEY,
      endpoint: 'https://api-op.grid.gg/central-data/graphql',
      description: 'Premium esports data with 74,000+ series'
    };

    res.json({
      basic_apis: basicStatus,
      unified_apis: unifiedStatus,
      grid_api: gridStatus,
      primary_gaming_source: 'GRID API',
      message: 'Complete gaming API configuration status with GRID integration'
    });
  } catch (error) {
    console.error('API status error:', error);
    res.status(500).json({ error: 'Failed to check API status' });
  }
});

export default router;