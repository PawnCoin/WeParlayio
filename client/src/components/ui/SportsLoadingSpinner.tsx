import React from 'react';
import { cn } from '@/lib/utils';

interface SportsLoadingSpinnerProps {
  type?: 'football' | 'basketball' | 'baseball' | 'hockey' | 'soccer' | 'esports' | 'tennis' | 'golf' | 'generic';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  message?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

export function SportsLoadingSpinner({ 
  type = 'generic', 
  size = 'md', 
  className,
  message 
}: SportsLoadingSpinnerProps) {
  
  const getSportIcon = () => {
    switch (type) {
      case 'football':
        return (
          <div className={cn("relative", sizeClasses[size])}>
            <div className="absolute inset-0 rounded-full border-4 border-orange-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-orange-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 bg-orange-600 rounded-full flex items-center justify-center">
              <div className="w-1 h-4 bg-white rounded"></div>
            </div>
          </div>
        );
      
      case 'basketball':
        return (
          <div className={cn("relative", sizeClasses[size])}>
            <div className="absolute inset-0 rounded-full border-4 border-orange-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-orange-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 bg-orange-600 rounded-full flex items-center justify-center">
              <div className="flex flex-col space-y-0.5">
                <div className="w-3 h-0.5 bg-white rounded"></div>
                <div className="w-3 h-0.5 bg-white rounded"></div>
                <div className="w-3 h-0.5 bg-white rounded"></div>
              </div>
            </div>
          </div>
        );
      
      case 'baseball':
        return (
          <div className={cn("relative", sizeClasses[size])}>
            <div className="absolute inset-0 rounded-full border-4 border-white border-dashed animate-spin"></div>
            <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
              <div className="flex space-x-0.5">
                <div className="w-0.5 h-4 bg-red-600 rounded"></div>
                <div className="w-0.5 h-4 bg-red-600 rounded"></div>
              </div>
            </div>
          </div>
        );
      
      case 'hockey':
        return (
          <div className={cn("relative", sizeClasses[size])}>
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-gray-800 rounded-full flex items-center justify-center">
              <div className="w-2 h-0.5 bg-white rounded rotate-45"></div>
            </div>
          </div>
        );
      
      case 'soccer':
        return (
          <div className={cn("relative", sizeClasses[size])}>
            <div className="absolute inset-0 rounded-full border-4 border-white animate-spin"></div>
            <div className="absolute inset-1 bg-white rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-white"></div>
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-black transform -translate-x-0.5"></div>
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black transform -translate-y-0.5"></div>
              <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-black rounded-full"></div>
              <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        );
      
      case 'esports':
        return (
          <div className={cn("relative", sizeClasses[size])}>
            <div className="absolute inset-0 border-4 border-purple-200 rounded-lg"></div>
            <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-lg animate-spin"></div>
            <div className="absolute inset-2 bg-purple-600 rounded flex items-center justify-center">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-white rounded-full animate-pulse delay-100"></div>
                <div className="w-1 h-1 bg-white rounded-full animate-pulse delay-200"></div>
                <div className="w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        );
      
      case 'tennis':
        return (
          <div className={cn("relative", sizeClasses[size])}>
            <div className="absolute inset-0 rounded-full border-4 border-yellow-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 bg-yellow-400 rounded-full flex items-center justify-center">
              <div className="w-3 h-0.5 bg-white rounded-full"></div>
            </div>
          </div>
        );
      
      case 'golf':
        return (
          <div className={cn("relative", sizeClasses[size])}>
            <div className="absolute inset-0 rounded-full border-4 border-green-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 bg-green-600 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className={cn("relative", sizeClasses[size])}>
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
        );
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
      {getSportIcon()}
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
}

// Specialized esports team spinners
export function EsportsTeamSpinner({ 
  team = 'generic', 
  size = 'md', 
  className,
  message 
}: {
  team?: 'tsm' | 'cloud9' | 'fnatic' | 't1' | 'g2' | 'faze' | 'navi' | 'astralis' | 'liquid' | 'generic';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  message?: string;
}) {
  
  const getTeamColors = () => {
    switch (team) {
      case 'tsm': return { primary: 'border-gray-800', secondary: 'bg-gray-800' };
      case 'cloud9': return { primary: 'border-blue-500', secondary: 'bg-blue-500' };
      case 'fnatic': return { primary: 'border-orange-500', secondary: 'bg-orange-500' };
      case 't1': return { primary: 'border-red-600', secondary: 'bg-red-600' };
      case 'g2': return { primary: 'border-red-500', secondary: 'bg-red-500' };
      case 'faze': return { primary: 'border-red-700', secondary: 'bg-red-700' };
      case 'navi': return { primary: 'border-yellow-400', secondary: 'bg-yellow-400' };
      case 'astralis': return { primary: 'border-red-600', secondary: 'bg-red-600' };
      case 'liquid': return { primary: 'border-blue-600', secondary: 'bg-blue-600' };
      default: return { primary: 'border-purple-600', secondary: 'bg-purple-600' };
    }
  };

  const colors = getTeamColors();

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <div className={cn("absolute inset-0 border-4 border-opacity-30 rounded-lg", colors.primary)}></div>
        <div className={cn("absolute inset-0 border-4 border-t-transparent rounded-lg animate-spin", colors.primary)}></div>
        <div className={cn("absolute inset-2 rounded flex items-center justify-center", colors.secondary)}>
          <div className="text-white text-xs font-bold">
            {team.toUpperCase().slice(0, 2)}
          </div>
        </div>
      </div>
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
}

// Context-aware spinner that detects current page/sport
export function ContextualSportsSpinner({ 
  size = 'md', 
  className,
  message 
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  message?: string;
}) {
  // Detect current sport context from URL or page context
  const getCurrentSportType = () => {
    if (typeof window === 'undefined') return 'generic';
    
    const path = window.location.pathname.toLowerCase();
    
    if (path.includes('nfl') || path.includes('football')) return 'football';
    if (path.includes('nba') || path.includes('basketball')) return 'basketball';
    if (path.includes('mlb') || path.includes('baseball')) return 'baseball';
    if (path.includes('nhl') || path.includes('hockey')) return 'hockey';
    if (path.includes('soccer') || path.includes('mls')) return 'soccer';
    if (path.includes('esports') || path.includes('gaming')) return 'esports';
    if (path.includes('tennis')) return 'tennis';
    if (path.includes('golf')) return 'golf';
    
    return 'generic';
  };

  const sportType = getCurrentSportType();

  return (
    <SportsLoadingSpinner 
      type={sportType as any}
      size={size}
      className={className}
      message={message || `Loading ${sportType} data...`}
    />
  );
}