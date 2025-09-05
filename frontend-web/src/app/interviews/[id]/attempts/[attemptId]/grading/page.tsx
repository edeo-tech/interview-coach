'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useInterviewFeedback, useInterview } from '@/hooks/use-interviews';

// Types
interface FeedbackData {
  _id: string;
  attempt_id: string;
  interview_type: string;
  overall_score: number;
  strengths: string[];
  improvement_areas: string[];
  detailed_feedback: string;
  rubric_scores: Record<string, number>;
  created_at: string;
  updated_at: string;
}

interface InterviewData {
  id?: string;
  _id?: string;
  interview_type: string;
  job_description?: string;
  user_id: string;
}

export default function InterviewGradingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const attemptId = params?.attemptId as string;
  const isFromInterview = searchParams?.get('from_interview') === 'true';

  const { data: feedbackResponse, isLoading, refetch } = useInterviewFeedback(id, attemptId);
  const { data: interviewResponse } = useInterview(id);
  
  // Extract data from API responses
  const feedbackData = feedbackResponse?.data as FeedbackData | undefined;
  const interviewData = interviewResponse?.data as InterviewData | undefined;

  const [showAnimation, setShowAnimation] = useState(isFromInterview && !feedbackData);
  const [showReveal, setShowReveal] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [hasSeenAnimation, setHasSeenAnimation] = useState(!isFromInterview || !!feedbackData);

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

  // Auto-progress from loading animation to likelihood reveal when feedback is ready
  useEffect(() => {
    if (feedbackData && showAnimation && isFromInterview && !hasSeenAnimation) {
      console.log('🎊 Auto-progressing from loading to likelihood reveal');
      
      // Small delay to let the loading animation complete gracefully
      const timer = setTimeout(() => {
        setShowAnimation(false);
        setShowReveal(true);
        setHasSeenAnimation(true);
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [feedbackData, showAnimation, isFromInterview, hasSeenAnimation]);

  // Auto-progress from likelihood reveal to detailed feedback after delay
  useEffect(() => {
    if (showReveal && feedbackData && isFromInterview) {
      console.log('📊 Auto-progressing from likelihood reveal to detailed feedback');
      
      // Show likelihood reveal for 3 seconds, then auto-advance
      const timer = setTimeout(() => {
        setShowReveal(false);
      }, 3000); // 3 seconds delay

      return () => clearTimeout(timer);
    }
  }, [showReveal, feedbackData, isFromInterview]);

  // Persist animation state to localStorage
  useEffect(() => {
    const animationKey = `animation_seen_${attemptId}`;
    
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(animationKey);
      if (savedState && JSON.parse(savedState)) {
        setHasSeenAnimation(true);
        console.log('📱 Loading animation state from localStorage - already seen');
      }
    }
  }, [attemptId]);

  // Save animation state when user has seen it
  useEffect(() => {
    const animationKey = `animation_seen_${attemptId}`;
    
    if (hasSeenAnimation && typeof window !== 'undefined') {
      localStorage.setItem(animationKey, JSON.stringify(true));
      console.log('💾 Saved animation state to localStorage');
    }
  }, [hasSeenAnimation, attemptId]);

  // Don't show animations if user has already seen them (returning from transcript)
  useEffect(() => {
    if (isFromInterview && feedbackData && !showAnimation && !showReveal && hasSeenAnimation) {
      // User is returning with feedback already loaded, skip animations
      console.log('🔄 User returning from transcript, skipping animations');
    }
  }, [isFromInterview, feedbackData, showAnimation, showReveal, hasSeenAnimation]);

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

  const getInterviewTypeDisplay = (type: string) => {
    // Convert backend enum to readable format
    return type || 'General Interview';
  };

  const formatRubricCategory = (category: string) => {
    return category
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleAnimationComplete = () => {
    console.log('🎊 Manual animation complete - showing likelihood reveal');
    setShowAnimation(false);
    setShowReveal(true);
    setHasSeenAnimation(true);
    
    if (!feedbackData) {
      console.log('⚠️ Animation completed but no data - forcing refetch');
      refetch();
    }
  };

  const handleRevealContinue = () => {
    console.log('📊 Manual transition from reveal to detailed feedback');
    setShowReveal(false);
  };

  const skipToDetailedFeedback = () => {
    console.log('⏭️ User chose to skip animations');
    setShowAnimation(false);
    setShowReveal(false);
    setHasSeenAnimation(true);
  };

  // Loading animation component
  const LoadingAnimation = () => (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900/50 to-blue-900/50 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <div className="w-24 h-24 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
        <h2 className="text-3xl font-nunito font-light text-white mb-4">
          {feedbackData ? 'Analysis Complete!' : 'Analyzing Your Interview'}
        </h2>
        <p className="text-white/70 text-lg mb-8">
          {feedbackData 
            ? 'Preparing your results...' 
            : 'Our AI is evaluating your performance...'
          }
        </p>
        
        <div className="w-full max-w-md mx-auto">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-brand-primary to-pink-500 rounded-full transition-all duration-1000 ${
                feedbackData ? '' : 'animate-pulse'
              }`}
              style={{ width: feedbackData ? '100%' : '75%' }}
            ></div>
          </div>
          <p className="text-white/50 text-sm mt-2">
            {feedbackData 
              ? 'Redirecting automatically in a moment...' 
              : 'This usually takes 30-60 seconds'
            }
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          {feedbackData ? (
            <button
              onClick={handleAnimationComplete}
              className="px-8 py-3 bg-brand-primary rounded-lg text-white font-medium hover:bg-brand-primary/80 transition-colors"
            >
              View Results Now
            </button>
          ) : (
            <button
              onClick={skipToDetailedFeedback}
              className="px-6 py-2 bg-white/10 rounded-lg text-white/70 font-medium hover:bg-white/20 transition-colors text-sm"
            >
              Skip Animation
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Likelihood reveal component  
  const LikelihoodReveal = () => (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900/50 to-blue-900/50 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <div className="mb-8">
          <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-4xl font-nunito font-light text-white mb-2">Interview Complete!</h2>
          <p className="text-white/70 text-lg">Your advancement likelihood</p>
        </div>

        <div className="mb-8">
          <div className={`text-8xl font-bold mb-2 animate-pulse ${getScoreColor(feedbackData?.overall_score || 0)}`}>
            {feedbackData?.overall_score || 0}%
          </div>
          <div className="text-white/70 text-xl">
            {getAdvancementLabel(feedbackData?.overall_score || 0)}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleRevealContinue}
            className="px-8 py-3 bg-brand-primary rounded-lg text-white font-medium hover:bg-brand-primary/80 transition-colors"
          >
            View Detailed Feedback Now
          </button>
          
          <p className="text-white/50 text-sm">
            Continuing automatically in a moment...
          </p>
          
          {/* Visual countdown indicator */}
          <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-brand-primary rounded-full animate-[countdown_3s_linear_forwards]"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => {
    if (isLoading || !feedbackData) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center glass rounded-2xl p-8 max-w-md">
            <div className="w-12 h-12 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-nunito font-semibold text-white mb-2">
              {isLoading ? 'Loading Feedback...' : 'No Feedback Available'}
            </h3>
            <p className="text-white/70">
              {isLoading 
                ? 'Please wait while we load your interview feedback.' 
                : 'Your interview feedback will appear here once it\'s ready.'
              }
            </p>
            {!isLoading && (
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-brand-primary rounded-lg text-white font-medium hover:bg-brand-primary/80 transition-colors"
              >
                Refresh
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Interview Type Badge */}
        {feedbackData.interview_type && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full px-4 py-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-white font-medium">{getInterviewTypeDisplay(feedbackData.interview_type)}</span>
            </div>
            <p className="text-white/50 text-sm mt-2">Interview Assessment Complete</p>
          </div>
        )}

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
        {feedbackData.rubric_scores && Object.keys(feedbackData.rubric_scores).length > 0 && (
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-nunito font-semibold text-white">Performance Breakdown</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(feedbackData.rubric_scores).map(([category, score]) => {
                const displayName = formatRubricCategory(category);
                const scoreValue = typeof score === 'number' ? score : 0;
                
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
          onClick={() => {
            // Preserve that we've seen the animation when going to transcript
            setHasSeenAnimation(true);
            router.push(`/interviews/${id}/attempts/${attemptId}/transcript`);
          }}
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
    <>
      {/* Add countdown animation */}
      <style jsx>{`
        @keyframes countdown {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
      
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
    </>
  );
}