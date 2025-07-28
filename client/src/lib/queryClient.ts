import { QueryClient, QueryFunction } from "@tanstack/react-query";

const throwIfResNotOk = async (res: Response) => {
  if (!res.ok) {
    let errorMessage = `${res.status}: ${res.statusText}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Use default error message if JSON parsing fails
    }
    throw new Error(errorMessage);
  }
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get auth headers for admin users
  const adminEmail = localStorage.getItem('weparlay-admin-email');
  const authHeaders = adminEmail ? { 'X-User-Email': adminEmail } : {};
  
  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...authHeaders
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get auth headers for admin users
    const adminEmail = localStorage.getItem('weparlay-admin-email');
    const authHeaders = adminEmail ? { 'X-User-Email': adminEmail } : {};
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: authHeaders,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Gracefully handle promise rejections to prevent memory leaks
        try {
          const errorMessage = error?.message?.toLowerCase() || '';
          const isProblematicEndpoint = errorMessage.includes('odds') || 
                                       errorMessage.includes('events') ||
                                       errorMessage.includes('unified-sports');
          
          if (isProblematicEndpoint || failureCount >= 1) {
            return false; // No retries to prevent console flooding
          }
          
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return false; // Disable all retries temporarily
        } catch (retryError) {
          console.warn('Retry logic error handled gracefully');
          return false;
        }
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
    },
  },
});