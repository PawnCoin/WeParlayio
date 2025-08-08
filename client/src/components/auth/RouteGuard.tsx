import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface RouteGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Global route guard that handles authentication state changes
 * and provides error boundaries for auth failures
 */
export function RouteGuard({ children, fallback }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);

  // Monitor authentication state and handle errors
  useEffect(() => {
    const handleAuthError = async () => {
      if (!isLoading && isAuthenticated && user) {
        try {
          // Verify user session is still valid
          await apiRequest('GET', '/api/auth/user');
          setAuthError(null);
        } catch (error: any) {
          if (error.message.includes('401')) {
            setAuthError('Session expired');
            toast({
              title: "Session Expired",
              description: "Please log in again to continue",
              variant: "destructive",
            });
            setTimeout(() => {
              window.location.href = "/api/login";
            }, 2000);
          }
        }
      }
    };

    // Check auth status periodically (every 5 minutes)
    const interval = setInterval(handleAuthError, 5 * 60 * 1000);
    
    // Check immediately
    handleAuthError();

    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading, user, toast]);

  // Global error boundary for authentication errors
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('401') || 
          event.error?.message?.includes('Unauthorized')) {
        setAuthError('Authentication failed');
        toast({
          title: "Authentication Error",
          description: "Please log in to continue",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
      }
    };

    window.addEventListener('error', handleGlobalError);
    return () => window.removeEventListener('error', handleGlobalError);
  }, [toast]);

  if (authError) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="animate-pulse text-red-500 mb-4">Authentication Error</div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default RouteGuard;