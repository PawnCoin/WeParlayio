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
  DollarSign, HelpCircle, HeadphonesIcon, Wallet, CreditCard
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
  GiMeditation, GiShuttlecock
} from "react-icons/gi";
import { MdSportsKabaddi, MdSportsEsports, MdSportsTennis, MdSportsHandball } from "react-icons/md";
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
      return <FaBasketballBall size={20} className="text-orange-500" />;
    
    // American Football
    case 'football':
    case 'americanfootball_nfl':
    case 'americanfootball_ncaaf':
    case 'football_nfl':
    case 'nfl':
      return <GiAmericanFootballBall size={20} className="text-amber-800" />;
    
    // Baseball
    case 'baseball':
    case 'baseball_mlb':
    case 'baseball_npb':
    case 'baseball_kbo':
    case 'baseball_cpbl':
    case 'mlb':
      return <FaBaseballBall size={20} className="text-red-500" />;
    
    // Ice Hockey
    case 'hockey':
    case 'icehockey_nhl':
    case 'icehockey_khl':
    case 'icehockey_sweden_hockey_league':
    case 'icehockey_finland_sm_liiga':
    case 'icehockey_switzerland_nl':
    case 'icehockey_czech_extraliga':
    case 'icehockey_ahl':
    case 'hockey_nhl':
    case 'nhl':
      return <FaHockeyPuck size={20} className="text-blue-600" />;
    
    // Soccer/Football
    case 'soccer':
    case 'soccer_epl':
    case 'soccer_spain_la_liga':
    case 'soccer_germany_bundesliga':
    case 'soccer_italy_serie_a':
    case 'soccer_france_ligue_one':
    case 'soccer_usa_mls':
    case 'soccer_mexico_ligamx':
    case 'soccer_brazil_campeonato':
    case 'soccer_argentina_primera_division':
    case 'soccer_netherlands_eredivisie':
    case 'soccer_portugal_primeira_liga':
    case 'soccer_efl_champ':
    case 'soccer_uefa_champs_league':
    case 'soccer_uefa_europa_league':
    case 'soccer_fa_cup':
    case 'soccer_fifa_world_cup':
    case 'mls':
      return <FaFutbol size={20} className="text-green-600" />;
    
    // Tennis
    case 'tennis':
    case 'tennis_wta':
    case 'tennis_atp':
    case 'tennis_wimbledon':
    case 'tennis_us_open':
    case 'tennis_french_open':
    case 'tennis_australian_open':
      return <GiTennisRacket size={20} className="text-yellow-500" />;
    
    // Combat Sports
    case 'boxing':
    case 'boxing_main':
      return <GiBoxingGlove size={20} className="text-red-600" />;
    case 'mma':
    case 'mma_mixed_martial_arts':
    case 'ufc':
      return <GiMeditation size={20} className="text-purple-600" />;
    
    // Motor Sports
    case 'motorsport':
    case 'motorsport_f1':
    case 'formula1':
    case 'motorsport_nascar':
    case 'nascar':
    case 'motorsport_indycar':
      return <GiRaceCar size={20} className="text-red-500" />;
    
    // Cricket
    case 'cricket':
    case 'cricket_ipl':
    case 'cricket_big_bash':
    case 'cricket_test_match':
    case 'cricket_odi':
    case 'cricket_t20':
      return <GiCricketBat size={20} className="text-green-700" />;
    
    // Rugby
    case 'rugby':
    case 'rugby_league':
    case 'rugby_union':
    case 'rugby_nrl':
    case 'rugby_super_rugby':
      return <TbBallFootball size={20} className="text-brown-600" />;
    
    // Golf
    case 'golf':
    case 'golf_pga':
    case 'golf_european_tour':
    case 'golf_masters':
      return <FaGolfBall size={20} className="text-green-500" />;
    
    // Volleyball
    case 'volleyball':
    case 'volleyball_indoor':
    case 'volleyball_beach':
      return <FaVolleyballBall size={20} className="text-blue-400" />;
    
    // Table Tennis
    case 'table_tennis':
    case 'ping_pong':
      return <FaTableTennis size={20} className="text-orange-400" />;
    
    // Badminton
    case 'badminton':
      return <GiShuttlecock size={20} className="text-yellow-400" />;
    
    // Handball
    case 'handball':
      return <MdSportsHandball size={20} className="text-red-400" />;
    
    // Esports
    case 'esports':
    case 'esports_lol':
    case 'esports_dota2':
    case 'esports_csgo':
    case 'esports_valorant':
    case 'esports_overwatch':
      return <MdSportsEsports size={20} className="text-purple-500" />;
    
    // Swimming
    case 'swimming':
    case 'aquatics':
      return <FaSwimmer size={20} className="text-cyan-500" />;
    
    // Cycling
    case 'cycling':
    case 'cycling_road':
    case 'cycling_track':
    case 'cycling_mountain':
      return <FaBiking size={20} className="text-yellow-600" />;
    
    // Athletics/Track
    case 'athletics':
    case 'track_and_field':
    case 'running':
      return <FaRunning size={20} className="text-orange-500" />;
    
    // Winter Sports
    case 'skiing':
    case 'alpine_skiing':
    case 'cross_country_skiing':
      return <FaSkiing size={20} className="text-blue-300" />;
    case 'snowboarding':
      return <GiSnowboard size={20} className="text-purple-300" />;
    case 'figure_skating':
    case 'speed_skating':
      return <GiIceSkate size={20} className="text-cyan-300" />;
    
    // Other Sports
    case 'darts':
      return <GiDart size={20} className="text-red-500" />;
    case 'snooker':
    case 'pool':
    case 'billiards':
      return <FaGamepad size={20} className="text-green-800" />;
    case 'archery':
      return <GiArcheryTarget size={20} className="text-red-600" />;
    case 'weightlifting':
      return <GiWeightLiftingUp size={20} className="text-gray-600" />;
    case 'surfing':
      return <GiSurfBoard size={20} className="text-blue-500" />;
    case 'climbing':
    case 'rock_climbing':
      return <GiMountainClimbing size={20} className="text-brown-500" />;
    case 'fencing':
      return <GiFencer size={20} className="text-gray-500" />;
    case 'chess':
      return <FaChessKnight size={20} className="text-black dark:text-white" />;
    case 'bowling':
      return <GiBowlingAlley size={20} className="text-purple-600" />;
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
      {/* Header with branding and close button for mobile */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <Link href="/">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <span className="text-lg font-bold">
                <span className="text-blue-600">We</span>
                <span className="text-white dark:text-white">Parlay</span>
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
            <Link href="/enhanced-features">
              <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer ${
                location === '/enhanced-features' 
                  ? "bg-primary text-white" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}>
                <Zap className="h-5 w-5 mr-3" />
                <span>Enhanced Features</span>
              </div>
            </Link>
          </li>
          
          <li>
            <Link href="/wallet-management">
              <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer ${
                location === '/wallet-management' 
                  ? "bg-primary text-white" 
                  : "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40"
              }`}>
                <Wallet className="h-5 w-5 mr-3 text-blue-600" />
                <span className="text-blue-700 dark:text-blue-300 font-medium">Wallet Management</span>
                <span className="ml-2 text-[10px] font-bold py-0.5 px-1.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">NEW</span>
              </div>
            </Link>
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
                <span className="ml-2 text-[10px] font-bold py-0.5 px-1.5 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full">NEW</span>
              </div>
            </Link>
          </li>
          
          <li>
            <Link href="/head-to-head">
              <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer ${
                location === '/head-to-head' 
                  ? "bg-primary text-white" 
                  : "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/40 dark:hover:to-emerald-900/40"
              }`}>
                <DollarSign className="h-5 w-5 mr-3 text-green-600" />
                <span className="text-green-700 dark:text-green-300 font-medium">Head-to-Head Bets</span>
                <span className="ml-2 text-[10px] font-bold py-0.5 px-1.5 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full">REAL $</span>
              </div>
            </Link>
          </li>
          
          <li>
            <Link href="/vip">
              <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer ${
                location === '/vip' 
                  ? "bg-primary text-white" 
                  : "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-900/40 dark:hover:to-yellow-900/40"
              }`}>
                <Crown className="h-5 w-5 mr-3 text-amber-500" />
                <span className="text-amber-700 dark:text-amber-300 font-medium">VIP Features</span>
                <span className="ml-2 text-[10px] font-bold py-0.5 px-1.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full">NEW</span>
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
        
        <div className="mb-2 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
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
              {/* Basketball Category */}
              <details className="group">
                <summary className="flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 list-none">
                  <span className="text-lg mr-3">🏀</span>
                  <span className="flex-1 text-sm font-medium">Basketball</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="ml-6 mt-1 space-y-1">
                  <Link href="/sports/basketball_nba">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>NBA</span>
                      <span className="ml-auto text-green-600">LIVE</span>
                    </div>
                  </Link>
                  <Link href="/sports/basketball_wnba">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>WNBA</span>
                      <span className="ml-auto text-blue-600">Tue 4PM</span>
                    </div>
                  </Link>
                  <Link href="/sports/basketball_ncaab">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>NCAA Men</span>
                      <span className="ml-auto text-green-600">LIVE</span>
                    </div>
                  </Link>
                </div>
              </details>

              {/* Football Category */}
              <details className="group">
                <summary className="flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 list-none">
                  <span className="text-lg mr-3">🏈</span>
                  <span className="flex-1 text-sm font-medium">Football</span>
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
                  <span className="text-lg mr-3">⚽</span>
                  <span className="flex-1 text-sm font-medium">Soccer</span>
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
                  <span className="text-lg mr-3">🎾</span>
                  <span className="flex-1 text-sm font-medium">Tennis</span>
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

              {/* Football Category - ALL FOOTBALL SPORTS */}
              <details className="group">
                <summary className="flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 list-none">
                  <span className="text-lg mr-3">🏈</span>
                  <span className="flex-1 text-sm font-medium">All Football</span>
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
                  <Link href="/sports/football_ufl">
                    <div className="flex items-center py-1 px-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span>UFL</span>
                      <span className="ml-auto text-blue-600">Spring</span>
                    </div>
                  </Link>
                </div>
              </details>

              {/* Baseball Category */}
              <details className="group">
                <summary className="flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 list-none">
                  <span className="text-lg mr-3">⚾</span>
                  <span className="flex-1 text-sm font-medium">Baseball</span>
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
                  <span className="text-lg mr-3">🏒</span>
                  <span className="flex-1 text-sm font-medium">Ice Hockey</span>
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
                  <span className="text-lg mr-3">🥊</span>
                  <span className="flex-1 text-sm font-medium">Combat Sports</span>
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
                  <span className="text-lg mr-3">🏆</span>
                  <span className="flex-1 text-sm font-medium">Other Sports</span>
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-3">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
            </svg>
            <span>Login</span>
            <ChevronRight className="h-4 w-4 ml-auto" />
          </div>
        </Link>
        
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
        
        <Link href="/theme-manager">
          <div className={`flex items-center py-2 px-4 rounded-md cursor-pointer mb-2 ${
            location === '/theme-manager' 
              ? "bg-primary text-white" 
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}>
            <Settings className="h-5 w-5 mr-3" />
            <span>Theme Settings</span>
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