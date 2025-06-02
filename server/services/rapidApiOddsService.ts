// RapidAPI Odds Service - Real betting odds integration
export class RapidApiOddsService {
  private apiKey: string;
  private baseUrl = 'https://odds-api1.p.rapidapi.com';

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY!;
    if (!this.apiKey) {
      throw new Error('RAPIDAPI_KEY is required');
    }
  }

  async getSports(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sports`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'odds-api1.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`RapidAPI Sports error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Fetched ${Object.keys(data).length} sports from RapidAPI Odds`);
      
      return Object.values(data);
    } catch (error) {
      console.error('RapidAPI Sports error:', error);
      return [];
    }
  }

  async getEvents(sport: string = 'american-football'): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/events?sport=${sport}`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'odds-api1.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        throw new Error(`RapidAPI Events error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Fetched ${data.length || 0} events for ${sport} from RapidAPI`);
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`RapidAPI Events error for ${sport}:`, error);
      return [];
    }
  }

  async getOdds(eventId: string, bookmakers: string = 'bet365,pinnacle,betfair'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/odds?eventId=${eventId}&bookmakers=${bookmakers}`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'odds-api1.p.rapidapi.com'
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.log(`⚠️ RapidAPI Odds quota exhausted, switching to backup services`);
          return null; // Let backup services handle this
        }
        throw new Error(`RapidAPI Odds error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Fetched odds for event ${eventId} from RapidAPI`);
      
      return data;
    } catch (error) {
      console.error(`RapidAPI Odds error for event ${eventId}:`, error);
      return null;
    }
  }

  async getComprehensiveOdds(): Promise<any[]> {
    try {
      // Get events for major sports
      const [footballEvents, basketballEvents, soccerEvents] = await Promise.allSettled([
        this.getEvents('american-football'),
        this.getEvents('basketball'), 
        this.getEvents('soccer')
      ]);

      const allEvents = [];
      
      if (footballEvents.status === 'fulfilled') allEvents.push(...footballEvents.value);
      if (basketballEvents.status === 'fulfilled') allEvents.push(...basketballEvents.value);
      if (soccerEvents.status === 'fulfilled') allEvents.push(...soccerEvents.value);

      // Get odds for each event (limit to first 10 to avoid API limits)
      const eventsWithOdds = [];
      for (const event of allEvents.slice(0, 10)) {
        if (event.id) {
          const odds = await this.getOdds(event.id);
          if (odds) {
            eventsWithOdds.push({
              ...event,
              odds,
              real_odds: true,
              source: 'RapidAPI'
            });
          }
        }
      }

      console.log(`✅ Compiled ${eventsWithOdds.length} events with real odds from RapidAPI`);
      return eventsWithOdds;

    } catch (error) {
      console.error('RapidAPI Comprehensive odds error:', error);
      return [];
    }
  }
}