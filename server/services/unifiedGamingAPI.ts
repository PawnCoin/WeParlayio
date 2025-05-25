// WeParlay Unified Sports & Gaming API Service
// Integrated version of your unified API for WeParlay gaming features

import axios from 'axios';
import NodeCache from 'node-cache';

// === Caching ===
const cache = new NodeCache({ stdTTL: 60 }); // cache for 60 seconds

// === Helper with cache ===
const fetchWithCache = async (key: string, url: string, config: any = {}) => {
  if (cache.has(key)) return cache.get(key);
  try {
    const { data } = await axios.get(url, config);
    cache.set(key, data);
    return data;
  } catch (error) {
    console.error(`API fetch error for ${key}:`, error);
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
      }
    );
  }

  // === League of Legends ===
  async getRiotPlayerStats(summonerName: string, region: string = 'na1') {
    if (!RIOT_API_KEY) {
      throw new Error('Riot API key not configured');
    }
    
    const key = `riot-${summonerName}-${region}`;
    return await fetchWithCache(key,
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${RIOT_API_KEY}`
    );
  }

  async getLeagueMatches(puuid: string, region: string = 'americas') {
    if (!RIOT_API_KEY) {
      throw new Error('Riot API key not configured');
    }
    
    const key = `matches-${puuid}`;
    return await fetchWithCache(key,
      `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${RIOT_API_KEY}`
    );
  }

  // === CS:GO / Valorant ===
  async getValorantStats(username: string, tag: string) {
    if (!TRACKER_API_KEY) {
      throw new Error('Tracker API key not configured');
    }
    
    const key = `valorant-${username}-${tag}`;
    return await fetchWithCache(key,
      `https://api.tracker.gg/api/v2/valorant/standard/profile/riot/${username}%23${tag}`,
      {
        headers: { 'TRN-Api-Key': TRACKER_API_KEY }
      }
    );
  }

  async getCSGOStats(steamId: string) {
    if (!TRACKER_API_KEY) {
      throw new Error('Tracker API key not configured');
    }
    
    const key = `csgo-${steamId}`;
    return await fetchWithCache(key,
      `https://api.tracker.gg/api/v2/csgo/standard/profile/steam/${steamId}`,
      {
        headers: { 'TRN-Api-Key': TRACKER_API_KEY }
      }
    );
  }

  // === Esports Tournaments ===
  async getEsportsTournaments(game: string = 'lol') {
    if (!PANDA_API_KEY) {
      console.warn('PandaScore API key not configured, using demo data');
      return this.getDemoTournaments();
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
      console.warn('PandaScore API key not configured, using demo data');
      return this.getDemoMatches();
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

  // === Demo Data Fallbacks ===
  private getDemoTournaments() {
    return [
      {
        id: 'demo_lol_worlds',
        name: 'League of Legends World Championship',
        game: 'League of Legends',
        status: 'running',
        prize_pool: 2200000,
        start_date: new Date().toISOString()
      },
      {
        id: 'demo_csgo_major',
        name: 'CS:GO Major Championship',
        game: 'CS:GO',
        status: 'upcoming',
        prize_pool: 1000000,
        start_date: new Date(Date.now() + 86400000).toISOString()
      }
    ];
  }

  private getDemoMatches() {
    return [
      {
        id: 'demo_match_1',
        opponents: [
          { name: 'Team Liquid', logo: '🏆' },
          { name: 'FaZe Clan', logo: '⚡' }
        ],
        game: 'CS:GO',
        status: 'running',
        odds: { team1: 1.85, team2: 2.10 }
      },
      {
        id: 'demo_match_2',
        opponents: [
          { name: 'G2 Esports', logo: '🎯' },
          { name: 'Fnatic', logo: '🔥' }
        ],
        game: 'League of Legends',
        status: 'running',
        odds: { team1: 1.95, team2: 1.90 }
      }
    ];
  }

  // === API Status Check ===
  getAPIStatus() {
    return {
      fortnite: !!FORTNITE_API_KEY,
      riot: !!RIOT_API_KEY,
      tracker: !!TRACKER_API_KEY,
      pandascore: !!PANDA_API_KEY,
      message: 'Unified Gaming API status'
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