'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useStartAttempt, useFinishAttempt, useGetConversationToken } from '@/hooks/use-interviews';

// Dynamic import to avoid SSR issues with ElevenLabs
const ElevenLabsConversation = dynamic(
  () => import('@/components/ElevenLabsConversation'),
  { ssr: false }
);

export default function InterviewSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const interviewId = params?.id as string;
  const interviewType = searchParams?.get('type') || 'GeneralInterview';
  
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [transcript, setTranscript] = useState<Array<{role: string; message: string; timestamp: number}>>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  
  const startAttemptMutation = useStartAttempt();
  const finishAttemptMutation = useFinishAttempt();
  const getTokenMutation = useGetConversationToken();

  useEffect(() => {
    if (interviewId) {
      initializeInterview();
    }
  }, [interviewId]);

  const initializeInterview = async () => {
    try {
      // Start the interview attempt
      const attemptResponse = await startAttemptMutation.mutateAsync(interviewId);
      setAttemptId(attemptResponse.data.attempt_id);
      
      // Get conversation token from ElevenLabs
      const tokenResponse = await getTokenMutation.mutateAsync({
        interviewId,
        interviewType
      });
      
      setAgentId(tokenResponse.data.conversation_token);
      setConversationId(tokenResponse.data.conversation_token);
    } catch (error) {
      console.error('Failed to initialize interview:', error);
      // Fallback to demo mode
      setAgentId('demo-agent');
      setTimeout(() => {
        setIsConnected(true);
        setIsSessionActive(true);
      }, 1000);
    }
  };

  const addMessage = (role: 'user' | 'agent', message: string) => {
    const newMessage = {
      role,
      message,
      timestamp: Date.now()
    };
    setTranscript(prev => [...prev, newMessage]);
  };

  const endInterview = async () => {
    setIsSessionActive(false);
    
    if (attemptId) {
      try {
        await finishAttemptMutation.mutateAsync({ interviewId, attemptId });
      } catch (error) {
        console.error('Failed to finish attempt:', error);
      }
    }
    
    // Navigate to results
    router.push(`/interviews/${interviewId}/results`);
  };
  
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setIsSessionActive(true);
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setIsSessionActive(false);
  }, []);

  const handleMessage = useCallback((message: any) => {
    // Handle messages from ElevenLabs
    if (message.type === 'transcript') {
      addMessage(message.role === 'user' ? 'user' : 'agent', message.text);
    }
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('ElevenLabs error:', error);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-nunito font-semibold text-xl">Interview Session</h1>
            <p className="text-white/70 text-sm">{interviewType.replace(/([A-Z])/g, ' $1').trim()}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${isConnected ? 'text-success' : 'text-warning'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-warning'} animate-pulse`}></div>
              <span className="text-sm">{isConnected ? 'Connected' : 'Connecting...'}</span>
            </div>
            
            {isSessionActive && (
              <button
                onClick={endInterview}
                className="glass-subtle font-nunito font-medium px-4 py-2 rounded-lg hover:bg-error/20 text-error transition-colors"
              >
                End Interview
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Transcript Area */}
          <div className="flex-1 glass rounded-2xl p-6 mb-6 overflow-hidden">
            <div className="h-full overflow-y-auto space-y-4">
              {transcript.length === 0 ? (
                <div className="text-center text-white/70 py-12">
                  <div className="text-4xl mb-4">🎤</div>
                  <p>Waiting for interview to begin...</p>
                </div>
              ) : (
                transcript.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-xl ${
                        message.role === 'user'
                          ? 'glass-purple text-right'
                          : 'glass-subtle text-left'
                      }`}
                    >
                      <div className="font-nunito font-medium text-sm mb-1">
                        {message.role === 'user' ? 'You' : 'AI Interviewer'}
                      </div>
                      <p className="text-white/90">{message.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Voice Controls */}
          <div className="glass rounded-2xl p-6">
            {agentId ? (
              <ElevenLabsConversation
                agentId={agentId}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onMessage={handleMessage}
                onError={handleError}
              >
                {(conversation: any) => (
                  <div className="flex items-center justify-center gap-6">
                    {!isSessionActive ? (
                      <div className="text-center">
                        <p className="text-white/70 mb-4">Preparing your interview session...</p>
                        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        <button
                          onMouseDown={() => conversation.startRecording()}
                          onMouseUp={() => conversation.stopRecording()}
                          className="w-16 h-16 glass-purple rounded-full flex items-center justify-center hover:bg-brand-primary/20 transition-colors"
                        >
                          <span className="text-2xl">🎤</span>
                        </button>
                        <div className="text-center">
                          <p className="font-nunito font-medium">Click to speak</p>
                          <p className="text-white/70 text-sm">Press and hold to record your response</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </ElevenLabsConversation>
            ) : (
              <div className="text-center">
                <p className="text-white/70 mb-4">Initializing interview session...</p>
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}