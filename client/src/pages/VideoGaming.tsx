import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import VideoGameBetting from '@/components/gaming/VideoGameBetting';
import BettingChallenges from '@/components/betting/BettingChallenges';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Settings, 
  TrendingUp, 
  BarChart2,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VideoGaming: React.FC = () => {
  const { toast } = useToast();
  const [useFakeMoney, setUseFakeMoney] = useState(true);

  // Toggle between real money and virtual WeParlay Cash
  const handleCurrencyToggle = (checked: boolean) => {
    setUseFakeMoney(checked);
    
    toast({
      title: checked ? "Using WeParlay Cash" : "Using Real Money",
      description: checked 
        ? "You've switched to betting with virtual WeParlay Cash" 
        : "You've switched to betting with real money and crypto",
      variant: checked ? "default" : "destructive",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Gamepad2 className="mr-2 h-8 w-8" />
            Video Game Betting
          </h1>
          <p className="text-muted-foreground">
            Create custom bets on any game, any matchup
          </p>
        </div>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="create" className="flex items-center gap-1">
            <Gamepad2 className="h-4 w-4" /> Create Bet
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-1">
            <Users className="h-4 w-4" /> Bet Challenges
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-1">
            <Trophy className="h-4 w-4" /> Leaderboard
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <VideoGameBetting />
        </TabsContent>
        
        <TabsContent value="challenges">
          <BettingChallenges />
        </TabsContent>
        
        <TabsContent value="leaderboard">
          <div className="bg-card rounded-lg shadow border border-muted p-6">
            <div className="flex items-center mb-6">
              <Trophy className="h-6 w-6 mr-3 text-yellow-500" />
              <h2 className="text-2xl font-bold">Video Game Betting Leaderboard</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="py-3 px-2 text-left">Rank</th>
                    <th className="py-3 px-2 text-left">Player</th>
                    <th className="py-3 px-2 text-left">Win Rate</th>
                    <th className="py-3 px-2 text-left">Profit</th>
                    <th className="py-3 px-2 text-left">Top Game</th>
                    <th className="py-3 px-2 text-left">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { rank: 1, name: "ProGamer123", winRate: "68%", profit: "+12,450", game: "League of Legends", level: 42 },
                    { rank: 2, name: "CryptoKing", winRate: "62%", profit: "+10,820", game: "CS:GO", level: 38 },
                    { rank: 3, name: "GameQueen", winRate: "59%", profit: "+8,740", game: "Valorant", level: 35 },
                    { rank: 4, name: "Ninja2099", winRate: "57%", profit: "+7,320", game: "Fortnite", level: 33 },
                    { rank: 5, name: "BetMaster", winRate: "55%", profit: "+6,450", game: "Dota 2", level: 29 },
                  ].map((player, index) => (
                    <tr key={index} className="border-b border-muted">
                      <td className="py-4 px-2">
                        {player.rank === 1 ? (
                          <div className="flex items-center">
                            <span className="text-yellow-500 font-bold">{player.rank}</span>
                            <Sparkles className="h-4 w-4 ml-1 text-yellow-500" />
                          </div>
                        ) : (
                          <span className={player.rank <= 3 ? "font-bold" : ""}>{player.rank}</span>
                        )}
                      </td>
                      <td className="py-4 px-2">{player.name}</td>
                      <td className="py-4 px-2 text-green-500">{player.winRate}</td>
                      <td className="py-4 px-2 text-green-500">{player.profit}</td>
                      <td className="py-4 px-2">{player.game}</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                            Lvl {player.level}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="font-bold">Most Popular Games</h3>
                </div>
                <ol className="space-y-2">
                  <li className="flex justify-between">
                    <span>League of Legends</span>
                    <span className="text-muted-foreground">32% of bets</span>
                  </li>
                  <li className="flex justify-between">
                    <span>CS:GO</span>
                    <span className="text-muted-foreground">24% of bets</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Valorant</span>
                    <span className="text-muted-foreground">18% of bets</span>
                  </li>
                </ol>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="font-bold">Biggest Wins</h3>
                </div>
                <ol className="space-y-2">
                  <li className="flex justify-between">
                    <span>CryptoKing</span>
                    <span className="text-green-500">+3,200 in one bet</span>
                  </li>
                  <li className="flex justify-between">
                    <span>ProGamer123</span>
                    <span className="text-green-500">+2,840 in one bet</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Ninja2099</span>
                    <span className="text-green-500">+2,150 in one bet</span>
                  </li>
                </ol>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Settings className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="font-bold">Your Stats</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Win Rate:</span>
                    <span className="text-green-500">52%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Bets:</span>
                    <span>24</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rank:</span>
                    <span>#156</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">View Detailed Stats</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoGaming;