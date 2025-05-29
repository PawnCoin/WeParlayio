// WeParlay Unified Sports & Gaming API Service
// Integrated version of your unified API for WeParlay gaming features

import axios from 'axios';
import NodeCache from 'node-cache';
import { apiRateLimitManager } from './apiRateLimitManager';

// === Caching ===
const cache = new NodeCache({ stdTTL: 60 }); // cache for 60 seconds

// === Helper with cache and rate limiting ===
const fetchWithCache = async (key: string, url: string, config: any = {}, apiName: string = 'unknown') => {
  // Check cache first
  if (cache.has(key)) {
    console.log(`📦 Cache hit for ${key}`);
    return cache.get(key);
  }

  // Check rate limits
  if (!(await apiRateLimitManager.canMakeRequest(apiName))) {
    console.warn(`⚠️ API limit reached for ${apiName}. Checking for fallback options...`);
    
    // Try to get emergency fallback data
    try {
      const fallbackData = await apiRateLimitManager.getEmergencyFallbackData(key);
      if (fallbackData && !fallbackData.error) {
        console.log(`🆘 Using emergency fallback for ${key}`);
        return fallbackData;
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
    
    throw new Error(`API rate limit exceeded for ${apiName}. No fallback available.`);
  }

  try {
    console.log(`🌐 Making API request to ${apiName} for ${key}`);
    const { data } = await axios.get(url, {
      ...config,
      timeout: 10000, // 10 second timeout
      validateStatus: (status) => status < 500 // Don't throw on 4xx errors
    });

    if (data) {
      cache.set(key, data);
      await apiRateLimitManager.recordRequest(apiName);
      console.log(`✅ Successfully cached ${key}`);
      return data;
    } else {
      throw new Error('No data received from API');
    }
  } catch (error: any) {
    console.error(`🚨 API fetch error for ${key}:`, {
      status: error.response?.status,
      message: error.message,
      apiName
    });

    // Try emergency fallback on any error
    try {
      const fallbackData = await apiRateLimitManager.getEmergencyFallbackData(key);
      if (fallbackData && !fallbackData.error) {
        console.log(`🆘 Using emergency fallback after API error for ${key}`);
        return fallbackData;
      }
    } catch (fallbackError) {
      console.error('Fallback failed after API error:', fallbackError);
    }

    throw error;
  }
};

// === API Keys from environment ===
const FORTNITE_API_KEY = process.env.FORTNITE_API_KEY;
const TRACKER_API_KEY = process.env.TRACKER_API_KEY;
const RIOT_API_KEY = process.env.RIOT_API_KEY;
const PANDA_API_KEY = process.env.PANDA_API_KEY;

export class UnifiedGamingAPI {

  // === Fortnite Stats ===
  async getFortniteStats(username: string) {
    if (!FORTNITE_API_KEY) {
      throw new Error('Fortnite API key not configured');
    }

    const key = `fortnite-${username}`;
    return await fetchWithCache(key, 
      `https://fortnite-api.com/v2/stats/br/v2?name=${username}`, 
      {
        headers: { Authorization: FORTNITE_API_KEY }
      },
      'fortnite_api'
    );
  }

  // === League of Legends - Updated Riot API ===
  async getRiotPlayerStats(summonerName: string, region: string = 'na1') {
    if (!RIOT_API_KEY) {
      throw new Error('Riot API key not configured');
    }

    try {
      const key = `riot-${summonerName}-${region}`;

      // Get summoner data
      const summoner = await fetchWithCache(key,
        `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
        {
          headers: { 'X-Riot-Token': RIOT_API_KEY }
        }
      );

      if (!summoner || !summoner.puuid) {
        throw new Error('Summoner not found');
      }

      // Get ranked data
      const rankedKey = `riot-ranked-${summoner.id}`;
      const rankedData = await fetchWithCache(rankedKey,
        `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`,
        {
          headers: { 'X-Riot-Token': RIOT_API_KEY }
        }
      );

      return {
        ...summoner,
        rankedData: rankedData || []
      };
    } catch (error) {
      console.error('Riot API error:', error);
      throw error;
    }
  }

  async getLeagueMatches(puuid: string, region: string = 'americas') {
    if (!RIOT_API_KEY) {
      throw new Error('Riot API key not configured');
    }

    try {
      const key = `matches-${puuid}`;
      const matchIds = await fetchWithCache(key,
        `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`,
        {
          headers: { 'X-Riot-Token': RIOT_API_KEY }
        }
      );

      if (!matchIds || matchIds.length === 0) {
        return [];
      }

      // Get detailed match data for first 5 matches
      const detailedMatches = await Promise.all(
        matchIds.slice(0, 5).map(async (matchId: string) => {
          const matchKey = `match-detail-${matchId}`;
          return await fetchWithCache(matchKey,
            `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
            {
              headers: { 'X-Riot-Token': RIOT_API_KEY }
            }
          );
        })
      );

      return detailedMatches.filter(match => match !== null);
    } catch (error) {
      console.error('League matches error:', error);
      throw error;
    }
  }

  // New: Get live game data
  async getLiveGame(summonerName: string, region: string = 'na1') {
    if (!RIOT_API_KEY) {
      throw new Error('Riot API key not configured');
    }

    try {
      // First get summoner ID
      const summoner = await this.getRiotPlayerStats(summonerName, region);

      const key = `live-game-${summoner.id}`;
      return await fetchWithCache(key,
        `https://${region}.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summoner.id}`,
        {
          headers: { 'X-Riot-Token': RIOT_API_KEY }
        }
      );
    } catch (error) {
      if (error.message?.includes('404')) {
        return null; // Player not in game
      }
      console.error('Live game error:', error);
      throw error;
    }
  }

  // New: Get champion mastery
  async getChampionMastery(summonerName: string, region: string = 'na1') {
    if (!RIOT_API_KEY) {
      throw new Error('Riot API key not configured');
    }

    try {
      const summoner = await this.getRiotPlayerStats(summonerName, region);

      const key = `mastery-${summoner.id}`;
      return await fetchWithCache(key,
        `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summoner.id}`,
        {
          headers: { 'X-Riot-Token': RIOT_API_KEY }
        }
      );
    } catch (error) {
      console.error('Champion mastery error:', error);
      throw error;
    }
  }

  // === Valorant - Updated Riot API ===
  async getValorantStats(username: string, tag: string, region: string = 'na') {
    if (!RIOT_API_KEY) {
      console.warn('Riot API key not configured, falling back to Tracker.gg');
      return this.getValorantStatsTracker(username, tag);
    }

    try {
      const key = `valorant-${username}-${tag}-${region}`;

      // Get account data first
      const account = await fetchWithCache(`valorant-account-${username}-${tag}`,
        `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(username)}/${encodeURIComponent(tag)}`,
        {
          headers: { 'X-Riot-Token': RIOT_API_KEY }
        }
      );

      if (!account || !account.puuid) {
        throw new Error('Valorant account not found');
      }

      // Get competitive data
      const competitive = await fetchWithCache(`valorant-competitive-${account.puuid}`,
        `https://${region}.api.riotgames.com/val/ranked/v1/leaderboards/by-act/d929bc38-4ab6-7da4-94f0-ee84f8ac141e?size=200&startIndex=0`,
        {
          headers: { 'X-Riot-Token': RIOT_API_KEY }
        }
      );

      return {
        account,
        competitive,
        playerFound: true
      };
    } catch (error) {
      console.error('Valorant API error, falling back to Tracker.gg:', error);
      return this.getValorantStatsTracker(username, tag);
    }
  }

  // Fallback method using Tracker.gg
  private async getValorantStatsTracker(username: string, tag: string) {
    if (!TRACKER_API_KEY) {
      return {
        error: 'Tracker.gg API key pending approval',
        message: 'Valorant stats will be available once API access is approved',
        username: username,
        tag: tag,
        status: 'pending_approval'
      };
    }

    const key = `valorant-tracker-${username}-${tag}`;
    try {
      return await fetchWithCache(key,
        `https://api.tracker.gg/api/v2/valorant/standard/profile/riot/${username}%23${tag}`,
        {
          headers: { 'TRN-Api-Key': TRACKER_API_KEY }
        },
        'tracker_gg'
      );
    } catch (error: any) {
      if (error.message?.includes('401') || error.message?.includes('403')) {
        return {
          error: 'Tracker.gg API access not yet approved',
          message: 'Please check API key approval status',
          username: username,
          tag: tag,
          status: 'approval_pending'
        };
      }
      throw error;
    }
  }

  // New: Get Valorant match history
  async getValorantMatches(puuid: string, region: string = 'na') {
    if (!RIOT_API_KEY) {
      throw new Error('Riot API key not configured');
    }

    try {
      const key = `valorant-matches-${puuid}`;
      return await fetchWithCache(key,
        `https://${region}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${puuid}`,
        {
          headers: { 'X-Riot-Token': RIOT_API_KEY }
        }
      );
    } catch (error) {
      console.error('Valorant matches error:', error);
      throw error;
    }
  }

  async getCSGOStats(steamId: string) {
    if (!TRACKER_API_KEY) {
      return {
        error: 'Tracker.gg API key pending approval',
        message: 'CS:GO stats will be available once API access is approved',
        steamId: steamId,
        status: 'pending_approval'
      };
    }

    const key = `csgo-${steamId}`;
    try {
      return await fetchWithCache(key,
        `https://api.tracker.gg/api/v2/csgo/standard/profile/steam/${steamId}`,
        {
          headers: { 'TRN-Api-Key': TRACKER_API_KEY }
        },
        'tracker_gg'
      );
    } catch (error: any) {
      if (error.message?.includes('401') || error.message?.includes('403')) {
        return {
          error: 'Tracker.gg API access not yet approved',
          message: 'Please check API key approval status',
          steamId: steamId,
          status: 'approval_pending'
        };
      }
      throw error;
    }
  }

  // === Esports Tournaments ===
  async getEsportsTournaments(game: string = 'lol') {
    if (!PANDA_API_KEY) {
      throw new Error('PandaScore API key not configured - no tournaments available');
    }

    const key = `tournaments-${game}`;
    return await fetchWithCache(key,
      `https://api.pandascore.co/${game}/tournaments/running`,
      {
        headers: { Authorization: `Bearer ${PANDA_API_KEY}` }
      }
    );
  }

  async getEsportsMatches(game: string = 'lol') {
    if (!PANDA_API_KEY) {
      throw new Error('PandaScore API key not configured - no matches available');
    }

    const key = `matches-${game}`;
    return await fetchWithCache(key,
      `https://api.pandascore.co/${game}/matches/running`,
      {
        headers: { Authorization: `Bearer ${PANDA_API_KEY}` }
      }
    );
  }

  // === Sports APIs ===
  async getNBAPlayers() {
    const key = 'nba-players';
    return await fetchWithCache(key, 'https://www.balldontlie.io/api/v1/players');
  }

  async getCollegeFootballTeams() {
    const key = 'cfb-teams';
    return await fetchWithCache(key, 'https://api.collegefootballdata.com/teams');
  }

  async getCollegeFootballGames(year: number = new Date().getFullYear()) {
    const key = `cfb-games-${year}`;
    return await fetchWithCache(key, `https://api.collegefootballdata.com/games?year=${year}`);
  }

  // === Real API Data Only ===
  private async getRealTournaments(game: string) {
    if (!PANDA_API_KEY) {
      throw new Error('PandaScore API key required for tournament data');
    }

    const key = `real-tournaments-${game}`;
    return await fetchWithCache(key,
      `https://api.pandascore.co/${game}/tournaments/running`,
      {
        headers: { Authorization: `Bearer ${PANDA_API_KEY}` }
      }
    );
  }

  private async getRealMatches(game: string) {
    if (!PANDA_API_KEY) {
      throw new Error('PandaScore API key required for match data');
    }

    const key = `real-matches-${game}`;
    return await fetchWithCache(key,
      `https://api.pandascore.co/${game}/matches/running`,
      {
        headers: { Authorization: `Bearer ${PANDA_API_KEY}` }
      }
    );
  }

  // === API Status Check ===
  getAPIStatus() {
    return {
      fortnite: !!FORTNITE_API_KEY,
      riot: !!RIOT_API_KEY,
      tracker: TRACKER_API_KEY ? 'installed_pending_approval' : false,
      pandascore: !!PANDA_API_KEY,
      message: 'Unified Gaming API status',
      tracker_status: TRACKER_API_KEY ? 'API key installed, awaiting approval from Tracker.gg' : 'Not configured'
    };
  }

  // === Gaming Performance Analysis ===
  async analyzeGamingPerformance(platform: string, username: string, game: string) {
    let stats;

    try {
      switch (game.toLowerCase()) {
        case 'fortnite':
          stats = await this.getFortniteStats(username);
          break;
        case 'league of legends':
        case 'lol':
          stats = await this.getRiotPlayerStats(username);
          break;
        case 'valorant':
          const [name, tag] = username.split('#');
          stats = await this.getValorantStats(name, tag);
          break;
        case 'csgo':
        case 'cs:go':
          stats = await this.getCSGOStats(username);
          break;
        default:
          throw new Error(`Game ${game} not supported yet`);
      }

      return {
        platform,
        username,
        game,
        stats,
        performance_rating: this.calculatePerformanceRating(stats, game),
        betting_recommendations: this.generateBettingRecommendations(stats, game)
      };
    } catch (error) {
      console.error('Gaming performance analysis error:', error);
      throw error;
    }
  }

  private calculatePerformanceRating(stats: any, game: string): number {
    // Simple performance rating calculation
    // In production, this would be more sophisticated
    switch (game.toLowerCase()) {
      case 'fortnite':
        return Math.min(100, (stats.overall?.wins || 0) * 2 + (stats.overall?.kd || 0) * 10);
      case 'league of legends':
        return Math.min(100, (stats.rank?.tier_points || 0) / 10);
      default:
        return 50; // Default rating
    }
  }

  private generateBettingRecommendations(stats: any, game: string) {
    const rating = this.calculatePerformanceRating(stats, game);

    return {
      confidence: rating > 70 ? 'high' : rating > 40 ? 'medium' : 'low',
      recommended_bets: [
        `Match winner (confidence: ${rating > 60 ? 'high' : 'medium'})`,
        `Performance over/under (confidence: ${rating > 50 ? 'high' : 'low'})`
      ],
      risk_level: rating > 70 ? 'low' : rating > 40 ? 'medium' : 'high'
    };
  }
}

export const unifiedGamingAPI = new UnifiedGamingAPI();