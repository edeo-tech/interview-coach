'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-4xl">
        <h1 className="font-nunito font-bold text-6xl mb-6 bg-gradient-to-r from-brand-primary to-accent-gold bg-clip-text text-transparent">
          NextRound
        </h1>
        
        <p className="text-2xl mb-4 text-white/90">
          AI Interview Coach
        </p>
        
        <p className="text-lg text-white/70 mb-12 max-w-2xl mx-auto">
          Practice interviews with AI and get personalized feedback to land your dream job. 
          Build confidence, improve your skills, and ace every interview.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/register"
            className="glass-purple font-nunito font-semibold px-8 py-4 rounded-2xl hover:bg-brand-primary/20 transition-all duration-300 inline-block"
          >
            Get Started Free
          </Link>
          
          <Link
            href="/login"
            className="glass font-nunito font-semibold px-8 py-4 rounded-2xl hover:bg-white/5 transition-all duration-300 inline-block"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-6xl w-full">
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-4xl mb-4">🎤</div>
          <h3 className="font-nunito font-semibold text-xl mb-2">AI Mock Interviews</h3>
          <p className="text-white/70">Practice with realistic AI interviewers</p>
        </div>
        
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="font-nunito font-semibold text-xl mb-2">Detailed Feedback</h3>
          <p className="text-white/70">Get personalized improvement suggestions</p>
        </div>
        
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-4xl mb-4">💼</div>
          <h3 className="font-nunito font-semibold text-xl mb-2">Job-Specific Prep</h3>
          <p className="text-white/70">Tailored practice for your target role</p>
        </div>
      </div>
    </div>
  );
}