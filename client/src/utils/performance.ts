// WeParlay Performance Optimization Suite
import { lazy } from 'react';

// 🚀 Code Splitting - Lazy load route components
export const LazyLiveBetting = lazy(() => import('../pages/LiveBetting'));
export const LazyComprehensiveBetting = lazy(() => import('../pages/ComprehensiveBetting'));
export const LazyUnifiedSports = lazy(() => import('../pages/UnifiedSports'));
export const LazyTournaments = lazy(() => import('../pages/Tournaments'));

// 🎯 Image Optimization
export const optimizeImage = (src: string, width?: number): string => {
  if (!src) return '';
  
  // Convert to WebP format for better compression
  if (src.includes('.jpg') || src.includes('.png')) {
    const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
    return width ? `${webpSrc}?w=${width}&q=80` : `${webpSrc}?q=80`;
  }
  
  return src;
};

// 🔄 Caching Strategy - Optimized query configurations
export const getCacheConfig = (endpoint: string) => {
  const configs = {
    // Real-time data (short cache)
    '/api/events/live': { staleTime: 5000, refetchInterval: 5000 },
    '/api/real-odds': { staleTime: 10000, refetchInterval: 10000 },
    
    // Semi-static data (medium cache)
    '/api/sports': { staleTime: 300000, refetchInterval: false }, // 5 minutes
    '/api/events/upcoming': { staleTime: 60000, refetchInterval: 30000 }, // 1 minute
    
    // Static data (long cache)
    '/api/tournaments': { staleTime: 600000, refetchInterval: false }, // 10 minutes
    '/api/user/profile': { staleTime: 300000, refetchInterval: false }, // 5 minutes
  };
  
  return configs[endpoint] || { staleTime: 30000, refetchInterval: false };
};

// 📊 Performance Monitoring
export const trackPerformance = (metric: string, value: number) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(`weparlay-${metric}-${value}`);
    
    // Track Core Web Vitals
    if (metric === 'page-load') {
      console.log(`⚡ WeParlay ${metric}: ${value}ms`);
    }
  }
};

// 💾 Memory Management
export const cleanup = () => {
  // Clear any intervals or timeouts
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('weparlay-cleanup'));
  }
};
