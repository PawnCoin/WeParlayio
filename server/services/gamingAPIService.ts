// WeParlay Gaming API Integration Service
// This file handles all external gaming platform API connections

interface GamingPlatformConfig {
  xbox: {
    apiKey?: string;
    baseUrl: string;
  };
  playstation: {
    clientId?: string;
    clientSecret?: string;
    baseUrl: string;
  };
  steam: {
    apiKey?: string;
    baseUrl: string;
  };
  epicGames: {
    clientId?: string;
    clientSecret?: string;
    baseUrl: string;
  };
  twitch: {
    clientId?: string;
    clientSecret?: string;
    baseUrl: string;
  };
  youtube: {
    apiKey?: string;
    baseUrl: string;
  };
}

const gamingConfig: GamingPlatformConfig = {
  xbox: {
    apiKey: process.env.XBOX_API_KEY, // Add to secrets
    baseUrl: 'https://xbl.io/api/v2'
  },
  playstation: {
    clientId: process.env.PLAYSTATION_CLIENT_ID, // Add to secrets
    clientSecret: process.env.PLAYSTATION_CLIENT_SECRET, // Add to secrets
    baseUrl: 'https://m.np.playstation.com/api'
  },
  steam: {
    apiKey: process.env.STEAM_API_KEY, // Add to secrets
    baseUrl: 'https://api.steampowered.com'
  },
  epicGames: {
    clientId: process.env.EPIC_GAMES_CLIENT_ID, // Add to secrets
    clientSecret: process.env.EPIC_GAMES_CLIENT_SECRET, // Add to secrets
    baseUrl: 'https://api.epicgames.dev'
  },
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID, // Add to secrets
    clientSecret: process.env.TWITCH_CLIENT_SECRET, // Add to secrets
    baseUrl: 'https://api.twitch.tv/helix'
  },
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY, // Add to secrets
    baseUrl: 'https://www.googleapis.com/youtube/v3'
  }
};

export class GamingAPIService {
  
  // Xbox Live Integration
  async getXboxPlayerStats(gamertag: string) {
    if (!gamingConfig.xbox.apiKey) {
      throw new Error('Xbox API key not configured');
    }

    try {
      const response = await fetch(`${gamingConfig.xbox.baseUrl}/player/${gamertag}`, {
        headers: {
          'X-Authorization': gamingConfig.xbox.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Xbox API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Xbox API error:', error);
      throw error;
    }
  }

  async getXboxRecentGames(gamertag: string) {
    if (!gamingConfig.xbox.apiKey) {
      throw new Error('Xbox API key not configured');
    }

    try {
      const response = await fetch(`${gamingConfig.xbox.baseUrl}/player/${gamertag}/recent-games`, {
        headers: {
          'X-Authorization': gamingConfig.xbox.apiKey,
          'Content-Type': 'application/json'
        }
      });

      return await response.json();
    } catch (error) {
      console.error('Xbox recent games error:', error);
      throw error;
    }
  }

  // Steam Integration
  async getSteamPlayerSummary(steamId: string) {
    if (!gamingConfig.steam.apiKey) {
      throw new Error('Steam API key not configured');
    }

    try {
      const response = await fetch(
        `${gamingConfig.steam.baseUrl}/ISteamUser/GetPlayerSummaries/v0002/?key=${gamingConfig.steam.apiKey}&steamids=${steamId}`
      );

      return await response.json();
    } catch (error) {
      console.error('Steam API error:', error);
      throw error;
    }
  }

  async getSteamRecentlyPlayedGames(steamId: string) {
    if (!gamingConfig.steam.apiKey) {
      throw new Error('Steam API key not configured');
    }

    try {
      const response = await fetch(
        `${gamingConfig.steam.baseUrl}/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${gamingConfig.steam.apiKey}&steamid=${steamId}&format=json`
      );

      return await response.json();
    } catch (error) {
      console.error('Steam recent games error:', error);
      throw error;
    }
  }

  // Twitch Integration
  async getTwitchStreams(gameId?: string) {
    if (!gamingConfig.twitch.clientId || !gamingConfig.twitch.clientSecret) {
      throw new Error('Twitch API credentials not configured');
    }

    try {
      // First get OAuth token
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `client_id=${gamingConfig.twitch.clientId}&client_secret=${gamingConfig.twitch.clientSecret}&grant_type=client_credentials`
      });

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Get streams
      let url = `${gamingConfig.twitch.baseUrl}/streams`;
      if (gameId) {
        url += `?game_id=${gameId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Client-ID': gamingConfig.twitch.clientId,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return await response.json();
    } catch (error) {
      console.error('Twitch API error:', error);
      throw error;
    }
  }

  async getTwitchUserByUsername(username: string) {
    if (!gamingConfig.twitch.clientId || !gamingConfig.twitch.clientSecret) {
      throw new Error('Twitch API credentials not configured');
    }

    try {
      // Get OAuth token first
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `client_id=${gamingConfig.twitch.clientId}&client_secret=${gamingConfig.twitch.clientSecret}&grant_type=client_credentials`
      });

      const tokenData = await tokenResponse.json();
      
      const response = await fetch(`${gamingConfig.twitch.baseUrl}/users?login=${username}`, {
        headers: {
          'Client-ID': gamingConfig.twitch.clientId,
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });

      return await response.json();
    } catch (error) {
      console.error('Twitch user API error:', error);
      throw error;
    }
  }

  // YouTube Integration
  async getYouTubeChannelData(channelId: string) {
    if (!gamingConfig.youtube.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      const response = await fetch(
        `${gamingConfig.youtube.baseUrl}/channels?part=statistics&id=${channelId}&key=${gamingConfig.youtube.apiKey}`
      );

      return await response.json();
    } catch (error) {
      console.error('YouTube API error:', error);
      throw error;
    }
  }

  async getYouTubeLiveStreams(channelId?: string) {
    if (!gamingConfig.youtube.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      let url = `${gamingConfig.youtube.baseUrl}/search?part=snippet&type=video&eventType=live&key=${gamingConfig.youtube.apiKey}`;
      if (channelId) {
        url += `&channelId=${channelId}`;
      }

      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('YouTube live streams error:', error);
      throw error;
    }
  }

  // PlayStation Integration (Note: PlayStation API requires special developer access)
  async getPlayStationProfile(psnId: string) {
    if (!gamingConfig.playstation.clientId || !gamingConfig.playstation.clientSecret) {
      throw new Error('PlayStation API credentials not configured');
    }

    // PlayStation API requires OAuth flow and special developer access
    // This is a placeholder for the actual implementation
    console.warn('PlayStation API integration requires special developer access and OAuth setup');
    
    return {
      message: 'PlayStation API integration requires developer approval',
      psnId: psnId,
      status: 'pending_setup'
    };
  }

  // Epic Games Integration
  async getEpicGamesProfile(epicId: string) {
    if (!gamingConfig.epicGames.clientId || !gamingConfig.epicGames.clientSecret) {
      throw new Error('Epic Games API credentials not configured');
    }

    // Epic Games API also requires special developer access
    console.warn('Epic Games API integration requires special developer access');
    
    return {
      message: 'Epic Games API integration requires developer approval',
      epicId: epicId,
      status: 'pending_setup'
    };
  }

  // Utility method to check which APIs are configured
  getConfiguredAPIs() {
    return {
      xbox: !!gamingConfig.xbox.apiKey,
      playstation: !!(gamingConfig.playstation.clientId && gamingConfig.playstation.clientSecret),
      steam: !!gamingConfig.steam.apiKey,
      epicGames: !!(gamingConfig.epicGames.clientId && gamingConfig.epicGames.clientSecret),
      twitch: !!(gamingConfig.twitch.clientId && gamingConfig.twitch.clientSecret),
      youtube: !!gamingConfig.youtube.apiKey
    };
  }
}

export const gamingAPIService = new GamingAPIService();