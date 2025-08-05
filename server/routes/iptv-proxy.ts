import express from 'express';
import axios from 'axios';

const router = express.Router();

// CORS-free proxy endpoint for M3U sources
router.get('/proxy-channels', async (req, res) => {
  try {
    console.log('🔄 Fetching channels via backend proxy...');
    
    // Reliable M3U sources that work with server-side fetching
    const sources = [
      'https://iptv-org.github.io/iptv/categories/sports.m3u',
      'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlists/playlist_sports.m3u8'
    ];

    const allChannels: any[] = [];

    for (const source of sources) {
      try {
        const response = await axios.get(source, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; IPTVProxy/1.0)',
            'Accept': '*/*'
          }
        });

        if (response.data && typeof response.data === 'string') {
          const channels = parseM3UContent(response.data);
          allChannels.push(...channels);
          console.log(`✅ Parsed ${channels.length} channels from ${source}`);
        }
      } catch (sourceError) {
        console.warn(`⚠️ Failed to fetch ${source}:`, sourceError.message);
        continue;
      }
    }

    // Remove duplicates and filter sports channels
    const uniqueChannels = Array.from(
      new Map(allChannels.map(ch => [ch.url, ch])).values()
    ).filter(ch => 
      ch.group && (
        ch.group.toLowerCase().includes('sport') ||
        ch.name.toLowerCase().includes('sport') ||
        ch.name.toLowerCase().includes('espn') ||
        ch.name.toLowerCase().includes('fox') ||
        ch.name.toLowerCase().includes('nfl') ||
        ch.name.toLowerCase().includes('nba') ||
        ch.name.toLowerCase().includes('mlb')
      )
    );

    console.log(`🎯 Returning ${uniqueChannels.length} proxy channels`);
    res.json(uniqueChannels);

  } catch (error) {
    console.error('❌ Proxy channels error:', error);
    res.json([]); // Return empty array instead of error to prevent frontend issues
  }
});

// Simple M3U parser for backend use
function parseM3UContent(content: string): any[] {
  const channels: any[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#EXTINF:')) {
      const nextLine = lines[i + 1]?.trim();
      if (nextLine && (nextLine.startsWith('http') || nextLine.startsWith('https'))) {
        // Parse channel info from EXTINF line
        const nameMatch = line.match(/,(.+)$/);
        const groupMatch = line.match(/group-title="([^"]+)"/);
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        
        if (nameMatch) {
          channels.push({
            name: nameMatch[1].trim(),
            url: nextLine,
            group: groupMatch ? groupMatch[1] : 'Sports',
            logo: logoMatch ? logoMatch[1] : null
          });
        }
      }
    }
  }
  
  return channels;
}

export default router;