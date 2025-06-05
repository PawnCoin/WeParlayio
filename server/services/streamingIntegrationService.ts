import axios from 'axios';

interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
}

interface YouTubeStream {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    liveBroadcastContent: string;
    publishedAt: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
  };
}

interface UnifiedStream {
  id: string;
  platform: 'twitch' | 'youtube';
  title: string;
  gameCategory: string;
  viewerCount: number;
  thumbnailUrl: string;
  streamUrl: string;
  isLive: boolean;
  startedAt: string;
  channelName: string;
  embedUrl: string;
}

export class StreamingIntegrationService {
  private twitchAccessToken: string | null = null;
  private readonly CHANNEL_USERNAME = 'srjrgamingllc';

  async getTwitchAccessToken(): Promise<string> {
    if (this.twitchAccessToken) {
      return this.twitchAccessToken;
    }

    if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
      throw new Error('Twitch API credentials not configured');
    }

    try {
      const params = new URLSearchParams();
      params.append('client_id', process.env.TWITCH_CLIENT_ID!);
      params.append('client_secret', process.env.TWITCH_CLIENT_SECRET!);
      params.append('grant_type', 'client_credentials');

      const response = await axios.post('https://id.twitch.tv/oauth2/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.twitchAccessToken = response.data.access_token;
      console.log('✅ Twitch OAuth authentication successful');
      return this.twitchAccessToken;
    } catch (error: any) {
      console.error('Twitch authentication failed:', error.response?.data || error.message);
      return '';
    }
  }

  async getTwitchUserStreams(): Promise<UnifiedStream[]> {
    try {
      const accessToken = await this.getTwitchAccessToken();
      
      // Get user ID first
      const userResponse = await axios.get(`https://api.twitch.tv/helix/users?login=${this.CHANNEL_USERNAME}`, {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!userResponse.data.data.length) {
        return [];
      }

      const userId = userResponse.data.data[0].id;

      // Get streams
      const streamResponse = await axios.get(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return streamResponse.data.data.map((stream: TwitchStream) => ({
        id: `twitch-${stream.id}`,
        platform: 'twitch' as const,
        title: stream.title,
        gameCategory: stream.game_name || 'Gaming',
        viewerCount: stream.viewer_count,
        thumbnailUrl: stream.thumbnail_url.replace('{width}', '1920').replace('{height}', '1080'),
        streamUrl: `https://www.twitch.tv/${stream.user_login}`,
        embedUrl: `https://player.twitch.tv/?channel=${stream.user_login}&parent=${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost'}`,
        isLive: true,
        startedAt: stream.started_at,
        channelName: stream.user_name
      }));
    } catch (error) {
      console.error('Failed to fetch Twitch streams:', error);
      return [];
    }
  }

  async getYouTubeUserStreams(): Promise<UnifiedStream[]> {
    try {
      const channelResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          channelId: await this.getYouTubeChannelId(),
          part: 'snippet',
          type: 'video',
          eventType: 'live',
          maxResults: 10
        }
      });

      const streams = await Promise.all(
        channelResponse.data.items.map(async (video: YouTubeStream) => {
          // Get video statistics
          const statsResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
            params: {
              key: process.env.YOUTUBE_API_KEY,
              id: video.id.videoId,
              part: 'statistics,liveStreamingDetails'
            }
          });

          const stats = statsResponse.data.items[0];
          
          return {
            id: `youtube-${video.id.videoId}`,
            platform: 'youtube' as const,
            title: video.snippet.title,
            gameCategory: 'Gaming',
            viewerCount: stats.statistics?.viewCount ? parseInt(stats.statistics.viewCount) : 0,
            thumbnailUrl: video.snippet.thumbnails.high.url,
            streamUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
            embedUrl: `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1&mute=0`,
            isLive: video.snippet.liveBroadcastContent === 'live',
            startedAt: video.snippet.publishedAt,
            channelName: video.snippet.channelTitle
          };
        })
      );

      return streams;
    } catch (error) {
      console.error('Failed to fetch YouTube streams:', error);
      return [];
    }
  }

  async getYouTubeChannelId(): Promise<string> {
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          forUsername: this.CHANNEL_USERNAME,
          part: 'id'
        }
      });

      if (response.data.items.length > 0) {
        return response.data.items[0].id;
      }

      // If username search fails, try searching by channel name
      const searchResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          q: this.CHANNEL_USERNAME,
          type: 'channel',
          part: 'id',
          maxResults: 1
        }
      });

      if (searchResponse.data.items.length > 0) {
        return searchResponse.data.items[0].id.channelId;
      }

      throw new Error('Channel not found');
    } catch (error) {
      console.error('Failed to get YouTube channel ID:', error);
      throw new Error('YouTube channel lookup failed');
    }
  }

  async getAllUserStreams(): Promise<UnifiedStream[]> {
    const [twitchStreams, youtubeStreams] = await Promise.all([
      this.getTwitchUserStreams().catch(() => []),
      this.getYouTubeUserStreams().catch(() => [])
    ]);

    return [...twitchStreams, ...youtubeStreams].sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  async getEsportsStreams(): Promise<UnifiedStream[]> {
    try {
      const accessToken = await this.getTwitchAccessToken();
      
      // Get top esports games
      const gamesResponse = await axios.get('https://api.twitch.tv/helix/games/top', {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          first: 20
        }
      });

      const esportsGameIds = gamesResponse.data.data
        .filter((game: any) => 
          game.name.toLowerCase().includes('league of legends') ||
          game.name.toLowerCase().includes('dota') ||
          game.name.toLowerCase().includes('counter-strike') ||
          game.name.toLowerCase().includes('valorant') ||
          game.name.toLowerCase().includes('overwatch') ||
          game.name.toLowerCase().includes('rocket league') ||
          game.name.toLowerCase().includes('fortnite') ||
          game.name.toLowerCase().includes('apex legends')
        )
        .map((game: any) => game.id);

      if (esportsGameIds.length === 0) {
        return [];
      }

      // Get streams for esports games
      const streamsResponse = await axios.get('https://api.twitch.tv/helix/streams', {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          game_id: esportsGameIds.slice(0, 10).join(','),
          first: 20,
          language: 'en'
        }
      });

      return streamsResponse.data.data.map((stream: TwitchStream) => ({
        id: `esports-${stream.id}`,
        platform: 'twitch' as const,
        title: stream.title,
        gameCategory: stream.game_name,
        viewerCount: stream.viewer_count,
        thumbnailUrl: stream.thumbnail_url.replace('{width}', '1920').replace('{height}', '1080'),
        streamUrl: `https://www.twitch.tv/${stream.user_login}`,
        embedUrl: `https://player.twitch.tv/?channel=${stream.user_login}&parent=${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost'}`,
        isLive: true,
        startedAt: stream.started_at,
        channelName: stream.user_name
      }));
    } catch (error) {
      console.error('Failed to fetch esports streams:', error);
      return [];
    }
  }
}

export const streamingIntegrationService = new StreamingIntegrationService();