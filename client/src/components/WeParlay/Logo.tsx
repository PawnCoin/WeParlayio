import React from 'react';
import { Link } from 'wouter';
import logoPath from '@/assets/logo.png';

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
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
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
          src={logoPath} 
          alt="WeParlay.io" 
          className={`${sizeClasses[size]} object-contain`}
        />
        {showText && (
          <div className={`flex flex-col ${textSizeClasses[size]}`}>
            <div className="flex items-center">
              <span className="text-primary font-bold">We</span>
              <span className="text-white font-bold">parlay</span>
              <span className="text-white font-bold">.io</span>
            </div>
            <span className="text-accent text-sm font-medium">SPORTS BETTING</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default Logo;