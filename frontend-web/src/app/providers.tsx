'use client';

import { useEffect } from 'react';
import QueryProvider from '@/lib/query-client';
import { initializePostHog } from '@/lib/analytics';
import { initializeRevenueCat } from '@/lib/revenuecat';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializePostHog();
    
    // Initialize RevenueCat at the root level
    const initRevenueCat = async () => {
      const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
      
      if (!apiKey) {
        console.error('RevenueCat API key is not defined');
        return;
      }
      
      try {
        // Initialize without user ID first - we'll identify the user later
        await initializeRevenueCat();
        console.log('RevenueCat initialized at root level');
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
      }
    };
    
    if (typeof window !== 'undefined') {
      initRevenueCat();
    }
  }, []);

  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  );
}