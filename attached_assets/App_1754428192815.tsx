
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Channel } from './types';
import { parseM3U } from './services/m3uParser';
import ChannelList from './components/ChannelList';
import VideoPlayer from './components/VideoPlayer';
import Spinner from './components/Spinner';
import Header from './components/Header';

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

function App() {
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
      const proxyUrl = 'https://corsproxy.io/?';
      
      const responses = await Promise.allSettled(
        M3U_URLS.map(url => fetch(proxyUrl + url).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch ${url}`);
          return res.text();
        }))
      );

      const allParsedChannels: Channel[] = [];
      responses.forEach(result => {
        if (result.status === 'fulfilled') {
          allParsedChannels.push(...parseM3U(result.value));
        } else {
          console.warn('A playlist failed to load:', result.reason);
        }
      });
      
      const sportChannels = allParsedChannels.filter(channel => {
        const nameLower = channel.name.toLowerCase();
        const groupLower = channel.group?.toLowerCase() || '';
        return SPORTS_KEYWORDS.some(keyword => nameLower.includes(keyword) || groupLower.includes(keyword));
      });
      
      // Deduplicate channels based on URL
      const uniqueChannels = Array.from(new Map(sportChannels.map(ch => [ch.url, ch])).values());

      if (uniqueChannels.length === 0) {
        throw new Error('No sports channels found. Check playlists or network.');
      }
      
      setAllChannels(uniqueChannels);
      setCurrentChannel(uniqueChannels[0]);
      setIsPlaying(false);

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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
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

export default App;
