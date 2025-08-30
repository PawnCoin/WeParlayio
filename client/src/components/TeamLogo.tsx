import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface TeamLogoProps {
  teamAbbreviation?: string;
  sport: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

export default function TeamLogo({ 
  teamAbbreviation, 
  sport, 
  size = 'md', 
  showName = false,
  className = '' 
}: TeamLogoProps) {
  const [imageError, setImageError] = useState(false);

  const { data: teams = [] } = useQuery({
    queryKey: [`/api/espn/teams/${sport}`],
    enabled: !!sport
  });

  const team = (teams as any[]).find((t: any) => 
    t.abbreviation?.toLowerCase() === teamAbbreviation?.toLowerCase()
  );

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (!team || !team.logo || imageError) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 rounded-full flex items-center justify-center ${className}`}>
        <span className={`${textSizes[size]} font-bold text-gray-600`}>
          {teamAbbreviation?.slice(0, 2)?.toUpperCase() || '?'}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={team.logo}
        alt={`${team.name} logo`}
        className={`${sizeClasses[size]} object-contain`}
        onError={() => setImageError(true)}
        style={{
          backgroundColor: team.color ? `#${team.color}` : 'transparent'
        }}
      />
      {showName && (
        <span className={`${textSizes[size]} font-semibold`}>
          {team.name}
        </span>
      )}
    </div>
  );
}