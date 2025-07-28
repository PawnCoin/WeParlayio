import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Check if user is admin based on stored data
  const enhancedUser = user ? {
    ...user,
    isAdmin: localStorage.getItem("weparlay-is-admin") === "true" || user.isAdmin || false,
    role: localStorage.getItem("weparlay-is-admin") === "true" ? 'admin' : (user.role || 'user')
  } : null;

  return {
    user: enhancedUser,
    isLoading,
    isAuthenticated: !!user,
  };
}