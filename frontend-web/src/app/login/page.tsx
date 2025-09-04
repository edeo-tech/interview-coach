'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLogin } from '@/hooks/use-auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-md">
        <h1 className="font-nunito font-bold text-3xl mb-8 text-center">
          Welcome Back
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 glass-subtle rounded-xl border-0 focus:ring-2 focus:ring-brand-primary focus:outline-none"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 glass-subtle rounded-xl border-0 focus:ring-2 focus:ring-brand-primary focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>
          
          {loginMutation.error && (
            <p className="text-error text-sm">
              {(loginMutation.error as any)?.response?.data?.detail || 'Login failed. Please try again.'}
            </p>
          )}
          
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full glass-purple font-nunito font-semibold py-3 rounded-xl hover:bg-brand-primary/20 transition-colors disabled:opacity-50"
          >
            {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-white/70">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}