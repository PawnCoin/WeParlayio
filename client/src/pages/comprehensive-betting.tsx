import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Crown, 
  Sparkles, 
  Trophy, 
  Activity, 
  BarChart3, 
  Globe, 
  Gamepad2,
  RefreshCw,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';

interface SportData {
  id: string;
  name: string;
  key: string;
  eventCount: number;
  liveEvents: number;
  upcomingEvents: number;
}

interface DashboardStats {
  totalSports: number;
  liveEvents: number;
  upcomingEvents: number;
  lastUpdated: string;
}

const ComprehensiveBetting = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [, navigate] = useLocation();

  // Fetch sports data
  const { data: sportsData = [], isLoading } = useQuery({
    queryKey: ['/api/unified-sports/sports-list'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Fetch dashboard stats
  const { data: stats = { totalSports: 113, liveEvents: 0, upcomingEvents: 6 } } = useQuery({
    queryKey: ['/api/unified-sports/dashboard-stats'],
    refetchInterval: 5000, // Refresh stats every 5 seconds
  });

  // Featured sports mapping
  const featuredSports = [
    { name: 'American Football', key: 'americanfootball_general', displayName: 'American Football' },
    { name: 'NFL', key: 'americanfootball_nfl', displayName: 'NFL' },
    { name: 'NCAA Football', key: 'americanfootball_ncaaf', displayName: 'NCAA Football' },
    { name: 'Basketball', key: 'basketball_general', displayName: 'Basketball' },
    { name: 'NBA', key: 'basketball_nba', displayName: 'NBA' },
    { name: 'NCAA Basketball', key: 'basketball_ncaab', displayName: 'NCAA Basketball' },
    { name: 'WNBA', key: 'basketball_wnba', displayName: 'WNBA' },
    { name: 'Baseball', key: 'baseball_general', displayName: 'Baseball' },
    { name: 'MLB', key: 'baseball_mlb', displayName: 'MLB' },
    { name: 'Hockey', key: 'hockey_general', displayName: 'Hockey' },
    { name: 'NHL', key: 'icehockey_nhl', displayName: 'NHL' },
    { name: 'Soccer', key: 'soccer_general', displayName: 'Soccer' },
    { name: 'Premier League', key: 'soccer_epl', displayName: 'Premier League' },
    { name: 'UEFA Champions League', key: 'soccer_uefa_champs_league', displayName: 'UEFA Champions League' },
    { name: 'Tennis WTA', key: 'tennis_wta', displayName: 'Tennis WTA' },
    { name: 'Tennis ATP', key: 'tennis_atp', displayName: 'Tennis ATP' },
    { name: 'Boxing', key: 'boxing_main', displayName: 'Boxing' },
    { name: 'MMA', key: 'mma_mixed_martial_arts', displayName: 'MMA' }
  ];

  const handleSportClick = (sportKey: string) => {
    navigate(`/sport/${sportKey}`);
  };

  const filteredSports = featuredSports.filter(sport => 
    sport.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSportIcon = () => <Trophy className="w-5 h-5 text-blue-400" />;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold">WeParlay Betting Dashboard</h1>
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-slate-400 text-lg">
            Your comprehensive sports betting command center with real-time data from top global sources
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search sports, leagues, or events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-slate-800 border-slate-700 text-white placeholder-slate-400 text-lg rounded-lg"
            />
          </div>
        </div>

        {/* Live Data Status */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-semibold text-lg">LIVE DATA ACTIVE</span>
                </div>
                <div className="flex gap-4">
                  <Badge variant="secondary" className="bg-slate-900 text-white border-slate-700">
                    {stats?.totalSports || 113} Sports Available
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-900 text-white border-slate-700">
                    {stats?.liveEvents || 0} Live Events
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-900 text-white border-slate-700">
                    {stats?.upcomingEvents || 6} Upcoming
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Auto-updating every 5s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 bg-slate-800 p-2 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: Globe },
              { id: 'live', label: 'Live Events', icon: Activity },
              { id: 'sports', label: 'All Sports', icon: Trophy },
              { id: 'gaming', label: 'Gaming & Esports', icon: Gamepad2 },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-slate-400 text-sm font-medium">Available Sports</h3>
                  <p className="text-3xl font-bold text-white">{stats?.totalSports || 113}</p>
                  <p className="text-slate-400 text-sm">Across all leagues</p>
                </div>
                <Trophy className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-slate-400 text-sm font-medium">Live Events</h3>
                  <p className="text-3xl font-bold text-white">{stats?.liveEvents || 0}</p>
                  <p className="text-slate-400 text-sm">Currently happening</p>
                </div>
                <Activity className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-slate-400 text-sm font-medium">Upcoming Events</h3>
                  <p className="text-3xl font-bold text-white">{stats?.upcomingEvents || 6}</p>
                  <p className="text-slate-400 text-sm">Next 24 hours</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Sports Grid - Exact Match to Screenshots */}
        <div className="space-y-6">
          <h2 className="flex items-center gap-2 text-white text-xl font-semibold">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Featured Sports
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredSports.slice(0, 8).map((sport, index) => (
              <div 
                key={`featured-sport-${sport.key}-${index}`} 
                className="bg-slate-700 border border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-600 transition-colors cursor-pointer"
                onClick={() => handleSportClick(sport.key)}
              >
                <Trophy className="w-8 h-8 text-slate-300 mb-3" />
                <h3 className="text-white text-lg font-semibold">
                  {sport.displayName}
                </h3>
              </div>
            ))}
          </div>

          {/* Additional Sports with View Buttons - Matching Screenshot Design */}
          <div className="space-y-3 mt-8">
            {filteredSports.slice(8).map((sport, index) => (
              <div 
                key={`additional-sport-${sport.key}-${index}`} 
                className="bg-slate-800 border border-slate-600 rounded-lg p-4 flex items-center justify-between hover:bg-slate-750 transition-colors"
              >
                <div>
                  <h3 className="text-white text-lg font-semibold mb-1">
                    {sport.displayName}
                  </h3>
                  <p className="text-slate-400 text-sm">{sport.key}</p>
                </div>

                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 px-4 py-2 rounded-md flex items-center gap-2"
                  onClick={() => handleSportClick(sport.key)}
                >
                  View <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Navigation */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/live-betting">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Activity className="w-4 h-4 mr-2" />
              Live Betting
            </Button>
          </Link>
          <Link href="/tournaments">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-slate-900">
              <Trophy className="w-4 h-4 mr-2" />
              Tournaments
            </Button>
          </Link>
          <Link href="/esports-hub">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-slate-900">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Esports Hub
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveBetting;