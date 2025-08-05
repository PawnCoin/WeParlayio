/**
 * Live Streaming Routes - Universal Sports Streaming API
 * Connects YouTube API, IPTV, and live sports data
 * NO MOCK DATA - Only authentic streaming sources
 */

import { Router } from 'express';
import { youtubeStreamingService } from '../services/youtubeStreamingService';
import { liveSportsRoutingService } from '../services/liveSportsRoutingService';
import { iptvService } from '../services/iptvService';

const router = Router();

/**
 * Get live stream for specific sport
 * /api/live-streaming/sport/{sportKey}?gameId=optional
 */
router.get('/sport/:sportKey', async (req, res) => {
  try {
    const { sportKey } = req.params;
    const { gameId } = req.query;

    console.log(`🎯 Live streaming request: ${sportKey} (Game: ${gameId})`);

    // Try multiple sources in order of preference
    let stream = null;

    // 1. Try our routing service first (fastest)
    stream = await liveSportsRoutingService.getLiveStreamForSport(sportKey, gameId as string);
    
    if (stream) {
      console.log(`✅ Found stream via routing service: ${stream.name}`);
      return res.json({
        success: true,
        stream: {
          id: stream.id,
          name: stream.name,
          streamUrl: stream.streamUrl,
          streamType: stream.streamType,
          quality: stream.quality,
          isLive: stream.isLive,
          sport: stream.sport,
          league: stream.league,
          language: stream.language,
          country: stream.country
        }
      });
    }

    // 2. Try YouTube official channels
    const youtubeStreams = await youtubeStreamingService.getOfficialSportStreams(sportKey);
    
    if (youtubeStreams.length > 0) {
      const bestStream = youtubeStreams[0]; // Get the best quality stream
      console.log(`✅ Found YouTube stream: ${bestStream.title}`);
      
      return res.json({
        success: true,
        stream: {
          id: bestStream.id,
          name: bestStream.title,
          streamUrl: bestStream.streamUrl,
          embedUrl: bestStream.embedUrl,
          streamType: 'youtube',
          quality: bestStream.quality,
          isLive: bestStream.isLive,
          sport: bestStream.sport,
          league: bestStream.league,
          language: bestStream.language,
          country: bestStream.country,
          thumbnail: bestStream.thumbnail,
          channelName: bestStream.channelTitle
        }
      });
    }

    // 3. Try IPTV as fallback
    try {
      const iptvChannels = await iptvService.getAllChannels();
      const sportsChannels = iptvChannels.filter(ch => 
        ch.category?.toLowerCase().includes('sport') ||
        ch.name.toLowerCase().includes('sport') ||
        ch.name.toLowerCase().includes(sportKey.split('_')[0])
      );

      if (sportsChannels.length > 0) {
        const channel = sportsChannels[0];
        console.log(`✅ Found IPTV channel: ${channel.name}`);
        
        return res.json({
          success: true,
          stream: {
            id: `iptv-${channel.id}`,
            name: channel.name,
            streamUrl: channel.url,
            streamType: 'iptv',
            quality: 'HD',
            isLive: true,
            sport: sportKey.split('_')[0].toUpperCase(),
            league: 'Live TV',
            language: 'en',
            country: 'US'
          }
        });
      }
    } catch (iptvError) {
      console.log('IPTV not available, continuing with other sources');
    }

    // 4. Get fallback sports content
    const fallbackStreams = await youtubeStreamingService.getFallbackSportsStreams();
    
    if (fallbackStreams.length > 0) {
      const fallbackStream = fallbackStreams[0];
      console.log(`✅ Found fallback stream: ${fallbackStream.title}`);
      
      return res.json({
        success: true,
        stream: {
          id: fallbackStream.id,
          name: fallbackStream.title,
          streamUrl: fallbackStream.streamUrl,
          embedUrl: fallbackStream.embedUrl,
          streamType: 'youtube',
          quality: fallbackStream.quality,
          isLive: fallbackStream.isLive,
          sport: fallbackStream.sport,
          league: fallbackStream.league,
          language: fallbackStream.language,
          country: fallbackStream.country,
          thumbnail: fallbackStream.thumbnail
        }
      });
    }

    // No streams found
    console.log(`❌ No streams found for ${sportKey}`);
    res.json({
      success: false,
      message: 'No live streams available for this sport',
      suggestions: [
        'Try searching for specific team matchups',
        'Check back later for live games',
        'Browse trending sports content'
      ]
    });

  } catch (error) {
    console.error('Live streaming error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live streams',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get all available streams for a sport
 * /api/live-streaming/sport/{sportKey}/all
 */
router.get('/sport/:sportKey/all', async (req, res) => {
  try {
    const { sportKey } = req.params;
    console.log(`🎯 All streams request for: ${sportKey}`);

    const allStreams: any[] = [];

    // Get routing service streams
    const routingStreams = liveSportsRoutingService.getAllStreamsForSport(sportKey);
    allStreams.push(...routingStreams.map(stream => ({
      id: stream.id,
      name: stream.name,
      streamUrl: stream.streamUrl,
      streamType: stream.streamType,
      quality: stream.quality,
      isLive: stream.isLive,
      sport: stream.sport,
      league: stream.league,
      language: stream.language,
      country: stream.country,
      source: 'routing'
    })));

    // Get YouTube streams
    const youtubeStreams = await youtubeStreamingService.getOfficialSportStreams(sportKey);
    allStreams.push(...youtubeStreams.map(stream => ({
      id: stream.id,
      name: stream.title,
      streamUrl: stream.streamUrl,
      embedUrl: stream.embedUrl,
      streamType: 'youtube',
      quality: stream.quality,
      isLive: stream.isLive,
      sport: stream.sport,
      league: stream.league,
      language: stream.language,
      country: stream.country,
      thumbnail: stream.thumbnail,
      channelName: stream.channelTitle,
      source: 'youtube'
    })));

    // Get IPTV sports channels
    try {
      const iptvChannels = await iptvService.getAllChannels();
      const sportsChannels = iptvChannels.filter(ch => 
        ch.category?.toLowerCase().includes('sport')
      ).slice(0, 5); // Limit to 5 IPTV channels

      allStreams.push(...sportsChannels.map(channel => ({
        id: `iptv-${channel.id}`,
        name: channel.name,
        streamUrl: channel.url,
        streamType: 'iptv',
        quality: 'HD',
        isLive: true,
        sport: 'Sports',
        league: 'Live TV',
        language: 'en',
        country: 'US',
        source: 'iptv'
      })));
    } catch (iptvError) {
      console.log('IPTV not available for all streams');
    }

    console.log(`✅ Found ${allStreams.length} streams for ${sportKey}`);

    res.json({
      success: true,
      streams: allStreams,
      total: allStreams.length,
      sportKey,
      sources: ['routing', 'youtube', 'iptv']
    });

  } catch (error) {
    console.error('All streams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all streams',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Search for live streams by teams
 * /api/live-streaming/search?team1=Lakers&team2=Warriors&sport=basketball
 */
router.get('/search', async (req, res) => {
  try {
    const { team1, team2, sport } = req.query;
    
    if (!team1 || !team2) {
      return res.status(400).json({
        success: false,
        message: 'Both team1 and team2 parameters are required'
      });
    }

    console.log(`🔍 Searching streams: ${team1} vs ${team2} (${sport})`);

    // Search YouTube for specific matchup
    const youtubeStreams = await youtubeStreamingService.searchLiveStreams(
      team1 as string, 
      team2 as string, 
      sport as string
    );

    if (youtubeStreams.length > 0) {
      const bestStream = youtubeStreams[0];
      
      res.json({
        success: true,
        stream: {
          id: bestStream.id,
          name: bestStream.title,
          streamUrl: bestStream.streamUrl,
          embedUrl: bestStream.embedUrl,
          streamType: 'youtube',
          quality: bestStream.quality,
          isLive: bestStream.isLive,
          sport: bestStream.sport,
          league: bestStream.league,
          language: bestStream.language,
          country: bestStream.country,
          thumbnail: bestStream.thumbnail,
          channelName: bestStream.channelTitle,
          matchup: `${team1} vs ${team2}`
        },
        allResults: youtubeStreams.map(stream => ({
          id: stream.id,
          title: stream.title,
          streamUrl: stream.streamUrl,
          quality: stream.quality,
          isLive: stream.isLive,
          channelName: stream.channelTitle
        }))
      });
    } else {
      res.json({
        success: false,
        message: `No live streams found for ${team1} vs ${team2}`,
        suggestions: [
          'Check if the teams are spelled correctly',
          'Try searching without team names',
          'Browse general sports content'
        ]
      });
    }

  } catch (error) {
    console.error('Search streams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search streams',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get stream recommendations (trending/popular)
 * /api/live-streaming/recommendations
 */
router.get('/recommendations', async (req, res) => {
  try {
    console.log('🎯 Getting stream recommendations');

    // Get trending sports content from YouTube
    const trendingStreams = await youtubeStreamingService.getTrendingSportsVideos();
    
    // Get 24/7 sports channels
    const alwaysOnStreams = await youtubeStreamingService.get24x7SportsChannels();

    const recommendations = [
      ...trendingStreams.slice(0, 10),
      ...alwaysOnStreams.slice(0, 5)
    ].map(stream => ({
      id: stream.id,
      name: stream.title,
      streamUrl: stream.streamUrl,
      embedUrl: stream.embedUrl,
      streamType: 'youtube',
      quality: stream.quality,
      isLive: stream.isLive,
      sport: stream.sport,
      league: stream.league,
      language: stream.language,
      country: stream.country,
      thumbnail: stream.thumbnail,
      channelName: stream.channelTitle,
      category: trendingStreams.includes(stream) ? 'trending' : '24/7'
    }));

    console.log(`✅ Returning ${recommendations.length} recommendations`);

    res.json({
      success: true,
      recommendations,
      total: recommendations.length,
      categories: {
        trending: trendingStreams.length,
        alwaysOn: alwaysOnStreams.length
      }
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Validate stream availability
 * /api/live-streaming/validate/{videoId}
 */
router.get('/validate/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const isAvailable = await youtubeStreamingService.validateStreamAvailability(videoId);
    const details = await youtubeStreamingService.getStreamDetails(videoId);

    res.json({
      success: true,
      videoId,
      isAvailable,
      isLive: details?.snippet?.liveBroadcastContent === 'live',
      details: details ? {
        title: details.snippet.title,
        channelTitle: details.snippet.channelTitle,
        viewCount: details.statistics?.viewCount,
        likeCount: details.statistics?.likeCount,
        concurrentViewers: details.liveStreamingDetails?.concurrentViewers
      } : null
    });

  } catch (error) {
    console.error('Validate stream error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate stream',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const liveStreamingRoutes = router;
export default router;