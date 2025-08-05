import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Search } from 'lucide-react';

// Lazy load ReactPlayer to improve initial load time.
const ReactPlayer = React.lazy(() => import('react-player'));

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

// M3U Parser
const parseM3U = (content: string): Channel[] => {
  const lines = content.split('\n').map(line => line.trim());
  const channels: Channel[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('#EXTINF:')) {
      const url = lines[i + 1]?.trim();
      
      if (url && !url.startsWith('#') && url !== '') {
        const extinf = line;
        
        // Extract channel name (everything after the last comma)
        const nameMatch = extinf.split(',').pop()?.trim();
        const name = nameMatch || 'Unknown Channel';
        
        // Extract tvg-id
        const tvgIdMatch = extinf.match(/tvg-id="([^"]+)"/);
        const tvgId = tvgIdMatch ? tvgIdMatch[1] : undefined;
        
        // Extract tvg-logo
        const logoMatch = extinf.match(/tvg-logo="([^"]+)"/);
        const logo = logoMatch ? logoMatch[1] : undefined;
        
        // Extract group-title
        const groupMatch = extinf.match(/group-title="([^"]+)"/);
        const group = groupMatch ? groupMatch[1] : 'Other';
        
        channels.push({
          name,
          url,
          group,
          logo,
          tvgId
        });
      }
      
      i++; // Skip the URL line in the next iteration
    }
  }
  
  return channels;
};

// Spinner Component
const Spinner: React.FC = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
  </div>
);

// Header Component
const Header: React.FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
  channelCount: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
}> = ({ searchQuery, onSearchChange, channelCount, isPlaying, onTogglePlay }) => (
  <header className="bg-gray-900 text-white shadow-lg">
    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white">IPTV Player</h1>
          <span className="ml-3 px-2 py-1 bg-blue-600 text-white text-sm rounded-full">
            {channelCount} channels
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search channels..."
              className="pl-10 pr-4 py-2 w-full sm:w-64 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={onTogglePlay}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {isPlaying ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Play
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </header>
);

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
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    // Reset error state when channel changes
    setError(null);
    setIsPlayerReady(false);
  }, [url]);

  const handleError = (e: any) => {
    console.error(`Error playing ${channelName}:`, e);
    setError("This channel could not be loaded. It might be offline or unavailable. Please try another channel.");
  };

  const handleReady = () => {
    console.log(`Player ready for: ${channelName}`);
    setIsPlayerReady(true);
  };

  if (!url) {
    return <PlayerPlaceholder />;
  }

  return (
    <div className="w-full aspect-video bg-black relative group">
      {error && <ErrorOverlay message={error} />}
      
      {/* Channel Info Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-70 px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-white text-sm font-medium">{channelName}</p>
        <p className="text-gray-300 text-xs">{playing ? 'Live' : 'Paused'}</p>
      </div>

      <Suspense fallback={<div className="w-full h-full bg-black flex items-center justify-center text-white">Loading Player...</div>}>
        <ReactPlayer
          key={url} // Important: re-mounts the player on URL change
          url={url}
          playing={playing}
          controls={true}
          width="100%"
          height="100%"
          muted={false} // Enable sound by default
          style={{ position: 'absolute', top: 0, left: 0 }}
          config={{
            file: {
              forceHLS: true,
              hlsOptions: {
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90,
                liveSyncDurationCount: 3,
                liveMaxLatencyDurationCount: 10
              },
              attributes: {
                crossOrigin: 'anonymous',
                controlsList: 'nodownload',
                disablePictureInPicture: false
              }
            }
          }}
          onError={handleError}
          onReady={handleReady}
          onStart={() => console.log(`Started playing: ${channelName}`)}
          onPlay={() => console.log(`Playing: ${channelName}`)}
          onPause={() => console.log(`Paused: ${channelName}`)}
        />
      </Suspense>
      
      {/* Loading indicator when player is not ready */}
      {!isPlayerReady && !error && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-5">
          <div className="text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
            <p className="text-sm">Loading {channelName}...</p>
          </div>
        </div>
      )}
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
          alt=""
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

// Main App Component
function IPTVPlayerOriginal() {
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
      let allParsedChannels: Channel[] = [];
      
      // Try backend API first for reliable channels
      try {
        const backendResponse = await fetch('/api/iptv/channels');
        if (backendResponse.ok) {
          const backendChannels = await backendResponse.json();
          if (backendChannels.length > 0) {
            allParsedChannels = backendChannels;
            console.log(`Loaded ${allParsedChannels.length} channels from backend API`);
          }
        }
      } catch (backendError) {
        console.warn('Backend IPTV API not available, trying external sources');
      }

      // Try to load more channels via backend proxy
      try {
        console.log('Attempting to load additional channels via backend proxy...');
        const proxyResponse = await fetch('/api/iptv/proxy-channels');
        if (proxyResponse.ok) {
          const proxyChannels = await proxyResponse.json();
          if (proxyChannels.length > 0) {
            const combinedChannels = [...allParsedChannels, ...proxyChannels];
            allParsedChannels = Array.from(new Map(combinedChannels.map(ch => [ch.url, ch])).values());
            console.log(`Added ${proxyChannels.length} proxy channels, total: ${allParsedChannels.length}`);
          }
        }
      } catch (proxyError) {
        console.warn('Backend proxy not available:', proxyError);
      }

      // If we still have limited channels, add some working demo channels
      if (allParsedChannels.length < 50) {
        console.log('Adding additional working sports channels...');
        const additionalChannels: Channel[] = [
          {
            name: "NFL Network",
            url: "https://nflhlslive-i.akamaihd.net/hls/live/2003619/nflhlslive/layer_2000.m3u8",
            group: "NFL",
            logo: "https://logos-world.net/wp-content/uploads/2020/06/NFL-Logo.png"
          },
          {
            name: "ESPN",
            url: "https://edge.espn.go.com/video/clips/mp4/17499102.mp4",
            group: "ESPN",
            logo: "https://logos-world.net/wp-content/uploads/2020/06/ESPN-Logo.png"
          },
          {
            name: "Fox Sports Live",
            url: "https://fox-foxsportsone-samsungus.amagi.tv/playlist.m3u8",
            group: "Fox Sports",
            logo: "https://logos-world.net/wp-content/uploads/2020/06/Fox-Sports-Logo.png"
          },
          {
            name: "beIN Sports Xtra",
            url: "https://siloh.pluto.tv/lilo/production/bein/master.m3u8",
            group: "beIN Sports",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/BeIN_Sports_logo.svg/1200px-BeIN_Sports_logo.svg.png"
          },
          {
            name: "Sky Sports Mix",
            url: "https://linear417-gb-hls1-prd-ak.cdn.skycdp.com/Content/HLS_001_sd/Live/channel(skysportsmix)/index.m3u8",
            group: "Sky Sports",
            logo: "https://logos-world.net/wp-content/uploads/2020/06/Sky-Sports-Logo.png"
          }
        ];
        
        allParsedChannels = [...allParsedChannels, ...additionalChannels];
        console.log(`Added ${additionalChannels.length} additional channels`);
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

  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return allChannels;
    
    const query = searchQuery.toLowerCase();
    return allChannels.filter(channel => 
      channel.name.toLowerCase().includes(query) ||
      channel.group?.toLowerCase().includes(query)
    );
  }, [allChannels, searchQuery]);

  const groupedChannels = useMemo(() => {
    return filteredChannels.reduce((acc, channel) => {
      const group = channel.group || 'Other';
      if (!acc[group]) acc[group] = [];
      acc[group].push(channel);
      return acc;
    }, {} as Record<string, Channel[]>);
  }, [filteredChannels]);

  const handleSelectChannel = useCallback((channel: Channel) => {
    console.log(`Switching to channel: ${channel.name} - ${channel.url}`);
    setCurrentChannel(channel);
    setIsPlaying(true);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        channelCount={filteredChannels.length}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
      />
      <main className="flex-1 flex overflow-hidden">
        <aside className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="flex-1 overflow-hidden">
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

export default IPTVPlayerOriginal;