
import { Router } from 'express';
import { liveSportsRoutingService } from '../services/liveSportsRoutingService';

const router = Router();

// Get live stream for specific sport
router.get('/sport/:sportKey', async (req, res) => {
  try {
    const { sportKey } = req.params;
    const { gameId } = req.query;

    const stream = await liveSportsRoutingService.getLiveStreamForSport(
      sportKey, 
      gameId as string
    );

    if (!stream) {
      return res.status(404).json({
        success: false,
        message: 'No live stream available for this sport',
        sportKey
      });
    }

    res.json({
      success: true,
      stream,
      message: 'Live stream found'
    });
  } catch (error) {
    console.error('Error getting live stream:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get live stream'
    });
  }
});

// Get all available streams for a sport
router.get('/sport/:sportKey/all', async (req, res) => {
  try {
    const { sportKey } = req.params;
    const streams = liveSportsRoutingService.getAllStreamsForSport(sportKey);

    res.json({
      success: true,
      streams,
      count: streams.length
    });
  } catch (error) {
    console.error('Error getting all streams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get streams'
    });
  }
});

// Get live stream by game ID
router.get('/game/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    // This would typically query your database for the game's sport type
    // For now, we'll return a generic sports stream
    const stream = {
      id: `game-${gameId}`,
      name: 'Live Sports Stream',
      sport: 'Multi-Sport',
      league: 'Live Sports',
      streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UCsH8-GlpE_4tM7lNx-VEOvQ',
      streamType: 'youtube',
      quality: 'HD',
      isLive: true,
      language: 'en',
      country: 'US'
    };

    res.json({
      success: true,
      stream,
      gameId
    });
  } catch (error) {
    console.error('Error getting game stream:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get game stream'
    });
  }
});

// Search for streams by team names
router.get('/search', async (req, res) => {
  try {
    const { team1, team2, sport } = req.query;
    
    let streamUrl;
    if (team1 && team2) {
      const searchQuery = `${team1} vs ${team2} live stream`;
      streamUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    } else if (sport) {
      streamUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(sport + ' live stream')}`;
    } else {
      streamUrl = 'https://www.youtube.com/results?search_query=live sports';
    }

    const stream = {
      id: 'search-result',
      name: `Live Stream: ${team1 || 'Sports'} ${team2 ? `vs ${team2}` : ''}`,
      sport: sport as string || 'Multi-Sport',
      league: 'Live Search',
      streamUrl,
      streamType: 'youtube',
      quality: 'HD',
      isLive: true,
      language: 'en',
      country: 'US'
    };

    res.json({
      success: true,
      stream,
      searchQuery: { team1, team2, sport }
    });
  } catch (error) {
    console.error('Error searching streams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search streams'
    });
  }
});

// Get stream recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const recommendations = [
      {
        id: 'espn-live',
        name: 'ESPN Live',
        sport: 'Multi-Sport',
        league: 'ESPN',
        streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UCsH8-GlpE_4tM7lNx-VEOvQ',
        streamType: 'youtube',
        quality: 'HD',
        isLive: true,
        language: 'en',
        country: 'US'
      },
      {
        id: 'fox-sports',
        name: 'Fox Sports Live',
        sport: 'Multi-Sport',
        league: 'Fox Sports',
        streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UCwWhs_6x42TyRM4Wstoq8HA',
        streamType: 'youtube',
        quality: 'HD',
        isLive: true,
        language: 'en',
        country: 'US'
      },
      {
        id: 'nba-tv',
        name: 'NBA TV',
        sport: 'Basketball',
        league: 'NBA',
        streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UCsH8-GlpE_4tM7lNx-VEOvQ',
        streamType: 'youtube',
        quality: 'HD',
        isLive: true,
        language: 'en',
        country: 'US'
      }
    ];

    res.json({
      success: true,
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations'
    });
  }
});

export default router;
