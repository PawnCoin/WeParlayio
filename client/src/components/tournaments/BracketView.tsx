import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import sportsBetAPI from "@/lib/sportsBetAPI";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Play, Share2 } from "lucide-react";
import { getTeamLogoPath } from "@/assets/teams/team-logos";
import { getSportIconPath } from "@/assets/sports/sports-icons";

interface BracketViewProps {
  tournamentId: number;
}

const BracketView: React.FC<BracketViewProps> = ({ tournamentId }) => {
  const { toast } = useToast();
  const [bracketData, setBracketData] = useState<any | null>(null);

  const { data: tournament, isLoading } = useQuery({
    queryKey: [`/api/tournaments/${tournamentId}`],
    queryFn: () => sportsBetAPI.getTournament(tournamentId),
  });

  useEffect(() => {
    // Set a default bracket structure initially
    const defaultBracketStructure = {
      rounds: [
        {
          name: "First Round",
          matches: [
            {
              id: 1,
              team1: { id: 1, name: "Boston Celtics", seed: 1, score: 4, winner: true },
              team2: { id: 8, name: "Atlanta Hawks", seed: 8, score: 1, winner: false }
            },
            {
              id: 2,
              team1: { id: 4, name: "Cleveland Cavaliers", seed: 4, score: 4, winner: true },
              team2: { id: 5, name: "New York Knicks", seed: 5, score: 1, winner: false }
            },
            {
              id: 3,
              team1: { id: 3, name: "Milwaukee Bucks", seed: 3, score: 4, winner: true },
              team2: { id: 6, name: "Miami Heat", seed: 6, score: 1, winner: false }
            },
            {
              id: 4,
              team1: { id: 2, name: "Philadelphia 76ers", seed: 2, score: 2, winner: false },
              team2: { id: 7, name: "Brooklyn Nets", seed: 7, score: 4, winner: true }
            }
          ]
        },
        {
          name: "Second Round",
          matches: [
            {
              id: 5,
              team1: { id: 1, name: "Boston Celtics", seed: 1, score: 4, winner: true },
              team2: { id: 4, name: "Cleveland Cavaliers", seed: 4, score: 1, winner: false }
            },
            {
              id: 6,
              team1: { id: 3, name: "Milwaukee Bucks", seed: 3, score: 4, winner: true },
              team2: { id: 7, name: "Brooklyn Nets", seed: 7, score: 2, winner: false }
            }
          ]
        },
        {
          name: "Conference Finals",
          matches: [
            {
              id: 7,
              team1: { id: 1, name: "Boston Celtics", seed: 1, score: 4, winner: true },
              team2: { id: 3, name: "Milwaukee Bucks", seed: 3, score: 3, winner: false }
            }
          ]
        },
        {
          name: "Championship",
          matches: [
            {
              id: 8,
              team1: { id: 1, name: "Boston Celtics", seed: 1, score: null, winner: null },
              team2: { id: null, name: "Western Champion", seed: null, score: null, winner: null }
            }
          ]
        }
      ],
      champion: { id: 1, name: "Boston Celtics" }
    };

    // Initialize bracket data with defaults first to ensure we have data even before API responds
    if (!bracketData) {
      setBracketData(defaultBracketStructure);
    }

    // Update with actual tournament data if available
    if (tournament && tournament.bracketData && Object.keys(tournament.bracketData).length > 0) {
      setBracketData(tournament.bracketData);
    } else if (tournament) {
      // If tournament exists but no bracketData, use default structure
      setBracketData(defaultBracketStructure);
    }
  }, [tournament, bracketData]);

  const handleCreatePool = () => {
    toast({
      title: "Bracket Pool Created",
      description: "Your bracket pool has been created successfully.",
    });
  };

  const handleShareBracket = () => {
    // In a real app, this would generate a shareable link or display a share dialog
    toast({
      title: "Bracket Link Copied",
      description: "Link to this bracket has been copied to clipboard",
    });
  };

  const renderMatch = (match: any, roundIndex: number) => {
    return (
      <div key={match.id} className="tournament-bracket-item bg-white dark:bg-neutral-dark border border-gray-200 dark:border-gray-700 rounded-md p-2 mb-4 relative">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className={`w-5 h-5 ${match.team1.winner === true ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} rounded-full flex items-center justify-center text-xs mr-2`}>
              {match.team1.seed || '-'}
            </span>
            <span className={`text-sm ${match.team1.winner === true ? 'font-medium' : ''}`}>
              {match.team1.name}
            </span>
          </div>
          <span className="font-bold text-sm">{match.team1.score !== null ? match.team1.score : '-'}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className={`w-5 h-5 ${match.team2.winner === true ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} rounded-full flex items-center justify-center text-xs mr-2`}>
              {match.team2.seed || '-'}
            </span>
            <span className={`text-sm ${match.team2.winner === true ? 'font-medium' : ''}`}>
              {match.team2.name}
            </span>
          </div>
          <span className="font-bold text-sm">{match.team2.score !== null ? match.team2.score : '-'}</span>
        </div>
      </div>
    );
  };

  if (isLoading || !bracketData) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between mb-4">
            <Skeleton className="h-10 w-[180px]" />
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2">
                <img 
                  src={getSportIconPath('basketball')} 
                  alt="Basketball" 
                  className="w-5 h-5 object-contain filter brightness-0 invert"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <i className="fas fa-basketball-ball text-sm hidden"></i>
              </div>
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[900px] h-[400px] relative">
              <div className="grid grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, roundIndex) => (
                  <div key={roundIndex} className="flex flex-col justify-around">
                    {Array(Math.max(1, 4 >> roundIndex)).fill(0).map((_, matchIndex) => (
                      <Skeleton key={matchIndex} className={`h-20 mb-${matchIndex < (4 >> roundIndex) - 1 ? '4' : '0'}`} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Select defaultValue="nba-playoffs-2023">
              <SelectTrigger>
                <SelectValue placeholder="Select Tournament" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nba-playoffs-2023">NBA Playoffs 2023</SelectItem>
                <SelectItem value="ncaa-tournament-2023">NCAA Tournament 2023</SelectItem>
                <SelectItem value="fiba-world-cup-2023">FIBA World Cup 2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2">
              <img 
                src={getSportIconPath('basketball')} 
                alt="Basketball" 
                className="w-5 h-5 object-contain filter brightness-0 invert"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <i className="fas fa-basketball-ball text-sm hidden"></i>
            </div>
            <Button onClick={handleCreatePool} className="flex items-center gap-2">
              <Play className="h-4 w-4" /> Create Bracket Pool
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={handleShareBracket}>
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>
        </div>

        {/* Tournament Bracket Visualization */}
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[900px] h-[400px] relative">
            {/* Bracket Structure */}
            <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-cols-4 gap-4">
              {/* Render each round */}
              {bracketData.rounds.map((round: any, roundIndex: number) => (
                <div 
                  key={roundIndex} 
                  className={`flex flex-col justify-around ${
                    roundIndex === 1 ? "pt-10 pb-10" :
                    roundIndex === 2 ? "justify-center" :
                    roundIndex === 3 ? "justify-center items-center" : ""
                  }`}
                >
                  {round.matches.map((match: any) => renderMatch(match, roundIndex))}

                  {/* Championship circle for the final round */}
                  {roundIndex === 3 && bracketData.champion && (
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mt-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Champion</div>
                        <div className="font-bold text-primary">{bracketData.champion.name}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Connecting Lines - These would be more dynamic in a real app */}
              <div className="tournament-bracket-line absolute" style={{ top: '50px', left: '200px', width: '50px', height: '2px', backgroundColor: '#e5e7eb' }}></div>
              <div className="tournament-bracket-line absolute" style={{ top: '50px', left: '200px', width: '2px', height: '100px', backgroundColor: '#e5e7eb' }}></div>
              <div className="tournament-bracket-line absolute" style={{ top: '150px', left: '200px', width: '50px', height: '2px', backgroundColor: '#e5e7eb' }}></div>

              <div className="tournament-bracket-line absolute" style={{ top: '250px', left: '200px', width: '50px', height: '2px', backgroundColor: '#e5e7eb' }}></div>
              <div className="tournament-bracket-line absolute" style={{ top: '250px', left: '200px', width: '2px', height: '100px', backgroundColor: '#e5e7eb' }}></div>
              <div className="tournament-bracket-line absolute" style={{ top: '350px', left: '200px', width: '50px', height: '2px', backgroundColor: '#e5e7eb' }}></div>

              <div className="tournament-bracket-line absolute" style={{ top: '100px', left: '450px', width: '50px', height: '2px', backgroundColor: '#e5e7eb' }}></div>
              <div className="tournament-bracket-line absolute" style={{ top: '100px', left: '450px', width: '2px', height: '200px', backgroundColor: '#e5e7eb' }}></div>
              <div className="tournament-bracket-line absolute" style={{ top: '300px', left: '450px', width: '50px', height: '2px', backgroundColor: '#e5e7eb' }}></div>

              <div className="tournament-bracket-line absolute" style={{ top: '200px', left: '680px', width: '70px', height: '2px', backgroundColor: '#e5e7eb' }}></div>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="font-medium mb-2">Bracket Betting</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Eastern Conference Winner</div>
              <div className="flex justify-between">
                <span className="font-medium">Celtics</span>
                <span className="text-primary font-medium">-120</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Western Conference Winner</div>
              <div className="flex justify-between">
                <span className="font-medium">Warriors</span>
                <span className="text-primary font-medium">+150</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Championship Winner</div>
              <div className="flex justify-between">
                <span className="font-medium">Celtics</span>
                <span className="text-primary font-medium">+175</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Finals MVP</div>
              <div className="flex justify-between">
                <span className="font-medium">J. Tatum</span>
                <span className="text-primary font-medium">+200</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BracketView;