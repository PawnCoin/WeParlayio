import React from 'react';
// Professional WeParlay.io logo design
const weparlayLogo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjAwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8IS0tIE9yYW5nZSBCYWNrZ3JvdW5kIC0tPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiByeD0iOCIgZmlsbD0iI0YzOTcwMCIvPgo8IS0tIFdlUGFybGF5IFRleHQgLS0+Cjx0ZXh0IHg9IjE1IiB5PSI0MCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiPldlUGFybGF5LmlvPC90ZXh0Pgo8IS0tIEdhbWluZyBJY29uIC0tPgo8Y2lyY2xlIGN4PSIxNzAiIGN5PSIzMCIgcj0iMTgiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjE2NSIgY3k9IjI1IiByPSI0IiBmaWxsPSIjRjM5NzAwIi8+CjxjaXJjbGUgY3g9IjE3NSIgY3k9IjI1IiByPSI0IiBmaWxsPSIjRjM5NzAwIi8+CjxyZWN0IHg9IjE2MCIgeT0iMzMiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0IiByeD0iMiIgZmlsbD0iI0YzOTcwMCIvPgo8L3N2Zz4=";

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