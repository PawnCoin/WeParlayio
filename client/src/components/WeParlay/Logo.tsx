import React from 'react';
// Using a simple text logo since image file is missing
const weparlayLogo = null;

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
        <div className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg px-4 py-2 drop-shadow-md hover:drop-shadow-lg transition-all duration-300`}>
          <span className={size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : size === 'xl' ? 'text-3xl' : 'text-xl'}>WeParlay.io</span>
        </div>
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