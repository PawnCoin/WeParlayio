import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Search } from 'lucide-react';

// Lazy load ReactPlayer to improve initial load time.
const ReactPlayer = React.lazy(() => import('react-player/lazy'));

interface Channel {
  name: string;
  url: string;
  group?: string;
  logo?: string;
  tvgId?: string;
}

// List of M3U playlists to fetch and combine
const M3U_URLS = [
  'https://iptv-org.github.io/iptv/index.m3u',
  'https://www.apsattv.com/xumo.m3u',
  'https://www.apsattv.com/ssungusa.m3u',
  'https://www.apsattv.com/localnow.m3u',
  'https://www.apsattv.com/lg.m3u',
  'https://www.apsattv.com/rok.m3u',
  'https://www.apsattv.com/redbox.m3u',
  'https://www.apsattv.com/distro.m3u',
  'https://www.apsattv.com/xiaomi.m3u',
];

const SPORTS_KEYWORDS = [
  // General
  'sport', 'sports', 'stadium', 'fans', 'espn',
  // Major US Networks
  'fs', 'fox sports', 'cbs sports', 'nbcsn', 'tnt', 'tbs',
  // Leagues
  'nfl', 'nba', 'mlb', 'nhl', 'mls', 'pga', 'lpga', 'wwe', 'ufc', 'nascar', 'f1', 'formula 1',
  // College
  'ncaaf', 'ncaam', 'sec network', 'big ten', 'acc network', 'pac-12',
  // Soccer
  'soccer', 'football', 'premier league', 'la liga', 'serie a', 'bundesliga', 'ligue 1', 'champions league',
  // International Networks
  'bein', 'dazn', 'sky sports', 'eurosport', 'tsn', 'sportsnet',
  // Specific Sports
  'racing', 'golf', 'tennis', 'cricket', 'rugby', 'boxing', 'mma', 'motorsport'
];

// M3U Parser function
const parseAttribute = (line: string, attributeName: string): string => {
  const match = line.match(new RegExp(`${attributeName}="(.*?)"`));
  return match ? match[1] : '';
};

const parseM3U = (m3uContent: string): Channel[] => {
  const lines = m3uContent.split('\n').filter(line => line.trim() !== '');
  const channels: Channel[] = [];

  if (!lines[0] || !lines[0].startsWith('#EXTM3U')) {
    console.warn('M3U file does not start with #EXTM3U');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF')) {
      const nextLine = lines[i + 1];
      if (nextLine && !nextLine.startsWith('#')) {
        const nameMatch = line.match(/,(.+)$/);
        const name = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';
        const logo = parseAttribute(line, 'tvg-logo');
        const tvgId = parseAttribute(line, 'tvg-id');
        const group = parseAttribute(line, 'group-title');
        const url = nextLine.trim();

        if (url) {
          channels.push({ name, logo, url, tvgId, group });
        }
        
        i++; // Skip the URL line in the next iteration
      }
    }
  }

  return channels;
};

// Spinner Component
const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <svg
        className="animate-spin h-8 w-8 text-blue-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p className="text-lg font-medium text-gray-300">Loading Channels...</p>
    </div>
  );
};

// Player Placeholder Component
const PlayerPlaceholder: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-black text-gray-400">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
    <h2 className="text-2xl font-semibold">Select a channel</h2>
    <p>Choose a channel from the list to start watching.</p>
  </div>
);

// Error Overlay Component
const ErrorOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black bg-opacity-80 p-4 text-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
    <h3 className="text-xl font-semibold text-red-400">Playback Error</h3>
    <p className="text-gray-300">{message}</p>
  </div>
);

// Video Player Component
const VideoPlayer: React.FC<{
  url?: string;
  channelName?: string;
  playing: boolean;
}> = ({ url, channelName, playing }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset error state when channel changes
    setError(null);
  }, [url]);

  const handleError = (e: any) => {
    console.error(`Error playing ${channelName}:`, e);
    setError("This channel could not be loaded. It might be offline or unavailable. Please try another channel.");
  };

  if (!url) {
    return <PlayerPlaceholder />;
  }

  return (
    <div className="w-full aspect-video bg-black relative flex items-center justify-center">
      {error && <ErrorOverlay message={error} />}
      <ReactPlayer
        key={url} // Important: re-mounts the player on URL change
        url={url}
        playing={playing}
        controls={true}
        width="100%"
        height="100%"
        className="absolute top-0 left-0"
        config={{
          file: {
            hlsOptions: {
              // You can add HLS.js specific options here if needed
            },
            forceHLS: true,
          }
        }}
        onError={handleError}
      />
    </div>
  );
};

// Channel List Item Component
const ChannelListItem: React.FC<{
  channel: Channel;
  isActive: boolean;
  onSelect: () => void;
}> = ({ channel, isActive, onSelect }) => {
  const preferredLogo = channel.tvgId ? `https://iptv-org.github.io/epg/logos/${channel.tvgId}.png` : channel.logo;
  const fallbackLogo = channel.logo;

  const [currentLogo, setCurrentLogo] = useState(preferredLogo || fallbackLogo);
  const [showPlaceholder, setShowPlaceholder] = useState(!currentLogo);

  useEffect(() => {
    const newPreferredLogo = channel.tvgId ? `https://iptv-org.github.io/epg/logos/${channel.tvgId}.png` : channel.logo;
    const newFallbackLogo = channel.logo;
    
    setCurrentLogo(newPreferredLogo || newFallbackLogo);
    setShowPlaceholder(!newPreferredLogo && !newFallbackLogo);
  }, [channel.tvgId, channel.logo]);

  const handleLogoError = () => {
    // If the preferred logo failed, try the fallback, but only if it's different
    if (currentLogo === preferredLogo && fallbackLogo && fallbackLogo !== preferredLogo) {
      setCurrentLogo(fallbackLogo);
    } else {
      // If all logos fail, show placeholder
      setShowPlaceholder(true);
    }
  };

  return (
    <li
      onClick={onSelect}
      className={`flex items-center space-x-3 p-2.5 cursor-pointer transition-colors duration-200 ease-in-out border-b border-gray-700/50 ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'hover:bg-gray-700/50'
      }`}
      role="button"
      aria-pressed={isActive}
    >
      {showPlaceholder ? (
        <div className="w-10 h-10 bg-gray-700 rounded-md flex items-center justify-center text-gray-400 text-xs font-bold flex-shrink-0">
          {channel.name.substring(0, 3).toUpperCase()}
        </div>
      ) : (
        <img
          src={currentLogo}
          alt="" // Decorative image
          aria-hidden="true"
          className="w-10 h-10 object-contain bg-gray-600/20 rounded-md flex-shrink-0 p-0.5"
          onError={handleLogoError}
        />
      )}
      <span className="font-medium truncate flex-grow">{channel.name}</span>
      {isActive && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
    </li>
  );
};

// Channel Group Component
const ChannelGroup: React.FC<{
  groupName: string;
  channels: Channel[];
  currentChannelUrl: string | null;
  onSelectChannel: (channel: Channel) => void;
}> = ({ groupName, channels, currentChannelUrl, onSelectChannel }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700/70 transition-colors flex justify-between items-center"
        aria-expanded={isOpen}
      >
        <h3 className="font-semibold text-gray-200">{groupName}</h3>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <ul>
          {channels.map((channel) => (
            <ChannelListItem
              key={channel.url}
              channel={channel}
              isActive={channel.url === currentChannelUrl}
              onSelect={() => onSelectChannel(channel)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

// Channel List Component
const ChannelList: React.FC<{
  groupedChannels: Record<string, Channel[]>;
  currentChannelUrl: string | null;
  onSelectChannel: (channel: Channel) => void;
}> = ({ groupedChannels, currentChannelUrl, onSelectChannel }) => {
  const sortedGroupNames = Object.keys(groupedChannels).sort();
    
  return (
    <div className="h-full bg-gray-800">
      {sortedGroupNames.map((groupName) => (
        <ChannelGroup
          key={groupName}
          groupName={groupName}
          channels={groupedChannels[groupName]}
          currentChannelUrl={currentChannelUrl}
          onSelectChannel={onSelectChannel}
        />
      ))}
    </div>
  );
};

// Header Component
const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-md p-4 flex items-center space-x-3 flex-shrink-0 z-10">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5zm7 3a1 1 0 0 1 1 .883V16.117a1 1 0 0 1-1.993.117L11 16.117V8.883A1 1 0 0 1 12 8zM8 10a1 1 0 0 1 1 .883v4.234a1 1 0 0 1-1.993.117L7 15.117v-4.234A1 1 0 0 1 8 10zm8 0a1 1 0 0 1 1 .883v4.234a1 1 0 0 1-1.993.117L15 15.117v-4.234A1 1 0 0 1 16 10z" />
      </svg>
      <h1 className="text-2xl font-bold text-white tracking-tight">
        WeParlay Sports IPTV
      </h1>
    </header>
  );
};

// Main App Component with Original Working Logic
function IPTVPlayerApp() {
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const fetchAndProcessPlaylists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to fetch from backend API first, then fallback to direct fetch with multiple CORS proxies
      let allParsedChannels: Channel[] = [];
      
      try {
        // Try backend API first
        const backendResponse = await fetch('/api/iptv/channels');
        if (backendResponse.ok) {
          const backendChannels = await backendResponse.json();
          if (backendChannels.length > 0) {
            allParsedChannels = backendChannels;
          }
        }
      } catch (backendError) {
        console.warn('Backend IPTV API not available, trying direct fetch');
      }

      // If backend failed, try multiple CORS proxies
      if (allParsedChannels.length === 0) {
        const corsProxies = [
          'https://api.allorigins.win/raw?url=',
          'https://cors-anywhere.herokuapp.com/',
          'https://corsproxy.io/?',
          '' // Direct fetch as last resort
        ];

        for (const proxy of corsProxies) {
          try {
            const responses = await Promise.allSettled(
              M3U_URLS.slice(0, 3).map(url => // Limit to first 3 URLs for faster loading
                fetch(proxy + encodeURIComponent(url)).then(res => {
                  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
                  return res.text();
                })
              )
            );

            responses.forEach(result => {
              if (result.status === 'fulfilled') {
                try {
                  const parsed = parseM3U(result.value);
                  allParsedChannels.push(...parsed);
                } catch (parseError) {
                  console.warn('Failed to parse M3U:', parseError);
                }
              }
            });

            if (allParsedChannels.length > 0) break; // Success with this proxy
          } catch (proxyError) {
            console.warn(`Proxy ${proxy} failed:`, proxyError);
            continue; // Try next proxy
          }
        }
      }

      // If all external sources fail, use fallback demo channels
      if (allParsedChannels.length === 0) {
        console.warn('All external sources failed, using demo channels');
        allParsedChannels = [
          {
            name: "ESPN Demo",
            url: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
            group: "US Sports",
            logo: "https://logos-world.net/wp-content/uploads/2021/08/ESPN-Logo.png"
          },
          {
            name: "Fox Sports Demo", 
            url: "https://fox-foxsportsone-samsungus.amagi.tv/playlist.m3u8",
            group: "US Sports",
            logo: "https://logos-world.net/wp-content/uploads/2020/06/Fox-Sports-Logo.png"
          },
          {
            name: "CBS Sports HQ",
            url: "https://cbssports-linear.cbsaavideo.com/out/v1/cc15e3c4f8434251b6dffe8138b86ae0/master.m3u8",
            group: "US Sports", 
            logo: "https://logos-world.net/wp-content/uploads/2020/06/CBS-Sports-Logo.png"
          },
          {
            name: "Red Bull TV",
            url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
            group: "Extreme Sports",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Red_Bull_TV_logo.svg/1200px-Red_Bull_TV_logo.svg.png"
          },
          {
            name: "Olympic Channel",
            url: "https://ott-live.olympicchannel.com/out/u/OC1_3.m3u8",
            group: "Olympics",
            logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/Olympic_Channel_logo.svg/1200px-Olympic_Channel_logo.svg.png"
          }
        ];
      }
      
      const sportChannels = allParsedChannels.filter(channel => {
        const nameLower = channel.name.toLowerCase();
        const groupLower = channel.group?.toLowerCase() || '';
        return SPORTS_KEYWORDS.some(keyword => 
          nameLower.includes(keyword) || 
          groupLower.includes(keyword) ||
          nameLower.includes('tv') ||
          nameLower.includes('live')
        );
      });
      
      // Deduplicate channels based on URL
      const uniqueChannels = Array.from(new Map(sportChannels.map(ch => [ch.url, ch])).values());

      if (uniqueChannels.length === 0) {
        throw new Error('No sports channels could be loaded. Please check your internet connection.');
      }
      
      setAllChannels(uniqueChannels);
      setCurrentChannel(uniqueChannels[0]);
      setIsPlaying(false);

      console.log(`Successfully loaded ${uniqueChannels.length} sports channels`);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while loading channels.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndProcessPlaylists();
  }, [fetchAndProcessPlaylists]);

  const handleSelectChannel = (channel: Channel) => {
    setCurrentChannel(channel);
    setIsPlaying(true);
  };

  const filteredChannels = useMemo(() => 
    allChannels.filter(channel =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [allChannels, searchQuery]
  );
  
  const groupedChannels = useMemo(() => {
    return filteredChannels.reduce((acc, channel) => {
      const groupName = channel.group || 'General Sports';
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(channel);
      return acc;
    }, {} as Record<string, Channel[]>);
  }, [filteredChannels]);

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      <main className="flex-grow flex flex-row overflow-hidden">
        <aside className="w-80 lg:w-96 bg-gray-800 flex-shrink-0 flex flex-col">
          <div className="p-3 border-b border-gray-700">
            <div className="relative">
              <input
                type="text"
                placeholder="Search sports channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search channels"
              />
              <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto">
            {isLoading && <div className="p-4"><Spinner /></div>}
            {error && !isLoading && (
              <div className="p-4 text-red-400">
                <p className="font-bold">Error loading channels:</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={fetchAndProcessPlaylists}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  aria-label="Retry fetching playlist"
                >
                  Retry
                </button>
              </div>
            )}
            {!isLoading && !error && filteredChannels.length > 0 && (
              <ChannelList
                groupedChannels={groupedChannels}
                currentChannelUrl={currentChannel?.url ?? null}
                onSelectChannel={handleSelectChannel}
              />
            )}
            {!isLoading && !error && filteredChannels.length === 0 && (
              <div className="p-4 text-center text-gray-400">
                <p className="font-bold">No results found</p>
                <p>Try adjusting your search or check the playlists.</p>
              </div>
            )}
          </div>
        </aside>
        <section className="flex-grow bg-black flex items-center justify-center">
          <VideoPlayer 
            url={currentChannel?.url} 
            channelName={currentChannel?.name}
            playing={isPlaying}
          />
        </section>
      </main>
    </div>
  );
}

export default IPTVPlayerApp;