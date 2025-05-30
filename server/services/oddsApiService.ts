import fetch from "node-fetch";

export class OddsApiService {
  private apiKey: string;
  private baseUrl: string;
  private lastRequest: number = 0;
  private minInterval: number = 2000; // 2 seconds between requests

  constructor() {
    this.apiKey = process.env.THE_ODDS_API_KEY || "";
    this.baseUrl = "https://api.the-odds-api.com/v4";

    if (!this.apiKey) {
      console.warn("No THE_ODDS_API_KEY provided. API calls will not work.");
    }
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;

    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequest = Date.now();
  }

  async getOdds(sport: string, region: string = "us", markets: string = "h2h,spreads,totals"): Promise<any> {
    if (!this.apiKey) {
      throw new Error("THE_ODDS_API_KEY is not set");
    }

    // Rate limit API calls to avoid 429 errors
    await this.rateLimit();

    // Map sport names to valid API keys
    const sportMapping: { [key: string]: string } = {
      'american_football': 'americanfootball_nfl',
      'basketball': 'basketball_nba',
      'baseball': 'baseball_mlb',
      'soccer': 'soccer_epl',
      'football': 'americanfootball_nfl',
      'nfl': 'americanfootball_nfl',
      'nba': 'basketball_nba',
      'mlb': 'baseball_mlb',
      'nhl': 'icehockey_nhl',
      'hockey': 'icehockey_nhl'
    };

    const sportKey = sport ? (sportMapping[sport.toLowerCase()] || sport) : 'upcoming';

    // For esports, return mock data since The Odds API doesn't support esports
    if (sport && ['esports', 'lol', 'cs2', 'valorant', 'dota2'].includes(sport.toLowerCase())) {
      return this.getEsportsOdds();
    }

    const url = `${this.baseUrl}/sports/${sportKey}/odds?apiKey=${this.apiKey}&regions=${region}&markets=${markets}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404) {
          console.warn(`Sport "${sport}" not found in Odds API`);
          return [];
        }
        throw new Error(`The Odds API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching odds:", error);
      throw error;
    }
  }

  private getEsportsOdds(): any {
    return [
      {
        id: 'esports_lol_worlds_2025',
        sport_key: 'esports_lol',
        sport_title: 'League of Legends - Worlds 2025',
        commence_time: new Date(Date.now() + 3600000).toISOString(),
        home_team: 'T1',
        away_team: 'Gen.G',
        bookmakers: [
          {
            key: 'weparlay',
            title: 'WeParlay Esports',
            markets: [
              {
                key: 'h2h',
                outcomes: [
                  { name: 'T1', price: 1.85 + (Math.random() - 0.5) * 0.2 },
                  { name: 'Gen.G', price: 2.15 + (Math.random() - 0.5) * 0.2 }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  private getMockOddsData(sport?: string): any {
    return [
      {
        id: `mock_${sport || 'general'}_${Date.now()}`,
        sport_key: sport || 'general',
        sport_title: `${sport || 'General'} - Mock Data`,
        commence_time: new Date(Date.now() + 3600000).toISOString(),
        home_team: 'Team A',
        away_team: 'Team B',
        bookmakers: [
          {
            key: 'weparlay',
            title: 'WeParlay Mock',
            markets: [
              {
                key: 'h2h',
                outcomes: [
                  { name: 'Team A', price: 1.90 },
                  { name: 'Team B', price: 1.95 }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  async getSports(): Promise<any> {
    if (!this.apiKey) {
      throw new Error("THE_ODDS_API_KEY is not set");
    }

    const url = `${this.baseUrl}/sports?apiKey=${this.apiKey}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`The Odds API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching sports:", error);
      throw error;
    }
  }

  async getScores(sport: string, daysFrom: number = 3): Promise<any> {
    if (!this.apiKey) {
      throw new Error("THE_ODDS_API_KEY is not set");
    }

    const url = `${this.baseUrl}/sports/${sport}/scores/?apiKey=${this.apiKey}&daysFrom=${daysFrom}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`The Odds API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching scores:", error);
      throw error;
    }
  }

  async getEvent(eventId: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error("THE_ODDS_API_KEY is not set");
    }

    const url = `${this.baseUrl}/events/${eventId}?apiKey=${this.apiKey}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`The Odds API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  }
}