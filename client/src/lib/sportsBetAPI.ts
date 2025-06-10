import { apiRequest } from "@/lib/queryClient";

export interface Odds {
  id: string;
  sportKey: string;
  sportTitle: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bookmakers: Bookmaker[];
}

export interface Bookmaker {
  key: string;
  title: string;
  lastUpdate: string;
  markets: Market[];
}

export interface Market {
  key: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number;
  point?: number;
}

export interface Sport {
  id: number;
  name: string;
  key: string;
  isActive: boolean;
  icon: string;
  eventCount: number;
}

export interface Team {
  id: number;
  name: string;
  abbreviation: string;
  logo: string;
  sportId: number;
}

export interface Event {
  id: number;
  sportId: number;
  homeTeamId: number;
  awayTeamId: number;
  startTime: string;
  status: string;
  homeScore: number;
  awayScore: number;
  period: string;
  timeRemaining: string;
  odds: any;
}

export interface Bet {
  id: number;
  userId: number;
  eventId: number;
  betType: string;
  pick: string;
  odds: number;
  amount: number;
  potentialPayout: number;
  status: string;
  placedAt: string;
  settledAt?: string;
}

export interface Tournament {
  id: number;
  name: string;
  sportId: number;
  startDate: string;
  endDate?: string;
  status: string;
  bracketData: any;
}

export interface FantasyTeam {
  id: number;
  userId: number;
  name: string;
  sportId: number;
  salary: number;
  maxSalary: number;
  createdAt: string;
  yahooTeamId?: string;
}

export interface Player {
  id: number;
  name: string;
  position: string;
  teamId: number;
  salary?: number;
  projectedPoints?: number;
  yahooPlayerId?: string;
}

// Helper function to map sport keys to IDs
export function getSportIdByKey(sportKey: string): number | null {
  const sportMap: Record<string, number> = {
    'basketball': 1,
    'nba': 1,
    'basketball_nba': 1,
    'football': 2,
    'nfl': 2,
    'football_nfl': 2,
    'baseball': 3,
    'mlb': 3,
    'baseball_mlb': 3,
    'hockey': 4,
    'nhl': 4,
    'hockey_nhl': 4,
    'soccer': 5,
    'mls': 5,
    'soccer_mls': 5,
    'mma': 6,
    'ufc': 6,
    'mma_ufc': 6,
    'boxing': 7,
    'tennis': 8,
    'motorsport': 9,
    'nascar': 9,
    'motorsport_nascar': 9
  };
  
  // Extract the base sport from the key (e.g., 'basketball_nba' -> 'basketball')
  const baseSport = sportKey.split('_')[0];
  return sportMap[baseSport] || null;
}

const sportsBetAPI = {
  // Sports
  getSports: async (): Promise<Sport[]> => {
    const response = await apiRequest("GET", "/api/sports");
    return response.json();
  },
  
  getSport: async (id: number): Promise<Sport> => {
    const response = await apiRequest("GET", `/api/sports/${id}`);
    return response.json();
  },
  
  // Teams
  getTeams: async (): Promise<Team[]> => {
    const response = await apiRequest("GET", "/api/teams");
    return response.json();
  },
  
  getTeamsBySport: async (sportId: number): Promise<Team[]> => {
    const response = await apiRequest("GET", `/api/sports/${sportId}/teams`);
    return response.json();
  },
  
  // Events
  getEvents: async (): Promise<Event[]> => {
    const response = await apiRequest("GET", "/api/events");
    return response.json();
  },
  
  getEvent: async (id: number): Promise<Event> => {
    const response = await apiRequest("GET", `/api/events/${id}`);
    return response.json();
  },
  
  getEventsBySport: async (sportId: number): Promise<Event[]> => {
    const response = await apiRequest("GET", `/api/sports/${sportId}/events`);
    return response.json();
  },
  
  getUpcomingEvents: async (limit?: number): Promise<Event[]> => {
    const url = limit ? `/api/events/upcoming?limit=${limit}` : "/api/events/upcoming";
    const response = await apiRequest("GET", url);
    return response.json();
  },
  
  getLiveEvents: async (): Promise<Event[]> => {
    const response = await apiRequest("GET", "/api/events/live");
    const data = await response.json();
    // Handle various response formats from different APIs
    return data.data || data.events || data || [];
  },
  
  // Filter live events by sport key
  getLiveEventsBySport: async (sportKey: string): Promise<Event[]> => {
    try {
      const response = await apiRequest("GET", "/api/events/live");
      const data = await response.json();
      const allEvents = data.data || data.events || data || [];
      
      // If we have a specific sport key, filter by it
      if (sportKey && allEvents && Array.isArray(allEvents)) {
        const sportId = getSportIdByKey(sportKey);
        if (sportId) {
          return allEvents.filter((event: Event) => event.sportId === sportId);
        }
      }
      
      return allEvents || [];
    } catch (error) {
      console.error('Error fetching live events by sport', error);
      return [];
    }
  },
  
  // Filter upcoming events by sport key
  getUpcomingEventsBySport: async (sportKey: string): Promise<Event[]> => {
    try {
      const response = await apiRequest("GET", "/api/events/upcoming");
      const data = await response.json();
      const allEvents = data.data || data.events || data || [];
      
      // If we have a specific sport key, filter by it
      if (sportKey && allEvents && Array.isArray(allEvents)) {
        const sportId = getSportIdByKey(sportKey);
        if (sportId) {
          return allEvents.filter((event: Event) => event.sportId === sportId);
        }
      }
      
      return allEvents || [];
    } catch (error) {
      console.error('Error fetching upcoming events by sport', error);
      return [];
    }
  },
  
  // Odds
  getOdds: async (sportKey: string, region: string = "us", markets: string = "h2h,spreads,totals"): Promise<Odds[]> => {
    const response = await apiRequest("GET", `/api/odds/${sportKey}?region=${region}&markets=${markets}`);
    return response.json();
  },
  
  // Get detailed odds with all available markets including player props and team props
  getDetailedOdds: async (sportKey: string, eventId?: string): Promise<any> => {
    let url = `/api/odds/detailed/${sportKey}?markets=h2h,spreads,totals,team_totals,player_props,alternate_spreads,alternate_totals`;
    if (eventId) {
      url += `&eventId=${eventId}`;
    }
    const response = await apiRequest("GET", url);
    return response.json();
  },
  
  // Get popular player props for a specific event
  getPlayerProps: async (eventId: string): Promise<any> => {
    const response = await apiRequest("GET", `/api/odds/player-props/${eventId}`);
    return response.json();
  },
  
  // Get team props for a specific event
  getTeamProps: async (eventId: string): Promise<any> => {
    const response = await apiRequest("GET", `/api/odds/team-props/${eventId}`);
    return response.json();
  },
  
  // Get popular parlay combinations
  getPopularParlays: async (sportKey: string): Promise<any> => {
    const response = await apiRequest("GET", `/api/odds/parlays/${sportKey}`);
    return response.json();
  },
  
  // Get odds comparison across different bookmakers
  getOddsComparison: async (eventId: string, market: string = "h2h"): Promise<any> => {
    const response = await apiRequest("GET", `/api/odds/comparison/${eventId}?market=${market}`);
    return response.json();
  },
  
  // Bets
  getUserBets: async (userId: number): Promise<Bet[]> => {
    const response = await apiRequest("GET", `/api/users/${userId}/bets`);
    return response.json();
  },
  
  placeBet: async (bet: Omit<Bet, "id" | "status" | "placedAt" | "settledAt">): Promise<Bet> => {
    const response = await apiRequest("POST", "/api/bets", bet);
    return response.json();
  },
  
  // Tournaments
  getTournaments: async (): Promise<Tournament[]> => {
    const response = await apiRequest("GET", "/api/tournaments");
    return response.json();
  },
  
  getTournament: async (id: number): Promise<Tournament> => {
    const response = await apiRequest("GET", `/api/tournaments/${id}`);
    return response.json();
  },
  
  getTournamentsBySport: async (sportId: number): Promise<Tournament[]> => {
    const response = await apiRequest("GET", `/api/sports/${sportId}/tournaments`);
    return response.json();
  },
  
  createTournament: async (tournament: Omit<Tournament, "id" | "createdAt" | "updatedAt">): Promise<Tournament> => {
    const response = await apiRequest("POST", "/api/tournaments", tournament);
    return response.json();
  },

  joinTournament: async (tournamentId: number, userId: string): Promise<any> => {
    const response = await apiRequest("POST", `/api/tournaments/${tournamentId}/join`, { userId });
    return response.json();
  },

  leaveTournament: async (tournamentId: number, userId: string): Promise<any> => {
    const response = await apiRequest("POST", `/api/tournaments/${tournamentId}/leave`, { userId });
    return response.json();
  },

  updateTournamentBracket: async (id: number, bracketData: any): Promise<Tournament> => {
    const response = await apiRequest("POST", `/api/tournaments/${id}/bracket`, bracketData);
    return response.json();
  },

  getUserTournaments: async (userId: string): Promise<Tournament[]> => {
    const response = await apiRequest("GET", `/api/users/${userId}/tournaments`);
    return response.json();
  },
  
  // Fantasy Teams
  getUserFantasyTeams: async (userId: number): Promise<FantasyTeam[]> => {
    const response = await apiRequest("GET", `/api/users/${userId}/fantasy-teams`);
    return response.json();
  },
  
  createFantasyTeam: async (team: Omit<FantasyTeam, "id" | "salary" | "maxSalary" | "createdAt">): Promise<FantasyTeam> => {
    const response = await apiRequest("POST", "/api/fantasy-teams", team);
    return response.json();
  },
  
  getFantasyTeamPlayers: async (fantasyTeamId: number): Promise<Player[]> => {
    const response = await apiRequest("GET", `/api/fantasy-teams/${fantasyTeamId}/players`);
    return response.json();
  },
  
  addPlayerToFantasyTeam: async (fantasyTeamId: number, playerId: number): Promise<any> => {
    const response = await apiRequest("POST", `/api/fantasy-teams/${fantasyTeamId}/players`, { playerId });
    return response.json();
  },
  
  removePlayerFromFantasyTeam: async (fantasyTeamId: number, playerId: number): Promise<void> => {
    await apiRequest("DELETE", `/api/fantasy-teams/${fantasyTeamId}/players/${playerId}`);
  },
  
  // Players
  getPlayers: async (): Promise<Player[]> => {
    const response = await apiRequest("GET", "/api/players");
    return response.json();
  },
  
  getPlayersByTeam: async (teamId: number): Promise<Player[]> => {
    const response = await apiRequest("GET", `/api/teams/${teamId}/players`);
    return response.json();
  },
};

export { sportsBetAPI };
export default sportsBetAPI;
