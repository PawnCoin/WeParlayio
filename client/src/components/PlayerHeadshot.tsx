import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from 'lucide-react';

interface PlayerHeadshotProps {
  playerId?: string;
  playerName?: string;
  teamId?: string;
  sport: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showPosition?: boolean;
  className?: string;
}

export default function PlayerHeadshot({ 
  playerId,
  playerName,
  teamId, 
  sport, 
  size = 'md', 
  showName = false,
  showPosition = false,
  className = '' 
}: PlayerHeadshotProps) {
  const [imageError, setImageError] = useState(false);

  const { data: roster = [] } = useQuery({
    queryKey: [`/api/espn/roster/${sport}/${teamId}`],
    enabled: !!teamId && !!sport
  });

  const player = roster.find((p: any) => 
    p.id === playerId || 
    p.name?.toLowerCase().includes(playerName?.toLowerCase() || '')
  );

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (!player || !player.headshot || imageError) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`${sizeClasses[size]} bg-gray-100 rounded-full flex items-center justify-center`}>
          <User className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-10 h-10'} text-gray-400`} />
        </div>
        {(showName || showPosition) && (
          <div className="flex flex-col">
            {showName && (
              <span className={`${textSizes[size]} font-semibold`}>
                {playerName || 'Player'}
              </span>
            )}
            {showPosition && player?.position && (
              <span className={`${size === 'sm' ? 'text-xs' : 'text-xs'} text-gray-500`}>
                {player.position}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={player.headshot}
        alt={`${player.name} headshot`}
        className={`${sizeClasses[size]} object-cover rounded-full bg-gray-100`}
        onError={() => setImageError(true)}
      />
      {(showName || showPosition) && (
        <div className="flex flex-col">
          {showName && (
            <span className={`${textSizes[size]} font-semibold`}>
              {player.name}
            </span>
          )}
          {showPosition && (
            <span className={`${size === 'sm' ? 'text-xs' : 'text-xs'} text-gray-500`}>
              {player.position} • #{player.jersey}
            </span>
          )}
        </div>
      )}
    </div>
  );
}