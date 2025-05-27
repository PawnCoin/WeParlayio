import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Eye, DollarSign, Users, Flame } from 'lucide-react';

interface BettingData {
  gameId: string;
  teams: string;
  sport: string;
  betVolume: number;
  oddsMoves: number;
  publicPercentage: number;
  sharpMoney: number;
  temperature: 'cold' | 'warm' | 'hot' | 'blazing';
  trend: 'up' | 'down' | 'stable';
  timeLeft: string;
}

interface HeatmapCell {
  id: string;
  game: string;
  intensity: number;
  volume: number;
  movement: 'up' | 'down' | 'stable';
  color: string;
  data: BettingData;
}

export default function DynamicBettingHeatmap() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '4h' | '24h'>('4h');
  const [selectedSport, setSelectedSport] = useState<'all' | 'nfl' | 'nba' | 'soccer'>('all');
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  // Generate dynamic heatmap data
  useEffect(() => {
    const generateHeatmapData = (): HeatmapCell[] => {
      const games = [
        { id: '1', teams: 'Lakers vs Warriors', sport: 'NBA' },
        { id: '2', teams: 'Chiefs vs Bills', sport: 'NFL' },
        { id: '3', teams: 'Barcelona vs Madrid', sport: 'Soccer' },
        { id: '4', teams: 'Celtics vs Heat', sport: 'NBA' },
        { id: '5', teams: 'Cowboys vs Giants', sport: 'NFL' },
        { id: '6', teams: 'Liverpool vs Arsenal', sport: 'Soccer' },
        { id: '7', teams: 'Nuggets vs Suns', sport: 'NBA' },
        { id: '8', teams: 'Rams vs 49ers', sport: 'NFL' },
        { id: '9', teams: 'PSG vs Bayern', sport: 'Soccer' },
        { id: '10', teams: 'Bucks vs Nets', sport: 'NBA' },
        { id: '11', teams: 'Eagles vs Packers', sport: 'NFL' },
        { id: '12', teams: 'City vs United', sport: 'Soccer' },
        { id: '13', teams: 'Clippers vs Kings', sport: 'NBA' },
        { id: '14', teams: 'Ravens vs Steelers', sport: 'NFL' },
        { id: '15', teams: 'Juventus vs Milan', sport: 'Soccer' }
      ];

      return games.map(game => {
        const volume = Math.random() * 1000000;
        const intensity = Math.random() * 100;
        const movement = ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable';
        
        let color;
        if (intensity > 80) color = '#ef4444'; // Red - Hot
        else if (intensity > 60) color = '#f97316'; // Orange - Warm
        else if (intensity > 40) color = '#eab308'; // Yellow - Moderate
        else if (intensity > 20) color = '#22c55e'; // Green - Cool
        else color = '#3b82f6'; // Blue - Cold

        const temperature = intensity > 80 ? 'blazing' : 
                          intensity > 60 ? 'hot' : 
                          intensity > 40 ? 'warm' : 'cold';

        return {
          id: game.id,
          game: game.teams,
          intensity,
          volume,
          movement,
          color,
          data: {
            gameId: game.id,
            teams: game.teams,
            sport: game.sport,
            betVolume: volume,
            oddsMoves: Math.random() * 50,
            publicPercentage: Math.random() * 100,
            sharpMoney: Math.random() * 100000,
            temperature,
            trend: movement,
            timeLeft: `${Math.floor(Math.random() * 12) + 1}h ${Math.floor(Math.random() * 60)}m`
          }
        };
      });
    };

    setHeatmapData(generateHeatmapData());
    
    // Update data every 30 seconds for real-time effect
    const interval = setInterval(() => {
      setHeatmapData(generateHeatmapData());
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedTimeframe, selectedSport]);

  const getIntensityLabel = (intensity: number) => {
    if (intensity > 80) return { label: 'BLAZING', icon: '🔥🔥🔥' };
    if (intensity > 60) return { label: 'HOT', icon: '🔥🔥' };
    if (intensity > 40) return { label: 'WARM', icon: '🔥' };
    if (intensity > 20) return { label: 'COOL', icon: '❄️' };
    return { label: 'COLD', icon: '🧊' };
  };

  const getTrendIcon = (movement: string) => {
    switch (movement) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredData = selectedSport === 'all' 
    ? heatmapData 
    : heatmapData.filter(cell => cell.data.sport.toLowerCase() === selectedSport);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">
              Live Betting Heatmap 🔥
            </h1>
            <p className="text-gray-300 text-lg">Real-time betting activity and market movements</p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <div className="flex bg-slate-800 rounded-lg p-1">
              {(['1h', '4h', '24h'] as const).map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={selectedTimeframe === timeframe ? "bg-blue-600 text-white" : "text-gray-300"}
                >
                  {timeframe}
                </Button>
              ))}
            </div>

            <div className="flex bg-slate-800 rounded-lg p-1">
              {(['all', 'nfl', 'nba', 'soccer'] as const).map((sport) => (
                <Button
                  key={sport}
                  variant={selectedSport === sport ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedSport(sport)}
                  className={selectedSport === sport ? "bg-blue-600 text-white" : "text-gray-300"}
                >
                  {sport.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-slate-800 p-3 rounded-lg text-center">
              <div className="w-6 h-6 bg-blue-500 rounded mx-auto mb-2"></div>
              <div className="text-white text-sm font-medium">Cold</div>
              <div className="text-gray-400 text-xs">0-20%</div>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg text-center">
              <div className="w-6 h-6 bg-green-500 rounded mx-auto mb-2"></div>
              <div className="text-white text-sm font-medium">Cool</div>
              <div className="text-gray-400 text-xs">21-40%</div>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg text-center">
              <div className="w-6 h-6 bg-yellow-500 rounded mx-auto mb-2"></div>
              <div className="text-white text-sm font-medium">Warm</div>
              <div className="text-gray-400 text-xs">41-60%</div>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg text-center">
              <div className="w-6 h-6 bg-orange-500 rounded mx-auto mb-2"></div>
              <div className="text-white text-sm font-medium">Hot</div>
              <div className="text-gray-400 text-xs">61-80%</div>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg text-center">
              <div className="w-6 h-6 bg-red-500 rounded mx-auto mb-2"></div>
              <div className="text-white text-sm font-medium">Blazing</div>
              <div className="text-gray-400 text-xs">81-100%</div>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-2 mb-8">
          {filteredData.map((cell) => {
            const intensityInfo = getIntensityLabel(cell.intensity);
            return (
              <div
                key={cell.id}
                className="aspect-square relative cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
                style={{
                  backgroundColor: cell.color,
                  opacity: 0.8 + (cell.intensity / 100) * 0.2
                }}
                onClick={() => setSelectedCell(cell)}
              >
                <div className="absolute inset-0 p-2 flex flex-col justify-between text-white">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold">{cell.data.sport}</span>
                    {getTrendIcon(cell.movement)}
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs font-medium mb-1">
                      {cell.game.split(' vs ')[0]}
                    </div>
                    <div className="text-xs opacity-90">vs</div>
                    <div className="text-xs font-medium">
                      {cell.game.split(' vs ')[1]}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg">{intensityInfo.icon}</div>
                    <div className="text-xs font-bold">{Math.round(cell.intensity)}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Cell Details */}
        {selectedCell && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-white flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: selectedCell.color }}
                  ></div>
                  <span>{selectedCell.game}</span>
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedCell(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary">{selectedCell.data.sport}</Badge>
                <div className="flex items-center text-gray-300">
                  {getTrendIcon(selectedCell.movement)}
                  <span className="ml-1 text-sm">
                    {selectedCell.movement === 'up' ? 'Rising' : 
                     selectedCell.movement === 'down' ? 'Falling' : 'Stable'}
                  </span>
                </div>
                <div className="text-gray-300 text-sm">
                  Starts in {selectedCell.data.timeLeft}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300 text-sm">Bet Volume</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(selectedCell.data.betVolume)}
                  </div>
                  <div className="text-xs text-gray-400">Last {selectedTimeframe}</div>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300 text-sm">Odds Movement</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {selectedCell.data.oddsMoves.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">Price changes</div>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300 text-sm">Public %</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {selectedCell.data.publicPercentage.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">Public backing</div>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300 text-sm">Sharp Money</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(selectedCell.data.sharpMoney)}
                  </div>
                  <div className="text-xs text-gray-400">Professional bets</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-lg">
                      {getIntensityLabel(selectedCell.intensity).icon}
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        {getIntensityLabel(selectedCell.intensity).label} Activity
                      </div>
                      <div className="text-gray-400 text-sm">
                        {Math.round(selectedCell.intensity)}% betting intensity
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-x-3">
                    <Button variant="outline" size="sm" className="text-white border-slate-600">
                      <Eye className="w-4 h-4 mr-2" />
                      Watch Game
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Place Bet
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {formatCurrency(filteredData.reduce((sum, cell) => sum + cell.data.betVolume, 0))}
              </div>
              <div className="text-gray-400 text-sm">Total Volume ({selectedTimeframe})</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {filteredData.filter(cell => cell.intensity > 60).length}
              </div>
              <div className="text-gray-400 text-sm">Hot Games</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {filteredData.filter(cell => cell.movement === 'up').length}
              </div>
              <div className="text-gray-400 text-sm">Rising Lines</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}