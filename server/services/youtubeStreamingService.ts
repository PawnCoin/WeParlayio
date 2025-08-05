/**
 * YouTube Streaming Service - Real Live Sports Integration
 * Uses RapidAPI YouTube API v3 for authentic sports streaming
 * NO MOCK DATA - Only real YouTube channels and live streams
 */

interface YouTubeStream {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  videoId: string;
  streamUrl: string;
  embedUrl: string;
  quality: 'SD' | 'HD' | '4K';
  isLive: boolean;
  viewers?: number;
  sport: string;
  league: string;
  language: string;
  country: string;
  duration?: string;
  thumbnail: string;
}

interface SportChannelMapping {
  sport: string;
  channels: {
    channelId: string;
    channelName: string;
    defaultQuality: 'SD' | 'HD' | '4K';
    language: string;
    country: string;
  }[];
}

export class YouTubeStreamingService {
  private rapidApiKey: string;
  private baseHeaders: Record<string, string>;
  private sportChannels: Map<string, SportChannelMapping> = new Map();

  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY || '';
    this.baseHeaders = {
      'X-RapidAPI-Key': this.rapidApiKey,
      'X-RapidAPI-Host': 'youtube-v31.p.rapidapi.com',
      'Content-Type': 'application/json'
    };

    if (!this.rapidApiKey) {
      throw new Error('RAPIDAPI_KEY is required for YouTube streaming service');
    }

    this.initializeSportsChannels();
  }

  /**
   * Initialize official sports channels mapping
   */
  private initializeSportsChannels() {
    // NFL Official Channels
    this.sportChannels.set('americanfootball_nfl', {
      sport: 'NFL',
      channels: [
        {
          channelId: 'UCDVYQ4Zhbm3S2dlz7P1GBDg', // NFL Official
          channelName: 'NFL',
          defaultQuality: 'HD',
          language: 'en',
          country: 'US'
        },
        {
          channelId: 'UCxcTeAKWJca6XyJ37_ZoKIQ', // NFL RedZone
          channelName: 'NFL RedZone',
          defaultQuality: 'HD',
          language: 'en',
          country: 'US'
        }
      ]
    });

    // NBA Official Channels
    this.sportChannels.set('basketball_nba', {
      sport: 'NBA',
      channels: [
        {
          channelId: 'UCWj2vCA0lp5EbOHqlL60c1Q', // NBA Official
          channelName: 'NBA',
          defaultQuality: 'HD',
          language: 'en',
          country: 'US'
        },
        {
          channelId: 'UCBR8-60-B28hp2BmDPdntcQ', // NBA G League
          channelName: 'NBA G League',
          defaultQuality: 'HD',
          language: 'en',
          country: 'US'
        }
      ]
    });

    // MLB Official Channels
    this.sportChannels.set('baseball_mlb', {
      sport: 'MLB',
      channels: [
        {
          channelId: 'UCdw_JtAvWLPXPOsaLdDyNdA', // MLB Official
          channelName: 'MLB',
          defaultQuality: 'HD',
          language: 'en',
          country: 'US'
        }
      ]
    });

    // NHL Official Channels
    this.sportChannels.set('icehockey_nhl', {
      sport: 'NHL',
      channels: [
        {
          channelId: 'UCqFMzb-4AUf6WAIbl132QKA', // NHL Official
          channelName: 'NHL',
          defaultQuality: 'HD',
          language: 'en',
          country: 'US'
        }
      ]
    });

    // Soccer Channels
    this.sportChannels.set('soccer_epl', {
      sport: 'Soccer',
      channels: [
        {
          channelId: 'UCNAf1k0yIjyGu3k9BwAg3lg', // Sky Sports Premier League
          channelName: 'Sky Sports Premier League',
          defaultQuality: 'HD',
          language: 'en',
          country: 'UK'
        },
        {
          channelId: 'UC0aMHABPVAdUa1_JYHCIIhA', // ESPN FC
          channelName: 'ESPN FC',
          defaultQuality: 'HD',
          language: 'en',
          country: 'US'
        }
      ]
    });

    // Tennis Channels
    this.sportChannels.set('tennis_wta', {
      sport: 'Tennis',
      channels: [
        {
          channelId: 'UCbcxFkd6B9xUU54InHv4Vig', // Tennis TV
          channelName: 'Tennis TV',
          defaultQuality: 'HD',
          language: 'en',
          country: 'US'
        }
      ]
    });

    // MMA/UFC Channels
    this.sportChannels.set('mma_mixed_martial_arts', {
      sport: 'MMA',
      channels: [
        {
          channelId: 'UCvgfXK4nTYKudb0rFR6noLA', // UFC Official
          channelName: 'UFC',
          defaultQuality: 'HD',
          language: 'en',
          country: 'US'
        }
      ]
    });

    // Boxing Channels
    this.sportChannels.set('boxing_heavyweight', {
      sport: 'Boxing',
      channels: [
        {
          channelId: 'UCEBOzwQqBmKWtLKVIbxSKig', // Top Rank Boxing
          channelName: 'Top Rank Boxing',
          defaultQuality: 'HD',
          language: 'en',
          country: 'US'
        }
      ]
    });

    // ESPN General Sports
    this.sportChannels.set('general_sports', {
      sport: 'Sports',
      channels: [
        {
          channelId: 'UCiWLfSweyRNmLpgEHekhoAg', // ESPN
          channelName: 'ESPN',
          defaultQuality: 'HD',
          language: 'en',
          country: 'US'
        },
        {
          channelId: 'UC0aMHABPVAdUa1_JYHCIIhA', // ESPN FC
          channelName: 'ESPN FC',
          defaultQuality: 'HD',
          language: 'en',
          country: 'US'
        }
      ]
    });
  }

  /**
   * Search for live sports streams by team names
   */
  async searchLiveStreams(homeTeam: string, awayTeam: string, sport?: string): Promise<YouTubeStream[]> {
    try {
      const query = `${homeTeam} vs ${awayTeam} live${sport ? ` ${sport}` : ''}`;
      
      const response = await fetch(
        `https://youtube-v31.p.rapidapi.com/search?part=snippet&type=video&eventType=live&maxResults=25&q=${encodeURIComponent(query)}`,
        { headers: this.baseHeaders }
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformYouTubeResults(data.items || [], sport);
    } catch (error) {
      console.error('Error searching live streams:', error);
      return [];
    }
  }

  /**
   * Get live streams from official sport channels
   */
  async getOfficialSportStreams(sportKey: string): Promise<YouTubeStream[]> {
    const sportMapping = this.sportChannels.get(sportKey);
    if (!sportMapping) {
      return this.getFallbackSportsStreams();
    }

    const allStreams: YouTubeStream[] = [];

    for (const channel of sportMapping.channels) {
      try {
        const response = await fetch(
          `https://youtube-v31.p.rapidapi.com/search?part=snippet&channelId=${channel.channelId}&type=video&eventType=live&maxResults=10`,
          { headers: this.baseHeaders }
        );

        if (response.ok) {
          const data = await response.json();
          const streams = this.transformYouTubeResults(data.items || [], sportMapping.sport, channel);
          allStreams.push(...streams);
        }
      } catch (error) {
        console.error(`Error fetching streams from ${channel.channelName}:`, error);
      }
    }

    // If no live streams found, get recent uploads
    if (allStreams.length === 0) {
      return this.getRecentSportsContent(sportKey);
    }

    return allStreams;
  }

  /**
   * Get recent sports content when no live streams available
   */
  async getRecentSportsContent(sportKey: string): Promise<YouTubeStream[]> {
    const sportMapping = this.sportChannels.get(sportKey);
    if (!sportMapping) return [];

    const allContent: YouTubeStream[] = [];

    for (const channel of sportMapping.channels) {
      try {
        const response = await fetch(
          `https://youtube-v31.p.rapidapi.com/search?part=snippet&channelId=${channel.channelId}&type=video&order=date&maxResults=5`,
          { headers: this.baseHeaders }
        );

        if (response.ok) {
          const data = await response.json();
          const content = this.transformYouTubeResults(data.items || [], sportMapping.sport, channel, false);
          allContent.push(...content);
        }
      } catch (error) {
        console.error(`Error fetching content from ${channel.channelName}:`, error);
      }
    }

    return allContent;
  }

  /**
   * Get fallback sports streams from general sports channels
   */
  async getFallbackSportsStreams(): Promise<YouTubeStream[]> {
    try {
      const response = await fetch(
        `https://youtube-v31.p.rapidapi.com/search?part=snippet&type=video&eventType=live&q=sports%20live&maxResults=15`,
        { headers: this.baseHeaders }
      );

      if (!response.ok) {
        return this.get24x7SportsChannels();
      }

      const data = await response.json();
      return this.transformYouTubeResults(data.items || [], 'Sports');
    } catch (error) {
      console.error('Error fetching fallback streams:', error);
      return this.get24x7SportsChannels();
    }
  }

  /**
   * Get 24/7 sports news and highlights channels
   */
  async get24x7SportsChannels(): Promise<YouTubeStream[]> {
    const channels = [
      'UCiWLfSweyRNmLpgEHekhoAg', // ESPN
      'UCNAf1k0yIjyGu3k9BwAg3lg', // Sky Sports
      'UCWj2vCA0lp5EbOHqlL60c1Q', // NBA
      'UCDVYQ4Zhbm3S2dlz7P1GBDg'  // NFL
    ];

    const allStreams: YouTubeStream[] = [];

    for (const channelId of channels) {
      try {
        const response = await fetch(
          `https://youtube-v31.p.rapidapi.com/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=3`,
          { headers: this.baseHeaders }
        );

        if (response.ok) {
          const data = await response.json();
          const streams = this.transformYouTubeResults(data.items || [], 'Sports', undefined, false);
          allStreams.push(...streams);
        }
      } catch (error) {
        console.error(`Error fetching 24/7 content from ${channelId}:`, error);
      }
    }

    return allStreams;
  }

  /**
   * Get stream details including viewer count
   */
  async getStreamDetails(videoId: string): Promise<any> {
    try {
      const response = await fetch(
        `https://youtube-v31.p.rapidapi.com/videos?part=snippet,statistics,liveStreamingDetails&id=${videoId}`,
        { headers: this.baseHeaders }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data.items?.[0] || null;
    } catch (error) {
      console.error('Error fetching stream details:', error);
      return null;
    }
  }

  /**
   * Transform YouTube API results to our stream format
   */
  private transformYouTubeResults(
    items: any[], 
    sport: string, 
    channelInfo?: any, 
    isLive: boolean = true
  ): YouTubeStream[] {
    return items.map((item: any) => ({
      id: `yt-${item.id.videoId || item.id}`,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      videoId: item.id.videoId || item.id,
      streamUrl: `https://www.youtube.com/watch?v=${item.id.videoId || item.id}`,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId || item.id}?autoplay=1`,
      quality: channelInfo?.defaultQuality || 'HD',
      isLive: isLive && item.snippet.liveBroadcastContent === 'live',
      sport,
      league: this.extractLeague(item.snippet.title, sport),
      language: channelInfo?.language || 'en',
      country: channelInfo?.country || 'US',
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      duration: item.contentDetails?.duration || undefined
    }));
  }

  /**
   * Extract league information from video title
   */
  private extractLeague(title: string, sport: string): string {
    const leaguePatterns = {
      'NFL': /NFL|National Football League|RedZone/i,
      'NBA': /NBA|National Basketball Association/i,
      'MLB': /MLB|Major League Baseball|World Series/i,
      'NHL': /NHL|National Hockey League|Stanley Cup/i,
      'Premier League': /Premier League|EPL/i,
      'Champions League': /Champions League|UCL/i,
      'UFC': /UFC|Ultimate Fighting/i,
      'ATP': /ATP|Wimbledon|US Open|French Open|Australian Open/i,
      'WTA': /WTA|Wimbledon|US Open|French Open|Australian Open/i
    };

    for (const [league, pattern] of Object.entries(leaguePatterns)) {
      if (pattern.test(title)) {
        return league;
      }
    }

    return sport;
  }

  /**
   * Get trending sports videos
   */
  async getTrendingSportsVideos(): Promise<YouTubeStream[]> {
    try {
      const response = await fetch(
        `https://youtube-v31.p.rapidapi.com/search?part=snippet&type=video&order=relevance&q=sports&maxResults=20`,
        { headers: this.baseHeaders }
      );

      if (!response.ok) return [];

      const data = await response.json();
      return this.transformYouTubeResults(data.items || [], 'Sports', undefined, false);
    } catch (error) {
      console.error('Error fetching trending sports videos:', error);
      return [];
    }
  }

  /**
   * Validate stream availability
   */
  async validateStreamAvailability(videoId: string): Promise<boolean> {
    try {
      const details = await this.getStreamDetails(videoId);
      return details && (details.snippet.liveBroadcastContent === 'live' || details.snippet.liveBroadcastContent === 'upcoming');
    } catch (error) {
      console.error('Error validating stream:', error);
      return false;
    }
  }
}

export const youtubeStreamingService = new YouTubeStreamingService();