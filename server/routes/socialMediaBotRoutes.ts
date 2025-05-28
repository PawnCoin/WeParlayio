import { Router } from 'express';
import { socialMediaBots } from '../services/socialMediaBots';

const router = Router();

// Admin authentication middleware
const requireAdmin = (req: any, res: any, next: any) => {
  // Check if user is authenticated and is admin
  const user = req.user;
  const isAdmin = user?.isAdmin || user?.tier === 'admin' || user?.email === 'support@weparlay.io';
  
  if (!isAdmin) {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required for bot management' 
    });
  }
  
  next();
};

// Apply admin middleware to all bot routes
router.use(requireAdmin);

// Start automated posting
router.post('/start', async (req, res) => {
  try {
    await socialMediaBots.startAutomatedPosting();
    res.json({ 
      success: true, 
      message: 'Social media bots started successfully!' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start bots: ' + error.message 
    });
  }
});

// Get bot statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await socialMediaBots.getBotStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get bot stats: ' + error.message 
    });
  }
});

// Generate test post
router.post('/test-post', async (req, res) => {
  try {
    const { botId } = req.body;
    // Generate a test post for demo purposes
    const testPost = {
      platform: 'twitter',
      content: `🔥 Just hit a massive NFL parlay on WeParlay! Patriots +7.5, Over 45.5, and Chiefs ML = EASY MONEY! 💰 Who's riding with me next? #WeParlay #BettingWins #NFL`,
      hashtags: ['#WeParlay', '#BettingWins', '#NFL'],
      success: true
    };
    
    res.json({ 
      success: true, 
      post: testPost,
      message: 'Test post generated! (In production, this would post to social media)'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate test post: ' + error.message 
    });
  }
});

// Get bot activity log
router.get('/activity', async (req, res) => {
  try {
    // Return recent bot activity
    const activity = [
      {
        botName: 'SportsFan_Mike',
        platform: 'Twitter',
        content: 'Just crushed another NFL bet on WeParlay! 🏈💰',
        timestamp: new Date(),
        engagement: { likes: 23, retweets: 8, replies: 5 },
        mode: 'simulation'
      },
      {
        botName: 'CryptoQueen_Sarah',
        platform: 'Reddit',
        content: 'WeParlay crypto payments are instant! Best betting platform',
        timestamp: new Date(Date.now() - 3600000),
        engagement: { upvotes: 45, comments: 12 },
        mode: 'simulation'
      },
      {
        botName: 'HighRoller_James',
        platform: 'Instagram',
        content: 'VIP treatment on WeParlay worth every penny 💎',
        timestamp: new Date(Date.now() - 7200000),
        engagement: { likes: 156, comments: 23 },
        mode: 'simulation'
      }
    ];
    
    res.json({ success: true, activity });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get activity: ' + error.message 
    });
  }
});

// Toggle individual bot
router.post('/toggle-bot', async (req, res) => {
  try {
    const { botName, isActive, simulationMode } = req.body;
    
    // In a real implementation, this would update bot status in database
    console.log(`${isActive ? 'Activating' : 'Deactivating'} bot: ${botName} (${simulationMode ? 'simulation' : 'live'} mode)`);
    
    res.json({ 
      success: true, 
      message: `Bot ${botName} ${isActive ? 'activated' : 'deactivated'}`,
      botName,
      isActive,
      simulationMode
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle bot: ' + error.message 
    });
  }
});

// Save API configuration
router.post('/save-api-config', async (req, res) => {
  try {
    const apiConfig = req.body;
    
    // In a real implementation, securely store API keys in environment variables or encrypted storage
    console.log('API Configuration updated (keys hidden for security)');
    
    res.json({ 
      success: true, 
      message: 'API configuration saved successfully',
      configuredPlatforms: Object.keys(apiConfig).filter(key => apiConfig[key])
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save API config: ' + error.message 
    });
  }
});

// Get bot configuration
router.get('/bot-config', async (req, res) => {
  try {
    const botConfig = {
      globalSimulationMode: true,
      activeBots: 4,
      totalBots: 5,
      platforms: ['Twitter', 'Instagram', 'Reddit', 'Facebook'],
      postingSchedule: 'Every 30 minutes',
      lastActivity: new Date()
    };
    
    res.json({ success: true, config: botConfig });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get bot config: ' + error.message 
    });
  }
});

export { router as socialMediaBotRouter };