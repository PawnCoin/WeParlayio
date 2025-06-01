import React from 'react';
import { cn } from '@/lib/utils';
import { ESPNAssetService } from '@/lib/espnAssetService';

interface TeamLogoProps {
  src?: string | null;
  teamName: string;
  teamAbbr?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackColor?: string;
  league?: string; // Add league prop for ESPN integration
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg'
};

export function TeamLogo({ 
  src, 
  teamName, 
  teamAbbr, 
  size = 'md', 
  className,
  fallbackColor = '#3b82f6',
  league = 'nba'
}: TeamLogoProps) {
  const [imageError, setImageError] = React.useState(false);
  
  // Determine the best logo source - prioritize ESPN, then provided src
  const logoSrc = React.useMemo(() => {
    if (src && !imageError) return src;
    return ESPNAssetService.getTeamLogo(teamName, league);
  }, [src, teamName, league, imageError]);
  
  if (imageError) {
    // Fallback to abbreviation or first letters
    const displayText = teamAbbr || teamName.split(' ').map(word => word[0]).join('').slice(0, 3);
    
    return (
      <div 
        className={cn(
          'flex items-center justify-center rounded-full font-bold text-white border',
          sizeClasses[size],
          className
        )}
        style={{ backgroundColor: fallbackColor }}
        title={teamName}
      >
        {displayText}
      </div>
    );
  }

  return (
    <img
      src={logoSrc}
      alt={`${teamName} logo`}
      className={cn(
        'rounded-full object-contain',
        sizeClasses[size],
        className
      )}
      onError={() => setImageError(true)}
      title={teamName}
    />
  );
}

// Component for displaying team matchup with logos
export function TeamMatchup({ 
  homeTeam, 
  awayTeam, 
  homeTeamLogo, 
  awayTeamLogo,
  homeTeamColor,
  awayTeamColor,
  size = 'md',
  league = 'nba'
}: {
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  homeTeamColor?: string;
  awayTeamColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  league?: string;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex items-center gap-2">
        <TeamLogo 
          src={awayTeamLogo} 
          teamName={awayTeam} 
          size={size}
          fallbackColor={awayTeamColor}
          league={league}
        />
        <span className="font-medium">{awayTeam}</span>
      </div>
      
      <div className="text-muted-foreground font-bold">@</div>
      
      <div className="flex items-center gap-2">
        <TeamLogo 
          src={homeTeamLogo} 
          teamName={homeTeam} 
          size={size}
          fallbackColor={homeTeamColor}
          league={league}
        />
        <span className="font-medium">{homeTeam}</span>
      </div>
    </div>
  );
}