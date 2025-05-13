import React from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import sportsBetAPI from "@/lib/sportsBetAPI";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { X, BarChart2, Trophy, Medal, History, Settings } from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const [location] = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  const { data: sports, isLoading: isLoadingSports } = useQuery({
    queryKey: ["/api/sports"],
    queryFn: () => sportsBetAPI.getSports(),
  });

  return (
    <div className="p-4 relative">
      {/* Close button for mobile */}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 md:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-lg">Sports</h2>
        <Button variant="ghost" size="sm" className="text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h18v18H3z"></path>
            <path d="M9 18V9"></path>
            <path d="M15 18v-5"></path>
            <path d="M21 3v18"></path>
            <path d="M3 3v18"></path>
            <path d="M21 9H9"></path>
            <path d="M21 15H15"></path>
          </svg>
        </Button>
      </div>
      
      <nav>
        <ul>
          {isLoadingSports ? (
            // Loading state
            Array(5).fill(0).map((_, i) => (
              <li key={i} className="mb-1">
                <div className="flex items-center py-2 px-4">
                  <Skeleton className="h-6 w-6 rounded-full mr-3" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-8 ml-auto" />
                </div>
              </li>
            ))
          ) : (
            // Loaded sports
            sports?.map((sport) => (
              <li key={sport.id} className="mb-1">
                <Link href={`/sports/${sport.key}`}>
                  <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer ${
                    location === `/sports/${sport.key}`
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}>
                    <i className={`fas fa-${sport.icon} w-6`}></i>
                    <span>{sport.name}</span>
                    <span className={`ml-auto text-xs px-2 py-1 rounded ${
                      location === `/sports/${sport.key}`
                        ? "bg-white bg-opacity-20 text-white"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                      {sport.eventCount}
                    </span>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </nav>
      
      <hr className="my-6 border-gray-200 dark:border-gray-700" />
      
      <div>
        <h2 className="font-bold text-lg mb-4">Quick Links</h2>
        <ul>
          <li className="mb-2">
            <Link href="/live-betting">
              <div className="flex items-center text-neutral-dark dark:text-neutral-light hover:text-primary dark:hover:text-primary cursor-pointer">
                <BarChart2 className="mr-2 h-4 w-4" />
                <span>Live Games</span>
              </div>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/my-contests">
              <div className="flex items-center text-neutral-dark dark:text-neutral-light hover:text-primary dark:hover:text-primary cursor-pointer">
                <Trophy className="mr-2 h-4 w-4" />
                <span>My Contests</span>
              </div>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/leaderboards">
              <div className="flex items-center text-neutral-dark dark:text-neutral-light hover:text-primary dark:hover:text-primary cursor-pointer">
                <Medal className="mr-2 h-4 w-4" />
                <span>Leaderboards</span>
              </div>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/bet-history">
              <div className="flex items-center text-neutral-dark dark:text-neutral-light hover:text-primary dark:hover:text-primary cursor-pointer">
                <History className="mr-2 h-4 w-4" />
                <span>Bet History</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/settings">
              <div className="flex items-center text-neutral-dark dark:text-neutral-light hover:text-primary dark:hover:text-primary cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </div>
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="dark-mode-toggle" className="font-medium">Dark Mode</Label>
          <Switch 
            id="dark-mode-toggle" 
            checked={isDarkMode} 
            onCheckedChange={toggleDarkMode} 
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
      </div>
    </div>
  );
};

export default Sidebar;
