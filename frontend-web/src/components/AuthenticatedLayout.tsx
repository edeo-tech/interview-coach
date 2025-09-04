'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckAuth } from '@/hooks/use-auth';
import Navigation from './Navigation';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, error } = useCheckAuth();

  useEffect(() => {
    if (!isLoading && (!user || error)) {
      // Not authenticated, redirect to login
      router.push('/login');
    }
  }, [user, isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || error) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>{children}</main>
    </div>
  );
}