// WeParlay Gaming Service - Frontend API Integration
import { apiRequest } from "@/lib/queryClient";

export interface GamingAccount {
  platform: string;
  username: string;
  status: 'connected' | 'pending' | 'error';
  accountData?: any;
}

export interface LiveGamingSession {
  platform: string;
  username: string;
  currentGame: string;
  status: string;
  stats: any;
  matchTime?: number;
}

export interface LiveStream {
  id: string;
  streamer: string;
  game: string;
  viewers: number;
  platform: 'twitch' | 'youtube';
  thumbnail?: string;
  isLive: boolean;
  odds: {
    win?: number;
    lose?: number;
    royale?: number;
    top10?: number;
  };
}

export interface GamingBet {
  id: string;
  userId: string;
  betType: string;
  amount: number;
  platform: string;
  targetUser?: string;
  gameData?: any;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  createdAt: Date;
}

export class GamingService {
  
  // Connect gaming account
  async connectGamingAccount(platform: string, username: string, userId: string): Promise<GamingAccount> {
    try {
      const response = await apiRequest('POST', `/api/gaming/connect/${platform}`, {
        username,
        userId
      });
      
      return {
        platform,
        username,
        status: 'connected',
        accountData: response.accountData
      };
    } catch (error) {
      console.error('Gaming account connection error:', error);
      throw new Error(`Failed to connect ${platform} account`);
    }
  }

  // Get live gaming sessions
  async getLiveGamingSessions(userId: string): Promise<LiveGamingSession[]> {
    try {
      const response = await apiRequest('GET', `/api/gaming/live-sessions/${userId}`);
      return response;
    } catch (error) {
      console.error('Live sessions error:', error);
      // Return demo data if API isn't available yet
      return [
        {
          platform: 'xbox',
          username: 'ProGamer123',
          currentGame: 'Call of Duty',
          status: 'In Match',
          stats: { kd: 1.8, score: 2450 },
          matchTime: 12
        },
        {
          platform: 'steam',
          username: 'ElitePlayer',
          currentGame: 'Dota 2',
          status: 'Ranked Match',
          stats: { mmr: 3450, kills: 8 },
          matchTime: 25
        }
      ];
    }
  }

  // Get live streams for betting
  async getLiveStreams(game?: string): Promise<LiveStream[]> {
    try {
      const response = await apiRequest('GET', `/api/gaming/live-streams${game ? `?game=${game}` : ''}`);
      return response;
    } catch (error) {
      console.error('Live streams error:', error);
      // Return demo data if APIs aren't configured yet
      return [
        {
          id: 'demo_1',
          streamer: 'ProGamer_Elite',
          game: 'League of Legends',
          viewers: 12847,
          platform: 'twitch',
          isLive: true,
          odds: { win: 1.85, lose: 1.95 }
        },
        {
          id: 'demo_2',
          streamer: 'EsportsKing',
          game: 'CS:GO',
          viewers: 8392,
          platform: 'youtube',
          isLive: true,
          odds: { win: 2.10, lose: 1.75 }
        },
        {
          id: 'demo_3',
          streamer: 'FortnitePro',
          game: 'Fortnite',
          viewers: 15634,
          platform: 'twitch',
          isLive: true,
          odds: { royale: 3.50, top10: 1.45 }
        }
      ];
    }
  }

  // Place gaming bet
  async placeGamingBet(betData: {
    userId: string;
    betType: string;
    amount: number;
    platform: string;
    targetUser?: string;
    gameData?: any;
  }): Promise<GamingBet> {
    try {
      const response = await apiRequest('POST', '/api/gaming/bet', betData);
      return response.bet;
    } catch (error) {
      console.error('Gaming bet error:', error);
      throw new Error('Failed to place gaming bet');
    }
  }

  // Get gaming leaderboard
  async getGamingLeaderboard(): Promise<any[]> {
    try {
      const response = await apiRequest('GET', '/api/gaming/leaderboard');
      return response;
    } catch (error) {
      console.error('Leaderboard error:', error);
      // Return demo data
      return [
        { rank: 1, name: "ProGamer123", winRate: "68%", profit: "+$12,450", specialty: "League of Legends" },
        { rank: 2, name: "EsportsKing", winRate: "65%", profit: "+$11,820", specialty: "CS:GO" },
        { rank: 3, name: "StreamSniper", winRate: "62%", profit: "+$9,740", specialty: "Twitch Betting" },
        { rank: 4, name: "ConsoleGod", winRate: "59%", profit: "+$8,320", specialty: "Xbox Live" },
        { rank: 5, name: "TourneyMaster", winRate: "57%", profit: "+$7,450", specialty: "Tournaments" }
      ];
    }
  }

  // Check API configuration status
  async checkAPIStatus(): Promise<any> {
    try {
      const response = await apiRequest('GET', '/api/gaming/api-status');
      return response;
    } catch (error) {
      console.error('API status error:', error);
      return {
        configured: {
          xbox: false,
          playstation: false,
          steam: false,
          epicGames: false,
          twitch: false,
          youtube: false
        },
        message: 'API configuration pending'
      };
    }
  }

  // Get popular games with current betting data
  getPopularGames() {
    return [
      { 
        name: 'League of Legends', 
        platforms: ['PC'], 
        betTypes: ['Match Winner', 'First Blood', 'Dragon/Baron', 'Kill Count', 'CS Score'],
        currentMatches: 24,
        avgOdds: '1.85',
        icon: '⚔️'
      },
      { 
        name: 'CS:GO', 
        platforms: ['PC'], 
        betTypes: ['Match Winner', 'Map Winner', 'Round Totals', 'First Kill', 'Bomb Plant'],
        currentMatches: 18,
        avgOdds: '2.10',
        icon: '🔫'
      },
      { 
        name: 'Fortnite', 
        platforms: ['Xbox', 'PlayStation', 'PC'], 
        betTypes: ['Victory Royale', 'Top 10 Finish', 'Eliminations', 'Damage Dealt'],
        currentMatches: 156,
        avgOdds: '12.50',
        icon: '🏆'
      },
      { 
        name: 'Valorant', 
        platforms: ['PC'], 
        betTypes: ['Match Winner', 'Map Score', 'Ace Rounds', 'Spike Plants', 'Agent Picks'],
        currentMatches: 31,
        avgOdds: '1.95',
        icon: '🎯'
      },
      { 
        name: 'Apex Legends', 
        platforms: ['Xbox', 'PlayStation', 'PC'], 
        betTypes: ['Squad Win', 'Placement', 'Damage Dealt', 'Survival Time', 'Ring Position'],
        currentMatches: 89,
        avgOdds: '8.75',
        icon: '⚡'
      }
    ];
  }

  // Get gaming platform information
  getGamingPlatforms() {
    return [
      {
        id: 'xbox',
        name: 'Xbox Live',
        icon: '🎮',
        description: 'Connect Xbox Live for real-time match results',
        features: ['Match Results', 'Player Stats', 'Achievement Tracking', 'Gamerscore Betting'],
        difficulty: 'easy',
        setupTime: '5 minutes'
      },
      {
        id: 'playstation',
        name: 'PlayStation Network',
        icon: '🎯',
        description: 'Connect PSN for live gaming data',
        features: ['Trophy Data', 'Game Progress', 'Match History', 'Rank Tracking'],
        difficulty: 'hard',
        setupTime: '2-3 weeks (requires approval)'
      },
      {
        id: 'steam',
        name: 'Steam',
        icon: '💨',
        description: 'Connect Steam for PC gaming results',
        features: ['Game Stats', 'Achievement Data', 'Play Time', 'Inventory Value'],
        difficulty: 'easy',
        setupTime: '2 minutes'
      },
      {
        id: 'epic',
        name: 'Epic Games',
        icon: '⚡',
        description: 'Connect Epic Games for Fortnite and more',
        features: ['Match Data', 'Rank Tracking', 'Season Stats', 'Item Shop Values'],
        difficulty: 'medium',
        setupTime: '1-2 days (requires app approval)'
      },
      {
        id: 'twitch',
        name: 'Twitch',
        icon: '🟣',
        description: 'Live stream betting and analytics',
        features: ['Live Streams', 'Viewer Count', 'Chat Analysis', 'Performance Metrics'],
        difficulty: 'easy',
        setupTime: '5 minutes'
      },
      {
        id: 'youtube',
        name: 'YouTube Gaming',
        icon: '🔴',
        description: 'YouTube gaming content and live streams',
        features: ['Live Streams', 'View Analytics', 'Gaming Content', 'Performance Data'],
        difficulty: 'easy',
        setupTime: '10 minutes'
      }
    ];
  }
}

export const gamingService = new GamingService();