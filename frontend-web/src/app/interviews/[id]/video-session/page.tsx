'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useCheckAuth } from '@/hooks/use-auth';
import { useCV } from '@/hooks/use-cv';
import { useInterview, useStartAttempt, useFinishAttempt } from '@/hooks/use-interviews';
import { useGetAnamSessionToken } from '@/hooks/use-anam';
import { createClient } from '@anam-ai/js-sdk';

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function VideoInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [callState, setCallState] = useState<'incoming' | 'connecting' | 'active' | 'ended'>('incoming');
  const [duration, setDuration] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [anamClient, setAnamClient] = useState<any>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false); // Audio starts muted

  // Data hooks
  const { data: user } = useCheckAuth();
  const { data: cvProfile } = useCV();
  const { data: interviewData } = useInterview(id);
  const startAttempt = useStartAttempt();
  const finishAttempt = useFinishAttempt();
  const getAnamSessionToken = useGetAnamSessionToken();

  const acceptCall = useCallback(async () => {
    console.log('📞 Accepting video call');
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

      // Get Anam session token
      console.log('🔐 Fetching Anam session token');
      const tokenResponse = await getAnamSessionToken.mutateAsync(id);
      const sessionToken = tokenResponse.data.sessionToken;
      
      console.log('✅ Received Anam session token');
      console.log(sessionToken);
      
      // Initialize Anam client
      const client = createClient(sessionToken);
      setAnamClient(client);
      
      console.log('✅ Anam client initialized, transitioning to active state');
      
      // Set to active state first so video element is rendered
      setCallState('active');
      
      // Small delay to ensure video element is rendered in DOM
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Start streaming to video element
      console.log('Starting Anam streaming...');
      
      try {
        // Check if video element exists
        const videoElement = document.getElementById('anam-video');
        if (!videoElement) {
          throw new Error('Video element not found in DOM');
        }
        console.log('Video element found:', videoElement);
        console.log('Video element tagName:', videoElement.tagName);
        console.log('Video element attributes:', Array.from(videoElement.attributes).map(a => `${a.name}="${a.value}"`));
        
        console.log('About to call client.streamToVideoElement...');
        const streamResult = await client.streamToVideoElement('anam-video');
        console.log('✅ Anam streaming result:', streamResult);
        console.log('✅ Anam streaming started successfully');
        
        // Debug: log available methods on the client
        console.log('Available methods on Anam client:', Object.getOwnPropertyNames(client));
        console.log('Available methods on Anam client prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
      } catch (streamError) {
        console.error('❌ Streaming error caught:', streamError);
        console.error('Streaming error type:', typeof streamError);
        throw streamError;
      }
      
    } catch (error: any) {
      console.error('❌ Failed to start video interview:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Error name:', error?.name);
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Show user-friendly error message
      let errorMessage = 'Failed to start video interview. ';
      
      if (error?.message?.includes('microphone') || error?.message?.includes('permission')) {
        errorMessage += 'Camera and microphone access is required.';
      } else if (error?.message?.includes('token')) {
        errorMessage += 'Invalid session token.';
      } else if (error?.message?.includes('video element')) {
        errorMessage += 'Video element not ready.';
      } else {
        errorMessage += `Error: ${error?.message || 'Unknown error'}`;
      }
      
      alert(errorMessage);
      
      // Reset state instead of navigating away immediately
      setCallState('incoming');
      setAnamClient(null);
    }
  }, [id, user, interviewData, cvProfile, startAttempt, getAnamSessionToken]);

  const declineCall = useCallback(() => {
    console.log('📞 Declining video call');
    setCallState('ended');
    router.back();
  }, [router]);

  const endInterview = useCallback(async () => {
    try {
      // Stop Anam streaming
      if (anamClient) {
        await anamClient.stopStreaming();
      }
      
      console.log('📞 Video interview ended');
      setCallState('ended');
      
      // Navigate to grading screen
      if (attemptId && id) {
        router.push(`/interviews/${id}/attempts/${attemptId}/grading?from_interview=true`);
        
        // Finish attempt in background
        try {
          await finishAttempt.mutateAsync({
            interviewId: id,
            attemptId: attemptId,
            durationSeconds: duration
          });
        } catch (e) {
          console.log('Error finishing attempt:', e);
        }
      }
    } catch (error) {
      console.error('❌ Error ending video interview:', error);
      setCallState('ended');
    }
  }, [anamClient, attemptId, id, duration, finishAttempt, router]);

  const toggleAudio = useCallback(async () => {
    if (anamClient && callState === 'active') {
      try {
        console.log('Current audio state:', isAudioEnabled);
        console.log('Available methods on anamClient:', Object.getOwnPropertyNames(anamClient));
        console.log('Available methods on anamClient prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(anamClient)));
        
        // Try different possible method names
        if (typeof anamClient.setMuted === 'function') {
          console.log('Using setMuted method');
          await anamClient.setMuted(isAudioEnabled);
        } else if (typeof anamClient.mute === 'function') {
          console.log('Using mute method');
          if (isAudioEnabled) {
            await anamClient.mute();
          } else {
            await anamClient.unmute();
          }
        } else if (typeof anamClient.unmute === 'function') {
          console.log('Using unmute method');
          await anamClient.unmute();
        } else {
          // Fallback: try to control the video element directly
          console.log('No audio control methods found, trying to control video element directly');
          const videoElement = document.getElementById('anam-video') as HTMLVideoElement;
          if (videoElement) {
            videoElement.muted = isAudioEnabled; // Toggle mute on the video element
            console.log('Set video element muted to:', isAudioEnabled);
          } else {
            throw new Error('No audio control methods available and video element not found');
          }
        }
        
        setIsAudioEnabled(!isAudioEnabled);
        console.log('Audio toggled successfully, new state:', !isAudioEnabled);
      } catch (error) {
        console.error('Error toggling audio:', error);
        console.error('Error details:', error);
      }
    } else {
      console.log('Cannot toggle audio - client or state issue:', { anamClient: !!anamClient, callState });
    }
  }, [anamClient, callState, isAudioEnabled]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (anamClient) {
        anamClient.stopStreaming().catch(() => {});
      }
    };
  }, [anamClient]);

  if (!interviewData) {
    return (
      <AuthenticatedLayout>
        <div className="fixed inset-0 bg-gradient-to-b from-purple-900/50 to-blue-900/50 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">Loading interview...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/50 to-blue-900/50 backdrop-blur-sm">
        <div className="h-full flex flex-col">
          
          {/* Incoming Call State */}
          {callState === 'incoming' && (
            <>
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                {/* Caller Name */}
                <div className="text-center mb-10">
                  <h1 className="font-nunito font-light text-4xl md:text-5xl text-white mb-4">
                    Cara
                  </h1>
                  <p className="text-white/70 text-lg">AI Interview Assistant</p>
                </div>

                {/* Avatar Placeholder */}
                <div className="mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>

                {/* Call Status */}
                <p className="text-white/70 text-lg mb-6">video calling...</p>
                
                {/* Call Info */}
                <p className="text-white/70 text-center mb-8">
                  {interviewData.company} • {interviewData.role_title}
                </p>

                {/* Instructions */}
                <div className="w-full max-w-md">
                  <div className="glass rounded-2xl p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <h3 className="font-nunito font-semibold text-white">Video Interview</h3>
                    </div>
                    <p className="text-white/70 text-sm">Face-to-face interview with AI avatar • Camera & mic required</p>
                  </div>
                </div>
              </div>

              {/* Answer/Decline Buttons */}
              <div className="pb-12 px-6">
                <div className="flex items-center justify-center gap-20">
                  <button
                    onClick={declineCall}
                    className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
                  Cara
                </h1>
                <p className="text-white/70 text-lg">AI Interview Assistant</p>
              </div>

              <div className="mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 animate-pulse flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              <p className="text-white/70 text-lg mb-6">connecting video...</p>
              
              <p className="text-white/70 text-center">
                {interviewData.company} • {interviewData.role_title}
              </p>
            </div>
          )}

          {/* Active Call State */}
          {callState === 'active' && (
            <>
              <div className="flex-1 relative">
                {/* Duration */}
                <div className="absolute top-6 left-6 z-10">
                  <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-nunito font-semibold">
                      {formatDuration(duration)}
                    </span>
                  </div>
                </div>

                {/* Video Container */}
                <div className="h-full w-full flex items-center justify-center p-6">
                  <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                    <video 
                      id="anam-video" 
                      autoPlay 
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="text-white">
                          <h3 className="font-nunito font-semibold text-lg">Cara</h3>
                          <p className="text-white/70 text-sm">AI Interview Assistant</p>
                        </div>
                        
                        {/* Audio Toggle */}
                        <button
                          onClick={toggleAudio}
                          className={`p-3 rounded-full transition-colors ${
                            isAudioEnabled ? 'bg-green-500/80 hover:bg-green-600/80' : 'bg-red-500/80 hover:bg-red-600/80'
                          }`}
                          title={isAudioEnabled ? 'Mute audio' : 'Unmute audio'}
                        >
                          {isAudioEnabled ? (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enable Audio Notice */}
                {!isAudioEnabled && (
                  <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                    <div className="glass rounded-full px-4 py-2 bg-yellow-500/20 border border-yellow-500/30">
                      <p className="text-yellow-300 text-sm">Click the microphone button to enable audio</p>
                    </div>
                  </div>
                )}
              </div>

              {/* End Call Button */}
              <div className="pb-12 px-6">
                <div className="flex flex-col items-center">
                  <button
                    onClick={endInterview}
                    className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg mb-4"
                  >
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <p className="text-white/60 text-sm">End video interview</p>
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
                <h2 className="font-nunito font-bold text-2xl text-white mb-2">Video Interview Complete</h2>
                <p className="text-white/70 text-center mb-8">
                  Thank you for completing your video interview with Cara
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
    </AuthenticatedLayout>
  );
}