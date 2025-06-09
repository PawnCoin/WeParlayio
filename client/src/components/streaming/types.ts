export interface StreamingGame {
  id: string;
  title: string;
  homeTeam: {
    name: string;
    score: number;
    logo?: string;
  };
  awayTeam: {
    name: string;
    score: number;
    logo?: string;
  };
  sport: string;
  league: string;
  status: 'live' | 'upcoming' | 'finished';
  startTime: string;
  streamUrl: string;
  odds: {
    homeWin: number;
    awayWin: number;
    draw?: number;
  };
  viewers: number;
  period: string;
  timeRemaining: string;
}

export interface BetSlip {
  gameId: string;
  betType: BetType;
  odds: number;
  amount: number;
  potentialWin: number;
}

export type BetType = 'home_win' | 'away_win' | 'draw';

export type StreamType = 'youtube' | 'twitch' | 'hls' | 'mp4';

export interface VideoPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  hasError: boolean;
  isLoading: boolean;
}

export interface StreamingError {
  type: 'network' | 'media' | 'security' | 'unknown';
  message: string;
  recoverable: boolean;
}