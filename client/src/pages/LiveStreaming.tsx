import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Users, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LiveGame {
  id: string;
  title: string;
  homeTeam: {
    name: string;
    score: number;
    logo: string;
  };
  awayTeam: {
    name: string;
    score: number;
    logo: string;
  };
  sport: string;
  league: string;
  status: 'live' | 'scheduled' | 'completed';
  startTime: string;
  streamUrl: string;
  odds: {
    homeWin: number;
    awayWin: number;
  };
  viewers: number;
  period: string;
  timeRemaining: string;
}

export default function LiveStreaming() {
  const [selectedGame, setSelectedGame] = useState<LiveGame | null>(null);
  const [betAmount, setBetAmount] = useState('10');
  const [selectedBet, setSelectedBet] = useState<'home' | 'away' | null>(null);

  const { data: liveGames = [], isLoading } = useQuery<LiveGame[]>({
    queryKey: ['/api/live-games'],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (liveGames.length > 0 && !selectedGame) {
      setSelectedGame(liveGames[0]);
    }
  }, [liveGames, selectedGame]);

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const calculatePayout = (odds: number, amount: number) => {
    if (odds > 0) {
      return (amount * (odds / 100)) + amount;
    } else {
      return (amount * (100 / Math.abs(odds))) + amount;
    }
  };

  const placeBet = () => {
    if (!selectedGame || !selectedBet || !betAmount) return;
    
    const odds = selectedBet === 'home' ? selectedGame.odds.homeWin : selectedGame.odds.awayWin;
    const payout = calculatePayout(odds, parseFloat(betAmount));
    
    console.log('Placing bet:', {
      game: selectedGame.title,
      team: selectedBet === 'home' ? selectedGame.homeTeam.name : selectedGame.awayTeam.name,
      amount: betAmount,
      odds: formatOdds(odds),
      potentialPayout: payout.toFixed(2)
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading live games...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex h-screen">
        {/* Left Sidebar - Live Games List */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold">Live Games</h2>
            </div>
            <p className="text-sm text-gray-400">Watch live games and place bets in real-time</p>
          </div>
          
          <div className="p-2">
            {liveGames.map((game) => (
              <Card 
                key={game.id}
                className={`mb-2 cursor-pointer transition-all ${
                  selectedGame?.id === game.id 
                    ? 'bg-blue-600 border-blue-500' 
                    : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                }`}
                onClick={() => setSelectedGame(game)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="destructive" className="bg-red-600">
                      LIVE
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-300">
                      <Users className="w-3 h-3" />
                      {game.viewers.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img 
                          src={game.homeTeam.logo} 
                          alt={game.homeTeam.name}
                          className="w-6 h-6 rounded"
                        />
                        <span className="text-sm font-medium">{game.homeTeam.name}</span>
                      </div>
                      <span className="text-lg font-bold">{game.homeTeam.score}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img 
                          src={game.awayTeam.logo} 
                          alt={game.awayTeam.name}
                          className="w-6 h-6 rounded"
                        />
                        <span className="text-sm font-medium">{game.awayTeam.name}</span>
                      </div>
                      <span className="text-lg font-bold">{game.awayTeam.score}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-600">
                    <span className="text-xs text-gray-400">{game.period} • {game.league}</span>
                    <span className="text-xs text-gray-400">{game.sport}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Center - Video Player */}
        <div className="flex-1 bg-black flex flex-col">
          {selectedGame ? (
            <>
              <div className="flex-1 relative">
                <iframe
                  src={selectedGame.streamUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  title={selectedGame.title}
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-black/70 px-3 py-2 rounded">
                    <Wifi className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">Live</span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-black/70 px-3 py-2 rounded">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{selectedGame.viewers.toLocaleString()} viewers</span>
                  </div>
                </div>
              </div>
              
              {/* Game Info Bar */}
              <div className="bg-gray-800 p-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{selectedGame.title}</h3>
                    <p className="text-sm text-gray-400">{selectedGame.league} • {selectedGame.sport}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedGame.homeTeam.score}</div>
                      <div className="text-sm text-gray-400">{selectedGame.homeTeam.name}</div>
                    </div>
                    <div className="text-gray-500">-</div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedGame.awayTeam.score}</div>
                      <div className="text-sm text-gray-400">{selectedGame.awayTeam.name}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-bold mb-2">Select a Live Game</h3>
                <p className="text-gray-400">Choose a game from the sidebar to start watching</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Betting Interface */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold mb-2">Live Betting Odds</h2>
            {selectedGame && (
              <p className="text-sm text-gray-400">{selectedGame.title}</p>
            )}
          </div>
          
          {selectedGame ? (
            <div className="p-4 space-y-4">
              {/* Betting Options */}
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-center text-white">Match Winner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant={selectedBet === 'home' ? 'default' : 'outline'}
                    className={`w-full justify-between ${
                      selectedBet === 'home' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'border-gray-500 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedBet('home')}
                  >
                    <span>{selectedGame.homeTeam.name}</span>
                    <span className="font-bold">{formatOdds(selectedGame.odds.homeWin)}</span>
                  </Button>
                  
                  <Button
                    variant={selectedBet === 'away' ? 'default' : 'outline'}
                    className={`w-full justify-between ${
                      selectedBet === 'away' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'border-gray-500 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedBet('away')}
                  >
                    <span>{selectedGame.awayTeam.name}</span>
                    <span className="font-bold">{formatOdds(selectedGame.odds.awayWin)}</span>
                  </Button>
                </CardContent>
              </Card>

              {/* Bet Slip */}
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-center text-white">Bet Slip</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Balance: $0.00</label>
                  </div>
                  
                  {selectedBet && (
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="font-medium">
                          {selectedBet === 'home' ? selectedGame.homeTeam.name : selectedGame.awayTeam.name}
                        </div>
                        <div className="text-gray-400">
                          Odds: {formatOdds(selectedBet === 'home' ? selectedGame.odds.homeWin : selectedGame.odds.awayWin)}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Stake:</label>
                        <input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span>Potential Win:</span>
                          <span className="font-bold">
                            ${betAmount ? (calculatePayout(
                              selectedBet === 'home' ? selectedGame.odds.homeWin : selectedGame.odds.awayWin,
                              parseFloat(betAmount)
                            ) - parseFloat(betAmount)).toFixed(2) : '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total Payout:</span>
                          <span>
                            ${betAmount ? calculatePayout(
                              selectedBet === 'home' ? selectedGame.odds.homeWin : selectedGame.odds.awayWin,
                              parseFloat(betAmount)
                            ).toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={placeBet}
                        disabled={!betAmount || parseFloat(betAmount) <= 0}
                      >
                        Place Bet - ${betAmount || '0'}
                      </Button>
                    </div>
                  )}
                  
                  {!selectedBet && (
                    <div className="text-center text-gray-400 py-4">
                      Select a betting option to continue
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              Select a game to view betting options
            </div>
          )}
        </div>
      </div>
    </div>
  );
}