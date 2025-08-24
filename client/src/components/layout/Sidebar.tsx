import React from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import sportsBetAPI from "@/lib/sportsBetAPI";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import weparlayLogo from "@assets/weparlaylogo5.png";
import { 
  X, BarChart2, Trophy, Medal, History, Settings, 
  Clock, ChevronRight, CircleDot, Flame, Zap, Crown,
  DollarSign, HelpCircle, HeadphonesIcon, Wallet, CreditCard,
  ChevronDown, TrendingUp, Target, Award, Activity,
  BarChart3, Brain, Share2
} from "lucide-react";


import { 
  FaBasketballBall, FaFootballBall, FaHockeyPuck, 
  FaBaseballBall, FaFutbol, FaTableTennis, FaVolleyballBall,
  FaSwimmer, FaBiking, FaRunning, FaSkiing, FaGolfBall,
  FaChessKnight, FaGamepad
} from "react-icons/fa";
import { 
  GiBoxingGlove, GiRaceCar, GiTennisRacket, GiAmericanFootballBall,
  GiCricketBat, GiBowlingAlley, GiArcheryTarget, GiMountainClimbing,
  GiWeightLiftingUp, GiSurfBoard, GiFencer, GiIceSkate,
  GiAmericanFootballHelmet, GiDart, GiSnowboard,
  GiMeditation, GiShuttlecock, GiBaseballBat
} from "react-icons/gi";
import { MdSportsKabaddi, MdSportsEsports, MdSportsTennis, MdSportsHandball, MdSports } from "react-icons/md";
import { IoTennisball } from "react-icons/io5";
import { TbBallFootball, TbCar } from "react-icons/tb";

// Function to get colored sport icons
const getSportIcon = (sportKey: string) => {
  switch (sportKey) {
    // Basketball
    case 'basketball':
    case 'basketball_nba':
    case 'basketball_ncaab':
    case 'basketball_wnba':
    case 'basketball_euroleague':
    case 'basketball_nba_g_league':
    case 'basketball_spain_acb':
    case 'basketball_italy_lega_a':
    case 'basketball_greece_a1':
    case 'basketball_turkey_bsl':
    case 'basketball_australia_nbl':
    case 'nba':
      return <FaBasketballBall size={16} className="text-orange-500" />;

    // American Football
    case 'football':
    case 'americanfootball_nfl':
      return <GiAmericanFootballHelmet size={16} className="text-brown-600" />;

    // Soccer/Football
    case 'soccer':
    case 'soccer_epl':
    case 'soccer_uefa_champs_league':
      return <TbBallFootball size={16} className="text-green-600" />;

    // Baseball
    case 'baseball':
    case 'baseball_mlb':
      return <GiBaseballBat size={16} className="text-blue-600" />;

    // Ice Hockey - Updated with hockey puck icon
    case 'hockey':
    case 'icehockey_nhl':
      return <FaHockeyPuck size={16} className="text-blue-400" />;

    // Tennis
    case 'tennis':
      return <IoTennisball size={16} className="text-yellow-500" />;

    // Combat Sports - Updated with boxing glove icon
    case 'mma_ufc':
    case 'boxing_main':
    case 'mma_mixed_martial_arts':
    case 'boxing':
    case 'mma':
      return <GiBoxingGlove size={16} className="text-red-600" />;

    // Esports
    case 'esports':
    case 'gaming':
      return <MdSportsEsports size={16} className="text-purple-500" />;

    // Golf
    case 'golf_pga':
    case 'golf':
      return <FaGolfBall size={16} className="text-green-500" />;

    // Motorsports
    case 'motorsport_f1':
    case 'motorsport':
      return <GiRaceCar size={16} className="text-red-500" />;

    // Other Sports - Updated with multi-sport icon
    case 'rugbyleague_nrl':
    case 'cricket':
    case 'volleyball':
    case 'handball':
    case 'swimming':
    case 'cycling':
    case 'athletics':
    case 'darts':
    case 'snooker':
    case 'badminton':
    case 'tabletennis':
    case 'waterpolo':
    case 'aussierules_afl':
    case 'gaelic_football':
    case 'futsal':
    case 'lacrosse':
    case 'field_hockey':
    case 'netball':
    case 'squash':
      return <MdSports size={16} className="text-indigo-500" />;

    // General sports
    case 'sports':
    default:
      return <MdSports size={16} className="text-gray-500" />;
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
    <div className="h-full w-full flex flex-col bg-background dark:bg-background shadow-lg">
      {/* Header with branding and close button for mobile */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Link href="/">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <span className="text-lg font-bold">
                <span className="text-blue-600">We</span>
                <span className="text-gray-700 dark:text-gray-300">Parlay</span>
                <span className="text-blue-400">.io</span>
              </span>
            </div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main Sidebar Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="mb-2 text-xs uppercase font-semibold text-gray-600 dark:text-gray-400">
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
            <details className="group">
              <summary className={`flex items-center py-2 px-4 rounded-md cursor-pointer list-none ${
                ['/betting-dashboard', '/odds', '/parlays', '/results'].includes(location) 
                  ? "bg-primary text-white" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}>
                <BarChart2 className="h-5 w-5 mr-3" />
                <span>Betting Dashboard</span>
                <ChevronDown className="h-4 w-4 ml-auto group-open:rotate-180 transition-transform" />
              </summary>
              <ul className="ml-6 mt-2 space-y-1">
                <li>
                  <Link href="/betting-dashboard">
                    <div className={`flex items-center py-2 px-3 rounded-md cursor-pointer text-sm ${
                      location === '/betting-dashboard' 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Dashboard
                    </div>
                  </Link>
                </li>

                <li>
                  <Link href="/parlays">
                    <div className={`flex items-center py-2 px-3 rounded-md cursor-pointer text-sm ${
                      location === '/parlays' 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      <Target className="h-4 w-4 mr-2" />
                      Parlay Builder
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/results">
                    <div className={`flex items-center py-2 px-3 rounded-md cursor-pointer text-sm ${
                      location === '/results' 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      <Award className="h-4 w-4 mr-2" />
                      Results & Stats
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/live-heatmap">
                    <div className={`flex items-center py-2 px-3 rounded-md cursor-pointer text-sm ${
                      location === '/live-heatmap' 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      <Activity className="h-4 w-4 mr-2" />
                      Live Heatmap
                    </div>
                  </Link>
                </li>
              </ul>
            </details>
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
            <details className="group">
              <summary className={`flex items-center py-2 px-4 rounded-md cursor-pointer list-none ${
                ['/vip', '/enhanced-features', '/streaming-recommendations', '/head-to-head', '/gaming'].includes(location) 
                  ? "bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40" 
                  : "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-900/40 dark:hover:to-yellow-900/40"
              }`}>
                <Crown className="h-5 w-5 mr-3 text-amber-500" />
                <span className="text-amber-700 dark:text-amber-300 font-medium">VIP Area</span>
                <span className="ml-2 text-[10px] font-bold py-0.5 px-1.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full">PREMIUM</span>
                <ChevronDown className="h-4 w-4 ml-auto group-open:rotate-180 transition-transform text-amber-600" />
              </summary>
              <ul className="ml-6 mt-2 space-y-1">
                <li>
                  <Link href="/gaming">
                    <div className={`flex items-center py-2 px-3 rounded-md cursor-pointer text-sm ${
                      location === '/gaming' 
                        ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 dark:bg-gradient-to-r dark:from-purple-900 dark:to-indigo-900 dark:text-purple-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      <MdSportsEsports className="h-4 w-4 mr-2 text-purple-600" />
                      <span className="font-bold text-purple-700 dark:text-purple-300">Gaming & Esports</span>
                      <span className="ml-auto text-xs bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">VIP</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/head-to-head">
                    <div className={`flex items-center py-2 px-3 rounded-md cursor-pointer text-sm ${
                      location === '/head-to-head' 
                        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:bg-gradient-to-r dark:from-green-900 dark:to-emerald-900 dark:text-green-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-bold text-green-700 dark:text-green-300">Head-to-Head ELITE</span>
                      <span className="ml-auto text-xs bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-0.5 rounded-full font-bold">REAL $</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/vip">
                    <div className={`flex items-center py-2 px-3 rounded-md cursor-pointer text-sm ${
                      location === '/vip' 
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      <Crown className="h-4 w-4 mr-2 text-amber-500" />
                      <span>VIP Dashboard</span>
                    </div>
                  </Link>
                </li>
                {/* REMOVED: blockchain-performance endpoint */}
                <li>
                  <Link href="/wallet-tutorial">
                    <div className={`flex items-center py-2 px-3 rounded-md cursor-pointer text-sm ${
                      location === '/wallet-tutorial' 
                        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:bg-gradient-to-r dark:from-green-900 dark:to-emerald-900 dark:text-green-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      <Wallet className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">Wallet Mastery</span>
                      <span className="ml-auto text-xs bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">ELITE</span>
                    </div>
                  </Link>
                </li>
                {/* REMOVED: streaming-recommendations endpoint */}
                <li>
                  <Link href="/social-sharing">
                    <div className={`flex items-center py-2 px-3 rounded-md cursor-pointer text-sm ${
                      location === '/social-sharing' 
                        ? "bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 dark:bg-gradient-to-r dark:from-orange-900 dark:to-red-900 dark:text-orange-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      <Share2 className="h-4 w-4 mr-2 text-orange-600" />
                      <span className="font-medium">Social Command</span>
                      <span className="ml-auto text-xs bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-300 px-2 py-0.5 rounded-full">VIRAL</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/fantasy">
                    <div className={`flex items-center py-2 px-3 rounded-md cursor-pointer text-sm ${
                      location === '/fantasy' 
                        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:bg-gradient-to-r dark:from-green-900 dark:to-emerald-900 dark:text-green-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      <Medal className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-bold text-green-700 dark:text-green-300">Fantasy Sports</span>
                      <span className="ml-auto text-xs bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-0.5 rounded-full font-bold">VIP+</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/tournaments">
                    <div className={`flex items-center py-2 px-3 rounded-md cursor-pointer text-sm ${
                      location === '/tournaments' 
                        ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 dark:bg-gradient-to-r dark:from-amber-900 dark:to-orange-900 dark:text-amber-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      <Trophy className="h-4 w-4 mr-2 text-amber-600" />
                      <span className="font-bold text-amber-700 dark:text-amber-300">Tournaments</span>
                      <span className="ml-auto text-xs bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">VIP+</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/enhanced-features">
                    <div className={`flex items-center py-2 px-3 rounded-md cursor-pointer text-sm ${
                      location === '/enhanced-features' 
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      <Zap className="h-4 w-4 mr-2 text-amber-500" />
                      <span>Enhanced Features</span>
                      <span className="ml-auto text-xs bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">PRO</span>
                    </div>
                  </Link>
                </li>

                <li>
                  <Link href="/streaming-recommendations">
                    <div className={`flex items-center py-2 px-3 rounded-md cursor-pointer text-sm ${
                      location === '/streaming-recommendations' 
                        ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:bg-gradient-to-r dark:from-purple-900 dark:to-pink-900 dark:text-purple-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      <Brain className="h-4 w-4 mr-2 text-purple-600" />
                      <span className="font-medium">AI Stream Intel</span>
                      <span className="ml-auto text-xs bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">AI</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/api-status">
                    <div className={`flex items-center py-2 px-3 rounded-md cursor-pointer text-sm ${
                      location === '/api-status' 
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      <Activity className="h-4 w-4 mr-2 text-amber-500" />
                      <span>API Status</span>
                      <span className="ml-auto text-xs bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">LIVE</span>
                    </div>
                  </Link>
                </li>
              </ul>
            </details>
          </li>



          <li>
            <Link href="/crypto-information">
              <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer ${
                location === '/crypto-information' 
                  ? "bg-primary text-white" 
                  : "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/40 dark:hover:to-indigo-900/40"
              }`}>
                <CreditCard className="h-5 w-5 mr-3 text-purple-600" />
                <span className="text-purple-700 dark:text-purple-300 font-medium">Crypto Guide</span>
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
          <li>
            <Link href="/support">
              <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer ${
                location === '/support' 
                  ? "bg-primary text-white" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}>
                <HeadphonesIcon className="h-5 w-5 mr-3" />
                <span>Support</span>
              </div>
            </Link>
          </li>
        </ul>

        <div className="mb-2 text-xs uppercase font-semibold text-gray-600 dark:text-gray-400">
          Sports Categories
        </div>
        <div className="space-y-2">
          {isLoadingSports ? (
            Array(3).fill(0).map((_, index) => (
              <div key={`skeleton-cat-${index}`} className="mb-1">
                <Skeleton className="h-8 w-full" />
              </div>
            ))
          ) : (
            // Organized sports dropdown categories
            <>
              {/* Basketball Category - In Season */}
              <details className="group" open>
                <summary className="flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 list-none">
                  {getSportIcon('basketball_nba')}
                  <span className="flex-1 text-sm font-medium ml-3">Basketball</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="ml-6 mt-1 space-y-1">
                  <Link href="/sports/basketball_nba">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>NBA</span>
                      <span className="ml-auto text-red-600 font-bold">PLAYOFFS</span>
                    </div>
                  </Link>
                  <Link href="/sports/basketball_wnba">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>WNBA</span>
                      <span className="ml-auto text-green-600">Season</span>
                    </div>
                  </Link>
                </div>
              </details>

              {/* Football Category */}
              <details className="group">
                <summary className="flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 list-none">
                  {getSportIcon('americanfootball_nfl')}
                  <span className="flex-1 text-sm font-medium ml-3">Football</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="ml-6 mt-1 space-y-1">
                  <Link href="/sports/americanfootball_nfl">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>NFL</span>
                      <span className="ml-auto text-orange-600">Off Season</span>
                    </div>
                  </Link>
                  <Link href="/sports/americanfootball_ncaaf">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>NCAA Football</span>
                      <span className="ml-auto text-green-600">LIVE</span>
                    </div>
                  </Link>
                </div>
              </details>

              {/* Soccer Category */}
              <details className="group">
                <summary className="flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 list-none">
                  {getSportIcon('soccer_epl')}
                  <span className="flex-1 text-sm font-medium ml-3">Soccer</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="ml-6 mt-1 space-y-1">
                  <Link href="/sports/soccer_epl">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>Premier League</span>
                      <span className="ml-auto text-green-600">LIVE</span>
                    </div>
                  </Link>
                  <Link href="/sports/soccer_uefa_champs_league">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>Champions League</span>
                      <span className="ml-auto text-blue-600">Wed</span>
                    </div>
                  </Link>
                </div>
              </details>

              {/* Tennis Category */}
              <details className="group">
                <summary className="flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 list-none">
                  {getSportIcon('tennis_atp')}
                  <span className="flex-1 text-sm font-medium ml-3">Tennis</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="ml-6 mt-1 space-y-1">
                  <Link href="/sports/tennis_atp">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>ATP</span>
                      <span className="ml-auto text-green-600">LIVE</span>
                    </div>
                  </Link>
                  <Link href="/sports/tennis_wta">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>WTA</span>
                      <span className="ml-auto text-green-600">LIVE</span>
                    </div>
                  </Link>
                </div>
              </details>



              {/* Baseball Category */}
              <details className="group">
                <summary className="flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 list-none">
                  {getSportIcon('baseball_mlb')}
                  <span className="flex-1 text-sm font-medium ml-3">Baseball</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="ml-6 mt-1 space-y-1">
                  <Link href="/sports/baseball_mlb">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>MLB</span>
                      <span className="ml-auto text-green-600">Season</span>
                    </div>
                  </Link>
                </div>
              </details>

              {/* Ice Hockey Category */}
              <details className="group">
                <summary className="flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 list-none">
                  {getSportIcon('icehockey_nhl')}
                  <span className="flex-1 text-sm font-medium ml-3">Ice Hockey</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="ml-6 mt-1 space-y-1">
                  <Link href="/sports/icehockey_nhl">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>NHL</span>
                      <span className="ml-auto text-green-600">Playoffs</span>
                    </div>
                  </Link>
                </div>
              </details>

              {/* Combat Sports Category */}
              <details className="group">
                <summary className="flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 list-none">
                  <GiBoxingGlove size={16} className="text-red-600" />
                  <span className="flex-1 text-sm font-medium ml-3">Combat Sports</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="ml-6 mt-1 space-y-1">
                  <Link href="/sports/mma_ufc">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>UFC</span>
                      <span className="ml-auto text-blue-600">Sat</span>
                    </div>
                  </Link>
                  <Link href="/sports/mma_mixed_martial_arts">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>Mixed Martial Arts</span>
                      <span className="ml-auto text-purple-600">Events</span>
                    </div>
                  </Link>
                  <Link href="/sports/boxing_main">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>Boxing</span>
                      <span className="ml-auto text-purple-600">Sun</span>
                    </div>
                  </Link>
                </div>
              </details>

              {/* Other Sports Category */}
              <details className="group">
                <summary className="flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 list-none">
                  <MdSports size={16} className="text-indigo-500" />
                  <span className="flex-1 text-sm font-medium ml-3">Other Sports</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="ml-6 mt-1 space-y-1">
                  <Link href="/sports/golf_pga">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>Golf PGA</span>
                      <span className="ml-auto text-green-600">Tours</span>
                    </div>
                  </Link>
                  <Link href="/sports/motorsport_f1">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>Formula 1</span>
                      <span className="ml-auto text-red-600">Racing</span>
                    </div>
                  </Link>
                  <Link href="/sports/rugbyleague_nrl">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>Rugby NRL</span>
                      <span className="ml-auto text-orange-600">League</span>
                    </div>
                  </Link>
                  <Link href="/sports/aussierules_afl">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>AFL</span>
                      <span className="ml-auto text-yellow-600">Season</span>
                    </div>
                  </Link>
                </div>
              </details>
            </>
          )}
        </div>
      </nav>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Bottom Section with Settings Link & Dark Mode Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link href="/login">
          <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer mb-2 ${
            location === '/login' 
              ? "bg-primary text-white" 
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
            </svg>
            <span>Login</span>
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