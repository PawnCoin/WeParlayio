import { Router } from 'express';
import { yahooFantasyApiService } from '../services/yahooFantasyApiService';

const router = Router();

// Get league information
router.get('/league/:leagueKey?', async (req, res) => {
  try {
    const leagueKey = req.params.leagueKey || 'nfl.l.123456';
    const result = await yahooFantasyApiService.getLeagueInfo(leagueKey);
    res.json(result);
  } catch (error) {
    console.error('Yahoo Fantasy league error:', error);
    res.status(500).json({ error: 'Failed to fetch league data' });
  }
});

// Get team roster
router.get('/league/:leagueKey/team/:teamKey/roster', async (req, res) => {
  try {
    const { leagueKey, teamKey } = req.params;
    const result = await yahooFantasyApiService.getTeamRoster(leagueKey, teamKey);
    res.json(result);
  } catch (error) {
    console.error('Yahoo Fantasy roster error:', error);
    res.status(500).json({ error: 'Failed to fetch roster data' });
  }
});

// Get matchups
router.get('/league/:leagueKey/matchups', async (req, res) => {
  try {
    const { leagueKey } = req.params;
    const week = req.query.week ? parseInt(req.query.week as string) : undefined;
    const result = await yahooFantasyApiService.getMatchups(leagueKey, week);
    res.json(result);
  } catch (error) {
    console.error('Yahoo Fantasy matchups error:', error);
    res.status(500).json({ error: 'Failed to fetch matchups data' });
  }
});

// Get free agents
router.get('/league/:leagueKey/free-agents', async (req, res) => {
  try {
    const { leagueKey } = req.params;
    const result = await yahooFantasyApiService.getFreeAgents(leagueKey);
    res.json(result);
  } catch (error) {
    console.error('Yahoo Fantasy free agents error:', error);
    res.status(500).json({ error: 'Failed to fetch free agents data' });
  }
});

export default router;