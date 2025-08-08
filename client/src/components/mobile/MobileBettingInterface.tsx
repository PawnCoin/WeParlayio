import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus,
  DollarSign,
  Clock,
  Target,
  Zap,
  Star
} from 'lucide-react';

interface MobileBettingInterfaceProps {
  odds: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeOdds: number;
    awayOdds: number;
    isLive?: boolean;
    sport: string;
  }[];
}

export function MobileBettingInterface({ odds }: MobileBettingInterfaceProps) {
  const [selectedBets, setSelectedBets] = useState<string[]>([]);
  const [betAmounts, setBetAmounts] = useState<Record<string, string>>({});
  const { addToBetSlip } = useBetSlip();
  const { toast } = useToast();

  const quickAmounts = [5, 10, 25, 50, 100];

  const handleOddsSelect = (oddsId: string, team: string, oddsValue: number, matchup: string) => {
    const betId = `${oddsId}-${team}`;
    
    if (selectedBets.includes(betId)) {
      setSelectedBets(prev => prev.filter(id => id !== betId));
    } else {
      setSelectedBets(prev => [...prev, betId]);
      addToBetSlip({
        id: betId,
        matchup,
        selection: team,
        odds: oddsValue,
        amount: parseFloat(betAmounts[betId] || '10')
      });
    }
  };

  const handleQuickAmount = (betId: string, amount: number) => {
    setBetAmounts(prev => ({ ...prev, [betId]: amount.toString() }));
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Badge variant="outline" className="whitespace-nowrap">All Sports</Badge>
        <Badge variant="outline" className="whitespace-nowrap">Live</Badge>
        <Badge variant="outline" className="whitespace-nowrap">Popular</Badge>
        <Badge variant="outline" className="whitespace-nowrap">NFL</Badge>
        <Badge variant="outline" className="whitespace-nowrap">NBA</Badge>
      </div>

      {/* Odds Cards */}
      <div className="space-y-3">
        {odds.map((game) => (
          <Card key={game.id} className="bg-gray-800/50 border-gray-700 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-white text-sm font-medium truncate">
                    {game.awayTeam} @ {game.homeTeam}
                  </CardTitle>
                  {game.isLive && (
                    <Badge className="bg-red-500 text-white text-xs animate-pulse">
                      <Zap className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {game.sport}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Main Betting Options */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button
                  variant={selectedBets.includes(`${game.id}-away`) ? "default" : "outline"}
                  size="sm"
                  className={`h-16 flex flex-col justify-center ${
                    selectedBets.includes(`${game.id}-away`)
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => handleOddsSelect(game.id, game.awayTeam, game.awayOdds, `${game.awayTeam} @ ${game.homeTeam}`)}
                >
                  <span className="text-xs font-medium truncate w-full">{game.awayTeam}</span>
                  <span className="text-sm font-bold flex items-center">
                    {formatOdds(game.awayOdds)}
                    {game.awayOdds > 0 ? 
                      <TrendingUp className="w-3 h-3 ml-1 text-green-400" /> :
                      <TrendingDown className="w-3 h-3 ml-1 text-red-400" />
                    }
                  </span>
                </Button>
                
                <Button
                  variant={selectedBets.includes(`${game.id}-home`) ? "default" : "outline"}
                  size="sm"
                  className={`h-16 flex flex-col justify-center ${
                    selectedBets.includes(`${game.id}-home`)
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => handleOddsSelect(game.id, game.homeTeam, game.homeOdds, `${game.awayTeam} @ ${game.homeTeam}`)}
                >
                  <span className="text-xs font-medium truncate w-full">{game.homeTeam}</span>
                  <span className="text-sm font-bold flex items-center">
                    {formatOdds(game.homeOdds)}
                    {game.homeOdds > 0 ? 
                      <TrendingUp className="w-3 h-3 ml-1 text-green-400" /> :
                      <TrendingDown className="w-3 h-3 ml-1 text-red-400" />
                    }
                  </span>
                </Button>
              </div>

              {/* Quick Bet Amount Selector */}
              {(selectedBets.includes(`${game.id}-away`) || selectedBets.includes(`${game.id}-home`)) && (
                <div className="space-y-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <DollarSign className="w-3 h-3" />
                    <span>Quick Bet Amount</span>
                  </div>
                  <div className="flex gap-1 overflow-x-auto">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs whitespace-nowrap"
                        onClick={() => handleQuickAmount(`${game.id}-${selectedBets.includes(`${game.id}-away`) ? 'away' : 'home'}`, amount)}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Custom amount"
                      className="h-8 text-sm bg-gray-800 border-gray-600"
                      value={betAmounts[`${game.id}-${selectedBets.includes(`${game.id}-away`) ? 'away' : 'home'}`] || ''}
                      onChange={(e) => setBetAmounts(prev => ({
                        ...prev,
                        [`${game.id}-${selectedBets.includes(`${game.id}-away`) ? 'away' : 'home'}`]: e.target.value
                      }))}
                    />
                    <Button size="sm" className="h-8 bg-gradient-to-r from-orange-500 to-red-600">
                      <Target className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Additional betting options */}
              <div className="flex gap-1 mt-2 overflow-x-auto">
                <Button variant="ghost" size="sm" className="text-xs text-gray-400 whitespace-nowrap">
                  O/U 45.5
                </Button>
                <Button variant="ghost" size="sm" className="text-xs text-gray-400 whitespace-nowrap">
                  +3.5 Spread
                </Button>
                <Button variant="ghost" size="sm" className="text-xs text-gray-400 whitespace-nowrap">
                  More Markets
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile Bet Slip Summary */}
      {selectedBets.length > 0 && (
        <div className="fixed bottom-16 left-4 right-4 z-40">
          <Card className="bg-gradient-to-r from-orange-500 to-red-600 border-orange-400">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1 rounded">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {selectedBets.length} Bet{selectedBets.length > 1 ? 's' : ''} Selected
                    </p>
                    <p className="text-white/80 text-xs">
                      Potential payout calculating...
                    </p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white text-orange-600 hover:bg-gray-100"
                >
                  View Slip
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default MobileBettingInterface;