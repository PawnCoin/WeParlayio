import { Router } from 'express';
import { UnifiedSportsApiService } from '../services/unifiedSportsApiService';

const router = Router();
const unifiedSportsAPI = new UnifiedSportsApiService();

// Get all sports odds from multiple sources
router.get('/odds/all', async (req, res) => {
  try {
    const allOdds = await unifiedSportsAPI.getAllSportsOdds();
    res.json(allOdds);
  } catch (error) {
    console.error('Error fetching all sports odds:', error);
    res.status(500).json({ message: 'Failed to fetch sports odds' });
  }
});

// Get odds for specific sport
router.get('/odds/:sport', async (req, res) => {
  try {
    const { sport } = req.params;
    const odds = await unifiedSportsAPI.getSportOdds(sport);
    res.json(odds);
  } catch (error) {
    console.error(`Error fetching odds for ${req.params.sport}:`, error);
    res.status(500).json({ message: 'Failed to fetch sport odds' });
  }
});

// Get live games across all sports
router.get('/live', async (req, res) => {
  try {
    const liveGames = await unifiedSportsAPI.getLiveGames();
    res.json(liveGames);
  } catch (error) {
    console.error('Error fetching live games:', error);
    res.status(500).json({ message: 'Failed to fetch live games' });
  }
});

// Get upcoming games
router.get('/upcoming/:hours?', async (req, res) => {
  try {
    const hours = parseInt(req.params.hours || '24');
    const upcomingGames = await unifiedSportsAPI.getUpcomingGames(hours);
    res.json(upcomingGames);
  } catch (error) {
    console.error('Error fetching upcoming games:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming games' });
  }
});

// Get upcoming events (alternative endpoint for frontend compatibility)
router.get('/upcoming-events', async (req, res) => {
  try {
    const { sport } = req.query;
    const upcomingEvents = await unifiedSportsAPI.getRealSportsData(sport as string);

    if (!upcomingEvents.authentic) {
      return res.status(503).json({ 
        error: 'Only authentic data provided - no synthetic data available',
        availableApis: unifiedSportsAPI.getApiStatus()
      });
    }

    res.json(upcomingEvents);
  } catch (error) {
    console.error('Error fetching real upcoming events:', error);
    res.status(503).json({ 
      error: 'All real APIs unavailable - no fallback data provided',
      apiStatus: unifiedSportsAPI.getApiStatus()
    });
  }
});

// Get best odds for a specific game
router.get('/best-odds/:sport/:teams', async (req, res) => {
  try {
    const { sport, teams } = req.params;
    const sportOdds = await unifiedSportsAPI.getSportOdds(sport);
    const gameOdds = sportOdds.find(game => 
      game.event.toLowerCase().includes(teams.toLowerCase())
    );

    if (!gameOdds) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const bestOdds = unifiedSportsAPI.getBestOdds(gameOdds);
    res.json({ game: gameOdds, bestOdds });
  } catch (error) {
    console.error('Error finding best odds:', error);
    res.status(500).json({ message: 'Failed to find best odds' });
  }
});

// Get API status and availability
router.get('/status', async (req, res) => {
  try {
    const status = unifiedSportsAPI.getAPIStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting API status:', error);
    res.status(500).json({ message: 'Failed to get API status' });
  }
});

// Get sports by category
router.get('/sports/american', async (req, res) => {
  try {
    const americanSports = ['americanfootball_nfl', 'basketball_nba', 'baseball_mlb', 'icehockey_nhl'];
    const allOdds = [];

    for (const sport of americanSports) {
      const odds = await unifiedSportsAPI.getSportOdds(sport);
      allOdds.push({ sport, games: odds });
    }

    res.json(allOdds);
  } catch (error) {
    console.error('Error fetching American sports:', error);
    res.status(500).json({ message: 'Failed to fetch American sports' });
  }
});

router.get('/sports/international', async (req, res) => {
  try {
    const internationalSports = ['soccer_epl', 'tennis_wta', 'tennis_atp'];
    const allOdds = [];

    for (const sport of internationalSports) {
      const odds = await unifiedSportsAPI.getSportOdds(sport);
      allOdds.push({ sport, games: odds });
    }

    res.json(allOdds);
  } catch (error) {
    console.error('Error fetching international sports:', error);
    res.status(500).json({ message: 'Failed to fetch international sports' });
  }
});

router.get('/sports/combat', async (req, res) => {
  try {
    const combatSports = ['mma_mixed_martial_arts', 'boxing_heavyweight'];
    const allOdds = [];

    for (const sport of combatSports) {
      const odds = await unifiedSportsAPI.getSportOdds(sport);
      allOdds.push({ sport, games: odds });
    }

    res.json(allOdds);
  } catch (error) {
    console.error('Error fetching combat sports:', error);
    res.status(500).json({ message: 'Failed to fetch combat sports' });
  }
});

// Get popular betting markets
router.get('/markets/popular', async (req, res) => {
  try {
    const popularSports = ['americanfootball_nfl', 'basketball_nba', 'soccer_epl', 'tennis_wta'];
    const popularGames = [];

    for (const sport of popularSports) {
      const odds = await unifiedSportsAPI.getSportOdds(sport);
      const upcoming = odds.filter(game => !game.live).slice(0, 3);
      popularGames.push(...upcoming);
    }

    // Sort by start time
    popularGames.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    res.json(popularGames.slice(0, 10));
  } catch (error) {
    console.error('Error fetching popular markets:', error);
    res.status(500).json({ message: 'Failed to fetch popular markets' });
  }
});

// Search for specific teams or events
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const allOdds = await unifiedSportsAPI.getAllSportsOdds();

    const results = allOdds.filter(game => 
      game.event.toLowerCase().includes(query.toLowerCase()) ||
      game.teams.some(team => team.toLowerCase().includes(query.toLowerCase())) ||
      game.sport.toLowerCase().includes(query.toLowerCase())
    );

    res.json(results);
  } catch (error) {
    console.error('Error searching sports:', error);
    res.status(500).json({ message: 'Failed to search sports' });
  }
});

export default router;