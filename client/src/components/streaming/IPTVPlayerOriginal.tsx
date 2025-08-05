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
      <Suspense fallback={<div className="w-full h-full bg-black flex items-center justify-center text-white">Loading Player...</div>}>
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
      </Suspense>
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

// Channel List Component
const ChannelList: React.FC<{
  groupedChannels: Record<string, Channel[]>;
  currentChannelUrl: string | null;
  onSelectChannel: (channel: Channel) => void;
}> = ({ groupedChannels, currentChannelUrl, onSelectChannel }) => {
  return (
    <div className="overflow-y-auto h-full">
      {Object.entries(groupedChannels).map(([group, channels]) => (
        <div key={group} className="mb-4">
          <h3 className="text-lg font-semibold text-gray-300 px-4 py-2 bg-gray-800 sticky top-0 z-10">
            {group} ({channels.length})
          </h3>
          <ul className="divide-y divide-gray-700">
            {channels.map((channel, index) => (
              <ChannelListItem
                key={`${channel.url}-${index}`}
                channel={channel}
                isActive={channel.url === currentChannelUrl}
                onSelect={() => onSelectChannel(channel)}
              />
            ))}
          </ul>
        </div>
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

      // If backend didn't work or returned few channels, try your original M3U sources
      if (allParsedChannels.length < 10) {
        const corsProxies = [
          'https://corsproxy.io/?',
          'https://api.allorigins.win/raw?url=',
          '' // Direct fetch as last resort
        ];

        for (const proxyUrl of corsProxies) {
          try {
            const responses = await Promise.allSettled(
              M3U_URLS.slice(0, 5).map(url => // Limit to first 5 URLs for faster loading
                fetch(proxyUrl + encodeURIComponent(url)).then(res => {
                  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
                  return res.text();
                })
              )
            );

            const externalChannels: Channel[] = [];
            responses.forEach(result => {
              if (result.status === 'fulfilled') {
                try {
                  externalChannels.push(...parseM3U(result.value));
                } catch (parseError) {
                  console.warn('Failed to parse M3U:', parseError);
                }
              } else {
                console.warn('A playlist failed to load:', result.reason);
              }
            });

            if (externalChannels.length > 0) {
              // Combine backend channels with external channels
              const combinedChannels = [...allParsedChannels, ...externalChannels];
              allParsedChannels = Array.from(new Map(combinedChannels.map(ch => [ch.url, ch])).values());
              console.log(`Successfully fetched ${externalChannels.length} channels from external sources`);
              break; // Success with this proxy
            }
          } catch (proxyError) {
            console.warn(`Proxy ${proxyUrl} failed:`, proxyError);
            continue; // Try next proxy
          }
        }
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