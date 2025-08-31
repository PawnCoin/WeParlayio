export interface Team {
  name: string;
  logo?: string;
  abbreviation?: string;
}

export interface TickerOdds {
  id: string;
  sport: string;
  teams: string;
  homeTeam: Team;
  awayTeam: Team;
  gameState: 'live' | 'upcoming' | 'final';
  odds?: {
    details: string;
    overUnder?: string;
  };
  timestamp: string;
  eventId: string;
  status: string;
  hasLiveScore: boolean;
  liveScore?: {
    homeScore: number;
    awayScore: number;
    period: string;
    timeRemaining: string;
    isBreaking: boolean;
  };
}