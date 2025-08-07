import express from 'express';
import { socialMediaService } from '../services/socialMediaService';
import { isAuthenticated } from '../replitAuth';

const router = express.Router();

// OAuth URLs for login/account creation
router.get('/auth/twitter/url', (req, res) => {
  try {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/social-media/auth/twitter/callback`;
    const authUrl = socialMediaService.getTwitterAuthUrl(redirectUri);
    
    res.json({
      success: true,
      authUrl,
      platform: 'twitter'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate Twitter auth URL',
      error: error.message 
    });
  }
});

router.get('/auth/facebook/url', (req, res) => {
  try {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/social-media/auth/facebook/callback`;
    const authUrl = socialMediaService.getFacebookAuthUrl(redirectUri);
    
    res.json({
      success: true,
      authUrl,
      platform: 'facebook'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate Facebook auth URL',
      error: error.message 
    });
  }
});

router.get('/auth/instagram/url', (req, res) => {
  try {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/social-media/auth/instagram/callback`;
    const authUrl = socialMediaService.getInstagramAuthUrl(redirectUri);
    
    res.json({
      success: true,
      authUrl,
      platform: 'instagram'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate Instagram auth URL',
      error: error.message 
    });
  }
});

// Single platform posting
router.post('/post/twitter', isAuthenticated, async (req, res) => {
  try {
    const { content, mediaUrls } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Content is required' 
      });
    }

    const post = await socialMediaService.postToTwitter(content, mediaUrls);
    
    res.json({
      success: true,
      post,
      message: 'Successfully posted to Twitter'
    });
  } catch (error) {
    console.error('Error posting to Twitter:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to post to Twitter',
      error: error.message 
    });
  }
});

router.post('/post/facebook', isAuthenticated, async (req, res) => {
  try {
    const { content, mediaUrls, pageId, accessToken } = req.body;
    
    if (!content || !pageId || !accessToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Content, pageId, and accessToken are required' 
      });
    }

    const post = await socialMediaService.postToFacebook(content, pageId, accessToken, mediaUrls);
    
    res.json({
      success: true,
      post,
      message: 'Successfully posted to Facebook'
    });
  } catch (error) {
    console.error('Error posting to Facebook:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to post to Facebook',
      error: error.message 
    });
  }
});

router.post('/post/instagram', isAuthenticated, async (req, res) => {
  try {
    const { content, mediaUrl, accessToken, instagramAccountId } = req.body;
    
    if (!content || !mediaUrl || !accessToken || !instagramAccountId) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required for Instagram posting' 
      });
    }

    const post = await socialMediaService.postToInstagram(content, mediaUrl, accessToken, instagramAccountId);
    
    res.json({
      success: true,
      post,
      message: 'Successfully posted to Instagram'
    });
  } catch (error) {
    console.error('Error posting to Instagram:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to post to Instagram',
      error: error.message 
    });
  }
});

// Multi-platform posting
router.post('/post/multiple', isAuthenticated, async (req, res) => {
  try {
    const { content, platforms, options } = req.body;
    
    if (!content || !platforms || !Array.isArray(platforms)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Content and platforms array are required' 
      });
    }

    const posts = await socialMediaService.postToMultiplePlatforms(content, platforms, options);
    
    res.json({
      success: true,
      posts,
      successful: posts.length,
      total: platforms.length,
      message: `Posted to ${posts.length}/${platforms.length} platforms successfully`
    });
  } catch (error) {
    console.error('Error posting to multiple platforms:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to post to multiple platforms',
      error: error.message 
    });
  }
});

// Marketing automation endpoints
router.post('/marketing/betting-promotion', isAuthenticated, async (req, res) => {
  try {
    const { eventName, odds, platforms = ['twitter', 'facebook'] } = req.body;
    
    if (!eventName || !odds) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event name and odds are required' 
      });
    }

    const content = socialMediaService.generateBettingPromotionPost(eventName, odds);
    const posts = await socialMediaService.postToMultiplePlatforms(content, platforms, req.body.options);
    
    res.json({
      success: true,
      posts,
      content,
      message: 'Betting promotion posted successfully'
    });
  } catch (error) {
    console.error('Error posting betting promotion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to post betting promotion',
      error: error.message 
    });
  }
});

router.post('/marketing/vip-promotion', isAuthenticated, async (req, res) => {
  try {
    const { platforms = ['twitter', 'facebook', 'instagram'] } = req.body;
    
    const content = socialMediaService.generateVIPPromotionPost();
    const posts = await socialMediaService.postToMultiplePlatforms(content, platforms, req.body.options);
    
    res.json({
      success: true,
      posts,
      content,
      message: 'VIP promotion posted successfully'
    });
  } catch (error) {
    console.error('Error posting VIP promotion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to post VIP promotion',
      error: error.message 
    });
  }
});

router.post('/marketing/fantasy-promotion', isAuthenticated, async (req, res) => {
  try {
    const { platform: fantasyPlatform = 'ESPN', platforms = ['twitter', 'facebook'] } = req.body;
    
    const content = socialMediaService.generateFantasyPromotionPost(fantasyPlatform);
    const posts = await socialMediaService.postToMultiplePlatforms(content, platforms, req.body.options);
    
    res.json({
      success: true,
      posts,
      content,
      message: 'Fantasy promotion posted successfully'
    });
  } catch (error) {
    console.error('Error posting fantasy promotion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to post fantasy promotion',
      error: error.message 
    });
  }
});

// Scheduled posting
router.post('/schedule', isAuthenticated, async (req, res) => {
  try {
    const { content, platforms, scheduledFor, options } = req.body;
    
    if (!content || !platforms || !scheduledFor) {
      return res.status(400).json({ 
        success: false, 
        message: 'Content, platforms, and scheduledFor are required' 
      });
    }

    const scheduledPost = await socialMediaService.schedulePost(
      content, 
      platforms, 
      new Date(scheduledFor), 
      options
    );
    
    res.json({
      success: true,
      scheduledPost,
      message: 'Post scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to schedule post',
      error: error.message 
    });
  }
});

// Analytics
router.get('/analytics/:postId', isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;
    const { platform } = req.query;
    
    if (!platform) {
      return res.status(400).json({ 
        success: false, 
        message: 'Platform parameter is required' 
      });
    }

    const analytics = await socialMediaService.getPostAnalytics(postId, platform as string);
    
    res.json({
      success: true,
      analytics,
      message: 'Analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching post analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch post analytics',
      error: error.message 
    });
  }
});

export default router;