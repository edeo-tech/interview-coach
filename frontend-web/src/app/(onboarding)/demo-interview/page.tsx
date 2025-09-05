'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useConversation } from '@elevenlabs/react';
import { useGetConversationToken, type ConversationTokenResponse } from '@/hooks/use-conversation-token';
import { useCheckAuth } from '@/hooks/use-auth';

type CallState = 'incoming' | 'connecting' | 'active' | 'ended';

export default function DemoInterview() {
  const router = useRouter();
  const { data: user } = useCheckAuth();
  const [callState, setCallState] = useState<CallState>('incoming');
  const [duration, setDuration] = useState(0);
  const [agentMetadata, setAgentMetadata] = useState<{ name: string; profile_picture: string } | null>(null);
  const [hasStartedCall, setHasStartedCall] = useState(false);
  
  const getConversationToken = useGetConversationToken();

  // ElevenLabs conversation configuration
  const conversationConfig = useMemo(() => ({
    onConnect: () => {
      console.log('🎤 Connected to ElevenLabs demo session');
      setCallState('active');
    },
    onDisconnect: () => {
      console.log('🎤 Disconnected from ElevenLabs demo session');
      handleCallEnded();
    },
    onMessage: (evt: any) => {
      // Handle any message events if needed
      console.log('📝 Demo message:', evt);
    },
    onError: (error: any) => {
      console.error('❌ ElevenLabs demo error:', error);
      handleCallEnded();
    }
  }), []);

  const conversation = useConversation(conversationConfig);

  // Prefetch agent metadata on component mount
  useEffect(() => {
    const demoInterviewId = 'demo_onboarding_interview';
    
    getConversationToken.mutate({
      interviewId: demoInterviewId,
      interviewType: 'general_interview'
    }, {
      onSuccess: (response) => {
        setAgentMetadata(response.data.agent_metadata);
      },
      onError: (error) => {
        console.error('Failed to prefetch agent metadata:', error);
        // Set fallback data
        setAgentMetadata({
          name: 'Niamh Morrissey',
          profile_picture: 'https://res.cloudinary.com/dphekriyz/image/upload/v1756980335/new_niamh_rvj9fn.png'
        });
      }
    });
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'active') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCallEnded = useCallback(async () => {
    if (callState !== 'ended') {
      try {
        await conversation.endSession();
        console.log('📞 Demo interview ended');
      } catch (error) {
        console.error('❌ Error ending demo session:', error);
      }
      
      setCallState('ended');
      // Navigate directly to paywall
      router.push('/paywall?source=onboarding');
    }
  }, [callState, router, conversation]);

  const handleAnswerCall = async () => {
    if (hasStartedCall) return;
    
    setHasStartedCall(true);
    setCallState('connecting');

    try {
      const demoInterviewId = 'demo_onboarding_interview';
      
      console.log('🔐 Fetching conversation token for demo interview');
      const response = await getConversationToken.mutateAsync({
        interviewId: demoInterviewId,
        interviewType: 'general_interview'
      });

      // Set agent metadata if not already set
      if (!agentMetadata) {
        setAgentMetadata(response.data.agent_metadata);
      }

      console.log('✅ Received demo conversation token and agent metadata');
      console.log('📝 Starting ElevenLabs demo session with agent:', response.data.agent_metadata.name);
      
      // Start ElevenLabs session with conversation token
      const sessionResult = await conversation.startSession({
        conversationToken: response.data.conversation_token,
        dynamicVariables: {
          user_id: user?.id || 'demo_user',
          candidate_name: user?.name || 'Candidate',
          job_title: `${user?.industry ? user.industry + ' ' : ''}Consultant`,
          company: 'Demo Company',
          cv_data: '',
          job_description: `${user?.industry || 'General'} consulting interview practice session`,
        }
      });
      
      console.log('✅ ElevenLabs demo session started successfully');
      
    } catch (error: any) {
      console.error('❌ Failed to start demo session:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to start demo interview. ';
      const errorReason = error?.reason || error?.message || '';
      
      if (errorReason.includes('microphone') || errorReason.includes('permission')) {
        errorMessage += 'Microphone access is required.';
      } else if (errorReason.includes('token')) {
        errorMessage += 'Invalid conversation token.';
      } else {
        errorMessage += 'Please try again later.';
      }
      
      alert(errorMessage);
      
      setCallState('incoming');
      setHasStartedCall(false);
    }
  };

  const handleDeclineCall = useCallback(() => {
    router.push('/paywall?source=onboarding');
  }, [router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // End call handler for the red button
  const endCall = useCallback(async () => {
    await handleCallEnded();
  }, [handleCallEnded]);

  const interviewer = {
    name: agentMetadata?.name || 'Niamh Morrissey',
    avatar: agentMetadata?.profile_picture || 'https://res.cloudinary.com/dphekriyz/image/upload/v1756980335/new_niamh_rvj9fn.png',
    role: 'Senior Interviewer'
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900/50 to-blue-900/50 backdrop-blur-sm">
      {/* Progress indicator - only show during incoming state */}
      {callState === 'incoming' && (
        <div className="absolute top-4 left-0 right-0 p-4 z-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <button onClick={handleBack} className="text-gray-400 hover:text-white">
                ← Back
              </button>
              <span className="text-gray-400 text-sm">Step 6 of 7</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-brand-primary h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      )}

      <div className="h-full flex flex-col">
        {/* Loading state while fetching agent data */}
        {(getConversationToken.isPending && !agentMetadata) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/70">Preparing your demo...</p>
            </div>
          </div>
        )}

        {/* Incoming call */}
        {callState === 'incoming' && agentMetadata && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              {/* Caller Name */}
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-light text-white mb-4">
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
                Interview Coach • {user?.industry ? `${user.industry} ` : ''}Consultant Role
              </p>

              {/* Instructions */}
              <div className="w-full max-w-md">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-white font-semibold">Interview Tips</h3>
                  </div>
                  <p className="text-white/70 text-sm">Speak clearly • Use examples • Be confident</p>
                </div>
              </div>
            </div>

            {/* Answer/Decline Buttons */}
            <div className="pb-12 px-6">
              <div className="flex items-center justify-center gap-20">
                <button
                  onClick={handleDeclineCall}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors transform rotate-[135deg]"
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                
                <button
                  onClick={handleAnswerCall}
                  disabled={getConversationToken.isPending || hasStartedCall}
                  className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg disabled:opacity-50"
                >
                  {(getConversationToken.isPending || hasStartedCall) ? (
                    <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="text-center mt-6">
                <button
                  onClick={handleDeclineCall}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Can't talk right now
                </button>
              </div>
            </div>
          </>
        )}

        {/* Connecting state */}
        {callState === 'connecting' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-light text-white mb-4">{interviewer.name}</h1>
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
              Interview Coach • {user?.industry ? `${user.industry} ` : ''}Consultant Role
            </p>
          </div>
        )}

        {/* Active call */}
        {callState === 'active' && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              {/* Duration */}
              <div className="mb-10">
                <p className="text-brand-primary text-lg font-semibold text-center">
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
              <h2 className="text-3xl font-light text-white mb-2 text-center">
                {interviewer.name}
              </h2>
              <p className="text-white/70 mb-6 text-center">{interviewer.role}</p>

              {/* Recording Indicator */}
              <div className="flex items-center gap-2 border border-red-500/30 rounded-full px-4 py-2 bg-red-500/10">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm font-medium">Recording</span>
              </div>
            </div>

            {/* End Call Button */}
            <div className="pb-12 px-6">
              <div className="flex flex-col items-center">
                <button
                  onClick={endCall}
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
      </div>

    </div>
  );
}