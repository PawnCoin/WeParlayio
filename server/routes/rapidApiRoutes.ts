import { Router } from 'express';
import { comprehensiveRapidApi } from '../services/comprehensiveRapidApi';

const router = Router();

// RapidAPI comprehensive sports data endpoint
router.get('/comprehensive', async (req, res) => {
  try {
    const comprehensiveData = await comprehensiveRapidApi.getAllSportsData();
    const status = await comprehensiveRapidApi.checkApiStatus();
    
    res.json({
      success: true,
      data: comprehensiveData,
      apiStatus: status,
      timestamp: new Date().toISOString(),
      totalEvents: Object.values(comprehensiveData).reduce((sum: number, events: any) => sum + events.length, 0)
    });
  } catch (error) {
    console.error('RapidAPI comprehensive error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comprehensive sports data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Tennis specific endpoint
router.get('/tennis', async (req, res) => {
  try {
    const tennisMatches = await comprehensiveRapidApi.getTennisMatches();
    console.log(`✅ Tennis API: ${tennisMatches.length} authentic matches retrieved`);
    
    res.json({
      success: true,
      sport: 'Tennis',
      matches: tennisMatches,
      count: tennisMatches.length,
      source: 'RapidAPI'
    });
  } catch (error) {
    console.error('Tennis API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tennis data'
    });
  }
});

// Golf specific endpoint
router.get('/golf', async (req, res) => {
  try {
    const golfTournaments = await comprehensiveRapidApi.getGolfTournaments();
    console.log(`✅ Golf API: ${golfTournaments.length} authentic tournaments retrieved`);
    
    res.json({
      success: true,
      sport: 'Golf',
      tournaments: golfTournaments,
      count: golfTournaments.length,
      source: 'RapidAPI'
    });
  } catch (error) {
    console.error('Golf API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch golf data'
    });
  }
});

// Basketball specific endpoint
router.get('/basketball', async (req, res) => {
  try {
    const basketballGames = await comprehensiveRapidApi.getBasketballGames();
    console.log(`✅ Basketball API: ${basketballGames.length} games retrieved`);
    
    res.json({
      success: true,
      sport: 'Basketball',
      games: basketballGames,
      count: basketballGames.length,
      source: 'RapidAPI'
    });
  } catch (error) {
    console.error('Basketball API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch basketball data'
    });
  }
});

// Football specific endpoint
router.get('/football', async (req, res) => {
  try {
    const footballFixtures = await comprehensiveRapidApi.getFootballFixtures();
    console.log(`✅ Football API: ${footballFixtures.length} fixtures retrieved`);
    
    res.json({
      success: true,
      sport: 'Football',
      fixtures: footballFixtures,
      count: footballFixtures.length,
      source: 'RapidAPI'
    });
  } catch (error) {
    console.error('Football API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch football data'
    });
  }
});

// Baseball specific endpoint
router.get('/baseball', async (req, res) => {
  try {
    const baseballGames = await comprehensiveRapidApi.getBaseballGames();
    console.log(`✅ Baseball API: ${baseballGames.length} games retrieved`);
    
    res.json({
      success: true,
      sport: 'Baseball',
      games: baseballGames,
      count: baseballGames.length,
      source: 'RapidAPI'
    });
  } catch (error) {
    console.error('Baseball API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch baseball data'
    });
  }
});

// Hockey specific endpoint
router.get('/hockey', async (req, res) => {
  try {
    const hockeyGames = await comprehensiveRapidApi.getHockeyGames();
    console.log(`✅ Hockey API: ${hockeyGames.length} games retrieved`);
    
    res.json({
      success: true,
      sport: 'Hockey',
      games: hockeyGames,
      count: hockeyGames.length,
      source: 'RapidAPI'
    });
  } catch (error) {
    console.error('Hockey API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hockey data'
    });
  }
});

// API Status endpoint
router.get('/status', async (req, res) => {
  try {
    const status = await comprehensiveRapidApi.checkApiStatus();
    
    res.json({
      success: true,
      apiStatus: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('RapidAPI status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check API status'
    });
  }
});

export default router;