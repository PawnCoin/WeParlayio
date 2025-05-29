
import axios from 'axios';
import NodeCache from 'node-cache';

// Cache for 30 seconds for live data, 5 minutes for static data
const cache = new NodeCache({ stdTTL: 30 });

interface RiotConfig {
  apiKey: string;
  regions: {
    americas: string;
    europe: string;
    asia: string;
  };
  platforms: {
    na1: string;
    euw1: string;
    kr: string;
    br1: string;
    eune1: string;
    jp1: string;
    oc1: string;
    ru: string;
    tr1: string;
    la1: string;
    la2: string;
  };
}

const riotConfig: RiotConfig = {
  apiKey: process.env.RIOT_API_KEY || '',
  regions: {
    americas: 'americas.api.riotgames.com',
    europe: 'europe.api.riotgames.com',
    asia: 'asia.api.riotgames.com'
  },
  platforms: {
    na1: 'na1.api.riotgames.com',
    euw1: 'euw1.api.riotgames.com',
    kr: 'kr.api.riotgames.com',
    br1: 'br1.api.riotgames.com',
    eune1: 'eune1.api.riotgames.com',
    jp1: 'jp1.api.riotgames.com',
    oc1: 'oc1.api.riotgames.com',
    ru: 'ru.api.riotgames.com',
    tr1: 'tr1.api.riotgames.com',
    la1: 'la1.api.riotgames.com',
    la2: 'la2.api.riotgames.com'
  }
};

export class RiotGamesAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = riotConfig.apiKey;
    if (!this.apiKey) {
      console.warn('⚠️ Riot API key not configured. Set RIOT_API_KEY in secrets.');
    }
  }

  private async makeRequest(url: string, cacheKey?: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Riot API key not configured');
    }

    // Check cache first
    if (cacheKey && cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'X-Riot-Token': this.apiKey
        },
        timeout: 10000,
        validateStatus: (status) => status < 500 // Don't throw for 4xx errors
      });

      // Handle specific status codes
      if (response.status === 429) {
        console.warn('Riot API rate limit exceeded');
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 403) {
        console.warn('Riot API access denied - check API key');
        throw new Error('Invalid Riot API key or access denied.');
      } else if (response.status === 404) {
        console.warn('Riot API resource not found');
        throw new Error('Player or match not found.');
      } else if (response.status >= 400) {
        console.warn(`Riot API error ${response.status}:`, response.data);
        throw new Error(`Riot API error: ${response.status} ${response.statusText}`);
      }

      // Cache successful responses
      if (cacheKey && response.data) {
        cache.set(cacheKey, response.data);
      }

      return response.data;
    } catch (error: any) {
      // Log the full error for debugging
      console.error('Riot API request failed:', {
        url: url.replace(this.apiKey, '[API_KEY_HIDDEN]'),
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Re-throw with a clean message
      if (error.message.includes('Rate limit') || error.message.includes('API key') || error.message.includes('not found')) {
        throw error; // Already has a good message
      }
      
      throw new Error(`Riot API request failed: ${error.message}`);
    }
  }

  // Get summoner by name
  async getSummonerByName(summonerName: string, region: string = 'na1'): Promise<any> {
    const platform = riotConfig.platforms[region as keyof typeof riotConfig.platforms];
    if (!platform) {
      throw new Error(`Invalid region: ${region}`);
    }

    const cacheKey = `summoner-${region}-${summonerName}`;
    const url = `https://${platform}/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;
    
    return await this.makeRequest(url, cacheKey);
  }

  // Get ranked stats for summoner
  async getRankedStats(summonerId: string, region: string = 'na1'): Promise<any> {
    const platform = riotConfig.platforms[region as keyof typeof riotConfig.platforms];
    const cacheKey = `ranked-${region}-${summonerId}`;
    const url = `https://${platform}/lol/league/v4/entries/by-summoner/${summonerId}`;
    
    return await this.makeRequest(url, cacheKey);
  }

  // Get match history by PUUID
  async getMatchHistory(puuid: string, region: string = 'americas', count: number = 20): Promise<any> {
    const regionalPlatform = riotConfig.regions[region as keyof typeof riotConfig.regions];
    const cacheKey = `matches-${region}-${puuid}-${count}`;
    const url = `https://${regionalPlatform}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
    
    return await this.makeRequest(url, cacheKey);
  }

  // Get match details
  async getMatchDetails(matchId: string, region: string = 'americas'): Promise<any> {
    const regionalPlatform = riotConfig.regions[region as keyof typeof riotConfig.regions];
    const cacheKey = `match-details-${matchId}`;
    const url = `https://${regionalPlatform}/lol/match/v5/matches/${matchId}`;
    
    return await this.makeRequest(url, cacheKey);
  }

  // Get live game info
  async getLiveGame(summonerId: string, region: string = 'na1'): Promise<any> {
    const platform = riotConfig.platforms[region as keyof typeof riotConfig.platforms];
    const url = `https://${platform}/lol/spectator/v4/active-games/by-summoner/${summonerId}`;
    
    // Don't cache live games - always fresh
    return await this.makeRequest(url);
  }

  // Get champion mastery
  async getChampionMastery(summonerId: string, region: string = 'na1'): Promise<any> {
    const platform = riotConfig.platforms[region as keyof typeof riotConfig.platforms];
    const cacheKey = `mastery-${region}-${summonerId}`;
    const url = `https://${platform}/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`;
    
    return await this.makeRequest(url, cacheKey);
  }

  // Get current game stats for esports betting
  async getEsportsPlayerStats(summonerName: string, region: string = 'na1'): Promise<any> {
    try {
      // Get summoner info
      const summoner = await this.getSummonerByName(summonerName, region);
      
      // Get ranked stats
      const rankedStats = await this.getRankedStats(summoner.id, region);
      
      // Get recent matches
      const matchIds = await this.getMatchHistory(summoner.puuid, this.getRegionalMapping(region), 10);
      
      // Get detailed match data for recent games
      const recentMatches = [];
      for (const matchId of matchIds.slice(0, 5)) {
        try {
          const matchDetail = await this.getMatchDetails(matchId, this.getRegionalMapping(region));
          const playerStats = matchDetail.info.participants.find(
            (p: any) => p.puuid === summoner.puuid
          );
          
          if (playerStats) {
            recentMatches.push({
              matchId,
              championName: playerStats.championName,
              kills: playerStats.kills,
              deaths: playerStats.deaths,
              assists: playerStats.assists,
              cs: playerStats.totalMinionsKilled + playerStats.neutralMinionsKilled,
              goldEarned: playerStats.goldEarned,
              win: playerStats.win,
              gameDuration: matchDetail.info.gameDuration,
              gameCreation: matchDetail.info.gameCreation
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch match ${matchId}:`, error);
        }
      }

      // Calculate performance metrics
      const avgKills = recentMatches.length > 0 
        ? recentMatches.reduce((sum, match) => sum + match.kills, 0) / recentMatches.length 
        : 0;
      
      const avgDeaths = recentMatches.length > 0 
        ? recentMatches.reduce((sum, match) => sum + match.deaths, 0) / recentMatches.length 
        : 0;
      
      const avgAssists = recentMatches.length > 0 
        ? recentMatches.reduce((sum, match) => sum + match.assists, 0) / recentMatches.length 
        : 0;

      const winRate = recentMatches.length > 0 
        ? (recentMatches.filter(match => match.win).length / recentMatches.length) * 100 
        : 0;

      return {
        summoner: {
          name: summoner.name,
          level: summoner.summonerLevel,
          puuid: summoner.puuid
        },
        rankedStats,
        recentPerformance: {
          avgKills: Math.round(avgKills * 10) / 10,
          avgDeaths: Math.round(avgDeaths * 10) / 10,
          avgAssists: Math.round(avgAssists * 10) / 10,
          winRate: Math.round(winRate * 10) / 10,
          gamesPlayed: recentMatches.length
        },
        recentMatches,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Error fetching esports stats for ${summonerName}:`, error);
      throw error;
    }
  }

  // Check if player is currently in game
  async checkLiveGame(summonerName: string, region: string = 'na1'): Promise<any> {
    try {
      const summoner = await this.getSummonerByName(summonerName, region);
      const liveGame = await this.getLiveGame(summoner.id, region);
      
      return {
        isLive: true,
        gameMode: liveGame.gameMode,
        gameType: liveGame.gameType,
        gameStartTime: liveGame.gameStartTime,
        gameLength: liveGame.gameLength,
        participants: liveGame.participants.map((p: any) => ({
          summonerName: p.summonerName,
          championId: p.championId,
          teamId: p.teamId
        }))
      };
    } catch (error) {
      return { isLive: false };
    }
  }

  // Helper to map platform regions to regional routing
  private getRegionalMapping(platform: string): string {
    const mapping: { [key: string]: string } = {
      'na1': 'americas',
      'br1': 'americas',
      'la1': 'americas',
      'la2': 'americas',
      'oc1': 'americas',
      'euw1': 'europe',
      'eune1': 'europe',
      'tr1': 'europe',
      'ru': 'europe',
      'kr': 'asia',
      'jp1': 'asia'
    };
    return mapping[platform] || 'americas';
  }

  // Get API status
  getAPIStatus(): any {
    return {
      configured: !!this.apiKey,
      regions: Object.keys(riotConfig.platforms),
      rateLimits: {
        personal: '100 requests every 2 minutes',
        development: '1000 requests every 10 minutes'
      },
      endpoints: [
        'Summoner Data',
        'Ranked Stats', 
        'Match History',
        'Live Games',
        'Champion Mastery'
      ]
    };
  }
}

export const riotGamesAPI = new RiotGamesAPI();
