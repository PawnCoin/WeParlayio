/**
 * TheTVApp Service for streaming integration
 */

// Simple streaming interface
interface SportStream {
  eventId: string;
  sportType: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: string;
  status: string;
  sources: StreamSource[];
  thumbnailUrl?: string;
  description?: string;
  tags?: string[];
}

interface StreamSource {
  id: string;
  name: string;
  url: string;
  quality: string;
  language: string;
  region: string;
  isLive: boolean;
  viewers?: number;
}

export class TheTVAppService {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = 'https://thetvapp.tv';
    console.log(`TheTVApp service configured: ${this.baseUrl}`);
  }

  /**
   * Get available sports streams from thetvapp.tv
   */
  async getSportsStreams(): Promise<SportStream[]> {
    try {
      // Try to get stream data from thetvapp.tv
      const response = await fetch(`${this.baseUrl}/streams`, {
        method: 'GET',
        headers: {
          'User-Agent': 'WeParlay-Platform/1.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.log(`TheTVApp response: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return this.formatSportsData(data);
    } catch (error) {
      console.error('TheTVApp connection error:', error);
      return [];
    }
  }

  /**
   * Search for specific sports content
   */
  async searchSportsContent(query: string): Promise<SportStream[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'WeParlay-Platform/1.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return this.formatSportsData(data);
    } catch (error) {
      console.error('TheTVApp search error:', error);
      return [];
    }
  }

  /**
   * Format data into our stream format
   */
  private formatSportsData(data: any): SportStream[] {
    if (!data || !Array.isArray(data.streams)) {
      return [];
    }

    return data.streams.map((stream: any) => ({
      eventId: stream.id || `stream_${Date.now()}`,
      sportType: stream.sport || 'sports',
      title: stream.title || 'Live Stream',
      homeTeam: stream.homeTeam || 'Team A',
      awayTeam: stream.awayTeam || 'Team B',
      league: stream.league || 'Sports',
      startTime: stream.startTime || new Date().toISOString(),
      status: 'live',
      sources: [{
        id: stream.id || 'source_1',
        name: 'HD Stream',
        url: stream.url || '',
        quality: 'HD',
        language: 'en',
        region: 'US',
        isLive: true,
        viewers: stream.viewers || 1000
      }],
      thumbnailUrl: stream.thumbnail || '',
      description: stream.description || '',
      tags: stream.tags || ['live', 'sports']
    }));
  }

  /**
   * Get service status
   */
  async getServiceStatus(): Promise<{ available: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'WeParlay-Platform/1.0'
        }
      });

      return {
        available: response.ok,
        message: response.ok ? 'Service available' : `Service unavailable (${response.status})`
      };
    } catch (error) {
      return {
        available: false,
        message: 'Service connection failed'
      };
    }
  }
}

export const theTVAppService = new TheTVAppService();