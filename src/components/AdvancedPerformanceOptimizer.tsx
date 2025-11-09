'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';

interface ResourceHint {
  rel: string;
  href: string;
  as?: string;
  type?: string;
  crossorigin?: string;
  fetchpriority?: string;
}

const AdvancedPerformanceOptimizer: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast' | 'unknown'>('unknown');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);
  const networkObserverRef = useRef<PerformanceObserver | null>(null);
  const memoryObserverRef = useRef<PerformanceObserver | null>(null);

  // Advanced resource hints for optimal loading
  const criticalResources: ResourceHint[] = [
    // Critical images
    { rel: 'preload', href: '/assets/n7l1.webp', as: 'image', fetchpriority: 'high' },
    { rel: 'preload', href: '/assets/n7l2.webp', as: 'image', fetchpriority: 'high' },
    { rel: 'preload', href: '/assets/sheep1.webp', as: 'image', fetchpriority: 'high' },
    { rel: 'preload', href: '/assets/tomato 2.jpg', as: 'image', fetchpriority: 'high' },
    { rel: 'preload', href: '/assets/machin01.jpg', as: 'image', fetchpriority: 'high' },
    { rel: 'preload', href: '/assets/seedings01.jpg', as: 'image', fetchpriority: 'high' },
    { rel: 'preload', href: '/assets/exporting1.jpg', as: 'image', fetchpriority: 'high' },
    { rel: 'preload', href: '/assets/land01.jpg', as: 'image', fetchpriority: 'high' },
    
    // Critical fonts
    { rel: 'preload', href: 'https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Cairo:wght@300;400;600;700;900&display=swap', as: 'style' },
    
    // Critical pages
    { rel: 'prefetch', href: '/marketplace' },
    { rel: 'prefetch', href: '/equipment' },
    { rel: 'prefetch', href: '/land' },
    { rel: 'prefetch', href: '/auth/login' },
    
    // DNS prefetch for external domains
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//cdnjs.cloudflare.com' },
    { rel: 'dns-prefetch', href: '//supabase.co' },
    
    // Preconnect for critical domains
    { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossorigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://cdnjs.cloudflare.com', crossorigin: 'anonymous' },
  ];

  // Advanced intersection observer with multiple thresholds
  const setupAdvancedIntersectionObserver = useCallback(() => {
    if (typeof window === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          
          // Lazy load images with progressive loading
          if (target.tagName === 'IMG' && target.dataset.src) {
            if (entry.isIntersecting) {
              // Load low quality first, then high quality
              const lowQualitySrc = target.dataset.src.replace('.jpg', '-low.jpg');
              const highQualitySrc = target.dataset.src;
              
              (target as HTMLImageElement).src = lowQualitySrc;
              (target as HTMLImageElement).onload = () => {
                setTimeout(() => {
                  (target as HTMLImageElement).src = highQualitySrc;
                }, 100);
              };
              
              target.removeAttribute('data-src');
              observerRef.current?.unobserve(target);
            }
          }
          
          // Lazy load background images
          if (target.dataset.bgSrc) {
            target.style.backgroundImage = `url(${target.dataset.bgSrc})`;
            target.removeAttribute('data-bg-src');
            observerRef.current?.unobserve(target);
          }
          
          // Lazy load components
          if (target.dataset.component) {
            const componentName = target.dataset.component;
            import(`@/components/${componentName}`).then((module) => {
              // Component loaded, trigger render
              target.classList.add('component-loaded');
            });
            observerRef.current?.unobserve(target);
          }
        });
      },
      {
        rootMargin: '50px 0px 100px 0px',
        threshold: [0, 0.1, 0.5, 1.0]
      }
    );
  }, []);

  // Advanced performance monitoring
  const setupAdvancedPerformanceMonitoring = useCallback(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      // Core Web Vitals monitoring
      performanceObserverRef.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'largest-contentful-paint':
              const lcp = entry.startTime;
              if (lcp > 2500) {
                console.warn('🚨 LCP is slow:', lcp);
                // Trigger optimization
                optimizeForSlowLCP();
              }
              break;
            case 'first-input':
              const fid = (entry as PerformanceEventTiming).processingStart - (entry as PerformanceEventTiming).startTime;
              if (fid > 100) {
                console.warn('🚨 FID is slow:', fid);
                // Trigger optimization
                optimizeForSlowFID();
              }
              break;
            case 'layout-shift':
              const cls = (entry as any).value;
              if (cls > 0.1) {
                // Temporarily disable CLS warnings to focus on main functionality
                // console.warn('🚨 CLS is poor:', cls);
                // Trigger optimization
                // optimizeForPoorCLS();
              }
              break;
          }
        }
      });

      performanceObserverRef.current.observe({ 
        entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] 
      });

      // Network monitoring
      networkObserverRef.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
                      if (resourceEntry.duration > 3000) {
            // Temporarily disable slow resource warnings to focus on main functionality
            // console.warn('🚨 Slow resource:', resourceEntry.name, resourceEntry.duration);
          }
          }
        }
      });

      networkObserverRef.current.observe({ entryTypes: ['resource'] });

      // Memory monitoring
      if ('memory' in performance) {
        memoryObserverRef.current = new PerformanceObserver(() => {
          const memory = (performance as any).memory;
          if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
            console.warn('🚨 High memory usage:', memory.usedJSHeapSize);
            // Trigger garbage collection hint
            if ('gc' in window) {
              (window as any).gc();
            }
          }
        });
      }

    } catch (error) {
      console.warn('Advanced performance monitoring not supported:', error);
    }
  }, []);

  // Network speed detection
  const detectNetworkSpeed = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        setConnectionSpeed('slow');
        optimizeForSlowConnection();
      } else if (connection.effectiveType === '4g') {
        setConnectionSpeed('fast');
        optimizeForFastConnection();
      }
    }
  }, []);

  // Advanced caching strategies (IndexedDB only, service workers disabled)
  const setupAdvancedCaching = useCallback(() => {
    // IndexedDB for large data caching
    if ('indexedDB' in window) {
      const request = indexedDB.open('ElghellaCache', 1);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'url' });
        }
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'key' });
        }
      };
    }
  }, []);

  // Advanced resource hints injection
  const injectResourceHints = useCallback(() => {
    // Skip preloading on test pages to avoid warnings
    const isTestPage = window.location.pathname.includes('/test-') || 
                      window.location.pathname.includes('/debug') ||
                      window.location.pathname.includes('/fix-');
    
    if (isTestPage) {
      console.log('🚫 Skipping resource preloading on test page to avoid warnings');
      return;
    }

    criticalResources.forEach((hint) => {
      if (!document.querySelector(`link[href="${hint.href}"]`)) {
        const link = document.createElement('link');
        Object.entries(hint).forEach(([key, value]) => {
          if (value) link.setAttribute(key, value);
        });
        document.head.appendChild(link);
      }
    });
  }, []);

  // Advanced optimizations based on performance issues
  const optimizeForSlowLCP = useCallback(() => {
    // Reduce image quality for faster loading
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => {
      const src = (img as HTMLImageElement).dataset.src;
      if (src) {
        (img as HTMLImageElement).src = src.replace('.jpg', '-low.jpg');
      }
    });
  }, []);

  const optimizeForSlowFID = useCallback(() => {
    // Reduce JavaScript execution
    const scripts = document.querySelectorAll('script[data-defer]');
    scripts.forEach((script) => {
      script.setAttribute('defer', 'true');
    });
  }, []);

  const optimizeForPoorCLS = useCallback(() => {
    // Reserve space for images
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => {
      const aspectRatio = (img as HTMLImageElement).dataset.aspectRatio;
      if (aspectRatio) {
        (img as HTMLImageElement).style.aspectRatio = aspectRatio;
      }
    });
  }, []);

  const optimizeForSlowConnection = useCallback(() => {
    // Disable non-critical features
    const nonCriticalElements = document.querySelectorAll('[data-non-critical]');
    nonCriticalElements.forEach((element) => {
      element.setAttribute('style', 'display: none !important');
    });
  }, []);

  const optimizeForFastConnection = useCallback(() => {
    // Enable high-quality features
    const highQualityElements = document.querySelectorAll('[data-high-quality]');
    highQualityElements.forEach((element) => {
      element.removeAttribute('style');
    });
  }, []);

  // Advanced scroll optimization
  const setupAdvancedScrollOptimization = useCallback(() => {
    let ticking = false;
    let lastScrollY = window.scrollY;
    
    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      
      // Optimize based on scroll direction
      if (scrollDirection === 'down') {
        // Preload content below
        const belowElements = document.querySelectorAll('[data-below-fold]');
        belowElements.forEach((element) => {
          if (element.getBoundingClientRect().top < window.innerHeight + 200) {
            element.classList.add('preload');
          }
        });
      } else {
        // Preload content above
        const aboveElements = document.querySelectorAll('[data-above-fold]');
        aboveElements.forEach((element) => {
          if (element.getBoundingClientRect().bottom > -200) {
            element.classList.add('preload');
          }
        });
      }
      
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', requestTick);
    };
  }, []);

  // Main effect
  useEffect(() => {
    // Check if we're on a test page
    const isTestPage = typeof window !== 'undefined' && (
      window.location.pathname.includes('/test-') || 
      window.location.pathname.includes('/debug') ||
      window.location.pathname.includes('/fix-')
    );
    
    if (isTestPage) {
      console.log('🚫 Skipping advanced optimizations on test page');
      return;
    }

    // Setup all advanced optimizations
    setupAdvancedIntersectionObserver();
    setupAdvancedPerformanceMonitoring();
    setupAdvancedCaching();
    injectResourceHints();
    detectNetworkSpeed();
    setupAdvancedScrollOptimization();

    // Network status monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Optimize images after DOM is ready
    const optimizeImagesAfterLoad = () => {
      const images = document.querySelectorAll('img[data-src]');
      images.forEach((img) => {
        observerRef.current?.observe(img);
      });

      const bgImages = document.querySelectorAll('[data-bg-src]');
      bgImages.forEach((element) => {
        observerRef.current?.observe(element);
      });

      const components = document.querySelectorAll('[data-component]');
      components.forEach((element) => {
        observerRef.current?.observe(element);
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizeImagesAfterLoad);
    } else {
      optimizeImagesAfterLoad();
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
      if (networkObserverRef.current) {
        networkObserverRef.current.disconnect();
      }
      if (memoryObserverRef.current) {
        memoryObserverRef.current.disconnect();
      }
      
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('DOMContentLoaded', optimizeImagesAfterLoad);
    };
  }, [
    setupAdvancedIntersectionObserver,
    setupAdvancedPerformanceMonitoring,
    setupAdvancedCaching,
    injectResourceHints,
    detectNetworkSpeed,
    setupAdvancedScrollOptimization
  ]);

  return null;
};

export default AdvancedPerformanceOptimizer; 