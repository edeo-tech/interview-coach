'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdateProfile } from '@/hooks/use-auth';

export default function ProfileSetup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const updateProfile = useUpdateProfile();

  const handleContinue = async () => {
    if (!name.trim()) return;

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        ...(age && { age: parseInt(age) })
      });
      
      router.push('/industry-selection');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Step 1 of 7</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-brand-primary h-2 rounded-full" style={{ width: '14%' }}></div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Let's build your profile</h1>
          <p className="text-gray-300">Tell us about yourself to get personalized interview practice</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              What's your name? *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">
              Age (optional)
            </label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="25"
              min="16"
              max="100"
            />
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!name.trim() || updateProfile.isPending}
          className="w-full mt-8 py-3 px-4 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {updateProfile.isPending ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}