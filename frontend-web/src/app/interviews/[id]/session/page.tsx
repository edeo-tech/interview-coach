'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useConversation } from '@elevenlabs/react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useCheckAuth } from '@/hooks/use-auth';
import { useCV } from '@/hooks/use-cv';
import { useInterview, useStartAttempt, useAddTranscript, useFinishAttempt } from '@/hooks/use-interviews';
import { useGetConversationToken } from '@/hooks/use-conversation-token';


// Interview type mapping - must match backend enum values
const InterviewType = {
  GeneralInterview: 'General Interview',
  PhoneScreen: 'Phone Screen',
  MockSalesCall: 'Mock Sales Call',
  TechnicalScreeningCall: 'Technical Screening Call',
  SystemDesignInterview: 'System Design Interview',
  BehavioralInterview: 'Behavioral Interview',
  ExecutiveLeadershipRound: 'Executive / Leadership Round',
};

const getInterviewerRole = (type: string): string => {
  switch (type) {
    case InterviewType.GeneralInterview:
      return 'Senior Interviewer';
    case InterviewType.MockSalesCall:
      return 'Director of Operations';
    case InterviewType.TechnicalScreeningCall:
    case InterviewType.SystemDesignInterview:
      return 'Senior Technical Interviewer';
    case InterviewType.BehavioralInterview:
      return 'HR Manager';
    case InterviewType.ExecutiveLeadershipRound:
      return 'VP of Engineering';
    default:
      return 'Senior Interviewer';
  }
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function MockInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [callState, setCallState] = useState<'incoming' | 'connecting' | 'active' | 'ended'>('incoming');
  const [duration, setDuration] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [agentMetadata, setAgentMetadata] = useState<{ name: string; profile_picture: string } | null>(null);

  // Data hooks
  const { data: user } = useCheckAuth();
  const { data: cvProfile } = useCV();
  const { data: interviewData } = useInterview(id);
  const startAttempt = useStartAttempt();
  const addTranscript = useAddTranscript();
  const finishAttempt = useFinishAttempt();
  const getConversationToken = useGetConversationToken();

  // Convert frontend interview type to backend enum value
  const mapInterviewType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'GeneralInterview': 'General Interview',
      'PhoneScreen': 'Phone Screen', 
      'MockSalesCall': 'Mock Sales Call',
      'TechnicalScreeningCall': 'Technical Screening Call',
      'SystemDesignInterview': 'System Design Interview',
      'BehavioralInterview': 'Behavioral Interview',
      'ExecutiveLeadershipRound': 'Executive / Leadership Round',
    };
    return typeMap[type] || 'General Interview';
  };

  const currentInterviewType = mapInterviewType(interviewData?.interview_type || 'GeneralInterview');

  // Get agent info
  const getAgentInfo = () => {
    return {
      name: agentMetadata?.name || 'Niamh Morissey',
      avatar: agentMetadata?.profile_picture || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format',
      role: getInterviewerRole(currentInterviewType)
    };
  };

  const interviewer = getAgentInfo();

  // ElevenLabs conversation configuration
  const conversationConfig = useMemo(() => ({
    onConnect: () => {
      console.log('🎤 Connected to ElevenLabs');
      setCallState('active');
      
      setTimeout(() => {
        console.log('⚠️ Checking if AI has started speaking...');
      }, 10000);
    },
    onDisconnect: () => {
      console.log('🎤 Disconnected from ElevenLabs');
    },
    onMessage: (evt: any) => {
      const e = evt?.message?.type ? evt.message : evt;
      
      if (e.type === 'conversation_initiation_metadata') {
        const convId = e.conversation_initiation_metadata_event?.conversation_id;
        if (convId && attemptId) {
          console.log('📝 Captured conversation_id:', convId);
          setConversationId(convId);
        }
        return;
      }
    },
    onError: (error: any) => {
      console.error('❌ ElevenLabs error:', error);
      setCallState('incoming');
    },
    clientTools: {
      record_interview_feedback: (parameters: unknown) => {
        const feedbackParams = parameters as {
          strengths: string[];
          improvements: string[];
          score: number;
          summary: string;
        };
        return "Feedback recorded successfully!";
      },
      evaluate_answer: (parameters: unknown) => {
        const answerParams = parameters as {
          question: string;
          answer: string;
          rating: number;
          feedback: string;
        };
        return "Answer evaluated!";
      },
    },
  }), [attemptId]);

  const conversation = useConversation(conversationConfig);

  const acceptCall = useCallback(async () => {
    console.log('📞 Accepting call');
    setCallState('connecting');

    try {
      // Start attempt on backend
      const res = await startAttempt.mutateAsync(id);
      const newAttemptId = res.data.attempt_id;
      
      if (!newAttemptId) {
        console.error('❌ Backend returned no attempt_id');
        setCallState('incoming');
        return;
      }
      
      setAttemptId(newAttemptId);

      // Get conversation token
      console.log('🔐 Fetching conversation token for interview type:', currentInterviewType);
      const tokenResponse = await getConversationToken.mutateAsync({
        interviewId: id,
        interviewType: currentInterviewType
      });
      
      console.log('✅ Received conversation token and agent metadata');
      setAgentMetadata(tokenResponse.data.agent_metadata);
      
      // Start ElevenLabs session
      console.log('📝 Starting ElevenLabs session with attemptId:', newAttemptId);
      console.log('📝 Using private agent:', tokenResponse.data.agent_metadata.name);
      
      // For private agents with WebRTC, use conversationToken parameter
      const sessionResult = await conversation.startSession({
        conversationToken: tokenResponse.data.conversation_token,
        dynamicVariables: {
            user_id: newAttemptId,
            candidate_name: user?.name || 'Candidate',
            job_title: String(params.role || ''),
            company: String(params.companyName || ''),
            interview_outline: 'Outline of the interview',
        }
      });
      
      console.log('✅ ElevenLabs session started successfully');
      console.log('📝 Session result (conversationId):', sessionResult);
      
      // sessionResult IS the conversationId according to docs
      if (sessionResult) {
        console.log('📝 Got conversationId from startSession:', sessionResult);
        setConversationId(sessionResult);
      }
      
    } catch (error: any) {
      console.error('❌ Failed to start interview:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to start interview. ';
      
      // Check error reason from WebSocket close event
      const errorReason = error?.reason || error?.message || '';
      
      if (errorReason.includes('does not exist')) {
        errorMessage += 'The interview agent is not available.';
      } else if (errorReason.includes('microphone') || errorReason.includes('permission')) {
        errorMessage += 'Microphone access is required.';
      } else if (errorReason.includes('token')) {
        errorMessage += 'Invalid conversation token.';
      } else {
        errorMessage += 'Please try again later.';
      }
      
      alert(errorMessage);
      
      // Navigate back to details page
      router.push(`/interviews/${id}/details`);
    }
  }, [id, user, interviewData, cvProfile, currentInterviewType, startAttempt, getConversationToken, conversation]);

  const declineCall = useCallback(() => {
    console.log('📞 Declining call');
    setCallState('ended');
    router.back();
  }, [router]);

  const endInterview = useCallback(async () => {
    try {
      await conversation.endSession();
      console.log('📞 Interview ended');
      setCallState('ended');
      
      // Navigate to grading screen
      if (attemptId && id) {
        router.push(`/interviews/${id}/attempts/${attemptId}/grading?from_interview=true`);
        
        // Finish attempt in background
        try {
          await finishAttempt.mutateAsync({
            interviewId: id,
            attemptId: attemptId,
            durationSeconds: duration,
            conversationId: conversationId || undefined
          });
        } catch (e) {
          console.log('Error finishing attempt:', e);
        }
      }
    } catch (error) {
      console.error('❌ Error ending interview:', error);
      setCallState('ended');
    }
  }, [conversation, attemptId, id, duration, conversationId, finishAttempt, router]);

  // Duration timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (callState === 'active') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [callState]);

  // Prefetch agent metadata
  useEffect(() => {
    if (id && currentInterviewType && callState === 'incoming') {
      getConversationToken.mutate({
        interviewId: id,
        interviewType: currentInterviewType
      }, {
        onSuccess: (data) => {
          setAgentMetadata(data.data.agent_metadata);
        },
        onError: (error) => {
          console.error('Failed to prefetch agent metadata:', error);
        }
      });
    }
  }, [id, currentInterviewType, callState]);

  if (!interviewData) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/50 to-blue-900/50 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900/50 to-blue-900/50 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        
        {/* Incoming Call State */}
        {callState === 'incoming' && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              {/* Caller Name */}
              <div className="text-center mb-10">
                <h1 className="font-nunito font-light text-4xl md:text-5xl text-white mb-4">
                  {interviewer.name}
                </h1>
              </div>

              {/* Avatar */}
              <div className="mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 bg-white/10">
                  <img 
                    src={interviewer.avatar}
                    alt={interviewer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Call Status */}
              <p className="text-white/70 text-lg mb-6">calling...</p>
              
              {/* Call Info */}
              <p className="text-white/70 text-center mb-8">
                {interviewData.company} • {interviewData.role_title}
              </p>

              {/* Instructions */}
              <div className="w-full max-w-md">
                {currentInterviewType === InterviewType.MockSalesCall ? (
                  <div className="glass rounded-2xl p-6 border border-yellow-500/30 bg-yellow-500/10 mb-8">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <h3 className="font-nunito font-semibold text-lg text-white">Sales Call Simulation</h3>
                    </div>
                    <p className="text-yellow-300 font-medium text-center mb-4">You are the salesperson, they are the prospect</p>
                    <div className="space-y-2 text-sm text-white/80">
                      <p>• Lead the conversation and ask discovery questions</p>
                      <p>• Uncover their pain points and business needs</p>
                      <p>• Handle objections professionally</p>
                      <p>• Close for a specific next step</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <h3 className="font-nunito font-semibold text-white">Interview Tips</h3>
                    </div>
                    <p className="text-white/70 text-sm">Speak clearly • Use examples • Be confident</p>
                  </div>
                )}
              </div>
            </div>

            {/* Answer/Decline Buttons */}
            <div className="pb-12 px-6">
              <div className="flex items-center justify-center gap-20">
                <button
                  onClick={declineCall}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors transform rotate-[135deg]"
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                
                <button
                  onClick={acceptCall}
                  disabled={startAttempt.isPending}
                  className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg disabled:opacity-50"
                >
                  {startAttempt.isPending ? (
                    <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Connecting State */}
        {callState === 'connecting' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="text-center mb-10">
              <h1 className="font-nunito font-light text-4xl md:text-5xl text-white mb-4">
                {interviewer.name}
              </h1>
            </div>

            <div className="mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 bg-white/10">
                <img 
                  src={interviewer.avatar}
                  alt={interviewer.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <p className="text-white/70 text-lg mb-6">connecting...</p>
            
            <p className="text-white/70 text-center">
              {interviewData.company} • {interviewData.role_title}
            </p>
          </div>
        )}

        {/* Active Call State */}
        {callState === 'active' && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              {/* Duration */}
              <div className="mb-10">
                <p className="text-brand-primary text-lg font-nunito font-semibold text-center">
                  {formatDuration(duration)}
                </p>
              </div>

              {/* Large Avatar */}
              <div className="mb-6">
                <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-brand-primary/30 bg-white/10 shadow-2xl">
                  <img 
                    src={interviewer.avatar}
                    alt={interviewer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Interviewer Info */}
              <h2 className="font-nunito font-light text-3xl text-white mb-2 text-center">
                {interviewer.name}
              </h2>
              <p className="text-white/70 mb-6 text-center">{interviewer.role}</p>

              {/* Recording Indicator */}
              <div className="flex items-center gap-2 glass border border-red-500/30 rounded-full px-4 py-2 bg-red-500/10">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm font-medium">Recording</span>
              </div>
            </div>

            {/* End Call Button */}
            <div className="pb-12 px-6">
              <div className="flex flex-col items-center">
                <button
                  onClick={endInterview}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg mb-4"
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <p className="text-white/60 text-sm">Tap the red button to end the interview</p>
              </div>
            </div>
          </>
        )}

        {/* Ended State */}
        {callState === 'ended' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="text-center">
              <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="font-nunito font-bold text-2xl text-white mb-2">Interview Complete</h2>
              <p className="text-white/70 text-center mb-8">
                Thank you for completing your interview with {interviewer.name}
              </p>
              
              <button
                onClick={() => router.back()}
                className="glass-purple font-nunito font-medium px-6 py-3 rounded-lg hover:bg-brand-primary/20 transition-colors"
              >
                Back to Interview Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}