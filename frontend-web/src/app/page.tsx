'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const router = useRouter();
  const { data: user, isLoading, error } = useCheckAuth();

  useEffect(() => {
    if (isLoading) return;

    console.log('user', user);
    console.log('error', error);
    
    if (user) {
      console.log('NAVIGATE TO DASHBOARD');
      router.push('/dashboard');
    } else {
      console.log('NAVIGATE TO WELCOME');
      router.push('/welcome');
    }
  }, [user, isLoading, error, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}