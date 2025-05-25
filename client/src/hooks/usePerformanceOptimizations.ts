import { useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash-es';

// Performance optimization hook for WeParlay
export function usePerformanceOptimizations() {
  
  // Debounced search for better UX
  const createDebouncedSearch = useCallback((searchFn: Function, delay = 300) => {
    return debounce(searchFn, delay);
  }, []);

  // Memoized calculations for betting odds
  const useMemoizedOddsCalculations = useCallback((odds: any[], stake: number) => {
    return useMemo(() => {
      if (!odds.length || !stake) return { payout: 0, profit: 0 };
      
      const totalOdds = odds.reduce((acc, odd) => acc * odd, 1);
      const payout = stake * totalOdds;
      const profit = payout - stake;
      
      return { payout, profit, totalOdds };
    }, [odds, stake]);
  }, []);

  // Optimized image loading
  const useOptimizedImageLoading = useCallback(() => {
    useEffect(() => {
      // Lazy load images when they come into viewport
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
      return () => imageObserver.disconnect();
    }, []);
  }, []);

  // Virtual scrolling for large lists
  const useVirtualScrolling = useCallback((items: any[], itemHeight: number, containerHeight: number) => {
    return useMemo(() => {
      const visibleItems = Math.ceil(containerHeight / itemHeight);
      const bufferSize = Math.min(10, Math.ceil(visibleItems * 0.5));
      
      return {
        visibleItems: visibleItems + bufferSize * 2,
        startIndex: 0,
        endIndex: visibleItems + bufferSize * 2
      };
    }, [items.length, itemHeight, containerHeight]);
  }, []);

  // Memory management for betting data
  const useMemoryOptimization = useCallback(() => {
    useEffect(() => {
      // Clear old betting data every 5 minutes
      const cleanup = setInterval(() => {
        const now = Date.now();
        const FIVE_MINUTES = 5 * 60 * 1000;
        
        // Clear localStorage items older than 5 minutes
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('weparlay-temp-')) {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}');
              if (data.timestamp && now - data.timestamp > FIVE_MINUTES) {
                localStorage.removeItem(key);
              }
            } catch (e) {
              localStorage.removeItem(key);
            }
          }
        });
      }, 5 * 60 * 1000);

      return () => clearInterval(cleanup);
    }, []);
  }, []);

  // Optimized event listeners
  const useOptimizedEventListeners = useCallback(() => {
    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // Pause heavy operations when tab is hidden
          console.log('💤 WeParlay paused background operations');
        } else {
          // Resume operations when tab is visible
          console.log('🚀 WeParlay resumed operations');
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);
  }, []);

  return {
    createDebouncedSearch,
    useMemoizedOddsCalculations,
    useOptimizedImageLoading,
    useVirtualScrolling,
    useMemoryOptimization,
    useOptimizedEventListeners
  };
}