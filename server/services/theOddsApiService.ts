// Real odds data from The Odds API
export class TheOddsApiService {
  private apiKey: string;
  private baseUrl = 'https://api.the-odds-api.com/v4';

  constructor() {
    this.apiKey = process.env.THE_ODDS_API_KEY!;
    if (!this.apiKey) {
      throw new Error('THE_ODDS_API_KEY is required');
    }
  }

  async getOdds(sport: string = 'americanfootball_nfl'): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/sports/${sport}/odds?` + 
        `apiKey=${this.apiKey}&` +
        `regions=us&` +
        `markets=h2h,spreads,totals&` +
        `oddsFormat=american&` +
        `dateFormat=iso`
      );

      if (!response.ok) {
        throw new Error(`The Odds API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Fetched ${data.length} real odds from The Odds API for ${sport}`);
      
      return data.map((game: any) => ({
        id: game.id,
        sport_key: game.sport_key,
        commence_time: game.commence_time,
        home_team: game.home_team,
        away_team: game.away_team,
        bookmakers: game.bookmakers,
        real_odds: true
      }));

    } catch (error) {
      console.error('The Odds API error:', error);
      return [];
    }
  }

  async getSports(): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/sports?apiKey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`The Odds API sports error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Fetched ${data.length} real sports from The Odds API`);
      
      return data;

    } catch (error) {
      console.error('The Odds API sports error:', error);
      return [];
    }
  }
}