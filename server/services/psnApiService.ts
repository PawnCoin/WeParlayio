/**
 * PlayStation Network (PSN) API Service
 * Handles PlayStation user data, achievements, and game statistics
 */

export interface PSNUserProfile {
  id: string;
  onlineId: string;
  avatarUrl?: string;
  trophy: {
    level: number;
    progress: number;
    earnedTrophies: {
      bronze: number;
      silver: number;
      gold: number;
      platinum: number;
    };
  };
  plus: boolean;
  aboutMe?: string;
}

export interface PSNGameStats {
  gameId: string;
  gameName: string;
  platform: string;
  image?: string;
  playDuration?: string;
  lastPlayedDateTime?: string;
  trophySet?: {
    setVersion: string;
    hiddenFlag: boolean;
    progress: number;
    earnedTrophies: {
      bronze: number;
      silver: number;
      gold: number;
      platinum: number;
    };
  };
}

export class PSNApiService {
  private accessToken: string | null = null;
  private clientId: string;
  private clientSecret: string;
  private baseUrl = 'https://dce2-public-api-prod.api.playstation.com';

  constructor() {
    this.clientId = process.env.PLAYSTATION_CLIENT_ID || '';
    this.clientSecret = process.env.PLAYSTATION_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('PSN API credentials not configured');
    }
  }

  /**
   * Authenticate with PSN API
   */
  async authenticate(): Promise<boolean> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('PSN API credentials not configured');
    }

    try {
      const response = await fetch('https://ca.account.sony.com/api/authz/v3/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          'grant_type': 'client_credentials',
          'scope': 'psn:mobile.v2.core psn:clientapp'
        })
      });

      if (!response.ok) {
        throw new Error(`PSN authentication failed: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      return true;
    } catch (error) {
      console.error('PSN authentication error:', error);
      return false;
    }
  }

  /**
   * Get user profile by PSN ID
   */
  async getUserProfile(psnId: string): Promise<PSNUserProfile | null> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/users/${psnId}/profile2`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch PSN profile: ${response.status}`);
      }

      const data = await response.json();
      return this.formatUserProfile(data);
    } catch (error) {
      console.error('Error fetching PSN profile:', error);
      return null;
    }
  }

  /**
   * Get user's game statistics
   */
  async getUserGameStats(psnId: string, limit: number = 20): Promise<PSNGameStats[]> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/users/${psnId}/trophyTitles?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch PSN game stats: ${response.status}`);
      }

      const data = await response.json();
      return data.trophyTitles?.map((title: any) => this.formatGameStats(title)) || [];
    } catch (error) {
      console.error('Error fetching PSN game stats:', error);
      return [];
    }
  }

  /**
   * Get user's recent activity
   */
  async getUserActivity(psnId: string): Promise<any[]> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/users/${psnId}/feed`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch PSN activity: ${response.status}`);
      }

      const data = await response.json();
      return data.feed || [];
    } catch (error) {
      console.error('Error fetching PSN activity:', error);
      return [];
    }
  }

  /**
   * Search for PSN users
   */
  async searchUsers(query: string): Promise<any[]> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/users?searchTerm=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to search PSN users: ${response.status}`);
      }

      const data = await response.json();
      return data.domainResponses || [];
    } catch (error) {
      console.error('Error searching PSN users:', error);
      return [];
    }
  }

  /**
   * Format user profile data
   */
  private formatUserProfile(data: any): PSNUserProfile {
    return {
      id: data.profile?.accountId || '',
      onlineId: data.profile?.onlineId || '',
      avatarUrl: data.profile?.avatarUrls?.[0]?.url,
      trophy: {
        level: data.profile?.trophySummary?.level || 0,
        progress: data.profile?.trophySummary?.progress || 0,
        earnedTrophies: {
          bronze: data.profile?.trophySummary?.earnedTrophies?.bronze || 0,
          silver: data.profile?.trophySummary?.earnedTrophies?.silver || 0,
          gold: data.profile?.trophySummary?.earnedTrophies?.gold || 0,
          platinum: data.profile?.trophySummary?.earnedTrophies?.platinum || 0
        }
      },
      plus: data.profile?.isPlus || false,
      aboutMe: data.profile?.aboutMe
    };
  }

  /**
   * Format game statistics data
   */
  private formatGameStats(title: any): PSNGameStats {
    return {
      gameId: title.npCommunicationId || '',
      gameName: title.trophyTitleName || '',
      platform: title.trophyTitlePlatform || 'PS4',
      image: title.trophyTitleIconUrl,
      playDuration: title.playDuration,
      lastPlayedDateTime: title.lastUpdatedDateTime,
      trophySet: title.trophySetVersion ? {
        setVersion: title.trophySetVersion,
        hiddenFlag: title.hiddenFlag || false,
        progress: title.progress || 0,
        earnedTrophies: {
          bronze: title.earnedTrophies?.bronze || 0,
          silver: title.earnedTrophies?.silver || 0,
          gold: title.earnedTrophies?.gold || 0,
          platinum: title.earnedTrophies?.platinum || 0
        }
      } : undefined
    };
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<{ status: string; authenticated: boolean }> {
    try {
      const authenticated = this.accessToken !== null;
      return {
        status: authenticated ? 'healthy' : 'needs_auth',
        authenticated
      };
    } catch (error) {
      return {
        status: 'error',
        authenticated: false
      };
    }
  }
}

export const psnApiService = new PSNApiService();