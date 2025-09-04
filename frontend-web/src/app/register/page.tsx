'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRegister } from '@/hooks/use-auth';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const registerMutation = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    registerMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-md">
        <h1 className="font-nunito font-bold text-3xl mb-8 text-center">
          Create Account
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
              placeholder="Create a password"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 glass-subtle rounded-xl border-0 focus:ring-2 focus:ring-brand-primary focus:outline-none"
              placeholder="Confirm your password"
              required
            />
          </div>
          
          {registerMutation.error && (
            <p className="text-error text-sm">
              {(registerMutation.error as any)?.response?.data?.detail || 'Registration failed. Please try again.'}
            </p>
          )}
          
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full glass-purple font-nunito font-semibold py-3 rounded-xl hover:bg-brand-primary/20 transition-colors disabled:opacity-50"
          >
            {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-white/70">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}