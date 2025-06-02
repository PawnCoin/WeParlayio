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
  private m3uUrl: string;
  private sportsChannels: SportStream[] = [];
  private username: string;
  private password: string;
  
  constructor() {
    this.username = process.env.THETVAPP_USERNAME || '686140897';
    this.password = process.env.THETVAPP_PASSWORD || '80274761';
    this.m3uUrl = process.env.M3U_PLAYLIST_URL || 
      `https://thetv.to:443/get.php?username=${this.username}&password=${this.password}&type=m3u_plus&output=ts`;
    console.log(`M3U Streaming service configured: ${this.m3uUrl}`);
  }

  /**
   * Get available sports streams from M3U playlist
   */
  async getSportsStreams(): Promise<SportStream[]> {
    try {
      const response = await fetch(this.m3uUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'WeParlay-Platform/1.0',
        }
      });

      if (!response.ok) {
        console.log(`M3U playlist response: ${response.status}`);
        return [];
      }

      const m3uContent = await response.text();
      return this.parseM3UForSports(m3uContent);
    } catch (error) {
      console.error('M3U playlist connection error:', error);
      return [];
    }
  }

  /**
   * Parse M3U playlist for sports channels
   */
  private parseM3UForSports(m3uContent: string): SportStream[] {
    const lines = m3uContent.split('\n');
    const streams: SportStream[] = [];
    let currentInfo: any = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('#EXTINF:')) {
        // Parse channel info
        const info = line.substring(8); // Remove #EXTINF:
        const parts = info.split(',');
        const name = parts[parts.length - 1];
        
        // Check if this is a sports channel
        const sportsKeywords = ['sport', 'espn', 'fox sports', 'nfl', 'nba', 'mlb', 'nhl', 'soccer', 'football', 'basketball', 'baseball', 'hockey', 'tennis', 'golf', 'racing', 'motorsport', 'ufc', 'boxing', 'mma'];
        const isSports = sportsKeywords.some(keyword => 
          name.toLowerCase().includes(keyword) || 
          info.toLowerCase().includes(keyword)
        );

        if (isSports) {
          currentInfo = {
            name: name,
            info: info,
            duration: parts[0] || '-1'
          };
        }
      } else if (line.startsWith('http') && currentInfo.name) {
        // This is a stream URL for the current sports channel
        streams.push({
          eventId: `channel_${streams.length + 1}`,
          sportType: this.extractSportType(currentInfo.name),
          title: currentInfo.name,
          homeTeam: '',
          awayTeam: '',
          league: this.extractLeague(currentInfo.name),
          startTime: new Date().toISOString(),
          status: 'live',
          sources: [{
            id: `source_${streams.length + 1}`,
            name: currentInfo.name,
            url: line,
            quality: 'HD',
            language: 'en',
            region: 'US',
            isLive: true,
            viewers: Math.floor(Math.random() * 10000) + 1000
          }],
          thumbnailUrl: '',
          description: `Live ${currentInfo.name}`,
          tags: ['live', 'sports', this.extractSportType(currentInfo.name)]
        });
        
        currentInfo = {};
      }
    }

    return streams;
  }

  /**
   * Extract sport type from channel name
   */
  private extractSportType(channelName: string): string {
    const name = channelName.toLowerCase();
    if (name.includes('nfl') || name.includes('football')) return 'football';
    if (name.includes('nba') || name.includes('basketball')) return 'basketball';
    if (name.includes('mlb') || name.includes('baseball')) return 'baseball';
    if (name.includes('nhl') || name.includes('hockey')) return 'hockey';
    if (name.includes('soccer') || name.includes('fifa')) return 'soccer';
    if (name.includes('tennis')) return 'tennis';
    if (name.includes('golf')) return 'golf';
    if (name.includes('racing') || name.includes('f1')) return 'racing';
    if (name.includes('ufc') || name.includes('mma') || name.includes('boxing')) return 'combat';
    if (name.includes('espn') || name.includes('fox sports')) return 'general';
    return 'sports';
  }

  /**
   * Extract league from channel name
   */
  private extractLeague(channelName: string): string {
    const name = channelName.toLowerCase();
    if (name.includes('espn')) return 'ESPN';
    if (name.includes('fox sports')) return 'Fox Sports';
    if (name.includes('nfl')) return 'NFL';
    if (name.includes('nba')) return 'NBA';
    if (name.includes('mlb')) return 'MLB';
    if (name.includes('nhl')) return 'NHL';
    if (name.includes('premier league')) return 'Premier League';
    if (name.includes('champions league')) return 'Champions League';
    return 'Sports Network';
  }

  /**
   * Search for specific sports content
   */
  async searchSportsContent(query: string): Promise<SportStream[]> {
    try {
      const allStreams = await this.getSportsStreams();
      const searchTerm = query.toLowerCase();
      
      return allStreams.filter(stream => 
        stream.title.toLowerCase().includes(searchTerm) ||
        stream.sportType.toLowerCase().includes(searchTerm) ||
        stream.league.toLowerCase().includes(searchTerm) ||
        stream.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Sports content search error:', error);
      return [];
    }
  }



  /**
   * Get service status
   */
  async getServiceStatus(): Promise<{ available: boolean; message: string }> {
    try {
      const response = await fetch(this.m3uUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'WeParlay-Platform/1.0'
        }
      });

      return {
        available: response.ok,
        message: response.ok ? 'M3U streaming service available' : `M3U service unavailable (${response.status})`
      };
    } catch (error) {
      return {
        available: false,
        message: 'M3U streaming service connection failed'
      };
    }
  }
}

export const theTVAppService = new TheTVAppService();