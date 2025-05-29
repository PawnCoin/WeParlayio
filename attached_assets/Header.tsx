import React from 'react';
import { Link } from 'react-router-dom';
import { TvIcon, MenuIcon, SearchIcon } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900 text-white py-4 px-4 md:px-6 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <TvIcon className="h-7 w-7 text-green-500" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            weparlay<span className="text-white">.io</span>
          </span>
          <span className="hidden md:inline-block text-xs bg-green-700 py-1 px-2 rounded-md ml-2">LIVE</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search games..."
              className="bg-gray-800 text-white rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <nav className="flex space-x-6">
            <Link to="/" className="text-sm font-medium hover:text-green-400 transition-colors">Home</Link>
            <Link to="/live" className="text-sm font-medium text-green-400 border-b-2 border-green-400 pb-1">Live Now</Link>
            <Link to="/bets" className="text-sm font-medium hover:text-green-400 transition-colors">My Bets</Link>
            <Link to="/account" className="text-sm font-medium hover:text-green-400 transition-colors">Account</Link>
          </nav>
        </div>

        <button className="md:hidden">
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;