import React from 'react';
import weparlayLogoP1 from '@/assets/weparlaylogoP1.png';
import weparlayLogo5 from '@/assets/weparlaylogo5.png';
import weparlayLogo from '@/assets/weparlaylogo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withTagline?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', withTagline = false }) => {
  // Size mappings for the logo image
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-20 w-auto'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <img 
          src={weparlayLogoP1} 
          alt="WeParlay.io" 
          className={`${sizeClasses[size]} object-contain drop-shadow-md hover:drop-shadow-lg transition-all duration-300 hover:scale-105`}
        />
        {withTagline && (
          <div className="text-orange-500 font-bold text-sm mt-1 text-center tracking-wide">
            Sports Betting Platform
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;