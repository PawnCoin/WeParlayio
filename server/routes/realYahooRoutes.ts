import { Router, Request, Response } from 'express';
import { realYahooApiService } from '../services/realYahooApiService';

export const realYahooRouter = Router();

// Start OAuth 2.0 flow
realYahooRouter.get('/oauth/start', (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).sessionID || 'temp-session-' + Date.now();
    const authUrl = realYahooApiService.getAuthUrl(sessionId);
    
    console.log('Redirecting to Yahoo OAuth URL:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error starting Yahoo OAuth flow:', error);
    res.status(500).json({ error: 'Failed to start Yahoo OAuth flow' });
  }
});

// OAuth callback
realYahooRouter.get('/oauth/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;
    
    if (error) {
      console.error('Yahoo OAuth error:', error);
      return res.redirect('/fantasy?error=oauth_denied');
    }
    
    if (!code || !state) {
      return res.redirect('/fantasy?error=missing_params');
    }
    
    const sessionId = state as string;
    await realYahooApiService.exchangeCodeForToken(code as string, sessionId);
    
    console.log('✅ Yahoo OAuth completed successfully');
    res.redirect('/fantasy?connected=yahoo');
  } catch (error) {
    console.error('Error in Yahoo OAuth callback:', error);
    res.redirect('/fantasy?error=oauth_failed');
  }
});

// Get authentication status
realYahooRouter.get('/status', (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).sessionID || 'temp-session';
    const status = realYahooApiService.getAuthStatus(sessionId);
    
    res.json({
      ...status,
      message: status.authenticated ? 'Connected to Yahoo Fantasy' : 'Not connected to Yahoo Fantasy'
    });
  } catch (error) {
    console.error('Error checking Yahoo auth status:', error);
    res.status(500).json({ error: 'Failed to check authentication status' });
  }
});

// Get user's leagues
realYahooRouter.get('/leagues', async (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).sessionID || 'temp-session';
    
    if (!realYahooApiService.isAuthenticated(sessionId)) {
      return res.status(401).json({ error: 'Yahoo authentication required' });
    }
    
    const leagues = await realYahooApiService.getUserLeagues(sessionId);
    res.json({ success: true, leagues });
  } catch (error) {
    console.error('Error fetching Yahoo leagues:', error);
    res.status(500).json({ error: 'Failed to fetch leagues' });
  }
});

// Get user's teams
realYahooRouter.get('/teams', async (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).sessionID || 'temp-session';
    
    if (!realYahooApiService.isAuthenticated(sessionId)) {
      return res.status(401).json({ error: 'Yahoo authentication required' });
    }
    
    const teams = await realYahooApiService.getUserTeams(sessionId);
    res.json({ success: true, teams });
  } catch (error) {
    console.error('Error fetching Yahoo teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get player data
realYahooRouter.get('/players', async (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).sessionID || 'temp-session';
    
    if (!realYahooApiService.isAuthenticated(sessionId)) {
      return res.status(401).json({ error: 'Yahoo authentication required' });
    }
    
    const players = await realYahooApiService.getPlayerData(sessionId);
    res.json({ success: true, players });
  } catch (error) {
    console.error('Error fetching Yahoo players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Get league details
realYahooRouter.get('/leagues/:leagueKey', async (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).sessionID || 'temp-session';
    const { leagueKey } = req.params;
    
    if (!realYahooApiService.isAuthenticated(sessionId)) {
      return res.status(401).json({ error: 'Yahoo authentication required' });
    }
    
    const leagueDetails = await realYahooApiService.getLeagueDetails(sessionId, leagueKey);
    res.json({ success: true, league: leagueDetails });
  } catch (error) {
    console.error('Error fetching Yahoo league details:', error);
    res.status(500).json({ error: 'Failed to fetch league details' });
  }
});

// Authentication check endpoint
realYahooRouter.get('/auth', (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).sessionID || 'temp-session-' + Date.now();
    const authUrl = realYahooApiService.getAuthUrl(sessionId);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error starting Yahoo OAuth:', error);
    res.status(500).json({ error: 'Failed to start authentication' });
  }
});

// Get league details
realYahooRouter.get('/league/:leagueKey', async (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).sessionID || 'temp-session';
    const { leagueKey } = req.params;
    
    if (!realYahooApiService.isAuthenticated(sessionId)) {
      return res.status(401).json({ error: 'Yahoo authentication required' });
    }
    
    const league = await realYahooApiService.getLeagueDetails(leagueKey, sessionId);
    res.json({ success: true, league });
  } catch (error) {
    console.error('Error fetching Yahoo league details:', error);
    res.status(500).json({ error: 'Failed to fetch league details' });
  }
});

// Test connection
realYahooRouter.get('/test', async (req: Request, res: Response) => {
  try {
    const sessionId = (req as any).sessionID || 'temp-session';
    const status = realYahooApiService.getAuthStatus(sessionId);
    
    if (status.authenticated) {
      // Try to fetch leagues to test the connection
      const leagues = await realYahooApiService.getUserLeagues(sessionId);
      res.json({ 
        success: true, 
        message: 'Yahoo Fantasy API connected successfully',
        leagueCount: leagues.length,
        authenticated: true
      });
    } else {
      res.json({ 
        success: false, 
        message: 'Yahoo Fantasy authentication required',
        authenticated: false,
        authUrl: '/api/yahoo-real/oauth/start'
      });
    }
  } catch (error) {
    console.error('Error testing Yahoo connection:', error);
    res.json({ 
      success: false, 
      message: 'Yahoo Fantasy connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});