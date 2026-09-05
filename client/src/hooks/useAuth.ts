import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const token = localStorage.getItem('auth-token');
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
  
  // Authorization comes only from the verified server response.
  const enhancedUser = user ? {
    ...user,
    isAdmin: user.isAdmin === true || user.role === 'admin',
    role: user.role || (user.isAdmin ? 'admin' : 'user')
  } : null;

  const login = async ({ username, password }: { username: string; password: string }) => {
    setIsLoggingIn(true);
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: username, password }) });
      const data = await response.json();
      if (!response.ok || !data.token) throw new Error(data.message || 'Login failed');
      localStorage.setItem('auth-token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      await refetch();
      return data.user;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    ['auth-token', 'user', 'weparlay-logged-in', 'weparlay-user-email', 'weparlay-is-admin', 'weparlay-admin-token'].forEach(key => localStorage.removeItem(key));
    queryClient.clear();
    toast({ title: 'Logged out' });
    window.location.assign('/');
  };

  return {
    user: enhancedUser,
    isLoading,
    isAuthenticated,
    refetch,
    login,
    logout,
    isLoggingIn,
  };
}
