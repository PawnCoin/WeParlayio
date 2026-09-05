/**
 * Pinnacle Odds Service - Primary odds provider for all sports categories
 * Connects to Pinnacle via RapidAPI for authentic betting odds
 */

export class PinnacleOddsService {
  private apiKey: string;
  private baseUrl = 'https://pinnacle-odds.p.rapidapi.com';
  
  // Sport mappings for Pinnacle API
  private sportMappings = {
    'basketball': { id: 4, name: 'Basketball' },
    'americanfootball_nfl': { id: 1, name: 'American Football' },
    'soccer': { id: 29, name: 'Soccer' },
    'tennis': { id: 33, name: 'Tennis' },
    'baseball': { id: 3, name: 'Baseball' },
    'icehockey': { id: 12, name: 'Ice Hockey' },
    'mma': { id: 18, name: 'Combat Sports' },
    'boxing': { id: 9, name: 'Boxing' },
    'golf': { id: 11, name: 'Golf' },
    'cricket': { id: 21, name: 'Cricket' }
  };

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY!;
    if (!this.apiKey) {
      console.warn('⚠️ RAPIDAPI_KEY not configured - Pinnacle Odds unavailable');
    }
  }

  /**
   * Get comprehensive odds from Pinnacle for a specific sport
   */
  async getPinnacleOdds(sport: string): Promise<any[]> {
    if (!this.apiKey) {
      console.log('🔒 Pinnacle API key not available');
      return [];
    }

    try {
      const sportConfig = this.sportMappings[sport as keyof typeof this.sportMappings];
      if (!sportConfig) {
        console.log(`🚫 Sport '${sport}' not supported by Pinnacle`);
        return [];
      }

      console.log(`🔄 Trying Pinnacle Odds for ${sportConfig.name} (Sport ID: ${sportConfig.id})`);

      const response = await fetch(`${this.baseUrl}/kit/v1/markets?sport_id=${sportConfig.id}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'pinnacle-odds.p.rapidapi.com',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ Pinnacle API ${response.status}: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      console.log(`✅ Pinnacle API: Retrieved ${data?.events?.length || 0} events for ${sportConfig.name}`);
      
      // Transform Pinnacle data to WeParlay format
      if (data?.events && Array.isArray(data.events)) {
        return data.events.filter((event: any) =>
          event.start_time &&
          (event.home_team || event.participants?.[0]?.name) &&
          (event.away_team || event.participants?.[1]?.name) &&
          (event.home_ml != null || event.away_ml != null || event.spread != null || event.total != null)
        ).slice(0, 10).map((event: any, index: number) => {
          const homeTeam = event.home_team || event.participants[0].name;
          const awayTeam = event.away_team || event.participants[1].name;

          return {
            eventId: `pinnacle_${event.id || index}_${Date.now()}`,
            sport: sportConfig.name,
            homeTeam,
            awayTeam,
            status: event.status === 'live' ? 'live' : 'upcoming',
            startTime: event.start_time,
            lastUpdate: new Date().toISOString(),
            period: event.status === 'live' ? event.period : undefined,
            timeRemaining: event.status === 'live' ? event.time_remaining : undefined,
            score: event.status === 'live' && event.score ? {
              home: event.score.home,
              away: event.score.away
            } : undefined,
            odds: {
              spread: {
                home: event.spread,
                away: event.spread != null ? -event.spread : null,
                homeOdds: event.home_spread_odds ?? null,
                awayOdds: event.away_spread_odds ?? null
              },
              moneyline: {
                home: event.home_ml ?? null,
                away: event.away_ml ?? null
              },
              total: {
                over: event.total ?? null,
                under: event.total ?? null,
                overOdds: event.over_odds ?? null,
                underOdds: event.under_odds ?? null
              }
            },
            bookmaker: 'Pinnacle',
            source: 'Pinnacle-RapidAPI',
            confidence: 'high'
          };
        });
      }

      return [];
    } catch (error) {
      console.error(`❌ Pinnacle Odds API error for ${sport}:`, error);
      return [];
    }
  }

  /**
   * Get live odds for multiple sports simultaneously
   */
  async getMultiSportOdds(sports: string[]): Promise<{ [sport: string]: any[] }> {
    const results: { [sport: string]: any[] } = {};
    
    await Promise.allSettled(
      sports.map(async (sport) => {
        results[sport] = await this.getPinnacleOdds(sport);
      })
    );

    return results;
  }

  /**
   * Get supported sports list
   */
  getSupportedSports(): string[] {
    return Object.keys(this.sportMappings);
  }

  /**
   * Check if a sport is supported
   */
  isSportSupported(sport: string): boolean {
    return sport in this.sportMappings;
  }

  /**
   * Get sport configuration
   */
  getSportConfig(sport: string) {
    return this.sportMappings[sport as keyof typeof this.sportMappings];
  }

  // Method for getting completed games (results)
  async getCompletedGames(): Promise<any[]> {
    // The markets endpoint is not an authoritative result source.
    return [];
  }
}

// Export singleton instance
export const pinnacleOddsService = new PinnacleOddsService();
