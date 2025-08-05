import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import ReactPlayer from 'react-player/lazy';

// M3U Parser utility
const parseAttribute = (line: string, attributeName: string): string => {
  const match = line.match(new RegExp(`${attributeName}="(.*?)"`));
  return match ? match[1] : '';
};

const parseM3U = (m3uContent: string) => {
  const lines = m3uContent.split('\n').filter(line => line.trim() !== '');
  const channels: any[] = [];

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
const Spinner = () => {
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

// Header Component
const Header = () => {
  return (
    <header className="bg-gray-800 shadow-md p-4 flex items-center space-x-3 flex-shrink-0 z-10">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5zm7 3a1 1 0 0 1 1 .883V16.117a1 1 0 0 1-1.993.117L11 16.117V8.883A1 1 0 0 1 12 8zM8 10a1 1 0 0 1 1 .883v4.234a1 1 0 0 1-1.993.117L7 15.117v-4.234A1 1 0 0 1 8 10zm8 0a1 1 0 0 1 1 .883v4.234a1 1 0 0 1-1.993.117L15 15.117v-4.234A1 1 0 0 1 16 10z" />
      </svg>
      <h1 className="text-2xl font-bold text-white tracking-tight">
        WeParlay IPTV Player
      </h1>
    </header>
  );
};

// Error Overlay Component
const ErrorOverlay = ({ message }: { message: string }) => (
  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black bg-opacity-80 p-4 text-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
    <h3 className="text-xl font-semibold text-red-400">Playback Error</h3>
    <p className="text-gray-300">{message}</p>
  </div>
);

// Player Placeholder Component
const PlayerPlaceholder = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-black text-gray-400">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
    <h2 className="text-2xl font-semibold">Select a channel</h2>
    <p>Choose a channel from the list to start watching.</p>
  </div>
);

// Video Player Component
const VideoPlayer = ({ url, channelName, playing }: { url?: string; channelName: string; playing: boolean }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          key={url}
          url={url}
          playing={playing}
          controls={true}
          width="100%"
          height="100%"
          className="absolute top-0 left-0"
          config={{
            file: {
              hlsOptions: {},
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
const ChannelListItem = ({ channel, isActive, onSelect }: { channel: any; isActive: boolean; onSelect: () => void }) => {
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
    if (currentLogo === preferredLogo && fallbackLogo && fallbackLogo !== preferredLogo) {
      setCurrentLogo(fallbackLogo);
    } else {
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

// Channel Group Component
const ChannelGroup = ({ groupName, channels, currentChannelUrl, onSelectChannel }: {
  groupName: string;
  channels: any[];
  currentChannelUrl?: string;
  onSelectChannel: (channel: any) => void;
}) => {
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
const ChannelList = ({ groupedChannels, currentChannelUrl, onSelectChannel }: {
  groupedChannels: Record<string, any[]>;
  currentChannelUrl?: string;
  onSelectChannel: (channel: any) => void;
}) => {
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

// Main IPTV Player App Component
export default function IPTVPlayerApp() {
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
    'sport', 'sports', 'stadium', 'fans', 'espn', 'fs', 'fox sports', 
    'nfl', 'nba', 'mlb', 'nhl', 'soccer', 'football', 'basketball', 
    'baseball', 'hockey', 'tennis', 'golf', 'racing', 'mma', 'ufc',
    'boxing', 'olympics', 'fifa', 'premier league', 'champions league'
  ];

  const [channels, setChannels] = useState<any[]>([]);
  const [groupedChannels, setGroupedChannels] = useState<Record<string, any[]>>({});
  const [currentChannel, setCurrentChannel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchM3UContent = useCallback(async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Failed to fetch M3U from ${url}:`, error);
      throw error;
    }
  }, []);

  const loadChannels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allChannels: any[] = [];
      
      for (const url of M3U_URLS) {
        try {
          const content = await fetchM3UContent(url);
          const parsedChannels = parseM3U(content);
          allChannels.push(...parsedChannels);
        } catch (error) {
          console.error(`Failed to load channels from ${url}:`, error);
        }
      }

      if (allChannels.length === 0) {
        throw new Error('No channels could be loaded from any source');
      }

      // Filter for sports channels
      const sportsChannels = allChannels.filter(channel => 
        SPORTS_KEYWORDS.some(keyword => 
          channel.name.toLowerCase().includes(keyword) ||
          (channel.group && channel.group.toLowerCase().includes(keyword))
        )
      );

      // Use sports channels if available, otherwise use all channels
      const channelsToUse = sportsChannels.length > 0 ? sportsChannels : allChannels.slice(0, 50);

      setChannels(channelsToUse);

      // Group channels
      const grouped = channelsToUse.reduce((acc: Record<string, any[]>, channel: any) => {
        const group = channel.group || 'Other';
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(channel);
        return acc;
      }, {});

      setGroupedChannels(grouped);
      
      // Auto-select first sports channel
      if (channelsToUse.length > 0) {
        setCurrentChannel(channelsToUse[0]);
      }
      
    } catch (error) {
      console.error('Error loading channels:', error);
      setError('Failed to load channels. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchM3UContent]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const handleChannelSelect = useCallback((channel: any) => {
    setCurrentChannel(channel);
    setIsPlaying(true);
  }, []);

  const retryLoading = useCallback(() => {
    loadChannels();
  }, [loadChannels]);

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Error Loading Channels</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={retryLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Channel List Sidebar */}
        <div className="w-80 bg-gray-800 flex flex-col">
          <div className="p-4 bg-gray-700 border-b border-gray-600">
            <h2 className="text-lg font-semibold">Sports Channels ({channels.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChannelList
              groupedChannels={groupedChannels}
              currentChannelUrl={currentChannel?.url}
              onSelectChannel={handleChannelSelect}
            />
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 bg-black">
          <VideoPlayer
            url={currentChannel?.url}
            channelName={currentChannel?.name || ''}
            playing={isPlaying}
          />
          
          {/* Channel Info */}
          {currentChannel && (
            <div className="p-4 bg-gray-800">
              <h3 className="text-xl font-semibold">{currentChannel.name}</h3>
              {currentChannel.group && (
                <p className="text-gray-400">{currentChannel.group}</p>
              )}
              <div className="mt-2 flex items-center space-x-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <span className="text-gray-400">
                  {isPlaying ? 'Playing' : 'Paused'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}