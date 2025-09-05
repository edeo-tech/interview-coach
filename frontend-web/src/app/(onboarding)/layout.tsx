'use client';

import { useCheckAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useCheckAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // No header during onboarding - just the full screen content
  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}