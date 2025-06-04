import { apiRequest } from "@/lib/queryClient";

export interface AllSportsSport {
  id: string;
  name: string;
  key: string;
  group: string;
  active: boolean;
  iconName: string;
}

export interface AllSportsGame {
  id: string;
  sportId: string;
  title: string;
  homeTeam: {
    id: string;
    name: string;
    score: number;
  };
  awayTeam: {
    id: string;
    name: string;
    score: number;
  };
  startTime: string;
  status: 'live' | 'scheduled' | 'completed';
  leagueName?: string;
  odds?: {
    homeWin: number;
    awayWin: number;
    draw?: number;
  };
  isEsport: boolean;
}

class AllSportsApiClient {
  async getSports(): Promise<AllSportsSport[]> {
    try {
      const response = await apiRequest('GET', '/api/allsports/sports');
      return response;
    } catch (error) {
      console.error('AllSportsAPI client: Failed to fetch sports', error);
      throw error;
    }
  }

  async getOdds(sportKey: string): Promise<AllSportsGame[]> {
    try {
      const response = await apiRequest('GET', `/api/allsports/odds/${sportKey}`);
      return response;
    } catch (error) {
      console.error(`AllSportsAPI client: Failed to fetch odds for ${sportKey}`, error);
      throw error;
    }
  }

  async getUpcomingGames(sport?: string): Promise<AllSportsGame[]> {
    try {
      const url = sport ? `/api/allsports/upcoming?sport=${sport}` : '/api/allsports/upcoming';
      const response = await apiRequest('GET', url);
      return response;
    } catch (error) {
      console.error('AllSportsAPI client: Failed to fetch upcoming games', error);
      throw error;
    }
  }

  async getLiveGames(): Promise<AllSportsGame[]> {
    try {
      const response = await apiRequest('GET', '/api/allsports/live');
      return response;
    } catch (error) {
      console.error('AllSportsAPI client: Failed to fetch live games', error);
      throw error;
    }
  }
}

export const allSportsApiClient = new AllSportsApiClient();