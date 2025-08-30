import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { AssetManager } from '@/lib/assetManager';
import { Clock, Wifi, Trophy, Eye, Filter } from 'lucide-react';

interface LiveScore {
  eventId: string;
  sport: string;
  teams: string;
  homeScore: number;
  awayScore: number;
  period: string;
  timeRemaining: string;
  lastUpdate: string;
  isBreaking?: boolean;
}

const LiveScoresDisplay: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  
  // Fetch live scores every 30 seconds
  const { data: liveScores, isLoading, error } = useQuery({
    queryKey: ['/api/events/live-scores'],
    refetchInterval: 30000, // 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });

  const scores = (liveScores as LiveScore[]) || [];

  // Parse team names from "Team A vs Team B" format
  const parseTeams = (teamsString: string) => {
    const parts = teamsString.split(' vs ');
    return {
      awayTeam: parts[0]?.trim() || 'Away',
      homeTeam: parts[1]?.trim() || 'Home'
    };
  };

  // Get sport filter options
  const availableSports = Array.from(new Set(scores.map(score => score.sport))).sort();

  // Filter scores by selected sport
  const filteredScores = selectedSport === 'ALL' 
    ? scores 
    : scores.filter(score => score.sport === selectedSport);

  // Group scores by sport for better organization
  const scoresBySport = filteredScores.reduce((acc, score) => {
    if (!acc[score.sport]) acc[score.sport] = [];
    acc[score.sport].push(score);
    return acc;
  }, {} as Record<string, LiveScore[]>);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 animate-pulse" />
            Loading Live Scores...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !scores.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Live Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            {error ? 'Failed to load live scores' : 'No live games at the moment'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span>Live Scores</span>
              <Badge variant="secondary">{filteredScores.length}</Badge>
            </div>
          </CardTitle>
          
          {/* Sport Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <select 
              value={selectedSport} 
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-3 py-1 text-sm border rounded-md bg-background"
            >
              <option value="ALL">All Sports ({scores.length})</option>
              {availableSports.map(sport => (
                <option key={sport} value={sport}>
                  {sport} ({scores.filter(s => s.sport === sport).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {Object.entries(scoresBySport).map(([sport, sportScores]) => (
          <div key={sport} className="space-y-3">
            {/* Sport Header */}
            <div className="flex items-center gap-2 border-b pb-2">
              <span className="text-lg font-semibold">{sport}</span>
              <Badge variant="outline">{sportScores.length} games</Badge>
            </div>
            
            {/* Games for this sport */}
            <div className="grid gap-3">
              {sportScores.map((score) => {
                const { awayTeam, homeTeam } = parseTeams(score.teams);
                const sportMapping: Record<string, string> = {
                  'NCAAF': 'ncaaf',
                  'NCAAB': 'ncaab',
                  'NFL': 'nfl',
                  'NBA': 'nba',
                  'MLB': 'mlb',
                  'NHL': 'nhl',
                  'Soccer': 'soccer'
                };
                const leagueCode = sportMapping[score.sport] || score.sport.toLowerCase();
                
                return (
                  <div 
                    key={score.eventId}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      score.isBreaking ? 'border-red-500 bg-red-50 dark:bg-red-950' : 'border-gray-200'
                    }`}
                  >
                    {/* Breaking News Badge */}
                    {score.isBreaking && (
                      <div className="flex items-center gap-1 mb-2">
                        <Badge variant="destructive" className="animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                          BREAKING
                        </Badge>
                      </div>
                    )}
                    
                    {/* Game Content */}
                    <div className="grid grid-cols-3 items-center gap-4">
                      {/* Away Team */}
                      <div className="flex items-center gap-3">
                        <img 
                          src={AssetManager.getTeamLogo(awayTeam, leagueCode)}
                          alt={`${awayTeam} logo`}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = AssetManager.generateTeamInitialsLogo(awayTeam, leagueCode);
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm truncate">{awayTeam}</span>
                          <span className="text-2xl font-bold text-blue-600">{score.awayScore}</span>
                        </div>
                      </div>
                      
                      {/* Game Status */}
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">
                          {score.period}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          {score.timeRemaining}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(score.lastUpdate).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      {/* Home Team */}
                      <div className="flex items-center gap-3 justify-end">
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-sm truncate">{homeTeam}</span>
                          <span className="text-2xl font-bold text-green-600">{score.homeScore}</span>
                        </div>
                        <img 
                          src={AssetManager.getTeamLogo(homeTeam, leagueCode)}
                          alt={`${homeTeam} logo`}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = AssetManager.generateTeamInitialsLogo(homeTeam, leagueCode);
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>ESPN API</span>
                        <span>•</span>
                        <span>Live</span>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LiveScoresDisplay;