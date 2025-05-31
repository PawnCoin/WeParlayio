import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { sportLogos, getTeamLogo } from '@/lib/teamLogos';
import { Check, AlertTriangle } from 'lucide-react';

interface TeamLogoProps {
  teamName: string;
  league?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
  fallbackText?: string;
  className?: string;
  verifiedOnly?: boolean;
}

/**
 * TeamLogo Component
 * 
 * A standardized component for displaying team logos across the entire application.
 * Handles fallbacks gracefully and provides consistent styling.
 * 
 * @param {string} teamName - The name of the team
 * @param {string} league - The league/sport code (NBA, NFL, MLB, NHL, etc.)
 * @param {string} size - Size of the avatar (xs, sm, md, lg, xl)
 * @param {boolean} showFallback - Whether to show a fallback when image fails to load
 * @param {string} fallbackText - Custom text to show in fallback (defaults to team initials)
 * @param {string} className - Additional CSS classes
 * @param {boolean} verifiedOnly - Only show logos that are verified (not fallbacks)
 */
const TeamLogo: React.FC<TeamLogoProps> = ({
  teamName,
  league = 'NBA',
  size = 'md',
  showFallback = true,
  fallbackText,
  className = '',
  verifiedOnly = false
}) => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  
  // Determine size class for avatar
  const sizeClass = {
    'xs': 'h-6 w-6',
    'sm': 'h-8 w-8',
    'md': 'h-10 w-10',
    'lg': 'h-12 w-12',
    'xl': 'h-16 w-16'
  }[size];
  
  // Get the initials of the team name for fallback
  const getInitials = (): string => {
    if (fallbackText) return fallbackText;
    
    if (!teamName) return '?';
    
    // For names like "Los Angeles Lakers", get "LAL"
    if (teamName.includes(' ')) {
      const words = teamName.split(' ');
      
      // Handle special case for teams with "of" in the name
      if (words.length > 2 && words[1].toLowerCase() === 'of') {
        return (words[0][0] + words[2][0]).toUpperCase();
      }
      
      // For most team names, take first letter of each word (up to 3)
      return words.slice(0, 3).map(word => word[0]).join('').toUpperCase();
    }
    
    // For single word names, take first 2-3 letters
    return teamName.substring(0, Math.min(3, teamName.length)).toUpperCase();
  };
  
  // Get the sport type for fallback
  const getSportType = (): string => {
    const sportMap: Record<string, string> = {
      'NBA': 'basketball',
      'WNBA': 'basketball',
      'NCAAB': 'basketball',
      'NCAAW': 'basketball',
      'NFL': 'football',
      'NCAAF': 'football',
      'UFL': 'football',
      'CFL': 'football',
      'MLB': 'baseball',
      'MiLB': 'baseball',
      'NHL': 'hockey',
      'AHL': 'hockey',
      'MLS': 'soccer',
      'EPL': 'soccer',
      'LALIGA': 'soccer',
      'BUNDESLIGA': 'soccer',
      'LIGUE1': 'soccer',
      'SERIEA': 'soccer',
      'UFC': 'mma',
      'BOXING': 'boxing',
      'ATP': 'tennis',
      'WTA': 'tennis',
      'TENNIS': 'tennis',
      'NASCAR': 'motorsports',
      'F1': 'motorsports',
      'INDYCAR': 'motorsports'
    };
    
    return sportMap[league] || 'general';
  };
  
  // Get fallback sport logo
  const getFallbackLogo = (): string => {
    const sportType = getSportType();
    return sportLogos[sportType] || sportLogos.general;
  };
  
  useEffect(() => {
    if (!teamName) {
      setHasError(true);
      return;
    }
    
    try {
      // Get the logo URL using our utility function
      const url = getTeamLogo(teamName, league);
      setLogoUrl(url);
      setHasError(false);
      
      // Check if this is a verified logo or a fallback
      const isDefaultLogo = Object.values(sportLogos).includes(url);
      setIsVerified(!isDefaultLogo);
    } catch (error) {
      console.error(`Error loading logo for ${teamName}:`, error);
      setHasError(true);
      setIsVerified(false);
    }
  }, [teamName, league]);
  
  // Create combined className for styling
  const avatarClasses = [
    sizeClass,
    className,
    hasError || (verifiedOnly && !isVerified) ? 'border border-gray-200 dark:border-gray-800' : '',
  ].filter(Boolean).join(' ');
  
  // If we only want verified logos and this isn't one, show nothing
  if (verifiedOnly && !isVerified) {
    return null;
  }
  
  return (
    <div className="relative inline-block">
      <Avatar className={avatarClasses}>
        {(!hasError && logoUrl) && (
          <AvatarImage 
            src={logoUrl} 
            alt={`${teamName} logo`}
            onError={() => setHasError(true)}
          />
        )}
        {(hasError || !logoUrl) && showFallback && (
          <AvatarFallback 
            className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            delayMs={0}
          >
            {getInitials()}
          </AvatarFallback>
        )}
      </Avatar>
      
      {isVerified && (
        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full h-3 w-3 flex items-center justify-center border border-white dark:border-gray-900">
          <Check className="h-2 w-2 text-white" />
        </div>
      )}
      
      {!isVerified && !hasError && logoUrl && (
        <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full h-3 w-3 flex items-center justify-center border border-white dark:border-gray-900">
          <AlertTriangle className="h-2 w-2 text-white" />
        </div>
      )}
    </div>
  );
};

export default TeamLogo;