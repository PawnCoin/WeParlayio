import React from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import sportsBetAPI from "@/lib/sportsBetAPI";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  X, BarChart2, Trophy, Medal, History, Settings, 
  Clock, ChevronRight, CircleDot, Flame
} from "lucide-react";
import { 
  FaBasketballBall, FaFootballBall, FaHockeyPuck, 
  FaBaseballBall, FaFutbol 
} from "react-icons/fa";
import { 
  GiBoxingGlove, GiRaceCar
} from "react-icons/gi";
import { MdSportsKabaddi } from "react-icons/md";
import { IoTennisball } from "react-icons/io5";

// Function to get colored sport icons
const getSportIcon = (sportKey: string) => {
  switch (sportKey) {
    case 'basketball':
    case 'basketball_nba':
    case 'nba':
      return <FaBasketballBall size={20} className="text-orange-500" />;
    case 'football':
    case 'football_nfl':
    case 'nfl':
      return <FaFootballBall size={20} className="text-amber-800" />;
    case 'baseball':
    case 'baseball_mlb':
    case 'mlb':
      return <FaBaseballBall size={20} className="text-red-500" />;
    case 'hockey':
    case 'hockey_nhl':
    case 'nhl':
      return <FaHockeyPuck size={20} className="text-black dark:text-white" />;
    case 'soccer':
    case 'soccer_mls':
    case 'mls':
      return <FaFutbol size={20} className="text-black dark:text-white" />;
    case 'boxing':
    case 'boxing_main':
      return <GiBoxingGlove size={20} className="text-red-600" />;
    case 'mma':
    case 'mma_ufc':
    case 'ufc':
      return <MdSportsKabaddi size={20} className="text-purple-600" />;
    case 'tennis':
    case 'tennis_atp':
    case 'tennis_wta':
      return <IoTennisball size={20} className="text-green-500" />;
    case 'motorsport':
    case 'motorsport_nascar':
    case 'nascar':
    case 'f1':
      return <GiRaceCar size={20} className="text-gray-800 dark:text-gray-200" />;
    default:
      return <FaBasketballBall size={20} className="text-orange-500" />;
  }
};

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const [location] = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  // Fetch sports data
  const { data: sports, isLoading: isLoadingSports } = useQuery({
    queryKey: ['/api/sports'],
  });

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-gray-900 shadow-lg">
      {/* Header with logo and close button for mobile */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <CircleDot className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold">WeParlay</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Main Sidebar Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="mb-2 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
          Main Navigation
        </div>
        <ul className="space-y-1 mb-6">
          <li>
            <Link href="/">
              <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer ${
                location === '/' 
                  ? "bg-primary text-white" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}>
                <Flame className="h-5 w-5 mr-3" />
                <span>Home</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/betting-dashboard">
              <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer ${
                location === '/betting-dashboard' 
                  ? "bg-primary text-white" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}>
                <BarChart2 className="h-5 w-5 mr-3" />
                <span>Betting Dashboard</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/live-betting">
              <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer ${
                location === '/live-betting' 
                  ? "bg-primary text-white" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}>
                <Clock className="h-5 w-5 mr-3" />
                <span>Live Betting</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/tournaments">
              <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer ${
                location === '/tournaments' 
                  ? "bg-primary text-white" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}>
                <Trophy className="h-5 w-5 mr-3" />
                <span>Tournaments</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/fantasy">
              <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer ${
                location === '/fantasy' 
                  ? "bg-primary text-white" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}>
                <Medal className="h-5 w-5 mr-3" />
                <span>Fantasy Sports</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/results">
              <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer ${
                location === '/results' 
                  ? "bg-primary text-white" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}>
                <History className="h-5 w-5 mr-3" />
                <span>Results</span>
              </div>
            </Link>
          </li>
        </ul>
        
        <div className="mb-2 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
          Sports
        </div>
        <ul className="space-y-1">
          {isLoadingSports ? (
            // Loading skeletons for sports
            Array(5).fill(0).map((_, index) => (
              <li key={index} className="mb-1">
                <div className="flex items-center py-2 px-4">
                  <Skeleton className="h-6 w-6 rounded-full mr-3" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-8 ml-auto" />
                </div>
              </li>
            ))
          ) : (
            // Loaded sports
            sports && Array.isArray(sports) ? (
              sports.map((sport) => (
                <li key={sport.id} className="mb-1">
                  <Link href={`/sports/${sport.key}`}>
                    <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer ${
                      location === `/sports/${sport.key}`
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-2">
                        {getSportIcon(sport.key)}
                      </span>
                      <span>
                        {sport.key === 'basketball' ? 'NBA' :
                         sport.key === 'football' ? 'NFL' :
                         sport.key === 'baseball' ? 'MLB' :
                         sport.key === 'hockey' ? 'NHL' :
                         sport.key === 'soccer' ? 'MLS' :
                         sport.key === 'mma' ? 'UFC' :
                         sport.key === 'motorsport' ? 'NASCAR' :
                         sport.name}
                      </span>
                      <span className={`ml-auto text-xs px-2 py-1 rounded ${
                        location === `/sports/${sport.key}`
                          ? "bg-white bg-opacity-20 text-white"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                        {sport.eventCount || 0}
                      </span>
                    </div>
                  </Link>
                </li>
              ))
            ) : null
          )}
        </ul>
      </nav>
      
      <hr className="border-gray-200 dark:border-gray-700" />
      
      {/* Bottom Section with Settings Link & Dark Mode Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link href="/settings">
          <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer mb-2 ${
            location === '/settings' 
              ? "bg-primary text-white" 
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}>
            <Settings className="h-5 w-5 mr-3" />
            <span>Settings</span>
            <ChevronRight className="h-4 w-4 ml-auto" />
          </div>
        </Link>
        
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm">Dark Mode</p>
          <Switch 
            checked={isDarkMode}
            onCheckedChange={toggleDarkMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;