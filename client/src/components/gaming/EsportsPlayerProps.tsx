
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Gamepad2, TrendingUp, Target, Trophy } from 'lucide-react';

interface EsportsPlayerProp {
  id: string;
  player: string;
  team: string;
  game: string;
  propType: string;
  line: number;
  overOdds: number;
  underOdds: number;
  market: string;
}

const EsportsPlayerProps: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string>("lol");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("all");

  // Fetch esports player props
  const { data: playerProps, isLoading } = useQuery({
    queryKey: ['/api/gaming/player-props', selectedGame],
    refetchInterval: 10000, // 10 second updates
  });

  // Mock data for demonstration
  const mockProps: EsportsPlayerProp[] = [
    {
      id: "1",
      player: "Faker",
      team: "T1",
      game: "League of Legends",
      propType: "Kills",
      line: 4.5,
      overOdds: -110,
      underOdds: -110,
      market: "Total Kills"
    },
    {
      id: "2",
      player: "s1mple",
      team: "NAVI",
      game: "CS:GO",
      propType: "ADR",
      line: 85.5,
      overOdds: -115,
      underOdds: -105,
      market: "Average Damage per Round"
    },
    {
      id: "3",
      player: "TenZ",
      team: "Sentinels",
      game: "Valorant",
      propType: "First Bloods",
      line: 2.5,
      overOdds: +105,
      underOdds: -125,
      market: "First Blood Kills"
    },
    {
      id: "4",
      player: "Caps",
      team: "G2",
      game: "League of Legends",
      propType: "Assists",
      line: 7.5,
      overOdds: -120,
      underOdds: +100,
      market: "Total Assists"
    }
  ];

  const games = [
    { id: "lol", name: "League of Legends" },
    { id: "csgo", name: "CS:GO" },
    { id: "valorant", name: "Valorant" },
    { id: "dota2", name: "Dota 2" },
    { id: "overwatch", name: "Overwatch" }
  ];

  const filteredProps = selectedGame === "all" 
    ? mockProps 
    : mockProps.filter(prop => prop.game.toLowerCase().includes(selectedGame));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Gamepad2 className="h-5 w-5 mr-2 text-purple-500" />
            Esports Player Props
            <Badge variant="secondary" className="ml-2">LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex space-x-2 mb-4">
            <Select value={selectedGame} onValueChange={setSelectedGame}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Game" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                {games.map(game => (
                  <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Player Props Grid */}
          <div className="space-y-3">
            {filteredProps.map(prop => (
              <div key={prop.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-lg">{prop.player}</div>
                    <div className="text-sm text-gray-600">{prop.team} - {prop.game}</div>
                    <div className="text-sm font-medium text-purple-600">{prop.market}</div>
                  </div>
                  <Badge variant="outline" className="bg-purple-100">
                    {prop.propType}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto border-green-200 hover:bg-green-50"
                  >
                    <div className="text-lg font-bold">Over {prop.line}</div>
                    <div className="text-sm text-green-600">
                      {prop.overOdds > 0 ? '+' : ''}{prop.overOdds}
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center p-4 h-auto border-red-200 hover:bg-red-50"
                  >
                    <div className="text-lg font-bold">Under {prop.line}</div>
                    <div className="text-sm text-red-600">
                      {prop.underOdds > 0 ? '+' : ''}{prop.underOdds}
                    </div>
                  </Button>
                </div>

                {/* Performance Stats */}
                <div className="mt-3 p-2 bg-white rounded border text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Last 10 Games Avg:</span>
                    <span className="font-medium">
                      {prop.propType === 'Kills' ? '5.2' : 
                       prop.propType === 'ADR' ? '87.3' : 
                       prop.propType === 'Assists' ? '8.1' : '2.8'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProps.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Gamepad2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No player props available for selected game</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured Prop of the Day */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-purple-500" />
                <span className="font-semibold text-purple-800">Featured Prop</span>
              </div>
              <div className="font-bold">Faker Over 4.5 Kills vs DRX</div>
              <div className="text-sm text-gray-600">96% hit rate in last 25 games</div>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Bet Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EsportsPlayerProps;
