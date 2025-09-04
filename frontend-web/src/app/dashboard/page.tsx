'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useUserInterviews } from '@/hooks/use-interviews';

export default function DashboardPage() {
  const { 
    data: interviewsData, 
    isLoading: interviewsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useUserInterviews(10);
  
  const interviews = interviewsData?.pages.flatMap(page => page.interviews) || [];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLikelihoodColor = (likelihood: number | null | undefined) => {
    if (!likelihood) return 'text-gray-500';
    if (likelihood < 40) return 'text-red-400';
    if (likelihood < 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="font-nunito font-bold text-4xl mb-2 text-white">
                  Recent interviews
                </h1>
                <p className="text-white/70 text-lg">
                  Your interview practice sessions
                </p>
              </div>
              <Link 
                href="/interviews/create" 
                className="glass-purple font-nunito font-semibold px-6 py-3 rounded-xl hover:bg-brand-primary/30 transition-all duration-300 flex items-center gap-2"
              >
                <span>+</span>
                <span>Create Interview</span>
              </Link>
            </div>
          </header>

          {/* Interviews List */}
          <div className="space-y-4">
            {interviewsLoading ? (
              <div className="glass rounded-2xl p-8 text-center">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/70">Loading your interviews...</p>
              </div>
            ) : !interviews || interviews.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <div className="w-16 h-16 glass-subtle rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">💼</span>
                </div>
                <h3 className="font-nunito font-semibold text-xl mb-2 text-white">No interviews yet</h3>
                <p className="text-white/70 mb-6">Your interview sessions will appear here</p>
                <Link
                  href="/interviews/create"
                  className="glass-purple font-nunito font-medium px-6 py-3 rounded-xl hover:bg-brand-primary/20 transition-colors inline-flex items-center gap-2"
                >
                  <span>+</span>
                  <span>Create Interview</span>
                </Link>
              </div>
            ) : (
              interviews.map((interview) => (
                <Link
                  key={interview._id}
                  href={`/interviews/${interview._id}/results`}
                  className="glass rounded-2xl p-6 hover:glass-purple transition-all duration-300 flex items-center gap-4"
                >
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">💼</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-nunito font-semibold text-lg text-white truncate">
                        {interview.role_title}
                      </h3>
                      <span className={`font-medium text-sm ${getLikelihoodColor(interview.average_score)}`}>
                        {interview.average_score ? `${Math.round(interview.average_score)}%` : 'Not started'}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm truncate">
                      {interview.company}
                    </p>
                  </div>
                  
                  <svg className="w-5 h-5 text-white/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))
            )}
            
            {/* Load More Button */}
            {hasNextPage && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  className="glass-subtle font-nunito font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Loading more...</span>
                    </div>
                  ) : (
                    'Load More Interviews'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}