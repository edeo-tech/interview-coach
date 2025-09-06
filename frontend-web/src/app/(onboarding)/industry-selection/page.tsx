'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUpdateProfile } from '@/hooks/use-auth';

const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Marketing',
  'Sales',
  'Education',
  'Consulting',
  'Legal',
  'Real Estate',
  'Retail',
  'Manufacturing',
  'Media',
  'Non-profit',
  'Government',
  'Other'
];

export default function IndustrySelection() {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const updateProfile = useUpdateProfile();

  const handleContinue = async () => {
    if (!selectedIndustry) return;

    try {
      await updateProfile.mutateAsync({
        industry: selectedIndustry
      });
      
      router.push('/cv-upload');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <button onClick={handleBack} className="text-gray-400 hover:text-white">
              ← Back
            </button>
            <span className="text-gray-400 text-sm">Step 2 of 7</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-brand-primary h-2 rounded-full" style={{ width: '28%' }}></div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">What industry do you work in?</h1>
          <p className="text-gray-300">This helps us tailor interview questions to your field</p>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => setSelectedIndustry(industry)}
              className={`w-full p-4 text-left rounded-lg border transition-colors ${
                selectedIndustry === industry
                  ? 'bg-brand-primary/20 border-brand-primary text-white'
                  : 'bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedIndustry || updateProfile.isPending}
          className="w-full mt-8 py-3 px-4 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {updateProfile.isPending ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}