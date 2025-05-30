
<line_number>1</line_number>
// ESPN Asset Service - Server-side asset management and caching
import fetch from 'node-fetch';

interface ESPNTeam {
  id: string;
  name: string;
  displayName: string;
  abbreviation: string;
  logos: Array<{
    href: string;
    width: number;
    height: number;
  }>;
}

interface ESPNPlayer {
  id: string;
  displayName: string;
  headshot?: {
    href: string;
  };
}

export class ESPNAssetService {
  private static cache = new Map<string, any>();
  private static CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  // Get all teams for a sport from ESPN API
  static async getTeams(sport: string): Promise<ESPNTeam[]> {
    const cacheKey = `teams-${sport}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const sportMappings: Record<string, string> = {
        'nba': 'basketball/nba',
        'nfl': 'football/nfl',
        'mlb': 'baseball/mlb',
        'nhl': 'hockey/nhl',
        'ncaaf': 'football/college-football',
        'ncaab': 'basketball/mens-college-basketball'
      };

      const espnSport = sportMappings[sport.toLowerCase()];
      if (!espnSport) {
        throw new Error(`Unsupported sport: ${sport}`);
      }

      const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${espnSport}/teams`);
      
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      const teams = data.sports?.[0]?.leagues?.[0]?.teams?.map((team: any) => team.team) || [];

      this.cache.set(cacheKey, {
        data: teams,
        timestamp: Date.now()
      });

      console.log(`✅ Fetched ${teams.length} ${sport.toUpperCase()} teams from ESPN`);
      return teams;

    } catch (error) {
      console.error(`Failed to fetch ESPN teams for ${sport}:`, error);
      return [];
    }
  }

  // Get players for a team from ESPN API
  static async getTeamRoster(sport: string, teamId: string): Promise<ESPNPlayer[]> {
    const cacheKey = `roster-${sport}-${teamId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const sportMappings: Record<string, string> = {
        'nba': 'basketball/nba',
        'nfl': 'football/nfl',
        'mlb': 'baseball/mlb',
        'nhl': 'hockey/nhl'
      };

      const espnSport = sportMappings[sport.toLowerCase()];
      if (!espnSport) {
        throw new Error(`Unsupported sport: ${sport}`);
      }

      const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${espnSport}/teams/${teamId}/roster`);
      
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      const players = data.athletes || [];

      this.cache.set(cacheKey, {
        data: players,
        timestamp: Date.now()
      });

      console.log(`✅ Fetched ${players.length} players for team ${teamId}`);
      return players;

    } catch (error) {
      console.error(`Failed to fetch ESPN roster for ${sport}/${teamId}:`, error);
      return [];
    }
  }

  // Generate optimized asset URLs
  static getOptimizedAssetUrl(originalUrl: string, width: number = 500, height?: number): string {
    try {
      const url = new URL(originalUrl);
      
      // For ESPN CDN URLs, add size parameters
      if (url.hostname.includes('espncdn.com')) {
        url.searchParams.set('w', width.toString());
        if (height) {
          url.searchParams.set('h', height.toString());
        }
      }
      
      return url.toString();
    } catch {
      return originalUrl;
    }
  }

  // Batch fetch multiple assets
  static async batchFetchAssets(requests: Array<{type: 'team' | 'player', sport: string, id: string}>): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    
    const teamRequests = requests.filter(r => r.type === 'team');
    const playerRequests = requests.filter(r => r.type === 'player');

    // Process team requests by sport
    const teamsBySport = teamRequests.reduce((acc, req) => {
      if (!acc[req.sport]) acc[req.sport] = [];
      acc[req.sport].push(req.id);
      return acc;
    }, {} as Record<string, string[]>);

    for (const [sport, teamIds] of Object.entries(teamsBySport)) {
      try {
        const teams = await this.getTeams(sport);
        teams.forEach(team => {
          if (teamIds.includes(team.id)) {
            results.set(`team-${sport}-${team.id}`, team);
          }
        });
      } catch (error) {
        console.error(`Batch fetch error for ${sport} teams:`, error);
      }
    }

    // Process player requests (would need individual API calls)
    for (const req of playerRequests) {
      try {
        // This would require knowing the team ID for the player
        // Implementation depends on your specific needs
        results.set(`player-${req.sport}-${req.id}`, null);
      } catch (error) {
        console.error(`Batch fetch error for player ${req.id}:`, error);
      }
    }

    return results;
  }

  // Clear cache
  static clearCache(): void {
    this.cache.clear();
    console.log('🗑️ ESPN asset cache cleared');
  }

  // Get cache stats
  static getCacheStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
