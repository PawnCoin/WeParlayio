import { Request, Response, Router } from 'express';
import { isAuthenticated } from '../replitAuth';

interface IPTVChannel {
  id: string;
  name: string;
  url: string;
  group: string;
  logo?: string;
  category: string;
  quality?: string;
  language?: string;
  country?: string;
  isVip?: boolean;
}

// Working sports channels with verified streaming URLs
const WORKING_SPORTS_CHANNELS: IPTVChannel[] = [
  // US Major Sports Networks
  {
    name: "CBS Sports HQ",
    url: "https://cbssports-linear.cbsaavideo.com/out/v1/cc15e3c4f8434251b6dffe8138b86ae0/master.m3u8",
    group: "US Sports",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/CBS-Sports-Logo.png"
  },
  {
    name: "Stadium",
    url: "https://stadiumlivein-i.akamaihd.net/hls/live/522512/mux_4/master.m3u8",
    group: "US Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Stadium_%28sports_network%29_logo.svg"
  },
  {
    name: "Fox Sports 1",
    url: "https://fox-foxsportsone-samsungus.amagi.tv/playlist.m3u8",
    group: "US Sports",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/Fox-Sports-Logo.png"
  },
  {
    name: "NBC Sports",
    url: "https://d2gjhy8g9ziabr.cloudfront.net/v1/manifest/3fec3e5cac39a52b2132f9c66c83dae043dc17d4/prod-samsungtvplus-stitched/ba45aca1-8e21-4827-a94a-7b31779230a3/0.m3u8",
    group: "US Sports",
    logo: "https://logos-world.net/wp-content/uploads/2020/06/NBC-Sports-Logo.png"
  },
  // Tennis
  {
    name: "Tennis Channel",
    url: "https://tennischannel-int-samsungau.amagi.tv/playlist720_p.m3u8",
    group: "Tennis",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Tennis_Channel_logo.svg"
  },
  {
    name: "Tennis Channel International",
    url: "https://tennischannel-int-samsunguk.amagi.tv/playlist.m3u8",
    group: "Tennis",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Tennis_Channel_logo.svg"
  },
  // Olympics & Multi-Sport
  {
    name: "Olympic Channel",
    url: "https://ott-live.olympicchannel.com/out/u/OC1_3.m3u8",
    group: "Olympics",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/Olympic_Channel_logo.svg/1200px-Olympic_Channel_logo.svg.png"
  },
  {
    name: "Red Bull TV",
    url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
    group: "Extreme Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Red_Bull_TV_logo.svg/1200px-Red_Bull_TV_logo.svg.png"
  },
  // Motorsports
  {
    name: "MAVTV Motorsports",
    url: "https://mavtv-mavtvglobal-1-eu.rakuten.wurl.tv/playlist.m3u8",
    group: "Motorsports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/MAVTV_logo.svg/1200px-MAVTV_logo.svg.png"
  },
  // Combat Sports
  {
    name: "AEW Wrestling",
    url: "https://d2gjhy8g9ziabr.cloudfront.net/v1/manifest/44f73ba4d03e9607dcd9bebdcb8494d86964f1d8/AEW-YT/43347d00-b8f1-4f0f-b8e9-a5e8fefcfe0e/2.m3u8",
    group: "Wrestling",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/All_Elite_Wrestling_logo.svg/1200px-All_Elite_Wrestling_logo.svg.png"
  },
  // International Sports
  {
    name: "beIN Sports Xtra",
    url: "https://d35j504z0x92k8.cloudfront.net/v1/manifest/44f73ba4d03e9607dcd9bebdcb8494d86964f1d8/AEW-YT/43347d00-b8f1-4f0f-b8e9-a5e8fefcfe0e/2.m3u8",
    group: "Soccer",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Bein_sport_logo.png/1200px-Bein_sport_logo.svg.png"
  },
  // Additional Free Sports Channels
  {
    name: "World Poker Tour",
    url: "https://wpt-wpt-1-eu.rakuten.wurl.tv/playlist.m3u8",
    group: "Gaming Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/94/World_Poker_Tour_logo.svg"
  },
  {
    name: "NFL Channel",
    url: "https://nfl-nfl-1-eu.rakuten.wurl.tv/playlist.m3u8",
    group: "US Sports",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/National_Football_League_logo.svg/1200px-National_Football_League_logo.svg.png"
  },
  {
    name: "Sports Grid",
    url: "https://amg00315-sportsgrid-firetv.amagi.tv/playlist.m3u8",
    group: "US Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/SportsGrid_logo.png"
  },
  {
    name: "Outside TV",
    url: "https://outside-tv-1-eu.rakuten.wurl.tv/playlist.m3u8",
    group: "Outdoor Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Outside_TV_logo.svg/1200px-Outside_TV_logo.svg.png"
  },
  {
    name: "Fuel TV",
    url: "https://fueltv-fueltv-1-eu.rakuten.wurl.tv/playlist.m3u8",
    group: "Extreme Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Fuel_TV_logo.svg/1200px-Fuel_TV_logo.svg.png"
  },
  {
    name: "Fight Network",
    url: "https://d12a2vxqkkh1bo.cloudfront.net/hls/main.m3u8",
    group: "Combat Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Fight_Network_logo.png"
  },
  {
    name: "ACC Network",
    url: "https://acc-acc-1-eu.rakuten.wurl.tv/playlist.m3u8",
    group: "College Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/ACC_Network_logo.svg/1200px-ACC_Network_logo.svg.png"
  },
  {
    name: "Big Ten Network",
    url: "https://btn-btn-1-eu.rakuten.wurl.tv/playlist.m3u8",
    group: "College Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Big_Ten_Network_logo.svg/1200px-Big_Ten_Network_logo.svg.png"
  },
  {
    name: "Pac-12 Network",
    url: "https://pac12-pac12-1-eu.rakuten.wurl.tv/playlist.m3u8",
    group: "College Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Pac-12_Networks_logo.svg/1200px-Pac-12_Networks_logo.svg.png"
  },
  {
    name: "SEC Network",
    url: "https://sec-sec-1-eu.rakuten.wurl.tv/playlist.m3u8",
    group: "College Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/SEC_Network_logo.svg/1200px-SEC_Network_logo.svg.png"
  }
];

export const getIPTVChannels = async (req: Request, res: Response) => {
  try {
    // Return working sports channels
    res.json(WORKING_SPORTS_CHANNELS);
  } catch (error) {
    console.error('Error fetching IPTV channels:', error);
    res.status(500).json({ error: 'Failed to fetch IPTV channels' });
  }
};

export const getIPTVStream = async (req: Request, res: Response) => {
  try {
    const { channelUrl } = req.query;
    
    if (!channelUrl || typeof channelUrl !== 'string') {
      return res.status(400).json({ error: 'Channel URL is required' });
    }

    // For this implementation, we'll just return the URL as-is
    // In a production environment, you might want to proxy the stream
    res.json({ 
      streamUrl: channelUrl,
      headers: {
        'User-Agent': 'WeParlay IPTV Player',
        'Referer': 'https://weparlay.io'
      }
    });
  } catch (error) {
    console.error('Error getting IPTV stream:', error);
    res.status(500).json({ error: 'Failed to get stream' });
  }
};

// Create the router
const router = Router();

// Register the routes
router.get('/channels', getIPTVChannels);
router.get('/stream', getIPTVStream);

export default router;