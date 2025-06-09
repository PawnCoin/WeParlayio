// Streaming component type definitions
export interface StreamingGame {
  readonly id: string;
  readonly title: string;
  readonly homeTeam: TeamInfo;
  readonly awayTeam: TeamInfo;
  readonly sport: string;
  readonly league: string;
  readonly status: GameStatus;
  readonly startTime: string;
  readonly streamUrl: string;
  readonly odds: GameOdds;
  readonly viewers: number;
  readonly period: string;
  readonly timeRemaining: string;
}

export interface TeamInfo {
  readonly name: string;
  readonly score: number;
  readonly logo?: string;
}

export interface GameOdds {
  readonly homeWin: number;
  readonly awayWin: number;
  readonly draw?: number;
}

export interface BetSlip {
  readonly gameId: string;
  readonly betType: BetType;
  readonly odds: number;
  readonly amount: number;
  readonly potentialWin: number;
}

export type GameStatus = 'live' | 'upcoming' | 'finished';
export type BetType = 'home_win' | 'away_win' | 'draw';
export type StreamType = 'youtube' | 'twitch' | 'hls' | 'mp4';

export interface VideoPlayerState {
  readonly isPlaying: boolean;
  readonly isMuted: boolean;
  readonly isFullscreen: boolean;
  readonly hasError: boolean;
  readonly isLoading: boolean;
}

export interface StreamingError {
  readonly type: 'network' | 'media' | 'permission' | 'unknown';
  readonly message: string;
  readonly recoverable: boolean;
}