import { useQuery, QueryKey, UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  endpoint: string;
  dependencies?: any[];
  cacheTime?: number;
  staleTime?: number;
}

// Performance-optimized query hook with intelligent caching
export function useOptimizedQuery<T>(options: OptimizedQueryOptions<T>) {
  const {
    endpoint,
    dependencies = [],
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 30 * 1000, // 30 seconds
    ...queryOptions
  } = options;

  // Memoized query key to prevent unnecessary re-renders
  const queryKey: QueryKey = useMemo(() => [
    endpoint,
    ...dependencies
  ], [endpoint, ...dependencies]);

  // Enhanced query with performance optimizations
  return useQuery<T>({
    queryKey,
    gcTime: cacheTime,
    staleTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...queryOptions
  });
}

// Specialized hook for live data with reduced polling
export function useLiveDataQuery<T>(
  endpoint: string,
  options: Omit<OptimizedQueryOptions<T>, 'endpoint'> = {}
) {
  return useOptimizedQuery<T>({
    endpoint,
    staleTime: 30 * 1000, // 30 seconds for live data
    refetchInterval: 45 * 1000, // Reduced from 5-8 seconds to 45 seconds
    refetchIntervalInBackground: false,
    ...options
  });
}

// Hook for frequently accessed static data with aggressive caching
export function useStaticDataQuery<T>(
  endpoint: string,
  options: Omit<OptimizedQueryOptions<T>, 'endpoint'> = {}
) {
  return useOptimizedQuery<T>({
    endpoint,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnReconnect: false,
    ...options
  });
}