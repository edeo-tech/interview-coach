'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useCreateInterview } from '@/hooks/use-interviews';

// Import from shared interfaces
const interviewTypes = [
  { key: 'GeneralInterview', label: 'General Interview', description: 'Standard interview questions' },
  { key: 'PhoneScreen', label: 'Phone Screen', description: 'Initial screening call' },
  { key: 'BehavioralInterview', label: 'Behavioral Interview', description: 'STAR method questions' },
  { key: 'TechnicalScreeningCall', label: 'Technical Screening', description: 'Technical questions and problem solving' },
  { key: 'MockSalesCall', label: 'Mock Sales Call', description: 'Sales scenario practice' },
  { key: 'SystemDesignInterview', label: 'System Design', description: 'Architecture and design questions' },
];

export default function CreateInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState(searchParams?.get('type') || '');
  const [jobDescription, setJobDescription] = useState('');
  
  const createInterviewMutation = useCreateInterview();

  const handleStartInterview = async () => {
    if (!selectedType) return;
    
    try {
      const response = await createInterviewMutation.mutateAsync({
        interview_type: selectedType,
        job_description: jobDescription || undefined
      });
      
      router.push(`/interviews/${response.data.interview_id}/session?type=${selectedType}`);
    } catch (error) {
      console.error('Failed to create interview:', error);
      // For now, fallback to mock ID
      const mockInterviewId = `${Date.now()}`;
      router.push(`/interviews/${mockInterviewId}/session?type=${selectedType}`);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/interviews" className="text-brand-primary hover:underline mb-4 inline-block">
            ← Back to Interviews
          </Link>
          <h1 className="font-nunito font-bold text-3xl mb-2">Create Interview Practice</h1>
          <p className="text-white/70">Choose your interview type and get started</p>
        </div>

        <div className="grid gap-8">
          {/* Interview Type Selection */}
          <section>
            <h2 className="font-nunito font-semibold text-xl mb-4">Select Interview Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviewTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setSelectedType(type.key)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selectedType === type.key
                      ? 'glass-purple border-brand-primary'
                      : 'glass border-white/15 hover:border-brand-primary/50'
                  }`}
                >
                  <h3 className="font-nunito font-semibold text-lg mb-2">{type.label}</h3>
                  <p className="text-white/70 text-sm">{type.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Optional Job Description */}
          <section>
            <h2 className="font-nunito font-semibold text-xl mb-4">Job Description (Optional)</h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description for more targeted practice..."
              className="w-full h-32 p-4 glass-subtle rounded-xl border-0 focus:ring-2 focus:ring-brand-primary focus:outline-none resize-none"
            />
          </section>

          {/* Start Button */}
          <div className="flex justify-center">
            <button
              onClick={handleStartInterview}
              disabled={!selectedType || createInterviewMutation.isPending}
              className="glass-purple font-nunito font-semibold px-8 py-4 rounded-xl hover:bg-brand-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createInterviewMutation.isPending ? 'Creating Interview...' : 'Start Interview Practice'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}