import axios from 'axios';

export interface IPTVChannel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group: string;
  tvgId?: string;
  tvgLogo?: string;
  tvgName?: string;
  streamType: 'live' | 'vod' | 'series';
  category: string;
  language?: string;
  country?: string;
  quality?: string;
}

export interface EPGProgram {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  category?: string;
  rating?: string;
}

export interface XtreamCodesCredentials {
  host: string;
  username: string;
  password: string;
  port?: string;
}

export class IPTVService {
  private channels: IPTVChannel[] = [];
  private epgData: EPGProgram[] = [];

  /**
   * Parse M3U playlist and extract channel information
   */
  async parseM3UPlaylist(playlistUrl: string): Promise<IPTVChannel[]> {
    try {
      const response = await axios.get(playlistUrl);
      const content = response.data;
      
      const channels: IPTVChannel[] = [];
      const lines = content.split('\n');
      let currentChannel: Partial<IPTVChannel> = {};
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('#EXTINF:')) {
          // Parse channel metadata
          const metadata = this.parseExtinf(line);
          currentChannel = {
            id: this.generateChannelId(),
            name: metadata.name,
            logo: metadata.logo,
            group: metadata.group || 'General',
            tvgId: metadata.tvgId,
            tvgLogo: metadata.tvgLogo,
            tvgName: metadata.tvgName,
            streamType: 'live',
            category: this.categorizeChannel(metadata.name, metadata.group),
            language: metadata.language,
            country: metadata.country,
            quality: metadata.quality
          };
        } else if (line && !line.startsWith('#') && currentChannel.name) {
          // This is the stream URL
          currentChannel.url = line;
          channels.push(currentChannel as IPTVChannel);
          currentChannel = {};
        }
      }
      
      this.channels = channels;
      console.log(`✅ Parsed ${channels.length} channels from M3U playlist`);
      return channels;
    } catch (error) {
      console.error('Error parsing M3U playlist:', error);
      throw new Error('Failed to parse M3U playlist');
    }
  }

  /**
   * Connect to Xtream Codes API and fetch channels
   */
  async connectXtreamCodes(credentials: XtreamCodesCredentials): Promise<{
    channels: IPTVChannel[];
    movies: IPTVChannel[];
    series: IPTVChannel[];
  }> {
    try {
      const baseUrl = `${credentials.host}:${credentials.port || '80'}`;
      const authParams = `username=${credentials.username}&password=${credentials.password}`;
      
      // Get live channels
      const liveResponse = await axios.get(
        `${baseUrl}/player_api.php?${authParams}&action=get_live_categories`
      );
      
      const channelsResponse = await axios.get(
        `${baseUrl}/player_api.php?${authParams}&action=get_live_streams`
      );
      
      // Get VOD movies
      const moviesResponse = await axios.get(
        `${baseUrl}/player_api.php?${authParams}&action=get_vod_streams`
      );
      
      // Get series
      const seriesResponse = await axios.get(
        `${baseUrl}/player_api.php?${authParams}&action=get_series`
      );
      
      const channels = this.parseXtreamChannels(channelsResponse.data, 'live', baseUrl, authParams);
      const movies = this.parseXtreamChannels(moviesResponse.data, 'vod', baseUrl, authParams);
      const series = this.parseXtreamChannels(seriesResponse.data, 'series', baseUrl, authParams);
      
      console.log(`✅ Connected to Xtream Codes: ${channels.length} live, ${movies.length} movies, ${series.length} series`);
      
      return { channels, movies, series };
    } catch (error) {
      console.error('Error connecting to Xtream Codes:', error);
      throw new Error('Failed to connect to Xtream Codes API');
    }
  }

  /**
   * Load EPG data from XML URL
   */
  async loadEPG(epgUrl: string): Promise<EPGProgram[]> {
    try {
      const response = await axios.get(epgUrl);
      const epgData = this.parseEPGXML(response.data);
      this.epgData = epgData;
      console.log(`✅ Loaded ${epgData.length} EPG programs`);
      return epgData;
    } catch (error) {
      console.error('Error loading EPG:', error);
      throw new Error('Failed to load EPG data');
    }
  }

  /**
   * Get channels by category
   */
  getChannelsByCategory(category: string): IPTVChannel[] {
    return this.channels.filter(channel => 
      channel.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Search channels by name
   */
  searchChannels(query: string): IPTVChannel[] {
    const searchTerm = query.toLowerCase();
    return this.channels.filter(channel =>
      channel.name.toLowerCase().includes(searchTerm) ||
      channel.group.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get EPG for specific channel
   */
  getChannelEPG(channelId: string, date?: Date): EPGProgram[] {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return this.epgData.filter(program =>
      program.channelId === channelId &&
      program.start >= startOfDay &&
      program.start <= endOfDay
    );
  }

  private parseExtinf(extinf: string): any {
    const metadata: any = {};
    
    // Extract channel name (last part after comma)
    const nameMatch = extinf.match(/,(.+)$/);
    if (nameMatch) {
      metadata.name = nameMatch[1].trim();
    }
    
    // Extract various attributes
    const tvgIdMatch = extinf.match(/tvg-id="([^"]+)"/);
    if (tvgIdMatch) metadata.tvgId = tvgIdMatch[1];
    
    const tvgLogoMatch = extinf.match(/tvg-logo="([^"]+)"/);
    if (tvgLogoMatch) metadata.tvgLogo = tvgLogoMatch[1];
    
    const groupMatch = extinf.match(/group-title="([^"]+)"/);
    if (groupMatch) metadata.group = groupMatch[1];
    
    const logoMatch = extinf.match(/logo="([^"]+)"/);
    if (logoMatch) metadata.logo = logoMatch[1];
    
    return metadata;
  }

  private parseXtreamChannels(data: any[], type: 'live' | 'vod' | 'series', baseUrl: string, authParams: string): IPTVChannel[] {
    return data.map(item => ({
      id: item.stream_id?.toString() || this.generateChannelId(),
      name: item.name || 'Unknown Channel',
      url: type === 'live' 
        ? `${baseUrl}/live/${authParams.split('&')[0].split('=')[1]}/${authParams.split('&')[1].split('=')[1]}/${item.stream_id}.m3u8`
        : `${baseUrl}/movie/${authParams.split('&')[0].split('=')[1]}/${authParams.split('&')[1].split('=')[1]}/${item.stream_id}.${item.container_extension || 'mp4'}`,
      logo: item.stream_icon,
      group: item.category_name || 'General',
      streamType: type,
      category: this.categorizeChannel(item.name, item.category_name),
      quality: this.extractQuality(item.name)
    }));
  }

  private parseEPGXML(xmlData: string): EPGProgram[] {
    // Basic EPG XML parsing - in production, use a proper XML parser
    const programs: EPGProgram[] = [];
    // This is a simplified implementation - would need proper XML parsing
    return programs;
  }

  private categorizeChannel(name: string, group?: string): string {
    const lowerName = name.toLowerCase();
    const lowerGroup = group?.toLowerCase() || '';
    
    if (lowerName.includes('sport') || lowerGroup.includes('sport')) return 'Sports';
    if (lowerName.includes('news') || lowerGroup.includes('news')) return 'News';
    if (lowerName.includes('movie') || lowerGroup.includes('movie')) return 'Movies';
    if (lowerName.includes('music') || lowerGroup.includes('music')) return 'Music';
    if (lowerName.includes('kids') || lowerGroup.includes('kids')) return 'Kids';
    if (lowerName.includes('doc') || lowerGroup.includes('doc')) return 'Documentary';
    
    return group || 'General';
  }

  private extractQuality(name: string): string {
    if (name.includes('4K') || name.includes('UHD')) return '4K';
    if (name.includes('HD') || name.includes('1080')) return 'HD';
    if (name.includes('720')) return 'HD';
    return 'SD';
  }

  private generateChannelId(): string {
    return `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Getter methods
  getAllChannels(): IPTVChannel[] {
    return this.channels;
  }

  getCategories(): string[] {
    const categories = new Set(this.channels.map(ch => ch.category));
    return Array.from(categories).sort();
  }
}

export const iptvService = new IPTVService();