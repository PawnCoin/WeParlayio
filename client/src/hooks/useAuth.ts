import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const token = localStorage.getItem('auth-token') || localStorage.getItem('weparlay-admin-token');
      // Only log in development mode
      if (import.meta.env.DEV) {
        console.log('Client: Using token for auth:', token?.substring(0, 50) + '...');
      }
      
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      return response.json();
    },
    retry: false,
    staleTime: 1000 * 60 * 60, // 1 hour for admin sessions (stay logged in longer)
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes to keep admin session fresh
    gcTime: 1000 * 60 * 120, // Keep in cache for 2 hours
  });

  // If there's a 401 error or no user data, user is not authenticated
  const isAuthenticated = !!user && !error && !!localStorage.getItem('auth-token');
  
  // Check if user is admin based on stored data and backend response
  const enhancedUser = user ? {
    ...user,
    isAdmin: user.isAdmin || user.role === 'admin' || localStorage.getItem("weparlay-is-admin") === "true" || false,
    role: user.role || (user.isAdmin ? 'admin' : 'user')
  } : null;

  return {
    user: enhancedUser,
    isLoading,
    isAuthenticated,
    refetch,
  };
}