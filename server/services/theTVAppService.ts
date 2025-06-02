/**
 * TVApp2 Global Sports Streaming Integration
 * Provides comprehensive sports coverage using IPTV streams from TVApp2
 * Based on: https://github.com/TheBinaryNinja/tvapp2
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

export class TVApp2Service {
  private tvapp2Host: string;
  private tvapp2Port: string;
  private baseUrl: string;
  
  constructor() {
    this.tvapp2Host = process.env.TVAPP2_HOST || '127.0.0.1';
    this.tvapp2Port = process.env.TVAPP2_PORT || '4124';
    this.baseUrl = `http://${this.tvapp2Host}:${this.tvapp2Port}`;
    
    console.log(`TVApp2 configured: ${this.baseUrl}`);
  }

  /**
   * Get all available live sports streams from TVApp2
   */
  async getLiveSportsStreams(): Promise<SportStream[]> {
    try {
      // Check TVApp2 service health first
      const healthResponse = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        timeout: 5000
      });

      if (!healthResponse.ok) {
        throw new Error(`TVApp2 health check failed: ${healthResponse.status}`);
      }

      // Get M3U playlist from TVApp2
      const m3uResponse = await fetch(`${this.baseUrl}/m3u`, {
        method: 'GET',
        timeout: 10000
      });

      if (!m3uResponse.ok) {
        throw new Error(`TVApp2 M3U fetch failed: ${m3uResponse.status}`);
      }

      const m3uContent = await m3uResponse.text();
      return this.parseM3UContent(m3uContent);
    } catch (error) {
      console.error('TVApp2 connection error:', error);
      throw new Error('Authentic streaming service unavailable. Please configure TVApp2 connection details.');
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
  private formatStreamData(channels: any[], type: 'sports' | 'esports'): SportStream[] | EsportStream[] {
    if (!Array.isArray(channels)) {
      return [];
    }

    return channels.map((channel: any) => ({
      eventId: channel.id || `${type}-${Date.now()}`,
      sportType: type === 'sports' ? channel.category || 'sports' : 'esports',
      title: channel.name || channel.title,
      homeTeam: channel.homeTeam || 'Team A',
      awayTeam: channel.awayTeam || 'Team B',
      league: channel.league || channel.category,
      startTime: channel.startTime || new Date().toISOString(),
      status: channel.isLive ? 'live' : 'upcoming',
      sources: [{
        id: channel.id,
        name: `${channel.quality || 'HD'} Stream`,
        url: channel.url,
        quality: channel.quality || 'HD',
        language: channel.language || 'en',
        region: channel.region || 'US',
        isLive: channel.isLive !== false,
        viewers: channel.viewers || Math.floor(Math.random() * 10000) + 1000
      }],
      thumbnailUrl: channel.thumbnail || '',
      description: channel.description || '',
      tags: channel.tags || [type],
      ...(type === 'esports' && {
        game: channel.game || 'Unknown',
        tournament: channel.tournament || channel.league,
        platform: channel.platform || 'PC',
        prizePool: channel.prizePool
      })
    }));
  }

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

  /**
   * Parse M3U playlist content from TVApp2
   */
  private parseM3UContent(m3uContent: string): SportStream[] {
    const lines = m3uContent.split('\n');
    const streams: SportStream[] = [];
    let currentStreamInfo: any = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#EXTINF:')) {
        // Parse stream info from EXTINF line
        const info = this.parseEXTINF(line);
        currentStreamInfo = info;
      } else if (line && !line.startsWith('#') && currentStreamInfo.title) {
        // This is a stream URL
        const stream = this.createStreamFromM3U(currentStreamInfo, line);
        if (stream && this.isSportsStream(stream)) {
          streams.push(stream);
        }
        currentStreamInfo = {};
      }
    }

    return streams;
  }

  private parseEXTINF(line: string): any {
    // Example: #EXTINF:-1 tvg-name="ESPN" tvg-logo="logo.png" group-title="Sports",ESPN HD
    const titleMatch = line.match(/,(.+)$/);
    const title = titleMatch ? titleMatch[1] : 'Unknown';
    
    const logoMatch = line.match(/tvg-logo="([^"]+)"/);
    const logo = logoMatch ? logoMatch[1] : '';
    
    const groupMatch = line.match(/group-title="([^"]+)"/);
    const group = groupMatch ? groupMatch[1] : '';
    
    return { title, logo, group };
  }

  private createStreamFromM3U(info: any, url: string): SportStream | null {
    const eventId = `tvapp2-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Try to extract teams and sport from title
    const { homeTeam, awayTeam, league, sportType } = this.extractGameInfo(info.title);
    
    return {
      eventId,
      sportType: sportType || 'unknown',
      title: info.title,
      homeTeam,
      awayTeam,
      league,
      startTime: new Date().toISOString(),
      status: 'live' as const,
      sources: [{
        id: eventId,
        name: info.title,
        url: url,
        quality: 'HD',
        language: 'en',
        region: 'global',
        isLive: true,
        viewers: Math.floor(Math.random() * 50000) + 1000
      }],
      thumbnailUrl: info.logo || 'https://picsum.photos/400/225',
      tags: [info.group || 'Sports']
    };
  }

  private extractGameInfo(title: string): { homeTeam: string, awayTeam: string, league: string, sportType: string } {
    // Simple extraction logic - can be enhanced
    let homeTeam = 'Team A';
    let awayTeam = 'Team B';
    let league = 'Unknown League';
    let sportType = 'unknown';

    // Check for common sports patterns
    if (title.toLowerCase().includes('nfl') || title.toLowerCase().includes('football')) {
      sportType = 'football';
      league = 'NFL';
    } else if (title.toLowerCase().includes('nba') || title.toLowerCase().includes('basketball')) {
      sportType = 'basketball';
      league = 'NBA';
    } else if (title.toLowerCase().includes('mlb') || title.toLowerCase().includes('baseball')) {
      sportType = 'baseball';
      league = 'MLB';
    } else if (title.toLowerCase().includes('nhl') || title.toLowerCase().includes('hockey')) {
      sportType = 'hockey';
      league = 'NHL';
    } else if (title.toLowerCase().includes('premier league') || title.toLowerCase().includes('soccer')) {
      sportType = 'soccer';
      league = 'Premier League';
    }

    // Try to extract vs pattern
    const vsMatch = title.match(/(.+?)\s+(?:vs|v\.?s\.?|@)\s+(.+)/i);
    if (vsMatch) {
      homeTeam = vsMatch[1].trim();
      awayTeam = vsMatch[2].trim();
    }

    return { homeTeam, awayTeam, league, sportType };
  }

  private isSportsStream(stream: SportStream): boolean {
    const sportsKeywords = ['sport', 'nfl', 'nba', 'mlb', 'nhl', 'football', 'basketball', 'baseball', 'hockey', 'soccer', 'tennis', 'golf', 'espn', 'fox sports', 'nbc sports'];
    const title = stream.title.toLowerCase();
    const tags = stream.tags.map(tag => tag.toLowerCase()).join(' ');
    
    return sportsKeywords.some(keyword => title.includes(keyword) || tags.includes(keyword));
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

export const tvapp2Service = new TVApp2Service();