'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for better performance
const ConditionalHeader = dynamic(() => import("@/components/ConditionalHeader"), {
  ssr: false,
  loading: () => <div className="h-16 bg-black/20 animate-pulse" />
});

const ServiceWorkerRegistration = dynamic(() => import("@/components/ServiceWorkerRegistration"), {
  ssr: false
});

// Single CLS prevention component (removed duplicate CLSOptimizer)
const AggressiveCLSPrevention = dynamic(() => import("@/components/AggressiveCLSPrevention"), {
  ssr: false
});

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <>
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
