import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { sportLogos, getTeamLogo } from '@/lib/teamLogos';
import { Check, AlertTriangle } from 'lucide-react';

interface TeamLogoProps {
  teamName: string;
  league?: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
}

const TeamLogo: React.FC<TeamLogoProps> = ({ 
  teamName, 
  league = 'NBA', 
  size = 'md', 
  showStatus = false,
  className = "" 
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  };

  const logoUrl = AssetManager.getTeamLogo(teamName, league);

  const getTeamInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={`relative ${className}`}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage 
          src={logoUrl}
          alt={`${teamName} logo`}
          onError={() => setImageError(true)}
        />
        <AvatarFallback className="bg-gray-200 text-gray-700 font-bold">
          {getTeamInitials(teamName)}
        </AvatarFallback>
      </Avatar>

      {showStatus && imageError && (
        <div className="absolute -top-1 -right-1">
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </div>
      )}
    </div>
  );
};