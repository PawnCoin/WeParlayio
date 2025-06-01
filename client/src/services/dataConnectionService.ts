
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export interface LiveEvent {
  id: string;
  sport: string;
  teams: string[];
  startTime: string;
  odds: any[];
  live: boolean;
  status?: string;
  score?: { home: number; away: number };
}

export interface UpcomingEvent {
  id: string;
  sport: string;
  teams: string[];
  startTime: string;
  odds: any[];
  live: boolean;
}

export interface SportsOdds {
  sport: string;
  event: string;
  teams: string[];
  odds: any[];
  startTime: string;
  live: boolean;
}

// Central data fetching hooks for consistent API connections
export const useDataConnection = () => {
  // Live events across all sports
  const useLiveEvents = (refreshInterval = 30000) => {
    return useQuery({
      queryKey: ['/api/unified-sports/live'],
      queryFn: async () => {
        const response = await apiRequest('GET', '/api/unified-sports/live');
        return response.json();
      },
      refetchInterval: refreshInterval,
      retry: 3,
      staleTime: 15000,
      onError: (error) => console.log('Live events error (handled):', error),
    });
  };

  // Upcoming events
  const useUpcomingEvents = (hours = 24, refreshInterval = 120000) => {
    return useQuery({
      queryKey: ['/api/unified-sports/upcoming', hours],
      queryFn: async () => {
        const response = await apiRequest('GET', `/api/unified-sports/upcoming/${hours}`);
        return response.json();
      },
      refetchInterval: refreshInterval,
      retry: 2,
      staleTime: 60000,
      onError: (error) => console.log('Upcoming events error (handled):', error),
    });
  };

  // All sports odds
  const useAllSportsOdds = (refreshInterval = 45000) => {
    return useQuery({
      queryKey: ['/api/unified-sports/odds/all'],
      queryFn: async () => {
        const response = await apiRequest('GET', '/api/unified-sports/odds/all');
        return response.json();
      },
      refetchInterval: refreshInterval,
      retry: 2,
      staleTime: 30000,
      onError: (error) => console.log('All sports odds error (handled):', error),
    });
  };

  // Sport-specific odds
  const useSportOdds = (sport: string, refreshInterval = 30000) => {
    return useQuery({
      queryKey: ['/api/unified-sports/odds', sport],
      queryFn: async () => {
        const response = await apiRequest('GET', `/api/unified-sports/odds/${sport}`);
        return response.json();
      },
      refetchInterval: refreshInterval,
      retry: 3,
      enabled: !!sport && sport !== 'all',
      staleTime: 20000,
      onError: (error) => console.log(`Sport ${sport} odds error (handled):`, error),
    });
  };

  // Popular markets
  const usePopularMarkets = (refreshInterval = 180000) => {
    return useQuery({
      queryKey: ['/api/unified-sports/markets/popular'],
      queryFn: async () => {
        const response = await apiRequest('GET', '/api/unified-sports/markets/popular');
        return response.json();
      },
      refetchInterval: refreshInterval,
      retry: 2,
      staleTime: 120000,
      onError: (error) => console.log('Popular markets error (handled):', error),
    });
  };

  // Sports categories
  const useAmericanSports = () => {
    return useQuery({
      queryKey: ['/api/unified-sports/sports/american'],
      queryFn: async () => {
        const response = await apiRequest('GET', '/api/unified-sports/sports/american');
        return response.json();
      },
      refetchInterval: 300000,
      retry: 2,
      staleTime: 240000,
      onError: (error) => console.log('American sports error (handled):', error),
    });
  };

  const useInternationalSports = () => {
    return useQuery({
      queryKey: ['/api/unified-sports/sports/international'],
      queryFn: async () => {
        const response = await apiRequest('GET', '/api/unified-sports/sports/international');
        return response.json();
      },
      refetchInterval: 300000,
      retry: 2,
      staleTime: 240000,
      onError: (error) => console.log('International sports error (handled):', error),
    });
  };

  const useCombatSports = () => {
    return useQuery({
      queryKey: ['/api/unified-sports/sports/combat'],
      queryFn: async () => {
        const response = await apiRequest('GET', '/api/unified-sports/sports/combat');
        return response.json();
      },
      refetchInterval: 300000,
      retry: 2,
      staleTime: 240000,
      onError: (error) => console.log('Combat sports error (handled):', error),
    });
  };

  // API status monitoring
  const useApiStatus = () => {
    return useQuery({
      queryKey: ['/api/unified-sports/status'],
      queryFn: async () => {
        const response = await apiRequest('GET', '/api/unified-sports/status');
        return response.json();
      },
      refetchInterval: 60000,
      retry: 2,
      staleTime: 30000,
      onError: (error) => console.log('API status error (handled):', error),
    });
  };

  // Search functionality
  const useSearchSports = (query: string) => {
    return useQuery({
      queryKey: ['/api/unified-sports/search', query],
      queryFn: async () => {
        const response = await apiRequest('GET', `/api/unified-sports/search/${encodeURIComponent(query)}`);
        return response.json();
      },
      enabled: !!query && query.length > 2,
      retry: 2,
      staleTime: 60000,
      onError: (error) => console.log(`Search error for "${query}" (handled):`, error),
    });
  };

  // User-specific data
  const useUserBets = (userId?: string) => {
    return useQuery({
      queryKey: ['/api/users', userId, 'bets'],
      queryFn: async () => {
        const response = await apiRequest('GET', `/api/users/${userId}/bets`);
        return response.json();
      },
      enabled: !!userId,
      refetchInterval: 60000,
      retry: 2,
      staleTime: 30000,
      onError: (error) => console.log('User bets error (handled):', error),
    });
  };

  // Tournaments
  const useTournaments = () => {
    return useQuery({
      queryKey: ['/api/tournaments'],
      queryFn: async () => {
        const response = await apiRequest('GET', '/api/tournaments');
        return response.json();
      },
      refetchInterval: 300000,
      retry: 2,
      staleTime: 240000,
      onError: (error) => console.log('Tournaments error (handled):', error),
    });
  };

  return {
    useLiveEvents,
    useUpcomingEvents,
    useAllSportsOdds,
    useSportOdds,
    usePopularMarkets,
    useAmericanSports,
    useInternationalSports,
    useCombatSports,
    useApiStatus,
    useSearchSports,
    useUserBets,
    useTournaments,
  };
};

// Export individual hooks for easier importing
export const {
  useLiveEvents,
  useUpcomingEvents,
  useAllSportsOdds,
  useSportOdds,
  usePopularMarkets,
  useAmericanSports,
  useInternationalSports,
  useCombatSports,
  useApiStatus,
  useSearchSports,
  useUserBets,
  useTournaments,
} = useDataConnection();

export default useDataConnection;
