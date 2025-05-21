import React, { useState, useEffect } from 'react';
import { getTeamLogoUrl } from '@/lib/sportsDataUtils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { sportLogos, getTeamLogo } from '@/lib/teamLogos';

interface TeamLogoProps {
  teamName: string;
  league?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
  className?: string;
  withShadow?: boolean;
  withBorder?: boolean;
}

/**
 * TeamLogo component that displays team logos consistently across the application
 * Handles error states and fallbacks automatically
 */
const TeamLogo: React.FC<TeamLogoProps> = ({
  teamName,
  league = 'NBA',
  size = 'md',
  fallbackText,
  className = '',
  withShadow = false,
  withBorder = false,
}) => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  
  // Calculate size in pixels based on size prop
  const sizeMap = {
    'xs': 'h-6 w-6',
    'sm': 'h-8 w-8',
    'md': 'h-10 w-10',
    'lg': 'h-12 w-12',
    'xl': 'h-16 w-16',
  };
  
  const sizeClass = sizeMap[size] || sizeMap.md;
  
  // Get initials from team name for fallback
  const getInitials = (name: string): string => {
    if (!name) return '';
    
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }
    
    // Get initials from first and last word if there are multiple words
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };
  
  // Default fallback is the team initials
  const initials = fallbackText || getInitials(teamName);
  
  // Get the sport type from the league
  const getSportType = (): string => {
    const sportMap: Record<string, string> = {
      'NBA': 'basketball',
      'NFL': 'football',
      'MLB': 'baseball',
      'NHL': 'hockey',
      'MLS': 'soccer',
      'NCAAF': 'football',
      'NCAAB': 'basketball',
      'BOXING': 'boxing',
      'UFC': 'mma',
      'NASCAR': 'nascar',
      'TENNIS': 'tennis',
      'ATP': 'tennis',
      'WTA': 'tennis',
    };
    
    return sportMap[league] || 'basketball';
  };
  
  // Get appropriate sport icon for fallback
  const getSportIcon = (): string => {
    const sportType = getSportType();
    return sportLogos[sportType] || sportLogos.basketball;
  };

  useEffect(() => {
    if (!teamName) {
      setHasError(true);
      return;
    }
    
    try {
      // Get the logo URL using our utility function
      const url = getTeamLogoUrl(teamName, league);
      setLogoUrl(url);
      setHasError(false);
    } catch (error) {
      console.error(`Error loading logo for ${teamName}:`, error);
      setHasError(true);
    }
  }, [teamName, league]);
  
  // Create combined className for styling
  const avatarClasses = [
    sizeClass,
    className,
    withShadow ? 'shadow-md' : '',
    withBorder ? 'border border-gray-200 dark:border-gray-700' : '',
  ].join(' ');
  
  // Determine background color based on league for the fallback
  const getLeagueColor = (): string => {
    const colorMap: Record<string, string> = {
      'NBA': 'bg-blue-100 dark:bg-blue-900/40',
      'NFL': 'bg-green-100 dark:bg-green-900/40',
      'MLB': 'bg-red-100 dark:bg-red-900/40',
      'NHL': 'bg-indigo-100 dark:bg-indigo-900/40',
      'BOXING': 'bg-yellow-100 dark:bg-yellow-900/40',
      'UFC': 'bg-red-100 dark:bg-red-900/40',
      'NASCAR': 'bg-orange-100 dark:bg-orange-900/40',
      'TENNIS': 'bg-green-100 dark:bg-green-900/40',
    };
    
    return colorMap[league] || 'bg-gray-100 dark:bg-gray-800';
  };
  
  return (
    <Avatar className={avatarClasses}>
      <AvatarImage 
        src={hasError ? getSportIcon() : logoUrl} 
        alt={`${teamName} logo`}
        onError={() => setHasError(true)}
      />
      <AvatarFallback className={getLeagueColor()}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default TeamLogo;