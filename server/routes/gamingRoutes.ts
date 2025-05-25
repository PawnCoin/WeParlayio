// WeParlay Gaming API Routes
import { Router } from 'express';
import { gamingAPIService } from '../services/gamingAPIService';

const router = Router();

// Connect gaming account
router.post('/connect/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { username, userId } = req.body;

    console.log(`Connecting ${platform} account for user: ${userId}, username: ${username}`);

    let accountData;
    
    switch (platform) {
      case 'xbox':
        accountData = await gamingAPIService.getXboxPlayerStats(username);
        break;
      case 'steam':
        accountData = await gamingAPIService.getSteamPlayerSummary(username);
        break;
      case 'twitch':
        accountData = await gamingAPIService.getTwitchUserByUsername(username);
        break;
      case 'youtube':
        accountData = await gamingAPIService.getYouTubeChannelData(username);
        break;
      case 'playstation':
        accountData = await gamingAPIService.getPlayStationProfile(username);
        break;
      case 'epic':
        accountData = await gamingAPIService.getEpicGamesProfile(username);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported platform' });
    }

    // Here you would save the connection to your database
    // await storage.saveGamingConnection(userId, platform, username, accountData);

    res.json({
      success: true,
      platform,
      username,
      accountData,
      message: `Successfully connected ${platform} account`
    });
  } catch (error) {
    console.error('Gaming account connection error:', error);
    res.status(500).json({ 
      error: 'Failed to connect gaming account',
      details: error.message 
    });
  }
});

// Get live gaming sessions
router.get('/live-sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's connected gaming accounts from database
    // const connections = await storage.getUserGamingConnections(userId);
    
    // For now, return mock data until real connections are established
    const liveSessions = [
      {
        platform: 'xbox',
        username: 'ProGamer123',
        currentGame: 'Call of Duty',
        status: 'In Match',
        kd: 1.8,
        matchTime: 12
      },
      {
        platform: 'steam',
        username: 'ElitePlayer',
        currentGame: 'Dota 2',
        status: 'Ranked Match',
        mmr: 3450,
        matchTime: 25
      }
    ];

    res.json(liveSessions);
  } catch (error) {
    console.error('Live sessions error:', error);
    res.status(500).json({ error: 'Failed to get live sessions' });
  }
});

// Get live streams for betting
router.get('/live-streams', async (req, res) => {
  try {
    const { game } = req.query;
    
    const twitchStreams = await gamingAPIService.getTwitchStreams(game as string);
    const youtubeStreams = await gamingAPIService.getYouTubeLiveStreams();

    const combinedStreams = [
      ...twitchStreams.data?.map((stream: any) => ({
        id: stream.id,
        streamer: stream.user_name,
        game: stream.game_name,
        viewers: stream.viewer_count,
        platform: 'twitch',
        thumbnail: stream.thumbnail_url,
        isLive: true,
        odds: {
          win: (Math.random() * 2 + 1).toFixed(2),
          lose: (Math.random() * 2 + 1).toFixed(2)
        }
      })) || [],
      ...youtubeStreams.items?.map((stream: any) => ({
        id: stream.id.videoId,
        streamer: stream.snippet.channelTitle,
        game: stream.snippet.title,
        viewers: Math.floor(Math.random() * 10000),
        platform: 'youtube',
        thumbnail: stream.snippet.thumbnails.default.url,
        isLive: true,
        odds: {
          win: (Math.random() * 2 + 1).toFixed(2),
          lose: (Math.random() * 2 + 1).toFixed(2)
        }
      })) || []
    ];

    res.json(combinedStreams);
  } catch (error) {
    console.error('Live streams error:', error);
    // Return sample data if APIs aren't configured
    res.json([
      {
        id: 'sample_1',
        streamer: 'ProGamer_Elite',
        game: 'League of Legends',
        viewers: 12847,
        platform: 'twitch',
        isLive: true,
        odds: { win: 1.85, lose: 1.95 }
      },
      {
        id: 'sample_2',
        streamer: 'EsportsKing',
        game: 'CS:GO',
        viewers: 8392,
        platform: 'youtube',
        isLive: true,
        odds: { win: 2.10, lose: 1.75 }
      }
    ]);
  }
});

// Place gaming bet
router.post('/bet', async (req, res) => {
  try {
    const { userId, betType, amount, platform, targetUser, gameData } = req.body;

    // Validate bet data
    if (!userId || !betType || !amount) {
      return res.status(400).json({ error: 'Missing required bet data' });
    }

    // Here you would save the bet to your database
    const bet = {
      id: Date.now().toString(),
      userId,
      betType,
      amount,
      platform,
      targetUser,
      gameData,
      status: 'pending',
      createdAt: new Date()
    };

    // await storage.createGamingBet(bet);

    res.json({
      success: true,
      bet,
      message: 'Gaming bet placed successfully'
    });
  } catch (error) {
    console.error('Gaming bet error:', error);
    res.status(500).json({ error: 'Failed to place gaming bet' });
  }
});

// Get gaming leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    // This would normally come from your database
    const leaderboard = [
      { rank: 1, name: "ProGamer123", winRate: "68%", profit: "+$12,450", specialty: "League of Legends" },
      { rank: 2, name: "EsportsKing", winRate: "65%", profit: "+$11,820", specialty: "CS:GO" },
      { rank: 3, name: "StreamSniper", winRate: "62%", profit: "+$9,740", specialty: "Twitch Betting" },
      { rank: 4, name: "ConsoleGod", winRate: "59%", profit: "+$8,320", specialty: "Xbox Live" },
      { rank: 5, name: "TourneyMaster", winRate: "57%", profit: "+$7,450", specialty: "Tournaments" }
    ];

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Check API configuration status
router.get('/api-status', async (req, res) => {
  try {
    const apiStatus = gamingAPIService.getConfiguredAPIs();
    res.json({
      configured: apiStatus,
      message: 'Gaming API configuration status'
    });
  } catch (error) {
    console.error('API status error:', error);
    res.status(500).json({ error: 'Failed to check API status' });
  }
});

export default router;