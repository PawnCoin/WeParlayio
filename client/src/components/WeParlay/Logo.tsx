import React from 'react';
// Using SVG logo instead of missing PNG file
const weparlayLogo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMTIiIGZpbGw9IiNGMzk3MDAiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+CjxwYXRoIGQ9Im0xOSA5LTcgNy0zLTMtNyA3Ii8+CjxwYXRoIGQ9Im0yMSA5LTItMiIvPgo8cGF0aCBkPSJtMTUgNS0yLTIiLz4KPHN2Zz4KPC9zdmc+";

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