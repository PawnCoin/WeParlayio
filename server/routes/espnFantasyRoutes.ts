import { Router } from 'express';
import { espnFantasyApiService } from '../services/espnFantasyApiService';

const router = Router();

// Get league information
router.get('/league/:leagueId', async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { seasonId } = req.query;
    
    const leagueData = await espnFantasyApiService.getLeagueInfo(leagueId, seasonId as string);
    
    res.json({
      success: true,
      data: leagueData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ESPN Fantasy League error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch league data'
    });
  }
});

// Get team roster
router.get('/league/:leagueId/team/:teamId/roster', async (req, res) => {
  try {
    const { leagueId, teamId } = req.params;
    const { seasonId } = req.query;
    
    const rosterData = await espnFantasyApiService.getTeamRoster(leagueId, teamId, seasonId as string);
    
    res.json({
      success: true,
      data: rosterData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ESPN Fantasy Roster error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roster data'
    });
  }
});

// Get current week matchups
router.get('/league/:leagueId/matchups', async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { week, seasonId } = req.query;
    
    const matchupsData = await espnFantasyApiService.getMatchups(
      leagueId, 
      week ? parseInt(week as string) : undefined,
      seasonId as string
    );
    
    res.json({
      success: true,
      data: matchupsData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ESPN Fantasy Matchups error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch matchups data'
    });
  }
});

// Get player stats
router.get('/player/:playerId/stats', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { seasonId } = req.query;
    
    const playerData = await espnFantasyApiService.getPlayerStats(playerId, seasonId as string);
    
    res.json({
      success: true,
      data: playerData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ESPN Fantasy Player error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player data'
    });
  }
});

// Get free agents
router.get('/league/:leagueId/free-agents', async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { seasonId } = req.query;
    
    const freeAgentsData = await espnFantasyApiService.getFreeAgents(leagueId, seasonId as string);
    
    res.json({
      success: true,
      data: freeAgentsData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ESPN Fantasy Free Agents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch free agents data'
    });
  }
});

// Get comprehensive fantasy dashboard data
router.get('/league/:leagueId/dashboard', async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { seasonId } = req.query;
    const season = seasonId as string || '2024';
    
    // Fetch multiple data sources in parallel
    const [leagueInfo, matchups, freeAgents] = await Promise.all([
      espnFantasyApiService.getLeagueInfo(leagueId, season),
      espnFantasyApiService.getMatchups(leagueId, undefined, season),
      espnFantasyApiService.getFreeAgents(leagueId, season)
    ]);
    
    res.json({
      success: true,
      data: {
        league: leagueInfo,
        currentMatchups: matchups,
        topFreeAgents: freeAgents.availablePlayers?.slice(0, 10) || [],
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ESPN Fantasy Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

export default router;