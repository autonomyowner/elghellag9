'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import BrowserCache from '@/lib/browserCache';
import CLSOptimizer from '@/components/CLSOptimizer';
import AggressiveCLSPrevention from '@/components/AggressiveCLSPrevention';

// Dynamic imports for better performance
const ConditionalHeader = dynamic(() => import("@/components/ConditionalHeader"), {
  ssr: false,
  loading: () => <div className="h-16 bg-black/20 animate-pulse" />
});

const ServiceWorkerRegistration = dynamic(() => import("@/components/ServiceWorkerRegistration"), {
  ssr: false
});

// Keep only one performance optimizer to prevent conflicts
const PerformanceOptimizer = dynamic(() => import("@/components/PerformanceOptimizer"), {
  ssr: false
});

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  useEffect(() => {
    // Initialize cache clearing in development (only once)
    if (process.env.NODE_ENV === 'development') {
      // Clear cache on component mount (only once)
      const hasCleared = sessionStorage.getItem('cacheCleared');
      if (!hasCleared) {
        BrowserCache.clearAll();
        sessionStorage.setItem('cacheCleared', 'true');
      }
    }

    // Force loading to false after 5 seconds to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      const loadingElements = document.querySelectorAll('[class*="animate-spin"]');
      loadingElements.forEach(el => {
        if (el.classList.contains('animate-spin')) {
          (el as HTMLElement).style.display = 'none';
        }
      });
    }, 5000);

    return () => clearTimeout(loadingTimeout);
  }, []);

  return (
    <>
      <PerformanceOptimizer />
      <CLSOptimizer />
      <AggressiveCLSPrevention />
      <ConditionalHeader />
      <main className="min-h-screen">
        {children}
      </main>
      <ServiceWorkerRegistration />
    </>
  );
};

export default ClientLayout; 
