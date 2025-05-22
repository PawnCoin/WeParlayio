import React from 'react';
import weparlayLogo from '@assets/weparlaylogo5.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withTagline?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', withTagline = false }) => {
  // Size mappings - increased sizes to make logo and text more visible
  const sizeClasses = {
    sm: 'h-12',
    md: 'h-16',
    lg: 'h-20',
    xl: 'h-24'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <img 
          src={weparlayLogo} 
          alt="WeParlay.io Logo" 
          className={`${sizeClasses[size]} object-contain drop-shadow-md hover:drop-shadow-lg transition-all duration-300`} 
        />
        {withTagline && (
          <div className="text-orange-500 font-bold text-sm mt-1 text-center tracking-wide">
           
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;