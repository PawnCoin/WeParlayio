import { Request, Response } from 'express';

interface YahooTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface YahooUser {
  sub: string;
  name: string;
  email: string;
  profile_image_url?: string;
}

export class YahooOAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.YAHOO_CLIENT_ID || '';
    this.clientSecret = process.env.YAHOO_CLIENT_SECRET || '';
    const domain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
    this.redirectUri = `https://${domain}/api/yahoo/callback`;
    console.log('Yahoo OAuth configured with redirect URI:', this.redirectUri);
  }

  // Generate Yahoo OAuth URL
  getAuthUrl(): string {
    const baseUrl = 'https://api.login.yahoo.com/oauth2/request_auth';
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'fspt-r', // Fantasy Sports Read permission
      state: this.generateState()
    });

    return `${baseUrl}?${params.toString()}`;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<YahooTokens> {
    const tokenUrl = 'https://api.login.yahoo.com/oauth2/get_token';
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code: code,
      grant_type: 'authorization_code'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`Yahoo token exchange failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get user profile
  async getUserProfile(accessToken: string): Promise<YahooUser> {
    const response = await fetch('https://api.login.yahoo.com/openid/v1/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo profile fetch failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get user's fantasy leagues
  async getFantasyLeagues(accessToken: string): Promise<any[]> {
    try {
      const response = await fetch('https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues?format=json', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Yahoo fantasy leagues fetch failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.fantasy_content?.users?.[0]?.user?.[1]?.games?.[0]?.game?.[1]?.leagues || [];
    } catch (error) {
      console.error('Error fetching Yahoo fantasy leagues:', error);
      return [];
    }
  }

  // Get fantasy team roster
  async getFantasyRoster(accessToken: string, leagueKey: string, teamKey: string): Promise<any[]> {
    try {
      const response = await fetch(
        `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/teams;team_keys=${teamKey}/roster?format=json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Yahoo fantasy roster fetch failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.fantasy_content?.league?.[1]?.teams?.[0]?.team?.[1]?.roster?.[0]?.players || [];
    } catch (error) {
      console.error('Error fetching Yahoo fantasy roster:', error);
      return [];
    }
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<YahooTokens> {
    const tokenUrl = 'https://api.login.yahoo.com/oauth2/get_token';
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`Yahoo token refresh failed: ${response.statusText}`);
    }

    return await response.json();
  }
}

export const yahooOAuthService = new YahooOAuthService();