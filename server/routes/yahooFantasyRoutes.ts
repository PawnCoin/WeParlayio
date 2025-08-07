import express from 'express';
import { yahooFantasyService } from '../services/yahooFantasyService';
import { isAuthenticated } from '../replitAuth';

const router = express.Router();

// Get user's Yahoo Fantasy leagues
router.get('/leagues', isAuthenticated, async (req, res) => {
  try {
    const userToken = req.headers['yahoo-token'] as string;
    const leagues = await yahooFantasyService.getLeagues(userToken);
    
    res.json({
      success: true,
      leagues,
      count: leagues.length,
      platform: 'yahoo'
    });
  } catch (error) {
    console.error('Error fetching Yahoo leagues:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch Yahoo Fantasy leagues',
      error: error.message 
    });
  }
});

// Get teams in a specific league
router.get('/leagues/:leagueId/teams', isAuthenticated, async (req, res) => {
  try {
    const { leagueId } = req.params;
    const userToken = req.headers['yahoo-token'] as string;
    
    const teams = await yahooFantasyService.getTeams(leagueId, userToken);
    
    res.json({
      success: true,
      teams,
      leagueId,
      count: teams.length,
      platform: 'yahoo'
    });
  } catch (error) {
    console.error('Error fetching Yahoo teams:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch Yahoo Fantasy teams',
      error: error.message 
    });
  }
});

// Get top available players
router.get('/players/top', isAuthenticated, async (req, res) => {
  try {
    const { sport = 'nfl' } = req.query;
    const userToken = req.headers['yahoo-token'] as string;
    
    const players = await yahooFantasyService.getTopPlayers(sport as string, userToken);
    
    res.json({
      success: true,
      players,
      sport,
      count: players.length,
      platform: 'yahoo'
    });
  } catch (error) {
    console.error('Error fetching Yahoo players:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch Yahoo Fantasy players',
      error: error.message 
    });
  }
});

// Get player statistics
router.get('/players/:playerId/stats', isAuthenticated, async (req, res) => {
  try {
    const { playerId } = req.params;
    const userToken = req.headers['yahoo-token'] as string;
    
    const stats = await yahooFantasyService.getPlayerStats(playerId, userToken);
    
    res.json({
      success: true,
      stats,
      playerId,
      platform: 'yahoo'
    });
  } catch (error) {
    console.error('Error fetching Yahoo player stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch Yahoo player stats',
      error: error.message 
    });
  }
});

// OAuth endpoints
router.get('/auth/url', (req, res) => {
  try {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/yahoo-fantasy/auth/callback`;
    const authUrl = yahooFantasyService.generateAuthUrl(redirectUri);
    
    res.json({
      success: true,
      authUrl,
      platform: 'yahoo'
    });
  } catch (error) {
    console.error('Error generating Yahoo auth URL:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate Yahoo auth URL',
      error: error.message 
    });
  }
});

router.get('/auth/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: 'No authorization code provided' 
      });
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/yahoo-fantasy/auth/callback`;
    const accessToken = await yahooFantasyService.exchangeCodeForToken(code as string, redirectUri);
    
    // In a real implementation, you'd store this token associated with the user
    res.json({
      success: true,
      message: 'Yahoo Fantasy successfully connected',
      accessToken: accessToken.substring(0, 10) + '...', // Don't expose full token
      platform: 'yahoo'
    });
  } catch (error) {
    console.error('Error in Yahoo auth callback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to complete Yahoo authentication',
      error: error.message 
    });
  }
});

// Combined ESPN + Yahoo data endpoint
router.get('/unified/dashboard', isAuthenticated, async (req, res) => {
  try {
    const espnToken = req.headers['espn-token'] as string;
    const yahooToken = req.headers['yahoo-token'] as string;
    
    const [yahooLeagues, yahooPlayers] = await Promise.all([
      yahooFantasyService.getLeagues(yahooToken),
      yahooFantasyService.getTopPlayers('nfl', yahooToken)
    ]);

    // Mock ESPN data for comparison (would be from actual ESPN service)
    const espnData = {
      leagues: [
        {
          id: 'espn_league_001',
          name: 'ESPN Championship League',
          platform: 'espn',
          totalTeams: 12,
          currentWeek: 8
        }
      ],
      players: [
        {
          id: 'espn_player_001',
          name: 'Lamar Jackson',
          position: 'QB',
          team: 'BAL',
          projectedPoints: 25.8,
          platform: 'espn'
        }
      ]
    };

    res.json({
      success: true,
      data: {
        yahoo: {
          leagues: yahooLeagues,
          players: yahooPlayers.slice(0, 10),
          platform: 'yahoo'
        },
        espn: espnData,
        combined: {
          totalLeagues: yahooLeagues.length + espnData.leagues.length,
          totalPlayers: yahooPlayers.length + espnData.players.length,
          platforms: ['yahoo', 'espn']
        }
      }
    });
  } catch (error) {
    console.error('Error fetching unified fantasy dashboard:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch unified fantasy data',
      error: error.message 
    });
  }
});

export default router;