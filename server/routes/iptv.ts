// ✅ IPTV VIP-Only API Routes + Secure Stream Fetch Logic
// 🔐 Backend logic for WeParlay.io to protect IPTV credentials

import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// VIP tier check middleware
const requireVIPAccess = async (req: any, res: any, next: any) => {
  try {
    const user = req.user?.claims;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has VIP access (admin bypass)
    const isAdmin = user.email === 'support@weparlay.io' || user.sub === 'support@weparlay.io';
    
    // For admin users, we also need to check the stored user data
    let hasVIPAccess = isAdmin;
    
    if (!isAdmin) {
      // Check user tier from the claims or fetch from storage
      const userTier = user.tier || user.subscriptionTier;
      hasVIPAccess = userTier === 'vip' || 
        userTier === 'gold' || 
        userTier === 'platinum' || 
        userTier === 'diamond';
    }

    if (!hasVIPAccess) {
      return res.status(403).json({ 
        error: 'VIP access required',
        message: 'Upgrade to VIP to access live TV streaming'
      });
    }

    next();
  } catch (error) {
    console.error('VIP access check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Mock IPTV channels data (replace with your actual IPTV provider data)
const mockChannels = [
  {
    id: 'espn',
    name: 'ESPN',
    category: 'Sports',
    logo: 'https://logos-world.net/wp-content/uploads/2021/08/ESPN-Logo.png',
    streamUrl: '', // Will be populated by stream endpoint
    quality: 'HD',
    isLive: true
  },
  {
    id: 'fox-sports',
    name: 'FOX Sports',
    category: 'Sports',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Fox_Sports_logo.svg/512px-Fox_Sports_logo.svg.png',
    streamUrl: '',
    quality: 'HD',
    isLive: true
  },
  {
    id: 'cnn',
    name: 'CNN',
    category: 'News',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/512px-CNN.svg.png',
    streamUrl: '',
    quality: 'HD',
    isLive: true
  },
  {
    id: 'discovery',
    name: 'Discovery Channel',
    category: 'Documentary',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Discovery_Channel_-_Logo_2019.svg/512px-Discovery_Channel_-_Logo_2019.svg.png',
    streamUrl: '',
    quality: 'HD',
    isLive: true
  }
];

// Mock EPG data
const mockEPG = [
  {
    channelId: 'espn',
    programs: [
      {
        id: 'espn-1',
        title: 'NFL Sunday Night Football',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        category: 'Sports',
        live: true
      },
      {
        id: 'espn-2',
        title: 'SportsCenter',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        category: 'Sports',
        live: false
      }
    ]
  },
  {
    channelId: 'fox-sports',
    programs: [
      {
        id: 'fox-1',
        title: 'NBA Finals Game 7',
        startTime: new Date(Date.now() - 1800000).toISOString(),
        endTime: new Date(Date.now() + 5400000).toISOString(),
        category: 'Sports',
        live: true
      }
    ]
  }
];

// Get channels list (VIP only)
router.get('/channels', isAuthenticated, requireVIPAccess, (req, res) => {
  res.json(mockChannels);
});

// Get EPG data (VIP only)
router.get('/epg', isAuthenticated, requireVIPAccess, (req, res) => {
  res.json(mockEPG);
});

// Get secure stream URL (VIP only)
router.get('/stream', isAuthenticated, requireVIPAccess, (req, res) => {
  const { channelId } = req.query;

  if (!channelId) {
    return res.status(400).json({ error: 'Missing channel ID' });
  }

  // In production, this would fetch from your IPTV provider
  // Example: const streamUrl = `${process.env.IPTV_HOST}/live/${process.env.IPTV_USERNAME}/${process.env.IPTV_PASSWORD}/${channelId}.ts`;
  
  // For demo purposes, returning a demo stream URL
  const streamUrl = `https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8`;

  res.json({
    channelId,
    streamUrl,
    headers: {
      'User-Agent': 'WeParlay IPTV Player',
      'Referer': 'https://weparlay.io'
    },
    quality: 'HD',
    format: 'HLS',
    authenticated: true
  });
});

export default router;