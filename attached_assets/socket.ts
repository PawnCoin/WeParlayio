import { io, Socket } from 'socket.io-client';
import useLiveSportsStore from '../store/liveSportsStore';
import { LiveGame } from '../types';

// This would be your actual WebSocket server URL in production
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3001';

// For development, we'll simulate WebSocket events
const USE_MOCK_SOCKET = true;

class LiveSportsSocket {
  private socket: Socket | null = null;
  private mockInterval: number | null = null;

  connect(): void {
    if (USE_MOCK_SOCKET) {
      this.startMockUpdates();
      console.log('Mock socket connected');
      return;
    }

    this.socket = io(SOCKET_URL);
    
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('liveScore', (data: { gameId: string; homeScore: number; awayScore: number }) => {
      const { gameId, homeScore, awayScore } = data;
      useLiveSportsStore.getState().updateGameScore(gameId, homeScore, awayScore);
    });

    this.socket.on('gameUpdate', (updatedGame: LiveGame) => {
      const currentGames = useLiveSportsStore.getState().games;
      const updatedGames = currentGames.map(game => 
        game.id === updatedGame.id ? updatedGame : game
      );
      useLiveSportsStore.getState().updateGames(updatedGames);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  }

  disconnect(): void {
    if (USE_MOCK_SOCKET) {
      if (this.mockInterval) {
        window.clearInterval(this.mockInterval);
        this.mockInterval = null;
      }
      console.log('Mock socket disconnected');
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // For development - simulate WebSocket updates with random score changes
  private startMockUpdates(): void {
    this.mockInterval = window.setInterval(() => {
      const { games } = useLiveSportsStore.getState();
      if (games.length === 0) return;
      
      // Randomly select a game to update
      const randomIndex = Math.floor(Math.random() * games.length);
      const gameToUpdate = games[randomIndex];
      
      // Randomly decide whether to update home or away score
      const updateHome = Math.random() > 0.5;
      const homeScore = updateHome 
        ? (gameToUpdate.homeTeam.score || 0) + 1 
        : (gameToUpdate.homeTeam.score || 0);
      const awayScore = !updateHome 
        ? (gameToUpdate.awayTeam.score || 0) + 1 
        : (gameToUpdate.awayTeam.score || 0);
      
      useLiveSportsStore.getState().updateGameScore(
        gameToUpdate.id, 
        homeScore, 
        awayScore
      );
    }, 10000); // Update every 10 seconds
  }
}

export default new LiveSportsSocket();