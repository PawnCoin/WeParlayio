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
  // Size mappings for the logo image - 5x larger
  const sizeClasses = {
    sm: 'h-40 w-auto',
    md: 'h-60 w-auto',
    lg: 'h-80 w-auto',
    xl: 'h-96 w-auto'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <img 
          src={weparlayLogo} 
          alt="WeParlay" 
          className={`${sizeClasses[size]} object-contain drop-shadow-md hover:drop-shadow-lg transition-all duration-300 hover:scale-105`}
        />

      </div>
    </div>
  );
};

export default Logo;