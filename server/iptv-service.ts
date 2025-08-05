import axios from 'axios';

export interface IPTVChannel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  category: string;
  country: string;
  language: string;
  isWorking: boolean;
}

class IPTVService {
  private channels: IPTVChannel[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly GITHUB_PLAYLIST_URL = 'https://raw.githubusercontent.com/iptv-org/iptv/master/streams/us.m3u';

  async getChannels(): Promise<IPTVChannel[]> {
    // Return cached channels if still valid
    if (this.channels.length > 0 && Date.now() - this.lastFetch < this.CACHE_DURATION) {
      return this.channels;
    }

    try {
      console.log('🔄 Fetching IPTV channels from GitHub playlist...');
      const response = await axios.get(this.GITHUB_PLAYLIST_URL, {
        timeout: 10000,
        headers: {
          'User-Agent': 'WeParlay-IPTV-Service/1.0'
        }
      });

      const channels = this.parseM3U(response.data);
      
      // Filter for sports and news channels primarily
      this.channels = channels.filter(channel => 
        this.isSportsOrNewsChannel(channel)
      ).slice(0, 50); // Limit to 50 channels for performance

      this.lastFetch = Date.now();
      console.log(`✅ Successfully loaded ${this.channels.length} IPTV channels`);
      
      return this.channels;
    } catch (error) {
      console.error('❌ Failed to fetch IPTV channels:', error);
      
      // Return fallback channels if fetch fails
      return this.getFallbackChannels();
    }
  }

  private parseM3U(content: string): IPTVChannel[] {
    const lines = content.split('\n');
    const channels: IPTVChannel[] = [];
    let currentChannel: Partial<IPTVChannel> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#EXTINF:')) {
        // Parse channel info from EXTINF line
        const info = this.parseExtinf(line);
        currentChannel = {
          name: info.name,
          logo: info.logo,
          category: info.category || 'General',
          country: info.country || 'Unknown',
          language: info.language || 'Unknown'
        };
      } else if (line && !line.startsWith('#') && currentChannel.name) {
        // This is the URL line
        currentChannel.url = line;
        currentChannel.id = `iptv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        currentChannel.isWorking = true;
        
        channels.push(currentChannel as IPTVChannel);
        currentChannel = {};
      }
    }

    return channels;
  }

  private parseExtinf(extinf: string): any {
    const info: any = {};
    
    // Extract name (everything after the last comma)
    const nameMatch = extinf.match(/,(.+)$/);
    if (nameMatch) {
      info.name = nameMatch[1].trim();
    }

    // Extract logo
    const logoMatch = extinf.match(/tvg-logo="([^"]+)"/);
    if (logoMatch) {
      info.logo = logoMatch[1];
    }

    // Extract category/group
    const groupMatch = extinf.match(/group-title="([^"]+)"/);
    if (groupMatch) {
      info.category = groupMatch[1];
    }

    // Extract country
    const countryMatch = extinf.match(/tvg-country="([^"]+)"/);
    if (countryMatch) {
      info.country = countryMatch[1];
    }

    // Extract language
    const languageMatch = extinf.match(/tvg-language="([^"]+)"/);
    if (languageMatch) {
      info.language = languageMatch[1];
    }

    return info;
  }

  private isSportsOrNewsChannel(channel: IPTVChannel): boolean {
    const name = channel.name.toLowerCase();
    const category = channel.category.toLowerCase();
    
    const sportsKeywords = [
      'sport', 'espn', 'fox sports', 'nbc sports', 'cbs sports', 'sky sports',
      'bein', 'eurosport', 'tennis', 'football', 'soccer', 'basketball', 'baseball',
      'nfl', 'nba', 'mlb', 'nhl', 'premier league', 'champions league', 'fifa'
    ];
    
    const newsKeywords = [
      'news', 'cnn', 'bbc', 'fox news', 'msnbc', 'cnbc', 'bloomberg', 'reuters'
    ];

    const allKeywords = [...sportsKeywords, ...newsKeywords];
    
    return allKeywords.some(keyword => 
      name.includes(keyword) || category.includes(keyword)
    ) || category.includes('sports') || category.includes('news');
  }

  getFallbackChannels(): IPTVChannel[] {
    return [
      {
        id: 'fallback-demo-1',
        name: 'Sports Demo Channel',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        category: 'Sports',
        country: 'US',
        language: 'English',
        isWorking: true,
        logo: ''
      },
      {
        id: 'fallback-demo-2', 
        name: 'Live Sports Stream',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        category: 'Sports',
        country: 'US',
        language: 'English',
        isWorking: true,
        logo: ''
      }
    ];
  }

  async getChannelsByCategory(category: string): Promise<IPTVChannel[]> {
    const allChannels = await this.getChannels();
    return allChannels.filter(channel => 
      channel.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  async getSportsChannels(): Promise<IPTVChannel[]> {
    return this.getChannelsByCategory('sport');
  }

  async getNewsChannels(): Promise<IPTVChannel[]> {
    return this.getChannelsByCategory('news');
  }
}

export const iptvService = new IPTVService();