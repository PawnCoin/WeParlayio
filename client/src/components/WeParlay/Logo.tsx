
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/weparlaylogo.png"
        alt="WeParlay Logo"
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
          WeParlay
        </span>
      )}
    </div>
  );
}
