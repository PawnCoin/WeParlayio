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

export default {
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
    return response.json();
  },
  
  // Odds
  getOdds: async (sportKey: string, region: string = "us", markets: string = "h2h,spreads,totals"): Promise<Odds[]> => {
    const response = await apiRequest("GET", `/api/odds/${sportKey}?region=${region}&markets=${markets}`);
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
  
  updateTournamentBracket: async (id: number, bracketData: any): Promise<Tournament> => {
    const response = await apiRequest("POST", `/api/tournaments/${id}/bracket`, bracketData);
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
