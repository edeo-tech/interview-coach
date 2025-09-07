'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function JobUpload() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const saveJobInfo = useMutation({
    mutationFn: async (jobData: { title: string; company: string; description: string }) => {
      return api.post('/jobs', jobData);
    },
  });

  const handleContinue = async () => {
    if (jobTitle.trim() && company.trim() && jobDescription.trim()) {
      setIsSaving(true);
      try {
        await saveJobInfo.mutateAsync({
          title: jobTitle.trim(),
          company: company.trim(),
          description: jobDescription.trim(),
        });
      } catch (error) {
        console.error('Failed to save job info:', error);
      } finally {
        setIsSaving(false);
      }
    }
    
    router.push('/reviews');
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
            <span className="text-gray-400 text-sm">Step 4 of 7</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-brand-primary h-2 rounded-full" style={{ width: '57%' }}></div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Tell us about the job</h1>
          <p className="text-gray-300">Share details about a role you're interested in or currently applying for</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-300 mb-2">
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
              Company
            </label>
            <input
              type="text"
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="e.g. Google"
            />
          </div>

          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-300 mb-2">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
              placeholder="Paste the job description here or describe the role..."
            />
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <p className="text-yellow-300 text-sm">
              <strong>Optional:</strong> You can skip this step, but job details help us create more relevant interview questions.
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleContinue}
            className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Skip for Now
          </button>
          <button
            onClick={handleContinue}
            disabled={isSaving}
            className="flex-1 py-3 px-4 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isSaving ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}