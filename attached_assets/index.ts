export interface Sport {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
}

export interface LiveGame {
  id: string;
  sportId: string;
  title: string;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  };
  startTime: string;
  status: 'live' | 'scheduled' | 'completed';
  streamUrl?: string;
  thumbnailUrl?: string;
  leagueName?: string;
  period?: string;
  timeRemaining?: string;
  odds?: {
    homeWin: number;
    awayWin: number;
    draw?: number;
  };
  isEsport: boolean;
}

export interface LiveSportsState {
  sports: Sport[];
  games: LiveGame[];
  selectedSport: Sport | null;
  selectedGame: LiveGame | null;
  loading: boolean;
  error: string | null;
  setSelectedSport: (sport: Sport | null) => void;
  setSelectedGame: (game: LiveGame | null) => void;
  updateGames: (games: LiveGame[]) => void;
  updateGameScore: (gameId: string, homeScore: number, awayScore: number) => void;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}