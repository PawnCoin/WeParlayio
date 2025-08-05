
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-md p-4 flex items-center space-x-3 flex-shrink-0 z-10">
       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
         <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5zm7 3a1 1 0 0 1 1 .883V16.117a1 1 0 0 1-1.993.117L11 16.117V8.883A1 1 0 0 1 12 8zM8 10a1 1 0 0 1 1 .883v4.234a1 1 0 0 1-1.993.117L7 15.117v-4.234A1 1 0 0 1 8 10zm8 0a1 1 0 0 1 1 .883v4.234a1 1 0 0 1-1.993.117L15 15.117v-4.234A1 1 0 0 1 16 10z" />
       </svg>
      <h1 className="text-2xl font-bold text-white tracking-tight">
        Sports IPTV Player
      </h1>
    </header>
  );
};

export default Header;
