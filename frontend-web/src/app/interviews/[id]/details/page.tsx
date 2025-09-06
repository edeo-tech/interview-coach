'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useInterview, useStartAttempt, useInterviewAttemptsCount, useInterviewAttempts } from '@/hooks/use-interviews';

const getLikelihoodColor = (likelihood: number | null | undefined): string => {
  if (!likelihood) return 'text-gray-500';
  if (likelihood < 40) return 'text-red-400';
  if (likelihood < 70) return 'text-yellow-400';
  return 'text-green-400';
};

const calculateAverageScore = (attempts: any[]): number | null => {
  if (!attempts || attempts.length === 0) return null;

  const scores = attempts
    .map(attempt => attempt.score)
    .filter(score => score !== null && score !== undefined);
  
  if (scores.length === 0) return null;
  
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(average);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const GENERAL_INTERVIEW_TIPS = [
  'Research the company culture, values, and recent news',
  'Practice the STAR method for behavioral questions',
  'Prepare specific examples from your experience',
  'Have thoughtful questions ready about the role and team',
  'Review the job description and align your skills',
  'Practice explaining technical concepts clearly',
  'Be ready to discuss your career goals and motivations'
];

export default function InterviewDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: interviewData, isLoading, error } = useInterview(id);
  const { data: attemptsCount } = useInterviewAttemptsCount(id);
  const { data: attemptsData } = useInterviewAttempts(id, 5);
  const startAttempt = useStartAttempt();
  const [showInterviewOptions, setShowInterviewOptions] = useState(false);

  const handleStartInterview = () => {
    // Show voice/video options
    setShowInterviewOptions(true);
  };

  const handleVoiceInterview = () => {
    // Navigate to voice interview session page
    router.push(`/interviews/${id}/session`);
  };

  const handleVideoInterview = () => {
    // Navigate to video interview session page  
    router.push(`/interviews/${id}/video-session`);
  };

  const handleAttemptPress = (attemptId: string) => {
    // Navigate to attempt grading page without animations since feedback already exists
    router.push(`/interviews/${id}/attempts/${attemptId}/grading`);
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/70">Loading interview details...</p>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !interviewData) {
    return (
      <AuthenticatedLayout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto text-center min-h-96 flex items-center justify-center">
            <div>
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="font-nunito font-bold text-xl mb-4 text-white">Failed to load interview</h2>
              <button 
                onClick={() => router.back()}
                className="glass-purple font-nunito font-medium px-6 py-3 rounded-lg hover:bg-brand-primary/20 transition-colors flex items-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const { interview } = interviewData;
  const attempts = attemptsData?.pages.flatMap(page => page.attempts) || [];
  const hasAttempts = attempts.length > 0;

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="font-nunito font-bold text-3xl text-white">Interview Details</h1>
            </div>
          </header>

          {/* Interview Info */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              {/* Company Logo Placeholder */}
              <div className="w-14 h-14 glass-subtle rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H8a2 2 0 00-2-2V6m8 0H8m8 0l2 8H6l2-8" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-nunito font-bold text-xl text-white mb-1">{interview.role_title}</h2>
                <p className="text-white/70">Company: {interview.company}</p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="text-white/60 text-sm">{interview.location || 'Remote'}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H8a2 2 0 00-2-2V6m8 0H8m8 0l2 8H6l2-8" />
                </svg>
                <span className="text-white/60 text-sm capitalize">{interview.experience_level}</span>
              </div>
            </div>
          </div>

          {/* Start Interview Options */}
          {!showInterviewOptions ? (
            <button
              onClick={handleStartInterview}
              disabled={startAttempt.isPending}
              className="w-full glass-purple font-nunito font-semibold px-8 py-4 rounded-full hover:bg-brand-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-8"
            >
              {startAttempt.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1m-4 0V8a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h.01M15 14h.01" />
                </svg>
              )}
              <span>{hasAttempts ? 'Retry Interview' : 'Start Interview'}</span>
            </button>
          ) : (
            <div className="glass rounded-2xl p-6 mb-8">
              <h3 className="font-nunito font-semibold text-xl mb-4 text-white text-center">Choose Interview Mode</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Voice Interview Option */}
                <button
                  onClick={handleVoiceInterview}
                  className="glass-subtle rounded-2xl p-6 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 glass-subtle rounded-full flex items-center justify-center mb-3 group-hover:bg-brand-primary/20 transition-colors">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h4 className="font-nunito font-semibold text-white mb-1">Voice Interview</h4>
                    <p className="text-white/60 text-sm text-center">Classic phone interview experience with voice only</p>
                  </div>
                </button>

                {/* Video Interview Option */}
                <button
                  onClick={handleVideoInterview}
                  className="glass-subtle rounded-2xl p-6 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 glass-subtle rounded-full flex items-center justify-center mb-3 group-hover:bg-brand-primary/20 transition-colors">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="font-nunito font-semibold text-white mb-1">Video Interview</h4>
                    <p className="text-white/60 text-sm text-center">Face-to-face interview with AI avatar Cara</p>
                  </div>
                </button>
              </div>
              
              {/* Back Button */}
              <button
                onClick={() => setShowInterviewOptions(false)}
                className="w-full mt-4 text-white/60 hover:text-white transition-colors text-sm font-medium"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Performance Stats */}
          {hasAttempts && (
            <div className="glass rounded-2xl p-6 mb-6">
              <h3 className="font-nunito font-semibold text-xl mb-4 text-white">Performance</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="font-nunito font-bold text-2xl text-white mb-1">{attempts.length}</p>
                  <p className="text-white/60 text-sm">Attempts</p>
                </div>
                <div className="text-center">
                  <p className={`font-nunito font-bold text-2xl mb-1 ${getLikelihoodColor(interview.best_score)}`}>
                    {interview.best_score}%
                  </p>
                  <p className="text-white/60 text-sm">Best Likelihood</p>
                </div>
                <div className="text-center">
                  <p className={`font-nunito font-bold text-2xl mb-1 ${getLikelihoodColor(calculateAverageScore(attempts))}`}>
                    {calculateAverageScore(attempts) ? `${calculateAverageScore(attempts)}%` : 'N/A'}
                  </p>
                  <p className="text-white/60 text-sm">Average Likelihood</p>
                </div>
              </div>
            </div>
          )}

          {/* Previous Attempts or Tips */}
          {hasAttempts ? (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-nunito font-semibold text-xl mb-4 text-white">Previous Attempts</h3>
              <div className="space-y-3">
                {attempts.map((attempt, index) => (
                  <button
                    key={attempt._id}
                    onClick={() => handleAttemptPress(attempt._id)}
                    className="w-full flex items-center justify-between glass-subtle rounded-full px-4 py-3 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 glass-subtle rounded-full flex items-center justify-center">
                        <span className="text-sm text-white font-medium">{attempts.length - index}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-white font-medium text-sm">Attempt {attempts.length - index}</p>
                        <p className="text-white/60 text-xs">{formatDate(attempt.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {attempt.score && (
                        <span className={`font-medium text-sm ${getLikelihoodColor(attempt.score)}`}>
                          {attempt.score}%
                        </span>
                      )}
                      <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Interview Tips for first attempt
            <div className="glass rounded-2xl p-6">
              <h3 className="font-nunito font-semibold text-xl mb-4 text-white">💡 Interview Preparation Tips</h3>
              <div className="space-y-4">
                {GENERAL_INTERVIEW_TIPS.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
                    <p className="text-white/80 text-sm leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}