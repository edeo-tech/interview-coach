'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckAuth } from '@/hooks/use-auth';
import { usePremiumCheck } from '@/hooks/use-purchases';

export default function HomePage() {
  const router = useRouter();
  const { data: user, isLoading: authLoading, error } = useCheckAuth();
  const { isPremium, loading: premiumLoading } = usePremiumCheck();

  useEffect(() => {
    if (authLoading || premiumLoading) return;

    console.log('user', user);
    console.log('error', error);
    console.log('isPremium', isPremium);
    
    if (user) {
      if (isPremium) {
        console.log('NAVIGATE TO DASHBOARD');
        router.push('/dashboard');
      } else {
        console.log('NAVIGATE TO ONBOARDING - USER NOT PREMIUM');
        router.push('/onboarding/profile-setup');
      }
    } else {
      console.log('NAVIGATE TO WELCOME');
      router.push('/welcome');
    }
  }, [user, authLoading, error, router, isPremium, premiumLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}