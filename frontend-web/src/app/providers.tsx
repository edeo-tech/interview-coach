'use client';

import { useEffect } from 'react';
import QueryProvider from '@/lib/query-client';
import { initializePostHog } from '@/lib/analytics';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializePostHog();
    // RevenueCat will be initialized when user logs in
  }, []);

  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  );
}