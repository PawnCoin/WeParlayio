// ✅ IPTV VIP-Only API Routes + Secure Stream Fetch Logic
// 🔐 Backend logic for WeParlay.io to protect IPTV credentials

import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import axios from 'axios';

const router = Router();

// VIP tier check middleware - Allow admin bypass
const requireVIPAccess = async (req: any, res: any, next: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user claims from session
    const claims = (req.user as any).claims;
    if (!claims) {
      return res.status(401).json({ error: 'No user claims found' });
    }

    // Admin bypass - support@weparlay.io gets automatic access
    if (claims.email === 'support@weparlay.io' || claims.sub === 'support@weparlay.io') {
      console.log('✅ Admin bypass granted for:', claims.email);
      return next();
    }

    // Get user from storage to check tier
    const { storage } = await import('../storage');
    const user = await storage.getUser(claims.sub);
    
    if (!user) {
      return res.status(403).json({ 
        error: 'User not found',
        message: 'Please complete registration first'
      });
    }

    // Check user tier for non-admin users
    const userTier = user.tier || user.subscriptionTier;
    const hasVIPAccess = userTier === 'vip' || 
      userTier === 'gold' || 
      userTier === 'platinum' || 
      userTier === 'diamond';

    if (!hasVIPAccess) {
      return res.status(403).json({ 
        error: 'VIP access required',
        message: 'Upgrade to VIP to access live TV streaming'
      });
    }

    console.log('✅ VIP access granted for user:', user.email);
    next();
  } catch (error) {
    console.error('VIP access check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Real IPTV Configuration
const IPTV_CONFIG = {
  host: 'https://thetv.to:443',
  username: '686140897',
  password: '80274761',
  playlistUrl: 'https://thetv.to:443/get.php?username=686140897&password=80274761&type=m3u_plus&output=m3u8'
};

// Parse M3U playlist to extract channels
async function parseM3UPlaylist(): Promise<any[]> {
  try {
    console.log('🔄 Fetching IPTV playlist from:', IPTV_CONFIG.playlistUrl);
    const response = await axios.get(IPTV_CONFIG.playlistUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'WeParlay IPTV Player'
      }
    });

    const content = response.data;
    const lines = content.split('\n');
    const channels = [];
    
    let currentChannel: any = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#EXTINF:')) {
        // Parse channel info
        const match = line.match(/#EXTINF:-1\s*(.*?)tvg-name="([^"]*)".*?tvg-logo="([^"]*)".*?group-title="([^"]*)".*?,(.+)/);
        if (match) {
          currentChannel = {
            id: match[2] || `channel_${channels.length}`,
            name: match[5] || match[2] || 'Unknown Channel',
            category: match[4] || 'General',
            logo: match[3] || 'https://via.placeholder.com/64x64?text=TV',
            quality: 'HD',
            isLive: true
          };
        }
      } else if (line.startsWith('http') && currentChannel) {
        // This is the stream URL
        currentChannel.streamUrl = line;
        channels.push(currentChannel);
        currentChannel = null;
      }
    }
    
    console.log(`✅ Parsed ${channels.length} IPTV channels`);
    return channels;
  } catch (error) {
    console.error('❌ Error fetching IPTV playlist:', error);
    return [];
  }
}

// Generate EPG data for channels
function generateEPGData(channels: any[]): any[] {
  const epgData = [];
  const now = new Date();
  
  for (const channel of channels.slice(0, 20)) { // Limit EPG to first 20 channels
    const programs = [];
    
    // Generate 3 programs for each channel
    for (let i = 0; i < 3; i++) {
      const startTime = new Date(now.getTime() + (i - 1) * 2 * 60 * 60 * 1000); // 2 hour slots
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
      
      programs.push({
        id: `${channel.id}_${i}`,
        title: i === 1 ? 'Live Sports' : i === 0 ? 'Previous Show' : 'Next Show',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        category: channel.category,
        live: i === 1
      });
    }
    
    epgData.push({
      channelId: channel.id,
      programs
    });
  }
  
  return epgData;
}

// Get channels list (VIP only)
router.get('/channels', isAuthenticated, requireVIPAccess, async (req, res) => {
  try {
    console.log('🔄 User requesting IPTV channels:', (req.user as any)?.claims?.email);
    const channels = await parseM3UPlaylist();
    
    if (channels.length === 0) {
      return res.status(503).json({ 
        error: 'IPTV service unavailable',
        message: 'Unable to fetch channel list from IPTV provider'
      });
    }
    
    res.json(channels);
  } catch (error) {
    console.error('❌ Error in /channels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get EPG data (VIP only)
router.get('/epg', isAuthenticated, requireVIPAccess, async (req, res) => {
  try {
    const channels = await parseM3UPlaylist();
    const epgData = generateEPGData(channels);
    res.json(epgData);
  } catch (error) {
    console.error('❌ Error in /epg:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get secure stream URL (VIP only)
router.get('/stream', isAuthenticated, requireVIPAccess, async (req, res) => {
  try {
    const { channelId } = req.query;

    if (!channelId) {
      return res.status(400).json({ error: 'Missing channel ID' });
    }

    // Find the channel in our playlist
    const channels = await parseM3UPlaylist();
    const channel = channels.find(c => c.id === channelId);
    
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json({
      channelId,
      streamUrl: channel.streamUrl,
      headers: {
        'User-Agent': 'WeParlay IPTV Player',
        'Referer': 'https://weparlay.io'
      },
      quality: channel.quality || 'HD',
      format: 'HLS',
      authenticated: true
    });
  } catch (error) {
    console.error('❌ Error in /stream:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;