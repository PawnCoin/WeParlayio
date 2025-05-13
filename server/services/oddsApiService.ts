import fetch from "node-fetch";

export class OddsApiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.THE_ODDS_API_KEY || "";
    this.baseUrl = "https://api.the-odds-api.com/v4";
    
    if (!this.apiKey) {
      console.warn("No THE_ODDS_API_KEY provided. API calls will not work.");
    }
  }

  async getOdds(sport: string, region: string = "us", markets: string = "h2h,spreads,totals"): Promise<any> {
    if (!this.apiKey) {
      throw new Error("THE_ODDS_API_KEY is not set");
    }

    const url = `${this.baseUrl}/sports/${sport}/odds?apiKey=${this.apiKey}&regions=${region}&markets=${markets}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`The Odds API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching odds:", error);
      throw error;
    }
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
