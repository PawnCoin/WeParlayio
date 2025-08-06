import { OAuth } from 'oauth';
import axios from 'axios';
import { storage } from '../storage';

// Yahoo API Configuration
const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID;
const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET;
const CALLBACK_URL = process.env.REPLIT_DOMAINS 
  ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/api/yahoo/callback` 
  : 'http://localhost:5000/api/yahoo/callback';

// Yahoo API URLs
const REQUEST_TOKEN_URL = 'https://api.login.yahoo.com/oauth2/request_auth';
const AUTH_URL = 'https://api.login.yahoo.com/oauth2/request_auth';
const ACCESS_TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';
const YAHOO_FANTASY_API_BASE = 'https://fantasysports.yahooapis.com/fantasy/v2';

// Create OAuth client
const oauth = new OAuth(
  REQUEST_TOKEN_URL,
  ACCESS_TOKEN_URL,
  YAHOO_CLIENT_ID!,
  YAHOO_CLIENT_SECRET!,
  '1.0',
  CALLBACK_URL,
  'HMAC-SHA1'
);

// Token storage for the session
export interface TokenData {
  accessToken: string;
  accessTokenSecret: string;
  sessionHandle?: string;
  expiresIn?: number;
  expireTime?: number;
}

// Store token by session ID
const tokenStore = new Map<string, TokenData>();

export const yahooFantasyService = {
  /**
   * Start OAuth flow and get request token
   */
  getAuthorizationUrl: async (): Promise<{ authUrl: string; requestToken: string; requestTokenSecret: string }> => {
    return new Promise((resolve, reject) => {
      oauth.getOAuthRequestToken((error, requestToken, requestTokenSecret, results) => {
        if (error) {
          console.error('Error getting OAuth request token:', error);
          return reject(error);
        }
        
        const authUrl = `${AUTH_URL}?oauth_token=${requestToken}`;
        resolve({ authUrl, requestToken, requestTokenSecret });
      });
    });
  },

  /**
   * Exchange request token for access token
   */
  getAccessToken: async (
    requestToken: string, 
    requestTokenSecret: string, 
    verifier: string
  ): Promise<TokenData> => {
    return new Promise((resolve, reject) => {
      oauth.getOAuthAccessToken(
        requestToken,
        requestTokenSecret,
        verifier,
        (error, accessToken, accessTokenSecret, results) => {
          if (error) {
            console.error('Error getting OAuth access token:', error);
            return reject(error);
          }

          const tokenData: TokenData = {
            accessToken,
            accessTokenSecret,
            sessionHandle: results.oauth_session_handle,
            expiresIn: parseInt(results.oauth_expires_in, 10),
            expireTime: Date.now() + parseInt(results.oauth_expires_in, 10) * 1000
          };

          resolve(tokenData);
        }
      );
    });
  },

  /**
   * Refresh access token using session handle
   */
  refreshAccessToken: async (tokenData: TokenData): Promise<TokenData> => {
    if (!tokenData.sessionHandle) {
      throw new Error('No session handle available for token refresh');
    }

    return new Promise((resolve, reject) => {
      oauth.getOAuthAccessToken(
        '',
        '',
        '',
        (error, accessToken, accessTokenSecret, results) => {
          if (error) {
            console.error('Error refreshing OAuth access token:', error);
            return reject(error);
          }

          const refreshedTokenData: TokenData = {
            accessToken,
            accessTokenSecret,
            sessionHandle: results.oauth_session_handle,
            expiresIn: parseInt(results.oauth_expires_in, 10),
            expireTime: Date.now() + parseInt(results.oauth_expires_in, 10) * 1000
          };

          resolve(refreshedTokenData);
        },
        { oauth_session_handle: tokenData.sessionHandle }
      );
    });
  },

  /**
   * Store token data for a session
   */
  storeTokenData: (sessionId: string, tokenData: TokenData): void => {
    tokenStore.set(sessionId, tokenData);
  },

  /**
   * Get token data for a session
   */
  getTokenData: (sessionId: string): TokenData | undefined => {
    return tokenStore.get(sessionId);
  },

  /**
   * Remove token data for a session
   */
  removeTokenData: (sessionId: string): void => {
    tokenStore.delete(sessionId);
  },

  /**
   * Make an API request to Yahoo Fantasy
   */
  makeApiRequest: async (
    sessionId: string, 
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<any> => {
    let tokenData = tokenStore.get(sessionId);
    
    if (!tokenData) {
      throw new Error('No token data found for this session');
    }

    // Check if token is expired and refresh if needed
    if (tokenData.expireTime && tokenData.expireTime < Date.now()) {
      tokenData = await yahooFantasyService.refreshAccessToken(tokenData);
      tokenStore.set(sessionId, tokenData);
    }

    const url = `${YAHOO_FANTASY_API_BASE}${endpoint}`;
    
    return new Promise((resolve, reject) => {
      oauth.makeRequest(
        url,
        tokenData!.accessToken,
        tokenData!.accessTokenSecret,
        null,
        method,
        (error, data, response) => {
          if (error) {
            console.error(`Error making Yahoo API request to ${endpoint}:`, error);
            return reject(error);
          }
          
          try {
            // Yahoo Fantasy API supports XML and JSON, we'll use JSON
            const result = JSON.parse(data.toString());
            resolve(result);
          } catch (parseError) {
            console.error('Error parsing Yahoo API response:', parseError);
            reject(parseError);
          }
        },
        { format: 'json' }
      );
    });
  },

  /**
   * Get user's fantasy teams
   */
  getUserTeams: async (sessionId: string): Promise<any[]> => {
    const response = await yahooFantasyService.makeApiRequest(
      sessionId,
      '/users;use_login=1/games;game_keys=nfl/teams'
    );
    
    // Extract teams from response
    const teamsData = response.fantasy_content.users[0].user[1].games[0].game[1].teams;
    const teams = [];
    
    // Process the teams (Yahoo's API returns enumerated objects)
    for (let i = 0; i < teamsData.count; i++) {
      if (teamsData[i] && teamsData[i].team) {
        teams.push(teamsData[i].team[0]);
      }
    }
    
    return teams;
  },
  
  /**
   * Get team roster
   */
  getTeamRoster: async (sessionId: string, teamKey: string): Promise<any[]> => {
    const response = await yahooFantasyService.makeApiRequest(
      sessionId,
      `/team/${teamKey}/roster/players`
    );
    
    // Extract players from response
    const rosterData = response.fantasy_content.team[1].roster[0].players;
    const players = [];
    
    // Process the players
    for (let i = 0; i < rosterData.count; i++) {
      if (rosterData[i] && rosterData[i].player) {
        players.push(rosterData[i].player[0]);
      }
    }
    
    return players;
  },
  
  /**
   * Get league standings
   */
  getLeagueStandings: async (sessionId: string, leagueKey: string): Promise<any> => {
    const response = await yahooFantasyService.makeApiRequest(
      sessionId,
      `/league/${leagueKey}/standings`
    );
    
    return response.fantasy_content.league[1].standings[0].teams;
  },
  
  /**
   * Get player stats
   */
  getPlayerStats: async (sessionId: string, playerKey: string): Promise<any> => {
    const response = await yahooFantasyService.makeApiRequest(
      sessionId,
      `/player/${playerKey}/stats`
    );
    
    return response.fantasy_content.player;
  },
  
  /**
   * Save Yahoo Fantasy team to our database
   */
  saveFantasyTeam: async (userId: number, yahooTeamData: any): Promise<any> => {
    // Map Yahoo team data to our schema
    const fantasyTeam = {
      userId,
      name: yahooTeamData.name,
      sportId: 2, // Football
      yahooTeamId: yahooTeamData.team_key
    };
    
    // Save to database
    return await storage.createFantasyTeam(fantasyTeam);
  },
  
  /**
   * Import Yahoo Fantasy team players to our database
   */
  importTeamPlayers: async (
    fantasyTeamId: number, 
    sessionId: string, 
    yahooTeamKey: string
  ): Promise<any> => {
    const players = await yahooFantasyService.getTeamRoster(sessionId, yahooTeamKey);
    
    // Process and save each player
    const savedPlayers = [];
    
    for (const yahooPlayer of players) {
      // Create player in our database
      const player = {
        name: yahooPlayer.name.full,
        position: yahooPlayer.display_position,
        teamId: null, // Would need to map Yahoo team codes to our team IDs
        yahooPlayerId: yahooPlayer.player_id
      };
      
      const savedPlayer = await storage.createPlayer(player);
      
      // Associate player with fantasy team
      const fantasyTeamPlayer = {
        fantasyTeamId,
        playerId: savedPlayer.id
      };
      
      await storage.addPlayerToFantasyTeam(fantasyTeamPlayer);
      savedPlayers.push(savedPlayer);
    }
    
    return savedPlayers;
  }
};