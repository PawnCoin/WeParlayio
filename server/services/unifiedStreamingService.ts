/**
 * Unified Streaming Service - Integrates authentic streaming APIs
 * Uses RapidAPI for Twitch, YouTube, and other streaming sources
 */

interface StreamData {
  id: string;
  title: string;
  game?: string;
  sport?: string;
  streamer: string;
  thumbnailUrl: string;
  viewerCount: number;
  isLive: boolean;
  language: string;
  quality: 'SD' | 'HD' | '4K';
  streamUrl: string;
  platform: 'twitch' | 'youtube' | 'facebook' | 'kick';
  category: 'esports' | 'sports' | 'general';
  tags: string[];
  startTime?: string;
}

interface TwitchStream {
  id: string;
  user_name: string;
  game_name: string;
  title: string;
  viewer_count: number;
  thumbnail_url: string;
  language: string;
  is_mature: boolean;
  tag_ids: string[];
}

interface YouTubeStream {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnailUrl: string;
    liveBroadcastContent: string;
  };
  statistics?: {
    viewCount: string;
  };
}

export class UnifiedStreamingService {
  private rapidApiKey: string;
  private rapidApiHost = 'twitch-api.p.rapidapi.com';
  private youtubeApiHost = 'youtube-v3-alternative.p.rapidapi.com';

  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY || '';
    if (!this.rapidApiKey) {
      console.warn('RapidAPI key not found. Streaming features will be limited.');
    }
  }

  /**
   * Get live Twitch streams for esports
   */
  async getTwitchEsportsStreams(): Promise<StreamData[]> {
    if (!this.rapidApiKey) {
      return [];
    }

    try {
      const response = await fetch('https://twitch-api.p.rapidapi.com/streams', {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': this.rapidApiHost
        }
      });

      if (!response.ok) {
        throw new Error(`Twitch API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformTwitchData(data.data || []);
    } catch (error) {
      console.error('Twitch API error:', error);
      return [];
    }
  }

  /**
   * Get specific game streams from Twitch
   */
  async getTwitchGameStreams(gameId: string): Promise<StreamData[]> {
    if (!this.rapidApiKey) {
      return [];
    }

    try {
      const response = await fetch(`https://twitch-api.p.rapidapi.com/streams?game_id=${gameId}`, {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': this.rapidApiHost
        }
      });

      if (!response.ok) {
        throw new Error(`Twitch API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformTwitchData(data.data || []);
    } catch (error) {
      console.error('Twitch game streams error:', error);
      return [];
    }
  }

  /**
   * Get YouTube live streams
   */
  async getYouTubeLiveStreams(query: string = 'live sports'): Promise<StreamData[]> {
    if (!this.rapidApiKey) {
      return [];
    }

    try {
      const response = await fetch(`https://youtube-v3-alternative.p.rapidapi.com/search?query=${encodeURIComponent(query)}&type=video&eventType=live`, {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': this.youtubeApiHost
        }
      });

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformYouTubeData(data.items || []);
    } catch (error) {
      console.error('YouTube API error:', error);
      return [];
    }
  }

  /**
   * Get streams by sport type
   */
  async getStreamsBySport(sport: string): Promise<StreamData[]> {
    const streams: StreamData[] = [];

    // Get YouTube sports streams
    const youtubeStreams = await this.getYouTubeLiveStreams(`${sport} live`);
    streams.push(...youtubeStreams);

    // Get Twitch streams for specific sports/games
    const gameMapping: { [key: string]: string } = {
      'football': '518203', // American Football on Twitch
      'basketball': '518204', // Basketball on Twitch
      'soccer': '518205', // Soccer on Twitch
      'baseball': '518206', // Baseball on Twitch
      'esports': '509658', // League of Legends
      'valorant': '516575',
      'csgo': '32399',
      'dota2': '29595'
    };

    const gameId = gameMapping[sport.toLowerCase()];
    if (gameId) {
      const twitchStreams = await this.getTwitchGameStreams(gameId);
      streams.push(...twitchStreams);
    }

    return streams;
  }

  /**
   * Search streams across all platforms
   */
  async searchStreams(query: string): Promise<StreamData[]> {
    const streams: StreamData[] = [];

    // Search YouTube
    const youtubeStreams = await this.getYouTubeLiveStreams(query);
    streams.push(...youtubeStreams);

    // Search Twitch (by category/game)
    const twitchStreams = await this.getTwitchEsportsStreams();
    const filteredTwitch = twitchStreams.filter(stream => 
      stream.title.toLowerCase().includes(query.toLowerCase()) ||
      (stream.game && stream.game.toLowerCase().includes(query.toLowerCase()))
    );
    streams.push(...filteredTwitch);

    return streams;
  }

  /**
   * Get top live streams across all platforms
   */
  async getTopLiveStreams(): Promise<StreamData[]> {
    const streams: StreamData[] = [];

    // Get top Twitch streams
    const twitchStreams = await this.getTwitchEsportsStreams();
    streams.push(...twitchStreams.slice(0, 10));

    // Get top YouTube live streams
    const youtubeStreams = await this.getYouTubeLiveStreams('live');
    streams.push(...youtubeStreams.slice(0, 10));

    // Sort by viewer count
    return streams.sort((a, b) => b.viewerCount - a.viewerCount);
  }

  /**
   * Transform Twitch API data to our format
   */
  private transformTwitchData(twitchStreams: TwitchStream[]): StreamData[] {
    return twitchStreams.map(stream => ({
      id: `twitch_${stream.id}`,
      title: stream.title,
      game: stream.game_name,
      streamer: stream.user_name,
      thumbnailUrl: stream.thumbnail_url.replace('{width}x{height}', '400x225'),
      viewerCount: stream.viewer_count,
      isLive: true,
      language: stream.language || 'en',
      quality: stream.viewer_count > 10000 ? 'HD' : 'SD',
      streamUrl: `https://twitch.tv/${stream.user_name}`,
      platform: 'twitch',
      category: this.categorizeGame(stream.game_name),
      tags: stream.tag_ids || []
    }));
  }

  /**
   * Transform YouTube API data to our format
   */
  private transformYouTubeData(youtubeStreams: YouTubeStream[]): StreamData[] {
    return youtubeStreams.map(stream => ({
      id: `youtube_${stream.id.videoId}`,
      title: stream.snippet.title,
      streamer: stream.snippet.channelTitle,
      thumbnailUrl: stream.snippet.thumbnailUrl || 'https://picsum.photos/400/225',
      viewerCount: parseInt(stream.statistics?.viewCount || '0'),
      isLive: stream.snippet.liveBroadcastContent === 'live',
      language: 'en',
      quality: 'HD',
      streamUrl: `https://youtube.com/watch?v=${stream.id.videoId}`,
      platform: 'youtube',
      category: this.categorizeTitle(stream.snippet.title),
      tags: []
    }));
  }

  /**
   * Categorize game by name
   */
  private categorizeGame(gameName: string): 'esports' | 'sports' | 'general' {
    const esportsGames = [
      'League of Legends', 'Valorant', 'Counter-Strike', 'Dota 2',
      'Overwatch', 'Rocket League', 'Call of Duty', 'Fortnite',
      'Apex Legends', 'Rainbow Six Siege'
    ];

    const sportsGames = [
      'FIFA', 'NBA 2K', 'Madden NFL', 'MLB The Show',
      'NHL', 'F1', 'Gran Turismo', 'iRacing'
    ];

    const lowerGameName = gameName.toLowerCase();

    if (esportsGames.some(game => lowerGameName.includes(game.toLowerCase()))) {
      return 'esports';
    }

    if (sportsGames.some(game => lowerGameName.includes(game.toLowerCase()))) {
      return 'sports';
    }

    return 'general';
  }

  /**
   * Categorize stream by title
   */
  private categorizeTitle(title: string): 'esports' | 'sports' | 'general' {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('tournament') || lowerTitle.includes('championship') || 
        lowerTitle.includes('esports') || lowerTitle.includes('gaming')) {
      return 'esports';
    }

    if (lowerTitle.includes('live') && (lowerTitle.includes('football') || 
        lowerTitle.includes('basketball') || lowerTitle.includes('soccer') ||
        lowerTitle.includes('baseball') || lowerTitle.includes('sport'))) {
      return 'sports';
    }

    return 'general';
  }

  /**
   * Get stream analytics
   */
  async getStreamAnalytics(): Promise<{
    totalLiveStreams: number;
    totalViewers: number;
    topCategories: string[];
    platformDistribution: { [platform: string]: number };
  }> {
    const streams = await this.getTopLiveStreams();
    
    const totalViewers = streams.reduce((sum, stream) => sum + stream.viewerCount, 0);
    
    const categories = streams.map(s => s.category);
    const topCategories = [...new Set(categories)];
    
    const platformDistribution = streams.reduce((acc, stream) => {
      acc[stream.platform] = (acc[stream.platform] || 0) + 1;
      return acc;
    }, {} as { [platform: string]: number });

    return {
      totalLiveStreams: streams.length,
      totalViewers,
      topCategories,
      platformDistribution
    };
  }
}

export const unifiedStreamingService = new UnifiedStreamingService();