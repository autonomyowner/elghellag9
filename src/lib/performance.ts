// Performance Optimization Utilities for Algerian Farmers Marketplace
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { lazy } from 'react';

// Advanced Caching Strategy
export class AdvancedCache {
  private static instance: AdvancedCache;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static getInstance(): AdvancedCache {
    if (!AdvancedCache.instance) {
      AdvancedCache.instance = new AdvancedCache();
    }
    return AdvancedCache.instance;
  }

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Image Optimization
export class ImageOptimizer {
  static getOptimizedSrc(src: string, width: number = 400, quality: number = 80): string {
    // For external images, use a proxy or CDN
    if (src.startsWith('http')) {
      return `${src}?w=${width}&q=${quality}&fit=crop`;
    }
    
    // For local images, use Next.js Image optimization
    return src;
  }

  static getPlaceholderSrc(width: number = 400, height: number = 300): string {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%239ca3af'%3Eجاري التحميل...%3C/text%3E%3C/svg%3E`;
  }

  static preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }
}

// Lazy Loading Hook
export const useLazyLoad = (items: any[], itemsPerPage: number = 12) => {
  const [displayedItems, setDisplayedItems] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Use useMemo to prevent infinite re-renders
  const itemsKey = useMemo(() => JSON.stringify(items), [items]);

  useEffect(() => {
    setDisplayedItems(items.slice(0, itemsPerPage));
    setHasMore(items.length > itemsPerPage);
  }, [itemsKey, itemsPerPage]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    setTimeout(() => {
      const currentLength = displayedItems.length;
      const newItems = items.slice(currentLength, currentLength + itemsPerPage);
      setDisplayedItems(prev => [...prev, ...newItems]);
      setHasMore(currentLength + itemsPerPage < items.length);
      setLoading(false);
    }, 300);
  }, [displayedItems.length, items, itemsPerPage, loading, hasMore]);

  return { displayedItems, hasMore, loading, loadMore };
};

// Debounce Hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Intersection Observer Hook
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
        }
      });
    }, options);

    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  return elementRef;
};

// Performance Monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static startTimer(name: string): void {
    if (typeof window === 'undefined') return;
    performance.mark(`${name}-start`);
  }

  static endTimer(name: string): number {
    if (typeof window === 'undefined') return 0;
    
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    const duration = measure.duration;
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
    
    return duration;
  }

  static getAverageTime(name: string): number {
    const times = this.metrics.get(name) || [];
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  static logMetrics(): void {
    console.log('Performance Metrics:', Object.fromEntries(this.metrics));
  }
}

// Bundle Size Optimization
export const optimizeBundle = {
  // Simple dynamic import helper
  dynamicImport: (importFn: () => Promise<any>) => {
    return dynamic(importFn, { ssr: false });
  },

  // Component lazy loading
  lazyComponent: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
  ) => {
    return lazy(importFn);
  }
};

// Memory Management
export class MemoryManager {
  private static cleanupTasks: (() => void)[] = [];

  static addCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  static cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }

  static optimizeImages(): void {
    // Clear image cache if memory usage is high
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('image')) {
            caches.delete(name);
          }
        });
      });
    }
  }
}

// Network Optimization
export class NetworkOptimizer {
  static async prefetchData(url: string): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'force-cache'
      });
      
      if (response.ok) {
        // Data is available in cache
        return;
      }
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }

  static getOptimalBatchSize(connectionType: string): number {
    switch (connectionType) {
      case 'slow-2g':
      case '2g':
        return 5;
      case '3g':
        return 10;
      case '4g':
        return 20;
      default:
        return 15;
    }
  }
}

// React Query Configuration for Performance
export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
};

// Web Vitals Monitoring
export const webVitals = {
  reportWebVitals: (metric: any) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to analytics service
      console.log('Web Vital:', metric);
    }
  }
};

// Export all utilities
export default {
  AdvancedCache,
  ImageOptimizer,
  useLazyLoad,
  useDebounce,
  useIntersectionObserver,
  PerformanceMonitor,
  optimizeBundle,
  MemoryManager,
  NetworkOptimizer,
  queryConfig,
  webVitals,
}; 