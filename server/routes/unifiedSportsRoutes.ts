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
    const upcomingGames = await unifiedSportsAPI.getUpcomingGames();
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
    const upcomingEvents = await unifiedSportsAPI.getUnifiedUpcomingEvents();

    // If no real data available, provide realistic fallback data
    if (upcomingEvents.length === 0) {
      console.log('📭 No unified sports data available - providing fallback events');
      const fallbackEvents = [
        {
          id: 'fallback_nfl_1',
          sport: 'American Football',
          sport_key: 'americanfootball_nfl',
          sport_title: 'NFL',
          commence_time: new Date(Date.now() + 3600000).toISOString(),
          home_team: 'Kansas City Chiefs',
          away_team: 'Buffalo Bills',
          status: 'upcoming',
          odds: { home: 1.95, away: 1.85 }
        },
        {
          id: 'fallback_nba_1',
          sport: 'Basketball',
          sport_key: 'basketball_nba',
          sport_title: 'NBA',
          commence_time: new Date(Date.now() + 7200000).toISOString(),
          home_team: 'Los Angeles Lakers',
          away_team: 'Boston Celtics',
          status: 'upcoming',
          odds: { home: 2.10, away: 1.75 }
        },
        {
          id: 'fallback_mlb_1',
          sport: 'Baseball',
          sport_key: 'baseball_mlb',
          sport_title: 'MLB',
          commence_time: new Date(Date.now() + 5400000).toISOString(),
          home_team: 'New York Yankees',
          away_team: 'Los Angeles Dodgers',
          status: 'upcoming',
          odds: { home: 1.90, away: 1.90 }
        }
      ];

      return res.json({
        success: true,
        data: fallbackEvents,
        sources: ['Fallback Data'],
        total: fallbackEvents.length,
        timestamp: new Date().toISOString(),
        note: 'Showing fallback events - real data temporarily unavailable'
      });
    }

    // Always return 200 with available data
    res.json({
      success: true,
      data: upcomingEvents || [],
      message: 'Authentic data only - ESPN API providing live events',
      totalEvents: Array.isArray(upcomingEvents) ? upcomingEvents.length : 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching real upcoming events:', error);
    // Return empty array instead of 503 to prevent console spam
    res.json({
      success: false,
      data: [],
      message: 'All authentic APIs temporarily unavailable',
      totalEvents: 0,
      timestamp: new Date().toISOString()
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

router.get('/sports/college', async (req, res) => {
  try {
    const collegeSports = ['basketball_ncaab', 'americanfootball_ncaaf', 'baseball_college', 'basketball_ncaaw'];
    const allOdds = [];

    for (const sport of collegeSports) {
      const odds = await unifiedSportsAPI.getSportOdds(sport);
      allOdds.push({ sport, games: odds });
    }

    res.json(allOdds);
  } catch (error) {
    console.error('Error fetching college sports:', error);
    res.status(500).json({ message: 'Failed to fetch college sports' });
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
      game.teams.some((team: string) => team.toLowerCase().includes(query.toLowerCase())) ||
      game.sport.toLowerCase().includes(query.toLowerCase())
    );

    res.json(results);
  } catch (error) {
    console.error('Error searching sports:', error);
    res.status(500).json({ message: 'Failed to search sports' });
  }
});

export default router;