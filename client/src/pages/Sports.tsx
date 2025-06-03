import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTeamLogo, getLeagueLogo, getTeamInitials } from '@/utils/sportsLogosSimple';
import { Clock, Trophy, TrendingUp, Users } from 'lucide-react';

interface Game {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers?: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

interface Sport {
  id: number;
  name: string;
  key: string;
  eventCount?: number;
}

export default function Sports() {
  const [selectedSport, setSelectedSport] = useState<string>('americanfootball_nfl');
  
  const { data: sports = [], isLoading: sportsLoading } = useQuery({
    queryKey: ['/api/sports'],
  });

  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['/api/odds', selectedSport],
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const renderTeamLogo = (teamName: string, sport: string) => {
    const logoUrl = getTeamLogo(teamName, sport);
    if (logoUrl) {
      return (
        <img 
          src={logoUrl} 
          alt={teamName} 
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }
    return <TeamLogoFallback teamName={teamName} className="w-8 h-8" />;
  };

  const renderLeagueLogo = (sportKey: string) => {
    const leagueKey = sportKey.replace('americanfootball_', '').replace('basketball_', '').replace('baseball_', '').replace('icehockey_', '');
    const logoUrl = getLeagueLogo(leagueKey);
    
    if (logoUrl) {
      return (
        <img 
          src={logoUrl} 
          alt={leagueKey.toUpperCase()} 
          className="w-6 h-6 object-contain"
        />
      );
    }
    return <Trophy className="w-6 h-6 text-orange-500" />;
  };

  if (sportsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">Loading sports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Sports Betting</h1>
          <p className="text-gray-400">Live odds and betting opportunities</p>
        </div>

        <Tabs value={selectedSport} onValueChange={setSelectedSport} className="mb-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 bg-gray-800/50 p-2">
            {sports.map((sport: Sport) => (
              <TabsTrigger 
                key={sport.key} 
                value={sport.key}
                className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                {renderLeagueLogo(sport.key)}
                <span className="hidden md:inline">{sport.name}</span>
                {sport.eventCount && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {sport.eventCount}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {sports.map((sport: Sport) => (
            <TabsContent key={sport.key} value={sport.key} className="mt-6">
              <div className="grid gap-4">
                {gamesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading games...</p>
                  </div>
                ) : games.length === 0 ? (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="text-center py-8">
                      <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No games available for {sport.name}</p>
                    </CardContent>
                  </Card>
                ) : (
                  games.map((game: Game) => (
                    <Card key={game.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {renderLeagueLogo(game.sport_key)}
                            <CardTitle className="text-lg">{game.sport_title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            {formatDate(game.commence_time)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {renderTeamLogo(game.away_team, game.sport_key)}
                            <span className="font-medium">{game.away_team}</span>
                          </div>
                          <span className="text-gray-400 text-sm">@</span>
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{game.home_team}</span>
                            {renderTeamLogo(game.home_team, game.sport_key)}
                          </div>
                        </div>

                        {game.bookmakers && game.bookmakers.length > 0 && (
                          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-700">
                            {game.bookmakers[0].markets[0]?.outcomes.map((outcome, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                className="flex flex-col items-center p-3 bg-gray-700/50 border-gray-600 hover:bg-orange-500/20 hover:border-orange-500"
                              >
                                <span className="text-sm font-medium">{outcome.name}</span>
                                <span className="text-lg font-bold text-orange-400">
                                  {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
                                </span>
                              </Button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{game.bookmakers?.length || 0} books</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>Live odds</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            Place Bet
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}