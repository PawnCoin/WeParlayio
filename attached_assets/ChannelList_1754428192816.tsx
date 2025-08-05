
import React, { useState, useEffect } from 'react';
import type { Channel } from '../types';

interface ChannelListProps {
  groupedChannels: Record<string, Channel[]>;
  currentChannelUrl: string | null;
  onSelectChannel: (channel: Channel) => void;
}

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


const ChannelList: React.FC<ChannelListProps> = ({ groupedChannels, currentChannelUrl, onSelectChannel }) => {
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

export default ChannelList;
