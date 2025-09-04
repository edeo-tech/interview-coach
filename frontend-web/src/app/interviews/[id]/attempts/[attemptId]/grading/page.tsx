'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useInterviewFeedback, useInterview } from '@/hooks/use-interviews';

export default function InterviewGradingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const attemptId = params?.attemptId as string;
  const isFromInterview = searchParams?.get('from_interview') === 'true';

  const { data: feedbackData, isLoading, refetch } = useInterviewFeedback(id, attemptId);
  const { data: interviewData } = useInterview(id);

  const [showAnimation, setShowAnimation] = useState(isFromInterview);
  const [showReveal, setShowReveal] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  // Polling mechanism - check for feedback every 2 seconds
  useEffect(() => {
    if (feedbackData) {
      console.log('✅ [GRADING] Feedback received, stopping polling');
      return;
    }

    console.log(`🔄 [GRADING] Starting polling attempt #${pollCount + 1}`);
    
    const pollInterval = setInterval(() => {
      console.log('🔄 [GRADING] Polling for feedback...');
      refetch();
      setPollCount(prev => prev + 1);
    }, 2000);

    return () => {
      console.log('🛑 [GRADING] Cleaning up polling interval');
      clearInterval(pollInterval);
    };
  }, [feedbackData, refetch, pollCount]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getAdvancementLabel = (score: number) => {
    if (score >= 90) return 'Very High';
    if (score >= 80) return 'High';
    if (score >= 70) return 'Moderate';
    if (score >= 60) return 'Low';
    return 'Very Low';
  };

  const handleAnimationComplete = () => {
    console.log('🎊 Animation sequence complete - showing likelihood reveal');
    setShowAnimation(false);
    setShowReveal(true);
    
    if (!feedbackData) {
      console.log('⚠️ Animation completed but no data - forcing refetch');
      refetch();
    }
  };

  const handleRevealContinue = () => {
    console.log('📊 Transitioning from reveal to detailed feedback');
    setShowReveal(false);
  };

  // Loading animation component
  const LoadingAnimation = () => (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900/50 to-blue-900/50 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <div className="w-24 h-24 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
        <h2 className="text-3xl font-nunito font-light text-white mb-4">Analyzing Your Interview</h2>
        <p className="text-white/70 text-lg mb-8">Our AI is evaluating your performance...</p>
        
        <div className="w-full max-w-md mx-auto">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-primary to-pink-500 rounded-full animate-pulse" 
                 style={{ width: feedbackData ? '100%' : '75%' }}></div>
          </div>
          <p className="text-white/50 text-sm mt-2">This usually takes 30-60 seconds</p>
        </div>

        {feedbackData && (
          <button
            onClick={handleAnimationComplete}
            className="mt-8 px-8 py-3 bg-brand-primary rounded-lg text-white font-medium hover:bg-brand-primary/80 transition-colors"
          >
            View Results
          </button>
        )}
      </div>
    </div>
  );

  // Likelihood reveal component
  const LikelihoodReveal = () => (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900/50 to-blue-900/50 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <div className="mb-8">
          <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-4xl font-nunito font-light text-white mb-2">Interview Complete!</h2>
          <p className="text-white/70 text-lg">Your advancement likelihood</p>
        </div>

        <div className="mb-8">
          <div className={`text-8xl font-bold mb-2 ${getScoreColor(feedbackData?.overall_score || 0)}`}>
            {feedbackData?.overall_score || 0}%
          </div>
          <div className="text-white/70 text-xl">
            {getAdvancementLabel(feedbackData?.overall_score || 0)}
          </div>
        </div>

        <button
          onClick={handleRevealContinue}
          className="px-8 py-3 bg-brand-primary rounded-lg text-white font-medium hover:bg-brand-primary/80 transition-colors"
        >
          View Detailed Feedback
        </button>
      </div>
    </div>
  );

  const renderFeedback = () => {
    if (!feedbackData) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center glass rounded-2xl p-8 max-w-md">
            <div className="w-12 h-12 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-nunito font-semibold text-white mb-2">No Feedback Available</h3>
            <p className="text-white/70">
              Your interview feedback will appear here once it's ready.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Likelihood Reminder */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-nunito font-semibold text-white">Your Advancement Likelihood</h3>
          </div>
          <div className="text-center mb-4">
            <div className={`text-4xl font-bold mb-1 ${getScoreColor(feedbackData.overall_score)}`}>
              {feedbackData.overall_score}%
            </div>
            <div className="text-white/70">
              {getAdvancementLabel(feedbackData.overall_score)}
            </div>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                feedbackData.overall_score >= 90 ? 'bg-green-400' :
                feedbackData.overall_score >= 80 ? 'bg-blue-400' :
                feedbackData.overall_score >= 70 ? 'bg-yellow-400' :
                feedbackData.overall_score >= 60 ? 'bg-orange-400' : 'bg-red-400'
              }`}
              style={{ width: `${feedbackData.overall_score}%` }}
            />
          </div>
        </div>

        {/* Performance Breakdown */}
        {feedbackData.rubric_scores && (
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-nunito font-semibold text-white mb-4">Performance Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(feedbackData.rubric_scores).map(([category, score]) => {
                const displayName = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const scoreValue = score as number;
                
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{displayName}</span>
                      <span className={`font-semibold ${getScoreColor(scoreValue)}`}>{scoreValue}</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          scoreValue >= 90 ? 'bg-green-400' :
                          scoreValue >= 80 ? 'bg-blue-400' :
                          scoreValue >= 70 ? 'bg-yellow-400' :
                          scoreValue >= 60 ? 'bg-orange-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${scoreValue}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Strengths */}
        {feedbackData.strengths && feedbackData.strengths.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-nunito font-semibold text-white">Strengths</h3>
            </div>
            <div className="space-y-3">
              {feedbackData.strengths.map((strength, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-white/80">{strength}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Areas to Improve */}
        {feedbackData.improvement_areas && feedbackData.improvement_areas.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h3 className="text-lg font-nunito font-semibold text-white">Areas to Improve</h3>
            </div>
            <div className="space-y-3">
              {feedbackData.improvement_areas.map((area, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-white/80">{area}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Feedback */}
        {feedbackData.detailed_feedback && (
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-nunito font-semibold text-white">Detailed Feedback</h3>
            </div>
            <p className="text-white/80 leading-relaxed">{feedbackData.detailed_feedback}</p>
          </div>
        )}

        {/* View Transcript Button */}
        <button
          onClick={() => router.push(`/interviews/${id}/attempts/${attemptId}/transcript`)}
          className="w-full glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors mb-6"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-white font-medium">View Transcript</span>
          </div>
          <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900/50 to-blue-900/50 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-white/10">
        {!isFromInterview && (
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-nunito font-semibold text-white">Interview Feedback</h1>
      </div>

      {/* Content */}
      {(!showAnimation && !showReveal) || !isFromInterview ? (
        <>
          {renderFeedback()}
          
          {/* Footer - only show if coming from interview */}
          {isFromInterview && !showAnimation && !showReveal && feedbackData && (
            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => router.push(`/interviews/${id}/details`)}
                className="w-full py-3 bg-brand-primary rounded-lg text-white font-medium hover:bg-brand-primary/80 transition-colors flex items-center justify-center gap-2"
              >
                Practice Again & Improve
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      ) : null}

      {/* Overlays */}
      {showAnimation && isFromInterview && <LoadingAnimation />}
      {showReveal && feedbackData && isFromInterview && <LikelihoodReveal />}
    </div>
  );
}