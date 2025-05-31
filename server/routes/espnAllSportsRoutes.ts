
import express from 'express';
import { ESPNApiService, espnApiService } from '../services/espnApiService';

const router = express.Router();

// Get all supported sports
router.get('/sports', async (req, res) => {
  try {
    const stats = await espnApiService.getSportStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error getting sport statistics:', error);
    res.status(500).json({ error: 'Failed to fetch sport statistics' });
  }
});

// Get teams for specific sport
router.get('/teams/:sport', async (req, res) => {
  try {
    const { sport } = req.params;
    const teams = await espnApiService.getTeamsForSport(sport);
    
    res.json({
      sport,
      count: teams.length,
      teams
    });
  } catch (error) {
    console.error(`Error getting teams for ${req.params.sport}:`, error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get ALL teams from ALL sports
router.get('/teams-all', async (req, res) => {
  try {
    const allTeams = await espnApiService.getAllSportsTeams();
    
    const summary = {
      totalSports: Object.keys(allTeams).length,
      totalTeams: Object.values(allTeams).reduce((sum, teams) => sum + teams.length, 0),
      sportBreakdown: Object.entries(allTeams).map(([sport, teams]) => ({
        sport,
        teamCount: teams.length
      }))
    };
    
    res.json({
      summary,
      data: allTeams
    });
  } catch (error) {
    console.error('Error getting all teams:', error);
    res.status(500).json({ error: 'Failed to fetch all teams' });
  }
});

// Get roster for any sport/team
router.get('/roster/:sport/:teamId', async (req, res) => {
  try {
    const { sport, teamId } = req.params;
    const roster = await espnApiService.getRosterForAnySport(sport, teamId);
    
    res.json({
      sport,
      teamId,
      playerCount: roster.length,
      roster
    });
  } catch (error) {
    console.error(`Error getting roster for ${req.params.sport}/${req.params.teamId}:`, error);
    res.status(500).json({ error: 'Failed to fetch roster' });
  }
});

// Get live scores for any sport
router.get('/scores/:sport', async (req, res) => {
  try {
    const { sport } = req.params;
    const scores = await espnApiService.getLiveScoresForSport(sport);
    
    res.json({
      sport,
      gameCount: scores.length,
      scores
    });
  } catch (error) {
    console.error(`Error getting scores for ${req.params.sport}:`, error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

// Search teams across all sports
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const results = await espnApiService.searchTeamsAcrossAllSports(query);
    
    res.json({
      query,
      resultCount: results.length,
      results
    });
  } catch (error) {
    console.error(`Error searching teams with query '${req.params.query}':`, error);
    res.status(500).json({ error: 'Failed to search teams' });
  }
});

// Get trending players for any sport
router.get('/trending/:sport', async (req, res) => {
  try {
    const { sport } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const players = await espnApiService.getTrendingPlayers(sport, limit);
    
    res.json({
      sport,
      playerCount: players.length,
      players
    });
  } catch (error) {
    console.error(`Error getting trending players for ${req.params.sport}:`, error);
    res.status(500).json({ error: 'Failed to fetch trending players' });
  }
});

export default router;
