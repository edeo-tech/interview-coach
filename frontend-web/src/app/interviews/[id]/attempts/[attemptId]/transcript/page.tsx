'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useInterview } from '@/hooks/use-interviews';

interface TranscriptMessage {
  role: 'user' | 'agent';
  message: string;
  time_in_call_secs?: number;
}

export default function InterviewTranscriptPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const attemptId = params?.attemptId as string;
  const isFromInterview = searchParams?.get('from_interview') === 'true';

  const { data: interviewData, isLoading } = useInterview(id);
  
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [hasTranscript, setHasTranscript] = useState(false);

  // Find the attempt and extract transcript
  const attempt = useMemo(() => {
    if (!interviewData?.attempts) return null;
    return interviewData.attempts.find((a: any) => a.id === attemptId || a._id === attemptId);
  }, [interviewData, attemptId]);

  // Initialize transcript from attempt data
  useEffect(() => {
    if (attempt?.transcript && Array.isArray(attempt.transcript)) {
      setTranscript(attempt.transcript);
      setHasTranscript(attempt.transcript.length > 0);
    }
  }, [attempt]);

  const formatTime = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const TranscriptView = ({ transcript }: { transcript: TranscriptMessage[] }) => (
    <div className="flex-1 overflow-y-auto px-6 pb-6">
      <div className="space-y-4 max-w-4xl mx-auto">
        {transcript.map((message, index) => (
          <div
            key={index}
            className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-brand-primary text-white'
                    : 'glass text-white'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.message}</p>
              </div>
              <div className={`flex items-center gap-2 mt-1 px-2 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <span className="text-xs text-white/50">
                  {message.role === 'user' ? 'You' : 'Interviewer'}
                </span>
                {message.time_in_call_secs !== undefined && (
                  <>
                    <span className="text-xs text-white/30">•</span>
                    <span className="text-xs text-white/50">
                      {formatTime(message.time_in_call_secs)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/50 to-blue-900/50 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center glass rounded-2xl p-8 max-w-md">
          <div className="w-12 h-12 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-nunito font-semibold text-white mb-2">Loading interview...</h3>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (!hasTranscript) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center glass rounded-2xl p-8 max-w-md">
            <div className="w-12 h-12 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-nunito font-semibold text-white mb-2">Processing Interview</h3>
            <p className="text-white/70">
              Your interview is being processed. The transcript will appear here shortly.
            </p>
          </div>
        </div>
      );
    }

    return <TranscriptView transcript={transcript} />;
  };

  const renderFooter = () => {
    // Only show "View Feedback" button if coming from interview (not from grading) and transcript is available
    if (isFromInterview && hasTranscript) {
      return (
        <div className="p-6 border-t border-white/10">
          <button
            onClick={() => router.push(`/interviews/${id}/attempts/${attemptId}/grading`)}
            className="w-full py-3 bg-gradient-to-r from-brand-primary to-pink-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Feedback & Analysis
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900/50 to-blue-900/50 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-white/10">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-nunito font-semibold text-white">Interview Transcript</h1>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Footer */}
      {renderFooter()}
    </div>
  );
}