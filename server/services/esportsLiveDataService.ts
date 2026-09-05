
import axios from 'axios';
import NodeCache from 'node-cache';
import { websocketService as WebSocketService } from './websocketService';

interface EsportsMatch {
  id: string;
  game: string;
  tournament: string;
  teams: {
    team1: { name: string; score: number; logo?: string };
    team2: { name: string; score: number; logo?: string };
  };
  status: 'live' | 'upcoming' | 'completed';
  startTime: string;
  currentMap?: string;
  round?: number;
  odds: {
    team1Win: number;
    team2Win: number;
    nextKill?: { team1: number; team2: number };
    nextRound?: { team1: number; team2: number };
  };
  viewers?: number;
  stream?: string;
}

interface PlayerStats {
  playerId: string;
  playerName: string;
  team: string;
  game: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  currentForm: string;
  recentMatches: any[];
}

const cache = new NodeCache({ stdTTL: 30 }); // 30 second cache for live data

export class EsportsLiveDataService {
  private wsService: any;
  private updateInterval: NodeJS.Timeout | null = null;
  
  private readonly GRID_API_KEY = process.env.GRID_API_KEY;
  private readonly RIOT_API_KEY = process.env.RIOT_API_KEY;
  private readonly PANDASCORE_API_KEY = process.env.PANDA_API_KEY;

  constructor(wsService: any) {
    this.wsService = wsService;
    // Disable live updates to prevent WebSocket port conflicts
    console.log('🔌 EsportsLiveDataService: WebSocket updates disabled to prevent port conflicts');
  }

  async getLiveMatches(game?: string): Promise<EsportsMatch[]> {
    const cacheKey = `live-matches-${game || 'all'}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) as EsportsMatch[];
    }

    try {
      let matches: EsportsMatch[] = [];

      // Try GRID API first (most comprehensive)
      if (this.GRID_API_KEY) {
        try {
          matches = await this.getGridLiveMatches(game);
        } catch (error) {
          console.warn('GRID API failed, trying PandaScore:', error);
        }
      }

      // Fallback to PandaScore
      if (matches.length === 0 && this.PANDASCORE_API_KEY) {
        try {
          matches = await this.getPandaScoreLiveMatches(game);
        } catch (error) {
          console.warn('PandaScore API failed:', error);
        }
      }

      cache.set(cacheKey, matches);
      return matches;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      return [];
    }
  }

  private async getGridLiveMatches(game?: string): Promise<EsportsMatch[]> {
    const query = `
      query GetLiveMatches($game: String) {
        series(
          where: { 
            status: RUNNING,
            videogame: { name: { _ilike: $game } }
          }
          limit: 20
        ) {
          id
          name
          status
          begin_at
          videogame {
            name
            slug
          }
          matches {
            id
            status
            begin_at
            opponents {
              opponent {
                id
                name
                image_url
              }
            }
            results {
              score
              team_id
            }
          }
          live {
            viewers_count
            twitch_stream_url
          }
        }
      }
    `;

    const response = await axios.post('https://api.grid.gg/central-data/graphql', {
      query,
      variables: { game }
    }, {
      headers: {
        'Authorization': `Bearer ${this.GRID_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return this.transformGridData(response.data.data.series);
  }

  private async getPandaScoreLiveMatches(game?: string): Promise<EsportsMatch[]> {
    const gameSlug = this.getGameSlug(game);
    const url = gameSlug 
      ? `https://api.pandascore.co/${gameSlug}/matches/running`
      : 'https://api.pandascore.co/matches/running';

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${this.PANDASCORE_API_KEY}`
      }
    });

    return this.transformPandaScoreData(response.data);
  }

  async getPlayerStats(playerName: string, game: string): Promise<PlayerStats | null> {
    const cacheKey = `player-stats-${playerName}-${game}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) as PlayerStats;
    }

    try {
      let stats: PlayerStats | null = null;

      switch (game.toLowerCase()) {
        case 'lol':
        case 'league of legends':
          if (this.RIOT_API_KEY) {
            stats = await this.getRiotPlayerStats(playerName);
          }
          break;
        case 'valorant':
          if (this.RIOT_API_KEY) {
            const [username, tag] = playerName.split('#');
            if (username && tag) {
              stats = await this.getValorantPlayerStats(username, tag);
            }
          }
          break;
        default:
          stats = this.getMockPlayerStats(playerName, game);
      }

      if (stats) {
        cache.set(cacheKey, stats);
      }

      return stats;
    } catch (error) {
      console.error(`Error fetching player stats for ${playerName}:`, error);
      return this.getMockPlayerStats(playerName, game);
    }
  }

  private async getRiotPlayerStats(playerName: string): Promise<PlayerStats | null> {
    // Implementation for Riot API player stats
    // This would use your existing RiotGamesAPI service
    return null; // Placeholder
  }

  private getMockPlayerStats(playerName: string, game: string): PlayerStats {
    return {
      playerId: `${playerName}-${game}`,
      playerName,
      team: 'Unknown',
      game,
      kills: Math.floor(Math.random() * 20) + 5,
      deaths: Math.floor(Math.random() * 10) + 2,
      assists: Math.floor(Math.random() * 15) + 3,
      kda: parseFloat((Math.random() * 3 + 0.5).toFixed(2)),
      currentForm: 'Good form - 8/10 recent wins',
      recentMatches: []
    };
  }

  private startLiveUpdates(): void {
    // WebSocket live updates disabled to prevent port conflicts
    console.log('🔌 EsportsLiveDataService: Live updates disabled - WebSocket broadcasting not available');
    return;
  }

  private transformGridData(seriesData: any[]): EsportsMatch[] {
    return seriesData.map(series => ({
      id: series.id,
      game: series.videogame?.name || 'Unknown',
      tournament: series.name,
      teams: {
        team1: {
          name: series.matches?.[0]?.opponents?.[0]?.opponent?.name || 'Team 1',
          score: 0,
          logo: series.matches?.[0]?.opponents?.[0]?.opponent?.image_url
        },
        team2: {
          name: series.matches?.[0]?.opponents?.[1]?.opponent?.name || 'Team 2',
          score: 0,
          logo: series.matches?.[0]?.opponents?.[1]?.opponent?.image_url
        }
      },
      status: 'live' as const,
      startTime: series.begin_at,
      odds: undefined,
      viewers: series.live?.viewers_count,
      stream: series.live?.twitch_stream_url
    }));
  }

  private transformPandaScoreData(matchesData: any[]): EsportsMatch[] {
    return matchesData.map(match => ({
      id: match.id.toString(),
      game: match.videogame?.name || 'Unknown',
      tournament: match.tournament?.name || 'Tournament',
      teams: {
        team1: {
          name: match.opponents?.[0]?.opponent?.name || 'Team 1',
          score: 0
        },
        team2: {
          name: match.opponents?.[1]?.opponent?.name || 'Team 2',
          score: 0
        }
      },
      status: 'live' as const,
      startTime: match.begin_at,
      odds: undefined
    }));
  }

  private getGameSlug(game?: string): string | null {
    if (!game) return null;
    
    const gameMap: { [key: string]: string } = {
      'lol': 'lol',
      'league of legends': 'lol',
      'cs2': 'cs-go',
      'csgo': 'cs-go',
      'valorant': 'valorant',
      'dota2': 'dota-2',
      'dota 2': 'dota-2'
    };

    return gameMap[game.toLowerCase()] || null;
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}
