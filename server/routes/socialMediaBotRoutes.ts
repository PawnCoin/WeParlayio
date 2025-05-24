import { Router } from 'express';
import { socialMediaBots } from '../services/socialMediaBots';

const router = Router();

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
        engagement: { likes: 23, retweets: 8, replies: 5 }
      },
      {
        botName: 'CryptoQueen_Sarah',
        platform: 'Reddit',
        content: 'WeParlay crypto payments are instant! Best betting platform',
        timestamp: new Date(Date.now() - 3600000),
        engagement: { upvotes: 45, comments: 12 }
      },
      {
        botName: 'HighRoller_James',
        platform: 'Instagram',
        content: 'VIP treatment on WeParlay worth every penny 💎',
        timestamp: new Date(Date.now() - 7200000),
        engagement: { likes: 156, comments: 23 }
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

export { router as socialMediaBotRouter };