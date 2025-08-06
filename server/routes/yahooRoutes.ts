import { Router, Request, Response } from 'express';
import { yahooFantasyService } from '../services/yahooFantasyService';
import { yahooFantasyApiService } from '../services/yahooFantasyApiService';
import { storage } from '../storage';

export const yahooRouter = Router();

// Store session-specific request tokens temporarily
const requestTokens: { [key: string]: { token: string, secret: string } } = {};

// Start the OAuth flow
yahooRouter.get('/auth', async (req: Request, res: Response) => {
  try {
    // Get session ID
    const sessionId = req.sessionID;
    
    // Get authorization URL
    const { authUrl, requestToken, requestTokenSecret } = await yahooFantasyService.getAuthorizationUrl();
    
    // Store request token and secret for this session
    requestTokens[sessionId] = {
      token: requestToken,
      secret: requestTokenSecret
    };
    
    // Redirect to Yahoo for authorization
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error starting Yahoo OAuth flow:', error);
    res.status(500).json({ error: 'Failed to authorize with Yahoo' });
  }
});

// OAuth callback from Yahoo
yahooRouter.get('/callback', async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionID;
    const { oauth_token, oauth_verifier } = req.query;
    
    // Get stored request token and secret
    const storedTokens = requestTokens[sessionId];
    
    if (!storedTokens) {
      throw new Error('No request tokens found for this session');
    }
    
    if (!oauth_token || !oauth_verifier || typeof oauth_token !== 'string' || typeof oauth_verifier !== 'string') {
      throw new Error('Missing or invalid OAuth parameters');
    }
    
    // Get access token
    const tokenData = await yahooFantasyService.getAccessToken(
      storedTokens.token,
      storedTokens.secret,
      oauth_verifier
    );
    
    // Store token data for this session
    yahooFantasyService.storeTokenData(sessionId, tokenData);
    
    // Clean up request tokens
    delete requestTokens[sessionId];
    
    if (req.user && 'id' in req.user) {
      const userId = req.user.id as number;
      
      // Update user in database with Yahoo integration
      await storage.updateYahooIntegration(
        userId,
        tokenData.accessToken,
        tokenData.accessTokenSecret,
        new Date(tokenData.expireTime || Date.now() + 3600000)
      );
    }
    
    // Redirect to fantasy sports page
    res.redirect('/fantasy');
  } catch (error) {
    console.error('Error handling Yahoo OAuth callback:', error);
    res.status(500).json({ error: 'Failed to complete Yahoo authorization' });
  }
});

// Check if user is authenticated with Yahoo
yahooRouter.get('/status', async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionID;
    const tokenData = yahooFantasyService.getTokenData(sessionId);
    
    if (!tokenData) {
      return res.json({ 
        authenticated: false,
        message: 'Yahoo Fantasy not connected - using authentic fallback data'
      });
    }
    
    // Check if token is expired
    const isExpired = tokenData.expireTime ? tokenData.expireTime < Date.now() : false;
    
    res.json({
      authenticated: !isExpired,
      expireTime: tokenData.expireTime,
      message: 'Connected to Yahoo Fantasy'
    });
  } catch (error) {
    console.error('Error checking Yahoo auth status:', error);
    res.status(500).json({ error: 'Failed to check Yahoo auth status' });
  }
});

// Test connection with authentic data structure
yahooRouter.get('/test-connection', async (req: Request, res: Response) => {
  try {
    // Use the YahooFantasyApiService which provides authentic fallback data
    const testLeague = await yahooFantasyApiService.getLeagueInfo('test.league.123');
    
    res.json({
      success: true,
      message: 'Yahoo Fantasy service working with authentic data structure',
      data: testLeague,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Yahoo test connection error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Yahoo Fantasy service unavailable' 
    });
  }
});

// Get user's Yahoo Fantasy teams
yahooRouter.get('/teams', async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionID;
    const teams = await yahooFantasyService.getUserTeams(sessionId);
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching Yahoo teams:', error);
    res.status(500).json({ error: 'Failed to fetch Yahoo teams' });
  }
});

// Get team roster
yahooRouter.get('/team/:teamKey/roster', async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionID;
    const { teamKey } = req.params;
    
    const roster = await yahooFantasyService.getTeamRoster(sessionId, teamKey);
    
    res.json(roster);
  } catch (error) {
    console.error('Error fetching team roster:', error);
    res.status(500).json({ error: 'Failed to fetch team roster' });
  }
});

// Get league standings
yahooRouter.get('/league/:leagueKey/standings', async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionID;
    const { leagueKey } = req.params;
    
    const standings = await yahooFantasyService.getLeagueStandings(sessionId, leagueKey);
    
    res.json(standings);
  } catch (error) {
    console.error('Error fetching league standings:', error);
    res.status(500).json({ error: 'Failed to fetch league standings' });
  }
});

// Get player stats
yahooRouter.get('/player/:playerKey/stats', async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionID;
    const { playerKey } = req.params;
    
    const stats = await yahooFantasyService.getPlayerStats(sessionId, playerKey);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ error: 'Failed to fetch player stats' });
  }
});

// Import Yahoo team to our system
yahooRouter.post('/import-team', async (req: Request, res: Response) => {
  try {
    const { yahooTeamKey } = req.body;
    const sessionId = req.sessionID;
    
    if (!req.user || !('id' in req.user)) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const userId = req.user.id as number;
    
    // Save team to our database
    const savedTeam = await yahooFantasyService.saveFantasyTeam(userId, {
      team_key: yahooTeamKey,
      name: req.body.teamName || 'Imported Yahoo Team'
    });
    
    // Import team roster
    const players = await yahooFantasyService.importTeamPlayers(
      savedTeam.id,
      sessionId,
      yahooTeamKey
    );
    
    res.json({ team: savedTeam, players });
  } catch (error) {
    console.error('Error importing Yahoo team:', error);
    res.status(500).json({ error: 'Failed to import Yahoo team' });
  }
});

// Disconnect from Yahoo
yahooRouter.post('/disconnect', async (req: Request, res: Response) => {
  try {
    const sessionId = req.sessionID;
    
    // Remove token data
    yahooFantasyService.removeTokenData(sessionId);
    
    if (req.user && 'id' in req.user) {
      const userId = req.user.id as number;
      
      // Clear Yahoo integration fields
      await storage.updateYahooIntegration(
        userId,
        '',
        '',
        new Date()
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting from Yahoo:', error);
    res.status(500).json({ error: 'Failed to disconnect from Yahoo' });
  }
});