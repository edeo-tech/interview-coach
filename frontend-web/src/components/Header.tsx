'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCheckAuth } from '@/hooks/use-auth';

export default function Header() {
  const { data: user } = useCheckAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo and brand name */}
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image 
            src="/logo.png" 
            alt="NextRound" 
            width={32} 
            height={32}
            className="rounded-lg"
          />
          <span className="font-nunito font-bold text-xl text-white">nextround</span>
        </Link>

        {/* Profile link */}
        {user && (
          <Link 
            href="/profile" 
            className="flex items-center gap-2 glass-subtle rounded-full px-4 py-2 hover:bg-white/10 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-nunito text-white text-sm">{user.name || 'User'}</span>
          </Link>
        )}
      </div>
    </header>
  );
}