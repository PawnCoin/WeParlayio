/**
 * TheTVApp.tv Global Sports Streaming Integration
 * Provides comprehensive sports coverage including traditional sports and esports
 */

interface StreamSource {
  id: string;
  name: string;
  url: string;
  quality: 'SD' | 'HD' | '4K';
  language: string;
  region: string;
  isLive: boolean;
  viewers?: number;
}

interface SportStream {
  eventId: string;
  sportType: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: string;
  status: 'live' | 'upcoming' | 'ended';
  sources: StreamSource[];
  thumbnailUrl: string;
  description?: string;
  tags: string[];
}

interface EsportStream extends SportStream {
  game: string;
  tournament: string;
  platform: 'PC' | 'Console' | 'Mobile';
  prizePool?: number;
}

export class TheTVAppService {
  private apiKey: string;
  private baseUrl: string = 'https://thetvapp.tv/api/v1';
  
  constructor() {
    this.apiKey = process.env.THETVAPP_API_KEY || '';
    if (!this.apiKey) {
      console.warn('TheTVApp.tv API key not found. Streaming features will be limited.');
    }
  }

  /**
   * Get all available live sports streams
   */
  async getLiveSportsStreams(): Promise<SportStream[]> {
    if (!this.apiKey) {
      return this.getMockSportsStreams();
    }

    try {
      const response = await fetch(`${this.baseUrl}/streams/live/sports`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`TheTVApp API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformSportsData(data);
    } catch (error) {
      console.error('TheTVApp sports streams error:', error);
      return this.getMockSportsStreams();
    }
  }

  /**
   * Get all available live esports streams
   */
  async getLiveEsportsStreams(): Promise<EsportStream[]> {
    if (!this.apiKey) {
      return this.getMockEsportsStreams();
    }

    try {
      const response = await fetch(`${this.baseUrl}/streams/live/esports`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`TheTVApp API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformEsportsData(data);
    } catch (error) {
      console.error('TheTVApp esports streams error:', error);
      return this.getMockEsportsStreams();
    }
  }

  /**
   * Get streams by sport type
   */
  async getStreamsBySport(sportType: string): Promise<SportStream[]> {
    if (!this.apiKey) {
      return this.getMockStreamsBySport(sportType);
    }

    try {
      const response = await fetch(`${this.baseUrl}/streams/sport/${sportType}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`TheTVApp API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformSportsData(data);
    } catch (error) {
      console.error(`TheTVApp ${sportType} streams error:`, error);
      return this.getMockStreamsBySport(sportType);
    }
  }

  /**
   * Get stream details with multiple quality options
   */
  async getStreamDetails(eventId: string): Promise<SportStream | null> {
    if (!this.apiKey) {
      return this.getMockStreamDetails(eventId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/streams/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`TheTVApp API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformStreamData(data);
    } catch (error) {
      console.error('TheTVApp stream details error:', error);
      return this.getMockStreamDetails(eventId);
    }
  }

  /**
   * Search for streams by keyword
   */
  async searchStreams(query: string): Promise<SportStream[]> {
    if (!this.apiKey) {
      return this.getMockSearchResults(query);
    }

    try {
      const response = await fetch(`${this.baseUrl}/streams/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`TheTVApp API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformSportsData(data);
    } catch (error) {
      console.error('TheTVApp search error:', error);
      return this.getMockSearchResults(query);
    }
  }

  /**
   * Transform API data to our format
   */
  private transformSportsData(data: any): SportStream[] {
    if (!data || !Array.isArray(data.streams)) {
      return [];
    }

    return data.streams.map((stream: any) => ({
      eventId: stream.id,
      sportType: stream.sport,
      title: stream.title,
      homeTeam: stream.home_team,
      awayTeam: stream.away_team,
      league: stream.league,
      startTime: stream.start_time,
      status: stream.status,
      sources: this.transformSources(stream.sources),
      thumbnailUrl: stream.thumbnail,
      description: stream.description,
      tags: stream.tags || []
    }));
  }

  private transformEsportsData(data: any): EsportStream[] {
    if (!data || !Array.isArray(data.streams)) {
      return [];
    }

    return data.streams.map((stream: any) => ({
      eventId: stream.id,
      sportType: 'esports',
      title: stream.title,
      homeTeam: stream.team1,
      awayTeam: stream.team2,
      league: stream.tournament,
      startTime: stream.start_time,
      status: stream.status,
      sources: this.transformSources(stream.sources),
      thumbnailUrl: stream.thumbnail,
      description: stream.description,
      tags: stream.tags || [],
      game: stream.game,
      tournament: stream.tournament,
      platform: stream.platform,
      prizePool: stream.prize_pool
    }));
  }

  private transformSources(sources: any[]): StreamSource[] {
    if (!Array.isArray(sources)) {
      return [];
    }

    return sources.map(source => ({
      id: source.id,
      name: source.name,
      url: source.url,
      quality: source.quality,
      language: source.language || 'en',
      region: source.region || 'global',
      isLive: source.is_live,
      viewers: source.viewers
    }));
  }

  private transformStreamData(data: any): SportStream {
    return {
      eventId: data.id,
      sportType: data.sport,
      title: data.title,
      homeTeam: data.home_team,
      awayTeam: data.away_team,
      league: data.league,
      startTime: data.start_time,
      status: data.status,
      sources: this.transformSources(data.sources),
      thumbnailUrl: data.thumbnail,
      description: data.description,
      tags: data.tags || []
    };
  }

  // Mock data for development/fallback
  private getMockSportsStreams(): SportStream[] {
    return [
      {
        eventId: 'nfl-chiefs-ravens',
        sportType: 'football',
        title: 'Kansas City Chiefs vs Baltimore Ravens',
        homeTeam: 'Kansas City Chiefs',
        awayTeam: 'Baltimore Ravens',
        league: 'NFL',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'live',
        sources: [
          {
            id: 'hd-1',
            name: 'HD Stream 1',
            url: 'https://example.com/stream/hd1',
            quality: 'HD',
            language: 'en',
            region: 'US',
            isLive: true,
            viewers: 45000
          }
        ],
        thumbnailUrl: 'https://picsum.photos/400/225?random=1',
        tags: ['NFL', 'Playoffs']
      },
      {
        eventId: 'nba-lakers-warriors',
        sportType: 'basketball',
        title: 'Los Angeles Lakers vs Golden State Warriors',
        homeTeam: 'Los Angeles Lakers',
        awayTeam: 'Golden State Warriors',
        league: 'NBA',
        startTime: new Date(Date.now() + 7200000).toISOString(),
        status: 'live',
        sources: [
          {
            id: 'hd-2',
            name: 'HD Stream 2',
            url: 'https://example.com/stream/hd2',
            quality: 'HD',
            language: 'en',
            region: 'US',
            isLive: true,
            viewers: 38000
          }
        ],
        thumbnailUrl: 'https://picsum.photos/400/225?random=2',
        tags: ['NBA', 'Western Conference']
      }
    ];
  }

  private getMockEsportsStreams(): EsportStream[] {
    return [
      {
        eventId: 'lol-worlds-final',
        sportType: 'esports',
        title: 'League of Legends World Championship Final',
        homeTeam: 'T1',
        awayTeam: 'JD Gaming',
        league: 'Worlds 2024',
        startTime: new Date(Date.now() + 1800000).toISOString(),
        status: 'live',
        sources: [
          {
            id: 'esports-1',
            name: '4K Stream',
            url: 'https://example.com/stream/4k1',
            quality: '4K',
            language: 'en',
            region: 'global',
            isLive: true,
            viewers: 125000
          }
        ],
        thumbnailUrl: 'https://picsum.photos/400/225?random=3',
        tags: ['LoL', 'Worlds', 'Final'],
        game: 'League of Legends',
        tournament: 'World Championship',
        platform: 'PC',
        prizePool: 2250000
      }
    ];
  }

  private getMockStreamsBySport(sportType: string): SportStream[] {
    return this.getMockSportsStreams().filter(stream => stream.sportType === sportType);
  }

  private getMockStreamDetails(eventId: string): SportStream | null {
    const allStreams = [...this.getMockSportsStreams(), ...this.getMockEsportsStreams()];
    return allStreams.find(stream => stream.eventId === eventId) || null;
  }

  private getMockSearchResults(query: string): SportStream[] {
    const allStreams = [...this.getMockSportsStreams(), ...this.getMockEsportsStreams()];
    return allStreams.filter(stream => 
      stream.title.toLowerCase().includes(query.toLowerCase()) ||
      stream.homeTeam.toLowerCase().includes(query.toLowerCase()) ||
      stream.awayTeam.toLowerCase().includes(query.toLowerCase()) ||
      stream.league.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export const theTVAppService = new TheTVAppService();