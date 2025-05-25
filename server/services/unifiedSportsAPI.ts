import fetch from 'node-fetch';

interface SportsOdds {
  sport: string;
  event: string;
  teams: string[];
  odds: {
    source: string;
    moneyline?: number[];
    spread?: { points: number; odds: number[] };
    total?: { points: number; odds: number[] };
  }[];
  startTime: string;
  live: boolean;
}

interface APISource {
  name: string;
  url: string;
  key?: string;
  sports: string[];
  rateLimit: number;
  lastCall: number;
}

export class UnifiedSportsAPI {
  private sources: APISource[] = [
    {
      name: 'TheOddsAPI',
      url: 'https://api.the-odds-api.com/v4',
      key: process.env.THE_ODDS_API_KEY,
      sports: ['americanfootball_nfl', 'basketball_nba', 'baseball_mlb', 'icehockey_nhl', 'soccer_epl', 'tennis_wta'],
      rateLimit: 500,
      lastCall: 0
    },
    {
      name: 'ESPN',
      url: 'https://site.api.espn.com/apis/site/v2/sports',
      sports: ['football/nfl', 'basketball/nba', 'baseball/mlb', 'hockey/nhl', 'soccer/usa.1', 'tennis'],
      rateLimit: 1000,
      lastCall: 0
    },
    {
      name: 'SportsData',
      url: 'https://api.sportsdata.io/v3',
      sports: ['nfl', 'nba', 'mlb', 'nhl', 'soccer', 'tennis', 'golf', 'mma', 'boxing'],
      rateLimit: 1000,
      lastCall: 0
    },
    {
      name: 'API-Football',
      url: 'https://v3.football.api-sports.io',
      sports: ['premier-league', 'champions-league', 'la-liga', 'bundesliga', 'serie-a', 'ligue-1'],
      rateLimit: 100,
      lastCall: 0
    },
    {
      name: 'RapidAPI-Sports',
      url: 'https://api-nba-v1.p.rapidapi.com',
      sports: ['nba', 'nfl', 'mlb', 'nhl'],
      rateLimit: 500,
      lastCall: 0
    }
  ];

  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  // Rate limiting check
  private canMakeRequest(source: APISource): boolean {
    const now = Date.now();
    const timeSinceLastCall = now - source.lastCall;
    return timeSinceLastCall >= source.rateLimit;
  }

  // Cache management
  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCached(key: string, data: any, ttlMinutes: number = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  // The Odds API integration
  async getTheOddsAPIData(sport: string): Promise<SportsOdds[]> {
    const cacheKey = `odds_api_${sport}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const source = this.sources.find(s => s.name === 'TheOddsAPI');
    if (!source?.key || !this.canMakeRequest(source)) return [];

    try {
      const response = await fetch(
        `${source.url}/sports/${sport}/odds?apiKey=${source.key}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`,
        { headers: { 'Accept': 'application/json' } }
      );

      source.lastCall = Date.now();

      if (!response.ok) return [];

      const data = await response.json() as any[];
      const odds: SportsOdds[] = data.map(game => ({
        sport: game.sport_title,
        event: `${game.away_team} @ ${game.home_team}`,
        teams: [game.away_team, game.home_team],
        odds: game.bookmakers?.map((book: any) => ({
          source: book.title,
          moneyline: book.markets?.find((m: any) => m.key === 'h2h')?.outcomes?.map((o: any) => o.price),
          spread: book.markets?.find((m: any) => m.key === 'spreads')?.outcomes?.map((o: any) => ({
            points: o.point,
            odds: o.price
          })),
          total: book.markets?.find((m: any) => m.key === 'totals')?.outcomes?.map((o: any) => ({
            points: o.point,
            odds: o.price
          }))
        })) || [],
        startTime: game.commence_time,
        live: new Date(game.commence_time) <= new Date()
      }));

      this.setCached(cacheKey, odds, 10);
      return odds;
    } catch (error) {
      console.error('The Odds API error:', error);
      return [];
    }
  }

  // ESPN API integration
  async getESPNData(sport: string): Promise<SportsOdds[]> {
    const cacheKey = `espn_${sport}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const source = this.sources.find(s => s.name === 'ESPN');
    if (!this.canMakeRequest(source!)) return [];

    try {
      const response = await fetch(
        `${source!.url}/${sport}/scoreboard`,
        { headers: { 'Accept': 'application/json' } }
      );

      source!.lastCall = Date.now();

      if (!response.ok) return [];

      const data = await response.json() as any;
      const odds: SportsOdds[] = data.events?.map((event: any) => ({
        sport: data.leagues?.[0]?.name || sport,
        event: event.name,
        teams: event.competitions?.[0]?.competitors?.map((c: any) => c.team.displayName) || [],
        odds: [{
          source: 'ESPN',
          moneyline: event.competitions?.[0]?.odds?.[0]?.details?.split(' ').map((o: string) => parseInt(o)) || []
        }],
        startTime: event.date,
        live: event.status?.type?.state === 'in'
      })) || [];

      this.setCached(cacheKey, odds, 15);
      return odds;
    } catch (error) {
      console.error('ESPN API error:', error);
      return [];
    }
  }

  // API-Football integration for soccer
  async getFootballAPIData(league: string): Promise<SportsOdds[]> {
    const cacheKey = `football_api_${league}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures?league=${league}&season=2024`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
            'X-RapidAPI-Host': 'v3.football.api-sports.io'
          }
        }
      );

      if (!response.ok) return [];

      const data = await response.json() as any;
      const odds: SportsOdds[] = data.response?.slice(0, 20).map((fixture: any) => ({
        sport: 'Soccer',
        event: `${fixture.teams.away.name} vs ${fixture.teams.home.name}`,
        teams: [fixture.teams.away.name, fixture.teams.home.name],
        odds: [{
          source: 'API-Football',
          moneyline: [] // Would need separate odds endpoint
        }],
        startTime: fixture.fixture.date,
        live: fixture.fixture.status.short === 'LIVE'
      })) || [];

      this.setCached(cacheKey, odds, 30);
      return odds;
    } catch (error) {
      console.error('API-Football error:', error);
      return [];
    }
  }

  // Get all available sports odds
  async getAllSportsOdds(): Promise<SportsOdds[]> {
    const allOdds: SportsOdds[] = [];

    // Major American Sports
    const americanSports = ['americanfootball_nfl', 'basketball_nba', 'baseball_mlb', 'icehockey_nhl'];
    for (const sport of americanSports) {
      const odds = await this.getTheOddsAPIData(sport);
      allOdds.push(...odds);
    }

    // International Soccer
    const soccerLeagues = ['39', '140', '78', '135', '61', '2']; // EPL, La Liga, Bundesliga, etc.
    for (const league of soccerLeagues) {
      const odds = await this.getFootballAPIData(league);
      allOdds.push(...odds);
    }

    // Tennis and Other Sports
    const otherSports = ['tennis_wta', 'tennis_atp', 'mma_mixed_martial_arts', 'boxing_heavyweight'];
    for (const sport of otherSports) {
      const odds = await this.getTheOddsAPIData(sport);
      allOdds.push(...odds);
    }

    // ESPN backup data
    const espnSports = ['football/nfl', 'basketball/nba', 'baseball/mlb', 'hockey/nhl'];
    for (const sport of espnSports) {
      const espnOdds = await this.getESPNData(sport);
      // Merge with existing odds or add new ones
      espnOdds.forEach(newOdd => {
        const existing = allOdds.find(o => o.event === newOdd.event);
        if (existing) {
          existing.odds.push(...newOdd.odds);
        } else {
          allOdds.push(newOdd);
        }
      });
    }

    return allOdds;
  }

  // Get odds for specific sport
  async getSportOdds(sport: string): Promise<SportsOdds[]> {
    const cacheKey = `unified_${sport}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    let odds: SportsOdds[] = [];

    // Try The Odds API first
    odds = await this.getTheOddsAPIData(sport);

    // If no data, try ESPN as backup
    if (odds.length === 0) {
      const espnSportMap: { [key: string]: string } = {
        'americanfootball_nfl': 'football/nfl',
        'basketball_nba': 'basketball/nba',
        'baseball_mlb': 'baseball/mlb',
        'icehockey_nhl': 'hockey/nhl'
      };
      
      const espnSport = espnSportMap[sport];
      if (espnSport) {
        odds = await this.getESPNData(espnSport);
      }
    }

    this.setCached(cacheKey, odds, 5);
    return odds;
  }

  // Get live games across all sports
  async getLiveGames(): Promise<SportsOdds[]> {
    const allOdds = await this.getAllSportsOdds();
    return allOdds.filter(game => game.live);
  }

  // Get upcoming games
  async getUpcomingGames(hours: number = 24): Promise<SportsOdds[]> {
    const allOdds = await this.getAllSportsOdds();
    const cutoff = new Date(Date.now() + hours * 60 * 60 * 1000);
    
    return allOdds
      .filter(game => !game.live && new Date(game.startTime) <= cutoff)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  // Find best odds across all sources
  getBestOdds(gameOdds: SportsOdds): any {
    if (!gameOdds.odds.length) return null;

    const bestMoneyline = gameOdds.odds.reduce((best, current) => {
      if (!current.moneyline || !best.moneyline) return current.moneyline ? current : best;
      
      const currentSum = current.moneyline.reduce((sum, odd) => sum + (odd > 0 ? odd : -odd), 0);
      const bestSum = best.moneyline.reduce((sum, odd) => sum + (odd > 0 ? odd : -odd), 0);
      
      return currentSum > bestSum ? current : best;
    }, gameOdds.odds[0]);

    return {
      bestSource: bestMoneyline.source,
      moneyline: bestMoneyline.moneyline,
      spread: bestMoneyline.spread,
      total: bestMoneyline.total
    };
  }

  // Get API status
  getAPIStatus(): any {
    return {
      sources: this.sources.map(source => ({
        name: source.name,
        available: source.key ? true : source.name === 'ESPN',
        rateLimit: source.rateLimit,
        sports: source.sports.length,
        lastCall: source.lastCall
      })),
      cache_size: this.cache.size,
      total_sports_covered: [...new Set(this.sources.flatMap(s => s.sports))].length
    };
  }
}

export const unifiedSportsAPI = new UnifiedSportsAPI();