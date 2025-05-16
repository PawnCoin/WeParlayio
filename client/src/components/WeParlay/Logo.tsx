import React from 'react';
import { Link } from 'wouter';
// Import logo image directly
import logoImage from '../../assets/weparlaylogo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-9 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };
  
  return (
    <Link to="/">
      <div className={`flex items-center gap-2 ${className}`}>
        <img 
          src={logoImage} 
          alt="WeParlay.io" 
          className={`${sizeClasses[size]} object-contain`}
        />
        {showText && (
          <div className={`flex flex-col ${textSizeClasses[size]}`}>
            <div className="flex items-center">
              <span className="text-blue-600 font-bold">We</span>
              <span className="text-white font-bold">parlay</span>
              <span className="text-white font-bold">.io</span>
            </div>
            <span className="text-orange-500 text-sm font-bold">SPORTS BETTING</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default Logo;