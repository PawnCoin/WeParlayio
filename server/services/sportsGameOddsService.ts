/**
 * SportsGameOdds.com API Service
 * Provides comprehensive sports betting odds and data
 */

export class SportsGameOddsService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.SPORTSGAMEODDS_API_KEY || '';
    this.baseUrl = 'https://api.sportsgameodds.com/v1';

    if (!this.apiKey) {
      console.warn('SPORTSGAMEODDS_API_KEY environment variable is not set');
    }
  }

  /**
   * Get comprehensive sports list with 110+ options
   */
  async getAllSports(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/sports`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`SportsGameOdds API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformSportsData(data);
    } catch (error) {
      console.error('Error fetching sports from SportsGameOdds:', error);
      throw error;
    }
  }

  /**
   * Get live odds for all sports
   */
  async getLiveOdds(sport?: string): Promise<any> {
    try {
      const url = sport 
        ? `${this.baseUrl}/odds/live?sport=${sport}`
        : `${this.baseUrl}/odds/live`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`SportsGameOdds API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformOddsData(data);
    } catch (error) {
      console.error('Error fetching live odds from SportsGameOdds:', error);
      throw error;
    }
  }

  /**
   * Get upcoming events with odds
   */
  async getUpcomingEvents(sport?: string, days: number = 7): Promise<any> {
    try {
      const url = sport 
        ? `${this.baseUrl}/events/upcoming?sport=${sport}&days=${days}`
        : `${this.baseUrl}/events/upcoming?days=${days}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`SportsGameOdds API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformUpcomingData(data);
    } catch (error) {
      console.error('Error fetching upcoming events from SportsGameOdds:', error);
      throw error;
    }
  }

  /**
   * Get detailed odds for specific event
   */
  async getEventOdds(eventId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/events/${eventId}/odds`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`SportsGameOdds API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformEventOdds(data);
    } catch (error) {
      console.error('Error fetching event odds from SportsGameOdds:', error);
      throw error;
    }
  }

  /**
   * Get leagues for specific sport
   */
  async getSportLeagues(sport: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/sports/${sport}/leagues`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`SportsGameOdds API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformLeaguesData(data);
    } catch (error) {
      console.error('Error fetching sport leagues from SportsGameOdds:', error);
      throw error;
    }
  }

  /**
   * Transform sports data to unified format
   */
  private transformSportsData(data: any): any {
    if (!data.sports) return [];

    return data.sports.map((sport: any) => ({
      id: sport.id,
      name: sport.name,
      key: sport.key,
      isActive: sport.active,
      icon: sport.icon || null,
      category: sport.category,
      country: sport.country,
      leagues: sport.leagues || []
    }));
  }

  /**
   * Transform odds data to unified format
   */
  private transformOddsData(data: any): any {
    if (!data.events) return [];

    return data.events.map((event: any) => ({
      id: `sgo_${event.id}`,
      sport_key: event.sport_key,
      sport_title: event.sport_title,
      commence_time: event.commence_time,
      home_team: event.home_team,
      away_team: event.away_team,
      league: event.league,
      live: event.live || false,
      scores: event.scores || null,
      bookmakers: event.bookmakers?.map((bookmaker: any) => ({
        key: bookmaker.key,
        title: bookmaker.title,
        last_update: bookmaker.last_update,
        markets: bookmaker.markets?.map((market: any) => ({
          key: market.key,
          outcomes: market.outcomes?.map((outcome: any) => ({
            name: outcome.name,
            price: outcome.price
          })) || []
        })) || []
      })) || []
    }));
  }

  /**
   * Transform upcoming events data
   */
  private transformUpcomingData(data: any): any {
    if (!data.events) return [];

    return data.events.map((event: any) => ({
      id: `sgo_upcoming_${event.id}`,
      sport_key: event.sport_key,
      sport_title: event.sport_title,
      commence_time: event.commence_time,
      home_team: event.home_team,
      away_team: event.away_team,
      league: event.league,
      venue: event.venue,
      weather: event.weather,
      preview_odds: event.preview_odds
    }));
  }

  /**
   * Transform event odds data
   */
  private transformEventOdds(data: any): any {
    return {
      event_id: data.event_id,
      sport: data.sport,
      teams: data.teams,
      commence_time: data.commence_time,
      bookmakers: data.bookmakers?.map((bookmaker: any) => ({
        key: bookmaker.key,
        title: bookmaker.title,
        last_update: bookmaker.last_update,
        markets: bookmaker.markets?.map((market: any) => ({
          key: market.key,
          type: market.type,
          outcomes: market.outcomes?.map((outcome: any) => ({
            name: outcome.name,
            price: outcome.price,
            point: outcome.point
          })) || []
        })) || []
      })) || []
    };
  }

  /**
   * Transform leagues data
   */
  private transformLeaguesData(data: any): any {
    if (!data.leagues) return [];

    return data.leagues.map((league: any) => ({
      id: league.id,
      name: league.name,
      key: league.key,
      country: league.country,
      season: league.current_season,
      active: league.active,
      event_count: league.event_count
    }));
  }

  /**
   * Get comprehensive market data for betting
   */
  async getMarketData(sport: string, market_type: string = 'all'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/markets/${sport}?type=${market_type}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`SportsGameOdds API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching market data from SportsGameOdds:', error);
      throw error;
    }
  }
}