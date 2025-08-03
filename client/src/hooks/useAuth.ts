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
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // Refetch every minute to keep auth state fresh
  });

  // If there's a 401 error or no user data, user is not authenticated
  const isAuthenticated = !!user && !error;
  
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